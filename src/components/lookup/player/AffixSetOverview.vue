<template>
  <div id="Box">
    <div id="Header" class="HeaderSize4">
      Affix combonations statistics
    </div>
    <div id="Container">
      <q-table :rows-per-page-options="[]" card-class="HeaderFont" table-class="HeaderFont"
        table-header-class="HeaderFont" dark dense :rows="runData" :columns="columns"
        :pagination.sync="paginationControl" row-key="affixCombo">
        <template v-slot:body="props">
          <q-tr :props="props" class="text-center">
            <q-td key="affix">
              <div class="flex justify-around">
                <div class="flex affixItem" v-for="(affix, index) in props.row.affix?.affixes" :key="index">
                  <Affix :affixid="affix?.id" :border="true" size="13px" class="tableIcon" />
                  <div> {{ affix?.name }}</div>
                </div>
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
import Affix from 'components/Icons/Affix/index.vue'
import { computed, onBeforeMount, ref, toRefs, watch } from 'vue'
import { useStore } from 'src/store'

const props = defineProps({
  runs: {
    type: Array<any>,
  },
  from: {},
  to: {}
})

const { runs, from, to } = toRefs(props)

const runData = ref([])
const paginationControl = ref({ rowsPerPage: 20, page: 1, sortBy: "affix" })
const columns = ref<Array<any>>([
  {
    name: "affix", label: "Affix", field: row => row.affix?.affix, sortable: true,
    align: 'center',
  },
  {
    name: "highest_lvl",
    label: "Highest level",
    field: "highest_lvl",
    sortable: true,
    align: 'center',
  },
  {
    name: "highest_score",
    label: "Highest score",
    field: "highest_score",
    sortable: true,
    align: 'center',
  },
  {
    name: "total_time",
    label: "Total time",
    field: "total_time",
    sortable: true,
    format: val => `${moment.duration(val).format("hh:mm:ss")}`,
    align: 'center',

  },
  {
    name: "runs", label: "Runs", field: "runs", sortable: true,
    align: 'center',
  },
  {
    name: "ontime_rate",
    label: "Success rate",
    field: "ontime_rate",
    sortable: true,
    format: val => `${val}%`,
    align: 'center',
  }
])

const GetAffixdetails = (id) => {
  for (let i = 0; i < GetAffixes.value.length; i++) {
    const affix = GetAffixes.value[i];
    if (affix?.id === id) {
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

    var affixString = item.affixes.map(x => GetAffixdetails(x)?.name).join(' ')
    var exist = false
    for (let p = 0; p < als.length; p++) {
      const _affix = als[p];

      if (_affix?.affix === affixString) {
        _affix?.runs.push(item)
        exist = true
      }
    }
    if (!exist) {
      var _new = { affix: affixString, runs: [item], affixes: item.affixes.map(x => GetAffixdetails(x)) }
      als.push(_new)
    }

  }
  var rls = [];

  for (let i = 0; i < als.length; i++) {
    const element = als[i];
    var totalscore = 0;
    var totallvl = 0;

    var runsOntime = 0;

    var item = {
      affix: element,
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
}
.affixItem {
  gap: 10px;
  width: 120px;
}
</style>


