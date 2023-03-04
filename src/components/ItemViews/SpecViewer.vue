<template>
  <div class="SpecViewWindowMAIN">
    <CloudinaryFormat :url="`classes/${SpecItem.class.name.replace(' ','-')}.jpg`" v-slot="{ link }">
      <div class="SpecViewWindow SpecMaxWidth absolute-center" :class="{TopBack: TopBack}"
        :style="{ 'background-image': `url(${link})` }">
        <div class="DarkerGreyOverlay">
          <div class="absolute-center">
            <div class="flex flex-center">
              <div class="SpecTextCover">{{SpecItem.details.name + " " + SpecItem.class.name}}</div>
            </div>
          </div>
          <div class="absolute-left">
            <div class="Ccenter" style="margin-left: 27px;">
              <div class="flex flex-center rankBoxSpec">
                <div>{{SpecItem.rank}}</div>

              </div>
            </div>
          </div>
          <div class="absolute-right">
            <div class="Ccenter" style="margin-right: 25px;">
              <div id="points" class="flex SpecTextCover flex-center">
                <div class="flex">
                  <div>{{SpecItem.display_score}}</div>
                  <div v-if="Settings.score_type === 'percent'">%</div>
                </div>
                <q-tooltip>
                  Runs: {{SpecItem.runs}}
                </q-tooltip>

              </div>
            </div>
          </div>
        </div>
      </div>
    </CloudinaryFormat>
  </div>
</template>

<script>
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'
export default {
  components: {
    CloudinaryFormat
  },
  props: ["SpecItem", "ClassItem"],
  data() {
    return {};
  },
  methods: {
    GetPoints(points) {
      var strFirstThree = String(points / 1000).substring(0, 4);
      if (strFirstThree.includes(".")) {
        strFirstThree = String(points / 1000).substring(0, 5);
      }
      return strFirstThree;
    },
    isEven(n) {
      return n % 2 == 0;
    }
  },
  computed: {
    Settings() {
      return this.$store.state.data.settings;
    },
    TopBack() {
      if (this.SpecItem.class.name.toLowerCase() == "rouge") {
        return true;
      } else if (this.SpecItem.class.name.toLowerCase() == "priest") {
        return true;
      } else if (this.SpecItem.class.name.toLowerCase() == "hunter") {
        return true;
      } else if (this.SpecItem.class.name.toLowerCase() == "warrior") {
        return true;
      } else if (this.SpecItem.class.name.toLowerCase() == "paladin") {
        return true;
      } else if (this.SpecItem.class.name.toLowerCase() == "mage") {
        return true;
      }
      return false;
    }
  }
};

</script>
<style>
.SpecMaxWidth {
  max-width: 700px;

}

.SpecTextCover {
  background-color: #252525;
  border-radius: 10px;
  font-size: 14px;
  padding: 2px 12px;
  border: rgb(161, 161, 161) 0.5px solid;
}

.SpecViewWindow {
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
  margin: 5px 0;
  background-size: cover;
  /* <------ */
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
}

.DarkerGreyOverlay {
  top: 0px;
  left: 0px;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);

}

.rankBoxSpec {
  color: rgb(161, 161, 161);
  border-radius: 50px;
  width: 25px;
  height: 25px;
  background-color: #252525;
  border: rgb(161, 161, 161) 0.5px solid;
}
</style>
