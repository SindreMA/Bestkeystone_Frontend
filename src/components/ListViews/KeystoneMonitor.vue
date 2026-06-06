<template>
  <div class="kc-root kc-monitor">
    <div class="kc-container">
      <KcPageHeader eyebrow="Realtime" title="Live Monitor" sub="Every Mythic+ run as it lands on the public leaderboards.">
        <template #right>
          <KcLiveBadge :state="monitorRuns ? connState : 'offline'" />
          <button class="kc-mon__toggle" @click="monitorRuns = !monitorRuns">
            {{ monitorRuns ? 'Pause' : 'Resume' }}
          </button>
        </template>
      </KcPageHeader>

      <div class="kc-mon__stats">
        <div class="kc-mon__stat">
          <span class="kc-eyebrow">Runs / sec</span>
          <span class="kc-disp kc-tnum kc-mon__stat-num">{{ runsPerSec }}</span>
        </div>
        <div class="kc-mon__stat">
          <span class="kc-eyebrow">Avg score</span>
          <span class="kc-disp kc-tnum kc-mon__stat-num">{{ avgScore }}</span>
        </div>
        <div class="kc-mon__stat">
          <span class="kc-eyebrow">Avg level</span>
          <span class="kc-disp kc-tnum kc-mon__stat-num">+{{ avgLevel }}</span>
        </div>
        <div class="kc-mon__stat">
          <span class="kc-eyebrow">Avg success</span>
          <span class="kc-disp kc-tnum kc-mon__stat-num" :style="{ color: successColor(avgSuccessRate) }">{{ avgSuccessRate }}%</span>
        </div>
      </div>

      <KcCard :level="1" :body-style="{ padding: '0' }">
        <template #header><span class="kc-mon__livedot" /> Live runs</template>
        <template #headerRight><span class="kc-tnum kc-mon__count">{{ sortedList.length }} shown</span></template>
        <div v-if="sortedList.length">
          <KcRunRow v-for="(r, i) in sortedList" :key="r.id ?? i" :run="r" :live="true" :idx="i" />
        </div>
        <div v-else class="kc-mon__empty">
          <q-skeleton v-for="i in 8" :key="i" height="44px" />
        </div>
      </KcCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as signalR from '@aspnet/signalr'
import { useStore } from 'src/store'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcLiveBadge from 'components/keystone/KcLiveBadge.vue'
import KcRunRow from 'components/keystone/KcRunRow.vue'

const store = useStore()
const data: any = store.state.data

const runs = ref<any[]>([])
const monitorRuns = ref(true)
const connState = ref<'live' | 'reconnecting' | 'offline'>('offline')
let connection: signalR.HubConnection | null = null
let destroyed = false
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

// newest first so the freshest run flashes at the top
const sortedList = computed(() => [...runs.value].sort((a, b) => (b.time?.created ?? 0) - (a.time?.created ?? 0)).slice(0, 20))

const runsPerSec = computed(() => {
  const l = sortedList.value
  if (l.length <= 3) return '—'
  const span = (l[0].time?.created ?? 0) - (l[l.length - 1].time?.created ?? 0)
  if (!span) return '—'
  return Math.round((l.length / span) * 100) / 100
})
const avgScore = computed(() => {
  const l = sortedList.value
  if (!l.length) return '—'
  return Math.round((l.reduce((s, r) => s + (r.score ?? 0), 0) / l.length) * 10) / 10
})
const avgLevel = computed(() => {
  const l = sortedList.value
  if (!l.length) return '—'
  return Math.round((l.reduce((s, r) => s + (r.level ?? 0), 0) / l.length) * 10) / 10
})
const avgSuccessRate = computed(() => {
  const l = sortedList.value
  if (!l.length) return 0
  const ontime = l.filter((r) => r.time?.ontime).length
  return Math.round((ontime / l.length) * 1000) / 10
})
const successColor = (p: number) => (p >= 70 ? 'var(--kc-pos)' : p >= 45 ? 'var(--kc-warn)' : 'var(--kc-neg)')

function scheduleReconnect() {
  if (destroyed || !monitorRuns.value) return
  connState.value = 'reconnecting'
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => connect(), 4000)
}
async function connect() {
  if (destroyed || !monitorRuns.value) return
  const apiUrl = data.apiUrl
  if (!apiUrl) { connState.value = 'offline'; return }
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl.slice(0, -4) + '/KeystoneHub')
      .configureLogging(signalR.LogLevel.Information)
      .build()
    connection.on('GetNewestRuns', (r: any[]) => { runs.value = [...r] })
    connection.on('NewRunAdded', (run: any) => {
      runs.value = [...runs.value, run].slice(-30)
    })
    connection.onclose(() => { if (!destroyed && monitorRuns.value) scheduleReconnect() })
  }
  connState.value = 'reconnecting'
  try {
    await connection.start()
    if (destroyed) { try { connection.stop() } catch (e) { /* noop */ } return }
    connState.value = 'live'
    connection.invoke('RequestNewestRuns', 15)
  } catch (e) {
    console.log(e)
    scheduleReconnect()
  }
}

watch(monitorRuns, (on) => {
  if (on) connect()
  else { connState.value = 'offline'; try { connection?.stop() } catch (e) { /* noop */ } }
})

onMounted(connect)
onBeforeUnmount(() => {
  destroyed = true
  if (reconnectTimer) clearTimeout(reconnectTimer)
  try { connection?.stop() } catch (e) { /* noop */ }
})
</script>

<style scoped>
.kc-monitor { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding: 0 12px; } }

.kc-mon__toggle {
  height: 28px; padding: 0 14px; border-radius: var(--kc-r-md); cursor: pointer;
  background: var(--kc-bg-inset); border: 1px solid var(--kc-line-default); color: var(--kc-text-hi);
  font: 600 12px/1 var(--kc-font-ui);
}
.kc-mon__toggle:hover { background: var(--kc-bg-hover); }

.kc-mon__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--kc-sp-4); margin-bottom: var(--kc-sp-5); }
@media (max-width: 620px) { .kc-mon__stats { grid-template-columns: repeat(2, 1fr); } }
.kc-mon__stat {
  display: flex; flex-direction: column; gap: 6px;
  background: var(--kc-bg-surface); border: 1px solid var(--kc-line-default);
  border-radius: var(--kc-r-lg); padding: 14px 16px;
}
.kc-mon__stat-num { font-size: 26px; font-weight: 700; color: var(--kc-text-hi); }

.kc-mon__livedot { width: 8px; height: 8px; border-radius: 50%; background: var(--kc-signal-cyan); animation: kc-breathe 1.6s infinite; }
.kc-mon__count { font-size: 11px; color: var(--kc-text-low); }
.kc-mon__empty { display: flex; flex-direction: column; gap: 1px; padding: 6px 12px; }
</style>
