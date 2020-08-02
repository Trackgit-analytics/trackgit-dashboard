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
        365d
      </button>
    </div>
    <ApexCharts type="line" :options="chartOptions" :series="series" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Token from "@/models/interfaces/Token";
import VueApexCharts from "vue-apexcharts";
import HalmoonModule from "@/store/modules/HalmoonModule";
import TokenHelper from "@/helpers/TokenHelper";
import DeviceHelper from "@/helpers/DeviceHelper.ts";
import DateHelper from "@/helpers/DateHelper.ts";

Vue.component("ApexCharts", VueApexCharts);

@Component
export default class TokenGraph extends Vue {
  @Prop({ required: true }) readonly token!: Token;

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
    const data: number[] = [];
    const labels: string[] = [];

    let dayJump: number;
    let totalIterations: number;

    switch (this.selectedPeriod) {
      case this.timeFrames.week:
        dayJump = 1;
        totalIterations = 7;
        break;
      case this.timeFrames.month:
        dayJump = DeviceHelper.isPhone() ? 7 : 1;
        totalIterations = DeviceHelper.isPhone() ? 4 : 30;
        break;
      case this.timeFrames.year:
        dayJump = DeviceHelper.isPhone() ? 60 : 30;
        totalIterations = DeviceHelper.isPhone() ? 6 : 12;
        break;
      default:
        dayJump = 1;
        totalIterations = 7;
    }

    const dayMilliseconds = 24 * 60 * 60 * 1000 * dayJump;
    const dateObject = new Date();
    const dateTodayEnd =
      new Date(
        `${DateHelper.monthNames[dateObject.getMonth()]} 
      ${dateObject.getDate()} ${dateObject.getFullYear()} 23:59:59`
      ).getTime() + 1000;

    for (let i = totalIterations; i > 0; i--) {
      const dateEnd = dateTodayEnd - i * dayMilliseconds;
      const dateStart = dateEnd - dayMilliseconds;

      const timelogs = TokenHelper.getTimeLogs(this.token, dateStart, dateEnd);
      data.push(timelogs.length);

      const labelDate = new Date(dateEnd);
      let label = "";
      if (this.selectedPeriod === this.timeFrames.year) {
        label = `${labelDate.getMonth() + 1}/${labelDate.getFullYear()}`;
      } else {
        label = `${labelDate.getDate()} ${
          DateHelper.monthNames[labelDate.getMonth()]
        }`;
      }
      labels.push(label);
    }
    return { data, labels };
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
  box-shadow: none;
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
</style>
