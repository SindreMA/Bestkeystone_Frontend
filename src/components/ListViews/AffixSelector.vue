<template>
  <div>
    <div v-if="holderPeriode && !hidePictures" id="AffixInfoShower" class="flex justify-around">
      <div v-for=" affix in holderPeriode.affixes" :key="affix" class="flex-center affixItem">
        <div v-if="GetAffixDetails(affix)">
          <div class="flex flex-center">
            <CloudinaryFormat :url="GetAffixDetails(affix).icon_Url" v-slot="{ link }" :size="40">
              <div class="affixImage" :style="{ 'background-image': 'url('+link+')' }">
                <q-tooltip>
                  {{GetAffixDetails(affix).description}}
                </q-tooltip>
              </div>
            </CloudinaryFormat>
          </div>
          <div class="HeaderFont flex-center affixText">
            {{shortenAffixName(GetAffixDetails(affix).name)}}
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
                    {{shortenAffixName(GetAffixDetails(affix).name)}}
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
        <q-spinner-puff style="color: var(--accent)" :size="750" />
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
    },
    shortenAffixName(name) {
      if (!name) return name;
      // If name contains a space, return the last word
      if (name.includes(' ')) {
        return name.split(' ').pop();
      }
      return name;
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
  height: 2px;
  border: 0;
  background: var(--brand-gradient);
  margin: 1em 0;
  padding: 0;
  border-radius: var(--radius-full);
}

.affixImage {
  height: 40px;
  width: 40px;
  border: 2px solid var(--line-default);
  border-radius: var(--radius-md);
  margin-bottom: 6px;
  background-size: 100% 100%;
  background-position: center;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.affixImage:hover {
  border-color: var(--line-strong);
  box-shadow: var(--shadow-glow);
  transform: scale(1.1);
}

#SelectboxAffix {
  width: 100%;
  height: 20px;
  border: 1px solid var(--line-default);
  border-radius: var(--radius-md);
}

#SelectboxAffix:hover {
  background: var(--bg-hover);
  cursor: pointer;
}

.border {
  width: 110px;
}

i.icon-grey {
  color: var(--text-mid);
}

.affixSetListItem {
  min-height: 48px;
  width: 100%;
  border-bottom: 1px solid var(--line-default);
  padding: 8px 0;
  transition: all var(--transition-fast);
}

.affixSetListItemInfo {
  margin: 0px;
  padding: 8px 12px;
  min-height: 0;
  border: none;
  background: var(--bg-raised);
  color: var(--text-mid);
  font-size: 0.85rem;
}

.affixSetListItem:hover {
  background: var(--bg-hover);
}

.SelectBox {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  width: 63%;
}

.affixImageSmall {
  width: 32px;
  height: 32px;
  background-size: 100% 100%;
  background-position: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-default);
}

#dropDownButton {
  width: 100%;
  border: 1px solid var(--line-default) !important;
  border-radius: var(--radius-full) !important;
  background: var(--bg-surface) !important;
  transition: all var(--transition-normal);
}

#dropDownButton:hover {
  border-color: var(--line-strong) !important;
  background: var(--bg-hover) !important;
}

.affixSetListItemInfoMain {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.dropDownContainer {
  background: transparent !important;
  box-shadow: none !important;
}

.affixItem {
  width: 80px;
  text-align: center;
}

.affixText {
  color: var(--text-mid);
  font-size: 0.75rem;
  font-weight: 500;
}

#AffixInfoShower {
  padding: 12px 16px;
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--line-default);
  margin: 12px auto;
  max-width: 450px;
}
</style>

