<template>
  <div v-if="isBetweenSeasons" class="no-data-banner">
    <q-icon name="info" size="20px" />
    <span>
      No data available for the current week. Showing the last available week.
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'src/store'

const store = useStore()
const isBetweenSeasons = computed(() => store.getters.isBetweenSeasons)
</script>

<style scoped>
.no-data-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(210, 153, 34, 0.15);
  border: 1px solid rgba(210, 153, 34, 0.4);
  border-radius: 8px;
  padding: 12px 20px;
  margin: 20px auto;
  max-width: 500px;
  color: var(--warn);
  font-size: 0.9rem;
}
</style>
