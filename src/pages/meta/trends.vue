<template>
  <div class="kc-root kc-meta-trends">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Meta · Trends"
        title="Spec & Composition Trends"
        sub="How the meta shifted across the season."
      >
        <template #right>
          <div class="kc-seg">
            <button
              v-for="o in MODES"
              :key="o.v"
              class="kc-seg__btn"
              :class="{ 'is-sel': o.v === mode }"
              @click="mode = o.v"
            >{{ o.label }}</button>
          </div>
        </template>
      </KcPageHeader>

      <!-- ── Representation over time ── -->
      <KcCard :level="1" header="Representation over time">
        <template #headerRight>
          <div class="kc-trends__head-right">
            <!-- chart-type toggle (Area / Bump showpiece) -->
            <div class="kc-seg">
              <button
                v-for="c in CHARTS"
                :key="c.v"
                class="kc-seg__btn"
                :class="{ 'is-sel': c.v === chart }"
                @click="chart = c.v"
              >{{ c.label }}</button>
            </div>
            <!-- role scope chip -->
            <div class="kc-chip kc-chip--scope" :class="{ 'is-open': roleOpen }" @click="roleOpen = !roleOpen">
              <span class="kc-chip__key">Role</span>
              <span class="kc-chip__val">{{ role }}</span>
              <span class="kc-chip__caret">▾</span>
              <div v-if="roleOpen" class="kc-chip__menu" @click.stop>
                <button
                  v-for="r in ROLES"
                  :key="r"
                  class="kc-chip__menu-item"
                  :class="{ 'is-active': r === role }"
                  @click="selectRole(r)"
                >{{ r }}</button>
              </div>
            </div>
          </div>
        </template>

        <!-- loading skeleton -->
        <div v-if="loading" class="kc-trends__skel">
          <q-skeleton height="320px" />
        </div>

        <!-- empty -->
        <div v-else-if="!series.length" class="kc-trends__empty">
          <div class="kc-trends__empty-icon">📉</div>
          No representation data for this scope yet.
        </div>

        <template v-else>
          <div class="kc-trends__chart">
            <!-- standard Apex area / line -->
            <apexchart
              v-if="chart === 'area'"
              type="area"
              :height="320"
              :options="areaOptions"
              :series="visibleSeries"
            />
            <!-- showpiece: ranked-bump SVG -->
            <TrendBump v-else :specs="visibleSpecs" :height="320" />
          </div>

          <!-- clickable legend → toggles series -->
          <div class="trend-legend">
            <button
              v-for="s in trendSpecs"
              :key="s.id"
              class="trend-legend__item"
              :class="{ 'is-off': hidden.has(s.id) }"
              type="button"
              @click="toggleSeries(s.id)"
            >
              <span class="trend-legend__dot" :style="{ background: clsColor(s.cls) }" />
              {{ s.name }}
            </button>
          </div>

          <p v-if="chart === 'bump'" class="kc-trends__note">
            Ranked bump — vertical position is share rank that week, not absolute %. Hover a line to isolate.
          </p>
        </template>
      </KcCard>

      <!-- ── Biggest movers ── -->
      <div class="tr-movers">
        <KcCard :level="1" :body-style="{ padding: '0' }">
          <template #header>
            <span class="kc-trends__mv-title">
              <span class="pos kc-trends__mv-arrow">▲</span>Biggest gainers
            </span>
          </template>
          <div v-if="loading" class="kc-trends__mv-skel">
            <q-skeleton v-for="i in 3" :key="i" height="44px" />
          </div>
          <div v-else-if="gainers.length" class="kc-statlist">
            <MoverRow v-for="m in gainers" :key="m.id" :mover="m" />
          </div>
          <div v-else class="kc-trends__empty kc-trends__empty--sm">No gainers this week.</div>
        </KcCard>

        <KcCard :level="1" :body-style="{ padding: '0' }">
          <template #header>
            <span class="kc-trends__mv-title">
              <span class="neg kc-trends__mv-arrow">▼</span>Biggest losers
            </span>
          </template>
          <div v-if="loading" class="kc-trends__mv-skel">
            <q-skeleton v-for="i in 3" :key="i" height="44px" />
          </div>
          <div v-else-if="losers.length" class="kc-statlist">
            <MoverRow v-for="m in losers" :key="m.id" :mover="m" />
          </div>
          <div v-else class="kc-trends__empty kc-trends__empty--sm">No losers this week.</div>
        </KcCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue'
import apexchart from 'vue3-apexcharts'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
import { trendSpecs, movers, type TrendSpec, type Mover } from 'src/mocks/meta'

