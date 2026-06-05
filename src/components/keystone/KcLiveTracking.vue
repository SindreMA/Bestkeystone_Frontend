<template>
  <KcCard :level="1" :body-style="{ padding: '0' }">
    <template #header>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--kc-signal-cyan)" aria-hidden="true"><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
      Live run tracking
    </template>
    <template #headerRight>
      <KcLiveBadge :state="badgeState" />
    </template>

    <!-- runs-completed counter -->
    <div class="kc-live__counter">
      <div class="kc-eyebrow kc-live__counter-label">Runs completed this week</div>
      <div class="kc-live__counter-row">
        <span class="kc-disp kc-tnum kc-live__counter-num">{{ displayCount.toLocaleString('en-US') }}</span>
        <span class="kc-live__counter-sub">Tracked from public leaderboards.</span>
      </div>
      <KcSparkline class="kc-live__spark" :seed="9" :w="640" :h="44" full />
    </div>

    <!-- top + recent lists -->
    <div class="kc-runlists">
      <div class="kc-runlists__col">
        <div class="kc-runlist__head">
          <span class="kc-eyebrow">Top runs</span>
          <a href="#" class="kc-runlist__cta" @click.prevent="go('/leaderboard/keystone')">
            Leaderboard
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
        <template v-if="topRuns.length">
          <KcRunRow v-for="(r, i) in topRuns" :key="r.id ?? i" :run="r" :idx="i" />
        </template>
        <div v-else class="kc-runlist__skeleton">
          <q-skeleton v-for="i in 5" :key="i" height="44px" />
        </div>
      </div>

      <div class="kc-runlists__col kc-runlists__col--divided">
        <div class="kc-runlist__head">
          <span class="kc-eyebrow kc-runlist__head-live">
            <span class="kc-runlist__livedot" />Recent runs
          </span>
          <a href="#" class="kc-runlist__cta" @click.prevent="go('/monitor')">
            Monitor
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>
        <template v-if="recentRuns.length">
          <KcRunRow v-for="(r, i) in recentRuns" :key="r.id ?? i" :run="r" :live="true" :idx="i" />
        </template>
        <div v-else class="kc-runlist__skeleton">
          <q-skeleton v-for="i in 5" :key="i" height="44px" />
        </div>
      </div>
    </div>
  </KcCard>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import * as signalR from '@aspnet/signalr'
import _ from 'underscore'
import { useKc } from './useKc'
import KcCard from './KcCard.vue'
import KcLiveBadge from './KcLiveBadge.vue'
import KcSparkline from './KcSparkline.vue'
import KcRunRow from './KcRunRow.vue'

const router = useRouter()
const { store, data } = useKc()
const go = (path: string) => router.push(path)

const amountOfRuns = ref(0)
const displayCount = ref(0)
const leaderboard = ref<any[]>([])
const liveRuns = ref<any[]>([])
const connState = ref<'live' | 'reconnecting' | 'offline'>('offline')

let connection: signalR.HubConnection | null = null
let raf = 0
let destroyed = false
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

const periodeId = computed(() => {
  const p = store.getters.GetPeriodes
  return p && p[0] ? p[0].id : null
})

const topRuns = computed(() => leaderboard.value.slice(0, 5))
const recentRuns = computed(() => _.sortBy([...liveRuns.value], (x: any) => x.index).slice(0, 5))
const badgeState = computed(() => connState.value)

/* count-up animation toward amountOfRuns */
function animateCount(to: number) {
  cancelAnimationFrame(raf)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { displayCount.value = to; return }
  const from = displayCount.value
  const dur = 600
  let start = 0
  const tick = (t: number) => {
    if (!start) start = t
    const p = Math.min(1, (t - start) / dur)
    displayCount.value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)))
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
watch(amountOfRuns, (v) => animateCount(v))

/* ---- data fetches (same endpoints the live app uses) ---- */
function fetchTopRuns() {
  const apiUrl = data.apiUrl
  if (!apiUrl) return
  axios.get(`${apiUrl}/KeystoneRun/leaderboard?from=0&amount=5`)
    .then((x) => { leaderboard.value = x.data.list || [] })
    .catch((e) => console.log(e))
}
function fetchAmount() {
  const apiUrl = data.apiUrl
  if (!apiUrl || !periodeId.value) return
  axios.get(`${apiUrl}/Stats/RunCount?weekId=${periodeId.value}`)
    .then((x) => { amountOfRuns.value = x.data })
    .catch((e) => console.log(e))
}

watch(periodeId, () => fetchAmount())

function scheduleReconnect() {
  if (destroyed) return
  connState.value = 'reconnecting'
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => { connect() }, 4000)
}

async function connect() {
  if (destroyed) return
  const apiUrl = data.apiUrl
  if (!apiUrl) { connState.value = 'offline'; return }

  // Build the hub connection once; handlers + onclose are registered a single time.
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(apiUrl.slice(0, -4) + '/KeystoneHub')
      .configureLogging(signalR.LogLevel.Information)
      .build()
    connection.on('GetNewestRuns', (runs: any[]) => { liveRuns.value = [...runs] })
    connection.on('NewRunAdded', (run: any) => {
      amountOfRuns.value++
      liveRuns.value = [...liveRuns.value, run].slice(-5)
    })
    // @aspnet/signalr@1.0.27 has no auto-reconnect — retry manually on drop.
    connection.onclose(() => { if (!destroyed) scheduleReconnect() })
  }

  connState.value = 'reconnecting'
  try {
    await connection.start()
    if (destroyed) { try { connection.stop() } catch (e) { /* noop */ } return }
    connState.value = 'live'
    connection.invoke('RequestNewestRuns', 5)
  } catch (e) {
    console.log(e)
    scheduleReconnect()
  }
}

onMounted(() => {
  fetchTopRuns()
  fetchAmount()
  connect()
})

onBeforeUnmount(() => {
  destroyed = true
  cancelAnimationFrame(raf)
  if (reconnectTimer) clearTimeout(reconnectTimer)
  try { connection?.stop() } catch (e) { /* noop */ }
})
</script>

<style scoped>
.kc-live__counter {
  padding: var(--kc-sp-5);
  border-bottom: 1px solid var(--kc-line-hairline);
}
.kc-live__counter-label { margin-bottom: 4px; white-space: nowrap; }
.kc-live__counter-row { display: flex; align-items: baseline; gap: 12px; }
.kc-live__counter-num { font-size: 30px; font-weight: 700; }
.kc-live__counter-sub { font-size: 11px; color: var(--kc-text-low); }
.kc-live__spark { width: 100%; display: block; margin-top: 10px; }

.kc-runlists { display: grid; grid-template-columns: 1fr 1fr; }
.kc-runlists__col { min-width: 0; }
.kc-runlists__col--divided { border-left: 1px solid var(--kc-line-hairline); }
@media (max-width: 900px) {
  .kc-runlists { grid-template-columns: 1fr; }
  .kc-runlists__col--divided { border-left: none; border-top: 1px solid var(--kc-line-hairline); }
}

.kc-runlist__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 8px;
}
.kc-runlist__head-live { display: flex; align-items: center; gap: 6px; }
.kc-runlist__livedot { width: 6px; height: 6px; border-radius: 50%; background: var(--kc-signal-cyan); animation: kc-breathe 1.6s infinite; }
.kc-runlist__cta { font-size: 12px; color: var(--kc-accent); display: flex; align-items: center; gap: 4px; }
.kc-runlist__skeleton { display: flex; flex-direction: column; gap: 1px; padding: 4px 12px 8px; }
</style>
