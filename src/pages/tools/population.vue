<template>
  <div class="kc-root kc-tools-population">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Population"
        title="Key-level Population Funnel"
        sub="Unique players who have timed at least one key at each level this season."
      >
        <template #right>
          <div class="kc-seg">
            <button
              v-for="r in REGIONS"
              :key="r.value"
              class="kc-seg__btn"
              :class="{ 'is-sel': r.value === region }"
              @click="region = r.value"
            >{{ r.label }}</button>
          </div>
        </template>
      </KcPageHeader>

      <!-- Funnel -->
      <KcCard v-if="!loading && !requestFailed && rows.length" :level="1" :body-style="{ padding: '0' }">
        <div class="fun-list">
          <div
            v-for="(row, i) in rows"
            :key="row.lvl"
            class="fun-row"
            :class="{ 'is-yourkey': isYourBand(row.lvl) }"
          >
            <span class="fun-row__key"><KcKeystoneChip :level="row.lvl" /></span>
            <span class="fun-row__bar">
              <span
                class="fun-bar"
                :style="{ width: `${(row.count / max) * 100}%`, background: barColor(i) }"
              />
              <span v-if="isYourBand(row.lvl)" class="fun-row__marker">you</span>
            </span>
            <span class="kc-tnum fun-row__count">{{ fmtNum(row.count) }}</span>
          </div>
        </div>
        <div class="dgn-foot">
          Roughly <strong>{{ tailPct }}%</strong> of players who timed a +{{ rows[0].lvl }}
          have timed a +{{ rows[rows.length - 1].lvl }}. The steepest drop-off is between
          +{{ steepest.from }} and +{{ steepest.to }}.
        </div>
      </KcCard>

      <!-- Loading skeleton -->
      <KcCard v-else-if="loading" :level="1" :body-style="{ padding: '0' }">
        <div class="fun-list">
          <div v-for="i in 9" :key="i" class="fun-row">
            <q-skeleton type="QChip" width="40px" height="26px" />
            <q-skeleton width="100%" height="26px" :style="{ width: `${100 - (i - 1) * 9}%`, borderRadius: '6px' }" />
            <q-skeleton width="64px" height="16px" style="justify-self: end" />
          </div>
        </div>
      </KcCard>

      <!-- Error state -->
      <KcCard v-else-if="requestFailed" :level="1">
        <div class="kc-pop__empty">
          <div class="kc-pop__empty-icon">!</div>
          Couldn't load population data. Please try again.
        </div>
      </KcCard>

      <!-- Empty state: endpoint returns 200 with [] until the aggregate job runs -->
      <KcCard v-else :level="1">
        <div class="kc-pop__empty">
          <div class="kc-pop__empty-icon">∅</div>
          No population data for this scope yet.
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useStore } from 'src/store'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcKeystoneChip from 'components/keystone/KcKeystoneChip.vue'

interface FunnelRow {
  lvl: number
  count: number
}

const store = useStore()
const data = store.state.data

const REGIONS = [
  { label: 'World', value: '' },
  { label: 'EU', value: 'eu' },
  { label: 'US', value: 'us' },
  { label: 'KR', value: 'kr' },
  { label: 'TW', value: 'tw' },
] as const

const region = ref<string>('')
const loading = ref(true)
const requestFailed = ref(false)
const rows = ref<FunnelRow[]>([])

const fmtNum = (n: number | null | undefined) =>
  n == null ? '—' : Number(n).toLocaleString('en-US')

const max = computed(() => rows.value[0]?.count || 1)

/* funnel bar fades from accent → cyan as levels climb (per design color-mix) */
const barColor = (i: number) =>
  `color-mix(in oklab, var(--kc-accent) ${100 - i * 8}%, var(--kc-signal-cyan, var(--kc-series-3)))`

