<template>
  <div class="token-details-container">
    <div v-if="loading">
      <SkeletonLoader height="40px" width="200px" />
      <br />
      <SkeletonLoader height="25px" width="50px" />
    </div>
    <div v-else class="top-controls">
      <div class="token-name-container d-inline-block">
        <h2 class="mt-0">
          {{ token.name }}
        </h2>
      </div>
      <div>
        <button class="btn btn-sm" type="button">
          <i class="fa fa-code mr-5" aria-hidden="true" />
          Embed
        </button>
      </div>
    </div>
    <div class="analytics-container">
      <div class="w-lg-200 mw-full d-inline-block analytics-card">
        <div class="card">
          <span>
            Last 24 hours
          </span>
          <SkeletonLoader v-if="loading" height="35px" width="50px" />
          <div class="font-size-24" v-else>{{ viewsLastDay }}</div>
        </div>
      </div>
      <div class="w-lg-200 mw-full d-inline-block analytics-card">
        <div class="card">
          <span>
            Last 7 days
          </span>
          <SkeletonLoader v-if="loading" height="35px" width="50px" />
          <div class="font-size-24" v-else>{{ viewsLastWeek }}</div>
        </div>
      </div>
      <div class="w-lg-200 mw-full d-inline-block analytics-card">
        <div class="card">
          <span>
            All time total
          </span>
          <SkeletonLoader v-if="loading" height="35px" width="50px" />
          <div class="font-size-24" v-else>{{ viewsAllTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import Token from "@/models/interfaces/Token";
import TokenModule from "@/store/modules/TokenModule";
import NumberHelper from "@/helpers/NumberHelper.ts";
import TokenHelper from "@/helpers/TokenHelper";

@Component
export default class TokenDetails extends Vue {
  loading = true;

  /** Gets the current active token */
  get token(): Token | null {
    return TokenModule.activeToken;
  }

  /** Gets the total number of views for the last 24 hours */
  get viewsLastDay(): string {
    if (!this.token) {
      return "";
    }
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const timeLogsLastDay = TokenHelper.getTimeLogs(oneDayInMs, this.token);
    return NumberHelper.abbreviate(timeLogsLastDay.length);
  }

  /** Gets the total number of views for the last 7 days */
  get viewsLastWeek(): string {
    const oneWeekInMs = 24 * 60 * 60 * 1000 * 7;
    const timeLogsLastWeek = TokenHelper.getTimeLogs(oneWeekInMs, this.token);
    return NumberHelper.abbreviate(timeLogsLastWeek.length);
  }

  /** Gets the all time total number of views */
  get viewsAllTime(): string {
    const timeLogsAllTime = TokenHelper.getTimeLogs(Infinity, this.token);
    return NumberHelper.abbreviate(timeLogsAllTime.length);
  }

  @Watch("token")
  ontokenChanged(newtoken: Token) {
    this.loading = newtoken === null ? true : false;

    if (newtoken !== null) {
      document.title = `Dashboard - ${newtoken.name}`;
    }
  }
}
</script>

<style lang="scss" scoped>
.token-details-container {
  padding: 0px 6vw;

  .analytics-container {
    .analytics-card > .card {
      margin-left: 0px;
      margin-right: 10px;
      margin-bottom: 0px;
      min-width: 100px;
    }
  }
}

@media (max-width: 768px) {
  .analytics-container {
    .analytics-card {
      display: block !important;
    }
  }
}
</style>
