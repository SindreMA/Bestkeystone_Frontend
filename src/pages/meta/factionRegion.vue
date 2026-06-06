<template>
  <div class="kc-root kc-meta-faction">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Meta · Faction & Region"
        title="Faction & Region"
        sub="Compare timed-rate, score spread and top comps across factions."
      >
        <template #right>
          <div class="fac-controls">
            <!-- region segmented control → drives the &region= query param -->
            <div class="kc-seg" role="tablist" aria-label="Region">
              <button
                v-for="r in REGIONS"
                :key="r"
                class="kc-seg__btn"
                :class="{ 'is-sel': r === region }"
                @click="region = r"
              >{{ r }}</button>
            </div>
            <!-- faction toggle -->
            <div class="kc-seg" role="tablist" aria-label="Faction">
              <button
                v-for="o in FACTION_VIEWS"
                :key="o.v"
                class="kc-seg__btn kc-seg__btn--fac"
                :class="{ 'is-sel': o.v === factionView, [`is-${o.v}`]: o.v === factionView }"
                @click="factionView = o.v"
              >
                <span v-if="o.v !== 'both'" class="fac-dot" :style="{ background: crestColor(o.v) }" />
                {{ o.label }}
              </button>
            </div>
          </div>
        </template>
      </KcPageHeader>

      <!-- loading skeleton -->
      <div v-if="loading" class="fac-grid">
        <KcCard v-for="i in 2" :key="i" :level="1"><q-skeleton height="320px" /></KcCard>
      </div>

      <!-- error -->
      <KcCard v-else-if="error" :level="1">
        <div class="fac-empty">
          <div class="fac-empty__icon">⚠</div>
          Couldn't load faction data right now.
        </div>
      </KcCard>

      <!-- empty (200 with no aggregated runs yet) -->
      <KcCard v-else-if="!hasData" :level="1">
        <div class="fac-empty">
          <div class="fac-empty__icon">◔</div>
          No faction data for {{ region }} yet.
        </div>
      </KcCard>

      <div v-else class="fac-grid">
        <KcCard v-for="f in visibleFactions" :key="f.key" :level="1">
          <!-- card header: crest + faction name + region tag -->
          <template #header>
            <span class="fac-crest" :style="{ '--crest': crestColor(f.key) }">{{ f.crest }}</span>
            <span class="fac-name" :style="{ color: crestColor(f.key) }">{{ f.label }}</span>
          </template>
          <template #headerRight>
            <span class="kc-eyebrow fac-region-tag">{{ region }}</span>
          </template>

          <!-- timed-rate: ring + big number + avg score / sample -->
          <div class="fac-stat">
            <KcSuccessRing :pct="f.timed * 100" :size="52" :caption="false" />
            <div class="fac-stat__txt">
              <div class="kc-disp kc-tnum fac-stat__big">{{ Math.round(f.timed * 100) }}%</div>
              <div class="fac-stat__unit">timed-rate</div>
            </div>
            <div class="fac-stat__meta">
              <div class="kc-disp kc-tnum fac-stat__score">{{ Math.round(f.avgScore) }}</div>
              <div class="fac-stat__unit">avg score · n {{ fmtNum(f.runs) }}</div>
            </div>
          </div>

          <!-- score distribution histogram -->
          <template v-if="f.hist.length">
            <div class="kc-eyebrow fac-section">Score distribution</div>
            <div class="fac-hist" aria-hidden="true">
              <span
                v-for="(h, i) in f.histNorm"
                :key="i"
                class="fac-bar"
                :style="{ height: `${h}px`, background: crestColor(f.key) }"
              />
            </div>
            <div class="fac-hist__axis">
              <span>low</span><span>median</span><span>title</span>
            </div>
          </template>

          <!-- top comps (numeric spec ids resolved via the store) -->
          <template v-if="f.comps && f.comps.length">
            <div class="kc-eyebrow fac-section">Top comps</div>
            <div class="fac-comps">
              <div v-for="(c, i) in f.comps" :key="i" class="fac-comp">
                <span class="fac-comp__rank" :class="{ 'is-top': i === 0 }">{{ i + 1 }}</span>
                <span class="fac-comp__icons">
                  <KcSpecIcon
                    v-for="(id, j) in c"
                    :key="j"
                    :spec-id="id"
                    :size="24"
                  />
                </span>
              </div>
            </div>
          </template>
        </KcCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useKc } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'
