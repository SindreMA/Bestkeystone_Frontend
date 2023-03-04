<template>
  <div id="LookupMain" class="HeaderFont">
    <div class="flex flex-center">
    <h5 class style="margin: 0px; width: 100%; text-align: center;">Lookup a player's M+ experience</h5>
    <div id="LookupSearchField" class="flex justify-between">
      <div>
        <q-toggle
          class="staticToggle"
          v-if="characterData && characterData.runs && characterData.runs.length != 0 && !notFound && !fetching"
          v-model="combineMode"
        >
          <q-tooltip>
            <p>
              <strong>Combind Mode</strong>
            </p>This mode lets you combind characters so you can see the total stats of all your alts.
          </q-tooltip>
        </q-toggle>
      </div>

      <div class="InputField">
         <q-select
         ref="SearchBox"
         dark
        v-model="playerSearch"
        use-input
        :loading="searching"
        hide-selected
        :input-debounce="300"
        options-dark
        hide-dropdown-icon
        label="Player"
        placeholder="Character name"
        :options="searchList"
        @filter="filterFn"
        popup-content-class="searchResultsBox"
        @selected="selected()"
      />
        <q-tooltip>
          <br>Does not support realm change, But you can use combind mode to combind old and new character data.
        </q-tooltip>
      </div>
      <PeriodeSelector @input="selectedSeason = $event.season" id="PeriodeSelectorcomp" :region="characterData.characters[0] ? characterData.characters[0].region : 'us'" v-model="periode"></PeriodeSelector>
    </div>
    </div>
    
    <PlayerQuickSelect @selected="selected({value2:$event})"/>

    <template v-if="!fetching">
      
    <div
      class="HeaderSize3 text-center"
      v-if="detailsFailed && characterData.characters.length <= 1"
    >Found no details (maybe user have changed name or realm)</div>
    <div
      v-if="details && characterData && characterData.runs && characterData.runs.length != 0 && !notFound && !fetching"
      class="characterDataClass"
    >
      <div v-if="characterData.characters.length > 1 || detailsFailed" class="flex justify-center">
        <div
          class="NameScore flex justify-center"
          style="margin: 10px; "
          v-for="(character, index) in characterData.characters"
          :key="index"
        >
          <h3>{{character.name}}</h3>
          <h5>{{Math.floor(PlayerScore(character))}}</h5>
        </div>
      </div>
      <template v-else>
        
      <Generalinfo
        :score="PlayerScore(characterData.characters[0])"
        :runs="filterdRuns"
        :character="characterData.characters[0]"
        :details="details"
      ></Generalinfo>
            <RioRank
          v-if=" selectedSeason && characterData.characters.length == 1"
          :region="region"
          :realm="realm"
          :player="player"
          :season="selectedSeason"
        ></RioRank>
      <div class="flex justify-around">
        <updateBox @update="details = $event" :character="characterData.characters[0]" :compact="compact" :details="details"></updateBox>
      </div>
      <br>

      <div class="flex justify-around">
        <div ref="RaidandGear" :class="{cWidth:compact,lncWidth: !compact}">
          <RaidInfo :details="details"></RaidInfo>
          <div style="height: 15px;"></div>
          <GearInfo :details="details"></GearInfo>
          <br v-if="compact">
        </div>
        <statsBox :compact="compact" :details="details"></statsBox>
      </div>

      <br>

      <div class="flex justify-around">
        <talentBox :compact="compact" :class="{bottomMargin: compact}" :details="details"></talentBox>
        <statisticsBox :compact="compact" :details="details"></statisticsBox>
      </div>
      <br>
      <div class="flex justify-around">
        <feedBox :class="{bottomMargin: compact}" :details="details"></feedBox>
        <recentRunsBox :runs="characterData.runs"></recentRunsBox>
      </div>
      <br>
            
      </template>     
    </div>
     <template v-if="characterData.characters.length > 0" class="flex justify-center">

      <DungeonList :runs="filterdRuns"></DungeonList>
      <br>
      <!--<wideContainerBox v-if="characterData.characters[0].renames" title="Player Renames">
        <div v-for="(rename, index) in characterData.characters[0].renames" :key="index">
          <renameBox :rename="rename"></renameBox>        
          <div class="minorBr" v-if="index != characterData.characters[0].renames.length - 1"></div>
        </div>
      </wideContainerBox>
      -->
      <br v-if="characterData.characters[0].renames">
      <AffixOverview :runs="filterdRuns"></AffixOverview>
      <br>
      <AffixSetOverview :runs="filterdRuns"></AffixSetOverview>
      <br>
      <DungeonOverview :runs="filterdRuns"></DungeonOverview>
      <br>
      <!--<KeystoneLevelOverview :runs="filterdRuns"></KeystoneLevelOverview>-->
      <LevelStats :runs="filterdRuns"/>
      <br>
      <ChestChart :runs="filterdRuns"/>
      <!-- <TimeGraph :runs="filterdRuns"></TimeGraph> -->
      </template>
    </template>

    <div>
      <h1 v-if="notFound" class="center">Player not found!</h1>
      <br><br><br>
      <div v-if="fetching" class="col-12 flex flex-center">
        <q-spinner-bars style="color: rgb(161, 161, 161)" :size="200"/>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import { mapGetters, mapActions, mapMutations } from "vuex";
