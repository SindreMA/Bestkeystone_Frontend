<template>
  <div v-if="data">
    <div id="chart">
      <apexchart
        type="bar"
        :height="calculateHeight"
        :options="chartOptions"
        :series="generateSeries"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import numeral from "numeral";
import axios from "axios";
import moment from "moment";
import SF from "../../../SharedFunctions";

export default {
  props: ["data"],
  data() {
    return {
      chartOptions: {
        chart: {
          foreColor: "#a1a1a1",
          stacked: true,
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        colors: ["#26a69a", "#696969"],
        dataLabels: {
          formatter: function(val, opt) {
              if (val.affix) {
                  
              }
            return numeral(val).format("0.0a");
          }
        },
        yaxis: {
          labels: {
            formatter: function(val) {
              return numeral(val).format("0,0");
            }
          },
          title: {
            text: "Runs completed"
          }
        },
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        fill: {
          opacity: 1
        }
      }
    };
  },
  methods: {
    ...mapMutations(["AddAffixDetails"]),
    GetAffixdetails(id) {
      if (this.GetAffixes) {
        for (let i = 0; i < this.GetAffixes.length; i++) {
          const affix = this.GetAffixes[i];
          if (affix.id === id) {
            return affix;
          }
        }
      }
    },
    GetAffixSetName(affixes) {
      if (affixes) {
        var ls = [];
        for (let i = 0; i < affixes.length; i++) {
          const element = affixes[i];
          var affix = this.GetAffixdetails(element);

          if (affix) {
            ls.push(affix.name);
          }
        }
        return ls.join(", ");
      }
    },
    fetchAffixDetails(id) {
        var vm = this
      var apiUrl = this.$store.state.data.apiUrl;
        axios.get(`${apiUrl}/Periode/id?Period=${id}`).then(x => {
          if (x.data) {
              var data = x.data
              data.details = vm.GetAffixdetails(id)
              vm.AddAffixDetails(x.data)
          }
      });
    }
  },
  computed: {
    ...mapGetters(["GetPeriodes", "GetAffixes", "GetAffixDetails"]),
    calculateHeight() {
      return 100 + this.calculateTotal.length * 35;
    },
    calculateTotal() {
      var ls = [];

      for (let i = 0; i < this.data.length; i++) {
        const week = this.data[i];
        var newWeekItem = {
          week: week[0].periode,
          created: week[0].created,
          runs: 0,
          score: 0,
          onTimeRuns: 0
        };
        var vm = this;
        var affixDetails = this.GetAffixDetails.filter(x=> {return x.id == newWeekItem.week})
        if (affixDetails.length != 0) {
            newWeekItem.affix = affixDetails[0]
        } else {
            this.fetchAffixDetails(newWeekItem.week)
        }

        for (let o = 0; o < week.length; o++) {
          const levelStats = week[o];
          newWeekItem.runs += levelStats.runs;
          newWeekItem.onTimeRuns += Math.round(
            levelStats.runs * (levelStats.success_rate / 100)
          );
          newWeekItem.score += levelStats.score;
        }

        ls.push(newWeekItem);
      }
      var sortedLs = SF._sortBy(ls, "week").reverse();

      return sortedLs;
    },
    generateSeries() {
      var onTime = [];
      var notOnTime = [];
      var weeks = [];
      for (let i = 0; i < this.calculateTotal.length; i++) {
        const week = this.calculateTotal[i];
        onTime.push(week.onTimeRuns);
        weeks.push(week.week);
        notOnTime.push(week.runs - week.onTimeRuns);
      }
      this.chartOptions.xaxis = {
        type: "string",
        categories: weeks,
        title: {
          text: "Per Week"
        }
      };
      return [
        {
          name: "On time",
          data: onTime
        },
        {
          name: "Not on time",
          data: notOnTime
        }
      ];
    }
  }
};
</script>
<style scouped>
</style>