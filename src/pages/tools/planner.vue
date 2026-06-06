<template>
  <div class="kc-root kc-tools-planner">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Planner"
        title="What should I farm next?"
        sub="Ranked by marginal score per +1, flagged by how realistic the key is"
      >
        <template #right>
          <div class="kc-seg">
            <button
              v-for="o in SORTS"
              :key="o.value"
              class="kc-seg__btn"
              :class="{ 'is-sel': o.value === sort }"
              @click="sort = o.value"
            >
              {{ o.label }}
            </button>
          </div>
        </template>
      </KcPageHeader>

      <!-- character lookup (visual only) -->
      <KcCard :level="1" class="kc-plan__lookup">
        <div class="kc-plan__lookup-row">
          <input v-model="chr" class="kc-input kc-plan__input" type="text" placeholder="region-realm-name" />
          <button class="kc-btn" type="button">Analyze</button>
          <span class="kc-plan__hint">region-realm-name or armory link</span>
        </div>
      </KcCard>

      <!-- ranked marginal gains -->
      <KcCard v-if="hasData" :level="1" header="Best marginal gains" :body-style="{ padding: '0' }">
        <div class="kc-statlist">
          <div v-for="r in rows" :key="r.zone" class="kc-plan__row">
            <KcDungeonThumb :dungeon="dungeonFor(r.zone)" :size="44" :style="thumbStyle(r.zone)" />
            <div class="kc-plan__id min0">
              <div class="kc-plan__name">{{ dungeonFor(r.zone).name }}</div>
              <div class="kc-plan__sub kc-mono">
                <span>best</span>
                <KcKeystoneChip :level="lvl(r.cur)" size="sm" />
                <span class="kc-plan__arrow">→</span>
                <span>push</span>
                <KcKeystoneChip :level="lvl(r.next)" size="sm" />
              </div>
            </div>
            <span class="kc-plan__gain">
              <span class="kc-disp pos kc-plan__gain-num">+{{ r.gain.toFixed(1) }}</span>
              <span class="kc-plan__unit">score</span>
            </span>
            <span class="kc-plan__attain">
              <KcSuccessRing :pct="Math.round(r.attain * 100)" :size="34" :caption="false" />
              <span class="kc-plan__unit">{{ attainLabel(r.attain) }}</span>
            </span>
          </div>
        </div>
        <div class="kc-plan__foot">
          Attainability ring = corpus timed-rate at that bracket. Low rings flag keys you're unlikely to time.
        </div>
      </KcCard>

      <div v-else-if="loading" class="kc-plan__loading">
        <q-skeleton height="64px" class="kc-plan__skel" />
        <q-skeleton height="360px" />
      </div>

      <KcCard v-else :level="1">
        <div class="kc-plan__empty">
          <div class="kc-plan__empty-icon">⛏️</div>
          No farm recommendations yet — analyze a character to see where the next key pays off.
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { planner, dungeonByZone, type PlannerRow } from 'src/mocks/meta'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcDungeonThumb from 'components/keystone/KcDungeonThumb.vue'
import KcKeystoneChip from 'components/keystone/KcKeystoneChip.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'

type SortKey = 'score' | 'attain'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'score', label: 'Most score' },
  { value: 'attain', label: 'Most attainable' },
]

const sort = ref<SortKey>('score')
const chr = ref('Brewmaster-EU · 3284')
const loading = ref(false)

const source = computed<PlannerRow[]>(() => planner)
const hasData = computed(() => source.value.length > 0)

const rows = computed<PlannerRow[]>(() =>
  [...source.value].sort((a, b) => (sort.value === 'score' ? b.gain - a.gain : b.attain - a.attain)),
)

/* dungeon record shaped for KcDungeonThumb (uses name / short_name for the fallback glyph) */
function dungeonFor(zone: string) {
  const d = dungeonByZone[zone]
  return { name: d?.name || zone, short_name: d?.abbr || zone, imageurl: null }
}
/* tint the placeholder tile via the component's --dthumb hook */
function thumbStyle(zone: string) {
  return { '--dthumb': dungeonByZone[zone]?.tint || 'var(--kc-accent)' } as Record<string, string>
}

