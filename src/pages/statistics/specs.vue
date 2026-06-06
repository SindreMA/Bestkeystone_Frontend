<template>
  <div class="kc-root kc-specs">
    <div class="kc-container">
      <KcPageHeader eyebrow="Statistics" title="Specs" sub="Rank all specs — Tank, Healer and DPS — by total score this week." />

      <template v-if="hasData">
        <div v-for="grp in byRole" :key="grp.role" class="kc-specs__role">
          <div class="kc-eyebrow kc-specs__role-label">
            <RoleGlyph :role="grp.role" :size="14" color="var(--kc-text-mid)" />{{ grp.role }}
            <span class="kc-specs__count">{{ grp.specs.length }}</span>
          </div>
          <KcCard :level="1" :body-style="{ padding: '0' }">
            <div
              v-for="(s, i) in grp.specs"
              :key="s.spec"
              class="kc-specrow"
              :style="{ borderLeftColor: classColorForSpec(s.spec) }"
            >
              <KcRankChip :rank="i + 1" size="sm" />
              <span class="kc-specrow__id">
                <KcSpecIcon :spec-id="s.spec" :size="26" />
                <span class="kc-specrow__name" :style="{ color: classColorForSpec(s.spec) }">{{ specLabel(s.spec) }}</span>
              </span>
              <span class="kc-specrow__bar">
                <span class="kc-specrow__fill" :style="{ width: `${(s.score / grp.max) * 100}%`, background: classColorForSpec(s.spec) }" />
              </span>
              <span class="kc-specrow__avg">
                <span class="kc-eyebrow">avg</span>
                <span class="kc-disp kc-tnum kc-specrow__avg-num">{{ avgOf(s) }}</span>
              </span>
              <KcScorePill :score="s.score" :column-max="grp.max" :tier="tierFor(i, grp.specs.length)" :sample="s.runs" />
            </div>
          </KcCard>
        </div>
      </template>

      <div v-else class="kc-specs__loading">
        <q-skeleton v-for="i in 3" :key="i" height="140px" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useKc, roleLabel } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcSpecIcon from 'components/keystone/KcSpecIcon.vue'
import KcRankChip from 'components/keystone/KcRankChip.vue'
import KcScorePill from 'components/keystone/KcScorePill.vue'
import RoleGlyph from 'components/keystone/RoleGlyph.vue'

const { store, data, specById, classById, classColorForSpec } = useKc()

/* per-dungeon scoping: a dungeon picked in the scope bar swaps the global spec
   dataset for the zone-filtered one (Spec_Dungeon_Data). */
function freshDungeonEntry(zone: number) {
  const ts = data.Reloaded_Timestamp ?? 0
  const m = (data.Spec_Dungeon_Data || []).filter(
    (e: any) => e.dungeon === zone && e.periode === data.SelectedPeriode && e.created > ts
  )
  return m.length ? m[m.length - 1] : null
}

function ensureData() {
  if (!data.SelectedPeriode) return
  const zone = data.SelectedDungeon
  if (zone == null) {
    if (!data.Spec_Data || data.Spec_Data.periode !== data.SelectedPeriode) store.dispatch('fetchSpecData')
  } else if (!freshDungeonEntry(zone)) {
    store.dispatch('fetchSpecData', { id: zone })
  }
}
onMounted(ensureData)
watch([() => data.SelectedPeriode, () => data.SelectedDungeon, () => data.Reloaded_Timestamp], ensureData)

const stats = computed<any[]>(() => {
  const zone = data.SelectedDungeon
  if (zone == null) return (data.Spec_Data && data.Spec_Data.data) || []
  return freshDungeonEntry(zone)?.data || []
})
const hasData = computed(() => stats.value.length > 0)

const ROLE_ORDER = ['TANK', 'HEALER', 'DAMAGE']
const byRole = computed(() =>
  ROLE_ORDER.map((role) => {
    const specs = stats.value
      .filter((s) => (s.role || '').toUpperCase() === role)
      .sort((a, b) => b.score - a.score)
    const max = Math.max(1, ...specs.map((s) => s.score))
    return { role: roleLabel(role), specs, max }
  }).filter((g) => g.specs.length > 0)
)

const avgOf = (s: any) => (s.runs ? Math.round((s.score / s.runs) * 10) / 10 : 0)
const specLabel = (id: number) => {
  const sp: any = specById(id)
  if (!sp) return ''
  const c: any = classById(sp.class ?? sp.Class)
  return `${sp.name}${c?.name ? ' ' + c.name : ''}`
}
// position → tier "heat": #1 = S, then A/B/C/D by share of the field
const tierFor = (i: number, n: number) => (i === 0 ? 's' : i < n * 0.15 ? 'a' : i < n * 0.4 ? 'b' : i < n * 0.7 ? 'c' : 'd')
</script>

<style scoped>
.kc-specs { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

.kc-specs__role { margin-bottom: var(--kc-sp-6); }
.kc-specs__role-label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: var(--kc-text-mid); }
.kc-specs__count { color: var(--kc-text-low); font-size: 10px; }

.kc-specrow {
  display: grid;
  grid-template-columns: auto minmax(170px, 1.3fr) 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  min-height: 46px;
  border-left: 3px solid var(--kc-line-strong);
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.kc-specrow:hover { background: var(--kc-bg-hover); }
.kc-specrow__id { display: flex; align-items: center; gap: 10px; min-width: 0; }
.kc-specrow__name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-specrow__bar { height: 6px; background: var(--kc-bg-inset); border-radius: 3px; overflow: hidden; }
.kc-specrow__fill { display: block; height: 100%; border-radius: 3px; opacity: 0.8; }
.kc-specrow__avg { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
.kc-specrow__avg-num { font-size: 13px; font-weight: 700; }

@media (max-width: 720px) {
  .kc-specrow { grid-template-columns: auto 1.4fr auto; gap: 10px; }
  .kc-specrow__bar, .kc-specrow__avg { display: none; }
}
</style>
