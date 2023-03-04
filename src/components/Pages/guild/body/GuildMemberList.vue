<template>
  <div>
    <q-table
      title="Guild Members"
      :rows="guildMembers"
      :columns="columns"
      row-key="id"
      dark
      color="amber"
      :pagination="initialPagination"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="rank" :props="props">
            <CloudinaryFormat :url="`icons/crown.png`" v-slot="{link}">
              {{ props.row.rank + 1 }}
              <q-img
                v-if="props.row.rank == 0"
                spinner-size="15px"
                spinner-color="white"
                class="crownIcon"
                :src="link"
              >
                <q-tooltip>Guild Master</q-tooltip>
              </q-img>
            </CloudinaryFormat>
          </q-td>
          <q-td
            key="player"
            :props="props"
          >
          <div class="flex" style="gap: 5px;">
            <q-img
              spinner-size="15px"
              spinner-color="white"
              class="tableIcon"
              :src="getClass(props.row._class)?.icon_url"
            />
            <classTextColorVue :_class="props.row._class">
              <router-link
                :to="`/lookup/player/${region}/${props.row.realm}/${props.row.name}`"
                >{{ props.row.name }}
              </router-link>
          </classTextColorVue>
        </div>
          </q-td>
          <q-td key="dungeons" :props="props" class="flex justify-start">
            <template v-if="props.row.run_data.seasonBestRuns.length != 0">
              <dungeonRunMini
                :run="run"
                v-for="(run, index) in props.row.run_data.seasonBestRuns"
                style="margin-right: 15px"
                :key="index"
              />
            </template>
            <template v-else> No run completed </template>
          </q-td>
          <q-td key="score" :props="props">
            {{ props.row.run_data?.weeklyRuns?.length ?? 0 }}
            <q-tooltip v-if="props.row.run_data?.weeklyRuns?.length">
            <div class="flex gap-5 justify-around" style="">
              <dungeonRunMini
                :run="run"
                v-for="(run, index) in props.row.run_data.weeklyRuns"
                style="margin-right: 15px"
                :key="index"
              />
            </div>
            </q-tooltip>
          </q-td>
          <q-td key="score" :props="props">
            {{ Math.round(props.row.run_data ? props.row.run_data.score : 0) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts" setup>
import dungeonRunMini from "./dungeonRunMini.vue";
import SF from "src/SharedFunctions";
import CloudinaryFormat from "../../../data_formatters/CloudinaryFormat.vue";
import { computed, ref, toRefs } from "vue";
import { useStore } from "src/store";
import classTextColorVue from "src/components/containers/classTextColor.vue";
import { Member } from "src/types/guild";

const props = defineProps({
  guildMembers: {
    type: Array<Member>,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
});

const { guildMembers, region } = toRefs(props);
const columns : any = [
  {
    name: "rank",
    align: "left",
    label: "Rank",
    field: "rank",
    sortable: true,
    sort: (a, b) => a - b,
  },
  {
    name: "player",
    align: "left",
    label: "Player",
    field: "name",
    sortable: true,
    sort: (a, b) => a - b,
  },
  { name: "dungeons", align: "left", label: "Dungeons", field: (x:Member) => x.run_data.seasonBestRuns, sortable: false },
  { name: "weekly", align: "right", label: "Completed this week", field: (x:Member) => x.run_data.weeklyRuns.length, sortable: true },
  {
    name: "score",
    label: "Score",
    format: (x) => Math.round(x),
    field: (x) => (x.run_data ? x.run_data.score : 0),
    sortable: true,
    sort: (a, b) => a - b,
  },
];

const initialPagination = ref({
  sortBy: "score",
  descending: true,
  rowsPerPage: 20,
});

const store = useStore();
const _data = store.state.data;

const GetSpecs = computed(() => _data.Specs);
const GetClasses = computed(() => _data.Classes);

const GetBestRuns = (row) => {
  if (row.run_data && row.run_data.runs && row.run_data.length != 0) {
    var filterTime = filterdRuns(row.run_data.runs, row.run_data.season);
    var bestRuns = getTopDungeonRuns(filterTime);
    return bestRuns;
  }
  return [];
};

const getTopDungeonRuns = (runs) => {
  var rls = [];

  var dungeons = SF.groupBy(runs, (x) => x.zone.id);
  for (const p in dungeons) {
    if (dungeons.hasOwnProperty(p)) {
      const dungeonruns = dungeons[p];
      var sortedList = SF._sortBy(dungeonruns, "score").reverse();
      rls.push(sortedList[0]);
    }
  }
  return rls;
};

const filterdRuns = (runs, time) => {
  var ls = [];
  for (let i = 0; i < runs.length; i++) {
    const element = runs[i];
    if (time == null) {
      ls.push(element);
    } else {
      if (
        element.time.completed_timestamp > time.start &&
        element.time.completed_timestamp < time.end
      ) {
        ls.push(element);
      }
    }
  }
  return ls;
};

const getClass = (id) => {
  if (GetClasses.value) {
    for (let i = 0; i < GetClasses.value.length; i++) {
      const _class = GetClasses.value[i];
      if (_class.id == id) {
        return _class;
      }
    }
  }
};

const getSpec = (id) => {
  if (GetSpecs.value) {
    for (let i = 0; i < GetSpecs.value.length; i++) {
      const spec = GetSpecs.value[i];
      if (spec.id == id) {
        return spec;
      }
    }
  }
};
</script>

<style scouped>
a {
  color: inherit;
  /* blue colors for links too */
  text-decoration: inherit;
  /* no underline */
}

.tableIcon {
  width: 25px;
  height: 25px;
}

.crownIcon {
  width: 15px;
  height: 15px;
}
</style>
