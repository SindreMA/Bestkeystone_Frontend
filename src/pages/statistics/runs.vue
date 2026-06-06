<template>
  <div class="kc-root kc-runs">
    <div class="kc-container">
      <KcPageHeader eyebrow="Statistics" title="Runs / Activity" sub="Run volume, faction split, and keystone activity over time per region." />

      <div class="kc-runs__top">
        <KcCard :level="1" header="Runs completed">
          <div class="kc-runs__count"><RunsCompletedCount /></div>
        </KcCard>
        <KcCard :level="1" header="Faction split">
          <FactionBar />
        </KcCard>
      </div>

      <div class="kc-runs__regions">
        <span class="kc-eyebrow">Regions</span>
        <q-option-group color="primary" type="checkbox" v-model="regions" inline :options="regionlist" />
      </div>

      <div class="kc-runs__charts">
        <KcCard :level="1" header="Keys per hour · last 24h">
          <apexchart width="100%" height="280px" type="line" :options="getHourTimestamps()" :series="getHourDataValues()" />
        </KcCard>
        <KcCard :level="1" header="Keys per day · last 7 days">
          <apexchart width="100%" height="280px" type="line" :options="getDayTimestamps()" :series="getDayDataValues()" />
        </KcCard>
      </div>

      <KcCard :level="1" header="Success &amp; volume by keystone level" class="kc-runs__block">
        <LevelStats @fetch="levelData = $event" />
      </KcCard>

      <KcCard :level="1" header="Runs per week" class="kc-runs__block">
        <PerWeekChart :data="levelData" />
      </KcCard>
    </div>
  </div>
</template>
<script lang="ts" setup>
import KcPageHeader from "components/layout/KcPageHeader.vue";
import KcCard from "components/keystone/KcCard.vue";
import LevelStats from "components/ListViews/LevelStats.vue";
import RunsCompletedCount from "components/Pages/runs/RunsCompletedCount.vue";
import PerWeekChart from "components/Pages/runs/PerWeekChart.vue";
import FactionBar from "components/ItemViews/FactionBar.vue";
import apexchart from 'vue3-apexcharts'
import axios from "axios";
import sf from "../../SharedFunctions";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useStore } from "src/store";


const levelData = ref(null);
const componentKey = ref(0);
const request_failed = ref(false);
const fetchingData = ref(false);
const RunsLast24Hour = ref([]);
const HoursToShow = ref(24);
const RunsLast7Days = ref([]);

const regionlist = ref([
  { label: "World", value: "world" },
  { label: "USA", value: "us" },
  { label: "Europa", value: "eu" },
  { label: "Taiwan", value: "tw" },
  { label: "Korea", value: "kr" },
]);

const regions = ref(["world"]);


const store = useStore();
const data = store.state.data;

const GetSettings = computed(() => data.settings);

