<template>
  <div v-if="data" class="HeaderFont text-center">
    <h2>Success rate</h2>
    <div class="flex flex-center">
      <div class="flex flex-between ListCSS" v-for="(_class, index) in data" :key="index">
        <q-tooltip> Runs: {{ _class.total_runs }} </q-tooltip>
        <CloudinaryFormat
          :url="`classes/${classDetails(_class.id)?.name?.replace(' ', '-')}.jpg`"
          v-slot="{ link }"
        >
          <div
            id="DungeonDot"
            class="text-center shadow-24 relative-position"
            :style="{ 'background-image': `url(${link})` }"
          >
            <div class="percentBackground absolute-center">
              <div>{{ _class.ontime_percent.toFixed(0) }}%</div>
            </div>
          </div>
        </CloudinaryFormat>
        <div class="text-center" style="margin: auto">
          {{ classDetails(_class.id)?.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { useStore } from "src/store";
import { computed, onBeforeMount, ref, watch } from "vue";
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";

const data = ref(null);
const fetching = ref(false);
const error = ref(false);

const store = useStore();
const _data = store.state.data;

const SelectedPeriode = computed(() => _data.SelectedPeriode);
const GetClasses = computed(() => _data.Classes);
const Settings = computed(() => _data.settings);

onBeforeMount(() => {
  if (SelectedPeriode.value) {
    fetchData();
  }
});

const fetchData = () => {
  fetching.value = true;
  var apiUrl = _data.apiUrl;

  axios
    .get(
      apiUrl +
        "/Class/ontimerate?periode=" +
        SelectedPeriode.value +
        "&min_level=" +
        Settings.value.min_keystonelevel +
        "&amount=" +
        Settings.value.max_runs +
        "&limitToLowestDungeon=" +
        Settings.value.limitbylowestdungeon
    )
    .then(function (response) {
      data.value = response.data;
      fetching.value = false;
    })
    .catch(function (error) {
      console.log(error);
      error.value = true;
      fetching.value = false;
    });
};

const classDetails = (id) => {
  for (let i = 0; i < GetClasses.value.length; i++) {
    const _class = GetClasses.value[i];
    if (_class.id == id) {
      return _class;
    }
  }
};

watch(SelectedPeriode, () => {
  data.value = null;
  error.value = false;
  fetchData();
});
</script>

<style>
.percentBackground {
  border-radius: 25px;
  opacity: 0.8;
  padding: 5px 5px 5px 5px;
  background-color: black;
}

#DungeonDot {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  margin: 15px;
  font-size: 50px;
  background-position: center;
  /* Center the image */
  background-size: cover;
}

.ListCSS {
  width: 180px;
}
</style>
