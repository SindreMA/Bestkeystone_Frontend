<template>
  <div class="kc-root kc-fastest">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Leaderboard · Fastest Times"
        title="Fastest Times"
        sub="Ranked ascending by clear time relative to par."
      />

      <!-- honest empty state: no backend exists for this view yet, so we
           intentionally show nothing rather than fabricated numbers. -->
      <KcCard :level="1">
        <div class="kc-fastest__empty">
          <div class="kc-fastest__empty-icon">⚡</div>
          <p class="kc-fastest__empty-title">Not available yet</p>
          <p class="kc-fastest__empty-text">
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

/* ------------------------------------------------------------------ *
 * Fastest Times has NO backend endpoint yet. Rather than render
 * fabricated/mock leaderboard rows, this page shows an honest empty
 * state. When the backend ships, wire it to the live API (apiUrl /
 * SelectedPeriode / SelectedLevelBand) and the real Vuex reference
 * metadata via components/keystone/useKc + src/data/metaReference.
 * Do NOT reintroduce src/mocks/meta — fabricated data must never reach
 * users.
 * ------------------------------------------------------------------ */
</script>

<style scoped>
.kc-fastest { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }

/* ---- empty ---- */
.kc-fastest__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 48px 20px; }
.kc-fastest__empty-icon { font-size: 22px; opacity: 0.5; margin-bottom: 12px; }
.kc-fastest__empty-title { font-size: 15px; font-weight: 600; color: var(--kc-text-hi); margin: 0 0 6px; }
.kc-fastest__empty-text { margin: 0 auto; max-width: 420px; line-height: 1.5; }

@media (max-width: 600px) {
  .kc-container { padding-left: 12px; padding-right: 12px; }
}
</style>