/* ------------------------------------------------------------------
   The design references CSS vars like var(--class-evoker) that are not
   defined in this codebase. Resolve class keys to concrete WoW class
   colors locally so the chart, legend and movers render in class colors.
   ------------------------------------------------------------------ */
const CLASS_COLOR: Record<string, string> = {
  deathknight: '#C41E3A',
  demonhunter: '#A330C9',
  druid: '#FF7C0A',
  evoker: '#33937F',
  hunter: '#AAD372',
  mage: '#3FC7EB',
  monk: '#00FF98',
  paladin: '#F48CBA',
  priest: '#FFFFFF',
  rogue: '#FFF468',
  shaman: '#0070DD',
  warlock: '#8788EE',
  warrior: '#C69B6D',
}
const clsColor = (cls: string) => CLASS_COLOR[cls] || 'var(--kc-accent)'
/* brighter readable variant for text on dark bg */
const clsText = (cls: string) => {
  const c = clsColor(cls)
  return c === '#FFFFFF' ? 'var(--kc-text-hi)' : c
}

/* ---- mode / chart-type / role state ---- */
const MODES = [
  { v: 'specs', label: 'Specs' },
  { v: 'comps', label: 'Comps' },
]
const CHARTS = [
  { v: 'area', label: 'Area' },
  { v: 'bump', label: 'Bump' },
]
const ROLES = ['Tank', 'Healer', 'DPS']

const mode = ref<'specs' | 'comps'>('specs')
const chart = ref<'area' | 'bump'>('area')
const role = ref('DPS')
const roleOpen = ref(false)
const selectRole = (r: string) => { role.value = r; roleOpen.value = false }

/* simple mount loading state for skeletons */
const loading = ref(true)
onMounted(() => { setTimeout(() => { loading.value = false }, 220) })

/* ---- series toggling via legend ---- */
const hidden = ref<Set<string>>(new Set())
const toggleSeries = (id: string) => {
  const next = new Set(hidden.value)
  if (next.has(id)) next.delete(id)
  else if (next.size < trendSpecs.length - 1) next.add(id) // keep ≥1 visible
  hidden.value = next
}

const visibleSpecs = computed<TrendSpec[]>(() => trendSpecs.filter((s) => !hidden.value.has(s.id)))

/* ---- Apex area/line config ---- */
const categories = computed(() => (trendSpecs[0]?.points || []).map((p) => p.label))

const series = computed(() =>
  trendSpecs.map((s) => ({ name: s.name, data: s.points.map((p) => p.pct) })),
)
const visibleSeries = computed(() =>
  visibleSpecs.value.map((s) => ({ name: s.name, data: s.points.map((p) => p.pct) })),
)
const visibleColors = computed(() => visibleSpecs.value.map((s) => clsColor(s.cls)))

const areaOptions = computed(() => {
  const stacked = mode.value === 'comps'
  return {
    chart: {
      type: 'area',
      stacked,
      background: 'transparent',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { easing: 'easeout', speed: 500 },
    },
    theme: { mode: 'dark' },
    colors: visibleColors.value,
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { curve: 'smooth', width: stacked ? 1.5 : 2.5 },
    fill: stacked
      ? { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.15 } }
      : { type: 'solid', opacity: 0 },
    grid: {
      borderColor: 'var(--kc-line-hairline)',
      strokeDashArray: 0,
      padding: { left: 6, right: 6 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: {
      categories: categories.value,
      tickAmount: 6,
      axisBorder: { color: 'var(--kc-line-hairline)' },
      axisTicks: { color: 'var(--kc-line-hairline)' },
      labels: { style: { colors: 'var(--kc-text-low)', fontSize: '11px' } },
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--kc-text-low)', fontSize: '11px' },
        formatter: (v: number) => `${v.toFixed(0)}%`,
      },
    },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `${v.toFixed(1)}%` } },
  }
})

/* ---- movers (gainers / losers) ---- */
const gainers = computed<Mover[]>(() =>
  movers.filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta),
)
const losers = computed<Mover[]>(() =>
  movers.filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta),
)

/* ==================================================================
   MoverRow — render fn (KcDeltaChip + colored spec square + bar)
   ================================================================== */
