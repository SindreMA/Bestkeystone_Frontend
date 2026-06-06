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

      <!-- Activity heatmap · hour-of-day × day-of-week (design view_misc.jsx › RunsView).
           No backend exists for this view yet, so we keep the card and its real
           filter controls but show an honest empty state instead of fabricated
           buckets. The {region, level} contract is ready for a later endpoint. -->
      <KcCard :level="1" class="kc-runs__block" :body-style="{ padding: '0' }">
        <template #header>When the world pushes keys</template>
        <template #headerRight>
          <span class="kc-eyebrow kc-runs__heat-scope">{{ heatScopeLabel }}</span>
        </template>

        <div class="kc-runs__heat-controls">
          <div class="kc-runs__heat-filter">
            <span class="kc-eyebrow">Level band</span>
            <div class="kc-seg">
              <button
                v-for="b in levelBandsList"
                :key="b"
                class="kc-seg__btn"
                :class="{ 'is-sel': b === heatLevelBand }"
                @click="heatLevelBand = b"
              >{{ b }}</button>
            </div>
          </div>
          <div class="kc-runs__heat-filter">
            <span class="kc-eyebrow">Region</span>
            <div class="kc-seg">
              <button
                v-for="r in heatRegionList"
                :key="r.value"
                class="kc-seg__btn"
                :class="{ 'is-sel': r.value === heatRegion }"
                @click="heatRegion = r.value"
              >{{ r.label }}</button>
            </div>
          </div>
        </div>

        <div class="kc-runs__heat-body">
          <div class="kc-runs__heat-empty">
            <div class="kc-runs__heat-empty-icon">∅</div>
            <p class="kc-runs__heat-empty-title">Activity heatmap needs a backend — coming soon</p>
            <p class="kc-runs__heat-empty-msg">
              Hour-of-day × day-of-week activity isn't served by an endpoint yet, so
              we won't show placeholder numbers here.
            </p>
          </div>
        </div>
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
import { levelBands as metaLevelBands } from "src/data/metaReference";


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

/* ──────────────────────────────────────────────────────────────────────────
   Activity heatmap (hour-of-day × day-of-week)
   No endpoint serves this yet (design view_misc.jsx › RunsView), so the card
   keeps its real filter controls but renders an honest empty state instead of
   fabricated buckets. The {region, level} selection contract stays stable for
   when a backend lands; until then we never invent numbers.
   ────────────────────────────────────────────────────────────────────────── */

// Real level bands (reference data); "All" first so it reads as the default.
const levelBandsList = ref<string[]>(metaLevelBands);
const heatLevelBand = ref<string>(metaLevelBands[0] ?? "All");

const heatRegionList = ref([
  { label: "World", value: "world" },
  { label: "USA", value: "us" },
  { label: "Europa", value: "eu" },
  { label: "Taiwan", value: "tw" },
  { label: "Korea", value: "kr" },
]);
const heatRegion = ref("world");

const heatScopeLabel = computed(() => {
  const r = heatRegionList.value.find((x) => x.value === heatRegion.value);
  const region = !r || r.value === "world" ? "all regions" : r.label;
  return heatLevelBand.value === "All" ? region : `${region} · ${heatLevelBand.value}`;
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

/* activity heatmap */
.kc-runs__heat-scope { margin: 0; color: var(--kc-text-mid); }
.kc-runs__heat-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--kc-sp-5);
  padding: var(--kc-sp-4) var(--kc-sp-5);
  border-bottom: 1px solid var(--kc-line-hairline);
}
.kc-runs__heat-filter { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.kc-runs__heat-filter .kc-eyebrow { margin: 0; }
.kc-runs__heat-filter .kc-seg { flex-wrap: wrap; }
.kc-runs__heat-body { padding: var(--kc-sp-4) var(--kc-sp-3) 0; min-height: 340px; display: flex; align-items: center; justify-content: center; }
.kc-runs__heat-empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 48px 20px; }
.kc-runs__heat-empty-icon { font-size: 28px; opacity: 0.5; margin-bottom: 12px; }
.kc-runs__heat-empty-title { margin: 0 0 6px; font-size: 15px; font-weight: 600; color: var(--kc-text-hi); }
.kc-runs__heat-empty-msg { margin: 0 auto; max-width: 440px; line-height: 1.5; color: var(--kc-text-mid); }
@media (max-width: 600px) {
  .kc-runs__heat-controls { flex-direction: column; gap: var(--kc-sp-4); }
}
</style>
