<template>
  <div class="HeaderFont text-center">
    <h5>
      Runs Completed This Week
      <q-icon name="info" size="xs" class="info-icon">
        <q-tooltip>
          This data is based on Blizzard's leaderboard. If a run doesn't appear there, it won't be tracked. Player scans will add the player's runs, but we only have manual player scans currently. Due to Blizzard leaderboard bugs, the actual number is probably 5x-10x higher.
        </q-tooltip>
      </q-icon>
    </h5>
    <div>
      <h5 class="nrFont">{{ amountOfRunsFormatted }}</h5>
    </div>
    <div class="live-indicator">
      <span class="pulse-dot"></span>
      <span>LIVE TRACKING</span>
    </div>
    <br />
    <slot />
    <br />
    <div class="flex justify-around">
      <div class="tableAutoSizing">
        Top Runs
        <q-skeleton
          v-if="!leaderboard || !GetClasses || !GetSpecs"
          style="height: 350px"
        />
        <runTableView
          v-else
          :dense="true"
          :noAffixes="true"
          :noCreatedTime="true"
          :runs="leaderboard"
        />
        <router-link to="/leaderboard/keystone?page=1&season=1"
          >See more...</router-link
        >
      </div>
      <div class="tableAutoSizing">
        Recent Runs
        <q-skeleton
          v-if="!runs || !GetClasses || !GetSpecs"
          style="height: 350px"
        />
        <runTableView
          v-else
          :dense="true"
          :noAffixes="true"
          :noCreatedTime="true"
          :runs="_.sortBy([...runs], (x) => x.index)"
        />
        <router-link to="/monitor">See more...</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import * as signalR from "@aspnet/signalr";
import numeral from "numeral";
import runTableView from "../ListViews/Tables/runTableView.vue";
import _ from "underscore";
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useStore } from "../../store";
import SF from "../../SharedFunctions";
import { useQuasar } from "quasar";

const store = useStore();
const data = store.state.data;

var apiUrl = data.apiUrl;

let monitorRuns = ref(true);
let connection = ref<any>(null);
let amountOfRuns = ref(0);
let runs = ref([]);
let leaderboard = ref(null);

const GetPeriodes = computed(() => store.getters.GetPeriodes);
const GetSpecs = computed((x) => data.Specs);
const GetClasses = computed((x) => data.Classes);
const GetSettings = computed((x) => data.settings);

const amountOfRunsFormatted = computed(() =>
  numeral(amountOfRuns.value).format("0,0")
);

const FetchTopRuns = () => {
  var apiUrl = data.apiUrl;
  axios
    .get(`${apiUrl}/KeystoneRun/leaderboard?from=0&amount=5`)
    .then((x) => {
      leaderboard.value = x.data.list;
    })
    .catch((x) => console.log(x));
};

const CheckAndFetchTopRuns = () => {
  FetchTopRuns();
};

const fetchAmount = () => {
  var apiUrl = data.apiUrl;
  axios
    .get(`${apiUrl}/Stats/RunCount?weekId=${GetPeriodes.value[0]?.id}`)
    .then((x) => {
      amountOfRuns.value = x.data;
    })
    .catch((x) => console.log(x));
};

const CheckAndFetchAmount = () => {

  if (GetPeriodes.value && GetPeriodes.value[0]) {
    fetchAmount();
  }
};

const $q = useQuasar();
const viewMode = computed(() =>
  SF.GetDefaultView($q.screen.width, GetSettings)
);

const startMonitor = () => {
  if (connection?.state !== 1) {
    if (
      monitorRuns &&
      (connection?.state === 0 || connection?.state === "disconnected")
    ) {
      connection?.start();
    } else {
      setTimeout((x) => {
        //vm.startMonitor();
      }, 1000);
    }
  }
};

const checkThatMonitorIsRunning = () => {
  setTimeout((x) => {
    //vm.startMonitor();
    //vm.checkThatMonitorIsRunning();
  }, 10000);
};

onBeforeMount(() => {
  CheckAndFetchAmount();
  connection = new signalR.HubConnectionBuilder()
    .withUrl(apiUrl.slice(0, -4) + "/KeystoneHub")
    .configureLogging(signalR.LogLevel.Information)
    .build();
  connection.on("disconnected", (x) => {
    setTimeout((x) => {
      //vm.startMonitor();
    }, 1000);
  });
  CheckAndFetchTopRuns();
}),
  onMounted(async () => {

    await connection.start();
    checkThatMonitorIsRunning();
    connection.invoke("RequestNewestRuns", 5);
    connection.on("GetNewestRuns", function (_runs) {
      runs.value = [..._runs];
    });
    connection.on("NewRunAdded", function (run) {
      amountOfRuns.value++;
      runs.value.push(run);
      if (runs && runs.value.length > 5) {
        runs.value = runs.value.slice(Math.max(runs.value.length - 5, 1));
      }
    });
  }),
  onBeforeMount(() => {
    connection.stop();
  }),
  watch(GetPeriodes, () => {
    CheckAndFetchAmount();
  });

watch(monitorRuns, () => {
  if (!monitorRuns) {
    console.log("Stopping connection..");
    connection.stop();
  } else {
    console.log("Starting connection..");
    startMonitor();
  }
});
</script>

<style scoped>
h5 {
  margin: 10px;
}
.nrFont {
  font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
  font-size: 45px;
}
.HalfTableView {
  min-height: 345px;
  min-width: 500px;
  width: 100%;
  max-width: 600px;
}
.info-icon {
  cursor: help;
  vertical-align: super;
  font-size: 0.7em;
  margin-left: 4px;
}
.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 50px;
  padding: 8px 18px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #22c55e;
  letter-spacing: 2px;
  margin-top: 10px;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}
</style>
