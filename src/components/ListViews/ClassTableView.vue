<template>
  <div id="Main" class="HeaderFont">
    <q-spinner-bars v-if="runData == null" class="absolute-center" style="color: rgb(161, 161, 161)" size="200" />
    <div v-else-if="runData.length == 0" class="HeaderFont">
      <br />
      <br />
      <div class="flex justify-center HeaderSize4">
        <div>There is no data for this request, yet...</div>
      </div>
    </div>
    <q-table v-else-if="runData.length != 0" :rows-per-page-options="[]" card-class="background HeaderFont"
      table-class="HeaderFont" table-header-class="HeaderFont" dark flat :rows="runData" :columns="roleColumns"
      :pagination.sync="paginationControl" hide-bottom hide-header row-key="role">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="role" :props="props">
            <div class="flex justify-center">
              <div class="flex justify-center">
                <CloudinaryFormat :url="`roles/${props.row.role.toLowerCase()}.png`" v-slot="{ link }">
                  <q-img id="roleImage" spinner-size="15px" spinner-color="white"
                    :src="link" />
                </CloudinaryFormat>
              </div>
              <div class="flex justify-center">

                <q-btn dense round flat :icon="!props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
                  @click="props.expand = !props.expand" />
              </div>
            </div>
          </q-td>
        </q-tr>
        <q-tr class="hideHover" v-if="!props.expand" :props="props">
          <q-td colspan="100%">
            <q-table :rows-per-page-options="[]" card-class="background HeaderFont" table-class="HeaderFont"
              table-header-class="HeaderFont" dark flat dense hide-bottom :rows="props.row.list" :columns="classColumns"
              :pagination.sync="classPaginationControl" row-key="id" :visible-columns="visibleColumns">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="view" :props="props">
                    <q-btn dense round flat :size="'xs'" :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
                      @click="props.expand = !props.expand" />
                  </q-td>
                  <q-td key="name" :props="props">

                    <div :style="`color: ${getClass(props.row.list[0].class_id).color};`">
                      <q-img spinner-size="15px" spinner-color="white" class="tableIcon"
                        :src="getClass(props.row.list[0].class_id).icon_url" />
                      {{`${getClass(props.row.list[0].class_id).name}`}}
                    </div>

                  </q-td>
                  <q-td key="runs" :props="props">{{props.row.runs}} ({{ Math.round(props.row.runs /props.row.truns *
                  10000)/ 100}}%)</q-td>
                  <q-td key="tscore" :props="props">{{Math.round(props.row.tscore)}} ({{props.row.pscore}}%)</q-td>
                  <q-td key="ascore" :props="props">{{props.row.ascore}}</q-td>
                  <q-td key="intime_rate" :props="props">
                    <div v-if="getIntimeData(props.row.id)">
                      {{Math.round(getIntimeData(props.row.id).ontime_percent*10)/10}}%
                      <template v-if="[3,4,8,9].filter(x=> x === props.row.list[0].class_id).length === 0">
                        <q-tooltip>Success rate is generated separately. This is for all roles. Runs:
                          {{getIntimeData(props.row.id).total_runs}}</q-tooltip>
                        <i class="material-icons">info</i>
                      </template>
                    </div>
                    <q-spinner-bars v-else-if="fetching" size="15" />
                    <div v-else>
                      <i class="material-icons">warning</i>
                      <q-tooltip>Success rate is generated separately. Could not get the data</q-tooltip>
                    </div>
                  </q-td>
                </q-tr>
                <q-tr class="hideHover" v-if="props.expand" :props="props">
                  <q-td colspan="100%">
                    <q-table :rows-per-page-options="[]" card-class="background HeaderFont" table-class="HeaderFont"
                      table-header-class="HeaderFont" dark dense flat :rows="props.row.list" :columns="specColumns"
                      :pagination.sync="specPaginationControl" hide-bottom row-key="spec">
                      <template v-slot:body="props">
                        <q-tr :props="props">
                          <q-td key="name" :props="props">
                            <div :style="`color: ${getClass(props.row.class_id).color};`">
                              <q-img spinner-size="15px" spinner-color="white" class="tableIcon"
                                :src="getSpec(props.row.spec).icon_url" />
                              {{`${getSpec(props.row.spec).name} ${getClass(props.row.class_id).name}`}}
                            </div>

                          </q-td>
                          <q-td key="runs" :props="props">{{props.row.runs}} ({{ Math.round(props.row.runs /
                          getTotalRuns(getRolelist(props.row.role,props.row.class_id).list) * 10000)/ 100}}%)</q-td>
                          <q-td key="tscore" :props="props">{{Math.round(props.row.score)}} ({{getscore(props.row.score,
                          "percent", getTotalScore(getRolelist(props.row.role,props.row.class_id).list),
                          props.row.runs )}}%)</q-td>
                          <q-td key="ascore" :props="props">{{getscore((props?.row?.score ?? 0), "mean", 0, props?.row?.runs ?? [] )}}
                          </q-td>

                        </q-tr>
                      </template>
                    </q-table>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-spinner-bars v-else class="absolute-center" style="color: rgb(161, 161, 161)" size="200" />

  </div>
