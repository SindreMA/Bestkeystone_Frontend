<template>
  <div class="kc-root kc-dungeons">
    <div class="kc-container">
      <KcPageHeader eyebrow="Statistics" title="Dungeons" sub="What's the best dungeon to run this week — ranked by score and success rate." />

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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import SF from 'src/SharedFunctions'
import { useKc } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcRankChip from 'components/keystone/KcRankChip.vue'
import KcScorePill from 'components/keystone/KcScorePill.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'
import KcDungeonThumb from 'components/keystone/KcDungeonThumb.vue'
import KcBestWeek from 'components/keystone/KcBestWeek.vue'

const { store, data, dungeonByKeystoneId, fmtNum } = useKc()

function ensureData() {
  if (!data.SelectedPeriode) return
  if (!data.Dungeons_Data || data.Dungeons_Data.periode !== data.SelectedPeriode) store.dispatch('fetchDungeonData')
  store.dispatch('fetchDungeonSuccessRateData', data.SelectedPeriode)
}
onMounted(ensureData)
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
</script>

<style scoped>
.kc-dungeons { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

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

@media (max-width: 720px) {
  .kc-dgn__head { display: none; }
  .kc-dgn__row { grid-template-columns: auto 1.6fr auto auto; gap: 10px; }
  .kc-dgn__runs { display: none; }
}
</style>
