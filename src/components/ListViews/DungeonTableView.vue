<template>
  <div id="Main" class="relative">
    <q-spinner-bars
      v-if="runData == null"
      class="absolute-center"
      style="color: rgb(161, 161, 161)"
      size="200"
    />
    <div v-else-if="runData.length == 0" class="HeaderFont">
      <br />
      <br />
      <div class="flex justify-center HeaderSize4">
        <div>There is no data for this request, yet...</div>
      </div>
    </div>
    <q-table
      v-else-if="runData.length != 0"
      :rows-per-page-options="[]"
      card-class="background HeaderFont"
      table-class="HeaderFont"
      table-header-class="HeaderFont"
      dark
      flat
      :rows="runData"
      :columns="dungonsColumns"
      :pagination.sync="paginationControl"
      hide-bottom
      row-key="ingameid"
      ref="dungeonTable"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="view" :props="props">
            <q-btn
              :style="'background-size: 150% 150%; background-image: url('+`${getDungeon(props.row.ingameid).imageurl}`+');' "
              class="darkOverlay"
              round
              flat
              :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
              @click="props.expand = !props.expand"
            />
          </q-td>
          <q-td key="dungeon" :props="props">{{`${getDungeon(props.row.ingameid).name}`}}</q-td>
          <q-td key="runs" :props="props">
            {{props.row.total_runs}}
            <i class="material-icons">info</i>
            <q-tooltip>
              <div v-for="(item, index) in props.row.runs" :key="index">{{`${index}: ${item}`}}</div>
            </q-tooltip>
          </q-td>
          <q-td key="tscore" :props="props">{{Math.round(props.row.tscore)}} ({{props.row.pscore}}%)</q-td>
          <q-td key="ascore" :props="props">{{props.row.ascore}}</q-td>
          <q-td key="intime_rate" :props="props">
            <div
              v-if="getIntimeData(props.row.ingameid)"
            >{{Math.round(getIntimeData(props.row.ingameid).ontime_percent*10)/10}}%</div>
            <q-spinner-bars v-else-if="fetching" size="15" />
            <div v-else>
              <i class="material-icons">warning</i>
              <q-tooltip>Success rate is generated separately. Could not get the data</q-tooltip>
            </div>
          </q-td>
        </q-tr>
        <q-tr class="hideHover" v-if="props.expand" :props="props">
          <q-td
            colspan="100%"
            class="DungeonWindow"
            :style="'background-size: 150% 150%; background-image: url('+`${getDungeon(props.row.ingameid).imageurl}`+');' "
          >
            <br />
            <q-card class="background" style="opacity: 0.92; padding: 2px 10px 10px 10px;">
              <FactionBar :zone="props.row.ingameid" />
            </q-card>
            <br />
            <q-card class="background" style="opacity: 0.92;">
              <q-tabs v-model="tab" animated swipeable class="HeaderFontv2" align="justify">
                <q-tab default name="Composition" label="Best Composition" />
                <q-tab name="Class" label="Best Class" />
                <q-tab name="Spec" label="Best Spec" />
              </q-tabs>
              <q-tab-panels v-model="tab" animated class="background">
                <q-tab-panel keep-alive name="Composition">
                  <q-scroll-area style="height: 600px;">
                    <template v-if="viewMode === 'table'">
                      <CompositionTableView :dungeon="props.row.ingameid" />
                    </template>
                    <template v-else>
                      <CompositionsLists :dungeon="props.row.ingameid" />
                    </template>
                  </q-scroll-area>
                </q-tab-panel>
                <q-tab-panel keep-alive name="Class">
                  <q-scroll-area style="height: 600px;">
                    <template v-if="viewMode === 'table'">
                      <ClassTableView :dungeon="props.row.ingameid" />
                    </template>
                    <template v-else>
                      <ClassLists :dungeon="props.row.ingameid"></ClassLists>
                    </template>
                  </q-scroll-area>
                </q-tab-panel>
                <q-tab-panel keep-alive name="Spec">
                  <q-scroll-area style="height: 600px;">
                    <template v-if="viewMode === 'table'">
                      <SpecTableView :dungeon="props.row.ingameid" />
                    </template>
                    <template v-else>
                      <SpecList :dungeon="props.row.ingameid"></SpecList>
                    </template>
                  </q-scroll-area>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
            <br />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>
<script lang="ts" setup>
import ClassLists from "./ClassLists.vue";
import ClassTableView from "./ClassTableView.vue";
import SpecTableView from "./SpecTableView.vue";
import SpecList from "./SpecList.vue";
import CompositionsLists from "./CompositionsLists.vue";
import CompositionTableView from "./CompositionTableView.vue";
import FactionBar from "../ItemViews/FactionBar.vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useStore } from "src/store";
import axios from "axios";
import sf from "src/SharedFunctions";
import { useQuasar } from "quasar";

