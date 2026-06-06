<template>
  <div class="kc-root kc-fastest">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Leaderboard · Fastest Times"
        title="Fastest Times"
        sub="Ranked ascending by clear time relative to par."
      >
        <template #right>
          <div class="kc-seg">
            <button
              v-for="r in REGIONS"
              :key="r.v ?? 'world'"
              class="kc-seg__btn"
              :class="{ 'is-sel': r.v === region }"
              @click="region = r.v"
            >{{ r.label }}</button>
          </div>
        </template>
      </KcPageHeader>

      <!-- visual filter chips (dungeon / level) -->
      <div class="kc-fastest__filters">
        <span class="kc-fastest__filter-label">Dungeon</span>
        <button
          class="kc-fchip"
          :class="{ 'is-sel': zoneFilter === null }"
          @click="zoneFilter = null"
        >All</button>
        <button
          v-for="d in dungeons"
          :key="d.zone"
          class="kc-fchip"
          :class="{ 'is-sel': zoneFilter === d.zone }"
          :style="{ '--fchip-tint': d.tint }"
          @click="zoneFilter = zoneFilter === d.zone ? null : d.zone"
        >
          <span class="kc-fchip__dot" />
          {{ d.abbr }}
        </button>

        <span class="kc-fastest__filters-spacer" />

        <span class="kc-fastest__filter-label">Key</span>
        <button
          v-for="lvl in LEVELS"
          :key="lvl.v ?? 'all'"
          class="kc-fchip"
          :class="{ 'is-sel': lvlFilter === lvl.v }"
          @click="lvlFilter = lvl.v"
        >{{ lvl.label }}</button>
      </div>

      <!-- loading -->
      <KcCard v-if="loading" :level="1" :body-style="{ padding: '0' }">
        <div class="fast-head">
          <span>#</span><span>Dungeon</span><span>Key</span>
          <span class="kc-ta-r">Time</span><span class="kc-ta-r">vs par</span>
          <span>Composition</span><span>Region</span>
        </div>
        <div class="kc-statlist">
          <div v-for="i in 8" :key="i" class="fast-row">
            <q-skeleton type="QChip" size="26px" />
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="QChip" width="34px" height="22px" />
            <q-skeleton type="text" width="50px" class="kc-ta-r" />
            <q-skeleton type="text" width="40px" class="kc-ta-r" />
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="60%" />
          </div>
        </div>
      </KcCard>

      <!-- error (endpoint unavailable) -->
      <KcCard v-else-if="error" :level="1">
        <div class="kc-fastest__empty">
          <div class="kc-fastest__empty-icon">⚠</div>
          Fastest times are unavailable right now.
        </div>
      </KcCard>

      <!-- data -->
      <KcCard v-else-if="rows.length" :level="1" :body-style="{ padding: '0' }">
        <div class="fast-head">
          <span>#</span><span>Dungeon</span><span>Key</span>
          <span class="kc-ta-r">Time</span><span class="kc-ta-r">vs par</span>
          <span>Composition</span><span>Region</span>
        </div>
        <div class="kc-statlist">
          <div v-for="(r, i) in rows" :key="`${r.rank}-${r.zone}-${r.lvl}`" class="fast-row">
            <KcRankChip :rank="i + 1" size="sm" />

            <span class="fast-row__dgn">
              <span
                class="kc-dthumb-mini kc-disp"
                :style="{ '--dthumb': dungeonByZone[r.zone]?.tint || 'var(--kc-accent)' }"
                :title="dungeonByZone[r.zone]?.name"
              >{{ dungeonByZone[r.zone]?.abbr || r.zone }}</span>
              <span class="fast-row__name">{{ dungeonByZone[r.zone]?.name || r.zone }}</span>
            </span>

            <KcKeystoneChip :level="r.lvl" size="sm" />

            <span class="kc-mono fast-time">{{ fmtMsLong(r.ms) }}</span>

            <span class="kc-ta-r">
              <span class="kc-delta kc-delta--pos">{{ fmtPar(r.underPar) }}</span>
            </span>

            <span class="fast-row__comp">
              <KcSpecIcon
                v-for="(id, j) in r.comp"
                :key="j"
                :spec-id="Number(id)"
                :size="20"
              />
            </span>

            <span class="kc-mono fast-region">{{ regionLabel(r.region) }}</span>
          </div>
        </div>
      </KcCard>

      <!-- empty -->
      <KcCard v-else :level="1">
        <div class="kc-fastest__empty">
          <div class="kc-fastest__empty-icon">⚡</div>
          No fastest times match these filters yet.
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useKc } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcRankChip from 'components/keystone/KcRankChip.vue'
import KcKeystoneChip from 'components/keystone/KcKeystoneChip.vue'
import KcSpecIcon from 'components/keystone/KcSpecIcon.vue'
import { dungeons, dungeonByZone, type FastestRow } from 'src/data/metaReference'

