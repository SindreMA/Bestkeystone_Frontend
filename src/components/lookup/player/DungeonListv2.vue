<template>
  <div class="boxBorder">
    <div class="Header HeaderSize4">
      Top Dungeon Runs
    </div>
    <q-table
      :rows="topDungeonRuns"
      :columns="columns"
      dark
      :grid="$q.screen.width < 710"
      :bordered="$q.screen.width < 710"
      :flat="$q.screen.width < 710"
      card-class="HeaderFont"
      table-class="HeaderFont"
      table-header-class="HeaderFont"
      :pagination.sync="paginationControl"
      hide-bottom
      :row-key="row => row.zone.id"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
           <q-td key="view" :props="props">
            <CloudinaryFormat :url="getDetails(props.row.zone?.id)?.imageurl ?? `backgrounds/dungeons/${props.row.zone.slug}.png`" v-slot="{ link }">
            <q-btn
              :style="`background-size: 150% 150%; background-image: url('${link}');`"
              class="btnBackground"
              dense
              round
              flat
              :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
              @click="props.expand = !props.expand"
            />
          </CloudinaryFormat>
          </q-td>
          <q-td key="zone_name" :props="props">

            {{ props.row.zone.name }}
          </q-td>
          <q-td key="level" :props="props">
            <div class="flex justify-end relative">
              <div>{{props.row.keystone_level}}</div>
              <div>
                <div class="chestContainer flex justify-start">
                  <i
                    v-for="(item, chestIndex) in numChest(props.row)"
                    :key="chestIndex"
                    class="starIcon material-icons"
                  >star</i>
                </div>
              </div>
            </div>
          </q-td>
          <q-td key="time" :props="props">{{ FormatTimeUsed(props.row.time.clear_time) }}</q-td>
          <q-td key="affixes" :props="props">
            <div class="flex justify-center">
              <div class="flex justify-start" style="width: 140px;">
                <affix
                  class="AffixImg"
                  :affixid="props.row.affixes[0]"
                  :border="true"
                  :tooltip="true"
                />
                <affix
                  v-if="props.row.keystone_level >= 4"
                  class="AffixImg"
                  :border="true"
                  :affixid="props.row.affixes[1]"
                  :tooltip="true"
                />
                <affix
                  v-if="props.row.keystone_level >= 7"
                  class="AffixImg"
                  :border="true"
                  :affixid="props.row.affixes[2]"
                  :tooltip="true"
                />
                <affix
                  v-if="props.row.keystone_level >= 10"
                  class="AffixImg"
                  :border="true"
                  :affixid="props.row.affixes[3]"
                  :tooltip="true"
                />
              </div>
            </div>
          </q-td>
          <q-td key="score" :props="props">{{ Math.round(props.row.score * 100) / 100}}</q-td>
        </q-tr>
        <q-tr class="hideHover dungeoonDetails" v-if="props.expand" :props="props">
          <q-td colspan="100%">
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <div>
              <br>
              <keystoneView class="background" :id="props.row.keystonrun_id"></keystoneView>
              <br>
            </div>
            <div class="historyContainer background">


                <q-table
      :rows="dungeonRuns[props.row.zone.id]"
      :columns="subcolumns"
      dark
      card-class="background HeaderFont"
      table-class="HeaderFont"
      table-header-class="HeaderFont"
      :pagination.sync="subpaginationControl"

      row-key="keystonrun_id"
    >
     <template v-slot:body="props">
        <q-tr :props="props">
           <q-td key="view" :props="props">
            <q-btn
              dense
              round
              flat
              icon="visibility"
              @click="props.expand = !props.expand"
            />
            <i v-if="runIsBest(props.row)" class="SelectedMarker material-icons">favorite</i>
          </q-td>
          <q-td key="complete_timestamp" :props="props">
            <div class="text-center">
                      {{ FormatTimeAgo(props.row.time.completed_timestamp )}}
                      <q-tooltip>{{ FormatTimeStamp(props.row.time.completed_timestamp )}}</q-tooltip>
              </div>
          </q-td>
          <q-td key="lvl" :props="props">
            <div class="flex justify-center relative">
                      <div>{{props.row.keystone_level}}</div>
                      <div>
                        <div class="chestContainer flex justify-start">
                          <i
                            v-for="(item, chestIndex) in numChest(props.row)"
                            :key="chestIndex"
                            class="starIcon material-icons"
                          >star</i>
                        </div>
                      </div>
                    </div>
          </q-td>
          <q-td key="clear_time" :props="props">
            {{ FormatTimeUsed(props.row.time.clear_time) }}
          </q-td>
          <q-td key="affixes" :props="props"  >
            <div class="flex justify-center">
