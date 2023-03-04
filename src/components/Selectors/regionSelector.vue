<template>
    <div id="mainDiv">
        <q-select 
            dark
            dense
            v-model="region"
            :options="GetRegions"
            borderless
            clearable
            :rounded="rounded"
            :outlined ="filled"> 
            <template v-slot:selected="scope">
  
          <template v-if="region">
                      <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
            
          >
                {{region.toUpperCase()}}
            </q-item>
          </template>
          <template v-else>
               <q-item-section >
              <q-item-label v-html="'Any'" />
            </q-item-section>
          </template>
            
            </template>
            
             <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
            
          >
            <q-item-section >
              <q-item-label v-html="scope.opt" />
            </q-item-section>
          </q-item>
            </template>
        </q-select>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    props: ['filled','rounded','input'],
    data() {
        return {
            region: null,
        }
    },
     methods: {
      setRegion(id) {
        if (this.GetRegions) {
        for (let i = 0; i < this.GetRegions.length; i++) {
          const region = this.GetRegions[i];
          if (region == id) {
            this.region = region
          }
        }
        }
      }
    },
    computed: {
        ...mapGetters(['GetRegions',])
    },
    watch: {
        region() {
            this.$emit('change', this.region)
        },
        GetRegions() {
          if (this.input) {
            this.setRegion(this.input)  
          }          
        }
    },
    created() {
      if (this.input) {
            this.setRegion(this.input)  
        }
    },
}
</script>

<style scoped>
    #mainDiv {
      min-width: 135;
    }
</style>