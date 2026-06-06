<template>
    <div class="Container" :style="{ borderColor: classColor, boxShadow: `0 4px 20px ${classColor}33` }">
        <div class="spec-content">
            <div class="spec-icon-wrapper" :style="{ background: `linear-gradient(135deg, ${classColor}40, ${classColor}20)` }">
                <RoleIcon class="_RoleIconSize" :spec="data.spec" />
            </div>
            <div class="spec-info">
                <SpecIcon :id="data.spec" v-slot="spec" :size="24">
                    <div class="spec-details">
                        <div class="spec-name" :style="{ color: classColor }">
                            {{ spec.spec?.name }}
                        </div>
                        <div class="class-name" :style="{ color: classColor }">
                            {{ spec.Class?.name }}
                        </div>
                        <div class="score-info">
                            Avg Score: <span class="score-value">{{ AvgScore }}</span>
                        </div>
                    </div>
                </SpecIcon>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import { useStore } from '../../store';
import RoleIcon from '../Icons/Role.vue'
import SpecIcon from '../Icons/SpecIcon.vue'

const store = useStore();
const storeData = store.state.data;

const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
});
const { data } = toRefs(props);
const AvgScore = computed(() => Math.round(data.value.score / data.value.runs * 10) / 10);

const getSpec = (specId: number) => {
  if (!storeData.Specs) return null;
  return storeData.Specs.find((s: any) => s.id === specId);
};

const getClass = (classId: number) => {
  if (!storeData.Classes) return null;
  return storeData.Classes.find((c: any) => c.id === classId);
};

const classColor = computed(() => {
  const spec = getSpec(data.value.spec);
  if (!spec) return 'var(--accent)';
  const cls = getClass(spec.class || spec.Class);
  return cls?.color || 'var(--accent)';
});
</script>

<style scoped>
.Container {
    border-radius: var(--radius-xl);
    background: var(--bg-raised);
    border: 2px solid;
    padding: 20px;
    min-width: 300px;
    max-width: 350px;
}
.spec-content {
    display: flex;
    align-items: center;
    gap: 16px;
}
.spec-icon-wrapper {
    border-radius: var(--radius-lg);
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}
._RoleIconSize {
    width: 50px;
    height: 50px;
}
.spec-info {
    flex: 1;
}
.spec-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.spec-name {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 0.5px;
}
.class-name {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.9;
}
.score-info {
    font-size: 0.8rem;
    color: var(--text-low);
    margin-top: 4px;
}
.score-value {
    font-weight: 700;
    color: var(--text-hi);
}
</style>