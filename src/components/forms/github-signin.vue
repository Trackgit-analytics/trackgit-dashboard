<template>
  <button class="btn btn-block" @click="signInWithGithub">
    <slot></slot>
    <i class="fa ml-10 fa-github-alt"></i>
  </button>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import UserHelper from "@/helpers/UserHelper";
import Halfmoon from "@/helpers/Halfmoon";

@Component
export default class GithubSignin extends Vue {
  loading = false;

  /** Attempt user login with Github account */
  async signInWithGithub() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    const actionStatus = await UserHelper.signInWithGithub();
    if (!actionStatus.isSuccessful) {
      Halfmoon.toastError({
        content: "Couldn't sign you in with GitHub. Please try again."
      });
    }

    this.loading = false;
  }
}
</script>

<style scoped></style>
