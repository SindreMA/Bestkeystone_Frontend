<template>
  <div>
    <q-img
      :src="`${DungeonDetails.imageurl}`"
      class="DungeonWindow"
      @click="ShowDetails()"
      ref="DungeonWindow"
    >
      <q-resize-observer @resize="SetSize()" />

      <div class="absolute-center noBg">
        <div class="flex flex-center">
          <div id="nameBox" :style="'font-size:' + TextSize1 + 'px;'">
            {{ DungeonDetails.short_name }}
          </div>
        </div>
      </div>

      <div class="absolute-left noBg">
        <div class="Ccenter" style="margin-left: 27px">
          <div
            class="flex flex-center"
            id="rankBox"
            :style="
              'font-size:' +
              TextSize2 +
              'px; width: ' +
              RankWH +
              'px; height: ' +
              RankWH +
              'px;'
            "
          >
            <div class>{{ dungeon.rank }}</div>
          </div>
        </div>
      </div>

      <div class="absolute-right noBg">
        <div class="Ccenter" style="margin-right: 25px">
          <div id="points" class="flex flex-center">
            <div :style="'font-size:' + TextSize2 + 'px;'" class="flex">
              {{ dungeon.display_score }}
              <div v-if="Settings.score_type == 'percent'">%</div>
            </div>
            <q-tooltip>
              <p>Total Runs: {{ dungeon.total_runs }}</p>
              <p class v-for="(runs, level) in dungeon.runs" :key="level">
                +{{ level }}: {{ runs }}
              </p>
            </q-tooltip>
          </div>
        </div>
      </div>
    </q-img>
    <div v-if="expanded" id="DungeonMoreInfoWindow">
      <q-card class="background">
        <q-tabs v-model="tab" animated swipeable class="HeaderFontv2" align="justify">
          <q-tab default name="Composition" label="Best Composition" />
          <q-tab name="Class" label="Best Class" />
          <q-tab name="Spec" label="Best DPS Spec" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated class="background">
          <q-tab-panel keep-alive name="Composition">
            <q-scroll-area style="height: 700px">
              <CompositionsLists :dungeon="DungeonDetails.zone"></CompositionsLists>
            </q-scroll-area>
          </q-tab-panel>
          <q-tab-panel keep-alive name="Class">
            <q-scroll-area style="height: 600px">
              <template v-if="viewMode === 'table'">
                <ClassTableView :dungeon="dungeon.id" />
              </template>
              <template v-else>
                <ClassLists :dungeon="DungeonDetails.zone"></ClassLists>
              </template>
            </q-scroll-area>
          </q-tab-panel>
          <q-tab-panel keep-alive name="Spec">
            <q-scroll-area style="height: 600px">
              <template v-if="viewMode === 'table'">
                <SpecTableView :dungeon="dungeon.id" />
              </template>
              <template v-else>
                <SpecList :dungeon="DungeonDetails.zone"></SpecList>
              </template>
            </q-scroll-area>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ClassLists from "./ListViews/ClassLists.vue";
import ClassTableView from "./ListViews/ClassTableView.vue";
import SpecTableView from "./ListViews/SpecTableView.vue";
import SpecList from "./ListViews/SpecList.vue";
import CompositionsLists from "./ListViews/CompositionsLists.vue";
import FactionShower from "./FactionShower.vue";
import sf from "../SharedFunctions";
import { computed, getCurrentInstance, ref, toRefs } from "vue";
import { useStore } from "src/store";
import { useQuasar } from "quasar";

const props = defineProps({
  dungeon: {
    type: Object,
  },
  expanded: {
    type: Boolean,
  },
  Selected: {},
  totalScore: {
    type: Number,
  },
});

const { dungeon, expanded, Selected, totalScore } = toRefs(props);

const TextSize1 = ref(30);
const TextSize2 = ref(20);
const RankWH = ref(35);
const tab = ref("Composition");

const store = useStore();
const data = store.state.data;

const GetDungeons = computed(() => data.Dungeons);
const Settings = computed(() => data.settings);

const baseUrl = computed(() => document.location.origin);

const $q = useQuasar();
const viewMode = computed(() => sf.GetDefaultView($q.screen.width, Settings));

const DungeonDetails = computed(() => {
  for (let i = 0; i < GetDungeons.value.length; i++) {
    const item = GetDungeons.value[i];
    if (item.keystone_id === dungeon.value.id) {
      return item;
    }
  }
});

const emits = defineEmits(["click"]);
const instance = getCurrentInstance();

const ShowDetails = () => {
  if (expanded.value) {
    emits("click", false);
  } else {
    emits("click", DungeonDetails.value.keystone_id);
  }
  setTimeout(() => {
    instance?.proxy?.$forceUpdate();
  }, 100);
};

const DungeonWindow = ref(null);

const SetSize = () => {
  if (DungeonWindow !== undefined) {
    if (DungeonWindow.clientWidth < 666) {
      TextSize1.value = 20;
      TextSize2.value = 15;
      RankWH.value = 25;
    } else {
      RankWH.value = 35;
      TextSize1.value = 30;
      TextSize2.value = 20;
    }
  }
};
</script>
<style>
#points {
  background-color: #252525;
  color: rgb(161, 161, 161);
  border-radius: 10px;
  padding: 0 5px;
  border: rgb(161, 161, 161) 0.5px solid;
}

#nameBox {
  color: rgb(161, 161, 161);
  border-radius: 10px;
  padding: 1px 12px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
}

#rankBox {
  color: rgb(161, 161, 161);
  border-radius: 50px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
}

.DungeonWindow {
  z-index: 3;
  position: relative;
  height: 70px;
  border-radius: 10px;
  margin: 10px 5px;
}

.DungeonWindow:hover {
  border: rgb(161, 161, 161) 1px solid;
  cursor: pointer;
}

#DungeonMoreInfoWindow {
  padding: 5px;
  padding-top: 38px;
  z-index: 2;
  margin: 0px 10px -45px 10px;
  position: relative;
  border-radius: 15px;
  top: -50px;
  border: rgb(161, 161, 161) 1px solid;
  border-top: 0px;
}
.noBg {
  background: none !important;
}
</style>