import DungeonList from "../components/lookup/player/DungeonListv2.vue";
import PlayerQuickSelect from "../components/lookup/player/PlayerQuickSelect.vue";
import DungeonOverview from "../components/lookup/player/DungeonOverview.vue";
import AffixOverview from "../components/lookup/player/AffixOverview.vue";
import AffixSetOverview from "../components/lookup/player/AffixSetOverview.vue";
import KeystoneLevelOverview from "../components/lookup/player/KeystoneLevelOverview.vue";
import TimeGraph from "../components/lookup/player/TimeGraph.vue";
import RioRank from "../components/lookup/player/RioRank.vue";
import Generalinfo from "../components/Pages/lookup/GeneralInfo.vue";
import RaidInfo from "../components/Pages/lookup/RaidInfo.vue";
import GearInfo from "../components/Pages/lookup/GearInfo.vue";
import statsBox from "../components/Pages/lookup/statsBox.vue";
import statisticsBox from "../components/Pages/lookup/statisticsBox.vue";
import talentBox from "../components/Pages/lookup/talentBox.vue";
import feedBox from "../components/Pages/lookup/feedBox.vue";
import recentRunsBox from "../components/Pages/lookup/recentRunsBox.vue";
import updateBox from "../components/Pages/lookup/updateBox.vue";
import PeriodeSelector from "../components/lookup/PeriodeSelector.vue";
import LevelStats from "../components/ListViews/LevelStats.vue";
import ChestChart from "../components/ListViews/ChestsChart.vue";
import wideContainerBox from "../components/Pages/lookup/wideContainerBox.vue"
import renameBox from "../components/Pages/lookup/renameBox.vue"
import SF from "../SharedFunctions.js";
import RunsStats from "../components/lookup/player/RunsStats.vue";

