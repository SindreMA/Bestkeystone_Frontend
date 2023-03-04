<template>
  <div>
    <div>
      Value Type
      <q-btn-toggle
        v-model="mode"
        :options="[
          { label: 'Runs', value: 'runs' },
          { label: 'Hours', value: 'hours' }
        ]"
      />
    </div>

    <div>
      Data per
      <q-btn-toggle
        v-model="type"
        :options="[
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' }
        ]"
      />
    </div>
    <apexchart
      v-if="getSeries()"
      width="1100px"
      height="400px"
      :options="Options"
      :series="getSeries()"
      type="area"
    ></apexchart>
  </div>
</template>
<script>
import _ from "underscore";
import SF, {moment} from '../../SharedFunctions'

export default {
  props: ["runs"],
  data() {
    return {
      type: "week",
      mode: "runs"
    };
  },
  computed: {
    Options() {
      var vm = this;
      var settings = {
        chart: {
          foreColor: "#a1a1a1"
        },
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function(value, timestamp, index) {
              return `${Math.round(value)}`;
            }
          },
          title: {
            text: "week id"
          }
        },
        yaxis: {
          type: "numeric",
          labels: {
            formatter: function(value, timestamp, index) {
              return vm.formatYaxis(value);
            }
          },
          title: {
            text: "Hours played"
          }
        }
      };
      return settings;
    }
  },
  methods: {
    formatYaxis(value) {
      if (this.mode === "hours") {
        return `${Math.round((moment.duration(value).format("mm") / 60) * 10) /
          10}`;
      } else if (this.mode === "runs") {
        return `${value}`;
      }
    },
    getSeries() {
      var t_ls = [];
      var r_ls = [];

      var groups = _.groupBy(this.runs, function(run) {
        return run["periode"];
      });

      for (const key in groups) {
        if (groups.hasOwnProperty(key)) {
          const daygroup = groups[key];

          var runs = 0;
          var durationForTheDay = 0;
          for (let i = 0; i < daygroup.length; i++) {
            const run = daygroup[i];
            durationForTheDay += run.clear_time;
            runs++;
          }
          var hoursPlayed = [parseInt(key), durationForTheDay];
          t_ls.push(hoursPlayed);

          var runsCompleted = [parseInt(key), runs];
          r_ls.push(runsCompleted);
        }
      }
      if (this.mode === "hours") {
        return [
          {
            name: "Hours: ",
            data: t_ls
          }
        ];
      } else if (this.mode === "runs") {
        return [{ name: "Runs: ", data: r_ls }];
      }
    }
  }
};
</script>

