<script setup>
import {ref, reactive, onMounted} from "vue";
import _ from 'lodash';
import { useRoute } from 'vue-router';
import router from "../router/index.js";

const route = useRoute()
const otherList = route.query;
const imageList = reactive([]);
const previewList = ref([]);
let saveUrl = ref("");

let isShowModal = ref(false);

for (let i = 1; i < 35; i++) {
    imageList.push({
        id: i,
        src: `../assets/${i}.png`,
        quantity: 0
    });
}
// 有存
if (otherList.collection) {
    saveUrl.value = otherList.collection;
    let splitList = _.split(otherList.collection, ";");

    _.forEach(splitList, function(i) {
        let splitObj = _.split(i, "-");
        let findIndex = imageList.findIndex(x => x.id === Number(splitObj[0]));
        if (0 <= findIndex) {
            imageList[findIndex].quantity = Number(splitObj[1]);
            _.times(Number(splitObj[1]), () => {
                previewList.value.push(_.cloneDeep(imageList[findIndex]));
            });
        }
    });
}


onMounted(() => {
    let d = document.body;
    d.classList.remove('fixedBack');
})

function addImage(item) {
    item.quantity++;
    previewList.value.push(item);
    previewList.value.sort(function (a, b) {
        return a.id - b.id;
    });

    updateRouer();
}

function removeImage(item, index) {
    let findIndex = imageList.findIndex(x => x.id === item.id);
    if (0 <= findIndex) {
        imageList[findIndex].quantity--;
    }
    previewList.value.splice(index, 1);

    updateRouer();
}

function clearPreview() {
    previewList.value = [];
    imageList.forEach(function (i) {
        i.quantity = 0;
    });
    updateRouer();
}

function toCollectionPage() {
    if (!previewList.value.length) {
         isShowModal.value = true;
    } else {
        comfirmChangePage();
    }
}
function getImageUrl(name) {
    return new URL(`../assets/${name}`, import.meta.url).href
}

function updateRouer() {
    if (previewList.value.length) {
        let stringList = _.map(previewList.value, function (i) {
            return i.id;
        });

        let group = _.groupBy(stringList, x => x);
        let ids = _.map(group, function (i) {
            return `${i[0]}-${i.length}`;
        });

        saveUrl.value = ids.join(';');
    } else {
        saveUrl.value = "";
    }
    router.push({ ...route, query: { ...route.query, collection: saveUrl.value, exchange: "0", wish: "0" } });
}

function comfirmChangePage() {
    console.log(saveUrl.value);
    if (saveUrl.value) {
        router.push(`/collections/${saveUrl.value}/0/0`)
    } else {
        router.push(`/collections/${saveUrl.value}/0/0`)
    }
}
</script>

<template>
    <h1 class="label label-topSpace">選擇擁有的色紙</h1>
    <p class="subLabel">
        ＊ 點擊圖片選取 <br>
        ＊ 可以多選 <br>
        ＊ 編輯完後將網址存成書籤可以保留此次編輯
    </p>
    <div class="img-list">
        <button type="button"
                class="img-list-button"
                :class="{'img-list-button-active':0 < item.quantity}"
                @click="addImage(item)"
                :key="`all_${index}`"
                v-for="(item, index) in imageList">
            <img :src="getImageUrl(`${item.id}.png`)" class="lazyload" :alt="item.id"/>
            <p class="text">No.{{ item.id }}
                <template v-if="0 < item.quantity"> * {{ item.quantity }}</template>
            </p>
        </button>
    </div>
    <div class="alighBetween label-topSpace">
        <h1 class="label">我擁有 {{ previewList.length }} 張色紙</h1>
        <button type="button" class="clearButton" @click="clearPreview">全部清除</button>
    </div>
    <p class="subLabel" v-if="previewList.length">
        ＊ 點擊圖片移除
    </p>
    <div class="remarkText" v-if="!previewList.length">
        請選擇上方可可愛愛的色紙<br>
        <a href="https://lycoris-recoil.com/lycorecoten/goods/">官網逛起來</a>
    </div>
    <div class="img-list" v-if="previewList.length">
        <button type="button"
                class="img-list-button-selected"
                @click="removeImage(item, index)"
                :key="`selected_${index}`"
                v-for="(item, index) in previewList">
            <img :src="getImageUrl(`${item.id}.png`)" :alt="item.id"/>
            <p class="text">No.{{ item.id }}</p>
        </button>
    </div>
    <div class="alighCenter createBookWrapper label-topSpace">
        <button type="button" @click="toCollectionPage" class="createBookButton">產生收藏頁</button>
    </div>
    <Modal
        v-model="isShowModal"
        title="提醒"
        @on-ok="isShowModal = false"
        @on-cancel="isShowModal = false">
        <p class="modal-remind-text">＊ 請選擇至少一張色紙</p>
    </Modal>
</template>

<style scoped>

</style>
