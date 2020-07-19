<template>
  <div id="app" class="page-wrapper with-navbar with-sidebar">
    <div class="sticky-alerts" />

    <Navbar />

    <Sidebar v-if="isUserAuthenticated" />

    <router-view class="content-wrapper" />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Navbar from "@/components/navbar/navbar.vue";
import Sidebar from "@/components/sidebar/sidebar.vue";

// halfmoon doesn't support TS yet
// eslint-disable-next-line @typescript-eslint/no-var-requires
const halfmoon = require("halfmoon");
require("halfmoon/css/halfmoon.min.css");

@Component({ components: { Navbar, Sidebar } })
export default class App extends Vue {
  mounted() {
    halfmoon.onDOMContentLoaded();
  }

  get isUserAuthenticated() {
    return true;
  }
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 15px;
}

.logo {
  font-family: "Josefin Sans", sans-serif;
  font-size: 2.2rem;
}
</style>
