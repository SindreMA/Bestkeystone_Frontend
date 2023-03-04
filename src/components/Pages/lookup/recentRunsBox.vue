<template>
  <div v-if="runs" id="Box">
    <div id="Header" class="HeaderSize4">Recent keystone runs</div>
    <q-scroll-area style="height: 158px;">
      <div id="Container">
        <div v-for="(run, index) in sortedRuns" :key="index">
          <div class="runRow" :class="{dark: isOdd(index)}" v-if="index < 20">
            <div class="placeLeft flex">
              <div class="flex justify-end relative">
                      <div class="Pointer" @click="$refs[`run${run.keystonrun_id}`][0].show()">
                        {{run.zone.name}} +{{run.keystone_level}}
                      </div>
                      <div>
                        <div class="chestContainer flex justify-start" >
                          <i v-for="(item, chestIndex) in numChest(run)" :key="chestIndex" class="starIcon material-icons">star</i>
                        </div>
                      </div>
                    </div>
             
            </div>
            <div class="placeRight">
              {{FormatTimeAgo(run.time.completed_timestamp)}}
              <q-tooltip>{{FormatTime(run.time.completed_timestamp)}}</q-tooltip>
            </div>
          </div>
             <q-dialog  :ref="`run${run.keystonrun_id}`">
     <div class="background HeaderFont viewItem">
       <keystoneView :id="run.keystonrun_id"></keystoneView>
     </div>
    </q-dialog>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script lang="ts" setup>
/**/
import moment from "moment";
import { computed, ref, toRefs } from "vue";
import keystoneView from '../../ItemViews/keystoneView.vue'

const props = defineProps({
  runs: {
    type: Array<any>,
  },
});
const { runs } = toRefs(props);

const sortedRuns = computed(() => [...runs.value].sort((a,b) => a.time.completed_timestamp - b.time.completed_timestamp).reverse())

const numChest = (run) => {
      var timeLeft = run.time.map_time - run.time.clear_time;

      if (run.time.clear_time <= run.time.map_time * 0.6) {
        //3 chest
        return 3;
      } else if (run.time.clear_time <= run.time.map_time * 0.8) {
        //2 chest
        return 2;
      } else if (timeLeft >= 0) {
        //1 chest
        return 1;
      } else {
        //not in time
        return 0;
      }
    }
    const isOdd = (num) => {
      return num % 2 === 1;
    }
    const FormatTimeAgo = (time) => {
      return moment(time).fromNow();
    }
    const FormatTime = (time) => {
      return moment(time).format("HH:mm DD.MM.YYYY");
    }

</script>

<style scoped>
.cWidth {
  
  min-width: 200px;
  width: 100%;
}
.ncWidth {
  max-width: 370px;
  min-width: 200px;
  width: 100%;
}
#Box {
  border: 1px solid #696969;
  height: 200px;
  width: 100%;
}

#Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
  position: relative;
  width: 100%;
  height: 100%;
}
.dark {
  background-color: #2b2b2b;
}
.runRow {
  position: relative;
  height: 20px;
}
.placeLeft {
  position: absolute;
  left: 5px;
}
.placeRight {
  position: absolute;
  right: 5px;
}
.chestDiv {
    height: 20px;
    width: 30px;
}
.chestDiv2 {
 
}
.viewItem {
  min-width: 800px;
  width: 100%;
}
.Pointer {
  cursor: pointer;
}
</style>

