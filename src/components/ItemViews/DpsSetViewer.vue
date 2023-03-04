<template>
  <div id="Combodiv" ref="ComboWindow" class="HeaderFont Centertext flex flex-center ">

    <template v-for="(spec, index) in FilterFirst">
      <CloudinaryFormat :url="`roles/${GetSpec(spec)?.role?.toLowerCase()}.png`" v-slot="{ link }">
        <div v-if="index == 0" :class="{SpecFieldTwo: specificSetup.length == 2 , SpecFieldThree: specificSetup.length == 3}" class="specMarginRight RoundLeftSideDiv SideDiv" :key="Math.random() +spec + index + 'SpecViewer'">
          <img v-if="type == 2 || type + index == 30" class="absolute-left" style="left: -16px; width: 25px; margin-top: 2px;" :src="link">
          <div class="HiddenOverflow " :style="'color: ' + GetColorString(GetClass(GetSpec(spec)?.class)?.name) ">{{ GetSpec(spec)?.name}}
            <q-tooltip>
              {{ GetSpec(spec)?.name + ' ' + GetClass(GetSpec(spec)?.class)?.name}}
            </q-tooltip>
          </div>
        </div>
        <div v-if="index == 1 && GetSpec(spec)?.role !== 'HEALER'"  class="SpecFieldThree spec specMarginLeft specMarginRight SideDiv" :key="Math.random() +spec + index + 'SpecViewer'">
          <img v-if="type == 2 || type + index == 30" class="absolute-left" style="left: -16px; width: 25px; margin-top: 2px;" :src="link">
          <div class="HiddenOverflow " :style="'color: ' + GetColorString(GetClass(GetSpec(spec)?.class)?.name) ">{{ GetSpec(spec)?.name}}
            <q-tooltip>
              {{ GetSpec(spec)?.name + ' ' + GetClass(GetSpec(spec)?.class)?.name}}
            </q-tooltip>
          </div>
        </div>

        <div v-if="index == 2 || GetSpec(spec)?.role == 'HEALER'" :class="{SpecFieldTwo: specificSetup.length == 2 , SpecFieldThree: specificSetup.length == 3}" class="relative-position specMarginLeft RoundRightSideDiv SideDiv" :key="Math.random() +spec + index + 'SpecViewer'">
          <img v-if="GetSpec(spec)?.role == 'HEALER'" class="absolute-right" style="right: -16px; width: 25px; margin-top: 2px; z-index:1000;" :src="link">
          <div class="HiddenOverflow " :style="'color: ' + GetColorString(GetClass(GetSpec(spec)?.class)?.name) ">{{ GetSpec(spec)?.name}}
            <q-tooltip>
              {{ GetSpec(spec)?.name + ' ' + GetClass(GetSpec(spec)?.class)?.name}}
            </q-tooltip>
          </div>
        </div>
      </CloudinaryFormat>
    </template>
  </div>
</template>

<script lang="ts" setup>
import sf from '../../SharedFunctions'
import _ from 'underscore'
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'src/store';

const props = defineProps({
  SpecFilter: {
    type: String,
  },
  setup: {
    type: Object,
  },
  type: {
    type: Number,
  }
})

const { SpecFilter, setup, type } = toRefs(props)

const SpecSize = ref("100")
const RAID_CLASS_COLORS = {
          HUNTER: [0.67, 0.83, 0.45],
          WARLOCK: [0.53, 0.53, 0.93],
          PRIEST: [1.0, 1.0, 1.0],
          PALADIN: [0.96, 0.55, 0.73],
          MAGE: [0.25, 0.78, 0.92],
          ROGUE: [1.0, 0.96, 0.41],
          DRUID: [1.0, 0.49, 0.04],
          SHAMAN: [0.0, 0.44, 0.87],
          WARRIOR: [0.78, 0.61, 0.43],
          DEATHKNIGHT: [0.77, 0.12, 0.23],
          MONK: [0.0, 1.0, 0.59],
          DEMONHUNTER: [0.64, 0.19, 0.79]
        }

