<template>
  <div>
    <span v-if="!isUserAuthenticated">
      <LoginForm />
      <RegisterForm />
      <ForgotPasswordForm />
      <ResetPasswordForm />
    </span>
    <EmailVerificationForm />

    <EmbedToken :token="activeToken" v-if="activeToken != null" />
    <CreateToken />

    <div
      class="page-wrapper with-navbar with-sidebar"
      data-sidebar-type="full-height"
      id="dashboard-container"
    >
      <div class="sticky-alerts" />

      <Sidebar />

      <div class="content-wrapper" @click="closeSidebar">
        <Navbar />
        <TokenDetails />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Navbar from "@/components/navbar/navbar.vue";
import Sidebar from "@/components/sidebar/sidebar.vue";
import SidebarModule from "@/store/modules/SidebarModule.ts";
import TokenModule from "@/store/modules/TokenModule.ts";
import LoginForm from "@/components/forms/login.vue";
import RegisterForm from "@/components/forms/register.vue";
import UserModule from "@/store/modules/UserModule";
import CreateToken from "@/components/forms/create-token.vue";
import TokenDetails from "@/components/token-details/token-details.vue";
import Token from "@/models/interfaces/Token";
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
export default class Dashboard extends Vue {
  @Prop({ default: "" }) readonly activeTokenId!: string;

  /** Gets the current auth status of the user */
  get isUserAuthenticated() {
    return UserModule.isUserAuthenticated;
  }

  /** Gets the list of all tokens in TokenModule */
  get tokenList(): Token[] | null {
    return TokenModule.tokens;
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

  /** Trigger event to get all tokens for user */
  async fetchAllTokens() {
    await TokenModule.fetchAllTokens();
  }

  /** Show authentication prompts if user is not logged in */
  @Watch("isUserAuthenticated")
  async setAuthPrompts() {
    const currentPath = this.$router.currentRoute.path;
    if (UserModule.isUserAuthenticated === false) {
      switch (currentPath) {
        case Hyperlinks.login:
          Halfmoon.toggleModal(ModalID.login);
          break;
        case Hyperlinks.register:
          Halfmoon.toggleModal(ModalID.register);
          break;
        case Hyperlinks.forgotPassword:
          Halfmoon.toggleModal(ModalID.forgotPassword);
          break;
        case Hyperlinks.emailReferrer:
          switch (this.$route.query.mode) {
            case EmailMode.resetPassword:
              Halfmoon.toggleModal(ModalID.resetPassword);
              break;
            case EmailMode.verifyEmail:
              Halfmoon.toggleModal(ModalID.verifyEmail);
              break;
            default:
              this.$router.push({ path: "/" });
              this.$router.go(0);
              break;
          }
          break;
        default:
          if (UserHelper.isFirstTime()) {
            Halfmoon.toggleModal(ModalID.register);
          } else {
            Halfmoon.toggleModal(ModalID.login);
          }
          break;
      }
    }
  }

  /** Get the active token from param/cookie and activate the token in module */
  @Watch("tokenList")
  setActiveToken(tokenList: Token[] | null, oldTokenList: Token[] | null) {
    if (
      tokenList == null ||
      (oldTokenList != null && TokenModule.activeToken != null)
    ) {
      return;
    }

    // check token in url param
    if (this.activeTokenId.length > 0) {
      const token = tokenList.find(token => token.id === this.activeTokenId);
      if (token != null) {
        TokenModule.updateActiveToken(token);
      } else {
        TokenModule.updateActiveToken(tokenList[0]);
      }
      SidebarModule.updateSidebarVisibility(false);
    }
    // check for active token cookie
    else if (Vue.$cookies.isKey(CookieNames.activeTokenId)) {
      const token = tokenList.find(
        token => token.id === Vue.$cookies.get(CookieNames.activeTokenId)
      );
      if (token) {
        TokenModule.updateActiveToken(token);
        SidebarModule.updateSidebarVisibility(false);
      }
    }
  }

  /** Verifies whether the active token exists in the tokenList */
  @Watch("tokenList")
  verifyActiveToken() {
    if (this.activeToken != null && this.tokenList != null) {
      const tokenExists = this.tokenList
        .map(token => token.id)
        .includes(this.activeToken.id);

      if (!tokenExists) {
        const newActiveToken = this.tokenList[0];
        TokenModule.updateActiveToken(newActiveToken);
      } else {
        TokenModule.updateTokenData(
          this.tokenList.find(token => token.id === this.activeToken?.id)
        );
      }
    }
  }

  /** Hide the sidebar if it is open */
  closeSidebar() {
    if (SidebarModule.isOpen) {
      SidebarModule.updateSidebarVisibility(false);
    }
  }
}
</script>

<style>
.content-wrapper {
  transition: all 120ms ease;
}
</style>