</template>

<script lang="ts" setup>
import ClassViewer from "../ItemViews/ClassViewer.vue";
import axios from "axios";
import sf from "../../SharedFunctions";
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue"
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";

const props = defineProps({
  dungeon : {
    type : Number
  }
})

const { dungeon } = toRefs(props)
const store = useStore();
const data = store.state.data;

const GetSpecData = computed(x=>data.Spec_Data)
const GetSpecs = computed(() => data.Specs)
const GetClasses = computed(() => data.Classes)
const GetDungeonSpecData = store.getters.GetDungeonSpecData
const GetDungeonData = computed(() => data.Dungeons_Data)
const SelectedPeriode = computed(() => data.SelectedPeriode)
const GetSettings = computed(() => data.settings)


      let inTimeData = ref([])
      let fetching = ref(false)
      let error = ref(false)
      let runData = ref(null)

      let paginationControl = ref({
        rowsPerPage: 10,
        page: 1,
        sortBy: "role",
      })
      let classPaginationControl = ref({
        rowsPerPage: 12,
        page: 1,
        sortBy: "ascore",
        descending: true
      })
      let specPaginationControl = ref({
        rowsPerPage: 3,
        page: 1,
        sortBy: "ascore",
        descending: true
      })
      let roleColumns = ref([
        {
          name: "role",
          label: "",
          field: row => row.field,
          align: "left" as any
        }
      ])
      let classColumns = ref([
        {
          name: "view",
          label: "",
          align: "left" as any,
          field: row => row,
        },
        {
          name: "name",
          label: "Name",
          field: row => row.list[0].class.name,
          sortable: true,
          align: "left" as any,
        },
        {
          name: "runs",
          label: "Amount of runs",
          field: row => row.runs,
          sortable: true,
          align: "center" as any,
        },
        {
          name: "tscore",
          label: "Total Score",
          field: row => row.tscore,
          sortable: true,
          align: "center" as any,
        },
        {
          name: "ascore",
          label: "Average score",
          field: row => row.ascore,
          sortable: true,
          align: "center" as any,
        },

        {
          name: "intime_rate",
          label: "Success rate",
          field: row => getIntimeData(row.id)?.ontime_percent || 0,
          sortable: true,
          align: "center" as any,
        }
      ])
      let specColumns = ref([
        {
          name: "name",
          label: "Name",
          field: row => `${row.details.name} ${row.class.name}`,
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
          field: row => row.score,
          sortable: true,
          align: "center"
        },
        {
          name: "ascore",
          label: "Average score",
          field: row => getscore(row.score, "mean", 0, row.runs) || 0,
          sortable: true,
          align: "center"
        },

      ])

      watch(GetSpecData, () => { 
        setData();
    })

    watch(SelectedPeriode, ()=> {
      runData.value = null;
      error.value = false;
      fetchIntimeData();
    })

    watch(GetDungeonSpecData, ()=> {     
      setData();
    })


