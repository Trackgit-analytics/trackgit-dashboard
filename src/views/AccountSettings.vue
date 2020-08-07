<template>
  <div class="account-settings">
    <h2>Account settings</h2>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import TokenModule from "@/store/modules/TokenModule";

@Component
export default class AccountSettings extends Vue {
  mounted() {
    TokenModule.updateActiveToken(undefined);
  }
}
</script>

<style lang="scss" scoped>
.account-settings {
  padding: 0px 6vw;
}
</style>
