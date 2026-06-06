<template>
  <span
    class="kc-disp kc-tnum kc-rankchip"
    :class="[`kc-rankchip--${size}`, { 'kc-rankchip--medal': medal, 'kc-rankchip--1': rank === 1 }]"
    :style="medal ? { color: medal, background: 'var(--kc-bg-inset)', boxShadow: `0 0 0 1px ${medal}, 0 0 8px -3px ${medal}` } : null"
  >{{ rank }}</span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  rank: { type: Number, required: true },
  size: { type: String, default: 'md' }, // sm | md
})
const { rank } = toRefs(props)

const MEDALS = ['var(--kc-rank-gold)', 'var(--kc-rank-silver)', 'var(--kc-rank-bronze)']
const medal = computed(() => (rank.value <= 3 ? MEDALS[rank.value - 1] : null))
</script>

<style scoped>
.kc-rankchip {
  display: grid;
  place-items: center;
  border-radius: var(--kc-r-md);
  font-weight: 700;
  color: var(--kc-text-mid);
  background: transparent;
  flex: none;
}
.kc-rankchip--md { width: 30px; height: 30px; font-size: 15px; }
.kc-rankchip--sm { width: 26px; height: 26px; font-size: 13px; }
.kc-rankchip--1 { animation: kc-ringshimmer 3s ease-in-out infinite; }
@keyframes kc-ringshimmer { 0%,100% { opacity: 0.78; } 50% { opacity: 1; } }
</style>
