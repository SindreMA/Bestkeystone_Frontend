<template>
  <span class="kc-chestpips" :title="chests > 0 ? `${chests}-chest timed` : 'Depleted / over time'">
    <span
      v-for="i in 3"
      :key="i"
      class="kc-chestpips__pip"
      :style="pipStyle(i - 1)"
    />
  </span>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'

const props = defineProps({
  chests: { type: Number, default: 0 },
  size: { type: Number, default: 7 },
})
const { chests, size } = toRefs(props)

const colors = ['var(--kc-fire-1)', 'var(--kc-fire-2)', 'var(--kc-fire-3)']

const pipStyle = (i: number) => {
  const filled = i < chests.value
  return {
    width: `${size.value}px`,
    height: `${size.value}px`,
    background: filled ? colors[Math.min(chests.value, 3) - 1] : 'transparent',
    boxShadow: filled ? 'none' : 'inset 0 0 0 1.5px var(--kc-fire-0)',
  }
}
</script>

<style scoped>
.kc-chestpips { display: inline-flex; gap: 3px; }
.kc-chestpips__pip { border-radius: 2px; transform: rotate(45deg); flex: none; }
</style>
