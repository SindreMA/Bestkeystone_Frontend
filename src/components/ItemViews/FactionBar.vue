<template>
  <div v-if="hordeStats && allianceStats && !fetching" class="stats">
    <div :style="{ width: allianceRuns }">
      <q-linear-progress size="50px" :value="100" class="alliance q-mt-sm">
        <div class="absolute-full flex justify-start">
          <div class="infoContainer flex">
            <CloudinaryFormat :url="`factions/alliance.png`" v-slot="{ link }">
              <q-img spinner-size="10px" class="factionIconSize" spinner-color="white" :src="link" />
            </CloudinaryFormat>
            <div class="textHolder greyBackground">
              {{allianceRuns}}
              <q-tooltip>{{allianceStats.runs}}</q-tooltip>
            </div>
          </div>
        </div>
      </q-linear-progress>
    </div>
    <div :style="{ width: hordeRuns }">
      <q-linear-progress size="50px" :value="100" class="horde q-mt-sm">
        <div class="absolute-full flex justify-end">
          <div class="infoContainer flex">
            <div class="greyBackground textHolder">
              {{hordeRuns}}
              <q-tooltip>{{hordeStats.runs}}</q-tooltip>
            </div>
            <CloudinaryFormat :url="`factions/horde.png`" v-slot="{ link }">
              <q-img spinner-size="10px" class="factionIconSize" spinner-color="white"
                :src="link" />
            </CloudinaryFormat>
          </div>
        </div>
      </q-linear-progress>
    </div>
  </div>
  <div v-else-if="fetching" class="flex full-width justify-center">
    <q-spinner-bars size="33px" />
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'

export default {
  components: {
    CloudinaryFormat
  },
  props: ["zone"],
  data() {
    return {
      hordeStats: null,
      allianceStats: null,
      fetching: false,
    };
  },
  computed: {
    ...mapGetters(["GetSettings", "SelectedPeriode"]),
    hordeRuns() {
      if (!this.hordeStats) {
        return;
      }

      const { runs } = this.hordeStats;

      return Math.round((runs / (runs + this.allianceStats.runs)) * 100) + "%";
    },
    allianceRuns() {
      if (!this.allianceStats) {
        return;
      }

      const { runs } = this.allianceStats;

      return Math.round((runs / (runs + this.hordeStats.runs)) * 100) + "%";
    },

  },
  methods: {
    setData(data) {

      this.hordeStats = data.find(({ faction }) => faction === "HORDE");
      this.allianceStats = data.find(({ faction }) => faction === "ALLIANCE");
    },
    fetchData() {
      var vm = this;
      this.fetching = true;
      var apiUrl = this.$store.state.data.apiUrl;

      const {
        min_keystonelevel,
        max_runs,
        limitbylowestdungeon
      } = this.GetSettings;
      axios
        .get(apiUrl + "/Faction/leaderboard", {
          params: {
            periode: this.SelectedPeriode?.id, // Where's this comin from?
            min_level: min_keystonelevel,
            amount: max_runs,
            limitToLowestDungeon: limitbylowestdungeon,
            zone: this.zone
          }
        }).then(x => {
          vm.fetching = false;
          this.setData(x.data);
        })
        .catch(x => {
          vm.fetching = false;
          console.log(x);
        });

    }
  },

  watch: {
    async SelectedPeriode() {
      this.fetchData();
    }
  },
  async mounted() {
    this.fetchData();
  }
};
</script>


<style scouped>
.factionIconSize {
  overflow: visible;
  width: 20px;
}

.infoContainer {
  margin: 0 10px;
  overflow: visible;
}

.textHolder {
  font-size: 13px;
  border: 20% grey solid;
  width: 40px;
  height: 20px;
  margin: 2.5px 5px 0 5px;
}

.stats {
  display: flex;
}

.horde.q-linear-progress,
.horde .q-badge {
  color: #b30000;
  height: 25px;
}

.alliance.q-linear-progress,
.alliance .q-badge {
  color: #0078ff;
  height: 25px;
}
</style>
