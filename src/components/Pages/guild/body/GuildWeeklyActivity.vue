<template>
  <div class="info-box">
    <div class="info-header">Weekly Activity</div>
    <div class="info-content">
      <div class="activity-stats">
        <div class="activity-main">
          <div class="big-number">{{ totalWeeklyRuns }}</div>
          <div class="big-label">Runs This Week</div>
        </div>

        <div class="activity-details">
          <div class="detail-row">
            <span class="detail-label">Active Members</span>
            <span class="detail-value">{{ activeMembersCount }} / {{ guild.members.length }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Participation</span>
            <span class="detail-value">{{ participationRate }}%</span>
          </div>
        </div>
      </div>

      <div class="most-active" v-if="mostActiveMembers.length">
        <div class="section-label">Most Active</div>
        <div class="active-members">
          <router-link
            v-for="member in mostActiveMembers"
            :key="member.id"
            :to="`/lookup/player/${region}/${member.realm}/${member.name}`"
            class="active-member"
          >
            <q-img
              :src="getClass(member._class)?.icon_url"
              class="class-icon"
              spinner-size="10px"
            />
            <span class="member-name">{{ member.name }}</span>
            <span class="run-count">{{ member.run_data?.weeklyRuns?.length || 0 }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'src/store'

const props = defineProps({
  guild: {
    type: Object,
    required: true
  },
  region: {
    type: String,
    required: true
  }
})

const { guild, region } = toRefs(props)
const store = useStore()

const GetClasses = computed(() => store.state.data.Classes)

const totalWeeklyRuns = computed(() => {
  if (!guild.value?.members) return 0
  return guild.value.members.reduce((sum, m) => sum + (m.run_data?.weeklyRuns?.length || 0), 0)
})

const activeMembersCount = computed(() => {
  if (!guild.value?.members) return 0
  return guild.value.members.filter(m => m.run_data?.weeklyRuns?.length > 0).length
})

const participationRate = computed(() => {
  if (!guild.value?.members?.length) return 0
  return Math.round((activeMembersCount.value / guild.value.members.length) * 100)
})

const mostActiveMembers = computed(() => {
  if (!guild.value?.members) return []
  return [...guild.value.members]
    .filter(m => m.run_data?.weeklyRuns?.length > 0)
    .sort((a, b) => (b.run_data?.weeklyRuns?.length || 0) - (a.run_data?.weeklyRuns?.length || 0))
    .slice(0, 3)
})

const getClass = (id) => {
  if (GetClasses.value) {
    return GetClasses.value.find(c => c.id === id)
  }
  return null
}
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

.activity-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.activity-main {
  text-align: center;
  padding: 16px 24px;
  background: var(--bg-raised);
  border-radius: var(--radius-md);
}

.big-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.big-label {
  font-size: 0.8rem;
  color: var(--text-mid);
  margin-top: 4px;
}

.activity-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-raised);
  border-radius: var(--radius-sm);
}

.detail-label {
  color: var(--text-mid);
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  color: var(--text-hi);
}

.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-low);
  margin-bottom: 8px;
}

.active-members {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.active-member {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: inherit;
  transition: background var(--transition-fast);
}

.active-member:hover {
  background: var(--bg-hover);
}

.class-icon {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
}

.member-name {
  flex: 1;
  font-size: 0.9rem;
}

.run-count {
  font-weight: 600;
  color: var(--signal-cyan);
  background: var(--bg-raised);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
}

@media (max-width: 500px) {
  .activity-stats {
    flex-direction: column;
  }
}
</style>
