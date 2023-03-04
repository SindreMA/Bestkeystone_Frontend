<template>
  <div class="flex justify-start " :style="{color: classColor}" >
    <CloudinaryFormat :url="`roles/${player.role}.png`" v-slot="{ link }">
      <q-img spinner-size="5px" v-if="player.showIcon" id="roleImage" :src="link" />
    </CloudinaryFormat>
    <router-link :to="`/lookup/player/${region}/${player.realm}/${player.name}`">{{player.name}}</router-link>
    <q-tooltip>
      <div class="flex">
        <SpecIcon :size="20" :text="true" :id="player.spec" />
        <SpecIcon :size="20" :useclass="true" :text="true" :id="player.spec" />
      </div>
    </q-tooltip>
  </div>
</template>


<script lang="ts" setup>
import SpecIcon from "components/Icons/SpecIcon.vue";
import { useStore } from "src/store";
import { computed, toRefs } from "vue";
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'
import { colors } from 'quasar'
const { rgbToHex } = colors

const store = useStore();
const data = store.state.data;

const props = defineProps({
  player: {
    type: [Object],
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
});
const { player, region } = toRefs(props);



const GetSpecs = computed(() => data.Specs);
const GetClasses = computed(() => data.Classes);
const GetClassColors = computed(() => data.Class_Colors);

const __class = computed(() => getClass( GetSpec(player.value.spec).class));

const GetSpec = (spec_id) => {
  if (!GetSpecs.value) return null;
  for (let i = 0; i < GetSpecs.value.length; i++) {
    const spec = GetSpecs.value[i];
    if (spec_id == spec.id) {
      return spec;
    }
  }
};

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

const classColor = computed(() => {
  if (__class.value?.color) return __class.value?.color;
  try {
    if (GetClassColors.value) {
    const className = String(__class.value.name).replace(' ', '').toUpperCase()
    const rgb = GetClassColors.value[className]?.map(x=> Math.round(x * 255))

    return rgbToHex({
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
    });
  }
  } catch (error) {
    return 'white'
  }
});

</script>
<style scoped>
a {
  color: inherit;
}

#roleImage {
  width: 20px;
  height: 20px;
}
</style>
