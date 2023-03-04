<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="BlackBackground">
      <div
        id="HeaderLine"
        class="lineBackground flex justify-center HeaderFont shadow-24"
      ></div>

      <div class="GreyBackground MiddleAndSize pageContainer ">
        <CustomToolbar />
        <div class="MainPadd">
          <div class="StaticSettingButton" v-if="showSettingBtn">
            <q-btn
              class="StaticSettingButtonbtn"
              round
              icon="settings"
              size="20px"
              color="none"
            >
              <q-menu id="SettingsBox">
                <q-scroll-area
                  style="height: 448px; max-width: 300px"
                  id="SettingsContent"
                  class="HeaderFont"
                  ref="scrollArea"
                >
                  <div>
                    Region:
                    <q-btn-toggle
                      v-model="region"
                      :options="[
                        { label: 'EU', value: 'eu' },
                        { label: 'US', value: 'us' },
                        { label: 'TW', value: 'tw' },
                        { label: 'KR', value: 'kr' },
                      ]"
                    />
                  </div>
                  <br />
                  <div class="flex">
                    <div>View:</div>
                    <q-btn-toggle
                      v-model="viewMode"
                      :options="[
                        { label: 'Classic', value: 'classic' },
                        { label: 'Tables', value: 'table' },
                      ]"
                    />
                  </div>
                  <br />
                  <div>
                    Score Type:
                    <q-btn-toggle
                      v-model="score_type"
                      :options="[
                        { label: 'Total', value: 'total' },
                        { label: 'Percent', value: 'percent' },
                        { label: 'Mean', value: 'mean' },
                      ]"
                    />
                  </div>
                  <br />
                  <div class="row">
                    <div class="col-8">
                      Limit the amount of runs to the same as the lowest dungeon:
                    </div>
                    <div class="col-4 flex flex-center">
                      <q-toggle v-model="limitbylowestdungeon" />
                    </div>
                  </div>
                  <br />
                  <div>
                    Only base data on runs higher than:
                    <div class="row">
                      <div class="col-1" style="padding-top: 3.5px">
                        {{ min_keystonelevel }}
                      </div>
                      <div class="col-11 relContainer">
                        <q-slider
                          class="Slider"
                          v-model="min_keystonelevel"
                          :min="0"
                          :max="25"
                          :step="1"
                          label
                          snap
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="text-center">Amount of runs to base data on:</div>
                    <div class="flex justify-around">
                      <q-radio dense v-model="max_runs" :val="10" label="10" />
                      <q-radio dense v-model="max_runs" :val="100" label="100" />
                      <q-radio dense v-model="max_runs" :val="1000" label="1000" />
                      <q-radio dense v-model="max_runs" :val="5000" label="5000" />
                    </div>
                  </div>
                  <br />
                  <div>
                    Weeks to show:
                    <div class="row">
                      <div class="col-1" style="padding-top: 3.5px">
                        {{ WeeksToShow }}
                      </div>
                      <div class="col-11 relContainer">
                        <q-slider
                          class="Slider"
                          v-model="WeeksToShow"
                          :min="4"
                          :max="60"
                          :step="1"
                          label
                          snap
                        />
                      </div>
                    </div>
                  </div>
                  <!--<q-toggle v-model="showMoreAds" label="Show More Ads to support creator" />-->

                  <div class="row">
                    <div class="col-5">
                      <transition name="fade">
                        <p v-if="data_saved">Settings saved!</p>
                      </transition>
                    </div>
                    <div class="offset-3 col-3">
                      <q-btn
                        v-if="settings_changed"
                        outline
                        style="width: 70px"
                        @click="reload()"
                        rounded
                        color="primary"
                        label="Reload"
                      >
                        <q-tooltip
                          >You might want to refresh the page to take all the changes in
                          use</q-tooltip
                        >
                      </q-btn>
                    </div>
                  </div>
                </q-scroll-area>
              </q-menu>
            </q-btn>
          </div>
          <router-view />
        </div>
      </div>
    </q-page-container>
    <Footer />
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch, onBeforeMount, getCurrentInstance } from "vue";
import { useStore } from "../store";
import { useQuasar } from "quasar";
import Footer from "./footer.vue";

import { openURL } from "quasar";
import AdView from "ItemViews/AdView.vue";
import CustomToolbar from "components/layout/CustomToolbar.vue";
import { useRouter } from "vue-router";

const $q = useQuasar();

let randomNR = ref(0);
let adsenseContentRIGTH = ref("");
let adsenseContentLeft = ref("");
let adsenseContent = ref("");
let showMoreAds = ref(false);
let leftDrawerOpen = ref($q.platform.is.desktop);
let ShowDonate = ref(false);
let startdetect = ref(true);
let viewMode = ref(null);
let max_runs = ref(null);
let region = ref(null);
let score_type = ref(null);
let limitbylowestdungeon = ref(null);
let min_keystonelevel = ref(null);
let WeeksToShow = ref(null);
let created_complete = ref<boolean>(false);
let data_saved = ref(false);
let settings_changed = ref(false);