/* mock stores cur/next as "+14"; KcKeystoneChip wants a numeric level */
const lvl = (s: string) => parseInt(String(s).replace('+', ''), 10) || 0

const attainLabel = (v: number) => (v >= 0.6 ? 'realistic' : v >= 0.45 ? 'tough' : 'long shot')
</script>

<style scoped>
.kc-tools-planner { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* segmented control (matches sibling tool/stat pages) */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* shared input / button */
.kc-input {
  height: 38px; padding: 0 14px; width: 100%;
  background: var(--kc-bg-inset); border: 1px solid var(--kc-line-default); border-radius: var(--kc-r-md);
  color: var(--kc-text-hi); font-family: var(--kc-font-ui); font-size: 14px;
  outline: none; transition: border-color var(--kc-motion-fast) ease, box-shadow var(--kc-motion-fast) ease;
}
.kc-input::placeholder { color: var(--kc-text-ghost); }
.kc-input:focus { border-color: var(--kc-accent); box-shadow: 0 0 0 3px var(--kc-accent-quiet); }
.kc-btn {
  height: 38px; padding: 0 18px; border-radius: var(--kc-r-md); border: 1px solid var(--kc-accent);
  background: var(--kc-accent); color: var(--kc-text-inverse, #0a0e14); font-weight: 600; font-size: 13.5px; cursor: pointer;
  transition: background var(--kc-motion-fast) ease, transform var(--kc-motion-fast) ease;
}
.kc-btn:hover { background: var(--kc-accent-hover, var(--kc-accent)); }
.kc-btn:active { transform: translateY(1px); }

/* lookup card */
.kc-plan__lookup { margin-bottom: var(--kc-sp-5); }
.kc-plan__lookup-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.kc-plan__input { max-width: 320px; }
.kc-plan__hint { font-size: 12px; color: var(--kc-text-low); }

/* ranked rows */
.kc-statlist { display: flex; flex-direction: column; }
.kc-plan__row {
  display: grid;
  grid-template-columns: 44px minmax(120px, 1fr) auto auto;
  align-items: center;
  gap: 16px;
  min-height: 50px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.kc-plan__row:last-child { border-bottom: 0; }
.kc-plan__row:hover { background: var(--kc-bg-hover); }

.kc-plan__id { display: flex; flex-direction: column; line-height: 1.2; }
.kc-plan__name { font-weight: 600; font-size: 14px; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-plan__sub { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--kc-text-low); margin-top: 3px; flex-wrap: wrap; }
.kc-plan__arrow { color: var(--kc-text-mid); }

.kc-plan__gain { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.kc-plan__gain-num { font-size: 19px; }
.kc-plan__unit { font-size: 10.5px; color: var(--kc-text-low); }

.kc-plan__attain { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 64px; }

.kc-plan__foot {
  padding: 12px 16px;
  font-size: 11.5px;
  color: var(--kc-text-low);
  border-top: 1px solid var(--kc-line-hairline);
}

/* loading + empty */
.kc-plan__loading { display: flex; flex-direction: column; gap: var(--kc-sp-5); }
.kc-plan__skel { border-radius: var(--kc-r-lg); }
.kc-plan__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 40px 20px; }
.kc-plan__empty-icon { font-size: 22px; opacity: 0.6; margin-bottom: 8px; }

@media (max-width: 640px) {
  .kc-plan__row { grid-template-columns: 40px minmax(0, 1fr) auto; gap: 10px; }
  .kc-plan__attain { display: none; }
}
@media (max-width: 420px) {
  .kc-plan__row { grid-template-columns: 36px minmax(0, 1fr) auto; }
  .kc-plan__gain-num { font-size: 16px; }
}
</style>
