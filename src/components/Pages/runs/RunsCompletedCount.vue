<template>
  <div>
    <div class="Footer">Runs completed in selected week</div>
    <q-separator dark />
    <div class="Topper relative">
      <h2 v-if="!fetching" class="kc-tnum">{{ formattedCount }}</h2>
      <q-spinner-bars
        v-else
        class="absolute-center"
        style="color: rgb(161, 161, 161)"
        :size="50"
      />
    </div>
    <q-separator dark />
    <AffixSelector :hidePictures="true" />
  </div>
</template>

<script lang="ts" setup>
import numeral from "numeral";
import axios from "axios";
import AffixSelector from "components/ListViews/AffixSelector.vue";
import { computed, ref, watch } from "vue";
import { useStore } from "src/store";
let count = ref(100000);
let fetching = ref(false);

const store = useStore();
const data = store.state.data;

const getCount = (periode) => {
  // SelectedPeriode may be a bare id or a { id } object — normalise, and skip
  // fetching until we actually have a week (a null id returned 0 → "Runs completed: 0").
  const id = periode && typeof periode === "object" ? periode.id : periode;
  if (id == null) return;
  count.value = 0;
  fetching.value = true;
  var apiUrl = data.apiUrl;
  axios
    .get(`${apiUrl}/Stats/RunCount?weekId=${id}`)
    .then((x) => {
      fetching.value = false;
      count.value = x.data;
    })
    .catch((x) => {
      fetching.value = false;
      console.log(x);
    });
};

const GetSelectedPeriode = computed(() => data.SelectedPeriode);
const formattedCount = computed(() => numeral(count.value).format("0,0"));

// immediate so the first available periode triggers a fetch even if it was set
// before this component mounted.
watch(GetSelectedPeriode, (val) => getCount(val), { immediate: true });
</script>

<style scoped>
h2 {
  margin: 0;
}
.Topper {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
