<template>
  <div class="kc-root kc-comps">
    <div class="kc-container">
      <KcPageHeader eyebrow="Statistics" title="Compositions" sub="Most successful 5-player group compositions this week.">
        <template #right>
          <div class="kc-seg">
            <button v-for="o in TYPES" :key="o.v" class="kc-seg__btn" :class="{ 'is-sel': o.v === type }" @click="setType(o.v)">{{ o.label }}</button>
          </div>
        </template>
      </KcPageHeader>

      <KcCard v-if="rows.length" :level="1" :body-style="{ padding: '0' }">
        <div v-for="(c, i) in pagedRows" :key="c.setup" class="kc-comprow">
          <KcRankChip :rank="page * perPage + i + 1" size="sm" />
          <span class="kc-comprow__badges">
            <template v-for="(group, gi) in parseSetup(c.setup)" :key="gi">
              <span v-if="gi > 0" class="kc-comprow__div" />
              <span class="kc-comprow__group">
                <KcSpecIcon v-for="(sp, j) in group" :key="j" :spec-id="sp" :size="26" />
              </span>
            </template>
          </span>
          <span class="kc-comprow__bar"><span class="kc-comprow__fill" :style="{ width: `${(c.runs / maxRuns) * 100}%` }" /></span>
          <span class="kc-comprow__avg">
            <span class="kc-eyebrow">avg</span>
            <span class="kc-disp kc-tnum kc-comprow__avg-num">{{ avgOf(c) }}</span>
          </span>
          <KcScorePill :score="c.score" :column-max="maxScore" :tier="tierFor(page * perPage + i, rows.length)" :sample="c.runs" />
          <KcSuccessRing :pct="c.success_rate != null ? Math.round(c.success_rate * 10) / 10 : null" :size="34" :caption="false" />
        </div>

        <div v-if="pageCount > 1" class="kc-comps__pager">
          <span class="kc-tnum kc-comps__pager-info">{{ rows.length }} comps</span>
          <span class="kc-comps__pager-ctrl">
            <button class="kc-comps__pager-btn" :disabled="page === 0" @click="page = Math.max(0, page - 1)">Prev</button>
            <span class="kc-tnum kc-comps__pager-num">{{ page + 1 }} / {{ pageCount }}</span>
            <button class="kc-comps__pager-btn" :disabled="page >= pageCount - 1" @click="page = Math.min(pageCount - 1, page + 1)">Next</button>
          </span>
        </div>
      </KcCard>

      <div v-else-if="loading" class="kc-comps__loading"><q-skeleton height="320px" /></div>
      <KcCard v-else :level="1"><div class="kc-comps__empty">No composition data for these filters yet.</div></KcCard>

      <div v-if="generated" class="kc-comps__note">Data generated {{ generated }} · "Amount of runs" is the only setting that affects composition data.</div>
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
import KcSpecIcon from 'components/keystone/KcSpecIcon.vue'

const { store, data } = useKc()

const TYPES = [{ v: 1, label: 'Team' }, { v: 2, label: 'Healer & Tank' }, { v: 3, label: 'DPS' }]
const type = ref(1)
const rows = ref<any[]>([])
const loading = ref(false)
const generated = ref('')
const page = ref(0)
const perPage = 20

const setType = (v: number) => { if (v !== type.value) { type.value = v } }

const pageCount = computed(() => Math.ceil(rows.value.length / perPage))
const pagedRows = computed(() => rows.value.slice(page.value * perPage, page.value * perPage + perPage))

function fetchComps() {
  const periode = data.SelectedPeriode
  if (!data.apiUrl || !periode) return
  loading.value = true
  rows.value = []
  page.value = 0
  const runs = data.settings.max_runs
  axios.get(`${data.apiUrl}/Composition?periode=${periode}&runs=${runs}&from=0&amount=5000&type=${type.value}`)
    .then((r) => {
      const comps = (r.data?.comps || []).map((c: any) => ({ ...c })).sort((a: any, b: any) => b.score - a.score)
      rows.value = comps
      generated.value = r.data?.generated_timestamp ? SF.TimeFromNow(r.data.generated_timestamp) : ''
      loading.value = false
    })
    .catch((e) => { console.log(e); loading.value = false })
}
onMounted(fetchComps)
watch(type, fetchComps)
watch(() => data.SelectedPeriode, fetchComps)

const maxRuns = computed(() => Math.max(1, ...rows.value.map((c) => c.runs)))
const maxScore = computed(() => Math.max(1, ...rows.value.map((c) => c.score)))
const avgOf = (c: any) => (c.runs ? Math.round((c.score / c.runs) * 10) / 10 : 0)
const tierFor = (i: number, n: number) => (i === 0 ? 's' : i < n * 0.15 ? 'a' : i < n * 0.4 ? 'b' : i < n * 0.7 ? 'c' : 'd')

// "[12]-[34]-[5,6,7]" → [[12],[34],[5,6,7]] of spec ids
function parseSetup(setup: string): number[][] {
  if (!setup) return []
  return setup.split('-').map((g) => g.replace(/\[|\]/g, '').split(',').map((x) => parseInt(x, 10)).filter((n) => !isNaN(n)))
}
</script>

<style scoped>
.kc-comps { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }

.kc-comprow {
  display: grid;
  grid-template-columns: auto minmax(220px, 1.6fr) 1fr auto auto 44px;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.kc-comprow:hover { background: var(--kc-bg-hover); }
.kc-comprow__badges { display: flex; align-items: center; gap: 8px; min-width: 0; }
.kc-comprow__group { display: flex; gap: 4px; }
.kc-comprow__div { width: 1px; align-self: stretch; min-height: 26px; background: var(--kc-line-hairline); }
.kc-comprow__bar { height: 6px; background: var(--kc-bg-inset); border-radius: 3px; overflow: hidden; }
.kc-comprow__fill { display: block; height: 100%; border-radius: 3px; background: var(--kc-accent); opacity: 0.7; }
.kc-comprow__avg { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.kc-comprow__avg-num { font-size: 13px; font-weight: 700; }

.kc-comps__pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid var(--kc-line-hairline); }
.kc-comps__pager-info { font-size: 11px; color: var(--kc-text-low); }
.kc-comps__pager-ctrl { display: flex; align-items: center; gap: 10px; }
.kc-comps__pager-num { font-size: 12px; color: var(--kc-text-mid); }
.kc-comps__pager-btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-md); cursor: pointer; background: var(--kc-bg-surface); border: 1px solid var(--kc-line-default); color: var(--kc-text-hi); font: 500 12px/1 var(--kc-font-ui); }
.kc-comps__pager-btn:hover:not(:disabled) { background: var(--kc-bg-hover); }
.kc-comps__pager-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.kc-comps__note { margin-top: 14px; font-size: 11px; color: var(--kc-text-low); text-align: center; }
.kc-comps__empty { text-align: center; color: var(--kc-text-mid); padding: 20px; }

.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

@media (max-width: 720px) {
  .kc-comprow { grid-template-columns: auto 1.6fr auto 40px; gap: 10px; }
  .kc-comprow__bar, .kc-comprow__avg { display: none; }
}
</style>