const MoverRow = (props: { mover: Mover }) => {
  const m = props.mover
  const col = clsColor(m.cls)
  const up = m.delta > 0
  // KcDeltaChip works in integer "delta" units; movers carry a % delta,
  // so render the chip on the rounded value and show the precise % in-row.
  return h('div', { class: 'mv-row' }, [
    h('span', { class: ['mv-row__delta', up ? 'pos' : 'neg'] }, [
      h(KcDeltaChip, { delta: Math.round(m.delta * 10) / 10 }),
    ]),
    h('span', { class: 'mv-row__icon', style: { background: col }, title: m.name }),
    h('span', { class: 'mv-row__name', style: { color: clsText(m.cls) } }, m.name),
    h('span', { class: 'kc-tnum mv-row__pct' }, `${m.pct.toFixed(1)}%`),
    h('span', { class: 'mv-row__bar' }, [
      h('span', {
        class: 'mv-row__bar-fill',
        style: { width: `${Math.min(100, (m.pct / 14) * 100)}%`, background: col },
      }),
    ]),
  ])
}

/* ==================================================================
   TrendBump — custom ranked-bump SVG showpiece (vertical = share rank)
   ================================================================== */
const TrendBump = (props: { specs: TrendSpec[]; height?: number }) => {
  const specs = props.specs
  const H = props.height || 320
  const W = 760
  const padL = 132
  const padR = 132
  const padT = 26
  const padB = 26
  const weeks = specs[0]?.points.length || 0
  const n = specs.length
  if (!weeks || n === 0) return h('div')

  // rank per week (0 = top share)
  const ranks: number[][] = specs.map(() => Array(weeks).fill(0))
  for (let w = 0; w < weeks; w++) {
    const order = specs
      .map((s, i) => ({ i, v: s.points[w].pct }))
      .sort((a, b) => b.v - a.v)
    order.forEach((o, rank) => { ranks[o.i][w] = rank })
  }
  const x = (w: number) => padL + (weeks <= 1 ? 0 : (w / (weeks - 1)) * (W - padL - padR))
  const y = (rank: number) => padT + (n <= 1 ? (H - padT - padB) / 2 : (rank / (n - 1)) * (H - padT - padB))

  const gridLines = Array.from({ length: weeks }).map((_, w) =>
    h('line', {
      key: `g${w}`,
      x1: x(w), x2: x(w), y1: padT - 10, y2: H - padB + 10,
      stroke: 'var(--kc-line-hairline)', 'stroke-width': '1',
      opacity: w % 2 ? 0.4 : 0.7,
    }),
  )

  const lines = specs.map((s, i) => {
    const col = clsColor(s.cls)
    const pts = ranks[i].map((rk, w) => [x(w), y(rk)] as [number, number])
    const d = pts
      .map((p, k) => {
        if (k === 0) return `M${p[0]} ${p[1]}`
        const prev = pts[k - 1]
        const mx = (prev[0] + p[0]) / 2
        return `C${mx} ${prev[1]} ${mx} ${p[1]} ${p[0]} ${p[1]}`
      })
      .join(' ')
    return h('g', { key: s.id, class: 'bump__g' }, [
      h('path', {
        d, fill: 'none', stroke: col, 'stroke-width': 2.5,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }),
      h('circle', {
        cx: pts[0][0], cy: pts[0][1], r: '3.5',
        fill: 'var(--kc-bg-canvas)', stroke: col, 'stroke-width': '2',
      }),
      h('circle', { cx: pts[weeks - 1][0], cy: pts[weeks - 1][1], r: '4', fill: col }),
      h('text', {
        x: pts[0][0] - 10, y: pts[0][1], 'text-anchor': 'end',
        'dominant-baseline': 'middle', 'font-size': '11.5', 'font-weight': '600', fill: col,
      }, s.name),
      h('text', {
        x: pts[weeks - 1][0] + 10, y: pts[weeks - 1][1], 'text-anchor': 'start',
        'dominant-baseline': 'middle', 'font-size': '11.5', 'font-weight': '600', fill: col,
      }, `${s.points[weeks - 1].pct.toFixed(1)}%`),
    ])
  })

  return h('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', class: 'bump', style: 'display:block' }, [
    ...gridLines,
    ...lines,
  ])
}
</script>

<style scoped>
.kc-meta-trends { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }

/* segmented control (matches compositions.vue) */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn:hover { color: var(--kc-text-hi); }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* card header right cluster */
.kc-trends__head-right { display: flex; align-items: center; gap: 8px; }

