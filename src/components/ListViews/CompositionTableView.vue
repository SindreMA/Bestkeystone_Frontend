<template>
  <div ref="CompMainWindow">
    <q-resize-observer @resize="CComboSize()" />
    <div class="HeaderFontv2 background hideScroll">
      <q-tabs v-model="type" animated swipeable color="3a3a3a" align="justify">
        <q-tab default :name="1" label="Team" />
        <q-tab :name="2" label="Healer & Tank" />
        <q-tab :name="3" label="DPS" />
      </q-tabs>

      <div>
        <q-tab-panels v-model="type" class="background" animated>
          <q-tab-panel :name="1">
            <ClassFilter @SpecChange="RegisterSpecChange($event)" :type="type"></ClassFilter>
            <div v-if="data && data.type == type">
              <q-table
                :rows-per-page-options="[12, 25,50,100]"
                card-class="background HeaderFont"
                table-class="HeaderFont"
                table-header-class="HeaderFont"
                dark
                flat
                dense
                :rows="data.comps"
                :columns="Columns"
                :pagination.sync="paginationControl"
                row-key="setup"
                :visible-columns="visibleColumns(1)"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td
                      v-for="(roles) in splitSetup(props.row.setup)"
                      :key="roles[0]?.role?.toLowerCase()"
                      :props="props"
                    >
                      <div class="flex justify-between">
                        <div
                          v-for="(item, index) in roles"
                          :key="index"
                          class="flex"
                        >
                        <CloudinaryFormat :url="`roles/${roles[0].role.toLowerCase()}.png`" v-slot="{ link }">
                          <q-img
                            spinner-size="15px"
                            class="tableRoleIcon"
                            :src="link"
                            spinner-color="white"
                          />
                        </CloudinaryFormat>
                          <ClassTextColor :_class="item?.class"  >{{item.name}}</ClassTextColor>

                          <q-tooltip>{{item.name}} {{getClass(item.class).name}}</q-tooltip>
                        </div>
                      </div>
                    </q-td>
                    <q-td
                      key="runs"
                      :props="props"
                    >{{props.row.runs}} ({{ Math.round(props.row.pruns*100)/100}}%)</q-td>
                    <q-td key="tscore" :props="props">{{Math.round(props.row.tscore)}} ({{props.row.pscore}}%)</q-td>
                    <q-td key="ascore" :props="props">{{props.row.ascore}}</q-td>
                    <q-td v-if="props.row.success_rate" key="intime_rate" :props="props">{{Math.round(props.row.success_rate*100)/100}}%</q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-tab-panel>

          <q-tab-panel :name="2">
            <ClassFilter class="hideScroll" @SpecChange="RegisterSpecChange($event)" :type="type"></ClassFilter>
            <div v-if="data && data.type == type">
              <q-table
                :rows-per-page-options="[12, 25,50,100]"
                card-class="background HeaderFont"
                table-class="HeaderFont"
                table-header-class="HeaderFont"
                dark
                dense
                :rows="data.comps"
                :columns="Columns"
                :pagination.sync="paginationControl"
                row-key="setup"
                :visible-columns="visibleColumns(2)"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td
                      v-for="(roles) in splitSetup(props.row.setup)"
                      :key="roles[0]?.role?.toLowerCase()"
                      :props="props"
                    >
                      <div class="flex justify-between">
                        <div
                          v-for="(item, index) in roles"
                          :style="`color: ${getClass(item.class).color}`"
                          :key="index"
                          class="flex"
                        >
                        <CloudinaryFormat :url="`roles/${roles[0].role.toLowerCase()}.png`" v-slot="{ link }">
                          <q-img
                            spinner-size="15px"
                            class="tableRoleIcon"
                            :src="link"
                            spinner-color="white"
                          />
                        </CloudinaryFormat>
                        <ClassTextColor :_class="item?.class"  >{{item.name}}</ClassTextColor>
                          <q-tooltip>{{item.name}} {{getClass(item.class).name}}</q-tooltip>
                        </div>
                      </div>
                    </q-td>
                    <q-td
                      key="runs"
                      :props="props"
                    >{{props.row.runs}} ({{ Math.round(props.row.pruns*100)/100}}%)</q-td>
                    <q-td key="tscore" :props="props">{{Math.round(props.row.tscore)}} ({{props.row.pscore}}%)</q-td>
                    <q-td key="ascore" :props="props">{{props.row.ascore}}</q-td>
                    <q-td v-if="props.row.success_rate" key="intime_rate" :props="props">{{Math.round(props.row.success_rate*100)/100}}%</q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-tab-panel>

          <q-tab-panel :name="3">
            <ClassFilter @SpecChange="RegisterSpecChange($event)" :type="type"></ClassFilter>
            <div v-if="data && data.type == type">
              <q-table
                :rows-per-page-options="[12, 25,50,100]"
                card-class="background HeaderFont"
                table-class="HeaderFont"
                table-header-class="HeaderFont"
                dark
                dense
                :rows="data.comps"
                :columns="Columns"
                :pagination.sync="paginationControl"
                row-key="setup"
                :visible-columns="visibleColumns(3)"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td
                      v-for="(roles) in splitSetup(props.row.setup)"
                      :key="roles[0]?.role?.toLowerCase()"
                      :props="props"
                    >
                      <div class="flex justify-between">
                        <div
                          v-for="(item, index) in roles"
                          :style="`color: ${getClass(item.class).color}`"
                          :key="index"
                          class="flex"
                        >
                        <CloudinaryFormat :url="`roles/${roles[0].role.toLowerCase()}.png`" v-slot="{ link }">
                          <q-img
                            spinner-size="15px"
                            class="tableRoleIcon"
                            :src="link"
                            spinner-color="white"
                          />
                        </CloudinaryFormat>
                        <ClassTextColor :_class="item?.class"  >{{item.name}}</ClassTextColor>
                          <q-tooltip>{{item.name}} {{getClass(item.class).name}}</q-tooltip>
                        </div>
                      </div>
                    </q-td>
                    <q-td
                      key="runs"
                      :props="props"
                    >{{props.row.runs}} ({{ Math.round(props.row.pruns*100)/100}}%)</q-td>
                    <q-td key="tscore" :props="props">{{Math.round(props.row.tscore)}} ({{props.row.pscore}}%)</q-td>
                    <q-td key="ascore" :props="props">{{props.row.ascore}}</q-td>
                    <q-td v-if="props.row.success_rate" key="intime_rate" :props="props">{{Math.round(props.row.success_rate*100)/100}}%</q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <div class="flex flex-center" v-if="fetchingData">
        <q-spinner-puff style="color: rgb(161, 161, 161)" size="500" />
      </div>
      <div v-if="request_failed">
        <h3>API Request failed!</h3>
      </div>

      <div class="HeaderFont Centertext no-margin" v-if="data">
        <div style="font-size:12px;">Data generated {{timeago(data.generated_timestamp)}}</div>
        <div
          style="font-size:9px;"
        >("Amount of runs" is the only setting that affect composition data)</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import axios from "axios";