// Keystone Console chart theme. ApexCharts renders to canvas and can't read CSS
// vars, so literal hex tokens are used (accent #5B8DEF, live #3DD6D0, warn …).
const kcChartBase = {
  chart: { background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
  theme: { mode: 'dark' },
  colors: ['#5B8DEF', '#3DD6D0', '#D29922', '#F25C54', '#9C6ADE'],
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(255,255,255,0.06)', strokeDashArray: 3 },
  tooltip: { theme: 'dark' },
  legend: { labels: { colors: '#9AA7B8' } },
};
const axisLabel = { labels: { style: { colors: '#9AA7B8' } } };

const getHourDataValues = () => {
  var ls = [];
  RunsLast24Hour.value.forEach((element) => {
    var _ls = [];
    sf._sortBy(element.data, "time")
      .slice(Math.max(element.data.length - HoursToShow.value, 1))
      .forEach((record) => {
        _ls.push(record.value);
      });

    var regionName = element.region;

    for (let i = 0; i < regionlist.value.length; i++) {
      const region = regionlist.value[i];
      if (region.value == element.region) {
        regionName = region.label;
      }
    }

    var item = {
      name: regionName,
      data: _ls,
    };
    ls.push(item);
  });
  return ls;
};

const getHourTimestamps = () => {
  var ls = [];
  if (RunsLast24Hour.value[0] != undefined) {
    var first = RunsLast24Hour.value[0];
    sf._sortBy(first.data, "time")
      .slice(Math.max(first.data.length - HoursToShow.value, 1))
      .forEach((element) => {
        ls.push(sf.GetMoment(element.time).format("HH:mm"));
      });
  }

  const chartOptions = {
        ...kcChartBase,
        chart: { ...kcChartBase.chart, id: "perHourChart" },
        yaxis: { ...axisLabel },
        xaxis: { ...axisLabel, categories: ls },
      }
  return chartOptions;
};

const getDayDataValues = () => {
  var ls = [];
  RunsLast7Days.value.forEach((element) => {
    var _ls = [];
    sf._sortBy(element.data, "time").forEach((record) => {
      _ls.push(record.value);
    });

    var regionName = element.region;

    for (let i = 0; i < regionlist.value.length; i++) {
      const region = regionlist.value[i];
      if (region.value == element.region) {
        regionName = region.label;
      }
    }

    var item = {
      name: regionName,
      data: _ls,
    };
    ls.push(item);
  });
  return ls;
};

const getDayTimestamps = () => {
  var ls = [];
  if (RunsLast7Days.value[0] != undefined) {
    var first = RunsLast7Days.value[0];
    sf._sortBy(first.data, "time").forEach((element) => {
      ls.push(sf.GetMoment(element.time).format("dddd"));
    });
  }

  const chartOptions = {
        ...kcChartBase,
        chart: { ...kcChartBase.chart, id: "perDayChart" },
        yaxis: { ...axisLabel },
        xaxis: { ...axisLabel, categories: ls },
      }
  return chartOptions;
};

const GetData = (region) => {
  var apiUrl = data.apiUrl;

  var request = apiUrl + "/RunsPer/Hours?hours=24";
  if (region != "world") request += "&region=" + region;
  fetchingData.value = true;
  axios
    .get(request)
    .then(function (response) {
      RunsLast24Hour.value.push({ region: region, data: response.data });
      fetchingData.value = false;
      componentKey.value += 1;
    })
    .catch(function (error) {
      console.log(error);
      request_failed.value = true;
      fetchingData.value = false;
    });

  var request = apiUrl + "/RunsPer/Days?days=7";
  if (region != "world") request += "&region=" + region;
  fetchingData.value = true;
  axios
    .get(request)
    .then(function (response) {
      RunsLast7Days.value.push({ region: region, data: response.data });
      fetchingData.value = false;
      componentKey.value += 1;
    })
    .catch(function (error) {
      console.log(error);
      request_failed.value = true;
      fetchingData.value = false;
    });
};

watch(regions, (_new, _old) => {
  var result = sf.whatChanged(_new, _old);
  if (result.type == "added") {
    GetData(result.value);
  } else if (result.type == "removed") {
    var changed = false;
    RunsLast24Hour.value.forEach((item) => {
      if (item.region == result.value) {
        sf.remove(RunsLast24Hour.value, item);
      }
    });
    RunsLast7Days.value.forEach((item) => {
      if (item.region == result.value) {
        sf.remove(RunsLast7Days.value, item);
      }
    });
    if (changed) componentKey.value += Math.random();
    componentKey.value += Math.random();
    setTimeout(() => {
      componentKey.value += Math.random();
    }, 500);
  }
});

onBeforeMount(() => {
  GetData("world");
});

</script>

<style scoped>
.kc-runs { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }
.kc-runs__top { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: var(--kc-sp-5); margin-bottom: var(--kc-sp-5); }
.kc-runs__top > * { min-width: 0; }
.kc-runs__count { text-align: center; }
.kc-runs__regions { display: flex; align-items: center; gap: 14px; margin-bottom: var(--kc-sp-5); flex-wrap: wrap; }
.kc-runs__charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: var(--kc-sp-5); }
.kc-runs__charts > * { min-width: 0; }
.kc-runs__block { margin-top: var(--kc-sp-5); }
</style>
