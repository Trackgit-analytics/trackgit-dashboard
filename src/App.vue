<template>
  <div id="app">
    <!-- MODALS -->
    <span v-if="!isUserAuthenticated">
      <LoginForm v-if="showLogin" />
      <RegisterForm v-if="showRegister" />
      <ForgotPasswordForm v-if="showForgotPassword" />
      <ResetPasswordForm v-if="showResetPassword" />
    </span>
    <EmailVerificationForm v-if="showEmailVerification" />

    <EmbedToken :token="activeToken" v-if="activeToken != null" />
    <CreateToken />
    <!-- MODALS -->

    <div
      class="page-wrapper with-navbar with-sidebar"
      data-sidebar-type="full-height"
    >
      <div class="sticky-alerts" />

      <Sidebar />

      <div class="content-wrapper" @click="closeSidebar">
        <Navbar />
        <router-view class="content-container" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import Navbar from "@/components/navbar/navbar.vue";
import Sidebar from "@/components/sidebar/sidebar.vue";
import SidebarModule from "@/store/modules/SidebarModule.ts";
import TokenModule from "@/store/modules/TokenModule.ts";
import LoginForm from "@/components/forms/login.vue";
import RegisterForm from "@/components/forms/register.vue";
import UserModule from "@/store/modules/UserModule";
import CreateToken from "@/components/forms/create-token.vue";
import TokenDetails from "@/components/token-details/token-details.vue";
import CookieNames from "@/models/data/CookieNames";
import EmbedToken from "@/components/embed-token/embed-token.vue";
import ForgotPasswordForm from "@/components/forms/forgot-password.vue";
import ResetPasswordForm from "@/components/forms/reset-password.vue";
import ModalID from "@/models/data/ModalID";
import { Hyperlinks } from "@/models/data/LinkDirectory";
import Halfmoon from "@/helpers/Halfmoon.ts";
import UserHelper from "@/helpers/UserHelper";
import EmailVerificationForm from "@/components/forms/email-verification.vue";
import EmailMode from "@/models/data/EmailMode";
import FirebaseModule from "@/store/modules/FirebaseModule";
import Token from "@/models/interfaces/Token";

require("halfmoon/css/halfmoon.min.css");

@Component({
  components: {
    Navbar,
    Sidebar,
    LoginForm,
    RegisterForm,
    ForgotPasswordForm,
    ResetPasswordForm,
    EmailVerificationForm,
    CreateToken,
    TokenDetails,
    EmbedToken
  }
})
export default class App extends Vue {
  showLogin = false;
  showRegister = false;
  showForgotPassword = false;
  showResetPassword = false;
  showEmailVerification = false;

  /** Gets the current auth status of the user */
  get isUserAuthenticated() {
    return UserModule.isUserAuthenticated;
  }

  /** Gets the currently selected token from TokenModule */
  get activeToken(): Token | null {
    return TokenModule.activeToken;
  }

  /** Get logged in user's data */
  @Watch("isUserAuthenticated")
  async getUserData(isAuthenticated: boolean) {
    if (isAuthenticated) {
      await this.fetchAllTokens();
    }
  }

  mounted() {
    Halfmoon.init();
    this.fixViewport();

    FirebaseModule.initializeApp();
  }

  /** Trigger event to get all tokens for user */
  async fetchAllTokens() {
    await TokenModule.fetchAllTokens();
  }

  /** Show authentication prompts if user is not logged in */
  @Watch("isUserAuthenticated")
  async setAuthPrompts(isUserAuthenticated: boolean) {
    const currentPath = this.$router.currentRoute.path;
    if (isUserAuthenticated === false) {
      if (currentPath === "" && UserHelper.isFirstTime()) {
        this.showRegister = true;
        return;
      }

      this.showLogin = currentPath === Hyperlinks.login;
      this.showRegister = currentPath === Hyperlinks.register;
      this.showForgotPassword = currentPath === Hyperlinks.forgotPassword;

      if (currentPath === Hyperlinks.emailReferrer) {
        const emailMode = this.$route.query.mode;
        this.showResetPassword = emailMode === EmailMode.resetPassword;
        this.showEmailVerification = emailMode === EmailMode.verifyEmail;
      }
    }
  }

  /** Hide the sidebar if it is open */
  closeSidebar() {
    if (SidebarModule.isOpen) {
      SidebarModule.updateSidebarVisibility(false);
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

.content-container {
  height: calc(100% - 8.3rem);
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

.content-wrapper {
  transition: all 120ms ease;
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
