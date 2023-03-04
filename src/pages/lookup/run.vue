<template>
    <div id="Container">
        <br>
        <keystoneRun class="HeaderFont" :noShadow="true" :id="run"/>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import keystoneRun from '../../components/ItemViews/keystoneView.vue'
const $router = useRouter()
const run = computed(() => $router.currentRoute.value.params.run)
</script>

<style scoped>
    #Container {
        min-height: 500px;
    }
</style>

