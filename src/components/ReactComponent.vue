<template>
  <div :id="'REACT_COMPONENT_' + uuid.toString()" >
    Loading...
  </div>
</template>


<script setup lang="ts">
import { onMounted } from 'vue'
import ReactConnector from './react/ReactConnector';
import { ref, getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const uuid = ref(instance.uid)

const props = defineProps({
  componentName: {
    type: String,
    required: true,
  },
  componentProps: {
    type: Object,
    required: true,
  },
})

onMounted(() => {
  const divEl = document.getElementById('REACT_COMPONENT_' + uuid.value.toString());
  const reactComponent = new ReactConnector(divEl, props.componentName, props.componentProps)
  reactComponent.render()
})
</script>
