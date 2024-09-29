<template>
  <div v-if="data" :class="!size && '_affixImage'" :style="`${size && `width: ${size}px; height: ${size}px;`}`">
    <CloudinaryFormat :url="data.icon_Url" v-slot="{ link }" :size="56">
      <q-img :src="link" spinner-color="white" :class="{Wborder: border}"/>
    </CloudinaryFormat>
    <q-tooltip v-if="tooltip">
        {{data.name}}
        <div v-if="detailed">{{data.description}}</div>
    </q-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  tooltip: {
    type: [String, Boolean],
  },
  detailed: {
    type: Boolean,
  },
  size: {
    type: Number || String
  },
  border: {
    type: [String, Boolean],
  },
})

const { data, tooltip, detailed, size, border } = toRefs(props)

</script>

<style scoped>
._affixImage {
    width: 25px;
    height: 25px;
}
.Wborder {
    border: rgb(161, 161, 161) solid 1px;
    border-radius: 25%;
}
.imgage {
  overflow: hidden;
}
.labelBox {
  margin: 0 0 0 10px;
  text-align: bottom;
  position: relative;
  height: 100%;
}
</style>
