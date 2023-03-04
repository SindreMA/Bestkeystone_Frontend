<template>
  <div class v-if="weeks">
    <p class="HeaderSize3">Affix Schedule</p>
    <div class="ScheduleBox shadow-15">
      <q-resize-observer @resize="onResize" />

      <q-markup-table dark>
        <thead>
          <tr>
            <th v-if="width > 450" class="text-left">When</th>
            <th class="text-center">Affix 1</th>
            <th class="text-center">Affix 2</th>
            <th class="text-center">Affix 3</th>
            <th class="text-center">Affix 4</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="week in weeks"
            :key="week.id"
            :class="`${week == currentWeek && 'bg-green-9'}`"
          >
            <td v-if="width > 450" class="text-left">
              {{ CreateWhenString(week) }}
            </td>
            <td
              v-for="affix in [
                week.affix_1,
                week.affix_2,
                week.affix_3,
                week.affix_4,
              ]"
              :key="affix"
            >
              <affixImage
                minWidth="60px"
                class="affix"
                tooltip="true"
                border="true"
                :label="width > 700"
                :affixid="affix"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
      <!--            -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import SF, {moment} from 'src/SharedFunctions'

import affixImage from 'components/Icons/Affix/index.vue';
import _ from "lodash";
import { computed, onMounted, ref } from "vue";
import { useStore } from "src/store";

const width = ref(1080);

const store = useStore();
const data = store.state.data;

const fetchAffixSchedule = () => store.dispatch("fetchAffixSchedule");

const CreateWhenString = (week) => {
  if (!currentWeek.value) return ''
  if (week === currentWeek.value) {
    return `Ongoing`;
  } else if (
    week.order == currentWeek.value.order - 1 ||
    (currentWeek.value.order == 1 && week.order === weeks.value.length)
  ) {
    return "Last week";
  } else if (
    week.order == currentWeek.value.order + 1 ||
    (currentWeek.value.order == weeks.value.length && week.order === 1)
  ) {
    return "Next week";
  } else if (week.order > currentWeek.value.order) {
    return `In ${week.order - currentWeek.value.order} weeks`;
  } else if (week.order < currentWeek.value.order) {
    return `${currentWeek.value.order - week.order} weeks ago`;
  }
};

const isOdd = (num) => num % 2;

const GetAffixdetails = (id) => {
  if (GetAffixes.value) {
    for (let i = 0; i < GetAffixes.value.length; i++) {
      const affix = GetAffixes.value[i];
      if (affix.id === id) {
        return affix;
      }
    }
  }
};
const onResize = (size) => (width.value = size.width);

const FormatTimeAgo = (time) => {
  var duration = moment.duration(moment(time).diff(moment(Date.now())));
  var MinsToStart = duration.asMinutes();

  var weeksTo = moment(time).diff(Date.now(), "week") + 1;

  if (MinsToStart < 0) {
    return moment(time).fromNow();
  } else {
    if (weeksTo == 1) {
      return "in " + weeksTo + " week";
    } else {
      return "in " + weeksTo + " weeks";
    }
  }
};

const GetRIOData = computed(() => data.RIOData);
const GetAffixes = computed(() => data.Affixes);
const GetAffixSchedule = computed(() => data.AffixSchedule);
const GetPeriodes = computed(() => data.Periodes);

const currentWeek = computed(() => {
  for (const week of weeks.value) {
    var equal = _.isEqual(latestWeek.value?.affixes, [
      week.affix_1,
      week.affix_2,
      week.affix_3,
      week.affix_4,
    ]);
    if (equal) {
      return week;
    }
  }
});

const weeks = computed(() => GetAffixSchedule.value);

const latestWeek = computed(() => {
  if (GetPeriodes.value) {
    return GetPeriodes.value[0];
  }
});

onMounted(() => {
  if (!GetAffixSchedule.value) {
    fetchAffixSchedule();
  }
});
</script>

<style scoped>
.ScheduleBox {
  margin: auto;
  border: 1px solid rgb(34, 34, 34);
}
.weekItem {
  height: 25px;
}
.dark {
  background-color: rgb(44, 44, 44);
}
.UnderBoder {
  border-bottom: 1px solid grey;
  margin-bottom: 2px;
  padding-bottom: 2px;
}
.marked {
  background-color: rgb(14, 48, 19);
}
.affix {
  width: 23px;
  height: 23px;
}
</style>
