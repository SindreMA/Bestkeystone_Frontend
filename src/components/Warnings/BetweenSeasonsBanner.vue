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
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  padding: 12px 20px;
  margin: 20px auto;
  max-width: 500px;
  color: #f59e0b;
  font-size: 0.9rem;
}
</style>
