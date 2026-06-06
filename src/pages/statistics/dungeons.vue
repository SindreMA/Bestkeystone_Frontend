<template>
  <div class="kc-root kc-dungeons">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Statistics"
        title="Dungeons"
        :sub="mode === 'tier'
          ? `Easiest → hardest to time at ${levelLabel} this week.`
          : `What's the best dungeon to run this week — ranked by score and success rate.`"
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

      <!-- ============ RANKING MODE (existing real-data content) ============ -->
      <template v-if="mode === 'rank'">
        <KcCard v-if="ranked.length" :level="1" :body-style="{ padding: '0' }">
          <div class="kc-dgn__head">
            <span class="kc-eyebrow" style="text-align:center;">#</span>
            <span class="kc-eyebrow">Dungeon</span>
            <span class="kc-eyebrow" style="text-align:right;">Runs</span>
            <span class="kc-eyebrow" style="text-align:right;">{{ scoreLabel }}</span>
            <span class="kc-eyebrow" style="text-align:center;">Success</span>
          </div>
          <div
            v-for="(d, i) in ranked"
            :key="d.id"
            class="kc-dgn__row"
            :style="{ borderLeftColor: tierColor(tierFor(i, ranked.length)) }"
          >
            <KcRankChip :rank="i + 1" size="sm" />
            <span class="kc-dgn__name">
              <KcDungeonThumb :keystone-id="d.id" :size="34" />
              <span class="kc-dgn__name-text">
                <span class="kc-dgn__name-main">{{ dungeonName(d.id) }}</span>
                <span class="kc-eyebrow kc-dgn__name-short">{{ dungeonShort(d.id) }}</span>
              </span>
            </span>
            <span class="kc-tnum kc-dgn__runs">{{ fmtNum(d.total_runs) }}</span>
            <KcScorePill :score="d._val" :column-max="columnMax" :tier="tierFor(i, ranked.length)" :mode="scoreType === 'percent' ? 'share' : 'total'" :sample="null" />
            <span class="kc-dgn__success">
              <KcSuccessRing :pct="successFor(d.id)" :size="36" :caption="false" />
            </span>
          </div>
        </KcCard>
        <div v-else class="kc-dungeons__loading"><q-skeleton height="320px" /></div>

        <!-- Best week for each dungeon -->
        <div class="kc-dungeons__bestweek">
          <KcBestWeek />
        </div>
      </template>

      <!-- ============ TIER LIST MODE (real /Meta/dungeon-tier endpoint) ============ -->
      <template v-else>
        <KcCard :level="1" header="Time difficulty" :body-style="{ padding: '0' }">
          <template #headerRight>
            <div class="kc-dgn__scope">
              <button
                v-for="lb in levelBands"
                :key="lb"
                class="kc-chip"
                :class="{ 'is-sel': lb === level }"
                @click="level = lb"
              >{{ lb }}</button>
            </div>
          </template>

          <!-- loaded -->
          <template v-if="!tierLoading && !tierError && tierRows.length">
            <div class="kc-dgn__head kc-dgn__head--tier">
              <span class="kc-eyebrow" style="text-align:center;">Tier</span>
              <span class="kc-eyebrow">Dungeon</span>
              <span class="kc-eyebrow">Timed-rate band</span>
              <span class="kc-eyebrow" style="text-align:center;">Timed</span>
              <span class="kc-eyebrow" style="text-align:right;">Avg clear</span>
              <span class="kc-eyebrow" style="text-align:right;">Δ wk</span>
            </div>
            <div
              v-for="r in tierRows"
              :key="r.zone"
              class="kc-dgn__row kc-dgn__row--tier"
              :style="{ borderLeftColor: tierColor(String(r.tier).toLowerCase()) }"
            >
              <span class="kc-dgn__tier"><KcTierBadge :tier="r.tier" lg /></span>
              <span class="kc-dgn__name">
                <KcDungeonThumb :dungeon="dungeonByZone[r.zone]" :size="34" />
                <span class="kc-dgn__name-text">
                  <span class="kc-dgn__name-main">{{ dungeonByZone[r.zone]?.name || r.zone }}</span>
                  <span class="kc-eyebrow kc-dgn__name-short">{{ dungeonByZone[r.zone]?.abbr }}</span>
                </span>
              </span>
              <span class="kc-dgn__band">
                <span class="kc-dgn__band-fill" :style="{ width: `${r.timed * 100}%`, background: tierColor(String(r.tier).toLowerCase()) }" />
              </span>
              <span class="kc-dgn__success">
                <KcSuccessRing :pct="Math.round(r.timed * 100)" :size="36" :caption="false" />
              </span>
              <span class="kc-dgn__clear">
                <span class="kc-mono kc-tnum kc-dgn__clear-num">{{ fmtMs(r.avgMs) }}</span>
                <span class="kc-eyebrow">avg clear</span>
              </span>
              <span class="kc-dgn__delta"><KcDeltaChip :delta="r.delta" /></span>
            </div>

            <div class="kc-dgn__foot">
              Tier from the corpus timed-rate distribution at {{ levelLabel }} · Δ vs last week.
              Drive “at +N” with the <strong>Level</strong> chips above.
            </div>
          </template>

          <!-- loading skeleton -->
          <div v-else-if="tierLoading" class="kc-dungeons__loading">
            <q-skeleton height="320px" />
          </div>

          <!-- error -->
          <div v-else-if="tierError" class="kc-dungeons__empty">
            Couldn’t load tier data for {{ levelLabel }}. Please try again.
          </div>

          <!-- empty -->
          <div v-else class="kc-dungeons__empty">No tier data for {{ levelLabel }}.</div>
        </KcCard>

        <!-- ============ SUPPORTING CARDS (tier-list mode only) ============ -->
        <div class="kc-dgn__secondary">
          <!-- A6 — Tyrannical vs Fortified (awaiting backend) -->
          <KcCard :level="1" header="Affix impact · Tyrannical vs Fortified" :body-style="{ padding: '0' }">
            <template #headerRight><span class="kc-eyebrow" style="margin:0;">this week</span></template>
            <div class="kc-dgn__coming">
              <div class="kc-dgn__coming-icon">◌</div>
              <div>Needs a backend — coming soon</div>
            </div>
          </KcCard>

          <!-- A7 — chest cushion distribution (awaiting backend) -->
          <KcCard :level="1" header="Time-vs-par cushion" :body-style="{ padding: '0' }">
            <div class="kc-dgn__coming">
              <div class="kc-dgn__coming-icon">◌</div>
              <div>Needs a backend — coming soon</div>
            </div>
          </KcCard>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import SF from 'src/SharedFunctions'
