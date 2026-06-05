<template>
  <KcCard :level="1" header="Best week for each dungeon">
    <template #headerRight>
      <div class="kc-seg">
        <button v-for="m in METRICS" :key="m.v" class="kc-seg__btn" :class="{ 'is-sel': m.v === metric }" @click="metric = m.v">{{ m.label }}</button>
      </div>
    </template>

    <!-- range selector -->
    <div v-if="range" class="kc-bw__range">
      <div class="kc-bw__range-end">
        <span class="kc-eyebrow">From · {{ fmtDate(periodeDetails(range.min)) }}</span>
        <span class="kc-bw__affixes"><Affix v-for="(a, i) in affixesOf(range.min)" :key="i" :affixid="a" :size="22" :showBreakpoint="false" /></span>
      </div>
      <div class="kc-bw__range-mid">
        <span class="kc-disp kc-tnum kc-bw__range-num">{{ range.max - range.min }}</span>
        <span class="kc-eyebrow">weeks</span>
      </div>
      <div class="kc-bw__range-end kc-bw__range-end--right">
        <span class="kc-eyebrow">To · {{ fmtDate(periodeDetails(range.max)) }}</span>
        <span class="kc-bw__affixes"><Affix v-for="(a, i) in affixesOf(range.max)" :key="i" :affixid="a" :size="22" :showBreakpoint="false" /></span>
      </div>
    </div>
    <q-range v-if="allPeriodes && range" v-model="range" :min="allPeriodes[0].id" :max="allPeriodes[allPeriodes.length - 1].id" :step="1" color="primary" class="kc-bw__slider" />

    <!-- dungeon grid -->
    <div v-if="dungeonRows.length" class="kc-bw__grid">
      <div v-for="d in dungeonRows" :key="d.dungeon" class="kc-bw__cell">
        <KcDungeonThumb :keystone-id="d.dungeon" :size="40" />
        <div class="kc-bw__cell-main">
          <div class="kc-bw__cell-name">{{ dungeonName(d.dungeon) }}</div>
          <div class="kc-bw__cell-week">
            <span class="kc-mono kc-bw__cell-wk">wk {{ best(d.list).periode }}</span>
            <span class="kc-bw__affixes"><Affix v-for="(a, i) in affixesOf(best(d.list).periode)" :key="i" :affixid="a" :size="16" :showBreakpoint="false" /></span>
          </div>
        </div>
        <span class="kc-disp kc-tnum kc-bw__cell-val">{{ metricValue(best(d.list)) }}</span>
      </div>
    </div>
    <div v-else class="kc-bw__loading"><q-skeleton v-for="i in 6" :key="i" height="64px" /></div>

    <!-- best overall -->
    <div v-if="overall" class="kc-bw__overall">
      <span class="kc-eyebrow">Best overall week</span>
      <span class="kc-bw__affixes"><Affix v-for="(a, i) in affixesOf(best(overall).periode)" :key="i" :affixid="a" :size="34" :showBreakpoint="false" :tooltip="true" /></span>
      <span class="kc-disp kc-tnum kc-bw__overall-val">{{ metricValue(best(overall)) }}</span>
    </div>
  </KcCard>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import SF from 'src/SharedFunctions'
import { useKc } from './useKc'
import KcCard from './KcCard.vue'
import KcDungeonThumb from './KcDungeonThumb.vue'
import Affix from 'components/Icons/Affix/index.vue'

const { data, dungeonByKeystoneId } = useKc()

const METRICS = [{ v: 'success', label: 'Success' }, { v: 'total', label: 'Total' }, { v: 'avg', label: 'Avg' }]
const metric = ref('success')

const allPeriodes = ref<any[]>([])
const range = ref<{ min: number; max: number } | null>(null)
const rows = ref<any[]>([])
let debounce: ReturnType<typeof setTimeout> | null = null

