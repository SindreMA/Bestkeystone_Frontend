<template>
  <div class="info-box">
    <div class="info-header">Top Performers</div>
    <div class="info-content">
      <div class="performers-list" v-if="topPlayers.length">
        <router-link
          v-for="(player, index) in topPlayers"
          :key="player.id"
          :to="`/lookup/player/${region}/${player.realm}/${player.name}`"
          class="performer-row"
        >
          <div class="rank">{{ index + 1 }}</div>
          <q-img
            :src="getClass(player._class)?.icon_url"
            class="class-icon"
            spinner-size="12px"
          />
          <classTextColor :_class="player._class">
            <span class="player-name">{{ player.name }}</span>
          </classTextColor>
          <div class="player-stats">
            <span class="score">{{ Math.round(player.run_data?.score || 0) }}</span>
            <span class="highest-key" v-if="getHighestKey(player)">
              +{{ getHighestKey(player) }}
            </span>
          </div>
        </router-link>
      </div>
      <div class="empty-state" v-else>
        No M+ data available
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { useStore } from 'src/store'
import classTextColor from 'src/components/containers/classTextColor.vue'

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

const topPlayers = computed(() => {
  if (!guild.value?.members) return []
  return [...guild.value.members]
    .filter(m => m.run_data?.score > 0)
    .sort((a, b) => (b.run_data?.score || 0) - (a.run_data?.score || 0))
    .slice(0, 5)
})

const getClass = (id) => {
  if (GetClasses.value) {
    return GetClasses.value.find(c => c.id === id)
  }
  return null
}

const getHighestKey = (player) => {
  const runs = player.run_data?.seasonBestRuns || []
  if (runs.length === 0) return null
  return Math.max(...runs.map(r => r.keystoneLevel || 0))
}
</script>

<style scoped>
.info-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex: 1;
  min-width: 280px;
}

.info-header {
  background: var(--bg-elevated);
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-default);
}

.info-content {
  padding: 8px;
}

.performers-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.performer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: background var(--transition-fast);
}

.performer-row:hover {
  background: var(--bg-hover);
}

.rank {
  width: 20px;
  font-weight: 600;
  color: var(--text-muted);
  text-align: center;
}

.performer-row:nth-child(1) .rank {
  color: #ffd700;
}

.performer-row:nth-child(2) .rank {
  color: #c0c0c0;
}

.performer-row:nth-child(3) .rank {
  color: #cd7f32;
}

.class-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
}

.player-name {
  flex: 1;
  font-weight: 500;
}

.player-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score {
  font-weight: 600;
  color: var(--text-primary);
}

.highest-key {
  font-size: 0.85rem;
  color: var(--accent-secondary);
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
}
</style>
