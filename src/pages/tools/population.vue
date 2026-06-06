<template>
  <div class="kc-root kc-tools-population">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Population"
        title="Key-level Population Funnel"
        sub="Unique players who have timed at least one key at each level this season."
      >
        <template #right>
          <div class="kc-seg">
            <button
              v-for="r in REGIONS"
              :key="r"
              class="kc-seg__btn"
              :class="{ 'is-sel': r === region }"
              @click="region = r"
            >{{ r }}</button>
          </div>
        </template>
      </KcPageHeader>

      <!-- Filters: optional dungeon scope + "your key" marker -->
      <div class="kc-pop__filters">
        <div class="kc-pop__chips">
          <span class="kc-pop__chips-label kc-eyebrow">Dungeon</span>
          <button
            class="kc-pop__chip"
            :class="{ 'is-sel': dungeon === null }"
            @click="dungeon = null"
          >All</button>
          <button
            v-for="d in dungeons"
            :key="d.zone"
            class="kc-pop__chip"
            :class="{ 'is-sel': dungeon === d.zone }"
            :style="{ '--chip-tint': d.tint }"
            @click="dungeon = d.zone"
          >
            <span class="kc-pop__chip-dot" :style="{ background: d.tint }" />
            {{ d.abbr }}
          </button>
        </div>

        <label class="kc-pop__yourkey">
          <span class="kc-eyebrow">Your key</span>
          <input
            v-model.number="myKey"
            class="kc-input kc-pop__yourkey-input"
            type="number"
            min="2"
            max="30"
            placeholder="e.g. 15"
          />
        </label>
      </div>

      <!-- Funnel -->
      <KcCard v-if="!loading && rows.length" :level="1" :body-style="{ padding: '0' }">
        <div class="fun-list">
          <div
            v-for="(row, i) in rows"
            :key="row.lvl"
            class="fun-row"
            :class="{ 'is-yourkey': isYourKey(row.lvl) }"
          >
            <span class="fun-row__key"><KcKeystoneChip :level="row.lvl" /></span>
            <span class="fun-row__bar">
              <span
                class="fun-bar"
                :style="{ width: `${(row.count / max) * 100}%`, background: barColor(i) }"
              />
              <span v-if="isYourKey(row.lvl)" class="fun-row__marker">you</span>
            </span>
            <span class="kc-tnum fun-row__count">{{ fmtNum(row.count) }}</span>
          </div>
        </div>
        <div class="dgn-foot">
          Roughly <strong>{{ tailPct }}%</strong> of players who timed a +{{ rows[0].lvl }}
          have timed a +{{ rows[rows.length - 1].lvl }}. The steepest drop-off is between
          +{{ steepest.from }} and +{{ steepest.to }}.
        </div>
      </KcCard>

      <!-- Loading skeleton -->
      <KcCard v-else-if="loading" :level="1" :body-style="{ padding: '0' }">
        <div class="fun-list">
          <div v-for="i in 9" :key="i" class="fun-row">
            <q-skeleton type="QChip" width="40px" height="26px" />
            <q-skeleton width="100%" height="26px" :style="{ width: `${100 - (i - 1) * 9}%`, borderRadius: '6px' }" />
            <q-skeleton width="64px" height="16px" style="justify-self: end" />
          </div>
        </div>
      </KcCard>

      <!-- Empty state -->
      <KcCard v-else :level="1">
        <div class="kc-pop__empty">
          <div class="kc-pop__empty-icon">∅</div>
          No population data for this scope yet.
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcKeystoneChip from 'components/keystone/KcKeystoneChip.vue'
import { funnel as mockFunnel, dungeons, type FunnelRow } from 'src/mocks/meta'

const REGIONS = ['EU', 'US', 'KR', 'TW'] as const

const region = ref<(typeof REGIONS)[number]>('EU')
const dungeon = ref<string | null>(null)
const myKey = ref<number | null>(null)
const loading = ref(true)

const fmtNum = (n: number | null | undefined) =>
  n == null ? '—' : Number(n).toLocaleString('en-US')

/* region/dungeon scale the corpus deterministically so the filters feel live
   against mock data (a later pass swaps this for a scoped endpoint). */
const REGION_SCALE: Record<string, number> = { EU: 1, US: 0.92, KR: 0.41, TW: 0.33 }

const rows = computed<FunnelRow[]>(() => {
  const rScale = REGION_SCALE[region.value] ?? 1
  // a dungeon filter narrows the base by a stable per-zone factor
  const dScale = dungeon.value
    ? 0.1 + (dungeons.findIndex((d) => d.zone === dungeon.value) % 5) * 0.015
    : 1
  return mockFunnel.map((row) => ({
    lvl: row.lvl,
    count: Math.max(1, Math.round(row.count * rScale * dScale)),
  }))
})

const max = computed(() => rows.value[0]?.count || 1)

/* funnel bar fades from accent → cyan as levels climb (per design color-mix) */
const barColor = (i: number) =>
  `color-mix(in oklab, var(--kc-accent) ${100 - i * 8}%, var(--kc-signal-cyan, var(--kc-series-3)))`

