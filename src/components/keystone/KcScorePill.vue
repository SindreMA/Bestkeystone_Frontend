<template>
  <div class="kc-scorepill" :class="`kc-scorepill--${align}`">
    <span class="kc-disp kc-tnum kc-scorepill__num" :style="{ fontSize: `${fs}px` }">{{ display }}</span>
    <span class="kc-scorepill__track">
      <span class="kc-scorepill__fill" :style="{ width: `${w}%`, background: tierColor, marginLeft: align === 'right' ? 'auto' : '0' }" />
    </span>
    <span v-if="sample != null" class="kc-tnum kc-scorepill__n">n {{ fmt(sample) }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  score: { type: Number, required: true },
  columnMax: { type: Number, default: 0 },
  tier: { type: String, default: 'b' }, // s|a|b|c|d
  sample: { type: Number, default: null },
  align: { type: String, default: 'right' },
  size: { type: String, default: 'md' }, // sm|md|lg
  mode: { type: String, default: 'total' }, // total|share
})
const { score, columnMax, tier, sample, size, mode } = toRefs(props)

const w = computed(() => (columnMax.value ? Math.max(4, Math.min(100, (score.value / columnMax.value) * 100)) : 100))
const fs = computed(() => (size.value === 'lg' ? 22 : size.value === 'sm' ? 14 : 16))
const fmt = (n: number) => (n == null ? '—' : Number(n).toLocaleString('en-US'))
const display = computed(() => (mode.value === 'share' ? `${score.value.toFixed(1)}%` : fmt(Math.round(score.value))))
const tierColor = computed(() => `var(--kc-tier-${(tier.value || 'b').toLowerCase()})`)
</script>

<style scoped>
.kc-scorepill { display: inline-flex; flex-direction: column; gap: 3px; min-width: 64px; }
.kc-scorepill--right { align-items: flex-end; }
.kc-scorepill--left { align-items: flex-start; }
.kc-scorepill__num { font-weight: 700; color: var(--kc-text-hi); line-height: 1; }
.kc-scorepill__track { width: 100%; max-width: 80px; height: 2px; background: var(--kc-line-hairline); border-radius: 2px; overflow: hidden; }
.kc-scorepill__fill { display: block; height: 100%; border-radius: 2px; }
.kc-scorepill__n { font-size: 11px; color: var(--kc-text-low); line-height: 1; }
</style>
