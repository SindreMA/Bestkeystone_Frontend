<template>
  <div id="Main">
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
      :columns="roleColumns"
      :pagination.sync="paginationControl"
      hide-bottom
      hide-header      
      row-key="role"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="role" :props="props">
            <div class="flex justify-center">
              <div class="flex justify-center">
                <CloudinaryFormat :url="`roles/${props.row.role.toLowerCase()}.png`" v-slot="{ link }">
                <q-img
                  id="roleImage"
                  spinner-size="15px"
                  spinner-color="white"
                  :src="link"
                />
              </CloudinaryFormat>
              </div>
              <div class="flex justify-center">
                <q-btn
                  dense
                  round
                  flat
                  :icon="!props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
                  @click="props.expand = !props.expand"
                />
              </div>
            </div>
          </q-td>
        </q-tr>
        <q-tr class="hideHoverGlobal" v-if="!props.expand" :props="props">
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
              :columns="specColumns"
              :pagination.sync="specPaginationControl"
              hide-bottom
              row-key="spec"
              :visible-columns="visibleColumns"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="name" :props="props">
                    <div :style="`color: ${getClass(props.row.class_id)?.color};`" class="flex justify-start align-items-start gap-5">
                      <CloudinaryFormat :url="getSpec(props.row.spec).icon_url" v-slot="{ link }">
                        <q-img spinner-size="15px" spinner-color="white" class="tableIcon" :src="link" />
                      </CloudinaryFormat>
                      {{`${getSpec(props.row.spec)?.name} ${getClass(props.row.class_id)?.name}`}}
                    </div>
                  </q-td>
                  <q-td key="runs" :props="props">{{props.row.runs}} ({{ Math.round(props.row.runs /props.row.truns * 10000)/ 100}}%)</q-td>
                  <q-td key="tscore" :props="props">{{Math.round(props.row.score)}} ({{getscore(props.row.score, "percent", getTotalScore(getRolelist(props.row.role).list), props.row.runs )}}%)</q-td>
                  <q-td
                    key="ascore"
                    :props="props"
                  >{{getscore(props.row.score, "mean", 0, props.row.runs )}}</q-td>
                  
                  <q-td key="intime_rate" :props="props">
                    <div
                      v-if="getIntimeData(props.row.spec)"
                    >{{Math.round(getIntimeData(props.row.spec).ontime_percent*10)/10}}%</div>
                    <q-spinner-bars v-else-if="fetching" size="15" />
                    <div v-else>
                      <i class="material-icons">warning</i>
                      <q-tooltip>Success rate is generated separately. Could not get the data</q-tooltip>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-td>
        </q-tr>
      </template>
    </q-table>
                <q-spinner-bars v-else class="absolute-center" style="color: rgb(161, 161, 161)" size="200"/>

  </div>
</template>
<script lang="ts" setup>
import sf from "../../SharedFunctions";
import axios from "axios";
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";

const props = defineProps({
  dungeon: {
    type: Number,
  },
})

const {  dungeon } = toRefs(props)

let inTimeData = ref([])
let fetching = ref(false)
let error = ref(false)
let runData = ref(null)
      let paginationControl = ref({
        rowsPerPage: 10,
        page: 1,
        sortBy: "role",
        descending: false
      })

      let classPaginationControl = ref({
        rowsPerPage: 12,
        page: 1,
        sortBy: "ascore",
        descending: true
      })
      let specPaginationControl = ref({
        rowsPerPage: 99,
        page: 1,
        sortBy: "ascore",
        descending: true
      })
      let roleColumns = ref([
        {
          name: "role",
          label: "",
          field: row => row.field,
          align: "left"
        }
      ])
      let specColumns = ref([
        {
          name: "name",
          label: "Name",
          field: row => `${row.details?.name} ${row.class?.name}`,
          sortable: true,
          align: "left"
        },
        {
          name: "runs",
          label: "Amount of runs",
          field: row => row.runs,
          sortable: true,
          align: "center"
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
          sortable: true,
          align: "center"
        },
        
        {
          name: "intime_rate",
          label: "Success rate",
          field: row => getIntimeData(row.spec).ontime_percent || 0,
          sortable: true,
          align: "center"
        }
      ])

const store = useStore()

