<template>
  <div class="kc-root kc-cutoffs">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Title Cutoffs"
        title="Title Cutoff & Percentile"
        sub="Season title cutoff and where any score lands on the ladder"
      >
        <template #right>
          <div class="kc-seg">
            <button
              v-for="r in REGIONS"
              :key="r"
              class="kc-seg__btn"
              :class="{ 'is-sel': r === region }"
              @click="region = r"
            >
              {{ r }}
            </button>
          </div>
        </template>
      </KcPageHeader>

      <!-- live data -->
      <template v-if="hasData">
        <div class="cut-grid">
          <!-- hero stat card -->
          <KcCard :level="2">
            <div class="kc-eyebrow cut-hero__label">Current title cutoff · {{ region }}</div>
            <div class="cut-hero">
              <span class="kc-disp cut-hero__num">{{ fmtNum(score) }}</span>
              <KcDeltaChip :delta="delta" />
            </div>
            <div class="text-low cut-hero__caption">
              vs previous snapshot · top 0.1% of the ladder
            </div>
          </KcCard>

          <!-- percentile thresholds -->
          <KcCard :level="1" header="Percentile thresholds" :body-style="{ padding: '0' }">
            <div v-if="percentiles.length" class="kc-statlist">
              <div v-for="(p, i) in percentiles" :key="p.label" class="cut-row">
                <span class="cut-row__pct">{{ p.label }}</span>
                <span class="cut-row__bar">
                  <span
                    class="cut-row__fill"
                    :style="{
                      width: `${barWidth(p.score)}%`,
                      background: i === 0 ? 'var(--kc-rank-gold)' : 'var(--kc-accent)',
                    }"
                  />
                </span>
                <span class="kc-disp cut-row__score">{{ fmtNum(p.score) }}</span>
              </div>
            </div>
            <div v-else class="cut-empty cut-empty--sm">No percentile thresholds yet.</div>
          </KcCard>
        </div>

        <!-- season projection -->
        <KcCard :level="1" header="Season projection">
          <template #headerRight>
            <span class="kc-eyebrow cut-proj__hint">dashed = forecast to season end</span>
          </template>
          <div v-if="projData.length" class="cut-proj">
            <apexchart type="line" :height="300" :options="projOptions" :series="projSeries" />
          </div>
          <div v-else class="cut-empty cut-empty--sm">No projection data yet.</div>
        </KcCard>

        <!-- where am I? — honest percentile, interpolated from the real thresholds -->
        <KcCard
          v-if="percentiles.length"
          :level="1"
          header="Where am I?"
          class="cut-where"
        >
          <div class="cut-where__row">
            <input
              v-model="myScore"
              class="kc-input"
              type="number"
              placeholder="Enter your score…"
            />
            <div v-if="myEstimate != null" class="cut-where__out">
              <span class="text-low">Estimated percentile</span>
              <span class="kc-disp cut-where__pct">top {{ myEstimate }}%</span>
              <span class="text-low">{{ whereCaption }}</span>
            </div>
          </div>
          <div class="cut-where__foot">
            Percentile is interpolated from the published threshold table above — not an exact rank.
          </div>
        </KcCard>
      </template>

      <!-- loading -->
      <div v-else-if="loading" class="cut-loading">
        <q-skeleton height="220px" />
        <q-skeleton height="320px" />
        <q-skeleton height="120px" />
      </div>

      <!-- error -->
      <KcCard v-else-if="error" :level="1">
        <div class="cut-empty">
          <div class="cut-empty__icon">⚠</div>
          Couldn't load cutoff data right now.
        </div>
      </KcCard>

      <!-- empty (200 with no data yet) -->
      <KcCard v-else :level="1">
        <div class="cut-empty">
          <div class="cut-empty__icon">🏁</div>
          No cutoff data yet — check back once the season has enough scored runs.
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import numeral from 'numeral'
import apexchart from 'vue3-apexcharts'
import { useKc } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
import type { Cutoffs } from 'src/data/metaReference'

/* ------------------------------------------------------------------
   DATA SOURCE — real backend, never fabricated/mock numbers.
   GET {apiUrl}/Meta/cutoffs?season=&periode=
   -> Cutoffs = {
        regions:     { EU, US, KR, TW },          // current title cutoff per region
        delta:       { EU, US, KR, TW },          // change vs the previous snapshot
        percentiles: [{ label, score }],          // published threshold table
        projection:  [{ week, score, proj }]      // history (proj:false) + dashed forecast (proj:true)
      }
   The endpoint returns 200 with empty fields until the aggregate job
   has run — we surface a clean empty state and show no numbers at all.
   ------------------------------------------------------------------ */
