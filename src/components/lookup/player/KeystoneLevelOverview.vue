<template>
<div id="Box">
    <div id="Header" class="HeaderSize4">
    Keystone level statistics
    </div>
    <div id="Container">
<q-table :rows-per-page-options="[]" class="TabledWindow" card-class="HeaderFont"
      table-class="HeaderFont"
      table-header-class="HeaderFont" dark dense :rows="runData" :columns="columns" :pagination.sync="paginationControl" row-key="level"/>

    </div>
  </div>
</template>
<script>
import SF, {moment} from '../../../SharedFunctions'

export default {
     watch: {
    runs() {
      this.runData = this.GetRuns
    }
  },
  created() {
    this.runData = this.GetRuns
  },
  props: ["runs"],
  data() {
    return {
      runData: [],
            paginationControl: { rowsPerPage: 10, page: 1 },
      columns: [
        { name: "level", label: "Level", field: "level", sortable: true, format: val => parseInt(val)},
        {
          name: "runs",
          label: "Runs",
          field: "runs",
          sortable: true,
          format: val => parseInt(val)
        },
        {
          name: "avg_score",
          label: "Average score",
          field: "avg_score",
          sortable: true
        },
        {
          name: "avg_time",
          label: "Average time",
          field: "avg_time",
          sortable: true,
          format: val => `${moment.duration(val).format("hh:mm:ss")}`
        },
        {
          name: "total_time",
          label: "Total time",
          field: "total_time",
          sortable: true,
          format: val => `${moment.duration(val).format("hh:mm:ss")}`
        },
        {
          name: "ontime_rate",
          label: "Success rate",
          field: "ontime_rate",
          sortable: true,
          format: val => `${val}%`
        }
      ]
    };
  },
  computed: {
    GetRuns() {
      var ls = this.runs
   var dungeonRuns = SF.groupBy(ls, "keystone_level");

      var rls = [];

      for (const p in dungeonRuns) {
        if (dungeonRuns.hasOwnProperty(p)) {
          const element = dungeonRuns[p];
          var totalscore = 0;
          var runsOntime = 0;

          var item = {
            level: element[0].keystone_level,
            avg_score: 0,
            avg_time: 0,
            total_time: 0,
            runs: 0,
            ontime_rate: 0
          };
          for (const run of element) {
            item.runs++;
            totalscore += run.score;
            item.total_time += run.time.clear_time;
            if (run.time.ontime) runsOntime++;
          }
          item.avg_time = item.total_time / item.runs//moment.duration(Math.floor(item.total_time / item.runs)).format("hh:mm:ss")

          item.total_time = item.total_time//moment.duration(item.total_time).format("hh:mm:ss");

          item.avg_score = Math.floor(totalscore / item.runs);

          item.ontime_rate = Math.floor((runsOntime / item.runs) * 100);
          rls.push(item);
        }
      }

      return rls;
    }
  },
  methods: {}
};
</script>
<style >
.TabledWindow {
}

#Box {
  border: 1px solid #696969;
  position: relative;
}

#Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
}
</style>


