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
.SpecViewWindowMAIN {
  margin: 8px 0;
}

.SpecMaxWidth {
  max-width: 700px;
}

.SpecTextCover {
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 4px 14px;
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.SpecViewWindow {
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin: 6px 0;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  border: 1px solid var(--border-default);
  transition: all var(--transition-normal);
}

.SpecViewWindow:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-glow);
  transform: scale(1.01);
}

.DarkerGreyOverlay {
  top: 0px;
  left: 0px;
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(13, 17, 23, 0.7) 0%, rgba(13, 17, 23, 0.4) 50%, rgba(13, 17, 23, 0.7) 100%);
}

.rankBoxSpec {
  color: var(--text-accent);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  background: var(--bg-surface);
  border: 2px solid var(--border-accent);
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: var(--shadow-glow);
}

#points {
  background: var(--gradient-primary) !important;
  border: none !important;
  color: white !important;
  font-weight: 600;
}
</style>
