<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import FirebaseModule from "./store/modules/FirebaseModule";
import UserModule from "./store/modules/UserModule";
import UserHelper from "@/helpers/UserHelper";
import FormTypes from "./models/data/FormTypes";
import Halfmoon from "@/helpers/Halfmoon.ts";

require("halfmoon/css/halfmoon.min.css");

@Component
export default class App extends Vue {
  async mounted() {
    Halfmoon.init();
    this.fixViewport();

    await FirebaseModule.initializeApp();
  }

  /** Gets the current auth status of the user */
  get isUserAuthenticated() {
    return UserModule.isUserAuthenticated;
  }

  /** Show authentication prompts if user is not logged in */
  @Watch("isUserAuthenticated")
  async setAuthPrompts() {
    if (UserModule.isUserAuthenticated === false) {
      if (this.$router.currentRoute.path.indexOf(FormTypes.login) != -1) {
        Halfmoon.toggleModal("login");
      } else if (
        this.$router.currentRoute.path.indexOf(FormTypes.register) != -1
      ) {
        Halfmoon.toggleModal("register");
      } else if (UserHelper.isFirstTime()) {
        Halfmoon.toggleModal("register");
      } else {
        Halfmoon.toggleModal("login");
      }
    } else if (UserModule.isUserAuthenticated === true) {
      const currentPath = this.$router.currentRoute.path;
      if (
        currentPath.includes(FormTypes.login) ||
        currentPath.includes(FormTypes.register)
      ) {
        this.$router.replace({ path: "/" });
      }
    }
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
  padding: 3.5rem 2rem;
}

.content-wrapper {
  top: 0px !important;
  height: 100% !important;
}

.dark-mode .navbar {
  background: #25282c;
}

.dark-mode .modal {
  background: rgba(0, 0, 0, 0.5);
}

.opacity-half {
  opacity: 0.5;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  transition: top 0ms !important;
}

.no-select {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 576px) {
  .modal-content {
    max-width: 90%;
  }

  .navbar {
    padding: 3rem 1rem;
  }
}
</style>
