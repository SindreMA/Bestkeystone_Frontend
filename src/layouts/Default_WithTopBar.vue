<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="GreyBackground">
      <div id="LayoutHeader" class="HeaderFontv2">
        <q-tabs animated swipeable align="justify">
          <q-route-tab default name="Dungeons" to="/dungeons" label="Dungeons" />
          <q-route-tab name="Classes" to="/classes" label="Classes" />
          <q-route-tab name="Specs" to="/specs" label="Specs" />
          <q-route-tab name="Compositions" to="/compositions" label="Compositions" />
          <q-route-tab name="Runs" to="/runs" label="Runs" />
          <q-route-tab name="lookup" to="/lookup" label="Player Lookup" />
          <q-route-tab name="leaderboard" to="/leaderboard" label="Leaderboard (beta)" />
          <q-route-tab name="Info" to="/info" label="Info" />
        </q-tabs>
      </div>
      <div class="StaticSettingButton" v-if="showSettingBtn">
        <q-btn class="StaticSettingButtonbtn" round icon="settings" size="20px" color="dark">
          <q-menu id="SettingsBox">
            <q-scroll-area
              style="height: 448px; max-width: 300px;"
              id="SettingsContent"
              class="HeaderFont"
              ref="scrollArea"
            >
              <div>
                Region:
                <q-btn-toggle
                  v-model="region"
                  :options="[
                  {label: 'EU', value: 'eu'},
                  {label: 'US', value: 'us'},
                  {label: 'TW', value: 'tw'},
                  {label: 'KR', value: 'kr'}
                  ]"
                />
              </div>
              <br />
              <div class="flex">
                <div>View:</div>
                <q-btn-toggle
                  v-model="viewMode"
                  :options="[
                  {label: 'Classic', value: 'classic'},
                  {label: 'Tables', value: 'table'}
                  ]"
                />
              </div>
              <br />
              <div>
                Score Type:
                <q-btn-toggle
                  v-model="score_type"
                  :options="[
                  {label: 'Total', value: 'total'},
                  {label: 'Percent', value: 'percent'},
                  {label: 'Mean', value: 'mean'}
                  ]"
                />
              </div>
              <br />
              <div class="row">
                <div class="col-8">Limit the amount of runs to the same as the lowest dungeon:</div>
                <div class="col-4 flex flex-center">
                  <q-toggle v-model="limitbylowestdungeon" />
                </div>
              </div>
              <br />
              <div>
                Only base data on runs higher than:
                <div class="row">
                  <div class="col-1" style="padding-top: 3.5px;">{{min_keystonelevel}}</div>
                  <div class="col-11 relContainer">
                    <q-slider
                      class="Slider"
                      :value="min_keystonelevel"
                      @change="val => { min_keystonelevel = val }"
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
                  <div class="col-1" style="padding-top: 3.5px;">{{WeeksToShow}}</div>
                  <div class="col-11 relContainer">
                    <q-slider
                      class="Slider"
                      :value="WeeksToShow"
                      @change="val => { WeeksToShow = val }"
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
                    style="width: 70px;"
                    @click="reload();"
                    rounded
                    color="primary"
                    label="Reload"
                  >
                    <q-tooltip>You might want to refresh the page to take all the changes in use</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-scroll-area>
          </q-menu>
        </q-btn>
      </div>
      <div class="MiddleAndSize pagePadding">
        <router-view />
      </div>
<div v-if="width > 750">
   <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
</div>
    
      <div id="LayoutFooter">
      {{/* One and only ad, were mostly added to learn how it works */}}
        <adView v-if="width > 750" class="Ad" :key="randomNR"></adView>
        <div class="flex HeaderFont flex-center">
          <div class="InfoFieldCreated2" @mouseout="ShowDonate = false" @mouseover="DonateHover()">
            <div class="flex justify-around">
              <div id="donatediv">
                <div v-if="ShowDonate">
                  Want to buy me a beer?
                  <div class="flex justify-around">
                    <div
                      class="greyBackground flex justify-around shadow-16"
                      id="DonateButton"
                      @click="Redirect('https://paypal.me/SindreMA')"
                    >Donate</div>
                  </div>
                </div>
                <div v-else class="HeaderSize2 text-center">
                  <div>Site created by SindreMA</div>
                  <div>(EU)Doomsin-Silvermoon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script >