const store = useStore()
const data = store.state.data

const GetSpecs = computed(() => data.Specs)
const GetClasses = computed(() => data.Classes)

const specFilterList = computed(()=> {
        var split = SpecFilter.value.split('&specs=')
        for( var i = 0; i < split.length-1; i++){
          if ( split[i] === "") {
            split.splice(i, 1);
          }
        }
        return split
})

const FilterFirst = computed(()=> {
        var ls = []
        specificSetup.value.forEach(element => {
        var index = specificSetup.value.indexOf(element);
          if (type.value == 3 && SpecFilter.value && _.contains(specFilterList.value, String(element))) {
            index += -99999;
          } else {

          }
          ls.push({
              value: element,
              index: index
          })

        });
        var _ls = []
        sf._sortBy(ls, 'index').forEach(element => {
          _ls.push(element.value)
        });
        return _ls
      })

const specificSetup = computed(()=> {
        var roles = []
        roles = setup.value.split('-')
        if (!setup.value.includes('-')) return JSON.parse(setup.value as any);

        var ls = []

          for (let i = 0; i < roles.length; i++) {
            const item = JSON.parse(roles[i]);
            if (type.value == 2 &&  i <= 1) {
              for (let o = 0; o < item.length; o++) {
                const spec = item[o];
                ls.push(spec)
              }
            }
            else if (type.value == 3 &&  i > 1) {
               for (let o = 0; o < item.length; o++) {
                const spec = item[o];
              ls.push(spec)
               }
            }
          }
        return ls;
      })

const GetSpec = (spec_id) => {
        if (!GetSpecs.value) return null
        for (let i = 0; i < GetSpecs.value.length; i++) {
          const spec = GetSpecs.value[i];
          if (spec_id == spec.id) {
            return spec
          }
        }
      }

const GetClass = (class_id) => {
        if (!GetClasses.value) return null
        for (let i = 0; i < GetClasses.value.length; i++) {
          const _class = GetClasses.value[i];
          if (class_id == _class.id) {
            return _class
          }
        }
      }

 const sortNumber = (a,b) => {
    return a.orderNr - b.orderNr;
}

const GetColorString = (className) => {
        var s = RAID_CLASS_COLORS[String(className).replace(' ', '').toUpperCase()]
        var rtn = 'rgb(' + s[0] * 255 + ', ' + s[1] * 255 + ', ' + s[2] * 255 + ')'
        return rtn

      }

</script>

<style>

  .HiddenOverflow {
    overflow: hidden;
        white-space: nowrap;

  }

  #Combodiv {
    background: #3d3d3d;
    border-radius: 25px;
    padding: 5px 25px 5px 25px;
  }

  .specMarginLeft {
    margin-left: 15px;
  }

  .specMarginRight {
    margin-right: 15px;
  }

  .SideDiv {
    padding-top: 5px;
    height: 30px;
    background: #323232;
    position: relative;
  }

  .SideDiv:before {
    content: "";
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
  }

  .SideDiv:after {
    content: "";
    position: absolute;
    top: 0;
    width: 0;
    height: 0;
  }

  .SideDiv:after {
    left: 100%;
    border-top: 30px solid #323232;
    border-right: 20px solid transparent;
  }

  .SideDiv:before {
    right: 100%;
    border-bottom: 30px solid #323232;
    border-left: 20px solid transparent;
  }

  .RoundLeftSideDiv:before {
    right: 100%;
    border-left: 20px solid #323232;
    border-radius: 15px 0px 0px 15px;
  }

  .RoundRightSideDiv:after {
    left: 100%;
    border-right: 20px solid #323232;
    border-radius: 0px 15px 15px 0px;
  }

.SpecFieldTwo {
 width: calc(50% - 15px);
}
.SpecFieldThree {
 width: calc(33% - 20px);
}
</style>
