<template>

  <div id="Box">
    <div id="Header" class="HeaderSize4">
      Dungeon statistics
    </div>
    <div id="Container">
      <q-table :rows-per-page-options="[]" card-class="HeaderFont" table-class="HeaderFont"
        table-header-class="HeaderFont" dark dense :rows="runData" :columns="columns"
        :pagination.sync="paginationControl" row-key="dungeon">
        <template v-slot:body="props">
          <q-tr :props="props" class="text-center">
            <q-td key="dungeon">
              <div class="flex dungeonItem">
                <CloudinaryFormat v-if="props.row.dungeon != 'All'"
                  :url="getDungeon(props.row.item.zone?.id)?.imageurl ?? `backgrounds/dungeons/${props.row.item.zone.slug}.png`" v-slot="{ link }">
                  <q-img class="tableIcon" :src="link" />
                </CloudinaryFormat>
                <i v-else class="material-icons">menu</i>
                <div v-if="props.row.dungeon != 'All'"> {{ props.row.item.zone.name }}</div>
                <div v-else>All</div>
              </div>

            </q-td>
            <q-td key="highest_lvl">
              {{ props.row.highest_lvl }}
            </q-td>
            <q-td key="highest_score">
              {{ props.row.highest_score }}
            </q-td>
            <q-td key="avg_time">
              {{ `${moment.duration(props.row.avg_time).format("hh:mm:ss")}` }}
            </q-td>
            <q-td key="total_time">
              {{ `${moment.duration(props.row.total_time).format("hh:mm:ss")}` }}
            </q-td>
            <q-td key="runs">
              {{ props.row.runs }}
            </q-td>
            <q-td key="intime_rate">
              {{ props.row.ontime_rate }}%
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SF, {moment} from '../../../SharedFunctions'
import CloudinaryFormat from "../../data_formatters/CloudinaryFormat.vue";
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";


const props = defineProps({
  runs: {
    type: Array<any>,
  }
})

const { runs } = toRefs(props)

const store = useStore()
const data = store.state.data

const dungeons = computed(() => data.Dungeons)
const getDungeon = (id) => dungeons.value.find(d => d.keystone_id == id)

const runData = ref([])
const paginationControl = ref({ rowsPerPage: 20, page: 1, sortBy: "dungeon" })
const columns = ref<Array<any>>([
  {
    name: "dungeon", label: "Dungeon", field: x => {


      if (x.dungeon == "All") {
        return "All"
      } else {
        return x.item.zone.name
      }
    }, sortable: true
  },
  {
    name: "highest_lvl",
    label: "Highest level",
    field: "highest_lvl",
    sortable: true
  },
  {
    name: "highest_score",
    label: "Highest score",
    field: "highest_score",
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
  { name: "runs", label: "Runs", field: "runs", sortable: true },
  {
    name: "ontime_rate",
    label: "Success rate",
    field: "ontime_rate",
    sortable: true,
    format: val => `${val}%`
  }
])

const GetRuns = computed(() => {
  var ls = [...runs.value]

  var dungeonRuns = SF.groupBy(ls, x => x.zone.id);
  dungeonRuns["All"] = ls

  var rls = [];

  for (const p in dungeonRuns) {
    if (dungeonRuns.hasOwnProperty(p)) {
      const element = dungeonRuns[p];
      var totalscore = 0;
      var totallvl = 0;

      var runsOntime = 0;

      var item = {
        item: element[0],
        dungeon: p,
        highest_lvl: 0,
        highest_score: 0,
        avg_lvl: 0,
        avg_score: 0,
        avg_time: 0,
        total_time: 0,
        runs: 0,
        ontime_rate: 0
      };

      for (const run of element) {
        item.runs++;
        if (item.highest_lvl < run.keystone_level)
          item.highest_lvl = run.keystone_level;
        if (item.highest_score < run.score) item.highest_score = Math.floor(run.score);
        totalscore += run.score;
        totallvl += run.keystone_level;
        item.total_time += run.time.clear_time;
        if (run.time.ontime) runsOntime++;
      }

      item.avg_time = item.total_time / item.runs//moment.duration(Math.floor(item.total_time / item.runs)).format("hh:mm:ss")

      item.total_time = item.total_time//moment.duration(item.total_time).format("hh:mm:ss");
      item.avg_lvl = Math.floor(totallvl / item.runs);
      item.avg_score = Math.floor(totalscore / item.runs);

      item.ontime_rate = Math.floor((runsOntime / item.runs) * 100);
      rls.push(item);
    }
  }

  return rls;
})


watch(runs, () => {
  runData.value = GetRuns.value
})

onBeforeMount(() => {
  runData.value = GetRuns.value
})
</script>
<style scoped>
#Box {
  border: 1px solid #696969;
  position: relative;
}

#Header {
  background-color: #414141;
  padding: 5px;
}

#Container {}

.tableIcon {
  width: 19px;
  height: 19px;
  margin-right: 2px;
  border-radius: 7px;
  border: 1px grey solid;
}
.dungeonItem {
  gap: 10px;
}
</style>


