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

      <!-- Activity heatmap · hour-of-day × day-of-week (mock data, design view_misc.jsx › RunsView) -->
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
          <apexchart
            v-if="heatReady"
            width="100%"
            height="340px"
            type="heatmap"
            :options="heatOptions"
            :series="heatSeries"
          />
          <div v-else class="kc-runs__heat-skeleton">
            <q-skeleton v-for="i in 7" :key="i" height="36px" />
          </div>
        </div>

        <div class="kc-runs__heat-foot">
          Brightest band is 18:00–23:00 local; the Tuesday reset drives the weekly spike. Weekend daytime fills in versus weekdays.
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
import { levelBands as metaLevelBands } from "src/mocks/meta";


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
   Mock-only for now (design view_misc.jsx › RunsView). Buckets are generated
   inline from a deterministic shape — evening peak, Tuesday-reset bump and a
   weekend daytime fill — then scaled by the selected level band & region so
   the filter chips visibly move the data. A later pass swaps this for an
   endpoint; the {region, level} contract stays stable.
   ────────────────────────────────────────────────────────────────────────── */
const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Level bands from the mock meta module; "All" first so it reads as the default.
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

// Deterministic pseudo-random so the mock is stable per (region, band, cell).
function jitter(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Higher bands have fewer total runs; region offsets the daily peak hour.
const bandScale: Record<string, number> = {
  All: 1, "+7": 0.92, "+10": 0.74, "+12": 0.58, "+15": 0.4, "+18": 0.22, "+20": 0.11,
};
const regionPeakShift: Record<string, number> = { world: 0, us: 1, eu: 0, tw: -8, kr: -7 };

const heatSeries = computed(() => {
  const bandK = bandScale[heatLevelBand.value] ?? 1;
  const shift = regionPeakShift[heatRegion.value] ?? 0;
  const regSeed = (heatRegion.value.charCodeAt(0) || 0) + (heatLevelBand.value.length || 0);
  return HEAT_DAYS.map((day, di) => ({
    name: day,
    data: Array.from({ length: 24 }, (_, hRaw) => {
      const h = (hRaw + shift + 24) % 24;
      const peak =
        h >= 18 && h <= 23 ? 1 : h >= 12 && h <= 17 ? 0.6 : h >= 1 && h <= 7 ? 0.15 : 0.4;
      const wknd = di >= 5 ? 1.25 : 1;
      const reset = di === 1 && h >= 15 ? 1.5 : 1; // Tuesday reset bump
      const noise = jitter(regSeed + di * 24 + hRaw) * 12;
      return {
        x: String(hRaw).padStart(2, "0"),
        y: Math.round((peak * wknd * reset * 100 + noise) * bandK),
      };
    }),
  }));
});

// Literal hex tokens — ApexCharts renders to canvas and can't read CSS vars.
const heatOptions = computed(() => ({
  ...kcChartBase,
  chart: { ...kcChartBase.chart, id: "runsHeatmap", type: "heatmap" },
  colors: ["#5B8DEF"],
  stroke: { width: 1, colors: ["#0E141B"] },
  plotOptions: {
    heatmap: {
      radius: 3,
      enableShades: true,
      shadeIntensity: 0.6,
      colorScale: {
        ranges: [
          { from: 0, to: 40, color: "#222D3C", name: "low" },
          { from: 41, to: 90, color: "#2E5BB0", name: "med" },
          { from: 91, to: 140, color: "#5B8DEF", name: "high" },
          { from: 141, to: 400, color: "#3DD6D0", name: "peak" },
        ],
      },
    },
  },
  xaxis: {
    ...axisLabel,
    type: "category",
    tickAmount: 12,
    title: { text: "Hour of day", style: { color: "#5E6B7D", fontSize: "11px", fontWeight: 400 } },
  },
  yaxis: { ...axisLabel },
  tooltip: { theme: "dark", y: { formatter: (v: number) => v + " runs/min" } },
  legend: { ...kcChartBase.legend, position: "bottom" },
}));

// brief skeleton beat so the heatmap card matches the design's loading state
const heatReady = ref(false);
onBeforeMount(() => {
  setTimeout(() => {
    heatReady.value = true;
  }, 350);
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
.kc-runs__heat-body { padding: var(--kc-sp-4) var(--kc-sp-3) 0; min-height: 340px; }
.kc-runs__heat-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--kc-sp-2) var(--kc-sp-3);
}
.kc-runs__heat-foot {
  padding: var(--kc-sp-3) var(--kc-sp-5);
  font-size: 11.5px;
  color: var(--kc-text-low);
  border-top: 1px solid var(--kc-line-hairline);
}
@media (max-width: 600px) {
  .kc-runs__heat-controls { flex-direction: column; gap: var(--kc-sp-4); }
}
</style>
