<template>
  <div>
    <div class="flex flex-center">
      <div class="Centertext HeaderSize HeaderFont">
        What's the "best" dungeon this week?
      </div>
    </div>
    <div class="flex flex-center">
      <p class="HeaderFont HeaderSize2">(ish)</p>
    </div>
    <AffixSelector></AffixSelector>

    <template v-if="viewMode === 'table'">
      <DungeonTableView />
      <BestWeekForAffixTableView />
    </template>
    <template v-else>
      <div
        v-if="
          SelectedPeriode &&
          GetDungeonData &&
          SelectedPeriode.id != GetDungeonData.periode
        "
        class="flex flex-center"
      >
        <q-spinner-puff style="color: rgb(161, 161, 161)" size="500" />
      </div>

      <div
        v-else-if="
          GetDungeonData &&
          GetDungeonData.data.filter((x) => {
            return x.score === 0;
          }).length === GetDungeonData.data.length
        "
        class="HeaderFont nodataInfo"
      >
        <h4 class="flex flex-center">No data found!</h4>
        <p class="flex flex-center">
          Try to change the settings up in the right
        </p>
      </div>
      <div v-else>
        <div
          v-if="
            SelectedPeriode &&
            GetDungeonData &&
            GetDungeonData.data &&
            GetDungeons
          "
        >
          <div class="HeaderFont relative-position" style="height: 20px">
            <div class="absolute-left">
              <div class="Ccenter" style="margin-left: 30px">
                <div style="width: 0px">Rank</div>
              </div>
            </div>
            <div class="HeaderFont dungeonTitle relative">
              <div class="title">Dungeon</div>
            </div>
            <div class="absolute-right">
              <div class="Ccenter" style="margin-right: 32px">
                <div>Score</div>
              </div>
            </div>
          </div>
          <div
            v-for="dungeon in dungeonsWithRank(GetDungeonData.data)"
            :key="dungeon.id"
          >
            <DungeonViewer
              :totalScore="_GetTotalScore()"
              :Selected="Selected"
              @click="ExpandedDungeon = $event"
              :expanded="ExpandedDungeon"
              :dungeon="dungeon"
            ></DungeonViewer>
          </div>
        </div>
      </div>

      <DungeonInTimeRateList />
      <BestWeekForAffix />
    </template>
  </div>
</template>

<script lang="ts" setup>
import DungeonTableView from "../components/ListViews/DungeonTableView.vue";
import AffixSelector from "../components/ListViews/AffixSelector.vue";
import DungeonViewer from "../components/DungeonViewer.vue";
import DungeonInTimeRateList from "../components/ListViews/DungeonInTimeRateList.vue";
import BestWeekForAffix from "../components/dungeonsView/BestWeekForAffix.vue";
import BestWeekForAffixTableView from "../components/dungeonsView/BestWeekForAffixTableView.vue";
import sf from "../SharedFunctions";
import { computed, ref, watch } from "vue";
import { useStore } from "src/store";
import { useQuasar } from "quasar";

const ShowSelectAffix = ref(false);
const ExpandedDungeon = ref(null);
const NextWeekShown = ref(false);

const store = useStore();
const data = store.state.data;

const GetSavedSelected = computed(() => data.Selected);
const GetSelectedAffixSet = computed(() => data.SelectedAffixSet);
const GetRIOData = computed(() => data.RIOData);
const GetDungeonData = computed(() => data.Dungeons_Data);
const GetDungeons = computed(() => data.Dungeons);
const SelectedPeriode = computed(() => data.SelectedPeriode);
const getReloaded_Timestamp = computed(() => data.Reloaded_Timestamp);
const GetAffixes = computed(() => data.Affixes);
const GetPeriodes = computed(() => data.Periodes);
const GetSettings = computed(() => data.settings);

const $q = useQuasar();

const viewMode = computed(() =>
  sf.GetDefaultView($q.screen.width, GetSettings)
);
const Selected = computed(() => GetSavedSelected);
const SelectedAffixSet = computed(() => GetSelectedAffixSet);
const RIOData = computed(() => GetRIOData);
const Settings = computed(() => GetSettings);

watch(getReloaded_Timestamp, () => {
  ExpandedDungeon.value = null;
});

watch(GetPeriodes, () => {
  var apiUrl = data.apiUrl;

  if (!NextWeekShown.value) {
    var currentWeek = GetPeriodes.value[0];
  }
});

const GetSelectedData = () => store.dispatch("GetSelectedData");
const fetchDungeonData = () => store.dispatch("fetchDungeonData");

const SaveSelectedAffixSet = (affixSet) =>
  store.commit("SaveSelectedAffixSet", affixSet);
const SaveRIOData = (rioData) => store.commit("SaveRIOData", rioData);

</script>
<style>
.dungeonTitle {
  margin: 0 50%;
}
.dungeonTitle .title {
  text-align: center;
  position: absolute;
  width: 0;
  left: -27px;
}
</style>
