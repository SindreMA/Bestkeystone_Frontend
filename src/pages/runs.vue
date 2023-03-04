<template>
    <div class="flex-center Centertext HeaderFont">
        <RunsCompletedCount/>
        
        <FactionBar/>
        <br>
          <q-option-group
            color="secondary"
            type="checkbox"
            v-model="regions"
            inline
            :options="regionlist"
        />
        <vue-frappe
        :key="componentKey"
            id="ChartHours"
            :labels="getHourTimestamps"
            title="Keystone runs per hour"
            type="line"
            :height="300"
            :colors="['orange','blue','red','green','yellow']"
            :dataSets="getHourDataValues">
        </vue-frappe>
                <vue-frappe
        :key="componentKey + 2"
            id="ChartDays"
            :labels="getDayTimestamps"
            title="Keystone runs per day"
            type="line"
            :height="300"
            :colors="['orange','blue','red','green','yellow']"
            :dataSets="getDayDataValues">
        </vue-frappe>
<div>
  <br><br>
        <LevelStats @fetch="levelData = $event"/>
        <PerWeekChart :data="levelData" />
        <!--<ChestsChart/>-->
      </div>
    </div>
</template>
<script>
import LevelStats from '../components/ListViews/LevelStats'
import ChestsChart from '../components/ListViews/ChestsChart.vue'
import RunsCompletedCount from '../components/Pages/runs/RunsCompletedCount'
import PerWeekChart from '../components/Pages/runs/PerWeekChart'
import AffixSelector from '../components/ListViews/AffixSelector'
import FactionBar from '../components/ItemViews/FactionBar'
import {mapGetters} from 'vuex'
import axios from 'axios'
import sf from '../SharedFunctions'


export default {
  components:  {
    LevelStats,
    AffixSelector,
    RunsCompletedCount,
    ChestsChart,
    PerWeekChart,
    FactionBar
  },
     data () {
            return {
                levelData: null,
                componentKey: 0,
                request_failed: false,
                fetchingData: false,
                regions: ['world'],
                RunsLast24Hour: [],
                HoursToShow: 24,

                RunsLast7Days: [],
                regionlist: [
                { label: 'World', value: 'world' },
                { label: 'USA', value: 'us' },
                { label: 'Europa', value: 'eu' },
                { label: 'Taiwan', value: 'tw' },
                { label: 'Korea', value: 'kr' }
            ]
            }
        },
        computed: {
            ...mapGetters(['GetSettings']),
            getHourDataValues() {
                var ls = []
                this.RunsLast24Hour.forEach(element => {
                    var _ls = []
                    sf._sortBy(element.data,'time').slice(Math.max(element.data.length - this.HoursToShow, 1)).forEach(record => {
                        _ls.push(record.value)
                    });

                    var regionName = element.region

                    for (let i = 0; i < this.regionlist.length; i++) {
                        const region = this.regionlist[i];
                        if (region.value == element.region) {
                            regionName = region.label
                        }
                    }

                    var item = {
                        name: regionName,
                        chartType: 'line',
                        values: _ls
                        }
                    ls.push(item)
                });
                return ls

            },
            getHourTimestamps() {
                var ls = []
                if (this.RunsLast24Hour[0] != undefined){
                    var first = this.RunsLast24Hour[0]
                    sf._sortBy(first.data,'time').slice(Math.max(first.data.length - this.HoursToShow, 1)).forEach(element => {
                        ls.push(sf.GetMoment(element.time).format("HH:MM"))
                    });
                }
                return ls
            },
            getDayDataValues() {
                var ls = []
                this.RunsLast7Days.forEach(element => {
                    var _ls = []
                    sf._sortBy(element.data,'time').forEach(record => {
                        _ls.push(record.value)
                    });

                    var regionName = element.region

                    for (let i = 0; i < this.regionlist.length; i++) {
                        const region = this.regionlist[i];
                        if (region.value == element.region) {
                            regionName = region.label
                        }
                    }

                    var item = {
                        name: regionName,
                        chartType: 'line',
                        values: _ls
                        }
                    ls.push(item)
                });
                return ls

            },
            getDayTimestamps() {
                var ls = []
                if (this.RunsLast7Days[0] != undefined){
                    var first = this.RunsLast7Days[0]
                    sf._sortBy(first.data,'time').forEach(element => {
                        ls.push(sf.GetMoment(element.time).format("dddd"))
                    });
                }
                return ls
            }
        },
        methods: {

            GetData(region) {
                var apiUrl = this.$store.state.data.apiUrl

                var vm = this
                var request = apiUrl + "/RunsPer/Hours?hours=24"
                if (region != "world") request += "&region=" + region
                this.fetchingData = true
                axios.get(request).then(function (response) {
                    vm.RunsLast24Hour.push({region: region, data: response.data})
                    vm.fetchingData = false
                    vm.componentKey += 1;
                })
                .catch(function (error) {
                    console.log(error);
                    vm.request_failed = true
                    vm.fetchingData = false
                })

                var request = apiUrl + "/RunsPer/Days?days=7"
                if (region != "world") request += "&region=" + region
                this.fetchingData = true
                axios.get(request).then(function (response) {
                    vm.RunsLast7Days.push({region: region, data: response.data})
                    vm.fetchingData = false
                    vm.componentKey += 1;
                })
                .catch(function (error) {
                    console.log(error);
                    vm.request_failed = true
                    vm.fetchingData = false
                })
            },

        },
        watch: {
            regions(_new, _old) {
                var vm = this
              var result = sf.whatChanged(_new,_old)

              if (result.type == "added") {
                this.GetData(result.value);
              } else if (result.type == "removed") {
                  var changed = false
                this.RunsLast24Hour.forEach(item => {
                    if (item.region == result.value) {
                        sf.remove(this.RunsLast24Hour,item)
                    }
                });
                 this.RunsLast7Days.forEach(item => {
                    if (item.region == result.value) {
                        sf.remove(this.RunsLast7Days,item)
                    }
                });
                if (changed)
                vm.componentKey += Math.random();
                vm.componentKey += Math.random();
                setTimeout(() => {
                    vm.componentKey += Math.random();
                }, 500);

              }

            }
        },
        created() {
            this.GetData('world')
        },

}
</script>
