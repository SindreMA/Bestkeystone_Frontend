<template>
    <div>
      <div v-if="GetSelectedPeriode && c_data && GetSelectedPeriode != c_data.periode || !Classes('DAMAGE')" class="flex flex-center">
          <q-spinner-puff style="color: rgb(161, 161, 161)" size="500" />
      </div>
       <div v-else-if="Classes('DAMAGE').length === 0 && Classes('TANK').length === 0 && Classes('HEALER').length === 0" class="HeaderFont nodataInfo">
          <h4 class="flex flex-center">No data found!</h4>
          <p  class="flex flex-center">Try to change the settings up in the right</p>
      </div>
      <div class="HeaderFont" v-else>
      <div v-if="Classes('DAMAGE')" class="flex justify-around HeaderFont">
          <div v-for=" i in RoundUp(Classes('DAMAGE').length/ 6)" :key="Math.random() + i">
          <div class="Centertext HeaderSize3">DPS</div>
          <div class="Centertext HeaderSize2">{{(i * 6 - 6) + 1 }}-{{i * 6}}</div>
          <br>
          <div class="flex justify-around Centertext">
            <div>Rank</div>
            <div style="min-width: 150px;">Class</div>
            <div>Score</div>
          </div>
          <div v-for="Class in Classes('DAMAGE')" :key="Math.random() + Class.class.id">
            <ClassViewer v-if="Class.rank > (i * 6 - 6)  && Class.rank <= i * 6" :ClassItem="Class" :ShowAll="true"></ClassViewer>
          </div>
        </div>
        <div>
          <div class="Centertext HeaderSize3">Healer</div>
          <br>
          <div class="flex Centertext justify-around">
            <div>Rank</div>
            <div style="min-width: 150px;">Class</div>
            <div>Score</div>
          </div>
          <div v-for="Class in Classes('HEALER')" :key="Math.random() + Class.class.id">
            <ClassViewer :ClassItem="Class"></ClassViewer>
          </div>
        </div>
        <div>
          <div class="Centertext HeaderSize3">Tank</div>
          <br>
          <div class="flex Centertext justify-around">
            <div>Rank</div>
            <div style="min-width: 150px;">Class</div>
            <div>Score</div>
          </div>
          <div v-for="Class in Classes('TANK')" :key="Math.random() + Class.class.id">
            <ClassViewer :ClassItem="Class" ></ClassViewer>
          </div>
        </div>
      </div>
      </div>

    </div>
</template>

<script lang="ts" setup>
import ClassViewer from '../ItemViews/ClassViewer.vue';
import underscore from 'underscore'
import sf from '../../SharedFunctions'
import { useStore } from 'src/store';
import { computed, onBeforeMount, toRefs } from 'vue';
import { useRouter } from 'vue-router';

const store = useStore();
const _data = store.state.data

const props = defineProps({
  Selected: {},
  Dungeon: {},
  dungeon: {}
})

const { Selected, Dungeon, dungeon } = toRefs(props)

const fetchSpecData = (x) => store.dispatch('fetchSpecData')

const RoundUp = (int) => {
        var rtn = 0;
        if (int.toFixed() == int) rtn =  int
        else if (int.toFixed() > int) rtn = (int).toFixed();
        else rtn = (int + 0.66).toFixed();
        return parseInt(rtn as any)
      }

const calcClassScore = (ls) => {
        var total = 0;
        if (ls) {
          for (let i = 0; i < ls.length; i++) {
          const spec = ls[i];
          total += spec.score
          }
        }
        return total
       }

const calcRunsScore = (ls) => {
         var runs = 0;
         if (ls) {
           for (let i = 0; i < ls.length; i++) {
          const spec = ls[i];
          runs += spec.runs
          }
        }
        return runs
       }

const Classes = (role) => {
         if (c_data.value) {
          var ls = underscore.toArray(sf.groupBy(sf.groupBy(c_data.value.data,'role')[role],'class_id'));
        var rawls = sf.groupBy(c_data.value.data,'role')[role];
        var totalscore = 0
        if (rawls) {
          for (let i = 0; i < rawls.length; i++) {
            const item = rawls[i];
            totalscore += item.score
          }
        }

        var _ls = []
        for (let i = 0; i < ls.length; i++) {
          const specs = ls[i];
          var _class : any = {
            class: specs[0].class,
            specs: specs,
            score: calcClassScore(specs),
            runs: calcRunsScore(specs),
            display_score: 0
          }
          _class.display_score = sf.GetPoints(_class.score, Settings.value.score_type, totalscore,_class.runs),
          _ls.push(_class)
        }
        return sf.getListWithRank(sf._sortBy(_ls,'display_score'));
         }
       }

 const Settings = computed(() => _data.settings)
 const GetSpecData = computed(() => _data.Spec_Data)
 const GetSpecs = computed(() => _data.Specs)
 const GetClasses = computed(() => _data.Classes)
 const GetDungeonSpecData = computed(() => _data.Spec_Dungeon_Data)
 const GetDungeonData = computed(() => _data.Dungeons_Data)
 const GetSelectedPeriode = computed(() => _data.SelectedPeriode)

 const $router = useRouter()

 const ownPage = computed(()=> $router.currentRoute?.value?.path == "/classes")

 const Reloaded_Timestamp = computed(() => _data.Reloaded_Timestamp)

 const c_data = computed(()=> {
  if (!GetSpecData.value) return []
  let GetSpecDataLs = [...GetSpecData.value?.data].map(x=> ({...x}))

        if (dungeon.value) {
          var data = sf._sortBy([...GetDungeonSpecData.value].map(x=> ({...x})).filter( x=> { return x.dungeon === dungeon.value && GetSelectedPeriode.value === x.periode && x.created > Reloaded_Timestamp.value}), 'created').reverse()[0]
          if (data) {
            sf.AddClassToSpecs(data.data,[...GetClasses.value].map(x=> ({...x})));
            sf.AddSpecDetailsToSpec(data.data,[...GetSpecs.value].map(x=> ({...x})))
            return data
          }
      } else if(!dungeon.value && !data){
        if (GetSpecData.value && GetSpecData.value.data) {
          sf.AddClassToSpecs(GetSpecDataLs,[...GetClasses.value].map(x=> ({...x})));
          sf.AddSpecDetailsToSpec(GetSpecDataLs,[...GetSpecs.value].map(x=> ({...x})));
        }
        return {...GetSpecData.value, data: GetSpecDataLs}
      }
      })

onBeforeMount(() => {
  if (dungeon.value && !c_data.value) {
        fetchSpecData({id: dungeon.value});
      }
})
</script>