import ClassFilter from "../Filters/ClassFilter.vue";
import DpsSetViewer from "../ItemViews/DpsSetViewer.vue";
import sf from "../../SharedFunctions";
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";
import ClassTextColor from "components/containers/classTextColor.vue"

const props = defineProps({
  dungeon: {
  },
})

const { dungeon } = toRefs(props)
      let paginationControl = ref({
        rowsPerPage: 12,
        page: 1,
        sortBy: "tscore",
        descending: true
      })
      const Columns = ref([
        {
          name: "tank",
          label: "Tank",
          align: "left"
        },
        {
          name: "healer",
          label: "Healer",
          align: "left"
        },
        {
          name: "damage",
          label: "Damage",
          align: "left"
        },
        {
          name: "runs",
          label: "Runs",
          field: row => row.runs,
          sortable: true,
          align: "center"
        },
        {
          name: "tscore",
          label: "Score",
          field: row => row.tscore,

          sortable: true,
          align: "center"
        },
        {
          name: "ascore",
          label: "Avg score",
          field: row => row.ascore,
          sort: (a, b, rowA, rowB) => rowA.ascore - rowB.ascore,
          sortable: true,
          align: "center"
        },{
              name: "intime_rate",
              label: "Success rate",
              field: row => row.success_rate,
              sortable: true,
              align: "center",
              }
      ])

      let data = ref(null)
      let ComboSize = ref(700)
      let ComboSizeTop = ref(900)
      let from = ref(1)
      let SpecFilter = ref(null)
      let type = ref(1)
      let request_failed = ref(false)
      let fetchingData = ref(false)
      let tab = ref("Team")

const store = useStore()
const state = store.state.data

const SelectedPeriode = computed(()=> state.SelectedPeriode)
const GetSpecs = computed(()=> state.Specs)
const GetClasses = computed(()=> state.Classes)
const Settings = computed(()=> state.settings)

