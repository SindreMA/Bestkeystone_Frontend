<template>
  <div class="kc-root kc-classes">
    <div class="kc-container">
      <KcPageHeader eyebrow="Statistics" title="Classes" sub="Rank the classes by performance this week, split by role." />

      <template v-if="hasData">
        <div v-for="grp in byRole" :key="grp.role" class="kc-classes__role">
          <div class="kc-eyebrow kc-classes__role-label">
            <RoleGlyph :role="grp.role" :size="14" color="var(--kc-text-mid)" />{{ grp.role }}
          </div>
          <KcCard :level="1" :body-style="{ padding: '0' }">
            <div
              v-for="(c, i) in grp.classes"
              :key="c.class_id"
              class="kc-classrow"
              :style="{ borderLeftColor: classColorById(c.class_id) }"
            >
              <KcRankChip :rank="i + 1" size="sm" />
              <span class="kc-classrow__id">
                <KcClassIcon :class-id="c.class_id" :size="28" />
                <span class="kc-classrow__name" :style="{ color: classColorById(c.class_id) }">{{ className(c.class_id) }}</span>
              </span>
              <span class="kc-classrow__bar">
                <span class="kc-classrow__fill" :style="{ width: `${(c.tscore / grp.max) * 100}%`, background: classColorById(c.class_id) }" />
              </span>
              <span class="kc-classrow__avg">
                <span class="kc-eyebrow">avg</span>
                <span class="kc-disp kc-tnum kc-classrow__avg-num">{{ avgOf(c) }}</span>
              </span>
              <KcScorePill :score="c.tscore" :column-max="grp.max" :tier="tierFor(i, grp.classes.length)" :sample="c.runs" />
              <KcSuccessRing :pct="classSuccess(c.class_id)" :size="34" :caption="false" />
            </div>
          </KcCard>
        </div>
      </template>

      <div v-else class="kc-classes__loading">
        <q-skeleton v-for="i in 3" :key="i" height="160px" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useKc, roleLabel } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcClassIcon from 'components/keystone/KcClassIcon.vue'
import KcRankChip from 'components/keystone/KcRankChip.vue'
import KcScorePill from 'components/keystone/KcScorePill.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'
import RoleGlyph from 'components/keystone/RoleGlyph.vue'

const { store, data, classById, classColorById } = useKc()

/* per-dungeon scoping: when a dungeon is picked in the scope bar, read the
   zone-filtered spec dataset (Spec_Dungeon_Data); otherwise the global one. */
function freshDungeonEntry(zone: number) {
  const ts = data.Reloaded_Timestamp ?? 0
  const m = (data.Spec_Dungeon_Data || []).filter(
    (e: any) => e.dungeon === zone && e.periode === data.SelectedPeriode && e.created > ts
  )
  return m.length ? m[m.length - 1] : null
}

const intime = ref<any[]>([])
function fetchData() {
  if (!data.SelectedPeriode) return
  const zone = data.SelectedDungeon
  if (zone == null) {
    if (!data.Spec_Data || data.Spec_Data.periode !== data.SelectedPeriode) store.dispatch('fetchSpecData')
  } else if (!freshDungeonEntry(zone)) {
    store.dispatch('fetchSpecData', { id: zone })
  }
  fetchIntime()
}
function fetchIntime() {
  const s = data.settings
  if (!data.apiUrl || !data.SelectedPeriode) return
  axios.get(`${data.apiUrl}/Class/ontimerate?periode=${data.SelectedPeriode}&min_level=${s.min_keystonelevel}&amount=${s.max_runs}&limitToLowestDungeon=${s.limitbylowestdungeon}`)
    .then((r) => { intime.value = r.data })
    .catch((e) => console.log(e))
}
onMounted(fetchData)
watch([() => data.SelectedPeriode, () => data.SelectedDungeon, () => data.Reloaded_Timestamp], fetchData)

const specStats = computed<any[]>(() => {
  const zone = data.SelectedDungeon
  if (zone == null) return (data.Spec_Data && data.Spec_Data.data) || []
  return freshDungeonEntry(zone)?.data || []
})
const hasData = computed(() => specStats.value.length > 0)

const ROLE_ORDER = ['TANK', 'HEALER', 'DAMAGE']
const byRole = computed(() =>
  ROLE_ORDER.map((role) => {
    const rows = specStats.value.filter((s) => (s.role || '').toUpperCase() === role)
    // aggregate specs into classes
    const byClass: Record<string, any> = {}
    for (const s of rows) {
      const k = String(s.class_id)
      if (!byClass[k]) byClass[k] = { class_id: s.class_id, tscore: 0, runs: 0 }
      byClass[k].tscore += s.score
      byClass[k].runs += s.runs
    }
    const classes = Object.values(byClass).sort((a: any, b: any) => b.tscore - a.tscore)
    const max = Math.max(1, ...classes.map((c: any) => c.tscore))
    return { role: roleLabel(role), classes, max }
  }).filter((g) => g.classes.length > 0)
)

const avgOf = (c: any) => (c.runs ? Math.round((c.tscore / c.runs) * 10) / 10 : 0)
const className = (id: number) => classById(id)?.name || '—'
const tierFor = (i: number, n: number) => (i === 0 ? 's' : i < n * 0.15 ? 'a' : i < n * 0.4 ? 'b' : i < n * 0.7 ? 'c' : 'd')

function classSuccess(classId: number): number | null {
  const row = intime.value.find((x) => x.id == classId)
  return row && row.ontime_percent != null ? Math.round(row.ontime_percent * 10) / 10 : null
}
</script>

<style scoped>
.kc-classes { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

.kc-classes__role { margin-bottom: var(--kc-sp-6); }
.kc-classes__role-label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: var(--kc-text-mid); }

.kc-classrow {
  display: grid;
  grid-template-columns: auto minmax(150px, 1.2fr) 1fr 56px minmax(72px, auto) 44px;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  min-height: 50px;
  border-left: 3px solid var(--kc-line-strong);
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.kc-classrow:hover { background: var(--kc-bg-hover); }
.kc-classrow__id { display: flex; align-items: center; gap: 10px; min-width: 0; }
.kc-classrow__name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-classrow__bar { height: 6px; background: var(--kc-bg-inset); border-radius: 3px; overflow: hidden; }
.kc-classrow__fill { display: block; height: 100%; border-radius: 3px; opacity: 0.8; }
.kc-classrow__avg { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.kc-classrow__avg-num { font-size: 13px; font-weight: 700; }

@media (max-width: 720px) {
  .kc-classrow { grid-template-columns: auto 1.4fr auto 40px; gap: 10px; }
  .kc-classrow__bar, .kc-classrow__avg { display: none; }
}
</style>