const { data } = useKc()

/* ------- design tokens resolved to concrete colors for ApexCharts ------- */
const COLOR = {
  accent: '#5B8DEF',
  warn: '#D29922',
  gold: '#F5C518',
  textMid: '#9AA7B8',
  line: 'rgba(255,255,255,0.06)',
}

const REGIONS = ['EU', 'US', 'KR', 'TW']

const region = ref('EU')
const myScore = ref('')

const source = ref<Cutoffs | null>(null)
const loading = ref(false)
const error = ref(false)

const hasData = computed(() => {
  const c = source.value
  if (!c) return false
  const hasRegion = !!c.regions && Object.keys(c.regions).length > 0
  const hasRows = Array.isArray(c.percentiles) && c.percentiles.length > 0
  const hasProj = Array.isArray(c.projection) && c.projection.length > 0
  return hasRegion || hasRows || hasProj
})

function fetchCutoffs() {
  if (!data.apiUrl) return
  loading.value = true
  error.value = false
  const periode = data.SelectedPeriode == null ? '' : String(data.SelectedPeriode)
  const url = `${data.apiUrl}/Meta/cutoffs?season=&periode=${periode}`
  axios
    .get(url)
    .then((r) => {
      const d = r.data || {}
      source.value = {
        regions: d.regions && typeof d.regions === 'object' ? d.regions : {},
        delta: d.delta && typeof d.delta === 'object' ? d.delta : {},
        percentiles: Array.isArray(d.percentiles) ? d.percentiles : [],
        projection: Array.isArray(d.projection) ? d.projection : [],
      }
      loading.value = false
    })
    .catch((e) => {
      console.log(e)
      source.value = null
      error.value = true
      loading.value = false
    })
}
onMounted(fetchCutoffs)
watch(() => data.SelectedPeriode, fetchCutoffs)
watch(() => data.SelectedLevelBand, fetchCutoffs)
// scope-bar changes (sample size etc.) bump Reloaded_Timestamp
watch(() => data.Reloaded_Timestamp, fetchCutoffs)

const fmtNum = (n: number | null | undefined) => (n == null ? '—' : numeral(n).format('0,0'))

const score = computed(() => source.value?.regions?.[region.value] ?? 0)
const delta = computed(() => source.value?.delta?.[region.value] ?? 0)
const percentiles = computed(() => source.value?.percentiles ?? [])

/* percentile bars are scaled against the highest (title) threshold */
const topScore = computed(() => percentiles.value[0]?.score || 0)
const barWidth = (s: number) => (topScore.value > 0 ? (s / topScore.value) * 100 : 0)

/* ------- "where am I?" — honest interpolation against the real table ------
   Walk the published thresholds (sorted high→low) and linearly interpolate
   the percentile label of the bracket the score falls into. No invented
   constants — purely derived from the endpoint's percentiles. */
const pctLabelValue = (label: string) => parseFloat(String(label).replace(/[^0-9.]/g, '')) || 0

const myEstimate = computed<string | null>(() => {
  const v = parseFloat(myScore.value)
  if (!myScore.value || isNaN(v)) return null
  const rows = [...percentiles.value]
    .map((p) => ({ pct: pctLabelValue(p.label), score: p.score }))
    .filter((p) => p.pct > 0)
    .sort((a, b) => b.score - a.score)
  if (!rows.length) return null

  // at or above the title threshold
  if (v >= rows[0].score) return rows[0].pct.toFixed(1)
  // below the lowest published threshold
  if (v < rows[rows.length - 1].score) return null

  for (let i = 0; i < rows.length - 1; i++) {
    const hi = rows[i]
    const lo = rows[i + 1]
    if (v < hi.score && v >= lo.score) {
      const t = (v - lo.score) / (hi.score - lo.score)
      const pct = lo.pct + t * (hi.pct - lo.pct)
      return pct.toFixed(1)
    }
  }
  return null
})

const whereCaption = computed(() => {
  const v = parseFloat(myScore.value) || 0
  if (myEstimate.value == null && v > 0) return 'Below the published thresholds'
  if (v >= score.value && score.value > 0) return 'Above the title cutoff 🎉'
  if (score.value > 0) return `${fmtNum(Math.max(0, score.value - v))} to title`
  return ''
})

/* ------- projection chart ------- */
const projData = computed(() => source.value?.projection ?? [])
const realCount = computed(() => projData.value.filter((d) => !d.proj).length)

const projSeries = computed(() => [
  {
    name: 'Cutoff',
    data: projData.value.map((d) => (d.proj ? null : d.score)),
  },
  {
    name: 'Projection',
    // bridge: include the last real point so the dashed segment connects
    data: projData.value.map((d) =>
      d.proj || (!d.proj && d.week === realCount.value) ? d.score : null,
    ),
  },
])

