<template>
  <div>
    <div>
      <div class="flex flex-center">
        <div class="Centertext HeaderSize HeaderFont">
          What's the "best" spec this week?
        </div>
      </div>
      <div class="flex flex-center">
        <p class="HeaderFont HeaderSize2">(ish)</p>
      </div>
    </div>
    <AffixSelector></AffixSelector>
    <template v-if="viewMode === 'table'">
      <SpecTableView :selected="Selected" />
    </template>
    <template v-else>
      <SpecList />
    </template>
  </div>
  <br>
  <br>
  <br>
  <br>
</template>
<script setup lang="ts">
import { mapGetters, mapActions, mapMutations } from "vuex";
import AffixSelector from "../../components/ListViews/AffixSelector.vue";
import SpecList from "../../components/ListViews/SpecList.vue";
import SpecTableView from "../../components/ListViews/SpecTableView.vue";
import SF from "../../SharedFunctions";
import SpecsInTimeRateList from "../../components/ListViews/SpecsInTimeRateList.vue";
import { useStore } from "src/store";
import { useQuasar } from "quasar";
import { computed } from "vue";

const store = useStore();
const data = store.state.data;

const $q = useQuasar();
const viewMode = computed(() =>
  SF.GetDefaultView($q.screen.width, data.settings)
);

const Selected = computed(() => data.Selected);
const SelectedAffixSet = computed(() => data.SelectedAffixSet);
const RIOData = computed(() => data.RIOData);
const GetSettings = computed(() => data.settings);

const GetSelectedData = () => store.dispatch("GetSelectedData");
const SaveSelectedAffixSet = (x) => store.commit("SaveSelectedAffixSet", x);
const SaveRIOData = (x) => store.commit("SaveRIOData", x);
</script>