let tab = ref("Composition")
let inTimeData = ref([])
let fetching = ref(false)
let error = ref(false)
let runData = ref(null)
let paginationControl = ref({
        rowsPerPage: 999,
        page: 1,
        sortBy: "intime_rate",
        descending: true
      })
let dungonsColumns = ref([
        {
          name: "view",
          label: "",
          align: "left",
          field: x=> x,
        },
        {
          name: "dungeon",
          label: "Dungeon",
          field: row => getDungeon(row.id),
          align: "left",
        },
        {
          name: "runs",
          label: "Amount of runs",
          field: row => row.total_runs,
          sortable: true,
          align: "center",
        },
        {
          name: "tscore",
          label: "Total Score",
          field: row => row.tscore,
          sortable: true,
          align: "center",
        },
        {
          name: "ascore",
          label: "Average score",
          field: row => row.ascore,
          sortable: true,
          align: "center"
        },
        {
          name: "intime_rate",
          label: "Success rate",
          field: row => getIntimeData(row.ingameid).ontime_percent || 0,
          sortable: true,
          align: "center"
        }
      ])

      const store = useStore()
      const data = store.state.data

    const fetchIntimeData = () => {
      if (!SelectedPeriode.value) return null;
      fetching.value = true;
      var apiUrl = data.apiUrl;

      axios
        .get(
          apiUrl +
            "/Dungeon/ontimerate?periode=" +
            SelectedPeriode.value +
            "&min_level=" +
            GetSettings.value.min_keystonelevel +
            "&amount=" +
            GetSettings.value.max_runs +
            "&limitToLowestDungeon=" +
            GetSettings.value.limitbylowestdungeon
        )
        .then(function(response) {
          inTimeData.value = response.data;
          fetching.value = false;
        })
        .catch(function(error) {
          console.log(error);
          error.value = true;
          fetching.value = false;
        });
    }

    const getscore = (score, type, procentTotal, runs) => sf.GetPoints(score, type, procentTotal, runs);

    const getTotalScore = (ls) => {
      var score = 0;
      for (let i = 0; i < ls.length; i++) {
        const item = ls[i];
        score += item.score;
      }
      return score;
    }

    const setData = () => {
      var item = [...GetDungeonData.value.data];
      var ls = [];
      for (let i = 0; i < item.length; i++) {
        var dungeon = {...item[i]};
        dungeon.tscore = dungeon.score;
        dungeon.ascore = getscore(
          dungeon.tscore,
          "mean",
          0,
          dungeon.total_runs
        );
        dungeon.pscore = getscore(
          dungeon.tscore,
          "percent",
          getTotalScore(item),
          dungeon.total_runs
        );
        if (dungeon.total_runs != 0) {
          ls.push(dungeon);
        }
      }
      runData.value = ls;
    }

    const getIntimeData = (id) => {
      if (inTimeData.value) {
        for (let i = 0; i < inTimeData.value.length; i++) {
          const data = inTimeData.value[i];
          if (data.id == id) {
            return data;
          }
        }
      }
      return false;
    }
    const getDungeon = (id) => {
      if (GetDungeons?.value) {
        for (let i = 0; i < (GetDungeons?.value?.length ?? 0); i++) {
          const dungeon = GetDungeons?.value?.[i];
          if (dungeon.keystone_id == id) {
            return dungeon;
          }
        }
      }
    }

const GetDungeonData = computed(() => data.Dungeons_Data)
const GetDungeons = computed(() => data.Dungeons)
const SelectedPeriode = computed(() => data.SelectedPeriode)
const getReloaded_Timestamp = computed(() => data.Reloaded_Timestamp)
const GetAffixes = computed(() => data.Affixes)
const GetPeriodes = computed(() => data.Periodes)
const GetSettings = computed(() => data.settings)

const $q = useQuasar()

const viewMode = computed( () => sf.GetDefaultView($q.screen.width, GetSettings.value))

const dungeonTable = ref(null)

watch(inTimeData, ()=> {
      if (inTimeData.value) {
        var table = dungeonTable.value;
        if (table) {
        }
      }
    })

    watch(GetDungeonData, () => {
      if (GetDungeonData.value) {
        setData();
      }
    })
    watch(SelectedPeriode, () => {
      runData.value = null;
      error.value = false;
      fetchIntimeData();
    })

onBeforeMount(() => {
  if (SelectedPeriode.value) {
      if (GetDungeonData.value) {
        setData();
      }
      fetchIntimeData();
    }
})

</script>

<style scoped>
#Main {
  min-height: 618px;
}
.DungeonWindow {
  background-position: center; /* Center the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}
.darkOverlay {
  background-position: center; /* Center the image */
  background-size: cover; /* Resize the background image to cover the entire container */
  border-radius: 20px;
  border: 1px solid grey;
  background-color: #252525 !important;
}
</style>

