<template>
  <span class="kc-tierbadge" :class="[`kc-tierbadge--${tier}`, { 'kc-tierbadge--lg': lg }]">{{ tier }}</span>
</template>

<script lang="ts" setup>
defineProps<{
  tier: 'S' | 'A' | 'B' | 'C' | 'D'
  lg?: boolean
}>()
</script>

<style scoped>
.kc-tierbadge {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--kc-r-md);
  font-family: var(--kc-font-display);
  font-weight: 700;
  font-size: 14px;
  color: var(--kc-text-inverse);
  flex-shrink: 0;
}
.kc-tierbadge--lg {
  width: 34px;
  height: 34px;
  font-size: 17px;
  border-radius: var(--kc-r-lg);
}
.kc-tierbadge--S { background: var(--kc-tier-s); }
.kc-tierbadge--A { background: var(--kc-tier-a); }
.kc-tierbadge--B { background: var(--kc-tier-b); color: #0A0E14; }
.kc-tierbadge--C { background: var(--kc-tier-c); color: #0A0E14; }
.kc-tierbadge--D { background: var(--kc-tier-d); color: #0A0E14; }
</style>
