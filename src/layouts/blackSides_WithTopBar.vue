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
              <q-menu id="SettingsBox" @before-hide="onSettingsClose">
                <div id="SettingsContent" class="HeaderFont">
                  <div class="settings-header">
                    <div class="settings-title">Settings</div>
                    <transition name="fade">
                      <span v-if="data_saved" class="settings-saved">Saved</span>
                    </transition>
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">View</div>
                    <q-btn-toggle
                      v-model="viewMode"
                      no-caps
                      unelevated
                      spread
                      toggle-color="primary"
                      class="settings-toggle"
                      :options="[
                        { label: 'Classic', value: 'classic' },
                        { label: 'Tables', value: 'table' },
                      ]"
                    />
                  </div>

                  <div v-if="viewMode !== 'table'" class="settings-row">
                    <div class="settings-label">Score type</div>
                    <q-btn-toggle
                      v-model="score_type"
                      no-caps
                      unelevated
                      spread
                      toggle-color="primary"
                      class="settings-toggle"
                      :options="[
                        { label: 'Total', value: 'total' },
                        { label: 'Percent', value: 'percent' },
                        { label: 'Mean', value: 'mean' },
                      ]"
                    />
                  </div>

                  <div class="settings-divider"></div>

                  <div class="settings-row">
                    <div class="settings-label-inline">
                      <span>Minimum keystone level</span>
                      <span class="settings-value">{{ min_keystonelevel }}</span>
                    </div>
                    <q-slider
                      v-model="min_keystonelevel"
                      :min="0"
                      :max="25"
                      :step="1"
                      color="primary"
                      label
                      snap
                    />
                  </div>

                  <div class="settings-row">
                    <div class="settings-label-inline">
                      <span>Weeks to show</span>
                      <span class="settings-value">{{ WeeksToShow }}</span>
                    </div>
                    <q-slider
                      v-model="WeeksToShow"
                      :min="4"
                      :max="60"
                      :step="1"
                      color="primary"
                      label
                      snap
                    />
                  </div>

                  <div class="settings-row">
                    <div class="settings-label">Runs per dungeon</div>
                    <q-btn-toggle
                      v-model="max_runs"
                      no-caps
                      unelevated
                      spread
                      toggle-color="primary"
                      class="settings-toggle"
                      :options="[
                        { label: '10', value: 10 },
                        { label: '100', value: 100 },
                        { label: '1k', value: 1000 },
                        { label: '5k', value: 5000 },
                      ]"
                    />
                  </div>

                  <div class="settings-row settings-row-toggle">
                    <div class="settings-label-toggle">
                      <span>Limit to lowest dungeon</span>
                      <span class="settings-hint"
                        >Cap runs to match the smallest sample</span
                      >
                    </div>
                    <q-toggle v-model="limitbylowestdungeon" color="primary" />
                  </div>
                </div>
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
const route = router.currentRoute;

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
const path = computed(() => route.value.path);
const SelectedAffixSet = computed(() => GetSelectedAffixSet);
const RIOData = computed(() => GetRIOData);
const showSettingBtn = computed(() => {
  if (route.value.path.startsWith("/statistics")) {
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
  fetchSpecData();
  settings_changed.value = false;
};

const onSettingsClose = () => {
  if (settings_changed.value) {
    reload();
  }
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
  height: 4px;
  margin: auto;
  background: var(--gradient-primary);
}
.BoxHeaderBackground {
  background: var(--bg-elevated);
}
.relative {
  position: relative;
}
.lightBackground {
  background: var(--bg-hover);
  color: var(--text-primary);
}
.searchResultsBox {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}
.gap-5 {
  gap: 5px;
}
.background {
  background: var(--bg-surface);
}
.transperant {
  background: transparent;
}
#LayoutHeader {
  width: 100%;
  background: var(--bg-surface);
  position: sticky;
  top: 0px;
  z-index: 100000;
}
.lineBackground {
  background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%);
  height: 120px;
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
  background: var(--bg-surface);
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  padding: 0 5px;
  border: 1px solid var(--border-default);
}

#DonateButton:hover {
  cursor: pointer;
}

.HeaderFont {
  color: var(--text-secondary) !important;
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
@media screen and (min-width: 600px) {
  .MiddleAndSize {
    max-width: 1300px;
    margin: auto;
  }
  .MainPadd {
    padding: 25px;
  }
}
.GreyBackground {
  background: var(--bg-surface);
}
.BlackBackground {
  background: var(--bg-base);
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
  background: var(--bg-elevated) !important;
  border: 1px solid var(--border-default);
  transition: all var(--transition-normal);
}
.StaticSettingButtonbtn:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-glow);
  transform: rotate(90deg);
}
#SettingsBox {
  width: 320px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
#SettingsContent {
  padding: 18px 20px 20px;
  color: var(--text-primary);
}
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.settings-title {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}
.settings-saved {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-success);
  background: rgba(34, 197, 94, 0.12);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}
.settings-row {
  margin-bottom: 14px;
}
.settings-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.settings-label-inline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.settings-value {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
  text-transform: none;
  color: var(--text-primary);
}
.settings-toggle {
  width: 100%;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-base);
  overflow: hidden;
}
.settings-toggle .q-btn {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  min-height: 30px;
}
.settings-toggle .q-btn.bg-primary {
  color: #fff;
}
.settings-divider {
  height: 1px;
  background: var(--border-default);
  margin: 4px 0 14px;
}
.settings-row-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0;
}
.settings-label-toggle {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.settings-label-toggle > span:first-child {
  font-size: 13px;
  color: var(--text-primary);
}
.settings-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.nodataInfo {
  margin: auto;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  max-width: 300px;
  margin-top: 50px;
  background: var(--bg-surface);
  padding: 20px;
}
.Slider {
  top: -8px;
  position: absolute;
}
.relContainer {
  position: relative;
}
.HeaderFontv2 {
  color: var(--text-primary);
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
  width: 48px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-default);
  transition: all var(--transition-normal);
}
.logoIcon:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-glow);
  transform: scale(1.05);
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

.apexcharts-legend-text {
  color: var(--text-secondary) !important;
}
h1,h2,h3,h4,h5,h6 {
  margin: 0px;
  color: var(--text-primary);
}

.textColor {
  color: var(--text-secondary) !important;
}

</style>
