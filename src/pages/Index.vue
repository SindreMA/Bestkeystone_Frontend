<template>
  <q-page ref="PageRef">
    <WarningRunAmount :Selected="Selected"></WarningRunAmount>
    <br>
    <div class="flex flex-center">
      <div class="Centertext HeaderSize HeaderFont">What's the "best" dungeon this week?</div>
    </div>
    <div class="flex flex-center">
      <p class="HeaderFont HeaderSize2">(ish)</p>
    </div>
  <AffixSelector></AffixSelector>

  
    <div v-if="!Selected && SelectedAffixSet" class="HeaderFont">
      <div class="col-12 flex flex-center">
        <q-spinner-puff style="color: rgb(161, 161, 161)" :size="500" />
      </div>
      <div class="col-12 flex flex-center">
        <p>if you see this, then that means the webpage have'nt loaded the affix data</p>
      </div>
    </div>
    <div v-if="Selected != null">
      <div class="HeaderFont relative-position" style=" height: 20px;">
        <div class="absolute-left">
          <div class="center" style="margin-left: 30px;">
            <div>Rank</div>
          </div>
        </div>
        <div class="absolute-center">
          <div>Dungeon</div>
        </div>
        <div class="absolute-right">
          <div class="center" style="margin-right: 32px;">
            <div>Score</div>
          </div>
        </div>
      </div>
      <div v-for="dungeon in Selected.dungeons" :key="dungeon.name">
        <DungeonViewer :Selected="Selected" @click="ExpandedDungeon = $event" :expanded="ExpandedDungeon" :dungeon="dungeon"></DungeonViewer>
      </div>
      <CompositionsLists v-if="Selected && Selected.compositions" :Selected="Selected" :Compositions="Selected.compositions" :Affixes="Selected.affixes"></CompositionsLists>
      <SpecList :Selected="Selected"></SpecList>
      <ClassLists :Selected="Selected"></ClassLists>
      <FactionShower :Selected="Selected"></FactionShower>
    </div>
  
  
  
  
    <div class="flex-center Centertext HeaderFont">
      <div class="InfoField">
        <p class="HeaderSize3">So how does it work?</p>
        <p>For every affix combination it will try to collect the top runs for every dungeon(max 5000) that are +6 or higher.</p>
        <p>It will limit the amount of runs to the lowest amount dungeon. (This is so the most popular dungeon, dont get top score by default)</p>
        <p>For every run it will gather the RIO score and combind it to make a dungeon score.</p>
        <p>The score displayed is that score divided by 1000, so its easier to read.</p>
        <br>
        <p>So the dungeons that have the highest dungeons completed in time, will score highest.</p>
        <p>The dungeons with the highest score, will probably be the easiest one to do with those affixes.</p>
      </div>
      <div class="InfoField">
        <p class="HeaderSize3">When does it update?</p>
  
        <p>The current affix combination updates every 4 hour.</p>
        <div class=" flex justify-center">
          <div style="margin: 0px 15px;">
  
            <p class="no-margin">Time since last update</p>
            <DataUpdaterView v-if="RIOData" :date="RIOData.dataupdated" :countup="true"></DataUpdaterView>
          </div>
          <div style="margin: 0px 15px;">
            <p class="no-margin">Time to next update</p>
            <DataUpdaterView v-if="RIOData" :date="RIOData.dataupdated" :countdown="true"></DataUpdaterView>
          </div>
        </div>
      </div>
      <br>
      <br>
      <br>
      <p>Feel free to send me a email at sindrema@gmail.com if you have any ideas or found a bug</p>
  
      <div class="InfoField  flex flex-center">
        <div class="InfoFieldCreated" @mouseout="ShowDonate = false" @mouseover="DonateHover()">
          <div class="flex justify-around">
            <div id="donatediv">
              <div v-if="ShowDonate">
                <p>Want to buy me a beer?</p>
                <div class=" flex justify-around">
                  <div class="greyBackground shadow-16" id="DonateButton" @click="Redirect('https://paypal.me/SindreMA')">Donate</div>
                </div>
              </div>
              <p v-else class="HeaderSize2">Site created by SindreMA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>


