<template>
    <div :class="{ Box: runs }" class="relative">

        <div v-if="runs" class="Header HeaderSize4">Chest statistics</div>
        <div id="chart" class="HeaderFont">
            <apexchart type="bar" height="350" :options="chartOptions" :series="series" />
            <q-tooltip v-if="!runs">
                <div>This data is generated from the top {{ GetSettings.max_runs }} runs from every dungeon, that are
                    higher than level {{ GetSettings.min_keystonelevel }}.</div>
                <div>These setting can be changed in the settings wheel up in the right</div>
            </q-tooltip>
        </div>


    </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import apexchart from 'vue3-apexcharts'
import { useStore } from 'src/store';
import { computed, onBeforeMount, ref, toRefs, watch } from 'vue';

const props = defineProps({
    runs: {
        type: Array<any>,
        required: true
    }
})
const { runs } = toRefs(props)

const series = ref([])
const chartOptions = ref({
    chart: {
        foreColor: "#a1a1a1"
    },
    plotOptions: {
        bar: {
            barHeight: '100%',
            distributed: true,
            horizontal: true,
        }
    },
    colors: ['#DAA520', '#980DE9', '#228B22', '#696969'],
    xaxis: {
        categories: ['Three Chest', 'Two Chest', 'One Chest', 'Not in time'],
    },
    yaxis: {
        labels: {
            show: false
        }
    },
    dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: {
            colors: ['#fff']
        },
        formatter: function (val, opt) {
            return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
        },
        offsetX: 0,
        dropShadow: {
            enabled: true
        }
    },
    tooltip: {
        theme: 'dark',
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function () {
                    return ''
                }
            }
        }
    }
})

const store = useStore()
const data = store.state.data
const GetSettings = computed(() => data.settings)
const GetSelectedPeriode = computed(() => data.SelectedPeriode)


const GenerateSeries = () => {
    if (runs.value) {
        var threeChestRuns = runs.value.filter(x => { return x.time.clear_time < x.time.map_time * 0.6 })
        var twoChestRuns = runs.value.filter(x => { return x.time.clear_time < x.time.map_time * 0.8 && x.time.clear_time > x.time.map_time * 0.6 })
        var oneChestRuns = runs.value.filter(x => { return x.time.clear_time < x.time.map_time && x.time.clear_time > x.time.map_time * 0.8 })
        var zeroChestRuns = runs.value.filter(x => { return x.time.clear_time > x.time.map_time })

        //serie.push(['+3',threeChestRuns.length],['+2',twoChestRuns.length],['+1',oneChestRuns.length],[zeroChestRuns.length,'Not  in time']);
        series.value = [{ data: [threeChestRuns.length, twoChestRuns.length, oneChestRuns.length, zeroChestRuns.length] }]
    } else {
        var s = GetSettings.value;
        var apiUrl = data.apiUrl;
        //should change to use query-string instead
        axios.get(`${apiUrl}/Stats/ChestStats?periode=${GetSelectedPeriode.value}&min_level=${s.min_keystonelevel}&amount=${s.max_runs}&limitToLowestDungeon=${s.limitbylowestdungeon}`).then(x => {
            series.value = [{ data: x.data }]
        }).catch(x => {
            console.log(x);
        })
    }
}

watch([runs, GetSelectedPeriode], () => {
    GenerateSeries();
})

onBeforeMount(() => {
    GenerateSeries();
})
</script>

<style scoped>
.Box {
    border: 1px solid #696969;
    position: relative;
}

.Header {
    background-color: #414141;
    padding: 5px;
}
</style>