const scrollArea = ref(null);

const router = useRouter();

const store = useStore();
const data = store.state.data;

const width = computed(() => $q.screen.width);

const GetNotifications = computed(() => data.notifications);
const GetSavedSelected = computed(() => data.Selected);
const GetSelectedAffixSet = computed(() => data.SelectedAffixSet);

//Called RIO Data as v1 collection from Raider.io API
//Changed to Own keystone collector in v2, like 1-2 months after v1 release
const GetRIOData = computed(() => data.RIOData);
const GetSettings = computed(() => data.settings);
const SelectedPeriode = computed(() => data.SelectedPeriode);

const GetSelectedData = (x) => store.dispatch("GetSelectedData", x);
const fetchDungeons = () => store.dispatch("fetchDungeons");
const GetAllSpecs = () => store.dispatch("GetAllSpecs");
const GetAllClasses = () => store.dispatch("GetAllClasses");
const GetAllAffixData = () => store.dispatch("GetAllAffixData");
const GetPeriodesData = () => store.dispatch("GetPeriodesData");
const fetchDungeonData = () => store.dispatch("fetchDungeonData");
const fetchSpecData = () => store.dispatch("fetchSpecData");

const SaveSelectedAffixSet = (x) => store.commit("SaveSelectedAffixSet", x);
const SaveRIOData = (x) => store.commit("SaveRIOData", x);
const seenNotification = (x) => store.commit("seenNotification", x);
const GetCacheSettings = () => store.commit("GetCacheSettings");
const fetchNotificationStats = () => store.commit("fetchNotificationStats");
const SaveSettings = (x) => store.commit("SaveSettings", x);
const SaveReloadTimestamp = () => store.commit("SaveReloadTimestamp");

const Selected = computed(() => GetSavedSelected);
const path = computed(() => location.pathname);
const SelectedAffixSet = computed(() => GetSelectedAffixSet);
const RIOData = computed(() => GetRIOData);
const showSettingBtn = computed(() => {
  if (location.pathname.startsWith("/statistics")) {
    return true;
  }
  return false;
});

onBeforeMount(() => {
  const Settings = computed(() => store.state.data.settings);
  GetCacheSettings();
  fetchNotificationStats();
  GetAllAffixData();
  GetAllSpecs();
  GetAllClasses();
  fetchDungeons();

  GetPeriodesData();

  var settings = { ...GetSettings.value };

  if (settings.region) {
    region.value = settings.region;
  }
  if (settings.viewMode) {
    viewMode.value = settings.viewMode;
  }
  if (settings.max_runs) {
    max_runs.value = settings.max_runs;
  }
  if (settings.score_type) {
    score_type.value = settings.score_type;
  }
  if (settings.limitbylowestdungeon) {
    limitbylowestdungeon.value = settings.limitbylowestdungeon;
  }
  if (settings.min_keystonelevel) {
    min_keystonelevel.value = settings.min_keystonelevel;
  }
  if (settings.WeeksToShow) {
    WeeksToShow.value = settings.WeeksToShow;
  }
  setTimeout(() => {
    created_complete.value = true;
  }, 1000);
});

onMounted(() => {});

const reload = () => {
  GetPeriodesData();
  SaveReloadTimestamp();
  fetchDungeonData();
};
const settingsScrollToEnd = () => {
  if (scrollArea.value?.setScrollPosition)
    scrollArea.value?.setScrollPercentage("vertical", 2, 300);
};
const Redirect = (url) => (window.location.href = url);
const DonateHover = () => (ShowDonate.value = true);

const _SaveSettings = (payload, force) => {
  SaveSettings(payload);
  data_saved.value = true;
  if (force) {
    settings_changed.value = true;
    scrollArea.value?.setScrollPercentage("vertical", 2, 300);
  }
  setTimeout(function () {
    data_saved.value = false;
  }, 1200);
};

watch(path, () => (randomNR.value = Math.round(Math.random() * 1000000)));

watch(SelectedPeriode, () => {
  fetchDungeonData();
  fetchSpecData();
});
watch(viewMode, () => {
  if (created_complete.value) {
    var payload = {
      setting: "viewMode",
      value: viewMode.value,
    };

    _SaveSettings(payload, false);
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
  }
});

