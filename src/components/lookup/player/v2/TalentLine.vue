<template>
  <div class="kc-talents">
    <div class="kc-talents__grid">
      <span v-for="t in selSpecTalents" :key="t.id" class="kc-talents__node">
        <CloudinaryFormat :url="t?.spell?.spellIconUrl" :size="36" v-slot="{ link }">
          <img class="kc-talents__icon" :src="link" :alt="t.talent?.name" />
        </CloudinaryFormat>
        <q-tooltip max-width="280px">
          <div class="kc-talents__tip-name">{{ t.talent?.name }}</div>
          <div class="kc-talents__tip-desc">{{ t.talent?.description }}</div>
        </q-tooltip>
      </span>
      <span v-if="!selSpecTalents.length" class="kc-talents__empty">No talent data.</span>
    </div>

    <div v-if="specs.length > 1" class="kc-talents__specs">
      <button
        v-for="spec in specs"
        :key="spec"
        class="kc-talents__spec"
        :class="{ 'is-sel': selectedSpec === spec }"
        @click="selectedSpec = spec"
      >{{ getSpec(spec)?.name }}</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CloudinaryFormat from 'components/data_formatters/CloudinaryFormat.vue'
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

<style scoped>
.kc-talents { width: 100%; }
.kc-talents__grid { display: flex; flex-wrap: wrap; gap: 6px; }
.kc-talents__node { display: inline-flex; }
.kc-talents__icon {
  width: 36px; height: 36px; border-radius: var(--radius-sm);
  border: 1px solid var(--line-default); cursor: help; display: block;
  transition: transform var(--transition-fast), border-color var(--transition-fast);
}
.kc-talents__icon:hover { border-color: var(--line-strong); transform: scale(1.08); }
.kc-talents__empty { font-size: 13px; color: var(--text-mid); }
.kc-talents__tip-name { font-weight: 600; color: var(--accent); margin-bottom: 4px; }
.kc-talents__tip-desc { font-size: 12px; line-height: 1.5; }

.kc-talents__specs { display: flex; gap: 4px; margin-top: 14px; flex-wrap: wrap; }
.kc-talents__spec {
  height: 28px; padding: 0 12px; border-radius: var(--radius-md); cursor: pointer;
  background: var(--bg-inset); border: 1px solid var(--line-default); color: var(--text-mid);
  font: 500 12px/1 var(--font-ui, inherit);
}
.kc-talents__spec:hover { background: var(--bg-hover); color: var(--text-hi); }
.kc-talents__spec.is-sel { background: var(--bg-active); color: var(--accent); border-color: var(--line-strong); font-weight: 600; }
</style>
