<template>
  <div class="kc-ring">
    <div class="kc-ring__svg" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg :width="size" :height="size" style="transform: rotate(-90deg)">
        <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" stroke="var(--kc-line-hairline)" :stroke-width="stroke" />
        <circle
          v-if="!unknown"
          :cx="size / 2" :cy="size / 2" :r="r" fill="none"
          :stroke="color" :stroke-width="stroke"
          :stroke-dasharray="c" :stroke-dashoffset="off" stroke-linecap="round"
          class="kc-ring__progress"
        />
      </svg>
      <span class="kc-disp kc-tnum kc-ring__label" :style="{ fontSize: `${fs}px`, color: unknown ? 'var(--kc-text-ghost)' : 'var(--kc-text-hi)' }">
        {{ unknown ? '—' : `${Math.round(pct)}%` }}
      </span>
    </div>
    <span v-if="caption && sample != null" class="kc-tnum kc-ring__caption">n {{ fmt(sample) }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  pct: { type: Number, default: null },
  sample: { type: Number, default: null },
  size: { type: Number, default: 48 },
  caption: { type: Boolean, default: true },
})
const { pct, sample, size, caption } = toRefs(props)

const stroke = 3
const r = computed(() => (size.value - stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const unknown = computed(() => pct.value == null)
const off = computed(() => (unknown.value ? c.value : c.value * (1 - pct.value / 100)))
const fs = computed(() => (size.value >= 48 ? 15 : 11))
const color = computed(() => {
  if (unknown.value) return 'var(--kc-line-hairline)'
  if (pct.value >= 70) return 'var(--kc-pos)'
  if (pct.value >= 45) return 'var(--kc-warn)'
  return 'var(--kc-neg)'
})
const fmt = (n: number) => (n == null ? '—' : n.toLocaleString('en-US'))
</script>

<style scoped>
.kc-ring { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; }
.kc-ring__svg { position: relative; }
.kc-ring__progress { transition: stroke-dashoffset var(--kc-motion-slow) var(--kc-ease-out); }
.kc-ring__label { position: absolute; inset: 0; display: grid; place-items: center; font-weight: 700; }
.kc-ring__caption { font-size: 11px; color: var(--kc-text-low); }
</style>