/* footer narrative, derived live from the active rows */
const tailPct = computed(() => {
  const r = rows.value
  if (r.length < 2) return '0'
  return ((r[r.length - 1].count / r[0].count) * 100).toFixed(1)
})
const steepest = computed(() => {
  const r = rows.value
  let worst = { from: 0, to: 0, drop: 0 }
  for (let i = 1; i < r.length; i++) {
    const drop = (r[i - 1].count - r[i].count) / r[i - 1].count
    if (drop > worst.drop) worst = { from: r[i - 1].lvl, to: r[i].lvl, drop }
  }
  return worst
})

/* "your key" marker: highlight the bracket whose level the player has reached */
const isYourKey = (lvl: number) => {
  const k = myKey.value
  if (k == null || Number.isNaN(k)) return false
  const r = rows.value
  // mark the highest funnel level that is <= the entered key
  let best = -1
  for (const row of r) if (row.lvl <= k) best = row.lvl
  return lvl === best
}

onMounted(() => {
  // brief skeleton so the funnel animates in; mock data is synchronous
  setTimeout(() => { loading.value = false }, 280)
})
// re-show skeleton briefly when the scope changes (mimics a refetch)
watch([region, dungeon], () => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 220)
})
</script>

<style scoped>
.kc-tools-population { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

/* segmented control (region) — mirrors compositions.vue */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* filter row: dungeon chips + your-key input */
.kc-pop__filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 0 0 18px;
}
.kc-pop__chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
.kc-pop__chips-label { margin-right: 2px; color: var(--kc-text-low); }
.kc-pop__chip {
  display: inline-flex; align-items: center; gap: 7px;
  height: 30px; padding: 0 11px;
  border-radius: var(--kc-r-md);
  border: 1px solid var(--kc-line-default);
  background: var(--kc-bg-inset);
  color: var(--kc-text-mid);
  font: 500 12.5px/1 var(--kc-font-ui);
  white-space: nowrap;
  transition: border-color var(--kc-motion-fast) ease, background var(--kc-motion-fast) ease, color var(--kc-motion-fast) ease;
}
.kc-pop__chip:hover { border-color: var(--kc-line-strong); background: var(--kc-bg-hover); color: var(--kc-text-hi); }
.kc-pop__chip.is-sel {
  color: var(--kc-text-hi);
  border-color: color-mix(in oklab, var(--chip-tint, var(--kc-accent)) 60%, transparent);
  background: color-mix(in oklab, var(--chip-tint, var(--kc-accent)) 14%, transparent);
}
.kc-pop__chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.kc-pop__yourkey { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.kc-pop__yourkey .kc-eyebrow { color: var(--kc-text-low); }
.kc-input {
  height: 34px; padding: 0 12px; width: 100%;
  background: var(--kc-bg-inset); border: 1px solid var(--kc-line-default); border-radius: var(--kc-r-md);
  color: var(--kc-text-hi); font-family: var(--kc-font-ui); font-size: 13.5px;
  outline: none; transition: border-color var(--kc-motion-fast) ease, box-shadow var(--kc-motion-fast) ease;
}
.kc-input::placeholder { color: var(--kc-text-low); }
.kc-input:focus { border-color: var(--kc-accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--kc-accent) 22%, transparent); }
.kc-pop__yourkey-input { width: 96px; text-align: center; }

/* funnel list (ported from views.css .fun-* tokens) */
.fun-list { padding: var(--kc-sp-4) var(--kc-sp-5); display: flex; flex-direction: column; gap: var(--kc-sp-3); }
.fun-row { display: grid; grid-template-columns: 56px 1fr 88px; align-items: center; gap: 16px; }
.fun-row__key { display: flex; }
.fun-row__bar { position: relative; background: var(--kc-bg-inset); border-radius: var(--kc-r-sm); height: 26px; overflow: hidden; }
.fun-bar { display: block; height: 100%; border-radius: var(--kc-r-sm); transition: width 0.6s var(--kc-ease-out, ease-out); }
.fun-row__count { font-size: 14px; color: var(--kc-text-hi); text-align: right; font-weight: 600; justify-self: end; }

/* "your key" highlight */
.fun-row.is-yourkey .fun-row__bar { box-shadow: inset 0 0 0 1.5px var(--kc-accent); overflow: visible; }
.fun-row__marker {
  position: absolute; top: 50%; right: 8px; transform: translateY(-50%);
  font-family: var(--kc-font-display, var(--kc-font-ui));
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--kc-text-inverse, #0A0E14);
  background: var(--kc-accent);
  padding: 2px 6px; border-radius: 4px;
  pointer-events: none;
}

.dgn-foot { padding: 12px 20px; font-size: 11.5px; color: var(--kc-text-low); border-top: 1px solid var(--kc-line-hairline); }
.dgn-foot strong { color: var(--kc-text-hi); font-weight: 700; }

/* empty state */
.kc-pop__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 36px 20px; }
.kc-pop__empty-icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

@media (max-width: 600px) {
  .kc-pop__filters { gap: 12px; }
  .fun-row { grid-template-columns: 48px 1fr 68px; gap: 10px; }
  .fun-row__count { font-size: 13px; }
}
</style>
