<template>
  <div>
    <div class="flex justify-around">
      <q-select
        v-if="type != 3"
        dark
        @update:model-value="PostChanges()"
        v-model="ReturnData.tank"
        label="Tank"
        :display-value="`${ReturnData.tank ? ReturnData.tank.label : 'Any tank'}`"
        :options="GetAllWithRole('TANK')"
        clearable
      />
      <q-select
        v-if="type != 3"
        dark
        @update:model-value="PostChanges()"
        v-model="ReturnData.healer"
        label="Healer"
        :display-value="`${ReturnData.healer ? ReturnData.healer.label : 'Any healer'}`"
        :options="GetAllWithRole('HEALER')"
        clearable
      />

      <q-select
        dark
        v-if="type != 2"
        @update:model-value="MaxControl()"
        v-model="ReturnData.dps"
        label="Damge Dealers"
        :display-value="`${
          ReturnData.dps && ReturnData.dps.length > 0
            ? select(ReturnData.dps, 'label').join(',')
            : 'Any dps'
        }`"
        :options="GetAllWithRole('DAMAGE')"
        clearable
        multiple
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "src/store";
import { computed, ref } from "vue";
import sf from "../../SharedFunctions";

const props = defineProps({
  type: {},
});
const ReturnData = ref({
  dps: [],
  healer: null,
  tank: null,
});
const RAID_CLASS_COLORS = {
  HUNTER: [0.67, 0.83, 0.45],
  WARLOCK: [0.53, 0.53, 0.93],
  PRIEST: [1.0, 1.0, 1.0],
  PALADIN: [0.96, 0.55, 0.73],
  MAGE: [0.25, 0.78, 0.92],
  ROGUE: [1.0, 0.96, 0.41],
  DRUID: [1.0, 0.49, 0.04],
  SHAMAN: [0.0, 0.44, 0.87],
  WARRIOR: [0.78, 0.61, 0.43],
  DEATHKNIGHT: [0.77, 0.12, 0.23],
  MONK: [0.0, 1.0, 0.59],
  DEMONHUNTER: [0.64, 0.19, 0.79],
};
const store = useStore();
const data = store.state.data;

const GetClasses = computed(() => data.Classes);
const GetSpecs = computed(() => data.Specs);

const select = (array, field) => {
  return sf.select(array, field);
};
const GetSpec = (spec_id) => {
  if (!GetSpecs.value) return null;
  for (let i = 0; i < GetSpecs.value.length; i++) {
    const spec = GetSpecs.value[i];
    if (spec_id == spec.id) {
      return spec;
    }
  }
};
const GetClass = (class_id) => {
  if (!GetClasses.value) return null;
  for (let i = 0; i < GetClasses.value.length; i++) {
    const _class = GetClasses.value[i];
    if (class_id == _class.id) {
      return _class;
    }
  }
};

const GetAllWithRole = (role) => {
  var ls = [];
  if (GetSpecs.value) {
    GetSpecs.value.forEach((spec) => {
      if (spec.role == role) {
        var Class = GetClass(spec.class);
        if (!Class) return null;

        ls.push({
          label: spec?.name + " " + Class?.name,
          value: spec.id,
          color: GetColorString(Class?.name),
        });
      }
    });
  }
  return ls;
};

const emits = defineEmits(["SpecChange"]);

const PostChanges = () => {

  setTimeout(() => {
    var specs = "";
  if (ReturnData.value.healer != null) specs += "&specs=" + ReturnData.value.healer.value;
  if (ReturnData.value.tank != null) specs += "&specs=" + ReturnData.value.tank.value;
  if (ReturnData.value.dps) {
    ReturnData.value.dps.forEach((spec) => {
      specs += "&specs=" + spec.value;
    });
  }
  emits("SpecChange", specs);
  }, 50);
};

const MaxControl = () => {
  if (ReturnData.value.dps) {
    if (ReturnData.value.dps.length > 3) {
      ReturnData.value.dps.splice(0, 1);
    }
  }
  PostChanges();
};

const GetColorString = (className) => {
  var s = RAID_CLASS_COLORS[String(className).replace(" ", "").toUpperCase()];
  var apiColor = GetClasses.value?.find(x=> x.name?.toLowerCase() == className?.toLowerCase())
  if (apiColor?.color) {
    return apiColor.color;
  }
  try {
    return "rgb(" + s[0] * 255 + "," + s[1] * 255 + "," + s[2] * 255 + ")";
  } catch (error) {
    return "rgb(255,255,255)";
  }
};
</script>

<style scoped>
.q-select {
  min-width: 200px;
}
</style>
