<template>
  <div class="kc-statlist kc-statlist--stats" style="--statcols: minmax(0, 1fr) 46px 58px 62px 42px 50px;">
    <div class="kc-statlist__head">
      <span>Affix statistics</span>
      <span class="kc-statlist__count">{{ runData.length }} affixes</span>
    </div>
    <div class="kc-statlist__cols">
      <span class="kc-eyebrow">Affix</span>
      <span class="kc-eyebrow r">Key</span>
      <span class="kc-eyebrow r">Score</span>
      <span class="kc-eyebrow r">Time</span>
      <span class="kc-eyebrow r">Runs</span>
      <span class="kc-eyebrow r">Win</span>
    </div>
    <div class="kc-statlist__scroll">
      <div v-for="row in sortedRows" :key="row.affix?.id" class="kc-statlist__row">
        <span class="kc-statlist__entity">
          <span class="kc-statlist__icon kc-statlist__icon--affix">
            <affix :affixid="row.affix?.id" :size="20" :border="true" />
          </span>
          <span class="kc-statlist__name">{{ row.affix?.name }}</span>
        </span>
        <span class="kc-statlist__num kc-statlist__num--hi">+{{ row.highest_lvl }}</span>
        <span class="kc-statlist__num">{{ row.highest_score }}</span>
        <span class="kc-statlist__num">{{ fmtTime(row.total_time) }}</span>
        <span class="kc-statlist__num">{{ row.runs }}</span>
        <span class="kc-statlist__win" :class="winClass(row.ontime_rate)">{{ row.ontime_rate }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SF, { moment } from '../../../SharedFunctions'
import { useStore } from 'src/store'
import { computed, onBeforeMount, ref, toRefs, watch } from 'vue'
import affix from '../../Icons/Affix/index.vue'

const props = defineProps({
  runs: {
    type: Array<any>,
  },
  from: {},
  to: {}
})
const { runs, from, to } = toRefs(props)

const runData = ref([])

const winClass = (r) => (r >= 80 ? 'kc-statlist__win--good' : r >= 55 ? 'kc-statlist__win--mid' : 'kc-statlist__win--bad')
const fmtTime = (ms) => moment.duration(ms).format("hh:mm:ss")
const sortedRows = computed(() => [...runData.value].sort((a, b) => b.runs - a.runs))

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

watch(runs, () => {
  runData.value = GetRuns.value
})

onBeforeMount(() => {
  runData.value = GetRuns.value
})
</script>

<style scoped>
.kc-statlist__scroll { max-height: 360px; }
/* affix component renders its own bordered icon; wrap it so it sits at ~24px like DungeonOverview's thumb */
.kc-statlist__icon--affix {
  border: none;
  background: none;
  display: grid;
  place-items: center;
  overflow: visible;
}
</style>