/* ── data source: real /Meta/fastest endpoint ────────────────────────────────
   GET ${apiUrl}/Meta/fastest?periode=<SelectedPeriode>&zone=<zone>&level=<lvl>&region=<region>
   -> [{ rank, zone, lvl, ms, comp:[specIds], region, underPar }]
   The aggregate job may not have run yet — the endpoint then returns 200 with
   [] and we show a clean empty state. We NEVER fabricate rows: the page renders
   loading → data | empty | error and nothing in between.

   periode comes from the global scope (Vuex SelectedPeriode). The Region /
   Dungeon / Key chips drive the zone / level / region query params and refetch
   server-side, so they always reflect what the backend actually has.

   Dungeon thumbnails render from the real dungeon zone/tint metadata
   (src/data/metaReference). Composition spec icons resolve their numeric spec
   ids through the live Vuex store via KcSpecIcon (class colour + CDN icon), so
   there is no page-local class-colour table anymore. */
const { store, data } = useKc()

/* ---- filters (now server-side via query params) ---- */
const REGIONS = [
  { label: 'World', v: '' },
  { label: 'EU', v: 'eu' },
  { label: 'US', v: 'us' },
  { label: 'KR', v: 'kr' },
  { label: 'TW', v: 'tw' },
] as const
const LEVELS = [
  { label: 'All', v: null as number | null },
  { label: '+16', v: 16 },
  { label: '+18', v: 18 },
  { label: '+20', v: 20 },
]
const region = ref<string>('')
const zoneFilter = ref<string | null>(null)
const lvlFilter = ref<number | null>(null)

/* ---- data ---- */
const loading = ref(false)
const error = ref(false)
const rows = ref<FastestRow[]>([])

async function fetchFastest() {
  const apiUrl = data.apiUrl
  const periode = data.SelectedPeriode
  if (!apiUrl || periode == null) {
    rows.value = []
    return
  }
  loading.value = true
  error.value = false
  const zone = zoneFilter.value ?? ''
  const level = lvlFilter.value ?? ''
  const reg = region.value
  try {
    const r = await axios.get(
      `${apiUrl}/Meta/fastest?periode=${periode}&zone=${encodeURIComponent(zone)}` +
        `&level=${encodeURIComponent(String(level))}&region=${encodeURIComponent(reg)}`,
    )
    // guard against a stale response arriving after the scope changed again
    if (
      periode !== data.SelectedPeriode ||
      zone !== (zoneFilter.value ?? '') ||
      level !== (lvlFilter.value ?? '') ||
      reg !== region.value
    ) {
      return
    }
    rows.value = Array.isArray(r.data) ? (r.data as FastestRow[]) : []
  } catch (e) {
    console.log(e)
    rows.value = []
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchFastest)
watch(() => data.SelectedPeriode, fetchFastest)
watch([region, zoneFilter, lvlFilter], fetchFastest)

/* ---- formatting (ports fmtMsLong + vs-par from the design) ---- */
function fmtMsLong(ms: number): string {
  const t = Math.round(ms / 1000)
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
// underPar is stored negative (e.g. -0.38). Design renders the magnitude as a
// positive "% under par" green delta.
const fmtPar = (underPar: number) => `${Math.round(Math.abs(underPar) * 100)}%`

// Region codes come back lowercase from the backend (eu/us/kr/tw).
const regionLabel = (r: string) => (r || '').toUpperCase()
</script>

<style scoped>
.kc-fastest { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
.kc-ta-r { text-align: right; }

/* ---- filter chip row ---- */
.kc-fastest__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.kc-fastest__filters-spacer { flex: 1 1 16px; }
.kc-fastest__filter-label {
  font-family: var(--kc-font-display);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--kc-text-low);
  margin-right: 2px;
}
.kc-fchip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--kc-r-md);
  border: 1px solid var(--kc-line-default);
  background: var(--kc-bg-inset);
  color: var(--kc-text-mid);
  font: 600 12px/1 var(--kc-font-display);
  letter-spacing: 0.02em;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color var(--kc-motion-fast) ease, background var(--kc-motion-fast) ease, color var(--kc-motion-fast) ease;
}
.kc-fchip:hover { border-color: var(--kc-line-strong); background: var(--kc-bg-hover); color: var(--kc-text-hi); }
.kc-fchip.is-sel { border-color: var(--kc-accent); background: var(--kc-accent-quiet, rgba(91,141,239,0.14)); color: var(--kc-text-hi); }
.kc-fchip__dot { width: 8px; height: 8px; border-radius: 99px; background: var(--fchip-tint, var(--kc-accent)); flex: none; }

