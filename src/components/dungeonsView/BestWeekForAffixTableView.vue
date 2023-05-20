<template>
  <div id="Main" class="relative">
    <div class="text-center HeaderFont">
      <div class>
        <h2>What week is best for what dungeon?</h2>
      </div>
      <div class="flex justify-center" v-if="rangeValues">
        <div class="affixInfoFieldRight">
          <p class>From</p>
          <p>{{ FormatDate(periodeDetails(rangeValues.min).start_timestamp) }}</p>
          <div class="flex">
            <affix
              v-for="affix in periodeDetails(rangeValues.min).affixes"
              :key="affix"
              :size="35"
              :border="true"
              :affixid="affix"
              :detailed="true"
              :tooltip="true"
            ></affix>
          </div>
        </div>

        <div style="width: 200px;" v-if="rangeValues">
          {{ rangeValues.max - rangeValues.min }}
          <br />weeks
          <br />selected
        </div>

        <div class="affixInfoFieldLeft" v-if="rangeValues">
          <p>To</p>
          <p>{{ FormatDate(periodeDetails(rangeValues.max).start_timestamp) }}</p>
          <div class="flex">
            <affix
              v-for="affix in periodeDetails(rangeValues.max).affixes"
              :key="affix"
              :size="35"
              :border="true"
              :affixid="affix"
              :detailed="true"
              :tooltip="true"
            ></affix>
          </div>
        </div>
      </div>
      <q-range
        v-if="allPeriodes"
        v-model="rangeValues"
        :min="allPeriodes[0].id"
        :max="allPeriodes[allPeriodes.length - 1].id"
        :step="1"
      />
      <div v-if="rangeValues && data">
        <div class>
          <q-table
            :rows-per-page-options="[]"
            card-class="background HeaderFont"
            table-class="HeaderFont"
            table-header-class="HeaderFont"
            dark
            flat
            :rows="data.filter((x,i)=> x.dungeon != null && x.dungeon !== -2)"
            :columns="dungeonColumns"
            :pagination.sync="dungeonPaginationControl"
            hide-bottom
            row-key="dungeon"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td>
                  <q-btn
                    :style="'background-image: url('+`${DungeonDetails(props.row.dungeon).imageurl}`+');' "
                    class="darkOverlay"
                    round
                    flat
                    :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
                    @click="props.expand = !props.expand"
                  />
                </q-td>
                <q-td key="dungeon" :props="props">{{DungeonDetails(props.row.dungeon).name}}</q-td>
                <q-td key="affixes" :props="props">
                  <div class="flex justify-center">
                    <affix
                      v-for="(affix, index) in periodeDetails(getBestPeriode(props.row.list).periode).affixes"
                      :key="index"
                      :affixid="affix"
                    />
                  </div>
                </q-td>
                <q-td
                  key="tscore"
                  :props="props"
                >{{Math.round(getBestPeriode(props.row.list).tscore)}}</q-td>
                <q-td key="ascore" :props="props">{{getBestPeriode(props.row.list).ascore}}</q-td>
                <q-td
                  key="intime_rate"
                  :props="props"
                >{{Math.round(getBestPeriode(props.row.list).success_rate*100)/100}}%</q-td>
              </q-tr>
              <q-tr class="hideHoverGlobal" v-if="props.expand" :props="props">
                <q-td colspan="100%">
                  <q-table
                    :rows-per-page-options="[]"
                    card-class="background HeaderFont"
                    table-class="HeaderFont"
                    table-header-class="HeaderFont"
                    dark
                    dense
                    flat
                    :rows="props.row.list"
                    :columns="subdungeonColumns"
                    :pagination.sync="subdungeonPaginationControl"
                    hide-bottom
                    row-key="dungeon"
                  >
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="periode" :props="props">{{Math.round(props.row.periode)}}</q-td>
                        <q-td key="affixes" :props="props">
                          <div class="flex justify-center">
                            <affix
                              v-for="(affix, index) in periodeDetails(props.row.periode).affixes"
                              :key="index"
                              :affixid="affix"
                            />
                          </div>
                        </q-td>
                        <q-td key="tscore" :props="props">{{Math.round(props.row.tscore)}}</q-td>
                        <q-td key="ascore" :props="props">{{props.row.ascore}}</q-td>
                        <q-td
                          key="intime_rate"
                          :props="props"
                        >{{Math.round(props.row.success_rate*100)/100}}%</q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
        <div>
          <div class="flex flex-center">
            <h6 id="OverallTitle">Best overall week</h6>
          </div>
          <div class="flex flex-center">
            <div class="TotalView flex justify-around">
              <affix
                v-for="affix in periodeDetails(getBestPeriode(BestAffixList()).periode).affixes"
                :key="affix"
                :size="70"
                :border="false"
                :affixid="affix"
                :detailed="false"
                :tooltip="false"
              ></affix>
            </div>
            <q-tooltip>
              <div class="text-center" style="width: 100%; border-bottom: solid 1px, black;">
                <div class="flex justify-around" style="width: 100%;">
                  <div class="tableField">Periode</div>
                  <div class="tableField">Affixes</div>
                  <div class="tableField">Score</div>
                  <div class="tableField">Average Score</div>
                  <div class="tableField">Success Rate</div>
                </div>

                <div
                  class="flex justify-around"
                  style="width: 100%;"
                  v-for="row in GetTableFriendlyData(BestAffixList())"
                  :key="row.periode"
                >
                  <div class="tableField">{{row.periode}}</div>
                  <div class="tableField">
                    <div class="flex">
                      <affix
                        v-for="affix in row.affixes"
                        :key="affix"
                        class="micoAffixImg"
                        :border="true"
                        :affixid="affix"
                        :detailed="false"
                        :tooltip="false"
                      ></affix>
                    </div>
                  </div>
                  <div class="tableField">{{ Math.floor((row.total_score / 1000)* 100) / 100 }}</div>
                  <div class="tableField">{{ Math.floor(row.avg_score * 100) / 100 }}</div>
                  <div class="tableField">{{ Math.floor(row.success_rate * 100) / 100 }}%</div>
                </div>
              </div>
            </q-tooltip>
          </div>
          <div class="flex flex-center">
            <div class="flex flex-center scoreView">
              <div
                v-if="type === 'success_rate'"
              >Success rate: {{ getBestPeriode(BestAffixList()).success_rate.toFixed(0) }}%</div>
              <div
                v-if="type === 'total_score'"
              >Total Score : {{Math.floor((getBestPeriode(BestAffixList()).total_score)) }}</div>
              <div
                v-if="type === 'avg_score'"
              >Average Score: {{ Math.floor(getBestPeriode(BestAffixList()).avg_score ) }}</div>
            </div>
          </div>
        </div>
      </div>
      <q-spinner-bars v-else class="absolute-center" style="color: rgb(161, 161, 161)" :size="200" />
    </div>
  </div>
