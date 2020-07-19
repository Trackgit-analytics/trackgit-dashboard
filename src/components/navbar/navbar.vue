<template>
  <nav class="navbar">
    <a href="#" class="navbar-brand ml-10 ml-sm-20 logo">
      <img
        src="@/assets/logo.svg"
        class="d-none d-md-block d-lg-block d-xl-block"
      />
      trackgit
    </a>
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
        @click="halfmoon.toggleDarkMode()"
        aria-label="Toggle dark mode"
      >
        <i class="fa fa-moon-o" aria-hidden="true"></i>
      </button>
      <a :href="Hyperlinks.donate" class="btn btn-primary" role="button">
        Donate
        <i class="fa fa-heart-o" aria-hidden="true"></i>
      </a>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Hyperlinks } from "@/models/data/LinkDirectory.ts";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const halfmoon = require("halfmoon");

@Component
export default class Navbar extends Vue {
  data() {
    return {
      halfmoon
    };
  }

  /** All hyperlinks for project */
  get Hyperlinks() {
    return Hyperlinks;
  }
}
</script>

<style scoped></style>
