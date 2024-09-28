<template>
  <div :id="'REACT_COMPONENT_' + componentId.toString()" >
    Loading...
  </div>
</template>


<script setup lang="ts">
import { onMounted, watch } from 'vue'
import ReactConnector from './react/ReactConnector';
import { ref, getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const componentId = ref(instance.uid)

const component = ref(null)


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

  watch(props, () => {
    component.value.props = props.componentProps
    component.value.render()
  })

onMounted(() => {
  const divEl = document.getElementById('REACT_COMPONENT_' + componentId.value.toString());
  const reactComponent = new ReactConnector(divEl, props.componentName, props.componentProps)
  component.value = reactComponent

  reactComponent.render()
})
</script>
