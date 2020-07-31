<template>
  <nav class="navbar">
    <div class="navbar-content d-block d-none d-sm-block d-md-none">
      <button class="btn btn-action" type="button" @click="toggleSidebar()">
        <i class="fa fa-bars" aria-hidden="true"></i>
        <span class="sr-only">Toggle sidebar</span>
      </button>
    </div>
    <div class="navbar-content ml-auto">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item dropdown with-arrow">
          <a
            class="nav-link"
            data-toggle="dropdown"
            id="nav-link-dropdown-toggle"
          >
            Help
            <i class="fa fa-angle-down ml-5" aria-hidden="true"></i>
          </a>
          <div
            class="dropdown-menu dropdown-menu-right"
            aria-labelledby="nav-link-dropdown-toggle"
          >
            <a href="#" class="dropdown-item">
              Keyboard shortcuts
            </a>
            <a href="#" class="dropdown-item">Email support</a>
          </div>
        </li>
      </ul>

      <button
        class="btn btn-action mr-5"
        type="button"
        @click="toggleDarkMode"
        aria-label="Toggle dark mode"
      >
        <i class="fa fa-moon-o" aria-hidden="true" />
      </button>

      <UserInfoNavbar />
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SidebarModule from "@/store/modules/SidebarModule";
import UserInfoNavbar from "@/components/user-info-navbar/user-info-navbar.vue";
import HalfmoonModule from "@/store/modules/HalmoonModule.ts";

@Component({ components: { UserInfoNavbar } })
export default class Navbar extends Vue {
  toggleSidebar() {
    SidebarModule.updateSidebarVisibility(!SidebarModule.isOpen);
  }

  toggleDarkMode() {
    HalfmoonModule.toggleDarkMode();
  }
}
</script>

<style lang="scss" scoped></style>
