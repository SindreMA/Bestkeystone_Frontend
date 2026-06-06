<template>
  <div class="kc-root kc-tools-planner">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Planner"
        title="What should I farm next?"
        sub="Ranked by marginal score per +1, flagged by how realistic the key is"
      />

      <!-- No backend endpoint exists for this view yet. Per owner directive we
           never show fabricated/placeholder data — show an honest empty state
           instead of mock rankings or a fake character lookup. -->
      <KcCard :level="1">
        <div class="kc-plan__empty">
          <div class="kc-plan__empty-icon">⛏️</div>
          <div class="kc-plan__empty-title">Not available yet</div>
          <p class="kc-plan__empty-text">
            This view needs a backend that hasn't been built. We won't show
            placeholder data, so there's nothing to display here yet.
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
.kc-tools-planner { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* honest empty state */
.kc-plan__empty { text-align: center; color: var(--kc-text-mid); padding: 48px 20px; }
.kc-plan__empty-icon { font-size: 26px; opacity: 0.6; margin-bottom: 10px; }
.kc-plan__empty-title { font-weight: 600; font-size: 15px; color: var(--kc-text-hi); margin-bottom: 6px; }
.kc-plan__empty-text { font-size: 13px; line-height: 1.5; max-width: 420px; margin: 0 auto; }
</style>
