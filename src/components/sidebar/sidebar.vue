<template>
  <div class="sidebar" id="sidebar-container">
    <div class="sidebar-menu">
      <a href="/" class="sidebar-brand logo">
        <img src="@/assets/logo.svg" alt="logo" />
        trackgit
      </a>
      <div class="sidebar-content">
        <input
          type="text"
          class="form-control"
          v-on:input="searchQuery = $event.target.value"
          placeholder="Search"
        />
      </div>

      <div
        class="token-list"
        v-if="allTokens.length > 0 || searchQuery.length === 0"
      >
        <h5 class="sidebar-title">
          Tokens
        </h5>
        <div class="sidebar-divider"></div>
        <a
          @click="openCreateTokenForm"
          class="sidebar-link font-weight-medium font-size-12"
          role="button"
          aria-label="Create new token"
        >
          Create new token
          <span class="float-right">
            <i class="fa fa-plus" aria-hidden="true"></i>
          </span>
        </a>

        <div v-if="loading">
          <div
            v-for="n in 3"
            :key="n"
            class="sidebar-link side-bar-link-with-icon"
          >
            <SkeletonLoader height="20px" />
          </div>
        </div>

        <a
          v-for="token in allTokens"
          @click="setActiveToken(token)"
          :key="token.id"
          :class="
            `sidebar-link token-link sidebar-link-with-icon ${
              activeToken && activeToken.id === token.id ? 'active' : ''
            }`
          "
        >
          <span class="sidebar-icon">
            <i class="fa fa-code" aria-hidden="true"></i>
          </span>
          <span class="no-select token-link-text">{{ token.name }}</span>
        </a>
        <br />
        <br />
      </div>

      <div
        class="misc-items"
        v-if="miscItems.length > 0 || searchQuery.length === 0"
      >
        <div class="sidebar-divider"></div>
        <a
          v-for="miscItem in miscItems"
          @click="miscItem.action"
          :key="miscItem.id"
          class="sidebar-link sidebar-link-with-icon"
        >
          <span class="sidebar-icon">
            <i :class="`fa ${miscItem.icon}`"></i>
          </span>
          {{ miscItem.name }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { Hyperlinks } from "@/models/data/LinkDirectory.ts";
import SidebarModule from "@/store/modules/SidebarModule.ts";
import TokenModule from "@/store/modules/TokenModule.ts";
import Token from "@/models/interfaces/Token";
import Halfmoon from "@/helpers/Halfmoon";
import ModalID from "@/models/data/ModalID";
import TokenHelper from "@/helpers/TokenHelper";

@Component
export default class Sidebar extends Vue {
  parentContainer: Element | null = null;
  sidebarContainer: Element | null = null;

  searchQuery = "";

  loading = true;

  scrollBehavior = "auto";

  /** All hyperlinks for project */
  get Hyperlinks() {
    return Hyperlinks;
  }

  /** See the state of the sidebar's visibility */
  get isSidebarVisible(): boolean {
    return SidebarModule.isOpen;
  }

  /** See the current active token */
  get activeToken(): Token | null {
    return TokenModule.activeToken;
  }

  /** Additional items in sidebar */
  get miscItems() {
    const items = [
      {
        id: 1,
        name: "Account settings",
        action: this.openAccountSettings,
        icon: "fa-cog"
      },
      { id: 2, name: "Donate", action: this.openDonatePage, icon: "fa-heart" }
    ];
    const filtered = items.filter(item =>
      this.searchFilter(item.name, this.searchQuery)
    );
    return filtered;
  }

  /** Get the list of all tokens */
  get allTokens(): Token[] {
    if (TokenModule.tokens == null) {
      this.loading = true;
      return [];
    }

    this.loading = false;

    const filtered = TokenModule.tokens.filter(token =>
      this.searchFilter(token.name, this.searchQuery)
    );
    return filtered;
  }

  /**
   * Search filter for comparing two strings
   * @param a The first string
   * @param b The second string
   * @returns True if b is a subset of a; false otherwise
   */
  searchFilter(a: string, b: string): boolean {
    let select = false;
    select = a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
    return select;
  }

  mounted() {
    this.parentContainer = document.getElementById("app-container");
    this.sidebarContainer = document.getElementById("sidebar-container");
    this.parentContainer?.addEventListener("scroll", this.setSidebarVisibility);

    // set the initial sidebar visibility when app loads
    this.toggleSidebar(SidebarModule.isOpen);
    this.scrollBehavior = "smooth";
  }

  /** Set a new currently active token and update the url path */
  setActiveToken(token: Token) {
    TokenModule.updateActiveToken(token);
    TokenHelper.updateTokenRoute(token);
    SidebarModule.updateSidebarVisibility(false);
  }

  @Watch("isSidebarVisible", { immediate: true, deep: true })
  toggleSidebar(isVisible: boolean) {
    if (this.parentContainer == null || this.sidebarContainer == null) {
      return;
    }

    if (!isVisible) {
      const sidebarWidth = this.sidebarContainer.getBoundingClientRect().width;
      this.parentContainer.scroll({
        left: sidebarWidth,
        behavior: this.scrollBehavior === "smooth" ? "smooth" : "auto"
      });
    } else {
      this.parentContainer.scroll({
        left: 0,
        behavior: this.scrollBehavior === "smooth" ? "smooth" : "auto"
      });
    }
  }

  /** Update Sidebar module and add/remove styles to content-wrapper */
  setSidebarVisibility() {
    if (!this.sidebarContainer || !this.parentContainer) {
      return;
    }

    const sidebarWidth = this.sidebarContainer.getBoundingClientRect().width;
    const parentScrollLeft = this.parentContainer.scrollLeft;
    if (parentScrollLeft === 0 || parentScrollLeft === sidebarWidth) {
      SidebarModule.updateSidebarVisibility(parentScrollLeft === 0);
    }
    if (parentScrollLeft > 0) {
      document
        .getElementsByClassName("content-wrapper")[0]
        .classList.remove("opacity-half");
    } else {
      document
        .getElementsByClassName("content-wrapper")[0]
        .classList.add("opacity-half");
    }
  }

  /** Opens the create token form */
  openCreateTokenForm() {
    Halfmoon.toggleModal(ModalID.createToken);
  }

  /** Open account settings page */
  openAccountSettings() {
    this.$router.push({ path: Hyperlinks.accountSettings });
    SidebarModule.updateSidebarVisibility(false);
  }

  /** Redirect to donation page */
  openDonatePage() {
    window.location.href = Hyperlinks.donate;
  }
}
</script>

<style scoped lang="scss">
.sidebar-menu {
  text-align: left;
  z-index: 1;
  position: relative;
  height: 100%;
  box-sizing: border-box;
  padding: 2.5rem 0px;
  margin: 0px;
  display: flex;
  flex-direction: column;

  .token-list {
    flex-grow: 1;
  }
}

.token-link {
  max-width: 100%;
  position: relative;
  display: flex;

  .sidebar-icon {
    flex-shrink: 0;
    min-width: 30px;
    min-height: 30px;
  }

  .token-link-text {
    overflow: hidden;
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
