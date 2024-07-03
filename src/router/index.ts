import { createRouter, createWebHashHistory } from "vue-router";

export const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../views/home.vue"),
    },
    {
        path: "/hoverball",
        name: "Hoverball",
        component: () => import("../views/hoverball.vue"),
    },

];

const router = createRouter({
    // history: createWebHistory(),
    history: createWebHashHistory(),
    routes,
});

export default router;
