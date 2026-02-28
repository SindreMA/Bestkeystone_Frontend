<template>
  <div class="character-not-found">
    <div v-if="!lastVersionData" class="text-center q-pa-xl">
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
    </div>

    <div v-if="lastVersionData" class="q-pa-md">
      <div class="text-center q-mb-lg">
        <q-btn
          flat
          color="primary"
          icon="arrow_back"
          label="Back"
          @click="lastVersionData = null"
        />
      </div>
      <PlayerView 
        :data="lastVersionData" 
        :player="name" 
        :realm="realm" 
        :region="region" 
        :periode="periode"
      />
    </div>

    <div v-if="lastVersionError" class="text-center q-mt-lg text-negative">
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
  return (props.blizzardId || (props.name && props.realm && props.region)) && props.season
})

const searchForBlizzardId = async (): Promise<number | null> => {
  if (!props.name || !props.region) return null
  
  const apiUrl = data.apiUrl
  const searchUrl = `${apiUrl}/Search?search=${props.name}`
  
  try {
    const response = await axios.get(searchUrl)
    if (response.data && Array.isArray(response.data)) {
      // Find exact match by name, realm, and region
      const match = response.data.find((item: any) => 
        item.name?.toLowerCase() === props.name?.toLowerCase() &&
        item.realm?.toLowerCase() === props.realm?.toLowerCase() &&
        item.region?.toLowerCase() === props.region?.toLowerCase()
      )
      if (match?.blizzard_id || match?.blizzardId || match?.id) {
        return match.blizzard_id || match.blizzardId || match.id
      }
    }
    return null
  } catch {
    return null
  }
}

const showLastVersion = async () => {
  if (!props.season) return
  
  loadingLastVersion.value = true
  lastVersionError.value = false
  
  try {
    const apiUrl = data.apiUrl
    let blizzId = props.blizzardId
    
    // If we don't have blizzardId, search for it first
    if (!blizzId && props.name && props.realm && props.region) {
      blizzId = await searchForBlizzardId()
    }
    
    if (!blizzId) {
      lastVersionError.value = true
      return
    }
    
    const url = `${apiUrl}/Player/full/db/${blizzId}?region=${props.region}&season=${props.season}`
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
  width: 100%;
}
</style>
