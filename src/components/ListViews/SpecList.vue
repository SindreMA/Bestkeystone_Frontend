<template>
  <div>

    <div v-if="GetSelectedPeriode && c_data && GetSelectedPeriode != c_data.periode || !Specs('DAMAGE')" class="flex flex-center">
          <q-spinner-puff style="color: rgb(161, 161, 161)" size="500" />
    </div>
    <div v-else>
      <div v-if="Specs('DAMAGE').length === 0" class="HeaderFont nodataInfo">
          <h4 class="flex flex-center">No data found!</h4>
          <p  class="flex flex-center">Try to change the settings up in the right</p>
      </div>
      <div v-else>
        <br>
        <div class="flex flex-center">
          <div style="width: 100%;" class="SpecMaxWidth HeaderFont relative-position">
            <div class="absolute-left" style="margin-left: 25px;">
              <div>Rank</div>
            </div>
            <div class="absolute-right" style="margin-right: 25px;">
              <div>Score</div>
            </div>
            <div class="absolute-center">
              <div>Name</div>
            </div>
          </div>
        </div>
        <br>
        <br>
        <div class="flex justify-around  HeaderFont">
          <div style="width: 100%;" v-for="spec in Specs('DAMAGE')" :key="spec.id">
            <SpecViewer v-if="spec.rank < 11 || DPSSpecShowAll" :SpecItem="spec"></SpecViewer>
          </div>
        </div>
        <div class="flex flex-center">
          <div v-if="!DPSSpecShowAll" @click="DPSSpecShowAll = true" id="SpecShowerShowAllbtn" class="HeaderFont ">Show
            all</div>
          <div v-if="DPSSpecShowAll" @click="DPSSpecShowAll = false" id="SpecShowerShowAllbtn" class="HeaderFont ">Show
            less</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import sf from '../../SharedFunctions'
import SpecViewer from '../ItemViews/SpecViewer.vue';
import underscore from 'underscore'
import { computed, onBeforeMount, ref, toRefs } from 'vue';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';

const props = defineProps({
  Selected: {},
  dungeon: {}
})

const { Selected, dungeon } = toRefs(props)

const DPSSpecShowAll = ref(false)

const store = useStore()
const _data = store.state.data

const GetSpecData = computed(() => _data.Spec_Data)
const GetSpecs = computed(() => _data.Specs)
const GetClasses = computed(() => _data.Classes)
const GetDungeonSpecData = computed(() => _data.Spec_Dungeon_Data)
const GetDungeonData = computed(() => _data.Dungeons_Data)
const GetSelectedPeriode = computed(() => _data.SelectedPeriode)
const Settings = computed(() => _data.settings)

const Reloaded_Timestamp = computed(() => _data.Reloaded_Timestamp)

const c_data = computed(() => {
      var cpData = [...(GetSpecData.value?.data ?? [])].map(x=> ({...x}))
        if (dungeon.value) {
          var data = sf._sortBy([...(GetDungeonSpecData.value ?? [])].map(x=> ({...x})).filter( x=> { return x.dungeon === dungeon.value && GetSelectedPeriode.value === x.periode && x.created > Reloaded_Timestamp.value}), 'created').reverse()[0]
          if (data) {
            sf.AddClassToSpecs(data.data,GetClasses.value);
            sf.AddSpecDetailsToSpec(data.data,GetSpecs.value)
            return data
          }
      } else if(!dungeon.value){
        if (GetSpecData.value && GetSpecData.value.data) {
          sf.AddClassToSpecs(cpData,GetClasses.value);
          sf.AddSpecDetailsToSpec(cpData,GetSpecs.value);
        }
        return {...GetSpecData.value, data: cpData}
       }
      })

      const $router = useRouter()
      const ownPage = computed(() => $router.currentRoute.value.path.includes("/specs"))

      const fetchSpecData = x => store.dispatch('fetchSpecData', x)

      const Specs = (role) => {
         if (c_data.value) {
          var ls = underscore.toArray(sf.groupBy(c_data.value.data,'role')[role]);
        var rawls = sf.groupBy(c_data.value.data,'role')[role];
        var totalscore = 0
        if (rawls) {
          for (let i = 0; i < rawls.length; i++) {
            const item = rawls[i];
            totalscore += item.score
          }
        }
        for (let i = 0; i < ls.length; i++) {
          const spec = ls[i];
          spec.display_score = sf.GetPoints(spec.score, Settings.value.score_type, totalscore,spec.runs)
        }
        return sf.getListWithRank(sf._sortBy(ls,'display_score'));
         }
    }

const compare = (a, b) => {
        if (a.score > b.score)
          return -1;
        if (a.score < b.score)
          return 1;
        return 0;
      }

const GetBestSpec = (Classes) => {
        var ls = []
        Classes.forEach(Class => {
          Class.specs.forEach(spec => {
            spec.class = Class;
            ls.push(spec);
          });
        });

        ls.sort(compare);
        var rank = 1;
        ls.forEach(spec => {
          spec.rank = rank;
          rank++;
        });
        return ls
      }

onBeforeMount(() => {
  if (ownPage.value) {
        DPSSpecShowAll.value = true
      }
      if (dungeon.value && !c_data.value) {
        fetchSpecData({ id: dungeon.value });
      }
})
</script>
<style>
  #SpecShowerShowAllbtn{
    width: 80px;
    border: rgb(161, 161, 161) 1px solid;
    border-radius: 20px;
    padding: 3px 2px;
    text-align: center;
  }
  #SpecShowerShowAllbtn:hover {
    cursor: pointer;
  }

</style>