<div class="flex justify-start" style="width: 140px;">
                      <affix
                        class="AffixImg"
                        :affixid="props.row.affixes[0]"
                        :border="true"
                        :tooltip="true"
                      />
                      <affix
                        v-if="props.row.keystone_level >= 4"
                        class="AffixImg"
                        :border="true"
                        :affixid="props.row.affixes[1]"
                        :tooltip="true"
                      />
                      <affix
                        v-if="props.row.keystone_level >= 7"
                        class="AffixImg"
                        :border="true"
                        :affixid="props.row.affixes[2]"
                        :tooltip="true"
                      />
                      <affix
                        v-if="props.row.keystone_level >= 10"
                        class="AffixImg"
                        :border="true"
                        :affixid="props.row.affixes[3]"
                        :tooltip="true"
                      />
                    </div>
            </div>

          </q-td>
          <q-td key="score" :props="props">
            {{ Math.round(props.row.score * 100) / 100}}
          </q-td>
        </q-tr>
        <q-tr class="hideHover " v-if="props.expand" :props="props">
          <q-td class="hideHover" colspan="100%">
            <keystoneView class="keystoneView" :id="props.row.keystonrun_id"></keystoneView>
          </q-td>
        </q-tr>
     </template>

                </q-table>

            </div>
<br>
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
            <!--///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////-->
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts" setup>
import SF, { moment } from "../../../SharedFunctions";
import affix from "components/Icons/Affix/index.vue";
import keystoneView from "../../ItemViews/keystoneView.vue";
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";
import { useQuasar } from "quasar";

const props = defineProps({
  runs: {
  },
  from: {
  },
  to: {
  }
})

const { runs, from, to } = toRefs(props)

const selected = ref([])
const expanded = ref(false)
const expandls = ref([])
const paginationControl = ref({
        rowsPerPage: 999,
        page: 1,
        sortBy: "score",
        descending: true
      })
const subpaginationControl = ref({
        rowsPerPage: 10,
        page: 1,
        sortBy: "complete_timestamp",
        descending: true
      })
const subcolumns = ref<Array<any>>([
        {
          name: "view",
          label: "View",
          align: "left"
        },
            {
          name: "complete_timestamp",
          field: row => row.time.completed_timestamp,
          sortable: true,
          sort: (a,b, rowA, rowB) => rowA.time.completed_timestamp - rowB.time.completed_timestamp,
          label: "Completed",
          align: "center"
        },
        {
          name: "lvl",
          label: "Level",
          field: row => row.keystone_level,
          sortable: true,
          align: "center",
          sort: (a,b, rowA, rowB) => rowA.keystone_level - rowB.keystone_level,
          format: (val, row) => `${row.keystone_level}${getStars(row)}`
        },
        {
          name: "clear_time",
          label: "Time",
          field: row => row.time.clear_time,
          sortable: true,
          align: "center",
          sort: (a,b, rowA, rowB) => rowA.time.clear_time - rowB.time.clear_time,
          format: (val, row) => `${FormatTimeUsed(row.time.clear_time)}`
        },
        {
          name: "affixes",
          label: "Affixes",
          field: row => row.affixes,
          sortable: true,
          align: "center",
          sort: (a,b, rowA, rowB) => rowA.reduce((a,b) => a + b, 0) - rowB.reduce((a,b) => a + b, 0),

          format: (val, row) =>
            `${[
              GetAffixDetails(row.affixes[0]).name,
              GetAffixDetails(row.affixes[1]).name,
              GetAffixDetails(row.affixes[2]).name,
              GetAffixDetails(row.affixes[3]).name
            ].join(",")}`
        },
        {
          name: "score",
          label: "Score",
          field: row => row.score,
          sortable: true,
          align: "center",
          sort: (a,b, rowA, rowB) => rowA.score - rowB.score,
          format: (val, row) => `${Math.round(row.score * 100) / 100}`
        }
      ])
const columns = ref<Array<any>>([
        {
          name: "view",
          label: "View",
          align: "left"
        },
        {
          name: "zone_name",
          label: "Dungeon",
          field: row => row.zone.name,
          sortable: true,
          align: "left"
        },
        {
          name: "level",
          label: "Level",
          field: row => row.keystone_level,
          sortable: true,
          align: "right",
          sort: (a,b, rowA, rowB) => rowA.keystone_level - rowB.keystone_level,
          format: (val, row) => `${row.keystone_level}${getStars(row)}`
        },
        {
          name: "time",
          label: "Time",
          field: row => row.time.clear_time,
          sortable: true,
          align: "right",
          sort: (a,b, rowA, rowB) => rowA.time.clear_time - rowB.time.clear_time,
          format: (val, row) => `${FormatTimeUsed(row.time.clear_time)}`
        },
        {
          name: "affixes",
          label: "Affixes",
          field: row => row.affixes,
          sortable: true,
          align: "center",
          sort: (a,b, rowA, rowB) => rowA.reduce((a,b) => a + b, 0) - rowB.reduce((a,b) => a + b, 0),
          format: (val, row) =>
            `${[
              GetAffixDetails(row.affixes[0]).name,
              GetAffixDetails(row.affixes[1]).name,
              GetAffixDetails(row.affixes[2]).name,
              GetAffixDetails(row.affixes[3]).name
            ].join(",")}`
        },
        {
          name: "score",
          label: "Score",
          field: row => row.score,
          sortable: true,
          align: "right",
          sort: (a,b, rowA, rowB) => rowA.score - rowB.score,
          format: (val, row) => `${Math.round(row.score * 100) / 100}`
        }
      ])
