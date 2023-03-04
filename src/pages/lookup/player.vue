<template>
  <div id="LookupMain" class="HeaderFont">
    <div class="flex full-width justify-end ">
      <PeriodeSelector id="PeriodeSelectorcomp" :region="region" v-model="periode" />
      <br>
      <br>
    </div>
      <PlayerFetcher :name="playerName" :realm="realm" :region="region" :season="periode?.season?.id"
        v-slot="{ characterData, loading, error }">


        <div v-if="loading && !error && !characterData" class="flex full-width justify-center">
          <q-spinner-bars size="100px" color="primary" />
        </div>
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
  border-radius: 25px;
  border: 1px solid #494949;
  width: 340px;
  background-color: #2e2e2e;
}

.showStats:hover {
  cursor: pointer;
  background-color: #414141;
}

#LookupMain {
  position: relative;
}

#LookupSearchField {
  margin-top: 10px;
  width: 900px;
  background-color: #414141;
  border-radius: 50px;
  padding: 5px 25px;
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
  border: rgb(161, 161, 161) solid 1px;
  padding: 0 20px;
  text-align: center;
  border-radius: 20%;
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

