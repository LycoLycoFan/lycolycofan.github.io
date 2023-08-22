import {createRouter, createWebHashHistory} from 'vue-router'
import Home from "../views/Home.vue";
import Collections from "../views/Collections.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes:  [
        {
            path: "/",
            name: "Home",
            component: Home,
            meta: { transition: 'slide-right' },
        },
        {
            path: "/collections/:list/:exchange/:wish",
            name: "Collections",
            component: Collections,
            meta: { transition: 'slide-right' },
        },
        {
            path: "/:pathMatch(.*)*",
            name: 'NotFound',
            component: Home
        }]
})

export default router;