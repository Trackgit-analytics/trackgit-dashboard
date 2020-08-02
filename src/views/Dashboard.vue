<template>
  <div>
    <LoginForm v-if="!isUserAuthenticated" />
    <RegisterForm v-if="!isUserAuthenticated" />
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

@Component({
  components: {
    Navbar,
    Sidebar,
    LoginForm,
    RegisterForm,
    CreateToken,
    TokenDetails
  }
})
export default class Dashboard extends Vue {
  @Prop({ default: "" }) readonly activeToken!: string;

  /** Gets the current auth status of the user */
  get isUserAuthenticated() {
    return UserModule.isUserAuthenticated;
  }

  /** Gets the list of all tokens in TokenModule */
  get tokenList(): Token[] | null {
    return TokenModule.tokens;
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
    if (this.activeToken.length > 0) {
      const token = tokenList.find(token => token.id === this.activeToken);
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