<script>
  import axios from 'axios'
  import DungeonViewer from '../components/DungeonViewer.vue';
  import FactionShower from '../components/FactionShower.vue';
  import ClassLists from '../components/ListViews/ClassLists.vue';
  import SpecList from '../components/ListViews/SpecList.vue';
  import CompositionsLists from '../components/ListViews/CompositionsLists.vue';
  import WarningRunAmount from '../components/Warnings/WarningRunAmount.vue';
  import DataUpdaterView from '../components/ItemViews/DataUpdaterView.vue';
  import {
    mapGetters,
    mapActions,
    mapMutations
  } from 'vuex';
  
    import AffixSelector from '../components/ListViews/AffixSelector.vue';

  
  export default {
    name: 'PageIndex',
    data() {
      return {
        startdetect: true,
        //Selected: null,
        //SelectedAffixSet: null,
        //RIOData: null,
        ShowSelectAffix: false,
        ShowDonate: false,
  
        ExpandedDungeon: null
      }
    },
    methods: {
      ...mapActions(['GetSelectedData']),
      ...mapMutations(['SaveSelectedAffixSet', 'SaveRIOData']),
  
      DonateHover() {
        this.ShowDonate = true
  
  
      },
      GetSelectList(list) {
        var ls = []
  
        if (this.RIOData) {
          var index = 0;
          list.forEach(item => {
            if (item != null && item.affixes != null) {
              ls.push({
                label: item.affixes[0]['name'] + ' - ' + item.affixes[1]['name'] + ' - ' + item.affixes[2][
                  'name'
                ] + ' - ' + item.affixes[3]['name'],
                value: item,
              })
              index++;
            }
          });
        }
        return ls
  
      },
      GetSelectorWidth() {
        if (this.$refs.selectBox !== undefined) {
          return this.$refs.selectBox.clientWidth + "px"
        } else {
          return "500px"
        }
  
      },
      Redirect(url) {
        window.location.href = url
      }
    },
    computed: {
      ...mapGetters(["GetSavedSelected", "GetSelectedAffixSet", "GetRIOData"]),
      Selected() {
        return this.GetSavedSelected
      },
      SelectedAffixSet() {
        return this.GetSelectedAffixSet
      },
      RIOData() {
        return this.GetRIOData
      }
  
    },
    watch: {
      SelectedAffixSet(newValue, oldValue) {
        if (this.startdetect) {
          var ls = newValue
          var vm = this
  
          var payload = [ls[0].id, ls[1].id, ls[2].id, ls[3].id]
          this.GetSelectedData(payload)
  
        }
      }
    },
    created() {
   
  var apiUrl = this.$store.state.data.apiUrl;
      var w = window
      setTimeout(function() {
        w.scrollTo(0, 0);
      }, 500)
      if (!this.Selected && !this.SelectedAffixSet) {
        var vm = this
        var selected = null
        axios.get(apiUrl + '/keystonedata/GetAffixes')
          .then(function(response) {
            vm.SaveRIOData(response.data)
  
            if (vm.SelectedAffixSet == null) vm.SaveSelectedAffixSet(vm.RIOData.affixes[vm.RIOData.affixes.length - 1])
          })
          .catch(function(error) {
            console.log(error);
            vm.startdetect = true;
          })
      }
    },
    components: {
      DungeonViewer,
      ClassLists,
      SpecList,
      CompositionsLists,
      FactionShower,
      WarningRunAmount,
      DataUpdaterView,
  AffixSelector
    }
  }
</script>

<style>
  .HeaderFont {
    color: rgb(161, 161, 161);
    ;
  }
  
  .greyBackground {
    position: relative;
    background-color: #292929;
    color: rgb(161, 161, 161);
    ;
    border-radius: 10px;
    padding: 0 5px;
  }
  
  .greyBackground:hover {
    cursor: pointer;
  }
  
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ccc;
    margin: 1em 0;
    padding: 0;
  }
  
  .InfoField {
    margin-top: 50px;
  }
  
  .HeaderSize {
    font-size: 40px;
  }
  
  .HeaderSize2 {
    font-size: 10px;
  }
  
  .HeaderSize3 {
    font-size: 30px;
  }
  
  .HeaderSize4 {
    font-size: 20px;
  }
  
  .affixImage {
    height: 38px;
    width: 38px;
    border: rgb(161, 161, 161) solid 1px;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  
  .Centertext {
    text-align: center;
  }
  
  #SelectboxAffix {
    width: 100%;
    height: 20px;
  }
  
  #SelectboxAffix:hover {
    background-color: #3a3a3a;
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
    border: rgb(161, 161, 161) solid 1px;
  }
  
  .affixSetListItem:hover {
    background-color: #3a3a3a;
  }
  
  .SelectBox {
    background-color: #252525;
    border: rgb(161, 161, 161) solid 1px;
    width: 63%;
  }
  
  .affixImageSmall {
    width: 28px;
    height: 28px;
  }
  
  .FactionImage {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
    .center {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .FactionPointer {
    font-size: 50px;
  }
  
  .icon-size {}
  
  .InfoFieldCreated {
    overflow: hidden;
    width: 170px;
    height: 80px;
  }
  
  #DonateButton {
    left: 0px;
    width: 80px;
  }
</style>
