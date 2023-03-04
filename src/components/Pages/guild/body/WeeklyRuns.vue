<template>
  <div>
      <affixSelector :hidePictures="true" @changed="SetPeriode($event)" :value="periode" localMode="true" />
    <q-table
      :rows="guildMembers.filter(x=> (showType === 1) || (showType === 2 && GetRuns(x).length != 0) || (showType === 3 && GetRuns(x).length === 0) )"
      :columns="columns"
      row-key="id"
      title="Weekly runs"
      dark
      color="amber"
      :pagination="initialPagination"
    >
      <template v-slot:top>
        <div class="HeaderFont HeaderSize4 row">Weekly Runs</div>
        <div style="width: 100%">
          <div class="flex justify-center">
            <q-option-group v-model="showType" inline :options="showTypeOptions" color="grey" />
            <q-range
              v-model="levelFilter"
              color="grey"
              label
              dense
              :min="2"
              :max="35"
            ></q-range>
          </div>
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="rank" :props="props">{{props.row.rank}}</q-td>
          <q-td :style="`color: ${getClass(props.row._class)?.color}`" key="player" :props="props">
            <q-img
              spinner-size="15px"
              spinner-color="white"
              class="tableIcon"
              :src="getClass(props.row._class).icon_url"
            />
            <a
              :href="`/lookup/player/${region}/${props.row.realm}/${props.row.name}`"
            >{{ props.row.name }}</a>
          </q-td>
          <q-td key="runs" :props="props">
            <template>{{props.colsMap.runs.field(props.row)}}</template>
          </q-td>
          <q-td key="hkey" :props="props">
            <template v-if="props.colsMap.hkey.field(props.row)">+{{props.colsMap.hkey.field(props.row)}}</template>
          </q-td>
          <q-td key="score" :props="props">{{props.colsMap.score.field(props.row)}}</q-td>
        </q-tr>
      </template>
    </q-table>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import affixSelector from "../../../ListViews/AffixSelector.vue";
import SF from "../../../../SharedFunctions";
export default {
  components: {
    affixSelector
  },
  props: ["guildMembers", "region"],
  data() {
    return {
      showType: 1,
      showTypeOptions: [
        {
          label: "All",
          value: 1
        },
        {
          label: "Hide slackers",
          value: 2
        },
        {
          label: "Show only slackers",
          value: 3
        }
      ],
      levelFilter: {
        min: 2,
        max: 35
      },
      periode: null,
      initialPagination: {
        sortBy: "runs",
        descending: true,
        rowsPerPage: 7
      },
      columns: [
        {
          name: "rank",
          align: "left",
          label: "Rank",
          field: "rank",
          sortable: true,
          sort: (a, b) => a - b
        },
        {
          name: "player",
          align: "left",
          label: "Player",
          field: "name",
          sortable: true,
          sort: (a, b) => a - b
        },
        {
          name: "runs",
          align: "left",
          label: "Weekly runs",
          field: x => this.GetRuns(x).length,
          sortable: true
        },
        {
          name: "hkey",
          align: "left",
          label: "Highest key",
          field: x => this.GetRuns(x).map(x=> x.keystone_level).sort((a,b)=> a - b).reverse()[0],
          sortable: true
        },
        {
          name: "score",
          label: "Weekly score",
          format: x => Math.round(x),
          field: x => this.GetScore(x),
          sortable: true,
          sort: (a, b) => a - b
        }
      ]
    };
  },
  computed: {
    ...mapGetters(["GetSpecs", "GetClasses", "SelectedPeriode"])
  },
  watch: {
    SelectedPeriode() {
      if (this.SelectedPeriode) {
        this.SetPeriode(this.SelectedPeriode.id)
      }
    }
  },
  created() {
    if (this.SelectedPeriode) {
        this.SetPeriode(this.SelectedPeriode.id)
      }
  },
  methods: {
    SetPeriode(id) {
      this.periode = id;
    },
    GetRuns(row,props) {
      var vm = this;
      if (row.run_data && row.run_data.runs && row.run_data.runs.length != 0) {
        return row.run_data.runs.filter(x => {
          if (x.periode === vm.periode) {
            if (
              x.keystone_level > vm.levelFilter.min &&
              x.keystone_level < vm.levelFilter.max
            ) {
              return true;
            }
          }
        });
      }
      return [];
    },
    GetScore(row) {
      if (row.run_data && row.run_data.runs && row.run_data.length != 0) {
        var bestRuns = this.getTopDungeonRuns(this.GetRuns(row));
        var score = bestRuns.map(x => x.score).reduce((a, b) => a + b, 0);
        return Math.round(score);
      }
      return 0;
    },
    getTopDungeonRuns(runs) {
      var rls = [];

      var dungeons = SF.groupBy(runs, x => x.zone.id);
      for (const p in dungeons) {
        if (dungeons.hasOwnProperty(p)) {
          const dungeonruns = dungeons[p];
          var sortedList = SF._sortBy(dungeonruns, "score").reverse();
          rls.push(sortedList[0]);
        }
      }
      return rls;
    },
    filterdRuns(runs, time) {
      var ls = [];
      for (let i = 0; i < runs.length; i++) {
        const element = runs[i];
        if (time == null) {
          ls.push(element);
        } else {
          if (
            element.time.completed_timestamp > time.start &&
            element.time.completed_timestamp < time.end
          ) {
            ls.push(element);
          }
        }
      }
      return ls;
    },
    getClass(id) {
      if (this.GetClasses) {
        for (let i = 0; i < this.GetClasses.length; i++) {
          const _class = this.GetClasses[i];
          if (_class.id == id) {
            return _class;
          }
        }
      }
    },
    getSpec(id) {
      if (this.GetSpecs) {
        for (let i = 0; i < this.GetSpecs.length; i++) {
          const spec = this.GetSpecs[i];
          if (spec.id == id) {
            return spec;
          }
        }
      }
    }
  }
};
</script>

<style scouped>
a {
  color: inherit; /* blue colors for links too */
  text-decoration: inherit; /* no underline */
}

.tableIcon {
  width: 25px;
  height: 25px;
}
.crownIcon {
  width: 15px;
  height: 15px;
}
</style>