const data = store.state.data
const GetSpecData = computed(() => data.Spec_Data)
const GetSpecs = computed(() => data.Specs)
const GetClasses = data.Classes
const GetDungeonSpecData = data.Spec_Dungeon_Data
const GetDungeonData = data.Dungeons_Data
const SelectedPeriode = computed(() =>data.SelectedPeriode)
const GetSettings = data.settings



    
    const visibleColumns = computed( () => {
      var ls = ['view','name','runs','tscore','ascore']
      if (!dungeon.value) {
        ls.push('intime_rate')
      }
      return ls
    })

    const ownPage = location.pathname.includes("/specs");

    const state = data;
    const fetchSpecData = (x?) => store.dispatch("fetchSpecData", x);
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

    const setData = () => {
      var item = sf.groupBy([...GetSpecData.value.data], "role");
      
      if (dungeon.value) {
        var filterData = [...GetDungeonSpecData.filter(x => {
                return (
                  x.dungeon === dungeon.value &&
                  SelectedPeriode.value === x.periode &&
                  x.created > state.Reloaded_Timestamp
                );
              })]
              
        item = sf.groupBy(
          sf
            ._sortBy(
              filterData,
              "created"
            )
            .reverse()[0].data,
          "role"
        );
      }
      
      var ls = [];
      for (var propertyName in item) {
        ls.push({
          role: propertyName,
          list: item[propertyName],
          expand: true
        });
      }

      for (let i = 0; i < ls.length; i++) {
        const role = ls[i];

        var ls2 = [];
        for (var specName in role.list) {
          var spec = {...role.list[specName]};
          spec.tscore = spec.score;
          spec.truns = getTotalRuns(role.list);
          spec.ascore = getscore(
            spec.tscore,
            "mean",
            getTotalScore(role.list),
            spec.runs
          );
          spec.pscore = getscore(
            spec.tscore,
            "percent",
            getTotalScore(role.list),
            spec.runs
          );
          ls2.push(spec);
        }
        role.list = ls2;
      }

      runData.value = ls;
    }

    const fetchIntimeData = () => {
      fetching.value = true;
      var apiUrl = data.apiUrl;

      axios
        .get(
          apiUrl +
            "/Spec/ontimerate?periode=" +
            SelectedPeriode.value +
            "&min_level=" +
            GetSettings.min_keystonelevel +
            "&amount=" +
            GetSettings.max_runs +
            "&limitToLowestDungeon=" +
            GetSettings.limitbylowestdungeon
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

    const getTotalRuns = (ls) => {
      var runs = 0;
      for (let i = 0; i < ls.length; i++) {
        const item = ls[i];
        runs += item.runs;
      }
      return runs;
    }

    const getRolelist = (role, class_id?) => {
      for (let i = 0; i < runData.value.length; i++) {
        const roleItem = runData.value[i];
        if (roleItem.role.toLowerCase() === role.toLowerCase()) {
          if (!class_id) {
            return roleItem;
          } else {
            for (let o = 0; o < roleItem.list.length; o++) {
              const _class = roleItem.list[o];
              if (_class.id == class_id) {
                return _class;
              }
            }
          }
        }
      }
    }

    const getClass = (id) => {
      if (GetClasses) {
        for (let i = 0; i < GetClasses.length; i++) {
          const _class = GetClasses[i];
          if (_class.id == id) {
            return _class;
          }
        }
      }
    }

    const getSpec = (id) => {
      if (GetSpecs.value) {
        for (let i = 0; i < GetSpecs.value.length; i++) {
          const spec = GetSpecs.value[i];
          if (spec.id == id) {
            return spec;
          }
        }
      }
    }

onBeforeMount(() => {
  if (dungeon.value) {
      fetchSpecData({ id: dungeon.value });
    } else {
      if (SelectedPeriode.value) {
        if (GetSpecData.value) {
          setData();
        } else {
          fetchSpecData();
        }
        fetchIntimeData();
      }
    }
})


    watch(GetSpecData, ()=> {
      if (!dungeon.value) {
        setData();
      }
    })
    watch(SelectedPeriode, ()=> {
      runData.value = null;
      error.value = false;
      fetchIntimeData();
    })
    watch(GetDungeonSpecData, ()=> {
      setData();
    })
  

</script>
<style>
#Main {
  min-height: 618px;
  position: relative;
}
#SpecShowerShowAllbtn {
  width: 80px;
  border: rgb(161, 161, 161) 1px solid;
  border-radius: 20px;
  padding: 3px 2px;
  text-align: center;
}
#SpecShowerShowAllbtn:hover {
  cursor: pointer;
}
#roleImage {
  width: 25px;
  height: 25px;
}
.hideHover:hover {
  background-color: #252525 !important;
}
.tableIcon {
  width: 18px;
  height: 18px;
}
</style>
