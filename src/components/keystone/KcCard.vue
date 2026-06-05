<template>
  <div class="kc-card" :class="[`kc-card--l${level}`, { 'kc-card--hoverable': hoverable }]">
    <div v-if="hasHeader" class="kc-card__header">
      <div class="kc-card__title">
        <slot name="header">{{ header }}</slot>
      </div>
      <div v-if="$slots.headerRight" class="kc-card__header-right">
        <slot name="headerRight" />
      </div>
    </div>
    <div class="kc-card__body" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  level: { type: Number, default: 1 }, // 1 surface, 2 raised
  header: { type: String, default: '' },
  hoverable: { type: Boolean, default: false },
  bodyStyle: { type: [Object, String], default: () => ({}) },
})

const slots = useSlots()
const hasHeader = computed(() => !!props.header || !!slots.header)
</script>

<style scoped>
.kc-card {
  background: var(--kc-bg-surface);
  border: 1px solid var(--kc-line-default);
  border-radius: var(--kc-r-lg);
  box-shadow: var(--kc-shadow-sm);
  transition: border-color var(--kc-motion-fast) ease;
  min-width: 0;
}
.kc-card--l2 {
  background: var(--kc-bg-raised);
  border-color: var(--kc-line-strong);
  box-shadow: var(--kc-shadow-md);
}
.kc-card--hoverable:hover { border-color: var(--kc-line-strong); }

.kc-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--kc-sp-3);
  padding: 12px 16px;
  background: var(--kc-bg-raised);
  border-bottom: 1px solid var(--kc-line-hairline);
  border-radius: var(--kc-r-lg) var(--kc-r-lg) 0 0;
}
.kc-card__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--kc-text-hi);
  display: flex;
  align-items: center;
  gap: 8px;
}
.kc-card__body { padding: var(--kc-sp-5); }
</style>