const fetchSpecData = (x) => store.dispatch("fetchSpecData",x);

    const getIntimeData = (id) => {
      if (inTimeData?.value) {
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
      var item = sf.groupBy(GetSpecData.value.data, "role");
      if (dungeon.value) {
        var filter = GetDungeonSpecData.filter(x => 
          x.dungeon === dungeon.value && 
          SelectedPeriode.value === x.periode && 
          x.created > state.value.Reloaded_Timestamp
        )
        
        item = sf.groupBy(sf._sortBy(filter, 'created').reverse()[0]?.data, 'role')
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
        var groupedLS = sf.groupBy(role.list, "class_id");
        for (var classID in groupedLS) {
          var m : any = {
            id: classID,
            list: groupedLS[classID],
            tscore: 0,
            ascore: 0,
            pscore: 0,
            runs: 0
          };
          for (let p = 0; p < groupedLS[classID].length; p++) {
            const spec = groupedLS[classID][p];
            m.tscore += spec.score;
            m.runs += spec.runs;
          }
          m.truns = getTotalRuns(role.list);

          m.ascore = getscore(
            m.tscore,
            "mean",
            getTotalScore(role.list),
            m.runs
          );
          m.pscore = getscore(
            m.tscore,
            "percent",
            getTotalScore(role.list),
            m.runs
          );
          ls2.push(m);
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
          "/Class/ontimerate?periode=" +
          SelectedPeriode.value +
          "&min_level=" +
          GetSettings.value.min_keystonelevel +
          "&amount=" +
          GetSettings.value.max_runs +
          "&limitToLowestDungeon=" +
          GetSettings.value.limitbylowestdungeon
        )
        .then(function (response) {
          inTimeData.value = response.data;
          fetching.value = false;
        })
        .catch(function (error) {
          console.log(error);
          error.value = true;
          fetching.value = false;
        });
    }

    const getscore = (score, type, procentTotal, runs) => {
      return sf.GetPoints(score, type, procentTotal, runs);
    }
    const getTotalRuns = (ls) => {
      var runs = 0;
      for (let i = 0; i < ls.length; i++) {
        const item = ls[i];
        runs += item.runs;
      }
      return runs;
    }

    const getTotalScore = (ls) => {
      var score = 0;
      for (let i = 0; i < ls.length; i++) {
        const item = ls[i];
        score += item.score;
      }
      return score;
    }

    const getRolelist = (role, class_id) => {
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
      if (GetClasses.value) {
        for (let i = 0; i < GetClasses.value.length; i++) {
          const _class = GetClasses.value[i];
          if (_class.id == id) {
            return _class
          }
        }
      }
    }

    const getSpec = (id) => {
      if (GetSpecs.value) {
        for (let i = 0; i < GetSpecs.value.length; i++) {
          const spec = GetSpecs.value[i];
          if (spec.id == id) {
            return spec
          }
        }
      }
    }



    const visibleColumns = computed(() => {
      var ls = ['view', 'name', 'runs', 'tscore', 'ascore']
      if (!dungeon.value) {
        ls.push('intime_rate')
      }
      return ls
    })

    const state = computed(()=> {
      return data;
    })
    const ownPage = location.pathname == "/classes";

onBeforeMount(() => { 
  if (dungeon.value) {    
      fetchSpecData({ id: dungeon.value });
    } else {
      if (GetSpecData.value) {
        setData();
      } else {
        fetchSpecData(undefined)
      }
      if (SelectedPeriode.value) {
        fetchIntimeData();
      }
    }

})

</script>
<style scoped>
#Main {
  min-height: 618px;
  position: relative;
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
