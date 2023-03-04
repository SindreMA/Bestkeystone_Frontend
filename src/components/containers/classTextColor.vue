<template>
  <div :style="`color: ${classColor} !important;`" class="aOverride flex flex-center">
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { useStore } from "src/store";
import { computed, toRefs } from "vue";
import { colors } from 'quasar'
const { rgbToHex } = colors

const props = defineProps({
  spec: {},
  _class: {},
});

const { spec, _class } = toRefs(props);

const store = useStore();
const data = store.state.data;

const GetSpecs = computed(() => data.Specs);
const GetClasses = computed(() => data.Classes);
const GetClassColors = computed(() => data.Class_Colors);

const classColor = computed(() => {
  if (getClass(computedClass.value)?.color) return getClass(computedClass.value)?.color;
  if (GetSpec(spec.value)?.color) return GetSpec(spec.value)?.color;

  if (GetClassColors.value) {

    const className = String(getClass(computedClass.value)?.name).replace(' ', '').toUpperCase()
    const rgb = GetClassColors.value[className]?.map(x=> Math.round(x * 255))
    try {
      return rgbToHex({
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
      });
    } catch (error) {
      return 'white'
    }
  }
});


const computedClass = computed(() => {
  if (_class.value) {
    return _class.value;
  } else {
    return GetSpec(spec.value)?.class;
  }
});
const getClass = (id) => {
  if (GetClasses.value) {
    for (let i = 0; i < GetClasses.value.length; i++) {
      const _class = GetClasses.value[i];
      if (_class.id == id) {
        return _class;
      }
    }
  }
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


</script>


<style>
.aOverride * {
  color: inherit !important;
}
</style>
