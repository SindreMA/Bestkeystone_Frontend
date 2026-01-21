<template>
  <div class="home-dashboard">
    <div class="dashboard-content">
      <section class="dashboard-section">
        <h2 class="section-heading">Live Run Tracking</h2>
        <p class="section-desc">Runs completed this week across all dungeons</p>
        <QuickRunsView>
          <section class="dashboard-section">
            <h2 class="section-heading">Top Performers</h2>
            <p class="section-desc">This week's leading specs by role</p>
            <TopSpecsView />
          </section>

          <section class="dashboard-section">
            <h2 class="section-heading">Dungeon Trends</h2>
            <p class="section-desc">Popular and successful dungeons</p>
            <QuickDungeonView />
          </section>
        </QuickRunsView>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CurrentAffixes from 'components/ItemViews/CurrentAffixes.vue'
import QuickRunsView from 'components/ItemViews/QuickRunsView.vue'
import QuickDungeonView from 'components/ItemViews/QuickDungeonView.vue'
import TopSpecsView from 'components/ItemViews/TopSpecsView.vue'
</script>

<style>
/* Home Dashboard */
.home-dashboard {
  min-height: 100vh;
}

.dashboard-content {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Section styling */
.dashboard-section {
  margin-bottom: 32px;
}

.section-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  text-align: center;
}

.section-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 20px 0;
  text-align: center;
}

/* Runs counter */
.home-dashboard .HeaderFont {
  color: var(--text-primary);
}

.home-dashboard h5 {
  color: var(--text-primary);
  margin: 10px 0;
}

.home-dashboard .nrFont {
  font-size: 3rem;
  font-weight: 700;
  color: #f59e0b;
  margin: 16px 0;
}

/* Live indicator */
.home-dashboard .live-indicator {
  margin-bottom: 24px;
}

/* Tables */
.home-dashboard .tableAutoSizing {
  padding: 16px 0;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 1rem;
}

.home-dashboard .flex.justify-around {
  gap: 20px;
  flex-wrap: wrap;
}

.home-dashboard .q-table {
  width: 100%;
}

.home-dashboard .q-table a {
  color: inherit;
}

.home-dashboard .q-table a:hover {
  text-decoration: underline;
}

/* Links */
.home-dashboard .HeaderFont > a,
.home-dashboard .tableAutoSizing > a {
  color: var(--text-accent);
  font-size: 0.85rem;
  font-weight: 400;
  margin-top: 12px;
  display: inline-block;
}

.home-dashboard .HeaderFont > a:hover,
.home-dashboard .tableAutoSizing > a:hover {
  color: var(--text-primary);
}

/* Responsive */
@media screen and (min-width: 1024px) {
  .home-dashboard .tableAutoSizing {
    max-width: 650px;
    flex: 1;
  }
}

@media screen and (max-width: 1024px) {
  .home-dashboard .flex.justify-around {
    flex-direction: column;
    align-items: center;
  }

  .home-dashboard .tableAutoSizing {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .home-dashboard .nrFont {
    font-size: 2.5rem;
  }

  /* Make tables more readable on mobile */
  .home-dashboard .q-table {
    font-size: 0.9rem;
  }

  .home-dashboard .q-table th,
  .home-dashboard .q-table td {
    padding: 8px 4px;
  }
}

@media (max-width: 600px) {
  .dashboard-content {
    padding: 20px 4px;
  }

  .home-dashboard .nrFont {
    font-size: 2rem;
  }

  .home-dashboard .q-table {
    font-size: 0.85rem;
  }
}
</style>