export default {
  data() {
    return {
      selectedSeason: null,
      compact: false,
      showStats: false,
      details: null,
      combineMode: false,
      playerSearch: "",
      characterData: { runs: [], characters: [] },
      periode: {},
      character: null,
      notFound: false,
      region: null,
      realm: null,
      player: null,
      fetching: false,
      detailsFailed: false,
      searching: false,
      searchList: [],
    };
  },

  watch: {
  playerSearch(_old, _new) {
    this.selected(this.playerSearch)
    },
    width(_new, _old) {
      var item = {
        width: this.$q.screen.width,
        height: this.$q.screen.height
      };
      this.size = item; 
      this.compact = item.width <= 1081;
    },
    
  },
  computed: {
    ...mapGetters(["GetRealms"]),
    paras() {
      var para = this.$route.query;
      if (!this.isArray(para.characters)) {
        para.characters = [para.characters];
      }
      return para
    },
    width() {
      return this.$q.screen.width
    },
    Realms() {
      return this.GetRealms;
    },
    filterdRuns() {
      var ls = [];

      for (let i = 0; i < this.characterData.runs.length; i++) {
        const element = this.characterData.runs[i];
        SF.log(`Lookup->FilterRuns->For= Element: ${element.completed_timestamp} Periode:${(this.periode.start * 1000)}`,5)
        if (this.periode.start == null || this.periode.end == null) {
          ls.push(element);
        } else {
          if (
            element.time.completed_timestamp > (this.periode.start * 1000) &&
            element.time.completed_timestamp < (this.periode.end * 1000)
          ) {
            ls.push(element);
          }
        }
      }
      return ls;
    }
  },
  methods: {
    filterFn (val, update, abort) {
      if (val.length < 2) {
        abort()
        return
      }

      update(() => {
        this.searchList = []
        this.searching = true
        this.search(val)
      })
    },
    
    PlayerScore(character) {
      var dungeonRuns = SF.groupBy(this.filterdRuns, x=> { return x.zone.id});
      var score = 0;

      for (const p in dungeonRuns) {
        if (dungeonRuns.hasOwnProperty(p)) {
          const runs = dungeonRuns[p];
          var bestrun = null;

          for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            if (bestrun == null || bestrun.score < run.score) {
              bestrun = run;
            }
          }

          score += bestrun.score;
        }
      }

      return score;
    },
    selected(item) {
        if (!this.combineMode) {
          this.Search( 
            item.value2,
            true,
            true
          );
        } else {
          this.Search(
            item.value2,
            false,
            true
          );
        }
        this.SavePlayer(item.value2)
    },
    GetPlayers() {
      var PlayerSearch = JSON.parse(localStorage.getItem("PlayerSearch"));
      if (PlayerSearch) {
        return PlayerSearch
      } else {
        return []
      }
    },
    SavePlayer(player) {
      var ls = this.GetPlayers();
      var _player = ls.filter(x=> {return x.realm == player.realm && x.region == player.region && x.name == player.name})
      if (_player[0]) {
        if (_player[0].seen) {
          _player[0].seen++;
          _player[0].lastSeen = new Date().getTime()
        }
      }else {
        player.seen = 1;
        player.lastSeen = new Date().getTime()
        ls.push(player)
      }
      localStorage.setItem("PlayerSearch", JSON.stringify(ls));
    },
    getRealm(slug) {
      for (let i = 0; i < this.GetRealms.length; i++) {
        const realm = this.GetRealms[i];
        if (realm.slug == slug) {
          return realm;
        }
      }
    },

    async getPlayerDbId(name, realm, region) {
      var listOfPlayer = await this.search(name);
      for (let i = 0; i < listOfPlayer.length; i++) {
        const player = listOfPlayer[i].value2;
        if (player.name.toLowerCase() == name.toLowerCase() && player.realm.toLowerCase() == realm.toLowerCase() && player.region.toLowerCase() == region.toLowerCase()) {
          return player
        }
      }
    },
    async search(terms) {
      var apiUrl = this.$store.state.data.apiUrl
      var vm = this;
      return await axios
        .get(
          apiUrl + "/Player/search?character=" + terms
        )
        .then(function(x) {
          vm.searching = false
          

var _ls = [];
          if (x.data && x.data != []) {
            x.data.forEach(item => {
              var realm = vm.getRealm(item.realm);
              if (realm) {
                var ob = {
                  label:
                    item.name +
                    " " +
                    item.region.toUpperCase() +
                    "-" +
                    realm.name,
                  value: item.name,
                  value2: item
                };
                _ls.push(ob);
              }
            });
          }
          if (_ls.length == 0) {
            _ls.push({ label: "No results...", value: "" });
          } 
          vm.searchList = _ls
          
          return _ls
        })
        .catch(function(ex) {
          vm.searching = false
          console.log(ex);
        });
    },

    SetAdressBar() {
      var ls = [];
      for (let i = 0; i < this.characterData.characters.length; i++) {
        const character = this.characterData.characters[i];

        var characterString =
          "characters=" +
          character.region +
          "." +
          character.realm +
          "." +
          character.name;
        ls.push(characterString);
      }
      this.$router.push("/lookup?" + ls.join("&"));
    },
    resetCharacterData() {
      this.characterData = { runs: [], characters: [] };
      this.details = null;
      this.showStats = false;
      this.detailsFailed = false;
    },
    SearchCharacter() {},
    AddCharacter() {
      this.Search(this.region, this.realm, this.character, false, true);
    },
    syntaxHighlight(jsonString) {
      var jsonPretty = JSON.stringify(jsonString, null, 2);

      return jsonPretty;
    },
    async Search( item, _new, setAdresse,overRideFetching) {
      var apiUrl = this.$store.state.data.apiUrl

      this.region = item.region;
      this.realm = item.realm;
      this.player = item.name;
      var vm = this;
      vm.notFound = false;
      if (!overRideFetching) vm.fetching = true;

      await axios
        .get(`${apiUrl}/Player?id=${item.id}&region=${item.region}`)
        .then(async function(response) {
          if (response.data == "Player not found!") {
            vm.notFound = true;
          } else {
            if (_new) {
              vm.resetCharacterData();
            }
            
            
            var s = {
              name: item.name,
              player_id: response.data.player_id,
              realm: item.realm,
              renames: response.data.renames,
              region: item.region,
              spec: response.data.spec,
              score: response.data.score
            };
            if (_new) {
              await vm.fetchDetails(s);  
            }
            vm.characterData.characters.push(s);
            for (let i = 0; i < response.data.runs.length; i++) {
              const element = response.data.runs[i];
              vm.characterData.runs.push(element);
            }
            if (!overRideFetching) vm.fetching = false;
            if (setAdresse) {
              vm.SetAdressBar();
            }
          }
        })
        .catch(function(ex) {
          if (!overRideFetching) vm.fetching = false;
        });
    },
    async fetchDetails(character) {
      var vm = this;
      var apiUrl = this.$store.state.data.apiUrl;
      await axios
        .get(
          `${apiUrl}/Player/Details?character=${
            character.name
          }&realm=${character.realm}&region=${character.region}`
        )
        .then(x => {
          if (x.data) {
            x.data.character = character;
            vm.details = x.data;
          }
        })
        .catch(x => {
          vm.detailsFailed = true;
        });
    },
    ...mapActions(["GetAllRealms"]),
    isArray(value) {
      return value && typeof value === "object" && value.constructor === Array;
    },
    selectorConvert(ls) {
      var _ls = [];
      ls.forEach(item => {
        if (item.region == this.region || !this.region) {
          _ls.push({ label: item.name, value: item.slug });
        }
      });
      return _ls;
      
    }
  },
  components: {
    Generalinfo,
    DungeonList,
    RunsStats,
    DungeonOverview,
    KeystoneLevelOverview,
    AffixOverview,
    AffixSetOverview,
    PeriodeSelector,
    RioRank,
    PlayerQuickSelect,
    TimeGraph,
    RaidInfo,
    GearInfo,
    statsBox,
    statisticsBox,
    talentBox,
    feedBox,
    recentRunsBox,
    updateBox,
    LevelStats,
    ChestChart,
    wideContainerBox,
    renameBox
  },
  async created() {     
    
    if (this.Realms.length == 0) this.GetAllRealms();
    var vm = this;
    var para = vm.$route.query;
    if (para.characters) {
      if (!this.isArray(para.characters)) {
        para.characters = [para.characters];
      }

      for (let i = 0; i < para.characters.length; i++) {
        const item = para.characters[i];
        var split = item.split(".");

        var region = split[0];
        var realm = split[1];
        var name = split[2];

        this.fetching = true
        if (i == 0) {
          var player = await this.getPlayerDbId(name,realm,region)
          await this.Search(player, true, false,true);
        } else {
          var player = await this.getPlayerDbId(name,realm,region)
          await this.Search(player, false, false,true);
        }
        this.fetching = false
      }
      setTimeout(() => {
        vm.SetAdressBar();
      }, 500);
    }
  }
};
</script>
<style scoped>

