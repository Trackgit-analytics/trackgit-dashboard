<template>
  <div id="app">
    <div class="sticky-alerts" />
    <router-view />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

// halfmoon doesn't support TS yet
// eslint-disable-next-line @typescript-eslint/no-var-requires
const halfmoon = require("halfmoon");
require("halfmoon/css/halfmoon.min.css");

@Component
export default class App extends Vue {
  mounted() {
    halfmoon.onDOMContentLoaded();
    this.fixViewport();
  }

  /**
   * Fix the height and width of the viewport.
   * This ensures that all elements display properly
   * even when the soft keyboard is being used.
   */
  fixViewport() {
    const viewheight = window.outerHeight;
    const viewwidth = window.outerWidth;
    const viewport = document.querySelector("meta[name=viewport]");
    viewport?.setAttribute(
      "content",
      "height=" +
        viewheight +
        "px, width=" +
        viewwidth +
        "px, initial-scale=1.0"
    );
  }
}
</script>

<style lang="scss">
body,
html {
  min-height: 100vh !important;
  min-width: 100vw !important;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 15px;
  height: 100%;
  width: 100%;
}

.logo {
  font-family: "Josefin Sans", sans-serif;
  font-size: 2.2rem;
}

.sidebar {
  scroll-snap-align: start;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.02);
  border: 0px;
}

.page-wrapper.with-sidebar > .content-wrapper {
  scroll-snap-align: start;
}

.page-wrapper {
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  display: flex;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    height: 1px;
  }

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 0px rgba(0, 0, 0, 0.3);
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    outline: 0.1px solid transparent;
  }
}

a {
  cursor: pointer;
}

.navbar {
  border-bottom: 0px;
}
.content-wrapper {
  top: 0px !important;
  height: 100% !important;
}

.dark-mode .navbar {
  background: #25282c;
}

.opacity-half {
  opacity: 0.5;
}
</style>
