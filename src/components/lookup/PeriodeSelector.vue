<template>
  <div
    v-if="GetSeasons"
    :class="{ bigHeigth: periode == 'custom' }"
    class="flex justify-center"
  >
    <div>
      <div class="flex justify-center">
        <q-select
          dark
          id="periodeSelector"
          v-model="periode"
          float-label="Periode"
          :options="Periodes"
          hide-bottom-space
          borderless
          :filled="filled"
        />
      </div>
      <q-menu no-parent-event v-model="showing">
        <div class="CustomBox">
          <div >
            <div>From:</div>
            <q-input filled style="width: 280px" dark v-model="start">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="start" mask="YYYY-MM-DD HH:mm" />
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time v-model="start" mask="YYYY-MM-DD HH:mm" format24h />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <br />

          <div>
            <div>To:</div>
            <q-input style="width: 280px" dark filled v-model="end">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="end" mask="YYYY-MM-DD HH:mm" />
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time v-model="end" mask="YYYY-MM-DD HH:mm" format24h />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <br />
          <q-separator color="orange" inset />
          <br />
          <q-btn
            color="orange"
            text-color="grey-9"
            @click="UpdateParent()"
            label="Apply"
            class="float-right"
          />
          <br />
          <br />
        </div>
      </q-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SF from "../../SharedFunctions";
import moment from "moment";
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";

const props = defineProps({
  modelValue: {

  },
  region: {

  },
  onlySeasons: {

  },
  filled: {
    type: Boolean,

  },
  input: {

  },
})

const emits = defineEmits(["update:modelValue", "input"]);

const { modelValue, region, onlySeasons, filled, input } = toRefs(props);

const periode = ref(null)
const start = ref(null)
const end = ref(null)
const showing = ref(false)
const step = ref(null)


const store = useStore();
const data = store.state.data;

const settings = computed(() => data.settings);

const GetSeasons = computed(() => data.Seasons)

const Periodes = computed(()=> {
      var ls = [...GetSeasons.value.filter(x=> (settings.value?.region ?? 'us') == x.region).map(x=> ({
        label: x.name,
        value: x,
      }))];

      if (!onlySeasons.value) {
        ls.push({
          label: "Custom",
          value: "custom",
        });
        ls.push({
          label: "All (Slow)",
          value: "none",
        });
      }

      return ls;
    })



  watch(GetSeasons, ()=> {
      if (input.value) {
        setSeason(input.value);
      }
      else {
        console.log("newest");
        setPeriodeToNewest();
      }
    })

    watch(periode,()=> {
      if (periode.value == "none") {
        start.value = moment(new Date()).subtract(600, "day").unix() * 1000;
        end.value = new Date();
        UpdateParent();
      } else if (periode.value !== "custom") {
        start.value = periode.value.start;
        end.value = periode.value.end;
        UpdateParent();
      } else if (periode.value == "custom") {
        showing.value = true;
      }
    })

    const setSeason = (id) => {
      if (Periodes.value) {
        for (let i = 0; i < Periodes.value.length; i++) {
          const season = Periodes.value[i];
          if (season.value.id == id) {
            periode.value = season;
          }
        }
      }
    }

    const setPeriodeToNewest = () => {
      periode.value = Periodes.value[0];
    }


    const fetchSeasons = (x?) => store.dispatch('fetchSeasons', x)

    const UpdateParent = () => {
      showing.value = false;
      var result: any = {
        start: SF.GetMoment(start.value).unix(),
        end: SF.GetMoment(end.value).unix(),
      };
      if (periode.value.value) {
        result.season = periode.value.value;
      }

      emits("update:modelValue", result);
    }



onBeforeMount(() => {
  if (!GetSeasons.value) {
      fetchSeasons();
    } else {
      if (input.value) {
        setSeason(input.value);
      }
      {
        setPeriodeToNewest();
      }
    }
})
</script>

<style scoped>
#periodeSelector {
}
.noMargin {
  margin: 0;
}
.bigHeigth {
}
.timeSelector {
  max-width: 450px;
  max-height: 400px;
}
.CustomBox {
  background-color: #616161;
  color: #b8b8b8;
  padding: 20px;
}
</style>