import { useKc } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcRankChip from 'components/keystone/KcRankChip.vue'
import KcScorePill from 'components/keystone/KcScorePill.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'
import KcDungeonThumb from 'components/keystone/KcDungeonThumb.vue'
import KcBestWeek from 'components/keystone/KcBestWeek.vue'
import KcTierBadge from 'components/keystone/KcTierBadge.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
// Reference labels only (real dungeon/zone metadata + level-band constants).
// NO fabricated stats — those used to come from src/mocks/meta and are gone.
import { dungeonByZone, levelBands, type DungeonTierRow } from 'src/data/metaReference'

const { store, data, dungeonByKeystoneId, fmtNum } = useKc()

/* ---------------- mode + level scope ---------------- */
const MODES = [
  { v: 'rank', label: 'Ranking' },
  { v: 'tier', label: 'Tier list' },
] as const
const mode = ref<'rank' | 'tier'>('rank')

const level = ref<string>('+15')
const levelLabel = computed(() => (level.value === 'All' ? '+15' : level.value))

/* ---------------- tier-list mode (real /Meta/dungeon-tier endpoint) ----------------
   GET ${apiUrl}/Meta/dungeon-tier?periode=<SelectedPeriode>&level=<level>
   -> { level, rows: [{ zone, tier, timed, avgMs, delta }] }
   The endpoint may 404 until the backend deploys — that is acceptable, the view
   shows a clean loading → empty / error state and NEVER fabricated numbers. */
const tierRows = ref<DungeonTierRow[]>([])
const tierLoading = ref(false)
const tierError = ref(false)