watch(region, () => {
  if (created_complete.value) {
    var payload = {
      setting: "region",
      value: region.value,
    };
    _SaveSettings(payload, false);
  }
});
watch(max_runs, () => {
  if (created_complete.value) {
    var payload = {
      setting: "max_runs",
      value: max_runs.value,
    };
    _SaveSettings(payload, true);
  }
});
watch(score_type, () => {
  if (created_complete.value) {
    var payload = {
      setting: "score_type",
      value: score_type.value,
    };
    _SaveSettings(payload, false);
  }
});
watch(limitbylowestdungeon, () => {
  if (created_complete.value) {
    var payload = {
      setting: "limitbylowestdungeon",
      value: limitbylowestdungeon.value,
    };
    _SaveSettings(payload, true);
  }
});
watch(min_keystonelevel, () => {
  if (created_complete.value) {
    var payload = {
      setting: "min_keystonelevel",
      value: min_keystonelevel.value,
    };

    _SaveSettings(payload, true);
  }
});
watch(WeeksToShow, () => {
  if (created_complete.value) {
    var payload = {
      setting: "WeeksToShow",
      value: WeeksToShow.value,
    };
    _SaveSettings(payload, true);
  }
});

watch(SelectedAffixSet, (newValue, oldValue) => {
  if (startdetect) {
    var ls = newValue;
    var payload = [ls[0].id, ls[1].id, ls[2].id, ls[3].id];
    GetSelectedData(payload);
  }
});
</script>

<style>
.flex1 {
  flex: 1;
}
.capitalize {
  text-transform: capitalize;
}
#HeaderLine {
  height: 32px;
  margin: auto;
}
.BoxHeaderBackground {
  background-color: #414141;
}
.relative {
  position: relative;
}
.lightBackground {
  background-color: #494949;
  color: #e7e7e7;
}
.searchResultsBox {
  background-color: #494949;
  color: #e7e7e7;
}
.gap-5 {
  gap: 5px;
}
.background {
  background-color: #252525;
}
.transperant {
  background: transparent;
}
#LayoutHeader {
  width: 100%;
  background-color: #181818;
  position: sticky;
  top: 0px;
  z-index: 100000;
}
.lineBackground {
  background-color: #181818;
  height: 500px;
  width: 100%;
}

.InfoFieldCreated2 {
  width: 170px;
  margin: 0px;
  position: absolute;
  bottom: 0px;
}

#DonateButton {
  left: 0px;
  width: 80px;
}
.greyBackground {
  position: relative;
  background-color: #292929;
  color: rgb(161, 161, 161);
  border-radius: 10px;
  padding: 0 5px;
}

#DonateButton:hover {
  cursor: pointer;
}

.HeaderFont {
  color: rgb(161, 161, 161) !important;
}

.HeaderSize {
  font-size: 40px;
}

.HeaderSize2 {
  font-size: 10px;
}

.HeaderSize3 {
  font-size: 30px;
}
.HeaderSize4 {
  font-size: 20px;
}
.Centertext {
  text-align: center;
}
.Ccenter {
  display: flex;
  align-items: center;
  height: 100%;
}
@media screen and (min-width: 400px) {
  .MiddleAndSize {
    max-width: 1300px;
    margin: auto;
  }
  .MainPadd {
    padding: 25px;
  }
}
.GreyBackground {
  background-color: #252525;
}
.BlackBackground {
  background-color: #151515;
  min-height: 100vh;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.StaticSettingButton {
  position: sticky;
  z-index: 100001;
}
.StaticSettingButtonbtn {
  position: absolute;
  top: -10px;
  right: -10px;
}
#SettingsBox {
  width: 300px;
  height: 450px;
  background-color: #303030;
  border: rgb(161, 161, 161) 1px solid;
  border-radius: 15px;
}
#SettingsContent {
  padding: 12px;
  margin: 0px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.nodataInfo {
  margin: auto;
  border: 1px grey solid;
  border-radius: 15px;
  max-width: 300px;
  margin-top: 50px;
}
.Slider {
  top: -8px;
  position: absolute;
}
.relContainer {
  position: relative;
}
.HeaderFontv2 {
  color: #cacaca;
}
.Ad {
  padding: 10px 10px 5px 10px;
  margin: 30px 0px 75px 0;
  max-width: 845px;
  opacity: 0.7;
}
.AdLEFT {
  position: absolute;
  top: 17%;
  left: 15px;
}
.AdRIGTH {
  position: absolute;
  top: 17%;
  right: 15px;
}
.hideHoverGlobal:hover {
  background-color: transparent !important;
}
.logoIcon {
  width: 45px;
  border-radius: 30px;
  border: rgb(63, 63, 63) solid 1px;
}

.gap-15 {
  gap: 15px;
}
.gap-10 {
  gap: 10px;
}
.gap-30 {
  gap: 30px;
}

.pageContainer {
  flex-grow: 1;
  width: 100%;
}

* {
  color: rgb(161, 161, 161);
}
h1,h2,h3,h4,h5,h6 {
    margin: 0px;
}

</style>