import KcSpecIcon from 'components/keystone/KcSpecIcon.vue'

/* ------------------------------------------------------------------
   DATA SOURCE — real backend, never fabricated/mock numbers.
   GET {apiUrl}/Meta/faction-region?periode=&region=
   -> { periode, region, alliance: FactionBlock, horde: FactionBlock }
   FactionBlock = { timed(0..1), avgScore, runs, hist:[counts], comps?:[[specId]] }
   The aggregate job may not have run yet: the endpoint then returns blocks
   with runs:0 / empty hist — we surface a clean empty state and show no
   numbers at all, never placeholder data.
   ------------------------------------------------------------------ */
const { data, fmtNum } = useKc()

interface FactionBlock {
  timed: number
  avgScore: number
  runs: number
  hist: number[]
  comps?: number[][] | null
}
interface FactionRegionResponse {
  periode: number
  region: string
  alliance: FactionBlock
  horde: FactionBlock
}

const blocks = ref<{ alliance: FactionBlock | null; horde: FactionBlock | null }>({
  alliance: null,
  horde: null,
})
const loading = ref(false)
const error = ref(false)

/* region segmented control — drives the &region= query param (re-fetch on change) */
const REGIONS = ['EU', 'US', 'KR', 'TW'] as const
type Region = (typeof REGIONS)[number]
const region = ref<Region>('EU')

/* faction view toggle: Both | Alliance | Horde (client-side, no re-fetch) */
const FACTION_VIEWS = [
  { v: 'both', label: 'Both' },
  { v: 'alliance', label: 'Alliance' },
  { v: 'horde', label: 'Horde' },
] as const
type FactionView = (typeof FACTION_VIEWS)[number]['v']
const factionView = ref<FactionView>('both')

function fetchData() {
  const apiUrl = data.apiUrl
  const periode = data.SelectedPeriode
  if (!apiUrl || periode == null) {
    blocks.value = { alliance: null, horde: null }
    return
  }
  loading.value = true
  error.value = false
  const url = `${apiUrl}/Meta/faction-region?periode=${periode}&region=${region.value}`
  axios
    .get<FactionRegionResponse>(url)
    .then((r) => {
      const p = r.data
      blocks.value = {
        alliance: p && p.alliance ? p.alliance : null,
        horde: p && p.horde ? p.horde : null,
      }
    })
    .catch((e) => {
      console.log(e)
      blocks.value = { alliance: null, horde: null }
      error.value = true
    })
    .finally(() => {
      loading.value = false
    })
}
onMounted(fetchData)
watch(() => data.SelectedPeriode, fetchData)
watch(() => data.SelectedLevelBand, fetchData)
watch(() => data.Reloaded_Timestamp, fetchData)
// region change re-queries the endpoint with the new &region=
watch(region, fetchData)

/* faction crest colors (design tokens) */
const crestColor = (key: 'alliance' | 'horde') =>
  key === 'alliance' ? 'var(--kc-faction-alliance)' : 'var(--kc-faction-horde)'

const FACTION_DEFS = [
  { key: 'alliance' as const, label: 'Alliance', crest: 'A' },
  { key: 'horde' as const, label: 'Horde', crest: 'H' },
]

/* a faction block counts as having data only when it carries real runs */
const blockHasData = (b: FactionBlock | null): b is FactionBlock =>
  !!b && (b.runs > 0 || (Array.isArray(b.hist) && b.hist.some((h) => h > 0)))

/* normalize each faction's histogram to a max bar height so the spread reads
   regardless of absolute counts (purely presentational; no fabricated values) */
