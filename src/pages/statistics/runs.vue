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
           Wired to the real GET /Meta/activity endpoint. The aggregate job returns
           a flat [{hour,day,runs}] matrix; when it hasn't run we get 200 with [] and
           show an honest empty state — never fabricated buckets. The {region, level}
           filter chips drive the query params. -->
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
          <div v-if="heatLoading" class="kc-runs__heat-skeleton">
            <q-skeleton v-for="i in 7" :key="i" height="36px" />
          </div>
          <apexchart
            v-else-if="heatHasData"
            width="100%"
            height="340px"
            type="heatmap"
            :options="heatOptions"
            :series="heatSeries"
          />
          <div v-else class="kc-runs__heat-empty">
            <div class="kc-runs__heat-empty-icon">∅</div>
            <p class="kc-runs__heat-empty-title">
              {{ heatError ? 'Couldn’t load activity' : 'No activity data yet' }}
            </p>
            <p class="kc-runs__heat-empty-msg">
              {{ heatError
                ? 'The activity endpoint didn’t respond. Try again shortly.'
                : 'The hour-of-day × day-of-week aggregate hasn’t been generated for this scope yet. It’ll appear here once the job has run.' }}
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
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
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
   Wired to the real GET ${apiUrl}/Meta/activity?periode=&region=&levelBand=
   endpoint (design view_misc.jsx › RunsView). The aggregate job returns a flat
   matrix [{ hour: 0..23, day: 0..6 (Sunday=0), runs }] which we pivot into the
   apexcharts heatmap series (one row per weekday, 24 hour columns). The job may
   not have run for a given scope — then the endpoint returns 200 with [] and we
   show an honest empty state. We never invent numbers. The {region, level} chips
   drive the query params.
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

// Weekday rows. Backend day index follows System.DayOfWeek: Sunday = 0 … Saturday = 6.
const HEAT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ActivityCell { hour: number; day: number; runs: number }

// 'world' region → empty param (all regions). Other regions pass through lowercase.
const regionParam = (r: string) => (r === "world" ? "" : r);
// 'All' → 'all' (MetaBandAll), '+15' → '15', etc. — matches the MetaController contract.
const bandParam = (b: string) => (b === "All" ? "all" : b.replace("+", ""));

const heatLoading = ref(false);
const heatError = ref(false);
const heatCells = ref<ActivityCell[]>([]);

const fetchActivity = () => {
  const apiUrl = data.apiUrl;
  const periode = data.SelectedPeriode;
  // No scope yet → nothing to ask for; render empty, never fabricate.
  if (!apiUrl || periode == null) {
    heatCells.value = [];
    return;
  }
  const region = regionParam(heatRegion.value);
  const levelBand = bandParam(heatLevelBand.value);
  const url = `${apiUrl}/Meta/activity?periode=${periode}&region=${region}&levelBand=${levelBand}`;

  heatLoading.value = true;
  heatError.value = false;
  axios
    .get(url)
    .then((response) => {
      // guard against a stale response arriving after the scope changed again
      if (
        periode !== data.SelectedPeriode ||
        region !== regionParam(heatRegion.value) ||
        levelBand !== bandParam(heatLevelBand.value)
      )
        return;
      heatCells.value = Array.isArray(response.data) ? response.data : [];
    })
    .catch((error) => {
      console.log(error);
      heatCells.value = [];
      heatError.value = true;
    })
    .finally(() => {
      heatLoading.value = false;
    });
};

const heatHasData = computed(() =>
  heatCells.value.some((c) => Number(c?.runs) > 0)
);

// Pivot the flat [{hour,day,runs}] matrix into apexcharts heatmap rows: one
// series per weekday (Sun→Sat, top to bottom would be reversed by apex, so we
// reverse so Mon..Sun reads top-down like the design), 24 hour columns each.
const heatSeries = computed(() => {
  const byCell = new Map<string, number>();
  for (const c of heatCells.value) {
    if (c == null) continue;
    byCell.set(`${c.day}:${c.hour}`, Number(c.runs) || 0);
  }
  return HEAT_DAYS.map((day, di) => ({
    name: day,
    data: Array.from({ length: 24 }, (_, h) => ({
      x: String(h).padStart(2, "0"),
      y: byCell.get(`${di}:${h}`) ?? 0,
    })),
  })).reverse();
});

// Color scale derived from the live max so shading adapts to whatever the
// endpoint returns (avoids hard-coded buckets that wouldn't fit real volume).
const heatMax = computed(() =>
  heatCells.value.reduce((m, c) => Math.max(m, Number(c?.runs) || 0), 0)
);

// Literal hex tokens — ApexCharts renders to canvas and can't read CSS vars.
const heatOptions = computed(() => {
  const max = Math.max(heatMax.value, 1);
  return {
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
            { from: 0, to: 0, color: "#161D26", name: "none" },
            { from: 1, to: Math.round(max * 0.3), color: "#222D3C", name: "low" },
            { from: Math.round(max * 0.3) + 1, to: Math.round(max * 0.6), color: "#2E5BB0", name: "med" },
            { from: Math.round(max * 0.6) + 1, to: Math.round(max * 0.85), color: "#5B8DEF", name: "high" },
            { from: Math.round(max * 0.85) + 1, to: max, color: "#3DD6D0", name: "peak" },
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
    tooltip: { theme: "dark", y: { formatter: (v: number) => v + " runs" } },
    legend: { ...kcChartBase.legend, position: "bottom" },
  };
});

// Refetch when scope changes: page periode (global) or the heatmap's own chips.
watch(
  () => [data.SelectedPeriode, heatRegion.value, heatLevelBand.value],
  fetchActivity
);

onMounted(fetchActivity);

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
.kc-runs__heat-body > .vue-apexcharts { width: 100%; }
.kc-runs__heat-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: var(--kc-sp-2) var(--kc-sp-3);
}
.kc-runs__heat-empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 48px 20px; }
.kc-runs__heat-empty-icon { font-size: 28px; opacity: 0.5; margin-bottom: 12px; }
.kc-runs__heat-empty-title { margin: 0 0 6px; font-size: 15px; font-weight: 600; color: var(--kc-text-hi); }
.kc-runs__heat-empty-msg { margin: 0 auto; max-width: 440px; line-height: 1.5; color: var(--kc-text-mid); }
@media (max-width: 600px) {
  .kc-runs__heat-controls { flex-direction: column; gap: var(--kc-sp-4); }
}
</style>
