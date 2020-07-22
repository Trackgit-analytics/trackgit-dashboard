<template>
  <div
    class="page-wrapper with-navbar with-sidebar"
    data-sidebar-type="full-height"
    id="dashboard-container"
  >
    <LoginForm v-if="!isUserAuthenticated" />
    <RegisterForm v-if="!isUserAuthenticated" />
    <div class="sticky-alerts" />

    <Sidebar />

    <div class="content-wrapper" @click="closeSidebar">
      <Navbar />
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

@Component({ components: { Navbar, Sidebar, LoginForm, RegisterForm } })
export default class Dashboard extends Vue {
  @Prop({ default: "" }) readonly activeToken!: string;

  get isUserAuthenticated(): boolean {
    return UserModule.isUserAuthenticated;
  }

  @Watch("isUserAuthenticated")
  async getUserData(isAuthenticated: boolean) {
    if (isAuthenticated) {
      await this.fetchAllTokens();
      this.setActiveTokenFromUrl();
    }
  }

  /** Trigger event to get all tokens for user */
  async fetchAllTokens() {
    await TokenModule.fetchAllTokens();
  }

  /** Get the active token from param and activate the token in module */
  setActiveTokenFromUrl() {
    if (this.activeToken.length > 0) {
      const token = TokenModule.tokens.filter(
        token => token.id === this.activeToken
      )[0];
      if (token != null) {
        TokenModule.updateActiveToken(token);
      } else {
        this.$router.push({ path: "./" });
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
