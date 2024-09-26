<template>
  <div :id="uuid.toString()" >
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
  const reactComponent = new ReactConnector(document.getElementById(uuid.value.toString())!, props.componentName, props.componentProps)
  reactComponent.render()
})
</script>
