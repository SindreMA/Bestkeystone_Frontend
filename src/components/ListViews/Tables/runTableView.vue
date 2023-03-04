<template>
  <q-table
    :title="title"
    :rows="reRenderLs"
    :columns="Columns"
    :pagination="paginationControl"
    :rows-per-page-options="[]"
    row-key="content_id"
    dark
    ref="Table"
    :hide-bottom="dense"
    color="amber"
    :visible-columns="visableColumns"
  >
    <template v-slot:pagination> </template>
    <template v-slot:body="props">
      <q-tr
        :props="props"
        @click="!dense ? (props.expand = !props.expand) : toKey(props.row.id)"
        :style="`${dense ? 'height: 56px' : ''}`"
      >
        <q-td key="created" :props="props">
          <div class="flex justify-start">
            <CloudinaryFormat
              :url="`factions/${props.row.faction.toLowerCase()}.png`"
              v-slot="{ link }"
            >
              <q-img
                spinner-size="10px"
                class="factionIconSize"
                spinner-color="white"
                :src="link"
              />
            </CloudinaryFormat>
            {{ FormatTimeAgo(props.row.time.created) }}
          </div>
        </q-td>
        <q-td key="zone" :props="props">
          <div :class="`${!dense ? 'flex justify-start' : ''}`">
            <CloudinaryFormat
              :url="GetDungeonsDetails(props.row.zone.id).imageurl"
              v-slot="{ link }"
            >
              <q-img
                spinner-size="10px"
                class="dungeonIconSize"
                spinner-color="white"
                :src="link"
              />
            </CloudinaryFormat>
            <div v-if="props.row.zone.short_name">
              {{ props.row.zone.short_name }}
            </div>
            <div v-else>{{ props.row.zone.name }}</div>
          </div>
        </q-td>
        <q-td key="level" :props="props">
          <div class="flex justify-start">
            +{{ props.row.level }}
            <i
              v-for="(item, chestIndex) in chests(props.row)"
              :key="chestIndex"
              class="starIcon material-icons"
              >star</i
            >
          </div>
        </q-td>
        <q-td key="time" :props="props">{{
          FormatTimeUsed(props.row.time.clear_time)
        }}</q-td>
        <q-td key="affixes" :props="props">
          <div class="flex">
            <template v-for="(affix, index) in props.row.affixes" key="index">
              <Affix
                :affixid="affix"
                :border="false"
                :tooltip="true"
              />
            </template>
          </div>
        </q-td>
        <q-td key="players" :props="props">
          <div
            class="flex"
            :class="`${dense ? 'justify-around' : 'justify-between'}`"
          >
            <div
              :style="`color: ${getClass(player.class).color};`"
              class="flex justify-center"
              v-for="(player, index) in getPlayersWithRoles(
                props.row.players
              ).filter((x) =>
                dense ? x?.role === 'HEALER' || x?.role === 'TANK' : true
              )"
              :key="index"
            >
              <PlayerText :player="player" :region="props.row.region" />
            </div>
          </div>
          <div class="flex justify-between">
            <div
              :style="`color: ${getClass(player.class).color};`"
              class="flex justify-center"
              v-for="(player, index) in getPlayersWithRoles(
                props.row.players
              ).filter((x) => (dense ? x?.role === 'DAMAGE' : false))"
              :key="index"
            >
              <PlayerText :player="player" :region="props.row.region" />
            </div>
          </div>
        </q-td>
        <q-td key="score" :props="props">{{
          Math.round(props.row.score * 10) / 10
        }}</q-td>
      </q-tr>
      <q-tr class="hideHover" v-if="props.expand" :props="props">
        <q-td class="hideHover" colspan="100%">
          <keystoneView class="keystoneView" :id="props.row.id"></keystoneView>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts" setup>
import { mapGetters } from "vuex";
import SF, {moment} from '../../../SharedFunctions'
import Affix from "components/Icons/Affix/index.vue";
import dungeonSelector from "../../Selectors/dungeonSelector.vue";
import affixSelector from "../../Selectors/affixSelector.vue";
import regionSelector from "../../Selectors/regionSelector.vue";
import keystoneView from "../../ItemViews/keystoneView.vue";
import PlayerText from "../../ItemViews/PlayerText.vue";
import CloudinaryFormat from "../../data_formatters/CloudinaryFormat.vue";
import { Ref, toRefs } from "vue";
import { useRouter } from "vue-router";
import {
  ref,
  onMounted,
  computed,
  watch,
  onBeforeMount,
  getCurrentInstance,
} from "vue";
import { useStore } from "../../../store";
const store = useStore();
const data = store.state.data;