function fetchTier() {
  if (mode.value !== 'tier') return
  const apiUrl = data.apiUrl
  const periode = data.SelectedPeriode
  if (!apiUrl || periode == null) return
  tierLoading.value = true
  tierError.value = false
  axios
    .get(`${apiUrl}/Meta/dungeon-tier?periode=${periode}&level=${encodeURIComponent(level.value)}`)
    .then((r) => {
      tierRows.value = (r.data?.rows || []) as DungeonTierRow[]
    })
    .catch((e) => {
      console.log(e)
      tierRows.value = []
      tierError.value = true
    })
    .finally(() => {
      tierLoading.value = false
    })
}

/* Fetch when entering tier mode, when the level chip changes, or when the
   selected periode changes (only re-fetches while tier mode is active). */
watch(mode, fetchTier)
watch(level, fetchTier)
watch(() => data.SelectedPeriode, () => { if (mode.value === 'tier') fetchTier() })

/* ---------------- existing ranking-mode data (unchanged) ---------------- */
function ensureData() {
  if (!data.SelectedPeriode) return
  if (!data.Dungeons_Data || data.Dungeons_Data.periode !== data.SelectedPeriode) store.dispatch('fetchDungeonData')
  store.dispatch('fetchDungeonSuccessRateData', data.SelectedPeriode)
}
onMounted(() => {
  ensureData()
  fetchTier()
})
watch(() => data.SelectedPeriode, ensureData)

const scoreType = computed<string>(() => data.settings?.score_type || 'mean')
const scoreLabel = computed(() => ({ total: 'Total score', percent: 'Share %', mean: 'Avg score' }[scoreType.value] || 'Score'))

const dungeonList = computed<any[]>(() => (data.Dungeons_Data && data.Dungeons_Data.data) || [])

const ranked = computed<any[]>(() => {
  const list = dungeonList.value
  if (!list.length) return []
  const total = SF.GetTotalScore(list)
  const items = list.map((d: any) => {
    let val: number
    if (scoreType.value === 'mean') val = d.total_runs ? Math.round(d.score / d.total_runs) : 0
    else if (scoreType.value === 'percent') val = total ? +((d.score / total) * 100).toFixed(1) : 0
    else val = d.score
    return { ...d, _val: val }
  })
  return items.sort((a, b) => b._val - a._val)
})
const columnMax = computed(() => Math.max(1, ...ranked.value.map((d) => d._val)))

const dungeonName = (id: number) => dungeonByKeystoneId(id)?.name || '—'
const dungeonShort = (id: number) => { const d: any = dungeonByKeystoneId(id); return d?.short_name || d?.name || '' }

const tierFor = (i: number, n: number) => (i === 0 ? 's' : i < n * 0.2 ? 'a' : i < n * 0.45 ? 'b' : i < n * 0.75 ? 'c' : 'd')
const tierColor = (t: string) => `var(--kc-tier-${t})`

/* success rate per dungeon (defensive read of the success-rate store shape) */
function successFor(keystoneId: number): number | null {
  const raw: any = store.getters.GetDungeonSuccessRateData
  if (!raw) return null
  const entries: any[] = []
  for (const e of raw) Array.isArray(e) ? entries.push(...e) : entries.push(e)
  const s = data.settings
  const entry = entries.find((e) =>
    e && e.id === data.SelectedPeriode &&
    (!e.settings || (e.settings.max_runs === s.max_runs && e.settings.min_keystonelevel === s.min_keystonelevel && e.settings.limitbylowestdungeon === s.limitbylowestdungeon))
  ) || entries[0]
  const rows: any[] = entry?.data || []
  const row = rows.find((r) => (r.id ?? r.zone_id) === keystoneId)
  return row != null && row.ontime_percent != null ? Math.round(row.ontime_percent) : null
}

