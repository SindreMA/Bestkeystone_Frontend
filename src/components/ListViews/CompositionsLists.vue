<template>
  <div ref="CompMainWindow">
    <q-resize-observer @resize="CComboSize()" />

<div class="HeaderFontv2 background hideScroll">
    <q-tabs v-model="type"  animated swipeable color="3a3a3a" align="justify">
      <q-tab default :name="1"  label="Team" />
      <q-tab :name="2"  label="Healer & Tank" />
      <q-tab :name="3"  label="DPS" />
    </q-tabs>

      <div>
        <q-tab-panels v-model="type" class="background" animated>

      <q-tab-panel :name="1">
        <ClassFilter @SpecChange="RegisterSpecChange($event)" :type="type"></ClassFilter>
        <div v-if="data && data.type == type">
        <div id="CompositionListTeam" ref="CompoItems">
          <div class="flex flex-center" v-for="comp in data.comps" :key="Math.random() + comp.score">
            <div class="CompoItem flex" style="margin-top: 15px;">
              <div class="CompoItemInfo relative-position">
                <div class="absolute-left">
                  <div class="center" style="margin-left: 27px;">
                    <div id="CompoItemRank" class="Centertext flex flex-center">{{comp.rank}}</div>
                  </div>
                </div>
                <div id="CompoItemScore" class="Centertext flex flex-center">Score: {{GetPoints(comp.score, comp.runs)}} <div v-if="Settings.score_type == 'percent'">%</div></div>
                <div id="CompoItemRuns" class="Centertext flex flex-center">Runs: {{comp.runs}}</div>
              </div>
              <div class="ComboShower" :style="'width: ' + ComboSize + 'px;'">
                <DpsSetViewer type="2" :SpecFilter="SpecFilter" :setup="comp.setup"></DpsSetViewer>
                <DpsSetViewer type="3" :SpecFilter="SpecFilter" :setup="comp.setup"></DpsSetViewer>
              </div>
            </div>
          </div>
        </div>
        </div>
      </q-tab-panel>

      <q-tab-panel :name="2">
                <ClassFilter class="hideScroll" @SpecChange="RegisterSpecChange($event)" :type="type"></ClassFilter>
                <div v-if="data && data.type == type">
        <div id="CompositionListTeam" ref="CompoItems">
          <div class="flex flex-center" v-for="comp in data.comps" :key="Math.random() + comp.score">
            <div class="CompoItem flex" style="margin-top: 15px;">
              <div class="CompoItemInfoTop relative-position">
                <div class="flex flex-start Centertext">
                  <div id="CompoItemRankTop" class="Centertext flex flex-center">{{comp.rank}}</div>
                  <div id="CompoItemScoreTop" class="Centertext flex flex-center">Score: {{GetPoints(comp.score, comp.runs)}} <div v-if="Settings.score_type == 'percent'">%</div></div>
                  <div id="CompoItemRunsTop" class="Centertext flex flex-center">Runs: {{comp.runs}}</div>
                </div>
              </div>
              <div class="ComboShowerTop" :style="'width: ' + ComboSizeTop + 'px;'">
                <DpsSetViewer type="2" :SpecFilter="SpecFilter" :setup="comp.setup"></DpsSetViewer>
              </div>
            </div>
          </div>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel  :name="3">
        <ClassFilter @SpecChange="RegisterSpecChange($event)" :type="type"></ClassFilter>
        <div v-if="data && data.type == type">
        <div id="CompositionListTeam" ref="CompoItems">
          <div class="flex flex-center" v-for="comp in data.comps" :key="Math.random() + comp.score">
            <div class="CompoItem flex" style="margin-top: 15px;">
              <div class="CompoItemInfoTop relative-position">
                <div class="flex flex-start Centertext">
                  <div id="CompoItemRankTop" class="Centertext flex flex-center">{{comp.rank}}</div>
                  <div id="CompoItemScoreTop" class="Centertext flex flex-center">Score: {{GetPoints(comp.score, comp.runs)}} <div v-if="Settings.score_type == 'percent'">%</div></div>
                  <div id="CompoItemRunsTop" class="Centertext flex flex-center">Runs: {{comp.runs}}</div>
                </div>
              </div>
              <div class="ComboShowerTop" :style="'width: ' + ComboSizeTop + 'px;'">
                <DpsSetViewer type="3" :SpecFilter="SpecFilter" :setup="comp.setup"></DpsSetViewer>
              </div>
            </div>
          </div>
          </div>
        </div>
      </q-tab-panel>
              </q-tab-panels>

      <div v-if="data" class="HeaderFont">
        <div class="HeaderFont Centertext" v-if="data && data.comps.length == 0"><h3>There are no composition data for your request</h3></div>
        <q-pagination class="flex flex-center" v-model="from" color="grey" :min="1" :max="Math.ceil(data.query_results / 5)" :max-pages="6" direction-links />
      </div>
      </div>
