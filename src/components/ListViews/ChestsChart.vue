<template>
  <div class="kc-statlist kc-chest">
    <div class="kc-statlist__head">
      <span>Chest statistics</span>
      <span class="kc-statlist__count">{{ total }} runs</span>
    </div>

    <div v-if="total > 0" class="kc-chest__body">
      <div v-for="tier in tiers" :key="tier.k" class="kc-chest__row">
        <span class="kc-chest__pips">
          <span v-for="n in 3" :key="n" class="kc-chest__pip" :class="n <= tier.k ? `kc-chest__pip--${tier.tone}` : 'kc-chest__pip--off'" />
        </span>
        <span class="kc-chest__label">{{ tier.label }}</span>
        <span class="kc-chest__bar">
          <span class="kc-chest__fill" :class="`kc-chest__fill--${tier.tone}`" :style="{ width: barPct(tier.count) + '%' }" />
        </span>
        <span class="kc-chest__pct kc-tnum">{{ pctOfTotal(tier.count) }}%</span>
        <span class="kc-chest__count kc-tnum">{{ tier.count }}</span>
      </div>

      <div class="kc-chest__foot">
        <span><strong class="kc-tnum">{{ intimePct }}%</strong> in time</span>
        <span><strong class="kc-tnum">{{ total }}</strong> total runs</span>
      </div>
    </div>

    <div v-else class="kc-statlist__empty">No completed runs yet.</div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  runs: { type: Array<any>, default: () => [] }
})
const { runs } = toRefs(props)

// chest tiers from clear-time vs map-time (matches the legacy thresholds)
const counts = computed(() => {
  const r = runs.value || []
  const t3 = r.filter((x: any) => x.time.clear_time < x.time.map_time * 0.6).length
  const t2 = r.filter((x: any) => x.time.clear_time < x.time.map_time * 0.8 && x.time.clear_time >= x.time.map_time * 0.6).length
  const t1 = r.filter((x: any) => x.time.clear_time < x.time.map_time && x.time.clear_time >= x.time.map_time * 0.8).length
  const t0 = r.filter((x: any) => x.time.clear_time >= x.time.map_time).length
  return { t3, t2, t1, t0 }
})

const tiers = computed(() => [
  { k: 3, label: 'Three chests', tone: 'gold', count: counts.value.t3 },
  { k: 2, label: 'Two chests', tone: 'good', count: counts.value.t2 },
  { k: 1, label: 'One chest', tone: 'ok', count: counts.value.t1 },
  { k: 0, label: 'Depleted', tone: 'bad', count: counts.value.t0 },
])

const total = computed(() => tiers.value.reduce((a, t) => a + t.count, 0))
const maxCount = computed(() => Math.max(1, ...tiers.value.map(t => t.count)))
const barPct = (c: number) => Math.round((c / maxCount.value) * 100)
const pctOfTotal = (c: number) => (total.value ? Math.round((c / total.value) * 100) : 0)
const intimePct = computed(() => (total.value ? Math.round(((total.value - counts.value.t0) / total.value) * 100) : 0))
</script>

<style scoped>
.kc-chest__body { padding: 16px; display: flex; flex-direction: column; gap: 11px; }
.kc-chest__row {
  display: grid;
  grid-template-columns: 42px minmax(86px, auto) 1fr 38px 30px;
  align-items: center;
  gap: 12px;
}
.kc-chest__pips { display: flex; align-items: center; gap: 4px; }
.kc-chest__pip { width: 8px; height: 8px; transform: rotate(45deg); border-radius: 1px; flex: none; }
.kc-chest__pip--gold { background: var(--rank-gold); }
.kc-chest__pip--good { background: var(--pos); }
.kc-chest__pip--ok { background: var(--accent); }
.kc-chest__pip--bad { background: var(--neg); }
.kc-chest__pip--off { background: transparent; box-shadow: inset 0 0 0 1px var(--line-strong); }
.kc-chest__label { font-size: 13px; color: var(--text-hi); white-space: nowrap; }
.kc-chest__bar { height: 8px; background: var(--bg-inset); border-radius: 4px; overflow: hidden; }
.kc-chest__fill { display: block; height: 100%; border-radius: 4px; transition: width var(--transition-normal); }
.kc-chest__fill--gold { background: var(--rank-gold); }
.kc-chest__fill--good { background: var(--pos); }
.kc-chest__fill--ok { background: var(--accent); }
.kc-chest__fill--bad { background: var(--neg); opacity: 0.7; }
.kc-chest__pct { text-align: right; font-size: 12px; color: var(--text-mid); }
.kc-chest__count { text-align: right; font-size: 13px; font-weight: 600; color: var(--text-hi); }
.kc-chest__foot {
  display: flex; gap: 24px; justify-content: flex-end;
  margin-top: 2px; padding-top: 11px;
  border-top: 1px solid var(--line-hairline);
  font-size: 12px; color: var(--text-mid);
}
.kc-chest__foot strong { color: var(--text-hi); font-weight: 700; }

@media (max-width: 600px) {
  .kc-chest__row { grid-template-columns: 42px 1fr 34px 28px; }
  .kc-chest__bar { display: none; }
}
</style>
