<template>
  <div>
    <div class="flex-center Centertext HeaderFont">
      <div class>
        <!-- <AffixScheduleFetcher> -->
        <!--   <AffixSchedule /> -->
        <!-- </AffixScheduleFetcher> -->

        <br>
        <br>
        <Tools></Tools>
        <br>
        <br>
        <div class="HeaderSize3">Useful Discords</div>
        <DiscordLinksFetcher v-slot="{data}" class="flex justify-center">
          <DiscordLink :discord="discord" v-for="(discord, index) in data" :key="index" />
        </DiscordLinksFetcher>
        <br>
        <br>
        <div class="HeaderSize3">Other useful wow sites</div>
        <div class="flex justify-content-around">
            <DiscordLink :discord="site" v-for="(site,i) in sites" :key="i" />
        </div>
        <br>
        <br>
        <div class="HeaderSize3">Other projects</div>
        <CreatorsProjectsFetcher v-slot="{data}" class="flex justify-around">
          <CreatorsProjects :project="pro" v-for="(pro, i) in data" :key="i" />
        </CreatorsProjectsFetcher>

        <br>
        <br>

        <p class="HeaderSize3">So how does it work?</p>
        <p>Every 30 minutes it runs a program on the bestkeystone server.
          This program downloads all the top 500 keystone runs per connected realm. It then checks which runs are not in
          the database and then adds the new ones.

          It will then update some reports such as "Team compositions". These data reports take a bit of time to
          generate and can not be changed on demand. The rest of the data is quick to generate reports for. So it is
          possible to change the settings with the help of the setting wheel in the top right of the page.</p>
        <br>
        <CloudinaryFormat url="info/keystonecollector.gif" v-slot="{ link }">
          <video style="width: 70%;" :src="link" loop autoplay/>
        </CloudinaryFormat>
      </div>
      <br>
      <br>
      <div>Got any great feature ideas, or found a bug you want to report?</div>
      <div>You can reach the creator on discord tag SindreMA#9630 or sindrema@gmail.com, or connect to our discord</div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import DataUpdaterView from "../../components/ItemViews/DataUpdaterView.vue";
import AffixSchedule from "../../components/Pages/info/AffixSchedule.vue";
import DiscordLink from "../../components/Pages/info/DiscordLink.vue";
import Tools from "../../components/Pages/info/Tools.vue";
import renameMonitor from "../../components/Pages/info/renameMonitor.vue";
import CreatorsProjects from "../../components/Pages/info/CreatorsProjects.vue";
import DiscordLinksFetcher from '../../components/fetchers/DiscordLinksFetcher.vue'
import AffixScheduleFetcher from '../../components/fetchers/AffixScheduleFetcher.vue'
import CreatorsProjectsFetcher from '../../components/fetchers/CreatorsProjectsFetcher.vue'
import CloudinaryFormat from '../../components/data_formatters/CloudinaryFormat.vue'

export default {
  data() {
    return {
      sites: [
      {
          title: 'Subcreations',
          url: 'https://mplus.subcreation.net',
          logoUrl: 'https://mplus.subcreation.net/images/affixes/tormented.jpg',
          description: 'A great site that provide some other stats regarding m+'
        },
        {
          title: 'WowValor',
          url: 'https://wowvalor.app/en/',
          logoUrl: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1666209685/knohxoxsmidxy9hwaxsh.png',
          description: 'Another statistics webpage, focused on specs. Displayed in a very nice readable way.'
        }
      ]
    }
  },
  computed: {
    RIOData() {
      return this.GetRIOData;
    }
  },
  components: {
    CloudinaryFormat,
    DataUpdaterView,
    AffixSchedule,
    CreatorsProjects,
    DiscordLink,
    Tools,
    renameMonitor,
    DiscordLinksFetcher,
    AffixScheduleFetcher,
    CreatorsProjectsFetcher
  }
};
</script>
<style scoped>

</style>