import { openURL } from "quasar";
import { mapGetters, mapActions, mapMutations } from "vuex";
import axios from "axios";
import { setTimeout } from "timers";
import adView from 'ItemViews/AdView.vue'

export default {
  name: "MyLayout",
  components: {
    adView
  },
  mounted() {
    this.adsenseContent = document.getElementById(
      "divadsensedisplaynone"
    ).innerHTML;
    this.adsenseContentLeft = document.getElementById(
      "divadsensedisplaynoneLEFT"
    ).innerHTML;
    this.adsenseContentRIGTH = document.getElementById(
      "divadsensedisplaynoneRIGHT"
    ).innerHTML;
  },
  data() {
    return {
      randomNR: 0,
      adsenseContentRIGTH:"",
      adsenseContentLeft:"",
      adsenseContent: "",
      showMoreAds: false,
      leftDrawerOpen: this.$q.platform.is.desktop,
      ShowDonate: false,
      startdetect: true,
      viewMode: null,
      max_runs: null,
      region: null,
      score_type: null,
      limitbylowestdungeon: null,
      min_keystonelevel: null,
      WeeksToShow: null,

      created_complete: false,
      data_saved: false,
      settings_changed: false
    };
  },
  computed: {
    width() {
      return this.$q.screen.width;
    },
    ...mapGetters([
      "GetNotifications",
      "GetSavedSelected",
      "GetSelectedAffixSet",
      "GetRIOData",
      "GetSettings",
      "SelectedPeriode"
    ]),
    Selected() {
      return this.GetSavedSelected;
    },
    path () {
    return  this.$route.path
    },
    SelectedAffixSet() {
      return this.GetSelectedAffixSet;
    },
    RIOData() {
      return this.GetRIOData;
    },
    showSettingBtn() {
      //  || this.$route.path.startsWith('/runs')
      if (
        this.$route.path.startsWith("/lookup") ||
        this.$route.path.startsWith("/info")
      ) {
        return false;
      }
      return true;
    },
    Settings() {
      return this.$store.state.data.settings;
    }
  },
  methods: {
    ...mapActions([
      "GetSelectedData",
      "fetchDungeons",
      "GetAllSpecs",
      "GetAllClasses",
      "GetAllAffixData",
      "GetPeriodesData",
      "fetchDungeonData",
      "fetchDungeonData",
      "fetchSpecData"
    ]),
    ...mapMutations([
      "SaveSelectedAffixSet",
      "SaveRIOData",
      "seenNotification",
      "GetCacheSettings",
      "fetchNotificationStats",
      "SaveSettings",
      "SaveReloadTimestamp"
    ]),

    openURL,
    reload() {
      this.GetPeriodesData();
      this.SaveReloadTimestamp();
      this.fetchDungeonData();
      this.settings_changed = false;
      //      location.reload(true);
    },
    settingsScrollToEnd() {
      this.$refs.scrollArea.setScrollPosition(this.position, 350);
    },
    Redirect(url) {
      window.location.href = url;
    },
    DonateHover() {
      this.ShowDonate = true;
    },
    _SaveSettings(payload, force) {
      this.SaveSettings(payload);
      this.data_saved = true;
      if (force) {
        this.settings_changed = true;
        this.$refs.scrollArea.setScrollPosition(445, 300);
      }
      var vm = this;
      setTimeout(function() {
        vm.data_saved = false;
      }, 1200);
    }
  },
  watch: {
    path() {
      this.randomNR = Math.round(Math.random() * 1000000)
    },
    SelectedPeriode() {
      this.fetchDungeonData();
      this.fetchSpecData();
      //this.GetSelectedData(this.SelectedPeriode.affixes)
    },
    viewMode() {
      if (this.created_complete) {
        var payload = {
          setting: "viewMode",
          value: this.viewMode
        };
        this._SaveSettings(payload, false);
        this.$forceUpdate();
      }
    },
    region() {
      if (this.created_complete) {
        var payload = {
          setting: "region",
          value: this.region
        };
        this._SaveSettings(payload, false);
      }
    },
    max_runs() {
      if (this.created_complete) {
        var payload = {
          setting: "max_runs",
          value: this.max_runs
        };
        this._SaveSettings(payload, true);
      }
    },
    score_type() {
      if (this.created_complete) {
        var payload = {
          setting: "score_type",
          value: this.score_type
        };
        this._SaveSettings(payload, false);
      }
    },
    limitbylowestdungeon() {
      if (this.created_complete) {
        var payload = {
          setting: "limitbylowestdungeon",
          value: this.limitbylowestdungeon
        };
        this._SaveSettings(payload, true);
      }
    },
    min_keystonelevel() {
      if (this.created_complete) {
        var payload = {
          setting: "min_keystonelevel",
          value: this.min_keystonelevel
        };
        this._SaveSettings(payload, true);
      }
    },
    WeeksToShow() {
      if (this.created_complete) {
        var payload = {
          setting: "WeeksToShow",
          value: this.WeeksToShow
        };
        this._SaveSettings(payload, true);
      }
    },

    SelectedAffixSet(newValue, oldValue) {
      if (this.startdetect) {
        var ls = newValue;
        var vm = this;
        var payload = [ls[0].id, ls[1].id, ls[2].id, ls[3].id];
        this.GetSelectedData(payload);
      }
    }
  },
  created() {
    var vm = this;
    this.GetCacheSettings();
    this.fetchNotificationStats();
    this.GetAllAffixData();
    this.GetAllSpecs();
    this.GetAllClasses();
    this.fetchDungeons();

    this.GetPeriodesData();

    var settings = this.GetSettings;

    if (settings.region) {
      this.region = settings.region;
    }
    if (settings.viewMode) {
      this.viewMode = settings.viewMode;
    }
    if (settings.max_runs) {
      this.max_runs = settings.max_runs;
    }
    if (settings.score_type) {
      this.score_type = settings.score_type;
    }
    if (settings.limitbylowestdungeon) {
      this.limitbylowestdungeon = settings.limitbylowestdungeon;
    }
    if (settings.min_keystonelevel) {
      this.min_keystonelevel = settings.min_keystonelevel;
    }
    if (settings.min_keystonelevel) {
      this.min_keystonelevel = settings.min_keystonelevel;
    }
    if (settings.WeeksToShow) {
      this.WeeksToShow = settings.WeeksToShow;
    }
    setTimeout(function() {
      vm.created_complete = true;
    }, 1000);

/*
    var TabledNotificationName = "TableViewAdded";
    var TabledNotificationList = this.GetNotifications.filter(x => {
      return (
        x.notification == TabledNotificationName
      );
    });

    if (!settings.viewMode && ((TabledNotificationList.length != 0 && TabledNotificationList[0].times_seen < 10 && x.expire > new Date().getTime()) || TabledNotificationList.length == 0 )) {
      var payload = {
        key: TabledNotificationName,
        value: 1,
        expire: 1565477966000
      };

      this.$q.notify({
        color: "teal",
        icon: "info",
        message: "New view mode added!",
        position: "top-right",
        timeout: 7000,
        actions: [
          {
            label: "Switch back to classic view",
            color: "light-green-13",
            handler: () => {
              vm.viewMode = "classic";
              payload.value = 999999;
              vm.seenNotification(payload);
            }
          },
          {
            label: "Dont show again",
            color: "yellow-13",
            handler: () => {
              payload.value = 999999;
              vm.seenNotification(payload);
            }
          },
          { icon: "close", color: "white" }
        ]
      });
      this.$q.notify({
        html: true,
        message:
          '<img src:"https://bestkeystone.com/statics/icons/poggers.png"></img>',
        position: "top-right",
        timeout: 6500
      });

      this.seenNotification(payload);
    }
    */
  }
};
</script>

<style>
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
#LayoutFooter {
  width: 100%;
  height: 47px;
  background-color: #181818;
  bottom: 0px;
  position: absolute;
}
.InfoFieldCreated2 {
  width: 170px;
  margin: 0px;
  position: absolute;
  bottom: 0px;
}
.gap-5 {
  gap: 5px;
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

.greyBackground:hover {
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
    max-width: 1100px;
    margin: auto;
    padding: 25px 25px 25px 25px;
    background-color: #252525;
  }
}
.GreyBackground {
  background-color: #252525;
  min-height: 100vh;
  height: 100%;
}
.StaticSettingButton {
  top: 50px;
  position: sticky;
  z-index: 100001;
}
.StaticSettingButtonbtn {
  position: absolute;
  right: 20px;
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
  position: relative;
  top: -110px;
  opacity: 0.7;
}
.AdLEFT {
  position: absolute;
  top: 17%;
  left : 15px;
}
.AdRIGTH {
  position: absolute;
  top: 17%;
  right : 15px;
}
.hideHoverGlobal:hover {
  background-color: transparent !important;
}
</style>
