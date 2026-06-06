<template>
  <div class="kc-root kc-meta-faction">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Meta · Faction & Region"
        title="Faction & Region"
        sub="Compare timed-rate, score spread and top comps across factions."
      />

      <!-- honest empty state: no backend exists for this view yet -->
      <KcCard :level="1">
        <div class="fac-empty">
          <div class="fac-empty__icon">◔</div>
          <div class="fac-empty__title">Not available yet</div>
          <p class="fac-empty__body">
            This view needs a backend that hasn't been built yet, and we won't show
            placeholder data. Check back once faction &amp; region stats are wired up.
          </p>
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'

/*
  Faction & Region has no backend endpoint yet. Rather than fabricate numbers,
  the route stays valid but renders an honest empty state. When the per-region
  faction endpoint ships, wire real loading/empty/error states here using the
  store (SelectedPeriode / SelectedLevelBand / apiUrl) and the shared reference
  metadata in src/data/metaReference.ts — never mock/fabricated data.
*/
</script>

<style scoped>
.kc-meta-faction { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* empty state */
.fac-empty { text-align: center; color: var(--kc-text-mid); padding: var(--kc-sp-7) var(--kc-sp-5); }
.fac-empty__icon { font-size: 28px; opacity: 0.5; margin-bottom: 12px; }
.fac-empty__title { font-size: 15px; font-weight: 700; color: var(--kc-text-hi); margin-bottom: 6px; }
.fac-empty__body { max-width: 46ch; margin: 0 auto; font-size: 13px; line-height: 1.5; color: var(--kc-text-low); }
</style>
