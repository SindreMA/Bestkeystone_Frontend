<template>
  <div class="flex">
    <q-img
      :style="`width: ${size}px; height: ${size}px;`"
      spinner-size="10px"
      spinner-color="white"
      class="tableIcon"
      :src="getImgUrl"
    />
    <div v-if="text">{{ getText }}</div>
    <slot :spec="getSpec" :Class="getClass" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";
import SF from "src/SharedFunctions";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  useclass: {
    type: Boolean,
  },
  text: {
    type: Boolean,
  },
  size: {
    type: Number || String,
  },
});

const store = useStore();
const data = store.state.data;

const { id, useclass, size, text } = toRefs(props);
const GetClasses = computed(() => data.Classes);
const GetSpecs = computed(() => data.Specs);

const getSpec = computed(() => SF.GetSpec(GetSpecs.value, id.value));
const getClass = computed(() =>
  SF.GetClass(GetClasses.value, getSpec?.value?.class)
);

const getImgUrl = ref("");
const getText = ref("");

var el = useclass?.value ? getClass.value : getSpec.value;
getImgUrl.value = el.icon_url;
getText.value = el.name;
</script>

<style scouped></style>
