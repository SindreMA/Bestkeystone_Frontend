<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="color" :aria-label="role" class="kc-roleglyph">
    <path :d="path" />
  </svg>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  role: { type: String, default: 'DPS' }, // Tank | Healer | DPS
  size: { type: Number, default: 13 },
  color: { type: String, default: 'var(--kc-text-low)' },
})
const { role } = toRefs(props)

const PATHS: Record<string, string> = {
  Tank: 'M12 2l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V5z',
  Healer: 'M10 3h4v5h5v4h-5v5h-4v-5H5V8h5z',
  DPS: 'M3 21l6-2 9-9-4-4-9 9zM14 4l3 3 3-3-3-3zM5 19l2-2',
}
const path = computed(() => PATHS[role.value] || PATHS.DPS)
</script>

<style scoped>
.kc-roleglyph { flex: none; }
</style>
