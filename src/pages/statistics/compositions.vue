<template>
  <div>
    <div>
      <div class="flex flex-center">
        <div class="Centertext HeaderSize HeaderFont">
          What's the "best" composition this week?
        </div>
      </div>
      <div class="flex flex-center">
        <p class="HeaderFont HeaderSize2">(ish)</p>
      </div>
    </div>
    <AffixSelector></AffixSelector>
    <template v-if="viewMode === 'table'">
      <CompositionTableView />
    </template>
    <template v-else>
      <CompositionsLists></CompositionsLists>
    </template>
  </div>
</template>
<script lang="ts" setup>
import CompositionsLists from "../../components/ListViews/CompositionsLists.vue";
import CompositionTableView from "../../components/ListViews/CompositionTableView.vue";
import AffixSelector from "../../components/ListViews/AffixSelector.vue";
import SF from "../../SharedFunctions";
import { useStore } from "src/store";
import { useQuasar } from "quasar";
import { computed } from "vue";

const store = useStore();
const data = store.state.data;

const Selected = data.Selected;
const SelectedAffixSet = data.SelectedAffixSet;
const GetSettings = data.settings;

const $q = useQuasar();
const viewMode = computed(() =>
  SF.GetDefaultView($q.screen.width, GetSettings)
);

const GetSavedSelected = () => store.dispatch("GetSelectedData");

const SaveSelectedAffixSet = (x) => store.commit("SaveSelectedAffixSet", x);
const SaveRIOData = (x) => store.commit("SaveRIOData", x);
</script>
