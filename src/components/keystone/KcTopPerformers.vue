<template>
  <KcCard :level="1" header="Top performers">
    <template #headerRight>
      <a href="#" class="kc-link" @click.prevent="go('/statistics/specs')">Specs →</a>
    </template>

    <div v-if="hasData" class="kc-perf">
      <div v-for="grp in byRole" :key="grp.role" class="kc-perf__role">
        <div class="kc-eyebrow kc-perf__role-label">
          <RoleGlyph :role="grp.role" />{{ grp.role }}
        </div>
        <div class="kc-perf__list">
          <div v-for="(s, i) in grp.specs" :key="s.spec" class="kc-perf__row">
            <span class="kc-perf__icon"><KcSpecIcon :spec-id="s.spec" :size="i === 0 ? 28 : 22" /></span>
            <span class="kc-perf__name-wrap">
              <span class="kc-perf__name" :style="{ color: classColorForSpec(s.spec) }">{{ specLabel(s.spec) }}</span>
              <span v-if="i === 1" class="kc-perf__runnerup">runner-up</span>
            </span>
            <span class="kc-perf__bar">
              <span class="kc-perf__bar-fill" :style="{ width: `${(s.avg / maxAvg) * 100}%`, background: classColorForSpec(s.spec), opacity: i === 0 ? 0.9 : 0.45 }" />
            </span>
            <span class="kc-disp kc-tnum kc-perf__val">{{ s.avg }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="kc-perf__loading">
      <q-skeleton v-for="i in 3" :key="i" height="56px" />
    </div>
  </KcCard>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useKc, roleLabel } from './useKc'
import KcCard from './KcCard.vue'
import KcSpecIcon from './KcSpecIcon.vue'
import RoleGlyph from './RoleGlyph.vue'

const router = useRouter()
const { store, data, specById, classById, classColorForSpec } = useKc()
const go = (path: string) => router.push(path)

onMounted(() => { if (!data.Spec_Data && data.SelectedPeriode) store.dispatch('fetchSpecData') })

const stats = computed<any[]>(() => (data.Spec_Data && data.Spec_Data.data) || [])
const hasData = computed(() => stats.value.length > 0)

const avgOf = (s: any) => (s.runs ? Math.round((s.score / s.runs) * 10) / 10 : 0)

const ROLE_ORDER = ['TANK', 'HEALER', 'DAMAGE']
const byRole = computed(() =>
  ROLE_ORDER.map((role) => {
    const specs = stats.value
      .filter((s) => (s.role || '').toUpperCase() === role)
      .map((s) => ({ ...s, avg: avgOf(s) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 2)
    return { role: roleLabel(role), specs }
  }).filter((g) => g.specs.length > 0)
)

const maxAvg = computed(() => {
  const all = byRole.value.flatMap((g) => g.specs.map((s) => s.avg))
  return Math.max(1, ...all)
})

const specLabel = (specId: number) => {
  const spec: any = specById(specId)
  if (!spec) return ''
  const cls: any = classById(spec.class ?? spec.Class)
  return `${spec.name}${cls?.name ? ' ' + cls.name : ''}`
}
</script>

<style scoped>
.kc-perf { display: flex; flex-direction: column; gap: var(--kc-sp-4); }
.kc-perf__role-label { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.kc-perf__list { display: flex; flex-direction: column; gap: 8px; }
.kc-perf__row { display: flex; align-items: center; gap: 10px; }
.kc-perf__icon { flex: none; width: 28px; display: grid; place-items: center; }
.kc-perf__name-wrap { flex: 1 1 auto; min-width: 0; }
.kc-perf__name { display: block; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-perf__runnerup { font-size: 10px; color: var(--kc-text-low); }
.kc-perf__bar { flex: 1 1 60px; min-width: 40px; height: 6px; background: var(--kc-bg-inset); border-radius: 3px; overflow: hidden; }
.kc-perf__bar-fill { display: block; height: 100%; border-radius: 3px; }
.kc-perf__val { font-size: 13px; font-weight: 700; width: 52px; text-align: right; }
.kc-perf__loading { display: flex; flex-direction: column; gap: 12px; }
.kc-link { font-size: 12px; color: var(--kc-accent); }
</style>
