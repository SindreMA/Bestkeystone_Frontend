<template>
  <div class="info-box">
    <div class="info-header">Quick Stats</div>
    <div class="info-content">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ guild.members.length }}</div>
          <div class="stat-label">Members</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ averageScore }}</div>
          <div class="stat-label">Avg Score</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ activePlayers }}</div>
          <div class="stat-label">Active This Week</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalWeeklyRuns }}</div>
          <div class="stat-label">Runs This Week</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  guild: {
    type: Object,
    required: true
  }
})

const { guild } = toRefs(props)

const averageScore = computed(() => {
  if (!guild.value?.members?.length) return 0
  const membersWithScore = guild.value.members.filter(m => m.run_data?.score > 0)
  if (membersWithScore.length === 0) return 0
  const total = membersWithScore.reduce((sum, m) => sum + (m.run_data?.score || 0), 0)
  return Math.round(total / membersWithScore.length)
})

const activePlayers = computed(() => {
  if (!guild.value?.members) return 0
  return guild.value.members.filter(m => m.run_data?.weeklyRuns?.length > 0).length
})

const totalWeeklyRuns = computed(() => {
  if (!guild.value?.members) return 0
  return guild.value.members.reduce((sum, m) => sum + (m.run_data?.weeklyRuns?.length || 0), 0)
})
</script>

<style scoped>
.info-box {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 1;
  min-width: 280px;
}

.info-header {
  background: var(--bg-raised);
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-hi);
  border-bottom: 1px solid var(--line-default);
}

.info-content {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: var(--bg-raised);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
  border: 1px solid transparent;
  min-width: 0;
}

.stat-item:hover {
  border-color: var(--line-strong);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-hi);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-mid);
  margin-top: 4px;
}
</style>
