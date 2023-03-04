<template>
  <div :class="{cWidth:compact,rncWidth: !compact}" v-if="details" id="Box">
    <div id="Header" class="HeaderSize4">Stats</div>
    <div id="Container" class="flex justify-around">
            <q-resize-observer @resize="onResize" />
      <div class="infoField">
        <!--<div id="HPbar" class="flex justify-center"> -->
        <!--  <div id="HPtext"> -->
        <!--    {{short(details.statistics.health,'0 a')}} -->
        <!--    <q-tooltip>Health</q-tooltip> -->
        <!--  </div> -->
        <!--    <div id="Energytext"> -->
        <!--      {{short(details.statistics.power,'0 a')}} -->
        <!--      <q-tooltip>Power</q-tooltip> -->
        <!--    </div> -->
        <!--  </div> -->
          <br>
          <div style="width: 100%" class="flex justify-around">
            <div class="text-center statField" v-for="(stat, index) in details.statistics.stats.filter(x=> x.effective != 0)" :key="index">
              <div>{{capitalize(stat.name)}}</div>
              <div>{{short(stat.effective,'0.0 a')}}</div>
            </div>
          </div>
          <div style="width: 100%" class="flex justify-around">
            <div class="text-center statField" v-for="(stat, index) in details.statistics.stats.filter(x=> x.rating != 0 && x.rating_bonus != 0 && x.value != 0 && !x.name.includes('ranged') && !x.name.includes('spell'))" :key="index">
              <div>{{capitalize(stat.name.replace('melee_crit','Critical Strike').replace('melee_haste','Haste'))}}</div>
              <div>{{short(stat.rating,'0.0 a')}}</div>
            </div>
            <div class="text-center statField">
              <div>{{capitalize("Versatility")}}</div>
              <div>{{short(details.statistics.versatility,'0.0 a')}}</div>
            </div>

          
          </div>
          
        </div>
    </div>
  </div>
</template>

<script>
import numeral from "numeral";
import { format } from "quasar";
const { capitalize } = format;

export default {
  props: ["details", "compact"],
  data() {
    return {
      width: 1200,
    }
  },
  computed: {

    powerType() {
      return capitalize(this.details.statistics.power_type);
    },
    options() {
      return {
        stroke: {
          show: true,
          curve: "smooth",
          lineCap: "butt",
          colors: undefined,
          width: 2,
          dashArray: 0
        },
        legend: {
          show: false,
          foreColor: "#414141"
        },

        colors: ["#CCAC00", "#2e2e2e"],
        labels: ["Gained", "Missing"],
        dataLabels: {
          enabled: false
        },
        plotOptions: {
          pie: {
            donut: {},
            size: 75
          }
        }
      };
    },
    
  },
  methods: {
    onResize(size) {
      this.width = size.width
      
    },
    capitalize(word) {
      return capitalize(word)
    },
    short(num, format) {
      return numeral(num).format(format);
    }
  }
};
</script>
<style scoped>
.RunicPower {
  background-color: rgb(0, 102, 170);
}
.Focus {
  background-color: rgb(190, 130, 0);
}
.Fury {
  background-color: rgb(163, 48, 201);
}
.Rage {
  background-color: rgb(216, 50, 0);
}
.Energy {
  background-color: rgb(255, 251, 0);
}
.Pain {
  background-color: rgb(163, 48, 201);
}
.Mana {
  background-color: rgb(12, 8, 255);
}
.Maelstorm {
  background-color: rgb(12, 8, 255);
}

#Box {
  border: 1px solid #696969;
  min-height: 165px;
  overflow: auto;
}
#Header {
  background-color: #414141;
  padding: 5px;
  height: 38px;
}
#Container {
    
}
#HPbar {
  border: black 1px solid;
  max-width: 300px;
  width: 80%;
  height: 45px;
  background-color: rgb(104, 173, 0);
  margin: auto;
  margin-top: 20px;
  position: relative;
}
#HPtext {
  color: black;
  position: absolute;
  left: 10px;
  top: 8px;
}
#Energybar {
  width: 100%;
  height: 7px;
  bottom: 0px;
  position: absolute;
}
#Energytext {
  color: black;
  position: absolute;
  right: 10px;
  top: 8px;
}
.infoField {
  min-width: 368px;
  max-width: 500px;
  width: 50%;
  min-height: 110px;
  text-align: center;
}
.statField {
  min-width: 60px;
}
.chartDiv {
    position: relative;
}
.chartLevelText {
    position: absolute;
    font-size: 40px;
    top: 70px;
    right: 100px;
}
</style>
