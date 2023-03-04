<template>
    <div>
          <div>
        <div class="flex flex-center">
      <div class="Centertext HeaderSize HeaderFont">What's the "best" class this week?</div>
    </div>
    <div class="flex flex-center">
      <p class="HeaderFont HeaderSize2">(ish)</p>
    </div>
    </div>
        <AffixSelector></AffixSelector>
        <template v-if="viewMode === 'table'">
          <ClassTableView :Selected="Selected"/>
        </template>
        <template v-else>
          <ClassLists :Selected="Selected"></ClassLists>
          <ClassInTimeRateList></ClassInTimeRateList>
        </template>
        <br>
        <br>
        <br>
        <br>
    </div>
</template>
<script lang="ts" setup>
  import ClassLists from '../../components/ListViews/ClassLists.vue';
  import ClassTableView from '../../components/ListViews/ClassTableView.vue';
  import ClassInTimeRateList from '../../components/ListViews/ClassInTimeRateList.vue';
  import AffixSelector from '../../components/ListViews/AffixSelector.vue';
  import SF from '../../SharedFunctions'
import { useStore } from 'src/store';
import { useQuasar } from 'quasar';
import { computed } from 'vue';

const store = useStore();
const data = store.state.data

const Selected = data.Selected
const SelectedAffixSet = data.SelectedAffixSet
const GetSettings = data.settings

const $q = useQuasar();
const viewMode = computed(()=> SF.GetDefaultView($q.screen.width,GetSettings))

const GetSavedSelected = () => store.dispatch('GetSelectedData')

const SaveSelectedAffixSet = x=> store.commit('SaveSelectedAffixSet', x)
const SaveRIOData = x=> store.commit('SaveRIOData', x)
</script>
<style>

</style>

