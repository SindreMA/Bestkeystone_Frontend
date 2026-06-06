<template>
  <KcCard :level="1" header="Dungeon trends">
    <template #headerRight>
      <a href="#" class="kc-link" @click.prevent="go('/statistics/dungeons')">Dungeons →</a>
    </template>

    <div class="kc-trends">
      <!-- most played -->
      <div class="kc-trends__col">
        <div class="kc-eyebrow kc-trends__label">Most played</div>
        <DungeonCountFetcher :week="weekId" v-slot="{ data: countData }">
          <div v-if="countData && countData.data" class="kc-trends__list">
            <div v-for="row in topByCount(countData.data)" :key="rowKey(row)" class="kc-trends__row">
              <KcDungeonThumb :keystone-id="rowKey(row)" :size="24" />
              <span class="kc-eyebrow kc-trends__name">{{ shortName(rowKey(row)) }}</span>
              <span class="kc-tnum kc-trends__count">{{ fmtCount(row.count) }}</span>
            </div>
          </div>
          <div v-else class="kc-trends__list">
            <q-skeleton v-for="i in 4" :key="i" height="24px" />
          </div>
        </DungeonCountFetcher>
      </div>

      <!-- highest success -->
      <div class="kc-trends__col">
        <div class="kc-eyebrow kc-trends__label">Highest success</div>
        <DungeonSuccessRateFetcher :week="weekId" v-slot="{ data: rateData }">
          <div v-if="rateData && rateData.data" class="kc-trends__list">
            <div v-for="row in topBySuccess(rateData.data)" :key="rowKey(row)" class="kc-trends__row">
              <KcDungeonThumb :keystone-id="rowKey(row)" :size="24" />
              <span class="kc-eyebrow kc-trends__name">{{ shortName(rowKey(row)) }}</span>
              <span class="kc-disp kc-tnum kc-trends__pct" :style="{ color: successColor(row.ontime_percent) }">{{ Math.round(row.ontime_percent) }}%</span>
            </div>
          </div>
          <div v-else class="kc-trends__list">
            <q-skeleton v-for="i in 4" :key="i" height="24px" />
          </div>
        </DungeonSuccessRateFetcher>
      </div>
    </div>
  </KcCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import numeral from 'numeral'
import { useKc } from './useKc'
import KcCard from './KcCard.vue'
import KcDungeonThumb from './KcDungeonThumb.vue'
import DungeonCountFetcher from '../fetchers/dungeonCountFetcher.vue'
import DungeonSuccessRateFetcher from '../fetchers/dungeonSuccessRateFetcher.vue'

const router = useRouter()
const { store, dungeonByKeystoneId } = useKc()
const go = (path: string) => router.push(path)

const weekId = computed(() => {
  const p = store.getters.GetPeriodes
  return p && p[0] ? p[0].id : null
})

const rowKey = (row: any) => row.id ?? row.zone_id
const shortName = (keystoneId: number) => {
  const d: any = dungeonByKeystoneId(keystoneId)
  return d?.short_name || d?.name || '—'
}
const fmtCount = (n: number) => numeral(n).format('0.0a')

const topByCount = (rows: any[]) => [...rows].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 4)
const topBySuccess = (rows: any[]) => [...rows].sort((a, b) => (b.ontime_percent || 0) - (a.ontime_percent || 0)).slice(0, 4)

const successColor = (p: number) => (p >= 70 ? 'var(--kc-pos)' : p >= 45 ? 'var(--kc-warn)' : 'var(--kc-neg)')
</script>

<style scoped>
.kc-trends { display: grid; grid-template-columns: 1fr 1fr; gap: var(--kc-sp-5); }
@media (max-width: 700px) { .kc-trends { grid-template-columns: 1fr; gap: var(--kc-sp-5); } }
.kc-trends__label { margin-bottom: 10px; }
.kc-trends__list { display: flex; flex-direction: column; gap: 8px; }
.kc-trends__row { display: flex; align-items: center; gap: 8px; }
.kc-trends__name { color: var(--kc-text-mid); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kc-trends__count { font-size: 12px; color: var(--kc-text-mid); }
.kc-trends__pct { font-size: 13px; font-weight: 700; }
.kc-link { font-size: 12px; color: var(--kc-accent); }
</style>
