<template>
    <fetcher :id="affixid" :fill="label" v-slot="{data}">
        <div class="flex justify-center" :style="`${label && `width: 100%;`}`" v-if="data && label">
            <affix :data="data" :border="border" :tooltip="tooltip" :detailed="detailed" :size="size" />
            <div v-if="label" class="labelBox self-center" :style="`${minWidth && `min-width: ${minWidth}`}`" >{{data.name}}</div>
        </div>
        <template v-else-if="data">
            <affix  :data="data" :border="border" :tooltip="tooltip" :detailed="detailed" :size="size" />
        </template>
    </fetcher>
</template>

<script lang="ts" setup>
import fetcher from './fetcher.vue'
import affix from './affix.vue'
import { toRefs } from 'vue';

const props = defineProps({
    affixid: {
        type: Number,
        required: true,
    },
    label: {
        type: Boolean,
    },
    tooltip: {
        type: [String, Boolean],
    },
    detailed: {
        type: Boolean,
    },
    size: {
        type: Number || String,
    },
    border: {
        type: [String, Boolean],
    },
    minWidth: {
        type: String,
    }
})

const { affixid, label, tooltip, detailed, size, border, minWidth } = toRefs(props)

</script>

<style scoped>

.labelBox {
  margin: 0 0 0 10px;
  text-align: bottom;
  position: relative;
  height: 100%;
}
</style>
