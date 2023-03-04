<template>
  <div :class="{ Box: runs }">
    <div v-if="show">
      <div v-if="runs" :class="{ Header: runs }" class="HeaderSize4">
        Level statistics
      </div>
      <div>
        <div>
          <div v-if="!runs">
            <div>Selected weeks</div>
            <div class="flex justify-around">
              <div>From: {{ weekRange.min }} ({{ setNameMin }})</div>
              <div>To: {{ weekRange.max }} ({{ setNameMax }})</div>
            </div>
            <div class="flex justify-center">
              <q-range
                drag-range
                snap
                markers
                v-model="weekRange"
                :min="wRangeOptions.min"
                style="max-width: 970px"
                :max="wRangeOptions.max"
                :step="1"
              />
            </div>
          </div>
        </div>
        <div>
          <div v-if="!runs">Selected levels</div>
          <div class="flex justify-around">
            <div>From level {{ levelRange.min }}</div>
            <div>To level {{ levelRange.max }}</div>
          </div>
          <div class="flex justify-center">
            <q-range
              drag-range
              snap
              markers
              v-model:model-value="levelRange"
              :min="lRangeOptions.min"
              :max="lRangeOptions.max"
              :step="1"
              style="max-width: 970px"
            />
          </div>
        </div>
      </div>
      <apexchart
        v-if="successSeries"
        width="100%"
        height="400px"
        type="line"
        :options="s_chartOptions"
        :series="successSeries"
      ></apexchart>
      <apexchart
        v-if="runsSeries"
        width="100%"
        height="400px"
        type="line"
        :options="r_chartOptions"
        :series="runsSeries"
      ></apexchart>
    </div>
  </div>
</template>
<script lang="ts" setup>
import axios from "axios";
import moment from "moment";
import SF from "../../SharedFunctions";
import affix from '../Icons/Affix/index.vue'
import apexchart from 'vue3-apexcharts'
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";

const props = defineProps({
  runs: {
    type: Array<any>,
  }
})

const { runs } = toRefs(props)

const store = useStore()
const _data = store.state.data

const GetPeriodes = computed(() => _data.Periodes)
const GetAffixes = computed(() => _data.Affixes)
const GetSettings = computed(() => _data.settings)
const show = computed(()=>  {
      return (
        GetPeriodes.value &&
        GetAffixes.value &&
        data.value &&
        levelRange.value &&
        lRangeOptions.value
      );
    })

const setNameMax = ref(null)
const setNameMin = ref(null)
const bounce = ref(null)
const bounce2 = ref(null)
const wRangeOptions = ref(null)
const lRangeOptions = ref(null)
const weekRange = ref(null)
const levelRange = ref(null)
const data = ref(null)
const runsSeries = ref(null)
const successSeries = ref(null)
const score = ref(null)

const emits = defineEmits(['fetch'])


const s_chartOptions = ref({
        chart: {
          foreColor: "#a1a1a1"
        },
        yaxis: {
          type: "numeric",
          labels: {
            formatter: function(value, timestamp, index) {
              return value + "%";
            }
          },
          title: {
            text: "Success rate"
          }
        },
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function(value, timestamp, index) {
              return Math.round(value);
            }
          },
          title: {
            text: "Keystone level"
          }
        }
      })
const r_chartOptions = ref({
        chart: {
          foreColor: "#a1a1a1"
        },
        yaxis: {
          title: {
            text: "Amount of runs"
          }
        },
        xaxis: {
          type: "numeric",
          labels: {
            formatter: function(value, timestamp, index) {
              return Math.round(value);
            }
          },
          title: {
            text: "Keystone level"
          }
        }
      })

const GetAffixSetName = (affixes) => {
      if (affixes) {
        var ls = [];
        for (let i = 0; i < affixes.length; i++) {
          const element = affixes[i];
          var affix = GetAffixdetails(element);

          if (affix) {
            ls.push(affix.name);
          }
        }
        return ls.join(", ");
      }
    }

const GetPeriodeDetails = (id, callback) => {
      var apiUrl = data.apiUrl;
      var Found = false;
      if (runs.value) {
        var periodeRuns = SF.groupBy(runs.value, "periode");
        for (const periode in periodeRuns) {
          if (periodeRuns.hasOwnProperty(periode) && periode == id) {
            const runs = periodeRuns[periode];
            var run = runs[0];
            var item = {
              id: periode,
              start_timestamp: 0,
              end_timestamp: 0,
              affixes: run.affixes
            };
            Found = true;
            return callback(item);
          }
        }
      } else {
        for (let i = 0; i < GetPeriodes.value.length; i++) {
          const periode = GetPeriodes.value[i];
          if (periode.id == id) {
            Found = true;
            return callback(periode);
          }
        }
      }
      if (!Found) {
        axios.get(`${apiUrl}/Periode/id?Period=${id}`).then(x => {
          return callback(x.data);
        });
      }
    }

    const GetWeekLevelItem = (i, levels) => {
      for (let o = 0; o < levels.length; o++) {
        const level = levels[o];
        if (level.level == i) {
          return level;
        }
      }
      return {
        runs: 0,
        success_rate: 0
      };
    }

