<template>
  <div class="kc-card kc-card--l2 kc-hero">
    <div class="kc-hero__rule" />

    <div class="kc-hero__art" :style="artStyle">
      <div class="kc-hero-inner">
        <!-- left: the answer -->
        <div class="kc-hero__main">
          <div class="kc-hero__topline">
            <span class="kc-eyebrow kc-hero__rank">#1 This Week</span>
            <span class="kc-chip-stier">S TIER</span>
            <KcDeltaChip :delta="0" :has-data="false" />
          </div>

          <div class="kc-hero__name-row">
            <KcDungeonThumb :dungeon="dungeonDetails" :size="56" radius="var(--kc-r-lg)" />
            <div>
              <div class="kc-eyebrow kc-hero__short">{{ dungeonDetails?.short_name || '—' }}</div>
              <h1 class="kc-disp kc-hero__name">{{ dungeonDetails?.name || 'Loading…' }}</h1>
            </div>
          </div>

          <div class="kc-hero__desc">
            Best score-per-run and easiest to time this week. The literal answer to
            <em>what's the best dungeon this week?</em>
          </div>

          <div class="kc-hero__stats">
            <div>
              <div class="kc-eyebrow kc-hero__stat-label">Avg score</div>
              <div class="kc-disp kc-tnum kc-hero__stat-num">{{ avgScore != null ? avgScore : '—' }}</div>
            </div>
            <KcSuccessRing :pct="successPct" :sample="best?.total_runs ?? null" :size="48" />
            <div>
              <div class="kc-eyebrow kc-hero__stat-label">Runs tracked</div>
              <div class="kc-disp kc-tnum kc-hero__stat-num">{{ fmtNum(best?.total_runs ?? null) }}</div>
            </div>
          </div>

          <div class="kc-hero__cta">
            <button class="kc-btn kc-btn--primary" @click="goDungeons">
              See all dungeons
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>

        <!-- right: affixes + S-tier specs -->
        <div class="kc-hero__side">
          <div class="kc-eyebrow kc-hero__side-label">Active affixes</div>
          <div class="kc-hero__affixes">
            <template v-if="currentAffixes.length">
              <Affix v-for="(a, i) in currentAffixes" :key="i" :affixid="a" :size="34" :tooltip="true" :detailed="true" />
            </template>
            <template v-else>
              <q-skeleton v-for="i in 3" :key="`sk-${i}`" type="QAvatar" size="34px" />
            </template>
          </div>

          <div class="kc-eyebrow kc-hero__side-label" style="margin-top: 18px;">S-tier specs</div>
          <div class="kc-hero__specs">
            <template v-if="sTierSpecs.length">
              <span
                v-for="s in sTierSpecs"
                :key="s.spec"
                class="kc-spec-chip"
                :style="{ borderColor: chipBorder(s.spec) }"
              >
                <KcSpecIcon :spec-id="s.spec" :size="20" />
                <span class="kc-spec-chip__name" :style="{ color: classColorForSpec(s.spec) }">{{ specLabel(s.spec) }}</span>
              </span>
            </template>
            <span v-else class="kc-hero__side-empty">Gathering spec meta…</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import SF from 'src/SharedFunctions'
import { useKc } from './useKc'
import KcDungeonThumb from './KcDungeonThumb.vue'
import KcSuccessRing from './KcSuccessRing.vue'
import KcDeltaChip from './KcDeltaChip.vue'
import KcSpecIcon from './KcSpecIcon.vue'
import Affix from 'components/Icons/Affix/index.vue'

const router = useRouter()
const { store, data, dungeonByKeystoneId, classColorForSpec, classById, specById, cloud, fmtNum } = useKc()

/* ---- ensure the data the hero needs is loaded ----
   Note: the success-rate data is fetched once by KcDungeonTrends' fetcher; the
   hero is a pure reactive reader of it (see successPct) so we don't dispatch it
   here — that avoids a redundant request and the store's grow-on-push shape. */
function ensureData() {
  if (data.SelectedPeriode) {
    if (!data.Dungeons_Data || data.Dungeons_Data.periode !== data.SelectedPeriode) {
      store.dispatch('fetchDungeonData')
    }
    if (!data.Spec_Data) store.dispatch('fetchSpecData')
  }
}
onMounted(ensureData)
watch(() => data.SelectedPeriode, ensureData)

/* ---- rank dungeons the same way the app's dungeon board does ---- */
const rankedDungeons = computed<any[]>(() => {
  const dd = data.Dungeons_Data
  if (!dd || !dd.data || !dd.data.length) return []
  const items = dd.data.map((x: any) => ({ ...x }))
  const total = SF.GetTotalScore(dd.data)
  const scoreType = data.settings?.score_type || 'mean'
  for (const s of items) {
    s.display_score = SF.GetPoints(s.score, scoreType, total, s.total_runs)
  }
  return SF.getListWithRank(items)
})
const best = computed<any>(() => rankedDungeons.value[0] || null)
const dungeonDetails = computed<any>(() => (best.value ? dungeonByKeystoneId(best.value.id) : null))
const avgScore = computed<number | null>(() => {
  const b = best.value
  if (!b || !b.total_runs) return null
  return Math.round(b.score / b.total_runs)
})