.lncWidth {
  max-width: 662px;
  min-width: 300px;
  width: 100%;
}
.cWidth {
  max-width: 1031px;
  min-width: 300px;
  width: 100%;
}
.rncWidth {
  max-width: 370px;
  min-width: 300px;
  width: 100%;
}
.showStats {
  border-radius: 25px;
  border: 1px solid #494949;
  width: 340px;
  background-color: #2e2e2e;
}
.showStats:hover {
  cursor: pointer;
  background-color: #414141;
}
#LookupMain {
  position: relative;
}
#LookupSearchField {
  margin-top: 10px;
  width: 900px;
  background-color: #414141;
  border-radius: 50px;
  padding: 5px 25px;
}
.regionSelector {
  width: 70px;
}
.realmSelector {
  width: 100px;
}
.characterDataClass {
  width: 100%;
}
.NameScore {
  border: rgb(161, 161, 161) solid 1px;
  padding: 0 20px;
  text-align: center;
  border-radius: 20%;
}
#PeriodeSelectorcomp {
  position: absolute;
  right: 10%;
}
.InputField {
  width: 90%;
  margin: auto;
}
.staticToggle {
  position: absolute;
  margin: 18px -10px;
}
.bottomMargin {
  margin-bottom: 20px;
}
.minorBr {
  height: 8px;
  margin: 0px;
}
</style>

