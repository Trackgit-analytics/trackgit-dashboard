<template>
  <div class="token-graph">
    <div class="timeframe-buttons">
      <button
        :class="
          `btn btn-sm ${
            selectedPeriod === timeFrames.week ? 'btn-primary' : ''
          }`
        "
        @click="selectedPeriod = timeFrames.week"
        type="button"
      >
        7d
      </button>
      <button
        :class="
          `btn btn-sm ${
            selectedPeriod === timeFrames.month ? 'btn-primary' : ''
          }`
        "
        @click="selectedPeriod = timeFrames.month"
        type="button"
      >
        30d
      </button>
      <button
        :class="
          `btn btn-sm ${
            selectedPeriod === timeFrames.year ? 'btn-primary' : ''
          }`
        "
        @click="selectedPeriod = timeFrames.year"
        type="button"
      >
        12mo
      </button>
    </div>
    <ApexCharts
      type="line"
      v-if="showGraph"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Token from "@/models/interfaces/Token";
import VueApexCharts from "vue-apexcharts";
import HalmoonModule from "@/store/modules/HalmoonModule";
import TokenHelper from "@/helpers/TokenHelper";
import DateHelper from "@/helpers/DateHelper.ts";

Vue.component("ApexCharts", VueApexCharts);

@Component
export default class TokenGraph extends Vue {
  @Prop({ required: true }) readonly token!: Token;

  showGraph = false;

  /** Available time frames to choose from */
  timeFrames = {
    week: 0,
    month: 1,
    year: 2
  };

  /** Currently selected time frame */
  selectedPeriod = this.timeFrames.week;

  /** gets the current app theme (dark/light) */
  get appTheme(): string {
    return HalmoonModule.isDarkMode ? "dark" : "light";
  }

  /** Gets the request data and labels with respect to the selected time period */
  get requestsByTime(): { data: number[]; labels: string[] } {
    switch (this.selectedPeriod) {
      case this.timeFrames.week:
        return this.daysLog(7);
      case this.timeFrames.month:
        return this.daysLog(30);
      default:
        return this.monthsLog(12);
    }
  }

  /**
   * Gets the chart data for the given number of days relative to today
   */
  daysLog(numberOfDays: number): { data: number[]; labels: string[] } {
    const dateObj = new Date();
    const dayMilliseconds = 24 * 60 * 60 * 1000;

    const endOfToday = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate() + 1
    ).getTime();
    const startOfToday = endOfToday - dayMilliseconds;

    const graphData = {
      data: new Array<number>(),
      labels: new Array<string>()
    };

    for (let i = numberOfDays; i >= 0; i--) {
      const endTime = endOfToday - i * dayMilliseconds;
      const startTime = startOfToday - i * dayMilliseconds;

      const requestCount = TokenHelper.getTimeLogs(
        this.token,
        startTime,
        endTime
      ).length;

      const startTimeDate = new Date(startTime);
      const dataLabel = `${startTimeDate.getDate()} 
      ${DateHelper.monthNames[startTimeDate.getMonth()]}`;

      graphData.data.push(requestCount);
      graphData.labels.push(dataLabel);
    }

    return graphData;
  }

  /**
   * Gets the chart data for the given number of months relative to current month
   */
  monthsLog(numberOfMonths: number): { data: number[]; labels: string[] } {
    const graphData = {
      data: new Array<number>(),
      labels: new Array<string>()
    };

    const dateObj = new Date();
    const dayMilliseconds = 24 * 60 * 60 * 1000;

    for (let i = numberOfMonths; i >= 0; i--) {
      const endTime =
        new Date(
          dateObj.getFullYear(),
          dateObj.getMonth() - i + 1,
          0
        ).getTime() + dayMilliseconds;
      const startTime = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth() - i,
        1
      ).getTime();

      const requestCount = TokenHelper.getTimeLogs(
        this.token,
        startTime,
        endTime
      ).length;

      const startTimeDate = new Date(startTime);
      const dateLabel = `
      ${startTimeDate.getMonth() + 1}
      /${startTimeDate.getFullYear()}`;

      graphData.data.push(requestCount);
      graphData.labels.push(dateLabel);
    }

    return graphData;
  }

  /** gets chart data */
  get series() {
    return [
      {
        name: "Requests",
        data: this.requestsByTime.data,
        labels: this.requestsByTime.labels
      }
    ];
  }

  /** gets chart configuration */
  get chartOptions() {
    return {
      chart: {
        animations: {
          enabled: true,
          easing: "easeinout",
          dynamicAnimation: {
            enabled: true,
            speed: 200
          }
        },
        toolbar: {
          show: false
        },
        height: "100%",
        type: "line",
        zoom: {
          enabled: false
        }
      },
      stroke: {
        curve: "smooth"
      },
      grid: {
        show: false
      },
      theme: {
        mode: this.appTheme
      },
      xaxis: {
        categories: this.series[0].labels,
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            fontFamily: "Roboto, sans-serif",
            cssClass: "opacity-half"
          }
        }
      },
      yaxis: {
        show: true,
        opposite: true,
        tickAmount: 2,
        axisBorder: {
          show: false
        },
        labels: {
          style: {
            fontFamily: "Roboto, sans-serif",
            cssClass: "opacity-half"
          }
        }
      },
      tooltip: {
        style: {
          fontSize: "15px"
        },
        y: {
          formatter: undefined,
          title: {
            formatter: () => ""
          }
        }
      },
      colors: ["#a134ff"],
      fill: {
        type: "gradient",
        gradient: {
          type: "horizontal",
          gradientToColors: ["#3448ff", "#137af0", "#a134ff", "#3448ff"],
          opacityFrom: 0.5,
          opacityTo: 1
        }
      }
    };
  }
}
</script>

<style lang="scss">
.apexcharts-tooltip {
  box-shadow: none !important;
}
.token-graph {
  height: 100%;
  width: 100%;
}

.timeframe-buttons {
  padding-top: 5px;
  width: 100%;
  text-align: right;

  button {
    display: inline-block;
    margin: 0px 3px;
  }
}

.apexcharts-canvas {
  svg {
    background: transparent !important;
  }
}
</style>