/* ---- success rate for the best dungeon (defensive read of messy store shape) ---- */
const successPct = computed<number | null>(() => {
  const b = best.value
  if (!b) return null
  let raw: any = store.getters.GetDungeonSuccessRateData
  if (!raw) return null
  // The store nests later pushes as arrays; flatten one level defensively.
  const entries: any[] = []
  for (const e of raw) Array.isArray(e) ? entries.push(...e) : entries.push(e)
  const settings = data.settings
  const entry = entries.find((e) =>
    e && e.id === data.SelectedPeriode &&
    (!e.settings || (e.settings.max_runs === settings.max_runs &&
      e.settings.min_keystonelevel === settings.min_keystonelevel &&
      e.settings.limitbylowestdungeon === settings.limitbylowestdungeon))
  ) || entries[0]
  const rows: any[] = entry?.data || []
  const row = rows.find((r) => (r.id ?? r.zone_id) === b.id)
  return row != null && row.ontime_percent != null ? Math.round(row.ontime_percent) : null
})

/* ---- current week affixes ---- */
const currentAffixes = computed<number[]>(() => {
  const periodes = store.getters.GetPeriodes
  return (periodes && periodes[0] && periodes[0].affixes) || []
})

/* ---- S-tier specs = most-played specs this week ---- */
const sTierSpecs = computed<any[]>(() => {
  const sd = data.Spec_Data
  if (!sd || !sd.data) return []
  return [...sd.data]
    .filter((s: any) => s.runs > 0)
    .sort((a: any, b: any) => b.runs - a.runs)
    .slice(0, 6)
})
const specLabel = (specId: number) => {
  const spec: any = specById(specId)
  if (!spec) return ''
  const cls: any = classById(spec.class ?? spec.Class)
  return `${spec.name}${cls?.name ? ' ' + cls.name : ''}`
}
const chipBorder = (specId: number) => {
  const c = classColorForSpec(specId)
  // raw class colors can be bright; keep the border quiet
  return c.startsWith('var(') ? 'var(--kc-line-default)' : c + '66'
}

/* ---- hero background uses the real dungeon art, scrimmed ---- */
const artStyle = computed(() => {
  const img = cloud(dungeonDetails.value?.imageurl, 900, 60)
  const scrim = 'linear-gradient(90deg, rgba(6,9,15,0.94) 0%, rgba(6,9,15,0.72) 45%, rgba(6,9,15,0.40) 100%)'
  return img
    ? { backgroundImage: `${scrim}, url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(135deg, #1b2638, #0d121a)' }
})

const goDungeons = () => router.push('/statistics/dungeons')
</script>

<style scoped>
.kc-hero { padding: 0; overflow: hidden; position: relative; }
.kc-hero__rule { height: 3px; background: var(--kc-brand-gradient); }
.kc-hero__art { position: relative; min-height: 260px; }

.kc-hero-inner {
  position: relative;
  padding: var(--kc-sp-6);
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--kc-sp-6);
}
@media (max-width: 900px) {
  .kc-hero-inner { grid-template-columns: 1fr; gap: var(--kc-sp-5); }
}

.kc-hero__main { min-width: 0; }
.kc-hero__topline { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.kc-hero__rank { color: var(--kc-signal-cyan); }
.kc-chip-stier {
  display: inline-flex; align-items: center; height: 22px; padding: 0 8px;
  border-radius: var(--kc-r-md); background: var(--kc-tier-s); color: var(--kc-text-inverse);
  font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
}

.kc-hero__name-row { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
.kc-hero__short { color: var(--kc-text-mid); }
.kc-hero__name { font-size: 40px; line-height: 44px; font-weight: 700; }

.kc-hero__desc { font-size: 14px; color: var(--kc-text-mid); margin-bottom: 18px; max-width: 420px; }

.kc-hero__stats { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.kc-hero__stat-label { margin-bottom: 4px; }
.kc-hero__stat-num { font-size: 30px; font-weight: 700; }

.kc-hero__cta { margin-top: 18px; }

.kc-hero__side { min-width: 0; }
.kc-hero__side-label { margin-bottom: 10px; }
.kc-hero__affixes { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.kc-hero__specs { display: flex; flex-wrap: wrap; gap: 6px; }
.kc-hero__side-empty { font-size: 12px; color: var(--kc-text-low); }

.kc-spec-chip {
  display: inline-flex; align-items: center; gap: 6px; height: 28px;
  padding: 0 10px 0 4px; border-radius: var(--kc-r-md);
  background: var(--kc-bg-inset); border: 1px solid var(--kc-line-hairline);
}
.kc-spec-chip__name { font-size: 11px; font-weight: 600; white-space: nowrap; }

/* primary button */
.kc-btn {
  display: inline-flex; align-items: center; gap: 7px; justify-content: center;
  height: 34px; padding: 0 14px; border-radius: var(--kc-r-md);
  font: 600 13px/1 var(--kc-font-ui); cursor: pointer; border: 1px solid transparent;
  transition: background var(--kc-motion-fast) ease;
}
.kc-btn--primary { background: var(--kc-accent); color: var(--kc-text-inverse); }
.kc-btn--primary:hover { background: var(--kc-accent-hover); }
</style>
