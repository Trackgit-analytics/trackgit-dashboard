<template>
  <ApexCharts type="line" :options="chartOptions" :series="series" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import Token from "@/models/interfaces/Token";
import VueApexCharts from "vue-apexcharts";
import HalmoonModule from "@/store/modules/HalmoonModule";

Vue.component("ApexCharts", VueApexCharts);

@Component
export default class TokenGraph extends Vue {
  @Prop({ required: true }) readonly token!: Token;

  /** gets the current app theme (dark/light) */
  get appTheme(): string {
    return HalmoonModule.isDarkMode ? "dark" : "light";
  }

  /** gets chart data */
  get series() {
    return [
      {
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
      }
    ];
  }

  /** gets chart configuration */
  get chartOptions() {
    return {
      chart: {
        toolbar: {
          show: false
        },
        height: "100%",
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
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
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep"
        ],
        axisBorder: {
          show: false,
          color: "#78909C",
          height: 1,
          width: "100%",
          offsetX: 0,
          offsetY: 0
        },
        axisTicks: {
          show: false,
          borderType: "solid",
          color: "#78909C",
          height: 6,
          offsetX: 0,
          offsetY: 0
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
        max:
          10 +
          this.series[0].data.reduce((a, b) => {
            return Math.max(a, b);
          }),
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
      colors: ["#a134ff"],
      fill: {
        type: "gradient",
        gradient: {
          type: "horizontal",
          shadeIntensity: 1,
          gradientToColors: ["#3448ff", "#137af0", "#a134ff", "#3448ff"],
          opacityFrom: 0.5,
          opacityTo: 1,
          colorStops: []
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
</style>
