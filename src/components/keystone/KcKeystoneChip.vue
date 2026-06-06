<template>
  <span
    class="kc-disp kc-tnum kc-keychip"
    :class="[`kc-keychip--${size}`, { 'kc-keychip--pulse': pulse }]"
    :style="{ boxShadow: shadow }"
  >+{{ level }}</span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  level: { type: Number, required: true },
  size: { type: String, default: 'md' }, // 'sm' | 'md'
})
const { level, size } = toRefs(props)

const pulse = computed(() => level.value >= 20)

const shadow = computed(() => {
  const l = level.value
  if (l >= 20) return '0 0 0 1px var(--kc-key-hot), 0 0 10px -1px rgba(242,92,84,0.6)'
  if (l >= 15) return '0 0 0 1px var(--q-epic), 0 0 8px -2px rgba(185,107,224,0.5)'
  if (l >= 10) return '0 0 0 1px var(--kc-accent), 0 0 7px -2px rgba(91,141,239,0.5)'
  return '0 0 0 1px var(--kc-line-strong)'
})
</script>

<style scoped>
.kc-keychip {
  display: inline-grid;
  place-items: center;
  background: var(--kc-bg-inset);
  color: var(--kc-text-hi);
  font-weight: 700;
  border-radius: var(--kc-r-md);
  padding: 0 7px;
}
.kc-keychip--md { height: 26px; min-width: 32px; font-size: 15px; }
.kc-keychip--sm { height: 22px; min-width: 28px; font-size: 13px; }
.kc-keychip--pulse { animation: kc-pulsekey 1.8s ease-in-out infinite; }
</style>
