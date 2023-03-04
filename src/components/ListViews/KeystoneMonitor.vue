<template>
  <div class="HeaderFont">
    <div>Data from last 10 runs:</div>
      <div class="flex justify-around">
          <div>Runs per secound: {{runsPerSec}}</div>
          <div>Average score: {{avgScore}}</div>
          <div>Average level: {{avgLevel}}</div>
          <div>Average success rate: {{avgSuccessRate}}%</div>
      </div>
      
    <div class="flex justify-end">
      <q-btn-toggle
        v-model="monitorRuns"
        class="shadow-24"
        no-caps
        dark
        toggle-color="primary"
        :options="[
          {label: 'On', value: true},
          {label: 'Off', value: false}
        ]"
      />
    </div>

    <runTableView :runs="SortedList" v-if="viewMode === 'table' || true" title="Live runs monitor" />
    <runClassicView :runs="runs" v-else />
  </div>
</template>

<script>
import * as signalR from "@aspnet/signalr";
import runTableView from 'components/ListViews/Tables/runTableView.vue';
import runClassicView from "./Classic/runClassicView.vue";
import sf from "../../SharedFunctions";
import _ from "underscore";
export default {
  props: ["length"],
  components: {
    runTableView,
    runClassicView
  },
  data() {
    return {

      monitorRuns: true,
      runsToShow: 6,
      connection: "",
      runs: [],
      SortedList: []
    };
  },
  methods: {
    viewMode() {
      return sf.GetDefaultView(this, this.GetSettings);
    },
    startMonitor() {
      var vm = this;
      if (vm.connection.state !== 1) {
        if (vm.monitorRuns && (vm.connection.state === 0 || vm.connection.state === 'disconnected')) {
        vm.connection.start();
      } else {
          setTimeout(x => {
        vm.startMonitor();
      }, 1000);    
      }
      
      }
    },
    checkThatMonitorIsRunning() {
      var vm = this;
      setTimeout(x => {
        vm.startMonitor();
        vm.checkThatMonitorIsRunning();
      }, 10000);
    }
  },
  computed: {
      runsPerSec() {
          if (this.SortedList.length > 3) {
              var firstrun = this.SortedList[0]
                var lastrun = this.SortedList[this.SortedList.length -1]
              if ((firstrun.time.created - lastrun.time.created) !== 0) {
                return Math.round(this.SortedList.length / (firstrun.time.created - lastrun.time.created)      * 100 ) / 100
              }
            return "Not fetching atm"
          }
          else {
              return "Not fetching atm"
          }
          
      },
      avgScore() {
          var totalscore = 0;
          for (let i = 0; i < this.SortedList.length; i++) {
              const run = this.SortedList[i];
              totalscore += run.score
          }
          return Math.round(totalscore / this.SortedList.length * 100 ) / 100
      },
      avgLevel() {
        var total = 0;
          for (let i = 0; i < this.SortedList.length; i++) {
              const run = this.SortedList[i];
              total += run.level
          }
          return Math.round(total / this.SortedList.length * 100 ) / 100
      },
      avgSuccessRate() {
           var lsIntime = this.SortedList.filter(x=> x.time.ontime)
          return Math.round((lsIntime.length / this.SortedList.length * 100)* 100) / 100

      },
  },
  created() {
    var apiUrl = this.$store.state.data.apiUrl;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl.slice(0, - 4) + "/KeystoneHub")
      .configureLogging(signalR.LogLevel.Information)
      .build();
    var vm = this;
    this.connection.on("disconnected", x => {
      settimeout(x => {
        vm.startMonitor();
      }, 1000);
    });
  },
  async mounted() {
    var thisVue = this;
    await thisVue.connection.start();
    this.checkThatMonitorIsRunning();
    thisVue.connection.invoke("RequestNewestRuns", 15);
    thisVue.connection.on("GetNewestRuns", function(runs) {
      thisVue.runs = [...runs];
    });

    thisVue.connection.on("NewRunAdded", function(run) {
      thisVue.runs.push(run);
      if (thisVue.runs.length > 20) {
        thisVue.runs = thisVue.runs.slice(
          Math.max(thisVue.runs.length - 20, 1)
        );
      }
    });
  },
  beforeDestroy() {
    this.connection.stop();
  },
  watch: {
    monitorRuns() {
      if (!this.monitorRuns) {
          console.log("Stopping connection..");
        this.connection.stop();
      } else {
          console.log("Starting connection..");
        this.startMonitor()
      }
    },
    runs() {
      var ls = [];
      for (let i = 0; i < this.runs.length; i++) {
        const element = this.runs[i];
        element.index = this.runs.length - i - 1;
        ls.push(element);
      }
      this.SortedList = _.sortBy(ls, x => x.index);
    }
  }
};
</script>
<style scoped>
.newRun {
  background-position: center; /* Center the image */
  background-size: cover; /* Resize the background image to cover the entire container */
  height: 100px;
  background-color: rgb(44, 44, 44);
  border-radius: 25px;
  padding: 10px;
  text-shadow: 1px 1px 1px #000;
  margin: 15px 0;
}
</style>