const MAX_BAR = 84
const factions = computed(() =>
  FACTION_DEFS.flatMap((def) => {
    const b = blocks.value[def.key]
    if (!blockHasData(b)) return []
    const peak = Math.max(1, ...b.hist)
    return [
      {
        ...def,
        timed: Math.max(0, Math.min(1, b.timed)),
        avgScore: b.avgScore,
        runs: b.runs,
        hist: b.hist,
        histNorm: b.hist.map((h) => (h / peak) * MAX_BAR),
        comps: b.comps ?? null,
      },
    ]
  }),
)

const visibleFactions = computed(() =>
  factionView.value === 'both'
    ? factions.value
    : factions.value.filter((f) => f.key === factionView.value),
)

const hasData = computed(() => factions.value.length > 0)
</script>

<style scoped>
.kc-meta-faction { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* header controls */
.fac-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* ---- faction cards grid ---- */
.fac-grid {
  display: grid;
  gap: var(--kc-sp-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
}

/* card header crest */
.fac-crest {
  display: inline-grid; place-items: center; flex: none;
  width: 22px; height: 22px; border-radius: var(--kc-r-sm);
  font: 700 11px/1 var(--kc-font-display);
  color: var(--crest);
  background: color-mix(in oklab, var(--crest) 18%, var(--kc-bg-inset));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--crest) 45%, transparent);
}
.fac-name { font-size: 14px; font-weight: 700; }
.fac-region-tag { margin: 0; }

/* timed-rate stat row */
.fac-stat { display: flex; align-items: center; gap: var(--kc-sp-4); }
.fac-stat__txt { display: flex; flex-direction: column; line-height: 1.1; }
.fac-stat__big { font-size: 24px; font-weight: 700; color: var(--kc-text-hi); }
.fac-stat__unit { font-size: 10.5px; color: var(--kc-text-low); }
.fac-stat__meta { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.fac-stat__score { font-size: 20px; font-weight: 700; color: var(--kc-text-hi); }

/* section eyebrows */
.fac-section { margin: 20px 0 8px; }

/* score histogram */
.fac-hist { display: flex; align-items: flex-end; gap: 6px; height: 84px; padding: 6px 0; }
.fac-bar { flex: 1; border-radius: 3px 3px 0 0; opacity: 0.85; min-width: 0; transition: height 0.5s var(--kc-ease-out); }
.fac-hist__axis {
  display: flex; justify-content: space-between;
  font-size: 9.5px; color: var(--kc-text-low);
  letter-spacing: 0.04em; margin-top: 2px;
}

/* top comps */
.fac-comps { display: grid; gap: 8px; }
.fac-comp {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px; background: var(--kc-bg-inset);
  border: 1px solid var(--kc-line-hairline); border-radius: var(--kc-r-md);
}
.fac-comp__rank {
  display: inline-grid; place-items: center; flex: none;
  width: 22px; height: 22px; border-radius: var(--kc-r-sm);
  font: 700 11px/1 var(--kc-font-display);
  background: var(--kc-bg-active); color: var(--kc-text-mid);
  border: 1px solid var(--kc-line-default);
}
.fac-comp__rank.is-top { color: var(--kc-rank-gold); border-color: color-mix(in oklab, var(--kc-rank-gold) 45%, transparent); }
.fac-comp__icons { display: flex; align-items: center; gap: 4px; }

/* faction toggle dot */
.fac-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }

/* empty / error */
.fac-empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 32px 20px; }
.fac-empty__icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

/* segmented control (matches existing kc-seg usage) */
.kc-seg {
  display: inline-flex; align-self: flex-start;
  background: var(--kc-bg-inset); border-radius: var(--kc-r-md);
  border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px;
}
.kc-seg__btn {
  height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm);
  border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui);
  background: transparent; color: var(--kc-text-mid); white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px;
}
.kc-seg__btn.is-sel {
  background: var(--kc-bg-active); color: var(--kc-text-hi);
  box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600;
}
.kc-seg__btn--fac.is-alliance { color: var(--kc-faction-alliance); }
.kc-seg__btn--fac.is-horde { color: var(--kc-faction-horde); }

@media (max-width: 640px) {
  .fac-controls { width: 100%; }
}
</style>
