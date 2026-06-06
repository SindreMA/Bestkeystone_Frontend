<template>
  <div class="kc-pagehead">
    <div class="kc-pagehead__text">
      <div v-if="eyebrow" class="kc-pagehead__eyebrow">{{ eyebrow }}</div>
      <h1 class="kc-pagehead__title">{{ title }}</h1>
      <div v-if="sub" class="kc-pagehead__sub">{{ sub }}</div>
    </div>
    <div v-if="$slots.right" class="kc-pagehead__right">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  sub: { type: String, default: '' },
})
</script>

<style scoped>
.kc-pagehead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin: 8px 0 24px;
}
.kc-pagehead__text { min-width: 0; }
.kc-pagehead__eyebrow {
  font-family: var(--font-display);
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-low);
  margin-bottom: 6px;
}
.kc-pagehead__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  line-height: 32px;
  letter-spacing: -0.01em;
  color: var(--text-hi);
  margin: 0;
}
.kc-pagehead__sub {
  font-size: 14px;
  color: var(--text-mid);
  margin-top: 6px;
  max-width: 640px;
}
.kc-pagehead__right { display: flex; align-items: center; gap: 10px; flex: none; }
</style>
