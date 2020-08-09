<template>
  <div class="container-404">
    <h3>Error 404</h3>
    <h5>Seems like we couldn't find what you're looking for :(</h5>
    <img
      :class="`background ${isDarkModeEnabled ? 'opacity-half' : ''}`"
      src="@/assets/desert.svg"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import HalfmoonModule from "@/store/modules/HalmoonModule.ts";

@Component
export default class Error404 extends Vue {
  /** gets whether app is in dark mode */
  get isDarkModeEnabled(): boolean {
    return HalfmoonModule.isDarkMode;
  }
}
</script>

<style lang="scss" scoped>
.container-404 {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  text-align: center;
  padding: 0vh 10vw 20vh 10vw;

  .background {
    position: absolute;
    bottom: 10vh;
    width: 100%;
    max-width: 750px;
  }
}
</style>