watch(SelectedPeriode, () => {
  DataChange();
})

  watch(type, ()=>  {
      SpecFilter.value = "";

      if (from.value === 1) {
        DataChange();
      }
      from.value = 1;
    })

    watch(from, ()=> {
      DataChange();
    })

    const ownPage = location.pathname == "/compositions";


    const visibleColumns = (type) => {
      var ls = ['runs','tscore','ascore']
      if (type == 1) {
        ls.push('tank')
        ls.push('healer')
        ls.push('damage')
      } else if (type == 2) {
        ls.push('tank')
        ls.push('healer')
      } else if (type == 3) {
        ls.push('damage')
      }

      if (data.value.comps && data.value.comps.length != 0) {
        if (data.value.comps[0].success_rate) {
          ls.push('intime_rate')
        }
      }
      return ls
    }

    const splitSetup = (setup) => {
      var ls = [];
      if (setup) {
        var roleGroups = setup.split("-");
        for (let i = 0; i < roleGroups.length; i++) {
          const roleGroup = roleGroups[i].replace("[", "").replace("]", "");
          var specs = [];
          if (roleGroup.includes(",")) {
            var specStrings = roleGroup.split(",");
            for (let o = 0; o < specStrings.length; o++) {
              const spec = specStrings[o];
              specs.push(getSpec(spec));
            }
          } else {
            specs.push(getSpec(roleGroup));
          }
          ls.push(specs);
        }
      }
      return ls;
    }

    const timeago = (time) => sf.TimeFromNow(time);

    const DataChange = () => {
      request_failed.value = false;
      data.value = null;
      GetPage();
    }
    const GetPoints = (points, runs) => {
      return sf.GetPoints(
        points,
        Settings.value.score_type,
        data.value.total_score,
        runs
      );
    }

    const RegisterSpecChange = (specString) => {
      SpecFilter.value = specString;
      DataChange();
      from.value = 1;
    }

    const getscore = (score, type, procentTotal, runs) => sf.GetPoints(score, type, procentTotal, runs);

    const GetPage = () => {
      var periode = SelectedPeriode.value;
      if (!periode) return;

      var runs = Settings.value.max_runs;
      var from = 0;
      var _type = type.value;
      var amount = 5000;

      var apiUrl =state.apiUrl;
      var apiRequest =
        apiUrl +
        "/Composition?periode=" +
        periode +
        "&runs=" +
        runs +
        "&from=" +
        from +
        "&amount=" +
        amount +
        "&type=" +
        _type;
      if (dungeon.value) apiRequest += "&dungeon=" + dungeon.value;
      if (SpecFilter.value) apiRequest += SpecFilter.value;
      fetchingData.value = true;
      axios
        .get(apiRequest)
        .then(function(response) {
          var returnData = response.data;
          var totalScore = 0;
          var allRuns = 0;
          var showSuccessRate = false
          response.data.comps.forEach(comp => {
            totalScore += comp.score;
            allRuns += comp.runs;
            if (comp.success_rate) {
              showSuccessRate = true
            }
          });
          response.data.comps.forEach(comp => {
            comp.pruns = (comp.runs / allRuns) * 100;
            comp.tscore = comp.score;
            comp.ascore = getscore(comp.tscore, "mean", 0, comp.runs);
            comp.pscore = getscore(comp.tscore,"percent",totalScore,comp.runs);
          });


          data.value = returnData;
          fetchingData.value = false;
        })
        .catch(function(error) {
          console.log(error);
          request_failed.value = true;
          fetchingData.value = false;
        });
    }

    const CompMainWindow = ref(null)
    const CompoItems = ref(null)


    const CComboSize = () => {
      if (CompMainWindow.value) {
        var s = CompMainWindow.value.clientWidth;
        if (s < 700) {
          s += 205;
        } else {
          s -= 240;
        }
        ComboSize.value = s;
        return s;
      } else {
        ComboSize.value = 700;
        return 700;
      }
    }
    const CComboSizeTop = () => {
      if (CompoItems) {
        var s = CompoItems.clientWidth;
        return s;
      } else {
        return 900;
      }
    }

    const AddRole = (list, role) => {
      if (list) {
        list.forEach(item => {
          item.specRole = role;
        });
      }
      return list;
    }

    const getClass = (id) => {
      if (GetClasses.value) {
        for (let i = 0; i < GetClasses.value.length; i++) {
          const _class = GetClasses.value[i];
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

    const CombindList = (list1, list2) => {
      var ls = [];
      if (list1 && list2) {
        list1.forEach(element => {
          element.specRole = "tank";
          ls.push(element);
        });
        list2.forEach(element => {
          element.specRole = "healer";
          ls.push(element);
        });
      }
      return ls;
    }

onBeforeMount(() => {
    GetPage();
});

</script>
<style scoped>
#CompoItemScore {
  width: 110px;
  height: 30px;
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
  position: relative;
  left: 80px;
  top: 8px;
}

#CompoItemScoreTop {
  position: relative;
  top: 4px;
  width: 110px;
  height: 30px;
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
  margin: 0 5px;
}

#CompoItemRuns {
  width: 110px;
  height: 30px;
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
  position: relative;
  left: 80px;
  top: 15px;
}

#CompoItemRunsTop {
  position: relative;
  top: 4px;
  width: 110px;
  height: 30px;
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
  margin: 0 5px;
}

#CompoItemRank {
  top: 20px;
  position: relative;
  width: 35px;
  height: 35px;
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
}

#CompoItemRankTop {
  top: 4px;
  margin: 0 5px;
  position: relative;
  width: 30px;
  height: 30px;
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
}

.CompoItemInfo {
  width: 200px;
  height: 78px;
}

.CompoItemInfoTop {
  width: 100%;
  height: 40px;
}

.CompoItem {
  max-width: 900px;
  min-width: 300px;
  background-color: #323232;
  border-radius: 20px;
}

.ComboShower {
  max-width: 700px;
  background-color: #3d3d3d;
  border-radius: 25px 25px 25px 25px;
}

.ComboShowerTop {
  max-width: 900px;
  background-color: #3d3d3d;
  border-radius: 25px 25px 25px 25px;
}

.fa-facebook:before {
  content: url("/statics/roles/dps.png");
}
.hideScroll {
  overflow: hidden;
}
.Centertext {
  text-align: center;
}
.tableRoleIcon {
  width: 19px;
  height: 19px;
}
</style>