const dungeonRuns = ref([])
const topDungeonRuns = ref([])

const store = useStore()
const data = store.state.data

const dungeons = computed(() => data.Dungeons)
const GetAffixes = computed(() => data.Affixes)

const getDetails = (id)  => dungeons.value.find(d => d.keystone_id == id)

const expand = (run) => {
      //var comp = this[`run${run.keystonrun_id}`][0];
      //comp.toggle();
}

const runIsBest = (run) => {
      for (let index = 0; index < topDungeonRuns.value.length; index++) {
        const toprun = topDungeonRuns.value[index];
        if (toprun.keystonrun_id === run.keystonrun_id) {
          return true;
        }
      }
      return false;
    }

const getStars = (run) => {
      var result = "";
      for (let i = 0; i < numChest(run); i++) {
        result += "*";
      }
      return result;
    }

const GetAffixDetails = (id) => {
      for (let i = 0; i < GetAffixes.value.length; i++) {
        const affix = GetAffixes.value[i];
        if (affix.id == id) {
          return affix;
        }
      }
    }

const updateData = () => {
      dungeonRuns.value = SF.groupBy(runs.value, x=> x.zone.id);
      topDungeonRuns.value = getTopDungeonRuns(dungeonRuns.value);
    }

const getTopDungeonRuns = (dungeonRuns) => {
      var rls = [];
      for (const p in dungeonRuns) {
        if (dungeonRuns.hasOwnProperty(p)) {
          const element = dungeonRuns[p];

          rls.push(SF._sortBy(element, "score").reverse()[0]);
        }
      }
      return rls;
    }

const FormatTimeStamp = (time) => {
      return moment(time).format("hh:mm DD.MM.YYYY");
    }

const FormatTimeAgo = (time) => {
      return moment(time).fromNow();
    }

const FormatTimeUsed = (time) => {
      return moment.duration(time).format("h:mm:ss");
}

const numChest = (run) => {
      var timeLeft = run.time.map_time - run.time.clear_time;

      if (run.time.clear_time <= run.time.map_time * 0.6) {
        //3 chest
        return 3;
      } else if (run.time.clear_time <= run.time.map_time * 0.8) {
        //2 chest
        return 2;
      } else if (timeLeft >= 0) {
        //1 chest
        return 1;
      } else {
        //not in time
        return 0;
      }
    }

watch(runs, ()=> {
      updateData();
    })

const $q = useQuasar()

onBeforeMount(() => {
      updateData();
      $q.screen.setSizes({ sm: 300, lg: 1000, xl: 2000 });
    })
</script>
<style >
.TabledWindow {
  width: 1050px;
}
.ColNomargin {
  margin: 0px;
  padding: 0px;
}
.Colmargin {
  margin: 0px;
  padding: 0px;
  margin-left: 40px;
}
.colPlacement {
  position: relative;
  bottom: -15px;
}
.AffixImg {
  margin: 0 5px;
  width: 25px;
  height: 25px;
}
.miniAffixImg {
  margin: 0 5px;
  width: 20px;
  height: 20px;
}
.historyContainer {
  border: rgb(61, 61, 61) 1px solid;
}
table {
  color: rgb(161, 161, 161) !important;
  border-collapse: collapse;
  width: 100%;
}
.hideHover:hover {
  background-color: #333333 !important;
}
.historyContainer .hideHover:hover {
  background-color: #252525 !important;
}
.hideHover:hover tr:nth-child():hover {
  background-color: #252525 !important;
}
.q-table th {
  opacity: 1;
}
.starIcon {
  transform: scale(0.6);
  width: 7px;
  color: goldenrod;
}
.chestContainer {
  overflow: visible;
  position: absolute;
  min-width: 20px;
  top: -2px;
}
.boxBorder {
  border: #424242 2px solid;
}

.cardMargin {
  margin: 10px;
  width: 220px;
  height: 224px;
}
.SelectedMarker {
  font-size: 20px;
  height: 38px;
  color: red;
}
.dungeoonDetails{
  background-color: #333333;
}
.viewItem {
  min-width: 800px;
  width: 100%;
  max-width: 1000px;
}
.Header {
    background-color: #414141;
  padding: 5px;
}
.btnBackground {
    background-position: center; /* Center the image */
        background-size: cover; /* Resize the background image to cover the entire container */
    border-radius: 20px;
    border: 1px solid grey;
}
</style>


