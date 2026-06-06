<template>
  <svg
    :viewBox="`0 0 ${w} ${h}`"
    :width="full ? '100%' : w"
    :height="h"
    :preserveAspectRatio="full ? 'none' : 'xMidYMid meet'"
    class="kc-spark"
  >
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="fill" :d="area" :fill="`url(#${gid})`" />
    <path :d="line" fill="none" :stroke="color" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  points: { type: Array, default: null }, // number[] 0..1
  w: { type: Number, default: 64 },
  h: { type: Number, default: 18 },
  color: { type: String, default: 'var(--kc-signal-cyan)' },
  fill: { type: Boolean, default: true },
  full: { type: Boolean, default: false },
  seed: { type: Number, default: 1 },
})
const { points, w, h, color, fill, seed } = toRefs(props)

// deterministic pseudo-random walk so the sparkline is stable across renders
function mulberry(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const data = computed<number[]>(() => {
  if (points.value && points.value.length) return points.value as number[]
  const rng = mulberry(seed.value * 31 + 7)
  const a: number[] = []
  let v = 0.5
  for (let i = 0; i < 16; i++) { v = Math.max(0.1, Math.min(0.95, v + (rng() - 0.45) * 0.3)); a.push(v) }
  return a
})

const geom = computed(() => {
  const d = data.value
  const max = Math.max(...d), min = Math.min(...d), span = max - min || 1
  const yFor = (v: number) => h.value - ((v - min) / span) * (h.value - 3) - 1.5
  let pts: string[]
  if (d.length > 1) {
    const step = w.value / (d.length - 1)
    pts = d.map((v, i) => `${i * step},${yFor(v)}`)
  } else {
    // degenerate single/zero-point input: draw a flat line across the full width
    const y = yFor(d[0] ?? 0.5)
    pts = [`0,${y}`, `${w.value},${y}`]
  }
  const line = 'M' + pts.join(' L')
  return { line, area: `${line} L${w.value},${h.value} L0,${h.value} Z` }
})
const line = computed(() => geom.value.line)
const area = computed(() => geom.value.area)
const gid = computed(() => `kc-spk-${seed.value}-${Math.round(w.value)}`)
</script>

<style scoped>
.kc-spark { display: block; overflow: visible; }
</style>
