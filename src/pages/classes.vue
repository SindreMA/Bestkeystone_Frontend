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
    </div>
</template>
<script>
  import ClassLists from '../components/ListViews/ClassLists.vue';
  import ClassTableView from '../components/ListViews/ClassTableView.vue';
import ClassInTimeRateList from '../components/ListViews/ClassInTimeRateList.vue';
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import AffixSelector from '../components/ListViews/AffixSelector.vue';
  import SF from '../SharedFunctions'

export default {
    components: {
        ClassLists,
        AffixSelector,
        ClassInTimeRateList,
        ClassTableView
    },
       computed: {
    ...mapGetters(["GetSavedSelected", "GetSelectedAffixSet","GetSettings"]),
      Selected() {
        return this.GetSavedSelected
      },
      SelectedAffixSet() {
        return this.GetSelectedAffixSet
      },
        viewMode() {
          return SF.GetDefaultView(this,this.GetSettings)
        },
    
  },
  methods: {
      
       ...mapActions(['GetSelectedData']),
    ...mapMutations(['SaveSelectedAffixSet','SaveRIOData']),
  }
}
</script>
<style>

</style>

