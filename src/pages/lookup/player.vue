<template>
  <div id="LookupMain" class="HeaderFont">
    <div class="flex full-width justify-end ">
      <PeriodeSelector id="PeriodeSelectorcomp" :region="region" v-model="periode" />
      <br>
      <br>
    </div>
      <PlayerFetcher :name="playerName" :realm="realm" :region="region" :season="periode?.season?.id"
        v-slot="{ characterData, loading, error, notFound, blizzardId }">


        <div v-if="loading && !error && !characterData && !notFound" class="flex full-width justify-center">
          <q-spinner-bars size="100px" color="primary" />
        </div>
        <template v-else-if="notFound">
          <CharacterNotFound 
            :blizzardId="blizzardId" 
            :region="region" 
            :season="periode?.season?.id"
            :name="playerName"
            :realm="realm"
            :periode="periode"
          />
        </template>
        <template v-else-if="error">error:{{ error }}</template>
        <template v-else-if="!loading && !error && characterData">
          <PlayerView :data="characterData" :player="playerName" :realm="realm" :region="region" :periode="periode" />
        </template>
      </PlayerFetcher>
  </div>
</template>

<script lang="ts" setup>
import PeriodeSelector from "../../components/lookup/PeriodeSelector.vue";
import PlayerFetcher from "../../components/fetchers/Lookup/PlayerFetcher.vue";
import PlayerView from "../../components/lookup/player/PlayerView.vue";
import CharacterNotFound from "./CharacterNotFound.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const periode = ref(null)
const $router = useRouter()

const region = computed(() => $router.currentRoute.value.params.region as string)
const realm = computed(() => $router.currentRoute.value.params.realm as string)
const playerName = computed(() => $router.currentRoute.value.params.name as string)
</script>

<style scoped>
.lncWidth {
  max-width: 875px;
  min-width: 300px;
  width: 100%;
}

.cWidth {
  max-width: 1250px;
  min-width: 300px;
  width: 100%;
}

.rncWidth {
  max-width: 370px;
  min-width: 300px;
  width: 100%;
}

.showStats {
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
  width: 340px;
  background: var(--bg-surface);
  transition: all var(--transition-normal);
}

.showStats:hover {
  cursor: pointer;
  background: var(--bg-hover);
  border-color: var(--border-accent);
}

#LookupMain {
  position: relative;
}

#LookupSearchField {
  margin-top: 10px;
  width: 900px;
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  padding: 5px 25px;
  border: 1px solid var(--border-default);
}

.regionSelector {
  width: 70px;
}

.realmSelector {
  width: 100px;
}

.characterDataClass {
  width: 100%;
}

.NameScore {
  border: 1px solid var(--border-default);
  padding: 0 20px;
  text-align: center;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
}

.InputField {
  width: 90%;
  margin: auto;
}

.staticToggle {
  position: absolute;
  margin: 18px -10px;
}

.bottomMargin {
  margin-bottom: 20px;
}

.minorBr {
  height: 8px;
  margin: 0px;
}
</style>