function fetchPeriodes() {
  if (!data.apiUrl) return
  axios.get(`${data.apiUrl}/Periode?weeks=50`).then((r) => {
    allPeriodes.value = SF._sortBy(r.data, 'id')
    const last = allPeriodes.value[allPeriodes.value.length - 1].id
    range.value = { min: last - 10, max: last }
    fetchData()
  }).catch((e) => console.log(e))
}
function fetchData() {
  if (!data.apiUrl || !range.value) return
  axios.get(`${data.apiUrl}/Dungeon/BestAffixSetPerDungeon?fromPeriode=${range.value.min}&toPeriode=${range.value.max}`)
    .then((r) => {
      const out: any[] = []
      for (const entry of (r.data || []).map((x: any) => x.list)) {
        const list = (entry || []).map((d: any) => ({ ...d }))
        if (list.length) out.push({ dungeon: list[0].zone ?? null, list })
      }
      rows.value = out
    }).catch((e) => console.log(e))
}
onMounted(fetchPeriodes)
watch(range, () => {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(fetchData, 600)
}, { deep: true })

const dungeonRows = computed(() => rows.value.filter((r) => r.dungeon != null && r.dungeon !== -2))
const overall = computed<any>(() => {
  const o = rows.value.find((r) => r.dungeon == null || r.dungeon === -2)
  return o ? o.list : null
})

const valueOf = (rec: any) => (metric.value === 'success' ? (rec.success_rate ?? 0) : metric.value === 'avg' ? (rec.runs ? rec.score / rec.runs : 0) : rec.score)
const best = (list: any[]) => (list && list.length ? [...list].sort((a, b) => valueOf(b) - valueOf(a))[0] : {})
const metricValue = (rec: any) => {
  if (!rec || rec.score == null) return '—'
  if (metric.value === 'success') return `${Math.round(rec.success_rate ?? 0)}%`
  if (metric.value === 'avg') return rec.runs ? Math.round(rec.score / rec.runs) : 0
  return Math.round(rec.score).toLocaleString('en-US')
}

const periodeDetails = (id: number) => allPeriodes.value.find((p) => p.id === id)
const affixesOf = (id: number) => periodeDetails(id)?.affixes || []
const dungeonName = (zone: number) => dungeonByKeystoneId(zone)?.name || `Zone ${zone}`
const fmtDate = (p: any) => (p?.start_timestamp ? SF.GetMoment(p.start_timestamp).format('MMM D') : '—')
</script>

<style scoped>
.kc-bw__range { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; margin-bottom: 8px; }
.kc-bw__range-end { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.kc-bw__range-end--right { align-items: flex-end; text-align: right; }
.kc-bw__range-mid { display: flex; flex-direction: column; align-items: center; }
.kc-bw__range-num { font-size: 20px; font-weight: 700; color: var(--kc-accent); }
.kc-bw__affixes { display: inline-flex; gap: 3px; align-items: center; }
.kc-bw__slider { margin: 4px 8px 20px; }

.kc-bw__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--kc-sp-4); }
@media (max-width: 980px) { .kc-bw__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .kc-bw__grid { grid-template-columns: 1fr; } }
.kc-bw__cell { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--kc-bg-inset); border: 1px solid var(--kc-line-hairline); border-radius: var(--kc-r-md); }
.kc-bw__cell-main { flex: 1; min-width: 0; }
.kc-bw__cell-name { font-size: 13px; font-weight: 600; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-bw__cell-week { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.kc-bw__cell-wk { font-size: 11px; color: var(--kc-text-low); }
.kc-bw__cell-val { font-size: 18px; font-weight: 700; color: var(--kc-accent); flex: none; }

.kc-bw__overall { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: var(--kc-sp-5); padding-top: var(--kc-sp-4); border-top: 1px solid var(--kc-line-hairline); flex-wrap: wrap; }
.kc-bw__overall-val { font-size: 22px; font-weight: 700; color: var(--kc-text-hi); }

.kc-bw__loading { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--kc-sp-4); }
@media (max-width: 620px) { .kc-bw__loading { grid-template-columns: 1fr; } }

.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 26px; padding: 0 10px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 11px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }
</style>
