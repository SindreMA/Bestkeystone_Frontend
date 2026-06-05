<template>
  <div class="kc-root kc-home-page">
    <div class="kc-container kc-wide">
      <BetweenSeasonsBanner />
      <div class="kc-home-col">
        <KcHero />
        <div class="kc-home-row2">
          <KcLiveTracking />
          <div class="kc-home-side">
            <KcTopPerformers />
            <KcDungeonTrends />
          </div>
        </div>
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
  grid-template-columns: 1.35fr 1fr;
  gap: var(--kc-sp-5);
  align-items: start;
}
@media (max-width: 900px) {
  .kc-home-row2 { grid-template-columns: 1fr; }
}

.kc-home-side {
  display: flex;
  flex-direction: column;
  gap: var(--kc-sp-5);
  min-width: 0;
}
</style>
