<template>
    <div style="width: 100%">
        <div class="flex justify-around talents">
            <Talent v-for="(talent) in selSpecTalents" :talent="talent" :key="`${talent.id}`" />
        </div>
        <q-separator dark />
        <div class="flex">
            <div v-for="(spec, index) in specs" :key="spec" class="flex">
                <div @click="selectedSpec = spec" class="pointer clickHover specButton text-center"
                    :class="`${selectedSpec == spec && 'specButtonSelected'}`">{{ getSpec(spec)?.name }}</div>
                <q-separator vertical dark v-if="index != specs.length - 1" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Talent from './Talent.vue'
import { useStore } from 'src/store'
import { LookupTalents } from 'src/types/talents';
import { computed, onBeforeMount, ref, toRefs } from 'vue'


const props = defineProps({
    talents: {
        type: Array<Array<LookupTalents>>,
        required: true
    },
    spec: {
        type: Number,
    }
})
const { talents, spec } = toRefs(props)

const selectedSpec = ref(spec.value)

const store = useStore()
const data = store.state.data

const GetSpecs = computed(() => data.Specs)

const getSpec = (id) => {
    if (GetSpecs.value) {
        for (let i = 0; i < GetSpecs.value.length; i++) {
            const spec = GetSpecs.value[i];
            if (spec.id == id) {
                return spec;
            }
        }
    }
}

const selSpecTalents = computed(() => {
  var selectedSpecTalents = talents.value.find(x=> x.filter(c=>
    c.specId)[0]?.specId === selectedSpec.value
  )
  if (!selectedSpecTalents) return []
  return selectedSpecTalents.filter(x=> x.isActive === undefined || x.isActive)
})

const specs = computed(() => {
    return Object.keys(talents.value.reduce((o, n)=> ({...o, [`${n[0]?.specId}`]: n}), {})).map(x=> parseInt(x));
})

onBeforeMount(() => {
    if (spec.value) {
        selectedSpec.value = spec.value
    }
})
</script>

<style scouped>
.specButton {
    padding: 5px 10px;
    min-width: 65px;
    min-height: 25px;
}

.pointer {
    cursor: pointer;
}

.clickHover:hover {
    background: #2f2f2f;
}

.specButtonSelected {
    background: #1f1f1f;
}


.talents {
  gap: 5px 20px;
}
</style>
