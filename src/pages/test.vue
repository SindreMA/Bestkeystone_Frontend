<template>
    <div>
      <ReactComponent componentName="TestComponent" :componentProps="{ testValue: 'test' }" />
      <ReactComponent componentName="TestComponent" :componentProps="{ testValue: JSON.stringify(data.settings) }" />
    </div>
</template>

<script lang="ts" setup >
  import { useStore } from 'src/store';
  import ReactComponent from '../components/ReactComponent.vue'

  const store = useStore();
  const data = store.state.data;

</script>
