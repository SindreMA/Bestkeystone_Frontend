<template>
  <div
    class="kc-runrow"
    :class="{ 'kc-runrow--flash': live && idx === 0, 'kc-runrow--clickable': runId != null }"
    :style="{ borderLeft: `3px solid ${rail}` }"
    role="link"
    :title="runId != null ? 'View run details' : undefined"
    @click="open"
  >
    <KcDungeonThumb :keystone-id="zoneId" :size="28" />
    <KcKeystoneChip :level="run.level" size="sm" />
    <span class="kc-runrow__group">
      <KcSpecIcon v-for="(p, i) in sortedPlayers" :key="i" :spec-id="p.spec" :size="18" />
    </span>
    <span class="kc-runrow__right">
      <KcChestPips :chests="chests" />
      <span class="kc-disp kc-tnum kc-runrow__score">{{ score }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useKc } from './useKc'
import KcDungeonThumb from './KcDungeonThumb.vue'
import KcKeystoneChip from './KcKeystoneChip.vue'
import KcSpecIcon from './KcSpecIcon.vue'
import KcChestPips from './KcChestPips.vue'

const props = defineProps({
  run: { type: Object, required: true },
  live: { type: Boolean, default: false },
  idx: { type: Number, default: 0 },
})
const { run, live, idx } = toRefs(props)

const router = useRouter()
const { specById, classColorForSpec } = useKc()

const zoneId = computed(() => run.value?.zone?.id)
const runId = computed(() => run.value?.id)
const open = () => { if (runId.value != null) router.push(`/lookup/run/${runId.value}`) }

const chests = computed(() => {
  const t = run.value?.time
  if (!t || !t.map_time) return 0
  const ratio = t.clear_time / t.map_time
  if (ratio <= 0.6) return 3
  if (ratio <= 0.8) return 2
  if (ratio <= 1) return 1
  return 0
})
const timed = computed(() => chests.value >= 1)

const rolePriority = (role?: string) => {
  const r = (role || '').toUpperCase()
  if (r === 'TANK') return 0
  if (r === 'HEALER') return 1
  return 2
}
const sortedPlayers = computed(() => {
  const players: any[] = run.value?.players ? [...run.value.players] : []
  return players.sort((a, b) => rolePriority(specById(a.spec)?.role) - rolePriority(specById(b.spec)?.role))
})

const rail = computed(() => {
  if (!timed.value) return 'var(--kc-fire-0)'
  const first = sortedPlayers.value[0]
  return first ? classColorForSpec(first.spec) : 'var(--kc-line-strong)'
})

const score = computed(() => Math.round((run.value?.score ?? 0) * 10) / 10)
</script>

<style scoped>
.kc-runrow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
}
.kc-runrow--flash { animation: kc-flashin var(--kc-motion-slow) ease-out; }
.kc-runrow--clickable { cursor: pointer; transition: background var(--kc-motion-fast) ease; }
.kc-runrow--clickable:hover { background: var(--kc-bg-hover); }
.kc-runrow__group { display: flex; gap: 3px; }
.kc-runrow__right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.kc-runrow__score { font-size: 15px; font-weight: 700; color: var(--kc-text-hi); }
</style>
