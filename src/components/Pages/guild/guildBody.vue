
<template>
    <div class="HeaderFont MainContainer" v-if="guild">
        <q-tab-panels keep-alive
          :tab="timer"
          @update:tab="timer = $event" animated
        >

          <q-tab-panel class="GreyBackground" name="overview">
          </q-tab-panel>

          <q-tab-panel class="GreyBackground" name="members">
            <GuildMemberList :guildMembers="guild.members" :region="guild.region"/>
          </q-tab-panel>

          <q-tab-panel class="GreyBackground" name="mythicPlus">
              <GuildStatsPage :guildMembers="guild.members" :region="guild.region" />
          </q-tab-panel >
          <q-tab-panel class="GreyBackground" name="raid">
              <div>
                {{`Plan to add raid data here when auto scanning is implemented`}}
              </div>
          </q-tab-panel>
        </q-tab-panels>
    </div>
    <q-skeleton class="MainContainer" v-else>

    </q-skeleton>
</template>
 <script>
 import GuildMemberList from 'components/Pages/guild/body/GuildMemberList.vue';
 import GuildStatsPage from 'components/Pages/guild/body/GuildStatsPage.vue';

 export default {
     props: ['tab', 'guild'],
     components: {
         GuildMemberList,
         GuildStatsPage
     },


 }
 </script>

<style scoped>
.MainContainer {
    min-height: 800px;
}

</style>
