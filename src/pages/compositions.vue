<template>
    <div>
                  <div>
        <div class="flex flex-center">
      <div class="Centertext HeaderSize HeaderFont">What's the "best" composition this week?</div>
    </div>
    <div class="flex flex-center">
      <p class="HeaderFont HeaderSize2">(ish)</p>
    </div>
    </div>
        <AffixSelector></AffixSelector>
         <template v-if="viewMode === 'table'">
          <CompositionTableView/>
        </template>
        <template v-else>
        <CompositionsLists ></CompositionsLists>
        </template>

    </div>
</template>
<script>  
import CompositionsLists from '../components/ListViews/CompositionsLists.vue';
import CompositionTableView from '../components/ListViews/CompositionTableView.vue';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import AffixSelector from '../components/ListViews/AffixSelector.vue';
  import SF from '../SharedFunctions'

export default {
    components: {
        CompositionsLists,
        AffixSelector,
        CompositionTableView
    },
       computed: {
    ...mapGetters(["GetSavedSelected", "GetSelectedAffixSet","GetRIOData","GetSettings"]),
      Selected() {
        return this.GetSavedSelected
      },
      
        viewMode() {
          return SF.GetDefaultView(this,this.GetSettings)
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