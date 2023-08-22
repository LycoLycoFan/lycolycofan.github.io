<script setup>
import {ref, reactive, computed, onMounted, watch} from "vue";
import _ from "lodash";

import {useRoute} from "vue-router";
import router from "../router/index.js";

const route = useRoute();
const routeList = route.params.list;
const routeExchangeList = route.params.exchange;
const routeWishList = route.params.wish;
const allImages = reactive([]);
const collectionBooks = ref([]);
let saveUrl = ref("");

for (let i = 1; i < 35; i++) {
    allImages.push({
        id: i,
        src: `../src/assets/${i}.png`,
        quantity: 0,
        isOwned: false,
    });
}

const ownList = ref([]);
const exchangeList = ref([]);
const wishList = ref([]);
const isShowWishSelectModal = ref(false);
collectionBooks.value = _.cloneDeep(allImages);

onMounted(() => {
    let d = document.body;
    d.classList.remove("fixedBack");
    window.scrollTo(0, 0);

    initialList();
    checkUrlCache();
});

function initialList() {
    ownList.value = [];
    if (routeList) {
        saveUrl = routeList;

        let splitList = [];
        splitList = _.split(routeList, ";");
        _.forEach(splitList, function (i) {
            let splitObj = _.split(i, "-");
            ownList.value.push({
                id: Number(splitObj[0]),
                src: `../src/assets/${Number(splitObj[0])}.png`,
                quantity: Number(splitObj[1]),
            });
        });

        _.forEach(allImages, function (i) {
            let findExistIndex = ownList.value.findIndex((x) => x.id === i.id);
            if (0 <= findExistIndex) {
                i.isOwned = true;
            }
        });
    }
}

function checkUrlCache() {
    // 有交換
    if (routeExchangeList && routeExchangeList !== "0") {
        let splitList = _.split(routeExchangeList, ";");
        _.forEach(splitList, function (i) {
            let splitObj = _.split(i, "-");
            let findIndex = ownList.value.findIndex((x) => x.id === Number(splitObj[0]));
            if (0 <= findIndex) {
                ownList.value[findIndex].quantity =
                    ownList.value[findIndex].quantity - Number(splitObj[1]);
                _.times(Number(splitObj[1]), () => {
                    exchangeList.value.push(_.cloneDeep(ownList.value[findIndex]));
                });
            }
        });
    }

    // 有願望
    if (routeWishList && routeWishList !== "0") {
        let splitList = _.split(routeWishList, ";");
        _.forEach(splitList, function (i) {
            let splitObj = _.split(i, "-");
            let findIndex = allImages.findIndex((x) => x.id === Number(splitObj[0]));
            if (0 <= findIndex) {
                allImages[findIndex].quantity = Number(splitObj[1]);
                _.times(Number(splitObj[1]), () => {
                    wishList.value.push(_.cloneDeep(allImages[findIndex]));
                });
            }
        });
    }
}

function addToExChange(item, index) {
    if (item.quantity !== 0) {
        item.quantity--;
        let obj = Object.assign({}, item);
        obj.quantity = 1;
        exchangeList.value.push(obj);
        exchangeList.value.sort(function (a, b) {
            return a.id - b.id;
        });
    }

    updateRouter();
}

function removeExChangeImage(item, index) {
    let findExistIndex = ownList.value.findIndex((x) => x.id === item.id);

    if (0 <= findExistIndex) {
        ownList.value[findExistIndex].quantity++;
    } else {
        ownList.value.push(item);
    }

    exchangeList.value.splice(index, 1);
    ownList.value.sort(function (a, b) {
        return a.id - b.id;
    });
    updateRouter();
}

function clearExChange() {
    exchangeList.value = [];
    updateRouter();
    initialList();
}

function clearWishList() {
    wishList.value = [];
    updateRouter();
    initialList();
}

function addToWishImage(item) {
    item.quantity++;
    wishList.value.push(item);
    wishList.value.sort(function (a, b) {
        return a.id - b.id;
    });

    updateRouter();
}

function removeWishImage(item, index) {
    let findIndex = allImages.findIndex((x) => x.id === item.id);
    if (0 <= findIndex) {
        allImages[findIndex].quantity--;
    }
    wishList.value.splice(index, 1);
    updateRouter();
}

function showWishSelectModal() {
    let d = document.body;
    d.classList.add("fixedBack");
    isShowWishSelectModal.value = true;
}

function closeWishSelectModal() {
    let d = document.body;
    d.classList.remove("fixedBack");
    isShowWishSelectModal.value = false;
}

function backHome() {
    router.push(`/?collection=${saveUrl}`);
}

async function createImage() {
}

function getImageUrl(name) {
    return new URL(`../assets/${name}`, import.meta.url).href;
}

function updateRouter() {
    let exchangeUrl = "";
    let wishUrl = "";
    // 檢查要交換的
    if (exchangeList.value.length) {
        exchangeUrl = getUrlIds(exchangeList.value);
    } else {
        exchangeUrl = "0";
    }

    if (wishList.value.length) {
        wishUrl = getUrlIds(wishList.value);
    } else {
        wishUrl = "0";
    }

    router.push({ ...route, params: { ...route.params, exchange: exchangeUrl, wish: wishUrl } });
}

watch(() => route.params, () => {

});

function getUrlIds (array) {
    let stringList = _.map(array, function (i) {
        return i.id;
    });

    let group = _.groupBy(stringList, (x) => x);
    let ids = _.map(group, function (i) {
        return `${i[0]}-${i.length}`;
    });

    return `${ids.join(";")}`;
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}

const ownQuantity = computed(() => {
    return _.sumBy(ownList.value, "quantity");
});

