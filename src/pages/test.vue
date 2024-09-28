<template>
    <div>
      <ReactComponent componentName="TestComponent" :componentProps="{ testValue: JSON.stringify(data.settings), fetchSpecData: fetchSpecData, specData: computedSpecs }" />
    </div>
</template>

<script lang="ts" setup >
  import { useStore } from 'src/store';
  import ReactComponent from '../components/ReactComponent.vue'
import { computed, getCurrentInstance, watch } from 'vue';

  const store = useStore();

  const data = store.state.data;

  const computedSpecs = computed(() => data.Spec_Data)

  const fetchSpecData = () => store.dispatch("fetchSpecData", {
    SelectedPeriode: 977
  });

  console.log(data.Spec_Data);


</script>