const genData = () => {
      if (runs.value) {
      ConvertData();
    } else {
      if (GetPeriodes.value) {
        wRangeOptions.value = {
          min: GetPeriodes.value[0].id - GetPeriodes.value.length + 1,
          max: GetPeriodes.value[0].id
        };
        weekRange.value = {
          min: GetPeriodes.value[0].id - 2,
          max: GetPeriodes.value[0].id
        };
        GatherData();
      }
    }
    }

    const generateSeries = () => {
      if (data.value) {
        var allSeries_success_rate = [];
        var allSeries_runs = [];

        for (let i = 0; i < data.value.length; i++) {
          const week = data.value[i];
          var s_data = [];
          var r_data = [];

          for (let o = 0; o < week.length; o++) {
            const level = week[o];
            if (
              level.level >= levelRange.value.min &&
              level.level <= levelRange.value.max
            ) {
              s_data.push([
                level.level,
                Math.round(level.success_rate * 10) / 10
              ]);
              r_data.push([level.level, level.runs]);
            }
          }
         if (runs.value) {
           GetPeriodeDetails(week[0].periode, details => {
            var s_serie = {
              name:'',
              data: s_data
            };
            var r_serie = {
              name:'',
              data: r_data
            };
            allSeries_success_rate.push(s_serie);
            allSeries_runs.push(r_serie);

            successSeries.value = allSeries_success_rate;
            runsSeries.value = allSeries_runs;
          });
         } else {
          GetPeriodeDetails(week[0].periode, details => {
            var s_serie = {
              name:
                GetAffixdetails(details.affixes[0]).name +
                ", " +
                GetAffixdetails(details.affixes[1]).name +
                ", " +
                GetAffixdetails(details.affixes[2]).name +
                ", " +
                GetAffixdetails(details.affixes[3]).name,
              data: s_data
            };
            var r_serie = {
              name:
                GetAffixdetails(details.affixes[0]).name +
                ", " +
                GetAffixdetails(details.affixes[1]).name +
                ", " +
                GetAffixdetails(details.affixes[2]).name +
                ", " +
                GetAffixdetails(details.affixes[3]).name,
              data: r_data
            };
            allSeries_success_rate.push(s_serie);
            allSeries_runs.push(r_serie);

            successSeries.value = allSeries_success_rate;
            runsSeries.value = allSeries_runs;
          });
         }
        }
      }
    }

    const ConvertData = () => {
      if (runs.value) {
        var pls = [];

            const q_runs = [...runs.value]
            var lvlLS = SF.groupBy(q_runs, "keystone_level");
            var lls = [];
            for (const level in lvlLS) {
              if (lvlLS.hasOwnProperty(level)) {
                const _runs = lvlLS[level];

                var item = {
                  level: _runs[0].keystone_level,
                  runs: _runs.length,
                  periode: _runs[0].periode,
                  score: 0,
                  success_rate:
                    (_runs.filter(x => x.time.map_time >= x.time.clear_time).length /
                      _runs.length) *
                    100
                };
                _runs.forEach(run => {
                  item.score += run.score;
                });
                lls.push(item);
              }
            }
            pls.push(lls);

        data.value = pls;

        var highest = 2;
        for (let i = 0; i < data.value.length; i++) {
          const week = data.value[i];
          for (let o = 0; o < week.length; o++) {
            const level = week[o];
            if (level.level > highest) {
              highest = level.level;
            }
          }
        }

  lRangeOptions.value = {
          min: 2,
          max: highest
        };
  levelRange.value = {
          min: 2,
          max: highest
        };
        generateSeries();
      }
    }

const GatherData = () => {
      var apiUrl = _data.apiUrl;
      console.log("Gathering data", apiUrl);


      if (GetPeriodes.value) {
        var bon = setTimeout(function() {
          if (bounce.value == bon) {
            axios
              .get(
                apiUrl +
                  "/Stats/LevelStats?fromperiode=" +
                  weekRange.value.min +
                  "&toperiode=" +
                  weekRange.value.max
              )
              .then(function(response) {
                data.value = response.data.map(x=> x.list);
                emits('fetch', response.data)
                var highest = 2;
                for (let i = 0; i < data.value.length; i++) {
                  const week = data.value[i];
                  for (let o = 0; o < week.length; o++) {
                    const level = week[o];
                    if (level.level > highest) {
                      highest = level.level;
                    }
                  }
                }

                lRangeOptions.value = {
                  min: 2,
                  max: highest
                };
                levelRange.value = {
                  min: 2,
                  max: highest
                };

                generateSeries();
              })
              .catch(function(ex) {
                console.log(ex);
                score.value = 0;
              });
          }
        }, 1000);
        bounce.value = bon;
      }
    }

    const GetAffixdetails = (id) => {
      if (GetAffixes.value) {
        for (let i = 0; i < GetAffixes.value.length; i++) {
          const affix = GetAffixes.value[i];
          if (affix.id === id) {
            return affix;
          }
        }
      }
    }

    const setWeekNames = () => {
      var vm = this
      if (weekRange.value) {
        GetPeriodeDetails(weekRange.value.min, x=> {
            setNameMin.value = GetAffixSetName(x.affixes)
          })
           GetPeriodeDetails(weekRange.value.max, x=> {
            setNameMax.value = GetAffixSetName(x.affixes)
          })
      }
    }

  watch(GetPeriodes, ()=> {
      genData();
    })
    watch(levelRange,()=> {
      if (weekRange.value && levelRange.value) {
        generateSeries();
      }
    })

    watch(weekRange,()=> {

        if (!runs.value) {
        if (weekRange.value && levelRange.value) {
          GatherData();
          setWeekNames();
        }
      }
    })

    watch(runs, ()=> {
      data.value = null;
      genData();
    })

onBeforeMount(() => {
    genData();
    setWeekNames();
  });
</script>
<style scoped>
.affixComboBox {
  border-radius: 10px;
  border: grey 1px solid;
  overflow: hidden;
  width: 52px;
  margin: 0 2px;
}
.affixComboBoxId {
  z-index: 100;
  border-radius: 10px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.719);
}
.Box {
  border: 1px solid #696969;
  position: relative;
}

.Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
}
</style>
