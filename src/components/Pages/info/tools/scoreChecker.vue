<template>
  <div v-if="GetDungeons" class="HeaderFont ScoreChecker">
    <div class="text-red text-h5">This uses the old score system</div>
    <div class="row">
      <div class="col-6">
        <q-select
          class="maxSelection"
          label="Dungeon"
          dark
          v-model="dungeon"
          :display-value="`${dungeon?.label ?? 'None selected'}`"
          :options="dungeons"
        />
      </div>
      <div class="col-6">
        <div class="maxSelection">
          <div>Keystone level</div>
          <div>{{ level }}</div>
          <q-slider
            v-model="level"
            :min="2"
            :max="35"
            :step="1"
            color="orange"
            snap
          />
        </div>
      </div>
    </div>
    <br />
    <div>Duration</div>
    <div>{{ durationFormatted }} ({{ durationPercentage }}%)</div>
    <div class="durationSelector">
      <q-slider
        v-model="duration"
        :min="Math.round((dungeonDetails?.time ?? 0) * 0.4)"
        :max="Math.round((dungeonDetails?.time ?? 0) * 2.0)"
        :step="1000"
        color="orange"
        snap
      />
    </div>
    <br />
    <div class="HeaderSize3">
      <div>Score: {{ score }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import momentdur from "moment-duration-format";
import axios from "axios";
import { computed, ref, watch } from "vue";
import { useStore } from "src/store";

let dungeon = ref(null);
let level = ref(10);
let duration = ref(10);
let score = ref(0);
let bounce = ref(null);

const store = useStore();
const data = store.state.data;

const dungeonDetails = computed(() => {
  if (GetDungeons?.value) {
    for (let i = 0; i < GetDungeons?.value?.length; i++) {
      const _dungeon = GetDungeons?.value?.[i];
      if (_dungeon?.keystone_id == dungeon.value.value) {
        return _dungeon;
      }
    }
  }
});

const GetDungeons = computed(() => data.Dungeons);

watch(GetDungeons, () => {
  const dung = GetDungeons?.value?.[0];
  dungeon.value = {label: dung.name, value: dung.keystone_id};
});
watch(dungeon, (newValue, oldValue) => {
  duration.value = dungeonDetails.value?.time;
});

watch(duration, () => {
  GetScore();
});

watch(level, () => {
  GetScore();
});



const GetScore = () => {
  var apiUrl = data.apiUrl;
  var bon = setTimeout(function () {
    if (bounce.value == bon) {
      axios
        .get(
          apiUrl +
            "/Score?duration=" +
            (duration.value - 1) +
            "&keystone_level=" +
            level.value +
            "&dungeon_time=" +
            dungeonDetails.value?.time
        )
        .then(function (response) {
          score.value = Math.round(response.data * 100) / 100;
        })
        .catch(function (ex) {
          console.log(ex);
          score.value = 0;
        });
    }
  }, 100);
  bounce.value = bon;
};

const durationFormatted = computed(() =>
  moment.duration(duration.value).format("mm:ss")
);
const durationPercentage = computed(() =>
  Math.round((duration.value / dungeonDetails.value?.time) * 100)
);
const dungeons = computed(() => {
  var ls = [];
  if (GetDungeons?.value) {
    for (let i = 0; i < (GetDungeons?.value?.length ?? 0); i++) {
      const dungeon = GetDungeons?.value?.[i];
      var item = {
        label: dungeon.name,
        value: dungeon.keystone_id,
      };
      ls.push(item);
    }
  }
  if (!dungeon.value) {
    dungeon.value = ls[0];
    duration.value = dungeonDetails.value?.time;
  }
  return ls;
});

</script>

<style scoped>
.maxSelection {
  max-width: 400px;
  margin: auto;
}
.ScoreChecker {
  padding: 1%;
}
.durationSelector {
  margin: auto;
  max-width: 900px;
}
</style>
