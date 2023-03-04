<template>
    <div>
         <div>
        <div class="flex flex-center">
      <div class="Centertext HeaderSize HeaderFont">What's the "best" spec this week?</div>
    </div>
    <div class="flex flex-center">
      <p class="HeaderFont HeaderSize2">(ish)</p>
    </div>
    </div>
        <AffixSelector></AffixSelector>
        <template v-if="viewMode === 'table'">
          <SpecTableView/>
        </template>
        <template v-else>
          <SpecList/>
        </template>

        
    </div>
</template>
<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import AffixSelector from '../components/ListViews/AffixSelector.vue';
  import SpecList from '../components/ListViews/SpecList.vue';
  import SpecTableView from '../components/ListViews/SpecTableView.vue';
  import SF from '../SharedFunctions'

  import SpecsInTimeRateList from '../components/ListViews/SpecsInTimeRateList.vue';


export default {
    components: {
        AffixSelector,
        SpecList,
        SpecsInTimeRateList,
        SpecTableView
    },
      computed: {
        viewMode() {
          return SF.GetDefaultView(this,this.GetSettings)
        },
    ...mapGetters(["GetSavedSelected", "GetSelectedAffixSet","GetRIOData","GetSettings"]),
      Selected() {
        return this.GetSavedSelected
      },
      SelectedAffixSet() {
        return this.GetSelectedAffixSet
      },
      RIOData () {
        return this.GetRIOData
      }
  },
  methods: {
      
       ...mapActions(['GetSelectedData']),
    ...mapMutations(['SaveSelectedAffixSet','SaveRIOData']),
  }
}
</script>

