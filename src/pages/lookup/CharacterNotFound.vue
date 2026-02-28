<template>
  <div class="fixed-center text-center character-not-found">
    <p>
      <q-icon name="sentiment_dissatisfied" size="150px" color="grey-6" />
    </p>
    <h4 class="text-h5 q-mb-md">Character No Longer Exists</h4>
    <p class="text-faded q-mb-lg">
      This character has probably been moved, renamed, or deleted.
    </p>
    
    <div class="q-gutter-md">
      <q-btn
        color="primary"
        style="width:200px;"
        @click="$router.push('/')"
      >
        Go Home
      </q-btn>
      
      <q-btn
        v-if="canShowLastVersion"
        color="secondary"
        style="width:200px;"
        :loading="loadingLastVersion"
        @click="showLastVersion"
      >
        View Last Seen Version
      </q-btn>
    </div>

    <div v-if="lastVersionData" class="q-mt-xl">
      <q-separator class="q-my-md" />
      <h5 class="text-h6 q-mb-md">Last Seen Data</h5>
      <PlayerView 
        :data="lastVersionData" 
        :player="name" 
        :realm="realm" 
        :region="region" 
        :periode="periode"
      />
    </div>

    <div v-if="lastVersionError" class="q-mt-lg text-negative">
      <p>Could not retrieve last seen version.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'src/store'
import axios from 'axios'
import PlayerView from 'src/components/lookup/player/PlayerView.vue'

const props = defineProps<{
  blizzardId?: number | string
  region?: string
  season?: number
  name?: string
  realm?: string
  periode?: any
}>()

const $router = useRouter()
const store = useStore()
const data = store.state.data

const loadingLastVersion = ref(false)
const lastVersionData = ref(null)
const lastVersionError = ref(false)

const canShowLastVersion = computed(() => {
  return props.blizzardId && props.region && props.season
})

const showLastVersion = async () => {
  if (!props.blizzardId || !props.region || !props.season) return
  
  loadingLastVersion.value = true
  lastVersionError.value = false
  
  try {
    const apiUrl = data.apiUrl
    const url = `${apiUrl}/Player/full/db/${props.blizzardId}?region=${props.region}&season=${props.season}`
    const response = await axios.get(url)
    lastVersionData.value = response.data
  } catch (err) {
    lastVersionError.value = true
  } finally {
    loadingLastVersion.value = false
  }
}
</script>

<style scoped>
.character-not-found {
  max-width: 800px;
  padding: 20px;
}
</style>
