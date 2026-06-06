<template>
  <KcCard :level="1" header="What to farm next" :body-style="{ padding: '0' }">
    <template #headerRight><span class="kc-fnext__eyebrow">meta priority</span></template>

    <template v-if="!loading && !error && rows.length">
      <div v-for="r in rows" :key="r.zone" class="kc-fnext__row">
        <KcDungeonThumb :keystone-id="r.zone" :size="34" />
        <div class="kc-fnext__id min0">
          <div class="kc-fnext__name">{{ r.name }}</div>
          <div class="kc-fnext__you kc-mono">
            <template v-if="r.you">
              <span class="kc-fnext__youlbl">your best</span>
              <KcKeystoneChip :level="r.you.level" size="sm" />
              <span class="kc-fnext__youscore">· {{ Math.round(r.you.score) }}</span>
            </template>
            <span v-else class="kc-fnext__notrun">not run this season</span>
          </div>
        </div>
        <span class="kc-fnext__gain">
          <span class="kc-disp pos kc-fnext__gain-num">+{{ r.gain.toFixed(1) }}</span>
          <span class="kc-fnext__unit">score / +1</span>
        </span>
        <span class="kc-fnext__attain">
          <KcSuccessRing :pct="Math.round(r.attain * 100)" :size="32" :caption="false" />
          <span class="kc-fnext__unit">{{ attainLabel(r.attain) }}</span>
        </span>
      </div>
      <div class="kc-fnext__foot">
        Highest-value dungeons to push this week — marginal score per +1 × how timeable the next level is, across
        all tracked players. Your current best is shown for context, not a per-character projection.
      </div>
    </template>

    <div v-else-if="loading" class="kc-fnext__pad"><q-skeleton height="180px" /></div>
    <div v-else-if="error" class="kc-fnext__pad kc-fnext__empty">Couldn't load farm recommendations.</div>
    <div v-else class="kc-fnext__pad kc-fnext__empty">No farm recommendations yet.</div>
  </KcCard>
</template>

<script lang="ts" setup>
/* "What to farm next" — moved here from the standalone /tools/planner page so it
   lives on a character's profile. The marginal-gain + attainability ranking comes
   from the global /Meta/planner aggregate (it is the same meta-wide farm priority
   for everyone); we additionally surface THIS player's current best level + score
   per dungeon (from their own runs) so the recommendation is read in context. We
   do NOT fabricate a per-character projection. */
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import axios from 'axios'
import { useKc } from 'components/keystone/useKc'
import KcCard from 'components/keystone/KcCard.vue'
import KcDungeonThumb from 'components/keystone/KcDungeonThumb.vue'
import KcKeystoneChip from 'components/keystone/KcKeystoneChip.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'

const props = defineProps({
  runs: { type: Array, default: () => [] },
})
const { runs } = toRefs(props)

const { data, dungeonByKeystoneId } = useKc()

const loading = ref(false)
const error = ref(false)
const planner = ref<any[]>([])

/* the player's best (level + score) per dungeon zone, from their own runs */
const playerBest = computed<Record<number, { level: number; score: number }>>(() => {
  const best: Record<number, { level: number; score: number }> = {}
  for (const r of (runs.value as any[]) || []) {
    const z = r?.zone?.id
    if (z == null) continue
    const score = r.score ?? 0
    if (!best[z] || score > best[z].score) best[z] = { level: r.level ?? 0, score }
  }
  return best
})

// "What to farm next" is about the CURRENT week, so use the global selected
// periode (a weekly periode id). The player page's own `periode` is a season
// window ({start,end,season}) with no weekly id and is not what /Meta/planner
// expects, which is why the fetch never fired before.
const periodeId = computed<number | null>(() => {
  const sel = (data as any).SelectedPeriode
  return sel == null ? null : Number(sel)
})

const rows = computed(() =>
  [...planner.value]
    .sort((a, b) => (b.gain ?? 0) - (a.gain ?? 0))
    .map((r) => ({
      zone: r.zone,
      name: r.name || dungeonByKeystoneId(r.zone)?.name || `Zone ${r.zone}`,
      gain: r.gain ?? 0,
      attain: r.attain ?? 0,
      you: playerBest.value[r.zone] || null,
    })),
)

const attainLabel = (v: number) => (v >= 0.6 ? 'realistic' : v >= 0.45 ? 'tough' : 'long shot')

function fetchPlanner() {
  const apiUrl = data.apiUrl
  const pid = periodeId.value
  if (!apiUrl || pid == null) return
  loading.value = true
  error.value = false
  axios
    .get(`${apiUrl}/Meta/planner?periode=${pid}`)
    .then((r) => { planner.value = Array.isArray(r.data) ? r.data : [] })
    .catch((e) => { console.log(e); planner.value = []; error.value = true })
    .finally(() => { loading.value = false })
}
onMounted(fetchPlanner)
watch(periodeId, fetchPlanner)
</script>

<style scoped>
.kc-fnext__eyebrow { font-size: 11px; color: var(--kc-text-low); text-transform: uppercase; letter-spacing: 0.08em; }
.min0 { min-width: 0; }

.kc-fnext__row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
}
.kc-fnext__row:last-of-type { border-bottom: 0; }
.kc-fnext__row:hover { background: var(--kc-bg-hover); }

.kc-fnext__id { display: flex; flex-direction: column; line-height: 1.2; }
.kc-fnext__name { font-weight: 600; font-size: 14px; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-fnext__you { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--kc-text-low); margin-top: 3px; }
.kc-fnext__youlbl { color: var(--kc-text-mid); }
.kc-fnext__youscore { color: var(--kc-text-mid); }
.kc-fnext__notrun { color: var(--kc-text-ghost, var(--kc-text-low)); font-style: italic; }

.kc-fnext__gain { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.kc-fnext__gain-num { font-size: 18px; }
.kc-fnext__unit { font-size: 10px; color: var(--kc-text-low); }

.kc-fnext__attain { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 58px; }

.kc-fnext__foot { padding: 12px 16px; font-size: 11.5px; color: var(--kc-text-low); border-top: 1px solid var(--kc-line-hairline); }
.kc-fnext__pad { padding: 16px; }
.kc-fnext__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 28px 16px; }

@media (max-width: 480px) {
  .kc-fnext__row { grid-template-columns: 34px minmax(0, 1fr) auto; gap: 10px; }
  .kc-fnext__attain { display: none; }
}
</style>
