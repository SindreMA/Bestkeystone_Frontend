<template>
  <div v-if="rangeValues && data" class="text-center HeaderFont">
    <div>
      <h2>What week is best for what dungeon?</h2>
    </div>
    <div class="flex justify-center">
      <div class="affixInfoFieldRight">
        <p>From</p>
        <p>{{ FormatDate(periodeDetails(rangeValues.min).start_timestamp) }}</p>
        <div class="flex">
          <affix
            v-for="affix in periodeDetails(rangeValues.min).affixes"
            :key="affix"
            class="miniAffixImg"
            :border="true"
            :affixid="affix"
            :detailed="true"
            :tooltip="true"
          ></affix>
        </div>
      </div>

      <div style="width: 200px">
        {{ rangeValues.max - rangeValues.min }}
        <br />
        weeks
        <br />
        selected
      </div>

      <div class="affixInfoFieldLeft">
        <p>To</p>
        <p>{{ FormatDate(periodeDetails(rangeValues.max).start_timestamp) }}</p>
        <div class="flex">
          <affix
            v-for="affix in periodeDetails(rangeValues.max).affixes"
            :key="affix"
            class="miniAffixImg"
            :border="true"
            :affixid="affix"
            :detailed="true"
            :tooltip="true"
          ></affix>
        </div>
      </div>
    </div>
    <q-range
      v-if="allPeriodes"
      v-model="rangeValues"
      :min="allPeriodes[0].id"
      :max="allPeriodes[allPeriodes.length - 1].id"
      :step="1"
    />
    <q-btn-toggle
      v-model="type"
      toggle-color="tertiary"
      :options="[
        { label: 'Total score', value: 'total_score' },
        { label: 'Success rate', value: 'success_rate' },
        { label: 'Average score', value: 'avg_score' },
      ]"
    />
    <div class="flex justify-center">
      <div
        class="ListCSS"
        v-for="dungeon in data.filter(x=> x[0]?.zone != -2)"
        :key="getBestPeriode(dungeon)?.dungeon"
      >
        <template v-if="dungeon && getBestPeriode(dungeon)?.dungeon">
        <div
          id="DungeonDot"
          class="text-center shadow-24 relative-position"
          :style="{
            'background-image':
              'url(' + DungeonDetails(getBestPeriode(dungeon)?.dungeon)?.imageurl + ')',
          }"
        >
          <div class="percentBackground absolute-center">
            <div>
              <div style="width: 135px" class="flex justify-center">
                <affix
                  v-for="affix in periodeDetails(getBestPeriode(dungeon)?.periode)
                    ?.affixes"
                  :key="affix"
                  class="microAffixImg"
                  :border="false"
                  :affixid="affix"
                  :detailed="false"
                  :tooltip="true"
                ></affix>
              </div>
              <div v-if="type === 'success_rate'">
                Success rate: {{ getBestPeriode(dungeon).success_rate.toFixed(0) }}%
              </div>
              <div v-if="type === 'total_score'">
                Total Score : {{ Math.floor(getBestPeriode(dungeon).total_score) }}
              </div>
              <div v-if="type === 'avg_score'">
                Average Score: {{ Math.floor(getBestPeriode(dungeon).avg_score) }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-center" style="margin: auto">
          {{ DungeonDetails(getBestPeriode(dungeon).dungeon)?.name }}
        </div>

        <q-tooltip>
          <div class="text-center" style="width: 100%; border-bottom: solid 1px, black">
            <div class="flex justify-around" style="width: 100%">
              <div class="tableField">Period</div>
              <div class="tableField">Affixes</div>
              <div class="tableField">Score</div>
              <div class="tableField">Average Score</div>
              <div class="tableField">Success Rate</div>
            </div>

            <div
              class="flex justify-around"
              style="width: 100%"
              v-for="row in GetTableFriendlyData(dungeon)"
              :key="row.periode"
            >
              <div class="tableField">{{ row.periode }}</div>
              <div class="tableField">
                <div class="flex">
                  <affix
                    v-for="affix in row.affixes"
                    :key="affix"
                    class="micoAffixImg"
                    :border="true"
                    :affixid="affix"
                    :detailed="false"
                    :tooltip="true"
                  ></affix>
                </div>
              </div>
              <div class="tableField">
                {{ Math.floor((row.total_score / 1000) * 100) / 100 }}
              </div>
              <div class="tableField">{{ Math.floor(row.avg_score * 100) / 100 }}</div>
              <div class="tableField">
                {{ Math.floor(row.success_rate * 100) / 100 }}%
              </div>
            </div>
          </div>
        </q-tooltip>
        </template>
      </div>
    </div>
    <br />
    <div>
      <div class="flex flex-center">
        <h6 id="OverallTitle">Best overall week</h6>
      </div>
      <div class="flex flex-center">
        <div class="TotalView flex justify-around">
          <affix
            size="100%"
            v-for="affix in periodeDetails(getBestPeriode(BestAffixList()).periode)
              .affixes"
            :key="affix"
            class="bigAffixImg"
            :border="false"
            :affixid="affix"
            :detailed="false"
            :tooltip="false"
          ></affix>
        </div>
        <q-tooltip>
          <div class="text-center" style="width: 100%; border-bottom: solid 1px, black">
            <div class="flex justify-around" style="width: 100%">
              <div class="tableField">Periode</div>
              <div class="tableField">Affixes</div>
              <div class="tableField">Score</div>
              <div class="tableField">Average Score</div>
              <div class="tableField">Success Rate</div>
            </div>

            <div
              class="flex justify-around"
              style="width: 100%"
              v-for="row in GetTableFriendlyData(BestAffixList())"
              :key="row.periode"
            >
              <div class="tableField">{{ row.periode }}</div>
              <div class="tableField">
                <div class="flex">
                  <affix
                    v-for="affix in row.affixes"
                    :key="affix"
                    class="micoAffixImg"
                    :border="true"
                    :affixid="affix"
                    :detailed="false"
                    :tooltip="false"
                  ></affix>
                </div>
              </div>
              <div class="tableField">
                {{ Math.floor((row.total_score / 1000) * 100) / 100 }}
              </div>
              <div class="tableField">{{ Math.floor(row.avg_score * 100) / 100 }}</div>
              <div class="tableField">
                {{ Math.floor(row.success_rate * 100) / 100 }}%
              </div>
            </div>
          </div>
        </q-tooltip>
      </div>
      <div class="flex flex-center">
        <div class="flex flex-center scoreView">
          <div v-if="type === 'success_rate'">
            Success rate: {{ getBestPeriode(BestAffixList()).success_rate.toFixed(0) }}%
          </div>
          <div v-if="type === 'total_score'">
            Total Score : {{ Math.floor(getBestPeriode(BestAffixList()).total_score) }}
          </div>
          <div v-if="type === 'avg_score'">
            Average Score: {{ Math.floor(getBestPeriode(BestAffixList()).avg_score) }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <br>
  <br>
</template>

<script lang="ts" setup>
import axios from "axios";
import { useStore } from "src/store";
import { computed, onBeforeMount, ref, watch } from "vue";
import SF from "../../SharedFunctions";
import affix from "components/Icons/Affix/index.vue";

const rangeValues = ref(null);
const allPeriodes = ref(null);
const type = ref("success_rate");
const data = ref(null);
const successRate = ref(true);
const paginationControl = ref({ rowsPerPage: 15, page: 1 });
const bounce = ref(null);
const columns = ref([
  {
    name: "periode",
    label: "Periode",
    field: "periode",

    sortable: true,
  },
  { name: "affixes", label: "Affixes", field: "affixes", sortable: true },

  {
    name: "total_score",
    label: "Total Score",
    field: "total_score",
    sortable: true,
  },
  {
    name: "avg_score",
    label: "Average Score",
    field: "avg_score",
    sortable: true,
  },
  {
    name: "success_rate",
    label: "Success Rate",
    field: "success_rate",
    sortable: true,
  },
]);

watch(rangeValues, () => {
  var bon = setTimeout(function () {
    if (bounce.value == bon) {
      getData();
    }
  }, 1000);
  bounce.value = bon;
  BestAffixList;
});

const store = useStore();
const _data = store.state.data;

const GetDungeons = computed(() => _data.Dungeons);
const GetAffixes = computed(() => _data.Affixes);

const BestAffixList = () => {
  if (data.value) {
    var noneDungeon = [...data.value].filter((x) => x[0].dungeon !== null)[0];
    return noneDungeon;
  }
};

const GetTableFriendlyData = (dungeon) => {
  var ls = [];
  for (let i = 0; i < dungeon.length; i++) {
    const periodedata = dungeon[i];
    var item = {
      periode: periodedata.periode,
      affixes: periodeDetails(periodedata.periode).affixes,
      total_score: periodedata.score,
      avg_score: periodedata.score / periodedata.runs,
      success_rate: periodedata.success_rate,
    };
    ls.push(item);
  }
  return SF._sortBy(ls, type.value).reverse();
};

const GetAffixDetails = (id) => {
  for (let i = 0; i < GetAffixes.value.length; i++) {
    const affix = GetAffixes.value[i];
    if (affix.id == id) {
      return affix;
    }
  }
};

const DungeonDetails = (id) => {
  for (let i = 0; i < GetDungeons.value.length; i++) {
    const dungeon = GetDungeons.value[i];
    if (dungeon.id == id) {
      return dungeon;
    }
  }
};

const getBestPeriode = (periodes) => {
  if (!periodes) return null;
  var ls = [];
  for (let i = 0; i < periodes.length; i++) {
    const periode = periodes[i];
    var totscore = periode.score / 1000;
    periode.total_score = totscore;

    var avgscore = periode.score / periode.runs;
    periode.avg_score = avgscore;
  }
  ls = SF._sortBy(periodes, type.value).reverse();
  return ls[0];
};

const getPeriodes = () => {
  var apiUrl = _data.apiUrl;
  axios
    .get(apiUrl + "/Periode?weeks=50")
    .then(function (response) {
      allPeriodes.value = SF._sortBy(response.data, "id");
      rangeValues.value = {
        min: allPeriodes.value[allPeriodes.value.length - 1].id - 10,
        max: allPeriodes.value[allPeriodes.value.length - 1].id,
      };
    })
    .catch(function (error) {
      console.log(error);
    });
};

const getData = () => {
  var apiUrl = _data.apiUrl;
  axios
    .get(
      apiUrl +
        "/Dungeon/BestAffixSetPerDungeon?fromPeriode=" +
        rangeValues.value.min +
        "&toPeriode=" +
        rangeValues.value.max
    )
    .then(function (response) {
      data.value = response.data?.map((x) => x.list);
    })
    .catch(function (error) {
      console.log(error);
    });
};

const periodeDetails = (id) => {
  for (let i = 0; i < allPeriodes.value.length; i++) {
    const element = allPeriodes.value[i];
    if (element.id === id) {
      return element;
    }
  }
};

const FormatDate = (time) => SF.GetMoment(time).format("MMMM Do YYYY");

onBeforeMount(() => {
  getPeriodes();
});
</script>
<style scoped>
h2 {
  margin-bottom: 0;
}
.miniAffixImg {
  margin: 0 5px;
  width: 35px;
  height: 35px;
}
.microAffixImg {
  margin: 0 1px;
  width: 30px;
  height: 30px;
}
.bigAffixImg {
  width: 70px;
  height: 70px;
}

.percentBackground {
  border-radius: 25px;
  opacity: 0.8;
  padding: 5px 5px 5px 5px;
  background-color: black;
}
#DungeonDot {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  margin: 15px;
  font-size: 15px;

  background-position: center; /* Center the image */
  background-size: cover;
}
.ListCSS {
  width: 180px;
}
.tableField {
  width: 80px;
}
.TotalView {
  overflow: hidden;
  width: 283px;
  height: 70px;
  border-radius: 40px;
  border: 1px solid black;
}
#OverallTitle {
  margin: 15px 0px 10px 0px;
}
.scoreView {
  background-color: black;
  opacity: 0.8;

  border-radius: 0 0 10px 10px;
  width: 140px;
}
.micoAffixImg {
  width: 20px;
  height: 20px;
}
</style>
