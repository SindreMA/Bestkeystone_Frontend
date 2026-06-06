<template>
  <div v-if="cfg" class="kc-ctxbar">
    <div class="kc-ctxbar__inner">
      <span class="kc-eyebrow kc-ctxbar__label">Scope</span>

      <!-- Week + affixes -->
      <button v-if="cfg.week" class="kc-ctxchip">
        <span class="kc-eyebrow kc-ctxchip__k">Week</span>
        <span class="kc-ctxchip__affixes">
          <Affix v-for="(a, i) in currentAffixes" :key="i" :affixid="a" :size="16" :showBreakpoint="false" />
        </span>
        <span class="kc-ctxchip__v">{{ weekLabel }}</span>
        <svg class="kc-ctxchip__chev" v-bind="chev"><path d="M6 9l6 6 6-6" /></svg>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
          <div class="kc-menu__weeks">
            <button v-for="(p, i) in periodes" :key="p.id" class="kc-menu__week" :class="{ 'is-sel': p.id === selectedId }" @click="setWeek(p.id)" v-close-popup>
              <span class="kc-menu__week-label">{{ labelForIndex(i) }}</span>
              <span class="kc-ctxchip__affixes">
                <Affix v-for="(a, j) in (p.affixes || [])" :key="j" :affixid="a" :size="18" :showBreakpoint="false" />
              </span>
            </button>
          </div>
        </q-menu>
      </button>

      <!-- Min keystone level -->
      <button v-if="cfg.min" class="kc-ctxchip">
        <span class="kc-eyebrow kc-ctxchip__k">Min</span>
        <span class="kc-ctxchip__v kc-disp">+{{ minLevel }}</span>
        <svg class="kc-ctxchip__chev" v-bind="chev"><path d="M6 9l6 6 6-6" /></svg>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
          <div class="kc-menu__pad">
            <div class="kc-menu__row">
              <span class="kc-eyebrow">Min keystone level</span>
              <span class="kc-disp kc-ctxchip__accent">+{{ minDraft }}</span>
            </div>
            <input type="range" min="0" max="30" :value="minDraft" class="kc-range"
              @input="minDraft = +($event.target as HTMLInputElement).value" @change="commitMin" />
          </div>
        </q-menu>
      </button>

      <!-- Dungeon scope -->
      <button v-if="cfg.dungeon" class="kc-ctxchip">
        <span class="kc-eyebrow kc-ctxchip__k">Dungeon</span>
        <KcDungeonThumb v-if="selectedDungeon != null" :keystone-id="selectedDungeon" :size="16" />
        <span class="kc-ctxchip__v">{{ selectedDungeonLabel }}</span>
        <svg class="kc-ctxchip__chev" v-bind="chev"><path d="M6 9l6 6 6-6" /></svg>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
          <div class="kc-menu__dungeons">
            <button class="kc-menu__dungeon" :class="{ 'is-sel': selectedDungeon == null }" @click="setDungeon(null)" v-close-popup>
              <span class="kc-menu__dungeon-all">All dungeons</span>
            </button>
            <button v-for="d in dungeonList" :key="d.keystone_id" class="kc-menu__dungeon" :class="{ 'is-sel': d.keystone_id === selectedDungeon }" @click="setDungeon(d.keystone_id)" v-close-popup>
              <KcDungeonThumb :keystone-id="d.keystone_id" :size="22" />
              <span class="kc-menu__dungeon-name">{{ d.name }}</span>
            </button>
          </div>
        </q-menu>
      </button>

      <!-- Score mode -->
      <button v-if="cfg.score" class="kc-ctxchip">
        <span class="kc-eyebrow kc-ctxchip__k">Score</span>
        <span class="kc-ctxchip__v">{{ SCORE_LABEL[scoreMode] }}</span>
        <svg class="kc-ctxchip__chev" v-bind="chev"><path d="M6 9l6 6 6-6" /></svg>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
          <div class="kc-menu__pad kc-menu__score">
            <div class="kc-seg">
              <button v-for="o in SCORE_OPTS" :key="o.v" class="kc-seg__btn" :class="{ 'is-sel': o.v === scoreMode }" @click="setScore(o.v)">{{ o.label }}</button>
            </div>
            <div class="kc-menu__legend">{{ SCORE_LEGEND[scoreMode] }}</div>
          </div>
        </q-menu>
      </button>

      <!-- Sample size (runs per dungeon) -->
      <button v-if="cfg.runs" class="kc-ctxchip">
        <span class="kc-eyebrow kc-ctxchip__k">Sample</span>
        <span class="kc-ctxchip__v">{{ runsLabel(maxRuns) }}</span>
        <svg class="kc-ctxchip__chev" v-bind="chev"><path d="M6 9l6 6 6-6" /></svg>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
          <div class="kc-menu__pad kc-menu__score">
            <div class="kc-eyebrow" style="margin-bottom: 8px;">Runs sampled per dungeon</div>
            <div class="kc-seg">
              <button v-for="o in RUNS_OPTS" :key="o.v" class="kc-seg__btn" :class="{ 'is-sel': o.v === maxRuns }" @click="setRuns(o.v)">{{ o.label }}</button>
            </div>
          </div>
        </q-menu>
      </button>

      <!-- Options (weeks + limit-to-lowest) -->
      <button v-if="cfg.opts" class="kc-ctxchip">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--text-low)" aria-hidden="true"><path d="M3 5h18l-7 8v5l-4 2v-7z" /></svg>
        <span class="kc-ctxchip__v">Options</span>
        <svg class="kc-ctxchip__chev" v-bind="chev"><path d="M6 9l6 6 6-6" /></svg>
        <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
          <div class="kc-menu__pad" style="min-width: 260px;">
            <div class="kc-menu__row">
              <span class="kc-eyebrow">Weeks to show</span>
              <span class="kc-disp kc-ctxchip__accent">{{ weeksDraft }}</span>
            </div>
            <input type="range" min="4" max="60" :value="weeksDraft" class="kc-range"
              @input="weeksDraft = +($event.target as HTMLInputElement).value" @change="commitWeeks" />
            <label class="kc-opt-toggle">
              <input type="checkbox" :checked="limitLowest" @change="toggleLimit" />
              <span>Limit to lowest dungeon's sample</span>
            </label>
            <div class="kc-menu__legend">Caps every dungeon to the smallest sample so comparisons are fair.</div>
          </div>
        </q-menu>
      </button>

      <!-- inline legend for score mode -->
      <span v-if="cfg.score" class="kc-ctxbar__legend">{{ SCORE_LEGEND[scoreMode] }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'src/store'
import Affix from 'components/Icons/Affix/index.vue'
import KcDungeonThumb from 'components/keystone/KcDungeonThumb.vue'

const route = useRoute()
const store = useStore()
const data: any = store.state.data

const chev = { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }

/* which chips show per route (region removed — it isn't a real data filter) */
const cfg = computed(() => {
  const p = route.path
  if (p === '/') return { week: 1, min: 1, score: 1 }
  if (p.startsWith('/statistics/overall')) return null
  if (p.startsWith('/statistics/runs')) return { week: 1 }
  // the dungeons page IS the per-dungeon view, so no dungeon chip there
  if (p.startsWith('/statistics/dungeons')) return { week: 1, min: 1, score: 1, runs: 1, opts: 1 }
  if (p.startsWith('/statistics')) return { week: 1, min: 1, score: 1, runs: 1, opts: 1, dungeon: 1 }
  return null // leaderboard (own filters), monitor (live), lookup, info
})

/* shared reload — refetch the score-driven datasets after a scope change */
function reload() {
  store.commit('SaveReloadTimestamp')
  store.dispatch('fetchDungeonData')
  store.dispatch('fetchSpecData')
}

/* week / periode */
const periodes = computed<any[]>(() => store.getters.GetPeriodes || [])
const selectedId = computed(() => data.SelectedPeriode)
const selectedIdx = computed(() => periodes.value.findIndex((p) => p.id === selectedId.value))
const currentAffixes = computed<number[]>(() => {
  const p = periodes.value[Math.max(0, selectedIdx.value)] || periodes.value[0]
  return (p && p.affixes) || []
})
const labelForIndex = (i: number) => (i === 0 ? 'This week' : i === 1 ? 'Last week' : `Week ${periodes.value[i]?.id ?? ''}`)
const weekLabel = computed(() => labelForIndex(Math.max(0, selectedIdx.value)))
const setWeek = (id: number) => store.commit('ChangeSelectedPeriode', id)

/* dungeon scope — limited to the dungeons active in the selected periode */
const selectedDungeon = computed<number | null>(() => (data.SelectedDungeon ?? null))
const dungeonMeta = computed<any[]>(() => store.getters.GetDungeons || data.Dungeons || [])
const dungeonList = computed<any[]>(() => {
  const active = (data.Dungeons_Data && data.Dungeons_Data.data) || []
  return active.map((d: any) => {
    const meta = dungeonMeta.value.find((m: any) => m.keystone_id === d.id)
    return { keystone_id: d.id, name: meta?.name || `Zone ${d.id}`, short_name: meta?.short_name || meta?.name || `#${d.id}` }
  })
})
const selectedDungeonLabel = computed(() => {
  if (selectedDungeon.value == null) return 'All'
  const d = dungeonList.value.find((x: any) => x.keystone_id === selectedDungeon.value)
  return d?.short_name || d?.name || `#${selectedDungeon.value}`
})
const setDungeon = (id: number | null) => store.commit('ChangeSelectedDungeon', id)

/* ensure the active-dungeon list exists whenever the dungeon chip is shown */
watch(
  () => [route.path, data.SelectedPeriode],
  () => {
    if (cfg.value?.dungeon && data.SelectedPeriode &&
        (!data.Dungeons_Data || data.Dungeons_Data.periode !== data.SelectedPeriode)) {
      store.dispatch('fetchDungeonData')
    }
  },
  { immediate: true }
)

/* min level */
const minLevel = computed<number>(() => data.settings?.min_keystonelevel ?? 10)
const minDraft = ref(minLevel.value)
watch(minLevel, (v) => { minDraft.value = v })
function commitMin() {
  store.commit('SaveSettings', { setting: 'min_keystonelevel', value: minDraft.value })
  reload()
}

/* score mode */
const scoreMode = computed<string>(() => data.settings?.score_type || 'mean')
const setScore = (v: string) => store.commit('SaveSettings', { setting: 'score_type', value: v })
const SCORE_OPTS = [{ v: 'total', label: 'Total' }, { v: 'percent', label: 'Share %' }, { v: 'mean', label: 'Avg/run' }]
const SCORE_LABEL: Record<string, string> = { total: 'Total score', percent: 'Share of meta %', mean: 'Avg per run' }
const SCORE_LEGEND: Record<string, string> = {
  total: 'Sum of M+ score across the sampled runs.',
  percent: "Subject's share of total runs in its peer group — a play-rate share, not score.",
  mean: 'Total score ÷ run count — mean score per run.',
}

/* sample size (max_runs) */
const maxRuns = computed<number>(() => data.settings?.max_runs ?? 5000)
const RUNS_OPTS = [{ v: 10, label: '10' }, { v: 100, label: '100' }, { v: 1000, label: '1k' }, { v: 5000, label: '5k' }]
const runsLabel = (n: number) => (n >= 1000 ? `${n / 1000}k` : `${n}`)
function setRuns(v: number) {
  store.commit('SaveSettings', { setting: 'max_runs', value: v })
  reload()
}

/* options: weeks-to-show + limit-to-lowest */
const weeks = computed<number>(() => data.settings?.WeeksToShow ?? 6)
const weeksDraft = ref(weeks.value)
watch(weeks, (v) => { weeksDraft.value = v })
function commitWeeks() {
  store.commit('SaveSettings', { setting: 'WeeksToShow', value: weeksDraft.value })
  store.dispatch('GetPeriodesData')
}
const limitLowest = computed<boolean>(() => !!data.settings?.limitbylowestdungeon)
function toggleLimit(e: Event) {
  store.commit('SaveSettings', { setting: 'limitbylowestdungeon', value: (e.target as HTMLInputElement).checked })
  reload()
}
</script>

<style scoped>
.kc-ctxbar {
  position: sticky;
  top: 56px;
  z-index: 90;
  height: 40px;
  background: var(--bg-canvas);
  border-bottom: 1px solid var(--line-hairline);
  display: flex;
  align-items: center;
}
.kc-ctxbar__inner {
  width: 100%;
  max-width: var(--content-wide);
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
}
.kc-ctxbar__label { color: var(--text-ghost); flex: none; }

.kc-ctxchip {
  display: inline-flex; align-items: center; gap: 7px; height: 26px; padding: 0 10px;
  border-radius: var(--r-md); background: var(--bg-inset); border: 1px solid var(--line-default);
  cursor: pointer; flex: none; color: var(--text-hi);
}
.kc-ctxchip:hover { background: var(--bg-hover); }
.kc-ctxchip__k { color: var(--text-low); font-size: 10px; }
.kc-ctxchip__v { font-size: 12px; font-weight: 600; color: var(--text-hi); }
.kc-ctxchip__accent { color: var(--accent); font-size: 15px; }
.kc-ctxchip__chev { color: var(--text-low); }
.kc-ctxchip__affixes { display: inline-flex; gap: 3px; align-items: center; }

.kc-ctxbar__legend { margin-left: auto; font-size: 11px; color: var(--text-low); flex: none; padding-right: 4px; }
@media (max-width: 815px) { .kc-ctxbar__legend { display: none; } }

/* popovers */
.kc-menu__weeks { padding: 6px; max-height: 320px; overflow: auto; min-width: 240px; }
.kc-menu__week {
  display: flex; align-items: center; gap: 12px; width: 100%; padding: 9px 10px;
  border-radius: var(--r-sm); background: transparent; border: none; cursor: pointer; text-align: left;
}
.kc-menu__week.is-sel { background: var(--accent-quiet); }
.kc-menu__week:hover { background: var(--bg-hover); }
.kc-menu__week-label { font-size: 13px; font-weight: 600; color: var(--text-hi); min-width: 88px; }
.kc-menu__week .kc-ctxchip__affixes { margin-left: auto; }

.kc-menu__dungeons { padding: 6px; max-height: 340px; overflow: auto; min-width: 230px; }
.kc-menu__dungeon {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px;
  border-radius: var(--r-sm); background: transparent; border: none; cursor: pointer; text-align: left;
}
.kc-menu__dungeon.is-sel { background: var(--accent-quiet); }
.kc-menu__dungeon:hover { background: var(--bg-hover); }
.kc-menu__dungeon-name { font-size: 13px; font-weight: 500; color: var(--text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-menu__dungeon-all { font-size: 13px; font-weight: 600; color: var(--text-hi); }

.kc-menu__pad { padding: 14px; min-width: 240px; }
.kc-menu__row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.kc-menu__score { min-width: 300px; }
.kc-menu__legend { margin-top: 10px; font-size: 12px; color: var(--text-mid); line-height: 1.5; }

.kc-range { width: 100%; height: 4px; accent-color: var(--accent); background: var(--bg-inset); border-radius: 9999px; }

.kc-opt-toggle { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 13px; color: var(--text-hi); cursor: pointer; }
.kc-opt-toggle input { accent-color: var(--accent); width: 16px; height: 16px; }

.kc-seg { display: inline-flex; background: var(--bg-inset); border-radius: var(--r-md); border: 1px solid var(--line-default); padding: 2px; gap: 2px; }
.kc-seg__btn {
  height: 26px; padding: 0 12px; border-radius: var(--r-sm); border: none; cursor: pointer;
  font: 500 12px/1 var(--font-ui); background: transparent; color: var(--text-mid);
}
.kc-seg__btn.is-sel { background: var(--bg-active); color: var(--text-hi); box-shadow: inset 0 0 0 1px var(--line-strong); font-weight: 600; }

@media (max-width: 600px) {
  .kc-ctxbar__inner { padding: 0 12px; gap: 6px; }
  .kc-ctxchip { height: 34px; padding: 0 12px; }
  .kc-menu__score, .kc-menu__pad, .kc-menu__weeks { min-width: 0; width: min(300px, calc(100vw - 24px)); }
}
</style>
