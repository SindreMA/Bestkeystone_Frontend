<template>
  <div>
    <PlayerFormatter
      v-if="periode"
      :periode="periode"
      :runs="data.run_data.runs"
      :data="details"
      v-slot="{ score, runs, raidProgress }"
    >
    <OtherMatches :matches="data.otherMatches" />
      <Header
        :data="details"
        :backupData="data.run_data"
        :fields="{
          Raid: `${raidProgress?.name}: ${raidProgress?.value}`,
          Score: Math.round(data.run_data.score),
          'M+ Runs': data.run_data.runs.length + 'x',
          Ilvl: details?.equipped_item_level,
        }"
      />
      <q-separator dark />

      <template v-if="details">
        <br />
      <TalentLine v-if="details" :spec="details.active_spec" :talents="details.talents" />

      <br />

      <div class="flex justify-around">
        <updateBox
          @update="setDetails"
          :character="data.run_data"
          :compact="compact"
          :details="details"
        >
        </updateBox>
      </div>
      <br />
      <RaidInfo v-if="details && raidProgress" :details="details"></RaidInfo>
      <br />
      <GearInfo v-if="details" :details="details"></GearInfo>
      <br />

      <statsBox v-if="details" :details="details"></statsBox>
      <br />

      <statisticsBox v-if="details" :details="details" />
      <br />
      </template>
      <template v-if="data.run_data.runs.length > 0">
      <div class="flex justify-around">
        <recentRunsBox :runs="data.run_data.runs"></recentRunsBox>
      </div>
      <br />
      <DungeonList :runs="data.run_data.runs"></DungeonList>
      <br />
      <keystoneFriends
        :region="region ?? data.run_data.region"
        :runs="data.run_data.runs"
        :mainPlayerId="data.run_data.player_id"
      />
      <br />
      <renameBox
        v-if="data.run_data.renames && data.run_data.renames.length != 0"
        :renames="data.run_data.renames"
      />
      <br v-if="data.run_data.renames && data.run_data.renames.length != 0" />
      <AffixOverview :runs="data.run_data.runs"></AffixOverview>
      <br />
      <AffixSetOverview :runs="data.run_data.runs"></AffixSetOverview>
      <br />
      <DungeonOverview :runs="data.run_data.runs"></DungeonOverview>
      <br />

      <br />
      <ChestChart :runs="data.run_data.runs" />
      <br />
      <br />
    </template>
    <template v-else>
    <h5 class="flex justify-center full-width" >No run data for this selected season</h5>
    </template>
    </PlayerFormatter>
  </div>
</template>

<script lang="ts" setup>
import OtherMatches from "components/Pages/lookup/OtherMatches.vue";
import PlayerFormatter from "../../data_formatters/Lookup/PlayerFormatter.vue";
import Header from "../../../components/lookup/player/v2/Header.vue";
import TalentLine from "../../../components/lookup/player/v2/TalentLine.vue";
import DungeonOverview from "components/lookup/player/DungeonOverview.vue";
import AffixOverview from "components/lookup/player/AffixOverview.vue";
import AffixSetOverview from "components/lookup/player/AffixSetOverview.vue";
import RaidInfo from "components/Pages/lookup/RaidInfo.vue";
import keystoneFriends from "components/Pages/lookup/keystoneFriends.vue";
import GearInfo from "components/Pages/lookup/GearInfo.vue";
import statsBox from "components/Pages/lookup/statsBox.vue";
import statisticsBox from "components/Pages/lookup/statisticsBox.vue";
import recentRunsBox from "components/Pages/lookup/recentRunsBox.vue";
import updateBox from "components/Pages/lookup/updateBox.vue";
import ChestChart from "components/ListViews/ChestsChart.vue";
import renameBox from "components/Pages/lookup/renameBox.vue";
import DungeonList from "components/lookup/player/DungeonListv2.vue";
import { ref, toRefs } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  realm: {
    type: String,
    required: true,
  },
  player: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  periode: {
    type: Object,
    required: true,
  },
});
const { data, region, realm, player, compact, periode } = toRefs(props);
const details = ref(data.value.details);

const setDetails = (x) => {
  details.value = x;
  console.log("updated",x);

};

</script>

<style scouped>
#PeriodeSelectorcomp {
  position: relative;
  height: 0px;
  overflow: visible;
}
</style>
