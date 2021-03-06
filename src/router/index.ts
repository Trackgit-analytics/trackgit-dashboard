import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import PageMeta from "@/models/data/PageMeta";
import FormTypes from "@/models/data/FormTypes";
import BodyMetaHelper from "@/helpers/BodyMetaHelper";
import { Hyperlinks } from "@/models/data/LinkDirectory";

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
    path: "/token/:activeTokenId?",
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
  },
  {
    path: `/${FormTypes.forgotPassword}`,
    name: "Forgot password",
    meta: PageMeta.ForgotPassword,
    component: Dashboard
  },
  {
    path: `/${FormTypes.emailReferrer}`,
    name: "Email referred route",
    component: Dashboard
  },
  {
    path: Hyperlinks.accountSettings,
    name: "Account settings",
    meta: PageMeta.AccountSettings,
    component: () => import("@/views/AccountSettings.vue")
  },
  {
    path: "*",
    name: "Error404",
    meta: PageMeta.Error404,
    component: () => import("@/views/Error404.vue")
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

  if (nearestWithTitle) {
    BodyMetaHelper.setDocumentTitle(nearestWithTitle.meta.title);
  }
  Array.from(
    document.querySelectorAll("[data-vue-router-controlled]")
  ).map(el => el.parentNode?.removeChild(el));

  if (!nearestWithMeta) {
    return next();
  }

  BodyMetaHelper.addMetaInfo(nearestWithMeta.meta.metaTags);

  next();
});

export default router;
