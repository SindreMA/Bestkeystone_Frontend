<template>
  <div class="kc-root kc-cutoffs">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Title Cutoffs"
        title="Title Cutoff & Percentile"
        sub="Season title cutoffs and percentile thresholds"
      />

      <KcCard :level="1" class="cut-empty">
        <div class="cut-empty__inner">
          <q-icon name="construction" class="cut-empty__icon" />
          <div class="cut-empty__title">Not available yet</div>
          <p class="cut-empty__body">
            This view needs a backend that hasn't been built. We won't show placeholder
            data — check back once the cutoff data source is live.
          </p>
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
</script>

<style scoped>
.kc-cutoffs { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* ---- honest empty state (no backend yet) ---- */
.cut-empty__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--kc-sp-3);
  padding: var(--kc-sp-6) var(--kc-sp-4);
}
.cut-empty__icon { font-size: 40px; color: var(--kc-text-low); }
.cut-empty__title { font-size: 18px; font-weight: 600; color: var(--kc-text-hi); }
.cut-empty__body {
  margin: 0;
  max-width: 460px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--kc-text-mid);
}
</style>