/* footer narrative, derived live from the active rows */
const tailPct = computed(() => {
  const r = rows.value
  if (r.length < 2) return '0'
  return ((r[r.length - 1].count / r[0].count) * 100).toFixed(1)
})
const steepest = computed(() => {
  const r = rows.value
  let worst = { from: 0, to: 0, drop: 0 }
  for (let i = 1; i < r.length; i++) {
    const drop = (r[i - 1].count - r[i].count) / r[i - 1].count
    if (drop > worst.drop) worst = { from: r[i - 1].lvl, to: r[i].lvl, drop }
  }
  return worst
})

/* "your key" marker: highlight the funnel bracket matching the globally
   selected level band (e.g. "+15"). "All" highlights nothing. */
const selectedBandLevel = computed<number | null>(() => {
  const band = data.SelectedLevelBand
  if (!band || band === 'All') return null
  const n = parseInt(String(band).replace('+', ''), 10)
  return Number.isNaN(n) ? null : n
})
const isYourBand = (lvl: number) => {
  const k = selectedBandLevel.value
  if (k == null) return false
  // mark the highest funnel level that is <= the selected band level
  let best = -1
  for (const row of rows.value) if (row.lvl <= k) best = row.lvl
  return lvl === best
}

const fetchPopulation = () => {
  const apiUrl = data.apiUrl
  const periode = data.SelectedPeriode
  if (!apiUrl || periode == null) return

  loading.value = true
  requestFailed.value = false

  axios
    .get(`${apiUrl}/Meta/population?periode=${periode}&region=${region.value}`)
    .then((response) => {
      const payload = Array.isArray(response.data) ? response.data : []
      // endpoint contract: [{ lvl, count }], descending by population
      rows.value = payload
        .map((row: any) => ({ lvl: Number(row.lvl), count: Number(row.count) }))
        .filter((row: FunnelRow) => !Number.isNaN(row.lvl) && !Number.isNaN(row.count))
      loading.value = false
    })
    .catch((error) => {
      console.log(error)
      rows.value = []
      requestFailed.value = true
      loading.value = false
    })
}

onMounted(fetchPopulation)

// refetch when the scope changes (region) or the global season changes
watch(region, fetchPopulation)
watch(() => data.SelectedPeriode, fetchPopulation)
</script>

<style scoped>
.kc-tools-population { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

/* segmented control (region) — mirrors compositions.vue */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* funnel list (ported from views.css .fun-* tokens) */
.fun-list { padding: var(--kc-sp-4) var(--kc-sp-5); display: flex; flex-direction: column; gap: var(--kc-sp-3); }
.fun-row { display: grid; grid-template-columns: 56px 1fr 88px; align-items: center; gap: 16px; }
.fun-row__key { display: flex; }
.fun-row__bar { position: relative; background: var(--kc-bg-inset); border-radius: var(--kc-r-sm); height: 26px; overflow: hidden; }
.fun-bar { display: block; height: 100%; border-radius: var(--kc-r-sm); transition: width 0.6s var(--kc-ease-out, ease-out); }
.fun-row__count { font-size: 14px; color: var(--kc-text-hi); text-align: right; font-weight: 600; justify-self: end; }

/* "your key" highlight */
.fun-row.is-yourkey .fun-row__bar { box-shadow: inset 0 0 0 1.5px var(--kc-accent); overflow: visible; }
.fun-row__marker {
  position: absolute; top: 50%; right: 8px; transform: translateY(-50%);
  font-family: var(--kc-font-display, var(--kc-font-ui));
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--kc-text-inverse, #0A0E14);
  background: var(--kc-accent);
  padding: 2px 6px; border-radius: 4px;
  pointer-events: none;
}

.dgn-foot { padding: 12px 20px; font-size: 11.5px; color: var(--kc-text-low); border-top: 1px solid var(--kc-line-hairline); }
.dgn-foot strong { color: var(--kc-text-hi); font-weight: 700; }

/* empty / error state */
.kc-pop__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 36px 20px; }
.kc-pop__empty-icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

@media (max-width: 600px) {
  .fun-row { grid-template-columns: 48px 1fr 68px; gap: 10px; }
  .fun-row__count { font-size: 13px; }
}
</style>
