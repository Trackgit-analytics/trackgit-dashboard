<template>
  <SkeletonTheme
    class="skeleton-loader"
    :color="isDarkModeOn ? '#343639' : '#dfdfdf'"
    :highlight="isDarkModeOn ? '#474747' : '#eaeaea'"
  >
    <Skeleton
      :count="count"
      :duration="duration"
      :width="width"
      :height="height"
      :circle="circle"
      :loading="loading"
    />
  </SkeletonTheme>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Halfmoon from "@/helpers/Halfmoon";
import { Skeleton, SkeletonTheme } from "vue-loading-skeleton";

Vue.component("Skeleton", Skeleton);
Vue.component("SkeletonTheme", SkeletonTheme);

@Component
export default class SkeletonLoader extends Vue {
  @Prop({ default: 1 }) readonly count!: number;
  @Prop({ default: 1 }) readonly duration!: number;
  @Prop({ default: undefined }) readonly width!: string;
  @Prop({ default: undefined }) readonly height!: string;
  @Prop({ default: false }) readonly circle!: boolean;
  @Prop({ default: undefined }) readonly loading!: boolean;

  get isDarkModeOn(): boolean {
    return Halfmoon.isDarkModeOn();
  }
}
</script>

<style lang="scss" scoped></style>
