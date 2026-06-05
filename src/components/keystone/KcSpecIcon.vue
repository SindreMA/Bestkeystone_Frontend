<template>
  <span
    class="kc-specicon"
    :style="{
      width: `${size}px`, height: `${size}px`, borderRadius: radius,
      boxShadow: `inset 0 0 0 1.5px ${color}, inset 0 0 0 2.5px var(--kc-bg-canvas)`,
    }"
    :title="title"
  >
    <img v-if="iconUrl" class="kc-specicon__img" :src="iconUrl" :alt="title" loading="lazy" />
    <span v-else class="kc-specicon__fallback" :style="{ background: color }" />
  </span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useKc, roleLabel } from './useKc'

const props = defineProps({
  specId: { type: Number, required: true },
  size: { type: Number, default: 28 },
  radius: { type: String, default: 'var(--kc-r-sm)' },
})
const { specId, size } = toRefs(props)

const { specById, classColorForSpec, cloud } = useKc()

const spec = computed<any>(() => specById(specId.value))
const color = computed(() => classColorForSpec(specId.value))
const iconUrl = computed(() => cloud(spec.value?.icon_url, Math.round(size.value * 2)))
const title = computed(() => {
  const s = spec.value
  if (!s) return ''
  return `${s.name}${s.role ? ' · ' + roleLabel(s.role) : ''}`
})
</script>

<style scoped>
.kc-specicon {
  flex: none;
  display: inline-grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  background: var(--kc-bg-inset);
}
.kc-specicon__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kc-specicon__fallback { width: 60%; height: 60%; border-radius: 2px; opacity: 0.85; }
</style>
