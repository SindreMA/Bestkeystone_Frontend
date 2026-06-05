<template>
  <span class="kc-eyebrow kc-livebadge" :class="`kc-livebadge--${state}`">
    <span class="kc-livebadge__dot" />
    {{ label }}
  </span>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = defineProps({
  state: { type: String, default: 'live' }, // live | reconnecting | offline
})
const { state } = toRefs(props)
const label = computed(() => ({
  live: 'LIVE',
  reconnecting: 'RECONNECTING',
  offline: 'OFFLINE',
}[state.value] || 'LIVE'))
</script>

<style scoped>
.kc-livebadge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--kc-r-pill);
  font-size: 10px;
}
.kc-livebadge__dot { width: 7px; height: 7px; border-radius: 50%; flex: none; animation: kc-breathe 1.6s ease-in-out infinite; }

.kc-livebadge--live {
  color: var(--kc-signal-cyan);
  background: rgba(61,214,208,0.12);
  border: 1px solid rgba(61,214,208,0.35);
}
.kc-livebadge--live .kc-livebadge__dot { background: var(--kc-signal-cyan); }

.kc-livebadge--reconnecting {
  color: var(--kc-warn);
  background: rgba(210,153,34,0.12);
  border: 1px solid rgba(210,153,34,0.35);
}
.kc-livebadge--reconnecting .kc-livebadge__dot { background: var(--kc-warn); }

.kc-livebadge--offline {
  color: var(--kc-neutral);
  background: rgba(110,123,140,0.12);
  border: 1px solid rgba(110,123,140,0.35);
}
.kc-livebadge--offline .kc-livebadge__dot { background: var(--kc-neutral); animation: none; }
</style>
