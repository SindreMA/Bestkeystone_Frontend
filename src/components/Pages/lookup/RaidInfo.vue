<template>
  <div v-if="details" class="MainWindow">
    <div class="row raidItemHeader" v-if="SelectedRaid">
            <div class="raidItemName"></div>
            <div class="raidItemProgress text-center">Progress</div>
            <div class="raidItemKills text-center">Kills</div>
        </div>
    <div class="fullwidth" id="RaidDivContainer">
      <div class="fullwidth" id="RaidDivHeader">
        <q-select dark v-model="SelectedRaid" dense :options="progressedRaids" :option-label="(x) => x === null && x.raid === null ? 'Null value' : x.raid.name"
        hide-dropdown-icon :display-value="SelectedRaid ? SelectedRaid.raid.name : ''" popup-content-class="searchResultsBox"/>
      </div>
     

      <div v-if="SelectedRaid">
        <div v-for="(diff, index) in SelectedRaid.difficulties" :key="index" :class="{minorlighter: !isOdd(index) }">
          
          <div v-if="diff.difficulty.name != 'Raid Finder'"  class="flex justify-between">
            <div class="row">
            <div v-if="expanded != diff.difficulty.id">
                <q-btn dense flat color="grey" icon="add" @click="expanded = diff.difficulty.id" />
          </div>
          <div v-else>
                <q-btn dense flat color="grey" icon="remove" @click="expanded = expanded == null" />
          </div>
            <div style="margin-top: 5px;">{{diff.difficulty.name}}</div>
          </div>
          <div class="flex" style="">
            <div style="margin-right: 15px;">{{GetProgress(diff)}}</div>
            <div style="margin-right: 27px;">{{GetTotalKills(diff.bosses)}}</div>
          </div>
          </div>

          
          
              <div v-if="expanded == diff.difficulty.id">
                <div class="row bossItemContainer" v-for="(boss, secindex) in diff.bosses" :key="secindex" :class="{minorlighter: !isOdd(secindex) }">
                  <div class="raidItemName">{{boss.boss.name}}</div>
                  <div class="raidItemProgress text-center"></div>
                  <div class="raidItemKills text-center">{{boss.kills}}</div>
                </div>
              </div>
            </div>
        </div>


    </div>
  </div>
</template>

<script>
import linq from "linq";
export default {
  props: ["details"],
  watch: {
    progressedRaids() {
      this.choseLatestRaid();
    }
  },
  created() {this.choseLatestRaid();},
  watch: {
    details () {
      this.choseLatestRaid();
    }
  },
  data() {
    return {
      SelectedRaid: null,
      expanded: null,
    };
  },
  methods: {
    choseLatestRaid() {
      this.SelectedRaid = this.progressedRaids[this.progressedRaids.length - 1]
    },
      isOdd(num) { return num % 2 === 1; },
      GetTotalKills(bosses) {
        if (bosses) {
          var num = 0
          for (let i = 0; i < bosses.length; i++) {
            const boss = bosses[i];
            num += boss.kills
          }
          return num
        } else return 0
      },
      GetProgress(latestDifficulty) {
        return `${latestDifficulty.bosses.length}/${this.SelectedRaid.raid.bosses.length}${latestDifficulty.difficulty.name[0]} `        
      },
      
  },
  computed: {
        size() {
      return { width: this.$q.screen.width, height: this.$q.screen.height}
    },
    progressedRaids() {
      if (this.details) {

        var raids = []
        this.details.encounters.forEach(expansion => {
          expansion?.raids?.forEach(raid => {
            raids.push(raid)
          });          
        });

        return raids;
      }
    },
  }
};
</script>

<style scoped>


.MainWindow {
    min-width: 300px;
    min-height: 129px;
    width: auto;
    padding: 0 2px;
}
#RaidDivContainer {
  border: 1px solid #696969;
  overflow: hidden;
}
#RaidDivHeader {
  background-color: #414141;
  width: 100%;
  height: 37px;
}
.raidItemContainer {
  height: 30px;
  padding: 5px;
}
.raidItemContainer:hover {
    cursor: pointer;
    background-color: #3d3d3d;
}
.lighter {
  background-color: #313131;
}
.minorlighter {
  background-color: #292929;
}
.raidItemName {
  width: 82%;
}
.raidItemProgress {
  width: 12%;
}
.raidItemKills {
  width: 5%;
}
.bossItemContainer {
      height: 30px;
  padding: 5px;
}
.raidItemHeader {
     height: 30px;
  padding: 5px;
    position: relative;
    top: 15px;
    padding: 0 15px;
    height: 0;
}
</style>