</div>

    <div class="flex flex-center " v-if="fetchingData"><q-spinner-puff style="color: rgb(161, 161, 161)" :size="500" /></div>
    <div v-if="request_failed"><h3>API Request failed!</h3></div>

      <div class="HeaderFont Centertext no-margin" v-if="data">
        <div style="font-size:12px;">Data generated {{timeago(data.generated_timestamp)}}</div>
        <div style="font-size:9px;">("Amount of runs" is the only setting that affect composition data)</div>
      </div>
  </div>
</template>
<script>
  import axios from 'axios'
  import ClassFilter from '../Filters/ClassFilter.vue';
  import DpsSetViewer from '../ItemViews/DpsSetViewer.vue';
import { mapActions, mapGetters } from 'vuex';
import sf from '../../SharedFunctions'


  export default {
    props: ['dungeon'],
    data() {
      return {
        data: null,
        ComboSize: 700,
        ComboSizeTop: 900,
        from: 1,
        SpecFilter: null,
        type: 1,
        request_failed: false,
        fetchingData: false,
        tab: 'Team'
      }
    },
    watch: {
      SelectedPeriode() {
        this.DataChange()

      },
      type() {
      this.SpecFilter = ''

        if (this.from === 1) {

          this.DataChange()

        }
        this.from = 1

      },
      from () {
        this.DataChange()
      }

    },
    computed: {
    ...mapGetters(['SelectedPeriode']),
      ownPage() {
        return this.$route.path == "/compositions"
      },
      Settings() {
          return this.$store.state.data.settings;
      },
    },
    methods: {
      timeago(time) {
        return sf.TimeFromNow(time)
      },
      DataChange() {
        this.request_failed = false
        this.data = null
        this.GetPage();

      },
      GetPoints(points, runs) {
        return sf.GetPoints(points, this.Settings.score_type, this.data.total_score,runs)
      },
      RegisterSpecChange(specString) {
        this.SpecFilter = specString
        this.DataChange();
        this.from = 1
      },
      GetPage() {
        var periode = this.SelectedPeriode?.id;
        if (!periode) return null;
        var runs = this.Settings.max_runs;
        var from = (this.from - 1 )* 5;
        var type = this.type;
        var amount = 5;
        var vm = this;
        var apiUrl = this.$store.state.data.apiUrl;
        var apiRequest = apiUrl + '/Composition?periode='+periode+'&runs='+runs+'&from='+from+'&amount='+amount+'&type='+type
        if (this.dungeon) apiRequest += '&dungeon=' + this.dungeon
        if (this.SpecFilter) apiRequest += this.SpecFilter
        this.fetchingData = true
        axios.get(apiRequest)
          .then(function (response) {
            vm.data = response.data
            vm.fetchingData = false
          })
          .catch(function (error) {
            console.log(error);
            vm.request_failed = true
            vm.fetchingData = false
          })
      },
      CComboSize() {
        if (this.$refs.CompMainWindow) {

          var s = this.$refs.CompMainWindow.clientWidth
          if (s < 700) {
            s += 205;
          } else {
            s -= 240
          }
          this.ComboSize = s
          return s
        } else {
          this.ComboSize = 700
          return 700
        }
      },
      CComboSizeTop() {
        if (this.$refs.CompoItems) {
          var s = this.$refs.CompoItems.clientWidth
          return s
        } else {
          return 900
        }
      },
      AddRole(list, role) {
        if (list) {
          list.forEach(item => {
            item.specRole = role
          });
        }
        return list
      },
      CombindList(list1, list2) {
        var ls = []
        if (list1 && list2) {
          list1.forEach(element => {
            element.specRole = 'tank'
            ls.push(element)
          });
          list2.forEach(element => {

            element.specRole = 'healer'
            ls.push(element)
          });
        }
        return ls
      }
    },
    created() {
      this.GetPage();
    },
    components: {
      DpsSetViewer,
      ClassFilter
    }
  }

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
    content: url("https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/roles/dps.png");
  }
  .hideScroll {
    overflow: hidden;
  }
.Centertext {
  text-align: center;
}
</style>
