<template>
  <div class="HeaderFont text-center">
    <SpecDataFetcher v-slot="{ data }" class="flex justify-around">
      <template v-if="data">
        <div v-for="(specls, i) in GroupedByRole(data.data)" :key="i">
          <div>Top performing {{ specls[0]?.role?.toLowerCase() }} this week</div>
          <br />
          <SpecPrettyViewer :data="SortByAvgScore(specls)[0]" />
        </div>
      </template>
      <template v-else>
        <q-skeleton
          v-for="i in 3"
          :key="i"
          style="height: 80px; width: 300px"
        />
      </template>
    </SpecDataFetcher>
    <br />
    <router-link to="/statistics/specs"
      >Click here to see full list...</router-link
    >
  </div>
</template>

<script lang="ts" setup>
import SpecDataFetcher from "../fetchers/SpecDataFetcher.vue";
import SpecPrettyViewer from "./SpecPrettyViewer.vue";
import SF from "../../SharedFunctions";
const GroupedByRole = (ls) => Object.values(SF.groupBy(ls, "role")).reverse();
const SortByAvgScore = (ls) =>SF._sortBy(ls, (x) => x.score / x.runs).reverse();
</script>

<style scoped>
a {
  color: inherit;
}
</style>
