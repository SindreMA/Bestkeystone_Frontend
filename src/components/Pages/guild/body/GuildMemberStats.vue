<template>
  <div class="member-stats-container">
    <div class="info-header">Member Statistics</div>
    <div class="info-content">
      <div class="stats-section">
        <div class="section-title">Class Distribution</div>
        <div class="class-grid">
          <div
            v-for="classInfo in classDistribution"
            :key="classInfo.id"
            class="class-item"
          >
            <q-img
              spinner-size="15px"
              spinner-color="white"
              class="class-icon"
              :src="classInfo.icon_url"
            />
            <div class="class-info">
              <span class="class-count">{{ classInfo.count }}</span>
              <span class="class-name">{{ classInfo.name }}</span>
            </div>
            <div class="class-bar">
              <div
                class="class-bar-fill"
                :style="{ width: classInfo.percentage + '%', backgroundColor: classInfo.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="section-title">Score Distribution</div>
        <div class="score-brackets">
          <div
            v-for="bracket in scoreBrackets"
            :key="bracket.label"
            class="bracket-item"
          >
            <div class="bracket-label">{{ bracket.label }}</div>
            <div class="bracket-bar">
              <div
                class="bracket-bar-fill"
                :style="{ width: bracket.percentage + '%' }"
              ></div>
            </div>
            <div class="bracket-count">{{ bracket.count }}</div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="section-title">Member Overview</div>
        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-value">{{ highestScore }}</div>
            <div class="overview-label">Highest Score</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ medianScore }}</div>
            <div class="overview-label">Median Score</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ membersWithRuns }}</div>
            <div class="overview-label">Members with Runs</div>
          </div>
          <div class="overview-item">
            <div class="overview-value">{{ averageKeystoneLevel }}</div>
            <div class="overview-label">Avg Key Level</div>
          </div>
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
  }
})

const { guild } = toRefs(props)
const store = useStore()

const GetClasses = computed(() => store.state.data.Classes || [])

const classColors = {
  1: '#C79C6E',  // Warrior
  2: '#F58CBA',  // Paladin
  3: '#ABD473',  // Hunter
  4: '#FFF569',  // Rogue
  5: '#FFFFFF',  // Priest
  6: '#C41F3B',  // Death Knight
  7: '#0070DE',  // Shaman
  8: '#69CCF0',  // Mage
  9: '#9482C9',  // Warlock
  10: '#00FF96', // Monk
  11: '#FF7D0A', // Druid
  12: '#A330C9', // Demon Hunter
  13: '#33937F', // Evoker
}

const classDistribution = computed(() => {
  if (!guild.value?.members || !GetClasses.value.length) return []

  const classCounts = {}
  guild.value.members.forEach(member => {
    classCounts[member._class] = (classCounts[member._class] || 0) + 1
  })

  const totalMembers = guild.value.members.length

  return GetClasses.value
    .filter(c => classCounts[c.id])
    .map(c => ({
      id: c.id,
      name: c.name,
      icon_url: c.icon_url,
      count: classCounts[c.id],
      percentage: Math.round((classCounts[c.id] / totalMembers) * 100),
      color: classColors[c.id] || '#888888'
    }))
    .sort((a, b) => b.count - a.count)
})

const scoreBrackets = computed(() => {
  if (!guild.value?.members) return []

  const brackets = [
    { label: '3000+', min: 3000, max: Infinity, count: 0 },
    { label: '2500-3000', min: 2500, max: 3000, count: 0 },
    { label: '2000-2500', min: 2000, max: 2500, count: 0 },
    { label: '1500-2000', min: 1500, max: 2000, count: 0 },
    { label: '1000-1500', min: 1000, max: 1500, count: 0 },
    { label: '500-1000', min: 500, max: 1000, count: 0 },
    { label: '0-500', min: 0, max: 500, count: 0 },
  ]

  guild.value.members.forEach(member => {
    const score = member.run_data?.score || 0
    for (const bracket of brackets) {
      if (score >= bracket.min && score < bracket.max) {
        bracket.count++
        break
      }
    }
  })

  const maxCount = Math.max(...brackets.map(b => b.count), 1)

  return brackets.map(b => ({
    ...b,
    percentage: Math.round((b.count / maxCount) * 100)
  }))
})

const highestScore = computed(() => {
  if (!guild.value?.members?.length) return 0
  return Math.round(Math.max(...guild.value.members.map(m => m.run_data?.score || 0)))
})

const medianScore = computed(() => {
  if (!guild.value?.members?.length) return 0
  const scores = guild.value.members
    .map(m => m.run_data?.score || 0)
    .filter(s => s > 0)
    .sort((a, b) => a - b)
  if (scores.length === 0) return 0
  const mid = Math.floor(scores.length / 2)
  return Math.round(scores.length % 2 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2)
})

const membersWithRuns = computed(() => {
  if (!guild.value?.members) return 0
  return guild.value.members.filter(m => m.run_data?.seasonBestRuns?.length > 0).length
})

const averageKeystoneLevel = computed(() => {
  if (!guild.value?.members?.length) return 0
  let totalLevel = 0
  let runCount = 0
  guild.value.members.forEach(member => {
    if (member.run_data?.seasonBestRuns) {
      member.run_data.seasonBestRuns.forEach(run => {
        totalLevel += run.keystoneLevel
        runCount++
      })
    }
  })
  return runCount > 0 ? (totalLevel / runCount).toFixed(1) : 0
})
</script>

<style scoped>
.member-stats-container {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: 100%;
  margin-top: 16px;
}

.info-header {
  background: var(--bg-elevated);
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-default);
}

.info-content {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.stats-section {
  flex: 1;
  min-width: 280px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.class-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
}

.class-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.class-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.class-count {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 24px;
}

.class-name {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.class-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-surface);
  border-radius: 3px;
  overflow: hidden;
}

.class-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.score-brackets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bracket-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bracket-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  min-width: 80px;
}

.bracket-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-elevated);
  border-radius: 4px;
  overflow: hidden;
}

.bracket-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bracket-count {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 30px;
  text-align: right;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.overview-item {
  text-align: center;
  padding: 12px;
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.overview-item:hover {
  border-color: var(--border-accent);
}

.overview-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.overview-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

@media (max-width: 768px) {
  .info-content {
    flex-direction: column;
  }

  .stats-section {
    min-width: 100%;
  }
}
</style>
