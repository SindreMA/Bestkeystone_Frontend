<template>
  <div :class="`flex1 flex column ${_class}`">
    <CloudinaryFormat
      :url="`roles/${getRole(spec)?.toLowerCase()}.png`"
      v-slot="{ link }"
    >
      <q-img
        class="flex1 _roleImage"
        v-if="spec"
        spinner-size="10px"
        :src="link"
      />
    </CloudinaryFormat>
    <q-tooltip v-if="tooltip">{{ getRole(spec) }}</q-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "src/store";
import { toRefs, computed } from "vue";
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";

const props = defineProps({
  spec: {
    type: Number,
    required: true,
  },
  tooltip: {
    type: String,
  },
  _class: {
    type: String,
    required: false,
  },
});
const { spec, tooltip, _class } = toRefs(props);

const store = useStore();
const data = store.state.data;

const GetSpecs = computed(() => data.Specs);

const getRole = (spec) => GetSpec(spec)?.role;
const GetSpec = (spec_id) => {
  if (!GetSpecs.value) return null;
  for (let i = 0; i < GetSpecs.value.length; i++) {
    const spec = GetSpecs.value[i];
    if (spec_id == spec.id) {
      return spec;
    }
  }
};
</script>
<style scoped>
._roleImage {
  min-width: 25px;
  min-height: 25px;
}
</style>
