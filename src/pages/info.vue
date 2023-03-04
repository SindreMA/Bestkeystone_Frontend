<template>
  <div>
    <div class="flex-center Centertext HeaderFont">
      <div class>
        <AffixSchedule></AffixSchedule>
        <br />
        <br />
        <Tools></Tools>
        <br />
        <br />
        <div class="HeaderSize3">Useful Discords</div>

        <br />
        <div v-for="(discord, index) in Discords" :key="index">
          <DiscordLink :discord="discord"></DiscordLink>
        </div>
        <br />
        <br />
        <CreatorsProjects></CreatorsProjects>
        <br />
        <br />

        <p class="HeaderSize3">So how does it work?</p>
        <p>
          Every 30 minutes it runs a program on the bestkeystone server. This
          program downloads all the top 500 keystone runs per connected realm.
          It then checks which runs are not in the database and then adds the
          new ones. It will then update some reports such as "Team
          compositions". These data reports take a bit of time to generate and
          can not be changed on demand. The rest of the data is quick to
          generate reports for. So it is possible to change the settings with
          the help of the setting wheel in the top right of the page.
        </p>
        <br />
        <img style="width: 70%" src="/statics/info/keystonecollector.gif" />
      </div>
      <br />
      <br />
      <div>Got any great feature ideas, or found a bug you want to report?</div>
      <div>
        You can reach the creator on discord tag SindreMA#9630 or
        sindrema@gmail.com
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AffixSchedule from "../components/Pages/info/AffixSchedule.vue";
import DiscordLink from "../components/Pages/info/DiscordLink.vue";
import Tools from "components/Pages/info/tools.vue";
import CreatorsProjects from "../components/Pages/info/CreatorsProjects.vue";
import { computed, onMounted, ref } from "vue";
import { useStore } from "src/store";

const store = useStore();
const data = store.state.data;

const GetAffixSchedule = computed(() => data.AffixSchedule);
const RIOData = computed(() => data.RIOData);
let Discords = ref([
  {
    title: "Mythic plus friends",
    description:
      "The largest M+ Discord server aimed at helping players form groups and teaching new players about mythic plus.",
    logoUrl: "https://mythicplusfriends.com/img/mpf_logo.png",
    url: "http://mpf.gg",
  },
]);
onMounted(() => {
  if (!GetAffixSchedule) {
    store.dispatch("fetchAffixSchedule");
  }
});
</script>
<style scoped></style>
