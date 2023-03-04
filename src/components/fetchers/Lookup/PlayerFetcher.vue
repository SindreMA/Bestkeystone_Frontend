<template>
  <slot :characterData="playerData" :loading="loading" :error="error" />
</template>

<script lang="ts" setup>
import axios from 'axios'
import { useStore } from 'src/store';
import { computed, onBeforeMount, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  realm: {
    type: String,
  },
  name: {
    type: String,
  },
  season: {
    type: Number,
  },
  region: {
    type: String,
  }
})

const { realm, name, season, region } = toRefs(props)

const blizzId = computed(() => $router.currentRoute.value.params.key as string)

const playerData = ref(null)
const error = ref(null)
const loading = ref(null)

const store = useStore()
const data = store.state.data

const $router = useRouter()

const FetchPlayer = () => {
  var apiUrl = data.apiUrl;

  const isBlizz = $router.currentRoute.value.path.includes("blizz")
  if ( (!isBlizz ? (!region.value || !realm.value || !name.value) : !blizzId.value)  || !season.value ) return null;

  let url = isBlizz ?
  `${apiUrl}/Player/full/blizzard/${blizzId.value}?season=${season.value}`:
  `${apiUrl}/Player/full?character=${name.value}&realm=${realm.value}&region=${region.value}&season=${season.value}`

  axios.get(url).then(x => {
      if (x.data) playerData.value = x.data
    }).catch(x => {
      error.value = x;
    }).finally(() => {
      loading.value = false
    });
}

const FetchData = () => {
  playerData.value = null;
  error.value = null;
  loading.value = true;
  FetchPlayer();
}

watch([name,realm, region,season, blizzId], () => {
  FetchData();
})

onBeforeMount(() => {
  FetchData();
})
</script>
