<template>
  <div>
    <div class="flex justify-center HeaderFont">
      <template v-if="regions && regions.length !== 0 && GetPeriodes && GetPeriodes.length !== 0">
        <div
          style="margin-right: 20px;"
          v-for="(periodGroup, i) in GroupedByPeriod"
          :key="i"
          class="text-center"
        >
          <div class="HeaderSize4">
            {{periodGroup.map(x=> GetFullRegionName(x.region)).join(', ')}}
            <q-tooltip>
              <div
                v-for="(x, index) in periodGroup"
                :key="index"
              >{{`${GetFullRegionName(x.region)}: Started ${TimeAgo(x.discovered)} (${TimeDetail(x.discovered * 1000)}), Ends ${TimeAgo(x.discovered + 604800)} (${TimeDetail((x.discovered + 604800) * 1000)})`}}</div>
            </q-tooltip>
          </div>
          <div class="flex justify-around" v-if="GetAffixData(periodGroup[0].periode)">
            <affix
              :size="55"
              border="true"
              tooltip="true"
              detailed="true"
              class="AffixIcon"
              :affixid="affix"
              v-for="(affix, affixIndex)  in GetAffixData(periodGroup[0].periode).affixes"
              :key="affixIndex"
            />
          </div>
        </div>
        <div style="margin-left: 20px;" v-if="nextWeek">
          <div class="HeaderSize4">
            Next week
            <q-tooltip>This is only a prediction. Blizzard sometimes changes the rotation</q-tooltip>
          </div>
          <AffixScheduleFetcher v-slot="{data}" class="flex justify-around">
            <div class="flex justify-around"  v-if="data && data[1]">
              <affix
                :size="55"
                border="true"
                tooltip="true"
                detailed="true"
                class="AffixIcon"
                :affixid="affix"
                v-for="(affix, affixIndex)  in [data[1].affix_1, data[1].affix_2,data[1].affix_3,data[1].affix_4]"
                :key="affixIndex"
              />
            </div>
          </AffixScheduleFetcher>
        </div>
      </template>
      <template v-else>
        {{regions}}
        <q-skeleton v-for="(i, index) in  2" :key="index" style="height: 100px; width: 240px;" />
      </template>
    </div>
  </div>
</template>

<script>
import AffixScheduleFetcher from "../fetchers/AffixScheduleFetcher.vue";

import SF from "../../SharedFunctions";
import affix from "../Icons/Affix/index.vue";
import { mapGetters } from "vuex";
import axios from "axios";

export default {
  props: ["region", "nextWeek"],
  components: {
    affix,
    AffixScheduleFetcher
  },
  data() {
    return {
      regions: null
    };
  },
  computed: {
    ...mapGetters(["GetPeriodes"]),
    GroupedByPeriod() {
      return SF.groupBy(this.regions, "periode");
    }
  },
  watch: {
    GetPeriodes() {
      this.CheckAndFetchRegions();
    }
  },
  methods: {
    TimeAgo(time) {
      return SF.TimeFromNow(time);
    },
    TimeDetail(time) {
      return SF.GetMoment(time).format("DD.MM.YYYY HH:mm");
    },
    GetFullRegionName(region) {
      var lowRegion = region.toLowerCase();
      if (lowRegion === "us") {
        return "USA";
      } else if (lowRegion === "eu") {
        return "Europa";
      } else if (lowRegion === "tw") {
        return "Taiwan";
      } else if (lowRegion === "kr") {
        return "Korea";
      }
    },
    GetAffixData(periode) {
      var filter = this.GetPeriodes.filter(x => x.id === periode);
      if (filter.length !== 0) {
        var details = filter[0];
        return details;
      } else {
        return null;
      }
    },
    fetchRegionData() {
      var apiUrl = this.$store.state.data.apiUrl;
      var vm = this;
      axios
        .get(`${apiUrl}/Periode/regions`)
        .then(x => {
          vm.regions = x.data;
        })
        .catch(x => {
          console.log(x);
        });
    },
    CheckAndFetchRegions() {
      if (this.GetPeriodes && this.GetPeriodes[0]) {
        this.fetchRegionData();
      }
    }
  },
  created() {
    this.CheckAndFetchRegions();
  }
};
</script>

<style scoped>
.AffixIcon {
  margin: 0 10px 0 0;
  width: 50px;
  height: 50px;
}
</style>