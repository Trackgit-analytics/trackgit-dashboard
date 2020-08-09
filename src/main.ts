import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueCookies from "vue-cookies";
import SkeletonLoader from "@/components/misc/skeletonLoader.vue";
import Spinner from "@/components/misc/spinner.vue";

Vue.use(VueCookies);
Vue.$cookies.config("7d");

Vue.component("SkeletonLoader", SkeletonLoader);
Vue.component("Spinner", Spinner);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
