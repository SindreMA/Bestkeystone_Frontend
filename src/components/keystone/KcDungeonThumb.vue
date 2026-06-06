<template>
  <span
    class="kc-dthumb"
    :style="{ width: `${size}px`, height: `${size}px`, borderRadius: radius }"
    :title="dungeon && (dungeon.name || dungeon.short_name)"
  >
    <img v-if="img" class="kc-dthumb__img" :src="img" :alt="dungeon && dungeon.name" loading="lazy" />
    <span v-else class="kc-dthumb__fallback kc-disp" :style="{ fontSize: `${size * 0.34}px` }">{{ initial }}</span>
  </span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useKc } from './useKc'

const props = defineProps({
  // Either pass a full dungeon detail object, or a keystoneId to resolve.
  dungeon: { type: Object, default: null },
  keystoneId: { type: Number, default: null },
  size: { type: Number, default: 40 },
  radius: { type: String, default: 'var(--kc-r-md)' },
})
const { dungeon, keystoneId, size } = toRefs(props)

const { dungeonByKeystoneId, cloud } = useKc()

const resolved = computed<any>(() => dungeon.value || (keystoneId.value != null ? dungeonByKeystoneId(keystoneId.value) : null))
const img = computed(() => cloud(resolved.value?.imageurl, Math.round(size.value * 2)))
const initial = computed(() => {
  const d = resolved.value
  const s = d?.short_name || d?.name || '?'
  return String(s).trim()[0] || '?'
})
</script>

<style scoped>
.kc-dthumb {
  flex: none;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(140deg, #1d2735, #11161f);
  box-shadow: inset 0 0 0 1px var(--kc-line-default);
}
.kc-dthumb__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kc-dthumb__fallback { color: rgba(255,255,255,0.85); font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.6); }
</style>
