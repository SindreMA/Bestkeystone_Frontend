<template>
  <div class="kc-root kc-home-page">
    <div class="kc-container kc-wide">
      <BetweenSeasonsBanner />
      <div class="kc-home-col">
        <KcHero />
        <div class="kc-home-row2">
          <KcLiveTracking />
          <KcTopPerformers />
        </div>
        <KcDungeonTrends />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BetweenSeasonsBanner from 'components/Warnings/BetweenSeasonsBanner.vue'
import KcHero from 'components/keystone/KcHero.vue'
import KcLiveTracking from 'components/keystone/KcLiveTracking.vue'
import KcTopPerformers from 'components/keystone/KcTopPerformers.vue'
import KcDungeonTrends from 'components/keystone/KcDungeonTrends.vue'
</script>

<style scoped>
/* the redesigned home is a self-contained dark instrument canvas */
.kc-home-page {
  border-radius: var(--kc-r-xl);
  padding: var(--kc-sp-6) 0;
}

.kc-container {
  width: 100%;
  max-width: var(--kc-content-wide);
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.kc-home-col {
  display: flex;
  flex-direction: column;
  gap: var(--kc-sp-5);
  min-width: 0;
}

.kc-home-row2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: var(--kc-sp-5);
  align-items: stretch;
}
/* both top-row cards fill the row height so they bottom-align with each other */
.kc-home-row2 > * { min-width: 0; height: 100%; }

@media (max-width: 600px) {
  .kc-container { padding-left: 0; padding-right: 0; }
  .kc-home-page { padding-top: var(--kc-sp-4); padding-bottom: var(--kc-sp-4); }
}
</style>
