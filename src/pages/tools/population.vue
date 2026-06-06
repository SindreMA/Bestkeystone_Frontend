<template>
  <div class="kc-root kc-tools-population">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Tools · Population"
        title="Key-level Population Funnel"
        sub="Unique players who have timed at least one key at each level this season."
      />

      <!-- No backend exists for this view yet. We deliberately show an honest
           empty state rather than fabricated numbers. -->
      <KcCard :level="1">
        <div class="kc-pop__empty">
          <div class="kc-pop__empty-icon">∅</div>
          <p class="kc-pop__empty-title">Not available yet</p>
          <p class="kc-pop__empty-msg">
            This view needs a backend that hasn't been built, and we won't show
            placeholder data.
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
.kc-tools-population { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }

/* empty state */
.kc-pop__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 48px 20px; }
.kc-pop__empty-icon { font-size: 28px; opacity: 0.5; margin-bottom: 12px; }
.kc-pop__empty-title { margin: 0 0 6px; font-size: 15px; font-weight: 600; color: var(--kc-text-hi); }
.kc-pop__empty-msg { margin: 0 auto; max-width: 440px; line-height: 1.5; color: var(--kc-text-mid); }
</style>
