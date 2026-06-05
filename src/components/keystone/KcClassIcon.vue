<template>
  <span
    class="kc-classicon"
    :style="{
      width: `${size}px`, height: `${size}px`, borderRadius: radius,
      boxShadow: `inset 0 0 0 1.5px ${color}, inset 0 0 0 2.5px var(--kc-bg-canvas)`,
    }"
    :title="cls && cls.name"
  >
    <img v-if="iconUrl" class="kc-classicon__img" :src="iconUrl" :alt="cls && cls.name" loading="lazy" />
    <span v-else class="kc-classicon__fallback" :style="{ background: color }" />
  </span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useKc } from './useKc'

const props = defineProps({
  classId: { type: Number, required: true },
  size: { type: Number, default: 28 },
  radius: { type: String, default: 'var(--kc-r-sm)' },
})
const { classId, size } = toRefs(props)

const { classById, classColorById, cloud } = useKc()
const cls = computed<any>(() => classById(classId.value))
const color = computed(() => classColorById(classId.value))
const iconUrl = computed(() => cloud(cls.value?.icon_url, Math.round(size.value * 2)))
</script>

<style scoped>
.kc-classicon { flex: none; display: inline-grid; place-items: center; position: relative; overflow: hidden; background: var(--kc-bg-inset); }
.kc-classicon__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kc-classicon__fallback { width: 60%; height: 60%; border-radius: 2px; opacity: 0.85; }
</style>
