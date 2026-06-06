<template>
  <div class="kc-root kc-cutoffs">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Title Cutoffs"
        title="Title Cutoff & Percentile"
        sub="Live estimate of the season title cutoff and where any score lands"
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

      <template v-if="hasData">
        <div class="cut-grid">
          <!-- hero stat card -->
          <KcCard :level="2">
            <div class="kc-eyebrow cut-hero__label">Current title cutoff · {{ region }}</div>
            <div class="cut-hero">
              <span class="kc-disp cut-hero__num">{{ fmtNum(score) }}</span>
              <KcDeltaChip :delta="delta" />
            </div>
            <div class="text-low cut-hero__caption">vs yesterday · top 0.1% of the ladder</div>
            <div class="kc-seg cut-hero__seg">
              <button
                v-for="f in FACTIONS"
                :key="f"
                class="kc-seg__btn"
                :class="{ 'is-sel': f === faction }"
                @click="faction = f"
              >
                {{ f }}
              </button>
            </div>
          </KcCard>

          <!-- percentile thresholds -->
          <KcCard :level="1" header="Percentile thresholds" :body-style="{ padding: '0' }">
            <div class="kc-statlist">
              <div v-for="(p, i) in percentiles" :key="p.label" class="cut-row">
                <span class="cut-row__pct">{{ p.label }}</span>
                <span class="cut-row__bar">
                  <span
                    class="cut-row__fill"
                    :style="{
                      width: `${(p.score / percentiles[0].score) * 100}%`,
                      background: i === 0 ? 'var(--kc-rank-gold)' : 'var(--kc-accent)',
                    }"
                  />
                </span>
                <span class="kc-disp cut-row__score">{{ fmtNum(p.score) }}</span>
              </div>
            </div>
          </KcCard>
        </div>

        <!-- season projection -->
        <KcCard :level="1" header="Season projection">
          <template #headerRight>
            <span class="kc-eyebrow cut-proj__hint">dashed = forecast to season end</span>
          </template>
          <div class="cut-proj">
            <apexchart type="line" :height="300" :options="projOptions" :series="projSeries" />
          </div>
        </KcCard>

        <!-- where am I? -->
        <KcCard :level="1" header="Where am I?" class="cut-where">
          <div class="cut-where__row">
            <input
              v-model="myScore"
              class="kc-input"
              type="number"
              placeholder="Enter your score…"
            />
            <div v-if="myPct != null" class="cut-where__out">
              <span class="text-low">Estimated percentile</span>
              <span class="kc-disp cut-where__pct">top {{ myPct }}%</span>
              <span class="text-low">{{ whereCaption }}</span>
            </div>
          </div>
        </KcCard>
      </template>

      <div v-else class="cut-loading">
        <q-skeleton height="220px" />
        <q-skeleton height="320px" />
        <q-skeleton height="120px" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import numeral from 'numeral'
import apexchart from 'vue3-apexcharts'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
import { cutoffs } from 'src/mocks/meta'

/* ------- design tokens resolved to concrete colors for ApexCharts ------- */
const COLOR = {
  accent: '#5B8DEF',
  warn: '#D29922',
  gold: '#F5C518',
  textMid: '#9AA7B8',
  line: 'rgba(255,255,255,0.06)',
}

const REGIONS = ['EU', 'US', 'KR', 'TW']
const FACTIONS = ['Both', 'Alliance', 'Horde']

const region = ref('EU')
const faction = ref('Both')
const myScore = ref('')

const c = cutoffs
const hasData = computed(() => !!c && Array.isArray(c.percentiles) && c.percentiles.length > 0)

const score = computed(() => c.regions[region.value])
const delta = computed(() => c.delta[region.value])
const percentiles = computed(() => c.percentiles)

const fmtNum = (n: number) => numeral(n).format('0,0')

/* ------- "where am I?" percentile estimate (mirrors design heuristic) ------- */
const myPct = computed(() => {
  const v = parseInt(myScore.value, 10)
  if (!myScore.value || isNaN(v)) return null
  return Math.max(0.1, Math.min(99, 100 - (v / score.value) * 0.1 * 100)).toFixed(1)
})
const whereCaption = computed(() => {
  const v = parseInt(myScore.value, 10) || 0
  if (v >= score.value) return 'Above the title cutoff 🎉'
  return `${fmtNum(score.value - v)} to title`
})

/* ------- projection chart ------- */
const projData = computed(() => c.projection)
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
    yaxis: [
      {
        y: score.value,
        borderColor: COLOR.gold,
        strokeDashArray: 4,
        label: {
          text: 'Title cutoff',
          style: { color: '#0A0E14', background: COLOR.gold, fontWeight: 600 },
        },
      },
    ],
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
.cut-hero__caption { font-size: 12px; margin-bottom: 16px; }
.cut-hero__seg { display: inline-flex; }

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

.text-low { color: var(--kc-text-low); }
</style>
