<template>
  <span v-if="!hasData" class="kc-tnum kc-delta kc-delta--none">{{ isNew ? 'new' : '—' }}</span>
  <span v-else-if="delta === 0" class="kc-delta kc-delta--flat">–</span>
  <span v-else class="kc-tnum kc-delta" :class="up ? 'kc-delta--up' : 'kc-delta--down'">
    <span class="kc-delta__arrow">{{ up ? '▲' : '▼' }}</span>{{ up ? '+' : '−' }}{{ Math.abs(delta) }}
  </span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  delta: { type: Number, default: 0 },
  hasData: { type: Boolean, default: true },
  isNew: { type: Boolean, default: false },
})
const { delta, hasData, isNew } = toRefs(props)
const up = computed(() => delta.value > 0)
</script>

<style scoped>
.kc-delta { display: inline-flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 700; }
.kc-delta__arrow { font-size: 9px; }
.kc-delta--up { color: var(--kc-pos); }
.kc-delta--down { color: var(--kc-neg); }
.kc-delta--flat { color: var(--kc-neutral); font-weight: 700; }
.kc-delta--none { color: var(--kc-text-ghost); font-weight: 600; }
</style>