/* ---------------- helpers ---------------- */
function fmtMs(ms: number): string {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.kc-dungeons { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

/* ---- segmented control (matches compositions.vue) ---- */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* ---- ranking table (existing) ---- */
.kc-dgn__head, .kc-dgn__row {
  display: grid;
  grid-template-columns: 30px minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr) 90px;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
}
.kc-dgn__head > *, .kc-dgn__row > * { min-width: 0; }
.kc-dgn__head > :first-child, .kc-dgn__row > :first-child { justify-self: center; }
.kc-dgn__head { height: 38px; background: var(--kc-bg-raised); border-bottom: 1px solid var(--kc-line-hairline); }
.kc-dgn__head .kc-eyebrow { color: var(--kc-text-low); }
.kc-dgn__row {
  min-height: 52px;
  border-left: 3px solid var(--kc-line-strong);
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.kc-dgn__row:hover { background: var(--kc-bg-hover); }
.kc-dgn__name { display: flex; align-items: center; gap: 12px; min-width: 0; }
.kc-dgn__name-text { min-width: 0; }
.kc-dgn__name-main { display: block; font-size: 14px; font-weight: 600; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-dgn__name-short { color: var(--kc-text-low); }
.kc-dgn__runs { text-align: right; font-size: 13px; color: var(--kc-text-mid); justify-self: end; }
.kc-dgn__success { display: flex; justify-content: center; }

.kc-dungeons__bestweek { margin-top: var(--kc-sp-7); }
.kc-dungeons__empty { padding: var(--kc-sp-6); text-align: center; color: var(--kc-text-low); font-size: 13px; }

@media (max-width: 720px) {
  .kc-dgn__head { display: none; }
  .kc-dgn__row { grid-template-columns: auto 1.6fr auto auto; gap: 10px; }
  .kc-dgn__runs { display: none; }
}

/* ---- tier-list mode ---- */
.kc-dgn__scope { display: flex; gap: 4px; flex-wrap: wrap; }
.kc-chip {
  height: 24px; padding: 0 9px; border-radius: var(--kc-r-sm);
  border: 1px solid var(--kc-line-default); background: var(--kc-bg-inset);
  color: var(--kc-text-mid); font: 600 11px/1 var(--kc-font-ui); cursor: pointer;
  transition: color var(--kc-motion-fast) ease, border-color var(--kc-motion-fast) ease;
}
.kc-chip:hover { color: var(--kc-text-hi); border-color: var(--kc-line-strong); }
.kc-chip.is-sel { background: var(--kc-accent); border-color: var(--kc-accent); color: var(--kc-text-inverse); }

.kc-dgn__head--tier, .kc-dgn__row--tier {
  grid-template-columns: 44px minmax(0, 1.7fr) minmax(0, 1fr) 56px minmax(0, 88px) 64px;
}
.kc-dgn__head--tier > :first-child, .kc-dgn__row--tier > :first-child { justify-self: center; }
.kc-dgn__tier { display: flex; justify-content: center; }
.kc-dgn__band { height: 7px; background: var(--kc-bg-inset); border-radius: 4px; overflow: hidden; }
.kc-dgn__band-fill { display: block; height: 100%; border-radius: 4px; opacity: 0.85; }
.kc-dgn__clear { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.15; }
.kc-dgn__clear-num { font-size: 13px; font-weight: 700; color: var(--kc-text-hi); }
.kc-dgn__delta { display: flex; justify-content: flex-end; }
.kc-dgn__foot {
  padding: 12px 16px; font-size: 12px; color: var(--kc-text-low);
  border-top: 1px solid var(--kc-line-hairline);
}
.kc-dgn__foot strong { color: var(--kc-accent); font-weight: 700; }

/* ---- secondary cards ---- */
.kc-dgn__secondary {
  margin-top: var(--kc-sp-7);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
  gap: var(--kc-sp-5);
}
.kc-dgn__secondary > * { min-width: 0; }

/* honest "awaiting backend" empty state for the supporting cards */
.kc-dgn__coming { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: var(--kc-sp-7) var(--kc-sp-5); }
.kc-dgn__coming-icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

@media (max-width: 720px) {
  .kc-dgn__head--tier { display: none; }
  .kc-dgn__row--tier { grid-template-columns: auto 1.5fr auto auto; gap: 10px; }
  .kc-dgn__band, .kc-dgn__clear { display: none; }
}
</style>