const projOptions = computed(() => ({
  chart: {
    foreColor: COLOR.textMid,
    background: 'transparent',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true },
  },
  theme: { mode: 'dark' },
  colors: [COLOR.accent, COLOR.warn],
  stroke: { curve: 'smooth', width: [2.5, 2], dashArray: [0, 6] },
  fill: { type: 'solid', opacity: 0 },
  markers: { size: 0 },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: { borderColor: COLOR.line, strokeDashArray: 3 },
  tooltip: {
    theme: 'dark',
    y: { formatter: (v: number) => (v == null ? '—' : numeral(v).format('0,0')) },
  },
  xaxis: {
    categories: projData.value.map((d) => `Wk ${d.week}`),
    tickAmount: 8,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: COLOR.textMid } },
  },
  yaxis: {
    labels: {
      style: { colors: COLOR.textMid },
      formatter: (v: number) => Math.round(v),
    },
  },
  annotations: {
    yaxis: score.value
      ? [
          {
            y: score.value,
            borderColor: COLOR.gold,
            strokeDashArray: 4,
            label: {
              text: 'Title cutoff',
              style: { color: '#0A0E14', background: COLOR.gold, fontWeight: 600 },
            },
          },
        ]
      : [],
  },
}))
</script>

<style scoped>
.kc-cutoffs { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* ---- top grid: hero (narrow) + percentile table (wide) ---- */
.cut-grid {
  display: grid;
  gap: var(--kc-sp-5);
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.3fr);
  margin-bottom: var(--kc-sp-5);
}
@media (max-width: 760px) { .cut-grid { grid-template-columns: 1fr; } }

/* ---- hero stat ---- */
.cut-hero__label { margin: 0 0 4px; }
.cut-hero { display: flex; align-items: baseline; gap: var(--kc-sp-3); margin: 6px 0 2px; }
.cut-hero__num { font-size: 48px; line-height: 1; color: var(--kc-text-hi); }
.cut-hero__caption { font-size: 12px; }

/* ---- percentile rows ---- */
.kc-statlist { display: flex; flex-direction: column; }
.cut-row {
  display: grid;
  grid-template-columns: 96px 1fr 64px;
  align-items: center;
  gap: var(--kc-sp-3);
  min-height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
}
.cut-row:last-child { border-bottom: 0; }
.cut-row__pct { font-size: 12.5px; color: var(--kc-text-mid); font-weight: 500; }
.cut-row__bar { position: relative; height: 7px; border-radius: 99px; background: var(--kc-bg-inset); overflow: hidden; }
.cut-row__fill { position: absolute; inset: 0 auto 0 0; border-radius: 99px; }
.cut-row__score { font-size: 15px; color: var(--kc-text-hi); text-align: right; }

/* ---- projection ---- */
.cut-proj__hint { margin: 0; }
.cut-proj { min-height: 300px; }

/* ---- where am I? ---- */
.cut-where { margin-top: var(--kc-sp-5); }
.cut-where__row { display: flex; align-items: center; gap: var(--kc-sp-5); flex-wrap: wrap; }
.cut-where__row .kc-input { max-width: 280px; }
.cut-where__out { display: flex; flex-direction: column; gap: 2px; }
.cut-where__pct { font-size: 26px; color: var(--kc-accent); }
.cut-where__foot { margin-top: var(--kc-sp-4); font-size: 11.5px; color: var(--kc-text-low); }

/* ---- inputs ---- */
.kc-input {
  height: 38px; padding: 0 14px; width: 100%;
  background: var(--kc-bg-inset);
  border: 1px solid var(--kc-line-default);
  border-radius: var(--kc-r-md);
  color: var(--kc-text-hi);
  font-family: var(--kc-font-ui); font-size: 14px;
  outline: none;
  transition: border-color var(--kc-motion-fast) ease, box-shadow var(--kc-motion-fast) ease;
}
.kc-input::placeholder { color: var(--kc-text-ghost); }
.kc-input:focus { border-color: var(--kc-accent); box-shadow: 0 0 0 3px var(--kc-accent-quiet); }

/* ---- segmented control ---- */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

.cut-loading { display: flex; flex-direction: column; gap: var(--kc-sp-5); }

/* ---- empty / error ---- */
.cut-empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 40px 20px; }
.cut-empty--sm { padding: var(--kc-sp-5); }
.cut-empty__icon { font-size: 22px; opacity: 0.6; margin-bottom: 8px; }

.text-low { color: var(--kc-text-low); }
</style>
