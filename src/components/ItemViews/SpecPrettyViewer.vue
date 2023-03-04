<template>
    <div class="Container shadow-24 greyBackground flex justify-around">
        <RoleIcon class="_RoleIconSize" :spec="data.spec" />
        <div>
            <br>
            <SpecIcon :id="data.spec" v-slot="spec" :size="30">
                <div style="max-width: 200px;">
                    {{spec.spec?.name}} {{spec.Class?.name}} with a average score of {{AvgScore}}
                </div>
            </SpecIcon>
        </div>
        
    </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import RoleIcon from '../Icons/Role.vue'
import SpecIcon from '../Icons/SpecIcon.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
});
const { data } = toRefs(props);
const AvgScore = computed(() =>  Math.round(data.value.score / data.value.runs* 10) /10)
</script>

<style scoped>
._RoleIconSize {
    width: 70px;
    height: 70px;
}
.Container {
    border-radius: 25px;        
}
</style>