<template>
  <div class="MainContainer" v-if="guild">
    <q-tab-panels keep-alive :model-value="tab" animated>
      <q-tab-panel class="panel-content" name="overview">
        <div class="overview-grid">
          <GuildQuickStats :guild="guild" />
          <GuildTopPerformers :guild="guild" :region="guild.region" />
          <GuildWeeklyActivity :guild="guild" :region="guild.region" />
        </div>
        <GuildMemberStats :guild="guild" />
      </q-tab-panel>

      <q-tab-panel class="panel-content" name="members">
        <GuildMemberList :guildMembers="guild.members" :region="guild.region" />
      </q-tab-panel>

      <q-tab-panel class="panel-content" name="mythicPlus">
        <GuildStatsPage :guildMembers="guild.members" :region="guild.region" />
      </q-tab-panel>

      <q-tab-panel class="panel-content" name="raid">
        <div class="placeholder-text">
          Raid data will be available when auto scanning is implemented.
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <q-skeleton class="MainContainer" v-else height="400px" />
</template>

<script>
import GuildMemberList from 'components/Pages/guild/body/GuildMemberList.vue'
import GuildStatsPage from 'components/Pages/guild/body/GuildStatsPage.vue'
import GuildQuickStats from 'components/Pages/guild/body/GuildQuickStats.vue'
import GuildTopPerformers from 'components/Pages/guild/body/GuildTopPerformers.vue'
import GuildWeeklyActivity from 'components/Pages/guild/body/GuildWeeklyActivity.vue'
import GuildMemberStats from 'components/Pages/guild/body/GuildMemberStats.vue'

export default {
  props: ['tab', 'guild'],
  components: {
    GuildMemberList,
    GuildStatsPage,
    GuildQuickStats,
    GuildTopPerformers,
    GuildWeeklyActivity,
    GuildMemberStats
  }
}
</script>

<style scoped>
.MainContainer {
  min-height: 400px;
}

.panel-content {
  background: transparent !important;
  padding: 0 !important;
}

.overview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.placeholder-text {
  padding: 40px;
  text-align: center;
  color: var(--text-low);
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
}
</style>

<style>
/* Override Quasar tab-panels default white background */
.MainContainer .q-tab-panels {
  background: transparent !important;
}

.MainContainer .q-tab-panel {
  background: transparent !important;
}
</style>
