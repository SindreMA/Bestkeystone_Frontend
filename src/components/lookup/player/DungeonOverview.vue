<template>
  <div class="kc-statlist kc-statlist--stats" style="--statcols: minmax(0, 1fr) 46px 58px 62px 42px 50px;">
    <div class="kc-statlist__head">
      <span>Dungeon statistics</span>
      <span class="kc-statlist__count">{{ runData.length - 1 }} dungeons</span>
    </div>
    <div class="kc-statlist__cols">
      <span class="kc-eyebrow">Dungeon</span>
      <span class="kc-eyebrow r">Key</span>
      <span class="kc-eyebrow r">Score</span>
      <span class="kc-eyebrow r">Avg</span>
      <span class="kc-eyebrow r">Runs</span>
      <span class="kc-eyebrow r">Win</span>
    </div>
    <div class="kc-statlist__scroll">
      <div v-for="row in sortedRows" :key="row.dungeon" class="kc-statlist__row" :class="{ 'kc-statlist__row--all': row.dungeon === 'All' }">
        <span class="kc-statlist__entity">
          <CloudinaryFormat v-if="row.dungeon != 'All'"
            :url="getDungeon(row.item.zone?.id)?.imageurl ?? `backgrounds/dungeons/${row.item.zone.slug}.png`" v-slot="{ link }">
            <img class="kc-statlist__icon" :src="link" />
          </CloudinaryFormat>
          <span v-else class="kc-statlist__icon kc-statlist__icon--all"><i class="material-icons">apps</i></span>
          <span class="kc-statlist__name">{{ row.dungeon === 'All' ? 'All dungeons' : row.item.zone.name }}</span>
        </span>
        <span class="kc-statlist__num kc-statlist__num--hi">+{{ row.highest_lvl }}</span>
        <span class="kc-statlist__num">{{ row.highest_score }}</span>
        <span class="kc-statlist__num">{{ fmtTime(row.avg_time) }}</span>
        <span class="kc-statlist__num">{{ row.runs }}</span>
        <span class="kc-statlist__win" :class="winClass(row.ontime_rate)">{{ row.ontime_rate }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SF, { moment } from '../../../SharedFunctions'
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

const winClass = (r) => (r >= 80 ? 'kc-statlist__win--good' : r >= 55 ? 'kc-statlist__win--mid' : 'kc-statlist__win--bad')
const fmtTime = (ms) => moment.duration(ms).format("mm:ss", { trim: false })
// "All" pinned first as a summary, the rest by run count
const sortedRows = computed(() => [...runData.value].sort((a, b) => {
  if (a.dungeon === 'All') return -1
  if (b.dungeon === 'All') return 1
  return b.runs - a.runs
}))

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
        if (item.highest_lvl < run.keystone_level) item.highest_lvl = run.keystone_level;
        if (item.highest_score < run.score) item.highest_score = Math.floor(run.score);
        totalscore += run.score;
        totallvl += run.keystone_level;
        item.total_time += run.time.clear_time;
        if (run.time.ontime) runsOntime++;
      }

      item.avg_time = item.total_time / item.runs
      item.avg_lvl = Math.floor(totallvl / item.runs);
      item.avg_score = Math.floor(totalscore / item.runs);
      item.ontime_rate = Math.floor((runsOntime / item.runs) * 100);
      rls.push(item);
    }
  }

  return rls;
})

watch(runs, () => { runData.value = GetRuns.value })
onBeforeMount(() => { runData.value = GetRuns.value })
</script>

<style scoped>
.kc-statlist__scroll { max-height: 360px; }
.kc-statlist__icon--all {
  display: grid;
  place-items: center;
  background: var(--bg-inset);
  color: var(--text-mid);
}
.kc-statlist__icon--all .material-icons { font-size: 15px; }
.kc-statlist__row--all { background: var(--bg-raised); }
.kc-statlist__row--all:hover { background: var(--bg-hover); }
</style>
