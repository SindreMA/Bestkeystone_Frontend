<template>
  <div>
    <div v-if="holderPeriode && !hidePictures" id="AffixInfoShower" class="flex justify-around">
      <div v-for=" affix in holderPeriode.affixes" :key="affix" class="flex-center">
        <div v-if="GetAffixDetails(affix)">
          <div class="flex flex-center">
            <CloudinaryFormat :url="GetAffixDetails(affix).icon_Url" v-slot="{ link }" :size="56">
              <div class="affixImage" :style="{ 'background-image': 'url('+link+')' }">
                <q-tooltip>
                  {{GetAffixDetails(affix).description}}
                </q-tooltip>
              </div>
            </CloudinaryFormat>
          </div>
          <div class="HeaderFont flex-center affixText">
            {{GetAffixDetails(affix).name}}
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center" v-if="GetPeriodes">
      <q-btn-dropdown flat text-color="grey-6" label="View other weeks" id="dropDownButton" v-model="dropdownSelectior"
        content-class="dropDownContainer">
        <div class="affixSetListItemInfoMain">
          <div v-for="periode in GetPeriodes" :key="periode.id"
            @click="ItemClicked(periode); dropdownSelectior = false;">
            <div class="HeaderFont ">
              <div class="affixSetListItemInfo flex justify-around">
                <div>Week: {{periode.id}} </div>
                <div>Started {{DateFormater(periode.start_timestamp)}}</div>
                <div v-if="DateFormater(periode.end_timestamp).includes('in')">Ends
                  {{DateFormater(periode.end_timestamp)}}</div>
                <div v-else>Ended {{DateFormater(periode.end_timestamp)}}</div>
              </div>
            </div>
            <div class="affixSetListItem flex justify-around">
              <div v-for="affix in periode.affixes" :key="affix">
                <div class="flex border justify-between" v-if="GetAffixDetails(affix)">
                  <CloudinaryFormat :url="GetAffixDetails(affix).icon_Url" v-slot="{ link }" :size="56">
                    <div class="affixImageSmall " :style="{ 'background-image': 'url('+link+')' }"></div>
                  </CloudinaryFormat>
                  <div class="HeaderFont ">
                    {{GetAffixDetails(affix).name}}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-btn-dropdown>
    </div>

    <!--
  <div class="flex justify-center">
    <q-btn flat rounded text-color="grey-6" id="dropDownButton" :icon="getDropdownButtonIcon">
     
    </q-btn>
  </div>
-->


    <div v-else class="HeaderFont">
      <div class="col-12 flex flex-center">
        <q-spinner-puff style="color: rgb(161, 161, 161)" :size="750" />
      </div>
      <div class="col-12 flex flex-center">
        <p>if you see this, then that means the webpage have'nt loaded any data yet...</p>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import moment from 'moment'
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'

export default {
  props: ['hidePictures', 'localMode'],
  components: {
    CloudinaryFormat
  },
  data() {
    return {
      ShowSelectAffix: false,
      dropdownSelectior: false,
      localSelected: null
    }
  },
  watch: {

  },
  methods: {
    ...mapMutations(['ChangeSelectedPeriode']),
    ItemClicked(periode) {
      if (this.localMode) {
        this.$emit('changed', periode.id)
        this.localSelected = periode
      } else {
        this.ChangeSelectedPeriode(periode.id)
      }
    },
    GetSelectorWidth() {
      if (this.$refs.selectBox !== undefined) {
        return this.$refs.selectBox.clientWidth + "px"
      } else {
        return "500px"
      }

    },
    SelectBoxClick(value) {
      this.ShowSelectAffix = value
    },
    GetAffixDetails(id) {
      if (this.GetAffixes != null) {
        for (let i = 0; i < this.GetAffixes.length; i++) {
          const item = this.GetAffixes[i];
          if (item.id === id) {
            return item
          }
        }
        return "None"
      }
    },
    DateFormater(time) {
      var date = moment(time).fromNow();

      return date;
    }

  },
  computed: {
    ...mapGetters(["GetPeriodes", "GetAffixes", "GetSelectedPeriode", "SelectedPeriode"]),
    getDropdownButtonIcon() {
      if (this.ShowDropdown) {
        return "keyboard_arrow_up"
      } else {
        return "keyboard_arrow_down"
      }
    },
    holderPeriode() {
      if (this.localMode) {
        return this.localSelected
      } else {
        return this.SelectedPeriode
      }
    }
  },
  created() {
    var vm = this
    if (this.localMode) {
      this.localSelected = vm.GetPeriodes[0]
    }
    if (!this.GetSelectedPeriode) {
      setTimeout(() => {
        vm.ChangeSelectedPeriode(vm.GetPeriodes[0].id)
      }, 300);

    }
  },
}
</script>
<style>
hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1em 0;
  padding: 0;
}

.affixImage {
  height: 38px;
  width: 38px;
  border: rgb(161, 161, 161) solid 1px;
  border-radius: 10px;
  margin-bottom: 10px;
  background-size: 100% 100%;
  background-position: center;
}

#SelectboxAffix {
  width: 100%;
  height: 20px;
  border: groove 1px grey;

}

#SelectboxAffix:hover {
  background-color: #3a3a3a;
  cursor: pointer;
}

.border {
  width: 110px;
}

i.icon-grey {
  color: rgb(161, 161, 161);
}

.affixSetListItem {
  min-height: 40px;
  width: 100%;
  border-bottom: rgb(161, 161, 161) solid 1px;
}

.affixSetListItemInfo {
  margin: 0px;
  padding: 0px;
  min-height: 0;
  border: none;
  background-color: #313131;

}

.affixSetListItem:hover {
  background-color: #525252;
}

.SelectBox {
  background-color: #252525;
  border: rgb(161, 161, 161) solid 1px;
  width: 63%;
}

.affixImageSmall {
  width: 28px;
  height: 28px;
  background-size: 100% 100%;
  background-position: center;
}

#dropDownButton {
  width: 100%;
  border: #313131 1px solid;
}

.affixSetListItemInfoMain {
  background-color: #292929;
  border: #5e5e5e 3px solid;
  border-top: #5e5e5e 0px solid;
}
</style>