</template>
<script>
import axios from "axios";
import SF from "../../SharedFunctions";
import affix from "../Icons/Affix/index.vue";
import { mapGetters } from "vuex";
import { debounce } from "debounce";
import Enumerable from "linq";

export default {
  components: {
    affix
  },
  data() {
    return {
      dungeonPaginationControl: {
        rowsPerPage: 20,
        page: 1,
        sortBy: "intime_rate",
        descending: true
      },
      subdungeonPaginationControl: {
        rowsPerPage: 30,
        page: 1,
        sortBy: "periode",
        descending: true
      },
      dungeonColumns: [
        {
          name: "view",
          label: "",
          align: "left"
        },
        {
          name: "dungeon",
          label: "Dungeon",
          sortable: true,
          field: row => DungeonDetails(row.dungeon).name,
          align: "left"
        },
        {
          name: "affixes",
          label: "Affixes",
          align: "center"
        },
        {
          name: "tscore",
          label: "Total Score",
          field: row => this.getBestPeriode(row.list).tscore,
          sortable: true,
          align: "center"
        },
        {
          name: "ascore",
          label: "Average score",
          field: row => this.getBestPeriode(row.list).ascore,
          sort: (a, b, rowA, rowB) =>
            this.getBestPeriode(rowA.list).ascore -
            this.getBestPeriode(rowB.list).ascore,

          sortable: true,
          align: "center"
        },
        {
          name: "intime_rate",
          label: "Success rate",
          field: row => this.getBestPeriode(row.list).success_rate,
          sortable: true,
          align: "center"
        }
      ],
      subdungeonColumns: [
        {
          name: "periode",
          label: "Period",
          align: "center",
          field: row => row.periode,
          sortable: true
        },
        {
          name: "affixes",
          label: "Affixes",
          align: "center",
          field: row => this.periodeDetails(row.periode).affixes,
          sortable: true
        },
        {
          name: "tscore",
          label: "Total Score",
          field: row => row.tscore,
          sortable: true,
          align: "center"
        },
        {
          name: "ascore",
          label: "Average score",
          field: row => row.ascore,
          sort: (a, b, rowA, rowB) => rowA.ascore - rowB.ascore,

          sortable: true,
          align: "center"
        },
        {
          name: "intime_rate",
          label: "Success rate",
          field: row => row.success_rate,
          sortable: true,
          align: "center"
        }
      ],
      rangeValues: null,
      allPeriodes: null,
      type: "success_rate",
      data: null,
      successRate: true,
      paginationControl: { rowsPerPage: 15, page: 1 },
      bounce: null,
      columns: [
        {
          name: "periode",
          label: "Periode",
          field: "periode",

          sortable: true
        },
        { name: "affixes", label: "Affixes", field: "affixes", sortable: true },

        {
          name: "total_score",
          label: "Total Score",
          field: "total_score",
          sortable: true
        },
        {
          name: "avg_score",
          label: "Average Score",
          field: "avg_score",
          sortable: true
        },
        {
          name: "success_rate",
          label: "Success Rate",
          field: "success_rate",
          sortable: true
        }
      ]
    };
  },
  watch: {
    dungeonPaginationControl(_new, _old) {
      var val = _new.sortBy;
      if (_new == null) {
        val = _old.sortBy;
      }
      if (val == "intime_rate") {
        this.type = "success_rate";
        this.subdungeonPaginationControl.sortBy = "intime_rate";
      } else if (val == "tscore") {
        this.type = "total_score";
        this.subdungeonPaginationControl.sortBy = "tscore";
      } else if (val == "ascore") {
        this.type = "avg_score";
        this.subdungeonPaginationControl.sortBy = "ascore";
      }
    },
    rangeValues() {
      var vm = this;
      var bon = setTimeout(function() {
        if (vm.bounce == bon) {
          vm.getData();
        }
      }, 1000);
      this.bounce = bon;
      this.BestAffixList;
    }
  },
  computed: {
    ...mapGetters(["GetDungeons", "GetAffixes"])
  },
  methods: {
    BestAffixList() {
      if (this.data) {
        var noneDungeon = this.data.filter(x => {
          return !x.dungeon || !x.zone || x.dungeon === -2 || x.zone === -2;
        })[0].list;
        return noneDungeon;
      }
    },
    GetTableFriendlyData(dungeon) {
      var ls = [];
      for (let i = 0; i < dungeon.length; i++) {
        const periodedata = dungeon[i];
        var item = {
          periode: periodedata.periode,
          affixes: this.periodeDetails(periodedata.periode).affixes,
          total_score: periodedata.score,
          avg_score: periodedata.score / periodedata.runs,
          success_rate: periodedata.success_rate
        };
        ls.push(item);
      }
      return SF._sortBy(ls, this.type).reverse();
    },
    GetAffixDetails(id) {
      for (let i = 0; i < this.GetAffixes.length; i++) {
        const affix = this.GetAffixes[i];
        if (affix.id == id) {
          return affix;
        }
      }
    },

    DungeonDetails(id) {
      for (let i = 0; i < this.GetDungeons.length; i++) {
        const dungeon = this.GetDungeons[i];
        if (dungeon.keystone_id == id) {
          return dungeon;
        }
      }
    },
    getBestPeriode(periodes) {
      var ls = [];
      for (let i = 0; i < periodes.length; i++) {
        const periode = periodes[i];
        var totscore = periode.score / 1000;
        periode.total_score = totscore;

        var avgscore = periode.score / periode.runs;
        periode.avg_score = avgscore;
      }
      ls = SF._sortBy(periodes, this.type).reverse();
      return ls[0];
    },
    getPeriodes() {
      var vm = this;
      var apiUrl = this.$store.state.data.apiUrl;
      axios
        .get(apiUrl + "/Periode?weeks=50")
        .then(function(response) {
          vm.allPeriodes = SF._sortBy(response.data, "id");
          vm.rangeValues = {
            min: vm.allPeriodes[vm.allPeriodes.length - 1].id - 10,
            max: vm.allPeriodes[vm.allPeriodes.length - 1].id
          };
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    getData() {
      var vm = this;
      var apiUrl = this.$store.state.data.apiUrl;

      axios
        .get(
          apiUrl +
            "/Dungeon/BestAffixSetPerDungeon?fromPeriode=" +
            vm.rangeValues.min +
            "&toPeriode=" +
            vm.rangeValues.max
        )
        .then(function(response) {
          response.data = response.data.map(x=> x.list)
          var ls = [];
          for (let index = 0; index < response.data.length; index++) {
            const periodeLS = response.data[index];
            var pls = [];
            for (let o = 0; o < periodeLS.length; o++) {
              const dungeon = periodeLS[o];
              dungeon.tscore = dungeon.score;
              dungeon.ascore = SF.GetPoints(
                dungeon.tscore,
                "mean",
                0,
                dungeon.runs
              );
              pls.push(dungeon);
            }
            ls.push({
              dungeon: pls[0].zone || null,
              list: pls
            });
          }
          vm.data = ls;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    periodeDetails(id) {
      for (let i = 0; i < this.allPeriodes.length; i++) {
        const element = this.allPeriodes[i];
        if (element.id === id) {
          return element;
        }
      }
    },
    FormatDate(time) {
      return SF.GetMoment(time).format("MMMM Do YYYY");
    },
  },
  created() {
    this.getPeriodes();
  }
};
</script>
<style scoped>
#Main {
  min-height: 975px;
}
h2 {
  margin-bottom: 0;
}
.miniAffixImg {
  margin: 0 5px;
  width: 35px;
  height: 35px;
}
.microAffixImg {
  margin: 0 1px;
  width: 30px;
  height: 30px;
}
.bigAffixImg {
  width: 70px;
  height: 70px;
}

.percentBackground {
  border-radius: 25px;
  opacity: 0.8;
  padding: 5px 5px 5px 5px;
  background-color: black;
}
#DungeonDot {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  margin: 15px;
  font-size: 15px;

  background-position: center; /* Center the image */
  background-size: cover;
}
.ListCSS {
  width: 180px;
}
.tableField {
  width: 80px;
}
.TotalView {
  overflow: hidden;
  height: 70px;
  border-radius: 40px;
  border: 1px solid black;
}
#OverallTitle {
  margin: 15px 0px 10px 0px;
}
.scoreView {
  background-color: black;
  opacity: 0.8;

  border-radius: 0 0 10px 10px;
  width: 140px;
}
.micoAffixImg {
  width: 20px;
  height: 20px;
}
.darkOverlay {
  background-position: center; /* Center the image */
  background-size: cover; /* Resize the background image to cover the entire container */
  border-radius: 20px;
  border: 1px solid grey;
}
</style>