/* role scope chip + dropdown */
.kc-chip--scope { position: relative; display: inline-flex; align-items: center; gap: 8px; height: 30px; padding: 0 10px; border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); background: var(--kc-bg-inset); color: var(--kc-text-hi); font-size: 12.5px; font-weight: 500; cursor: pointer; white-space: nowrap; user-select: none; transition: border-color var(--kc-motion-fast) ease, background var(--kc-motion-fast) ease; }
.kc-chip--scope:hover { border-color: var(--kc-line-strong); background: var(--kc-bg-hover); }
.kc-chip--scope.is-open { border-color: var(--kc-accent); background: var(--kc-accent-quiet); }
.kc-chip__key { font-family: var(--kc-font-display); text-transform: uppercase; letter-spacing: 0.1em; font-size: 9.5px; color: var(--kc-text-low); }
.kc-chip__val { color: var(--kc-text-hi); font-weight: 600; }
.kc-chip__caret { font-size: 9px; opacity: 0.6; }
.kc-chip__menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 30; min-width: 120px; padding: 4px; background: var(--kc-bg-raised); border: 1px solid var(--kc-line-default); border-radius: var(--kc-r-lg); box-shadow: var(--kc-shadow-md); display: flex; flex-direction: column; }
.kc-chip__menu-item { width: 100%; padding: 7px 10px; border-radius: var(--kc-r-sm); border: 0; background: transparent; text-align: left; font-size: 13px; color: var(--kc-text-mid); cursor: pointer; }
.kc-chip__menu-item:hover { background: var(--kc-bg-hover); color: var(--kc-text-hi); }
.kc-chip__menu-item.is-active { color: var(--kc-accent); }

/* chart area */
.kc-trends__chart { min-height: 320px; }
.kc-trends__skel { min-height: 320px; }

/* legend (clickable toggles) */
.trend-legend { display: flex; flex-wrap: wrap; gap: var(--kc-sp-4); margin-top: var(--kc-sp-4); padding-top: var(--kc-sp-3); border-top: 1px solid var(--kc-line-hairline); }
.trend-legend__item { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--kc-text-mid); background: none; border: 0; padding: 0; cursor: pointer; transition: opacity var(--kc-motion-fast) ease, color var(--kc-motion-fast) ease; }
.trend-legend__item:hover { color: var(--kc-text-hi); }
.trend-legend__item.is-off { opacity: 0.4; text-decoration: line-through; }
.trend-legend__dot { width: 9px; height: 9px; border-radius: 2px; flex: none; }

.kc-trends__note { margin-top: 8px; font-family: var(--kc-font-mono); font-size: 11px; color: var(--kc-text-low); }

/* empty / loading */
.kc-trends__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: var(--kc-sp-7) var(--kc-sp-5); }
.kc-trends__empty--sm { padding: var(--kc-sp-5); }
.kc-trends__empty-icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }
.kc-trends__mv-skel { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; }

/* movers */
.tr-movers { display: grid; gap: var(--kc-sp-5); grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); margin-top: var(--kc-sp-5); }
.kc-trends__mv-title { display: inline-flex; align-items: center; gap: 7px; }
.kc-trends__mv-arrow { font-size: 13px; }

.kc-statlist { display: flex; flex-direction: column; }
:deep(.mv-row) { display: grid; grid-template-columns: 62px 26px minmax(90px, 1fr) 52px minmax(70px, 0.9fr); align-items: center; gap: var(--kc-sp-3); min-height: 44px; padding: 0 16px; border-bottom: 1px solid var(--kc-line-hairline); }
:deep(.mv-row:last-child) { border-bottom: 0; }
:deep(.mv-row:hover) { background: var(--kc-bg-hover); }
:deep(.mv-row__delta) { display: inline-flex; }
:deep(.mv-row__icon) { width: 22px; height: 22px; border-radius: var(--kc-r-sm); opacity: 0.9; box-shadow: inset 0 0 0 1px var(--kc-line-hairline); }
:deep(.mv-row__name) { font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
:deep(.mv-row__pct) { font-size: 12.5px; color: var(--kc-text-mid); text-align: right; }
:deep(.mv-row__bar) { min-width: 0; height: 6px; border-radius: 99px; background: var(--kc-bg-inset); overflow: hidden; }
:deep(.mv-row__bar-fill) { display: block; height: 100%; border-radius: 99px; opacity: 0.85; }

/* bump hover isolation */
:deep(.bump:hover .bump__g) { opacity: 0.18; transition: opacity var(--kc-motion-base) ease; }
:deep(.bump .bump__g) { transition: opacity var(--kc-motion-base) ease; }
:deep(.bump .bump__g:hover) { opacity: 1; }

@media (max-width: 600px) {
  .kc-container { padding-left: 12px; padding-right: 12px; }
}
@media (max-width: 480px) {
  :deep(.mv-row) { grid-template-columns: 56px 20px minmax(0, 1fr) 46px; gap: 8px; padding: 0 10px; }
  :deep(.mv-row__bar) { display: none; }
}
</style>