const props = defineProps({
  runs: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  dense: {
    type: Boolean,
    required: false
  },
  noAffixes: {
    type: Boolean,
  },
  noCreatedTime: {
    type: Boolean,

  },
  zone: {
    type: Number,
    required: false
  },
});
const { runs, dense, noAffixes,noCreatedTime,title,zone } = toRefs(props);

const Columns = ref([
  {
    name: "created",
    label: "Found",
    sortable: false,
    align: "left" as any,
    field: x=> x
  },
  {
    name: "zone",
    label: "Dungeon",
    sortable: false,
    align: "left",
    field: x=> x
  },
  {
    name: "level",
    label: "Level",
    sortable: false,
    align: "left",
    field: x=> x
  },
  {
    name: "time",
    label: "Time",
    sortable: false,
    align: "left",
    field: x=> x
  },
  {
    name: "affixes",
    label: "Affixes",
    sortable: false,
    align: "left",
    field: x=> x
  },

  {
    name: "players",
    label: "Players",
    sortable: false,
    align: "left",
    field: x=> x
  },
  {
    name: "score",
    label: "Score",
    sortable: false,
    align: "center",
    field: x=> x
  },
]);

const visableColumns = Columns.value
  .map((x) => x.name)
  .filter((x) => {
    var show = true;

    if (props.zone && x == "zone") show = false;
    if (props.noCreatedTime && x == "created") show = false;
    if (props.noAffixes && x == "affixes") show = false;

    return show;
  });

let reRenderLs = ref([]);
let activeColumns = ref(visableColumns);
let paginationControl = ref({
  rowsPerPage: 20,
  page: 1,
  localRuns: [],
});
let loading = ref(false);


const GetDungeons = computed(() => data.Dungeons);
const GetClasses = computed(() => data.Classes);
const GetSpecs = computed(() => data.Specs);

const GetDungeonsDetails = (id) => {
  for (let i = 0; i < GetDungeons.value.length; i++) {
    const dungeon = GetDungeons.value[i];
    if (dungeon.keystone_id === id) {
      return dungeon;
    }
  }
};
const $router = useRouter();
const to = (url) => $router.push(url);

const toKey = (id) => to(`/lookup/run/${id}`);

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
const chests = (item) => {
  var time = item.time.clear_time / item.time.map_time;
  if (time <= 0.6) {
    return 3;
  } else if (time <= 0.8) {
    return 2;
  } else if (time <= 1) {
    return 1;
  } else {
    return 0;
  }
};

const refreshMethod = () => {
  setTimeout(() => {
    reRenderLs.value = [...props.runs];
    refreshMethod();
  }, 3000);
};
const FormatTimeUsed = (time) => moment.duration(time).format("HH:mm:ss")
const FormatTimeAgo = (time) =>  moment((time - 5) * 1000).fromNow();

const getRole = (spec) => GetSpec(spec)?.role;

const getRoleNr = (spec) => {
  if (GetSpec(spec)?.role == "TANK") {
    return 10000 + spec;
  } else if (GetSpec(spec)?.role == "HEALER") {
    return 20000 + spec;
  } else {
    return 30000 + spec;
  }
};
const GetSpec = (spec_id) => {
  if (!GetSpecs.value) return null;
  for (let i = 0; i < GetSpecs.value.length; i++) {
    const spec = GetSpecs.value[i];
    if (spec_id == spec.id) {
      return spec;
    }
  }
};
const getPlayersWithRoles = (players) => {
  players.forEach((player) => {
    player.sortNR = getRoleNr(player.spec);
    player.role = getRole(player.spec);
  });
  var ls = SF._sortBy(players, "sortNR");

  for (const key in SF.groupBy(ls, "role")) {
    if (SF.groupBy(ls, "role").hasOwnProperty(key)) {
      const element = SF.groupBy(ls, "role")[key];
      element[0].showIcon = true;
    }
  }
  return ls;
};

const baseUrl = document.location.origin;
const query = $router.currentRoute.value.query;

watch(runs, (newVal, oldVal) => {
  reRenderLs.value = runs.value;
});

onBeforeMount(() => {
  if (props.runs) {
    reRenderLs.value = runs.value;
  }
});
</script>
<style scoped>
a {
  color: inherit;
}
#roleImage {
  width: 20px;
  height: 20px;
}
.factionIconSize {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
.dungeonIconSize {
  width: 22px;
  height: 22px;
  margin-right: 5px;
}
.starIcon {
  transform: scale(0.6);
  width: 7px;
  color: goldenrod;
}
.upperButtons {
  right: 0px;
}
.minorTopMargin {
  margin-top: 8px;
}
</style>
