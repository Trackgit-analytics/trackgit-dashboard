<template>
  <div class="no-tokens-container">
    <h5 class="text-center">
      <span v-if="!createdTokenBefore">
        Hey there, let's get you started!
      </span>
      <span v-else>Couldn't find any tokens</span>
    </h5>
    <button class="btn btn-lg" @click="openCreateTokenModal">
      Create new token
      <i class="fa fa-plus ml-10 font-size-12 add-icon" aria-hidden="true" />
    </button>
    <img
      :class="`background ${isDarkModeEnabled ? 'opacity-half' : ''}`"
      src="@/assets/desert.svg"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import HalmoonModule from "@/store/modules/HalmoonModule";
import Halfmoon from "@/helpers/Halfmoon";
import ModalID from "@/models/data/ModalID";
import CookieNames from "@/models/data/CookieNames";

@Component
export default class NoTokens extends Vue {
  /** gets whether app is in dark mode */
  get isDarkModeEnabled(): boolean {
    return HalmoonModule.isDarkMode;
  }

  /** gets whether the user created a token before */
  get createdTokenBefore(): boolean {
    return Vue.$cookies.isKey(CookieNames.activeTokenId);
  }

  /** Open create token modal */
  openCreateTokenModal() {
    Halfmoon.toggleModal(ModalID.createToken);
  }
}
</script>

<style scoped lang="scss">
.no-tokens-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 20vh;

  .background {
    position: absolute;
    bottom: 10vh;
    width: 100%;
    max-width: 750px;
  }

  .add-icon {
    margin-top: 3px;
  }
}
</style>