const wantQuantity = computed(() => {
    let l = _.filter(collectionBooks.value, function (i) {
        return !i.isOwned;
    });
    return l.length;
});
</script>

<template>
    <div class="backHomeButtonWrapper">
        <button type="button" class="backHomeButton" @click="backHome">
            返回首頁重新選擇
        </button>
    </div>
    <Tabs value="name1">
        <TabPane label="我想交換" name="name1">
            <h1 class="label label-topSpace">擁有 {{ ownQuantity }} 張色紙</h1>
            <div class="img-list">
                <button
                    type="button"
                    class="img-list-button"
                    :class="{'img-list-button-active': 0 < item.quantity,'img-list-button-gray': item.quantity === 0,}"
                    @click="addToExChange(item, index)"
                    :key="`all_${index}`"
                    v-for="(item, index) in ownList"
                >
                    <img :src="getImageUrl(`${item.id}.png`)" :alt="item.id"/>
                    <p class="text">No.{{ item.id }} * {{ item.quantity }}</p>
                </button>
            </div>
            <div class="alighBetween label-topSpace">
                <h1 class="label">想把 {{ exchangeList.length }} 張拿來交換</h1>
                <button type="button" class="clearButton" @click="clearExChange">全部清除</button>
            </div>
            <div class="remarkText" v-if="!exchangeList.length">請選擇想拿來交換的色紙</div>
            <p class="subLabel" v-if="exchangeList.length">＊ 點擊圖片移除</p>
            <div class="img-list" v-if="exchangeList.length">
                <button
                    type="button"
                    class="img-list-button-selected"
                    @click="removeExChangeImage(item, index)"
                    :key="`selected_${index}`"
                    v-for="(item, index) in exchangeList"
                >
                    <img :src="getImageUrl(`${item.id}.png`)" :alt="item.id"/>
                    <p class="text">No.{{ item.id }}</p>
                </button>
            </div>
            <div class="alighBetween label-topSpace">
                <div>
                    <h1 class="label">想換</h1>
                    <button type="button" class="addWishBtn" @click="showWishSelectModal">
                        ＋新增色紙
                    </button>
                </div>
                <button type="button" class="clearButton" @click="clearWishList">全部清除</button>
            </div>
            <p class="subLabel">
                ＊ 點擊圖片移除 <br/>
                ＊ 點擊上方新增色紙加入
            </p>
            <div class="remarkText" v-if="!wishList.length">新增想要的色紙</div>
            <div class="img-list" v-if="wishList.length">
                <button
                    type="button"
                    class="img-list-button-selected"
                    @click="removeWishImage(item, index)"
                    :key="`selected_${index}`"
                    v-for="(item, index) in wishList"
                >
                    <img :src="getImageUrl(`${item.id}.png`)" :alt="item.id"/>
                    <p class="text">No.{{ item.id }}</p>
                </button>
            </div>
            <!-- <div class="alighCenter createBookWrapper label-topSpace">
                      <button type="button" @click="createImage" class="createBookButton">
                          產生交換圖片
                      </button>
                  </div> -->
        </TabPane>
        <TabPane label="我的圖鑑" name="name2">
            <div class="alighBetween label-topSpace">
                <h1 class="label">圖鑑 ({{ 34 - wantQuantity }}/34)</h1>
            </div>
            <p class="subLabel">
                ＊ 達成率 {{ Math.floor((34 - wantQuantity) / 34 * 100) }}%<br>
                ＊ 還有 {{ wantQuantity }} 張未解鎖。<br>
                ＊ <span class="grayColor">灰色</span>是您尚未擁有、<span class="brownColor"
            >咖啡色</span
            >是您已擁有
            </p>
            <div class="img-list">
                <button
                    type="button"
                    class="img-list-button"
                    :class="{
            'img-list-button-active': 0 < item.quantity,
            'img-list-button-gray': !item.isOwned & (item.quantity === 0),
          }"
                    :disabled="true"
                    :key="`all_${index}`"
                    v-for="(item, index) in collectionBooks"
                >
                    <img :src="getImageUrl(`${item.id}.png`)" :alt="item.id"/>
                    <p class="text">
                        No.{{ item.id }}
                        <template v-if="0 < item.quantity"> * {{ item.quantity }}</template>
                    </p>
                </button>
            </div>
        </TabPane>
    </Tabs>
    <Transition name="fade">
        <div class="selections-popUp" v-show="isShowWishSelectModal">
            <div class="selections">
                <div class="selections-closedBtn">
                    <button type="button" @click="closeWishSelectModal">關閉</button>
                </div>
                <div class="alighBetween label-topSpace">
                    <h1 class="label">選擇想交換的色紙</h1>
                </div>
                <p class="subLabel">
                    ＊ 點擊圖片立刻加入<br/>
                    ＊ <span class="grayColor">灰色</span>是您尚未擁有、<span class="brownColor"
                >咖啡色</span
                >是您已擁有、<span class="greenColor">綠色</span>是已選取
                </p>
                <div class="img-list">
                    <button
                        type="button"
                        class="img-list-button"
                        :class="{
              'img-list-button-active': 0 < item.quantity,
              'img-list-button-gray': !item.isOwned & (item.quantity === 0),
            }"
                        @click="addToWishImage(item)"
                        :key="`all_${index}`"
                        v-for="(item, index) in allImages"
                    >
                        <img :src="getImageUrl(`${item.id}.png`)" :alt="item.id"/>
                        <p class="text">
                            No.{{ item.id }}
                            <template v-if="0 < item.quantity"> * {{ item.quantity }}</template>
                        </p>
                    </button>
                </div>
                <div class="alighCenter createBookWrapper label-topSpace">
                    <button type="button" @click="closeWishSelectModal" class="createBookButton">
                        確認並關閉
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
<style scoped></style>
