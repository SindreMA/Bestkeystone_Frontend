<template>
  <div id="Box">
    <div id="Header" class="HeaderSize4">
      Affix statistics
    </div>
    <div id="Container">
      <q-table :rows-per-page-options="[]" card-class="HeaderFont" table-class="HeaderFont"
        table-header-class="HeaderFont" dark dense :rows="runData" :columns="columns"
        :pagination.sync="paginationControl" row-key="affix">
        <template v-slot:body="props">
          <q-tr :props="props" class="text-center">
            <q-td key="affix">
              <div class="flex tableIconContainer">
                <affix :affixid="props.row.affix.id" size="13px" :border="true" class="tableIcon" />
                <div> {{ props.row.affix.name }}</div>
              </div>

            </q-td>
            <q-td key="highest_lvl">
              {{ props.row.highest_lvl }}
            </q-td>
            <q-td key="highest_score">
              {{ props.row.highest_score }}
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
import { useStore } from 'src/store'
import { computed, onBeforeMount, ref, toRef, toRefs, watch } from 'vue'
import affix from '../../Icons/Affix/index.vue'

const props = defineProps({
  runs: {
    type: Array<any>,
  },
  from: {},
  to: {}
})
const { runs, from, to } = toRefs(props)
watch(runs, () => {
  runData.value = GetRuns.value
})

onBeforeMount(() => {
  runData.value = GetRuns.value
})


const runData = ref([])
const paginationControl = ref({ rowsPerPage: 20, page: 1, sortBy: "affix" })
const columns = ref<Array<any>>([
  { name: "affix", label: "Affix", field: row => row.affix.name, sortable: true, align: "center" },
  {
    name: "highest_lvl",
    label: "Highest level",
    field: "highest_lvl",
    sortable: true, align: "center"
  },
  {
    name: "highest_score",
    label: "Highest score",
    field: "highest_score",
    sortable: true, align: "center"
  },
  {
    name: "total_time",
    label: "Total time",
    field: "total_time", align: "center",
    sortable: true,
    format: val => `${moment.duration(val).format("hh:mm:ss")}`

  },
  { name: "runs", label: "Runs", field: "runs", sortable: true, align: "center" },
  {
    name: "ontime_rate",
    label: "Success rate",
    field: "ontime_rate",
    sortable: true,
    format: val => `${val}%`, align: "center"
  }
])

const GetAffixdetails = (id) => {
  for (let i = 0; i < GetAffixes.value.length; i++) {
    const affix = GetAffixes.value[i];
    if (affix.id === id) {
      return affix
    }
  }
}

const store = useStore()
const data = store.state.data
const GetAffixes = computed(() => data.Affixes)

const GetRuns = computed(() => {
  var ls = [...runs.value]
  var als = []
  for (let i = 0; i < ls.length; i++) {
    const item = ls[i];
    var affixes = item.affixes
    var amountAffixes = 4
    if (item.keystone_level <= 3) {
      amountAffixes = 1
    } else if (item.keystone_level <= 6) {
      amountAffixes = 2
    } else if (item.keystone_level <= 9) {
      amountAffixes = 3
    } else if (item.keystone_level >= 10) {
      amountAffixes = 4


    }
    for (let o = 0; o < amountAffixes; o++) {
      const affix = affixes[o];

      var exist = false
      for (let p = 0; p < als.length; p++) {
        const _affix = als[p];

        if (_affix.affix === affix) {
          _affix.runs.push(item)
          exist = true
        }
      }
      if (!exist) {
        var _new = { affix: affix, runs: [item] }
        als.push(_new)
      }
    }
  }
  var rls = [];

  for (let i = 0; i < als.length; i++) {
    const element = als[i];
    var totalscore = 0;
    var totallvl = 0;

    var runsOntime = 0;

    var item = {
      affix: GetAffixdetails(element.affix),
      highest_lvl: 0,
      highest_score: 0,
      avg_lvl: 0,
      avg_score: 0,
      avg_time: 0,
      total_time: 0,
      runs: 0,
      ontime_rate: 0
    };
    for (const run of element.runs) {
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


  return rls;
})
</script>

<style scoped>
.tableIcon {
  width: 19px;
  height: 19px;
  margin-right: 2px;

}

#Box {
  border: 1px solid #696969;
}

#Header {
  background-color: #414141;
  padding: 5px;
}

#Container {}
.tableIconContainer {
  gap: 10px;
}
</style>