/* ---- segmented control (region) ---- */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* ---- table: head + rows (ports views.css .fast-head / .fast-row) ---- */
.fast-head,
.fast-row {
  display: grid;
  grid-template-columns: 30px minmax(120px, 1.3fr) 52px 64px 56px minmax(120px, 1fr) 44px;
  align-items: center;
  gap: var(--kc-sp-3);
}
.fast-head {
  padding: 8px 16px;
  font-size: 10.5px;
  color: var(--kc-text-low);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--kc-line-hairline);
}
.kc-statlist { display: flex; flex-direction: column; }
.fast-row {
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.fast-row:last-child { border-bottom: 0; }
.fast-row:hover { background: var(--kc-bg-hover); }

.fast-row__dgn { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fast-row__name { font-size: 13px; font-weight: 600; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fast-time { font-size: 14px; color: var(--kc-text-hi); text-align: right; font-weight: 500; }
.fast-region { font-size: 12px; color: var(--kc-text-mid); }
.fast-row__comp { display: flex; align-items: center; gap: 3px; min-width: 0; }

/* ---- delta chip (vs par) ---- */
.kc-delta {
  display: inline-flex; align-items: center; gap: 3px;
  height: 20px; padding: 0 7px; border-radius: var(--kc-r-sm);
  font-size: 11.5px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.kc-delta--pos { color: var(--kc-pos); background: color-mix(in oklab, var(--kc-pos) 14%, transparent); }

/* ---- mini dungeon thumb (zone abbr tile) ---- */
.kc-dthumb-mini {
  display: inline-grid; place-items: center; flex: none;
  width: 34px; height: 34px; border-radius: var(--kc-r-md);
  font-weight: 700; font-size: 12px; letter-spacing: 0.02em;
  color: var(--kc-text-hi);
  border: 1px solid var(--kc-line-default);
  background: linear-gradient(160deg, color-mix(in oklab, var(--dthumb, #5B8DEF) 38%, var(--kc-bg-raised)), var(--kc-bg-inset));
  position: relative; overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
.kc-dthumb-mini::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(60% 80% at 20% 0%, color-mix(in oklab, var(--dthumb, #5B8DEF) 40%, transparent), transparent 70%);
}

/* ---- empty ---- */
.kc-fastest__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 36px 20px; }
.kc-fastest__empty-icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

/* ---- responsive: drop comp + region columns, then vs par ---- */
@media (max-width: 820px) {
  .fast-head,
  .fast-row { grid-template-columns: 30px minmax(110px, 1.4fr) 48px 64px 52px; }
  .fast-head > :nth-child(6),
  .fast-head > :nth-child(7),
  .fast-row__comp,
  .fast-region { display: none; }
}
@media (max-width: 560px) {
  .fast-head,
  .fast-row { grid-template-columns: 28px minmax(0, 1fr) 44px 60px; }
  .fast-head > :nth-child(5),
  .fast-row > .kc-ta-r:last-of-type { display: none; }
}
@media (max-width: 600px) {
  .kc-container { padding-left: 12px; padding-right: 12px; }
}
</style>
