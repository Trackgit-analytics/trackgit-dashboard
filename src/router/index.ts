import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import PageMeta from "@/models/data/PageMeta";
import FormTypes from "@/models/data/FormTypes";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Dashboard",
    props: true,
    meta: PageMeta.Dashboard,
    component: Dashboard
  },
  {
    path: "/token/:activeToken?",
    name: "Dashboard-token",
    props: true,
    meta: PageMeta.Dashboard,
    component: Dashboard
  },
  {
    path: `/${FormTypes.login}`,
    name: "Login",
    meta: PageMeta.Login,
    component: Dashboard
  },
  {
    path: `/${FormTypes.register}`,
    name: "Register",
    meta: PageMeta.Register,
    component: Dashboard
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

/**
 * This inserts meta tags into the page when a route loads
 * Source: https://www.digitalocean.com/community/tutorials/vuejs-vue-router-modify-head
 */
router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.title);
  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.metaTags);

  if (nearestWithTitle) document.title = nearestWithTitle.meta.title;

  Array.from(
    document.querySelectorAll("[data-vue-router-controlled]")
  ).map(el => el.parentNode?.removeChild(el));

  if (!nearestWithMeta) return next();

  nearestWithMeta.meta.metaTags
    .map((tagDef: any) => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach(key => {
        tag.setAttribute(key, tagDef[key]);
      });

      tag.setAttribute("data-vue-router-controlled", "");

      return tag;
    })
    .forEach((tag: any) => document.head.appendChild(tag));

  next();
});

export default router;
