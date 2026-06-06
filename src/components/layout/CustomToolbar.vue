<template>
  <div class="kc-topbar">
    <!-- mobile burger -->
    <button v-if="width <= 815" class="kc-burger" @click="drawer = true" aria-label="Menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>

    <!-- brand -->
    <router-link to="/" class="kc-brand">
      <span class="kc-brand__mark">
        <img class="kc-brand__img" src="https://res.cloudinary.com/djpcbbeqx/image/upload/h_64,w_64/v1664310113/icons/inv_relics_hourglass.webp" alt="BestKeystone" />
      </span>
      <span class="kc-brand__word kc-disp" v-if="width > 380">BestKeystone</span>
    </router-link>

    <!-- desktop nav -->
    <nav v-if="width > 815" class="kc-nav" ref="navRef">
      <template v-for="n in NAV" :key="n.key">
        <a
          v-if="!n.children"
          :data-key="n.key"
          class="kc-nav__item"
          :class="{ 'is-active': activeKey === n.key }"
          href="#"
          @click.prevent="go(n.path)"
        >{{ n.label }}</a>
        <span v-else :data-key="n.key" class="kc-nav__item kc-nav__item--has-menu" :class="{ 'is-active': activeKey === n.key }">
          {{ n.label }}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          <q-menu anchor="bottom left" self="top left" :offset="[0, 6]" class="kc-menu">
            <div class="kc-menu__list">
              <a v-for="c in n.children" :key="c.path" href="#" class="kc-menu__item" @click.prevent="go(c.path)" v-close-popup>{{ c.label }}</a>
            </div>
          </q-menu>
        </span>
      </template>
      <span class="kc-nav__underline" :style="{ left: underline.left + 'px', width: underline.width + 'px', opacity: underline.show ? 1 : 0 }" />
    </nav>

    <!-- right cluster -->
    <div class="kc-topbar__right">
      <MainSearch v-if="width > 500" />
    </div>

    <!-- mobile drawer -->
    <q-drawer v-model="drawer" side="left" overlay behavior="mobile" :width="288" class="kc-drawer">
      <div class="kc-drawer__head">
        <router-link to="/" class="kc-brand" @click="drawer = false">
          <span class="kc-brand__mark"><img class="kc-brand__img" src="https://res.cloudinary.com/djpcbbeqx/image/upload/h_64,w_64/v1664310113/icons/inv_relics_hourglass.webp" alt="BestKeystone" /></span>
          <span class="kc-brand__word kc-disp">BestKeystone</span>
        </router-link>
        <button class="kc-burger" @click="drawer = false" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div v-if="width <= 500" class="kc-drawer__search"><MainSearch /></div>
      <nav class="kc-drawer__nav">
        <template v-for="n in NAV" :key="n.key">
          <a href="#" class="kc-drawer__item" :class="{ 'is-active': activeKey === n.key }" @click.prevent="navTo(n.path || (n.children && n.children[0].path))">{{ n.label }}</a>
          <a v-for="c in (n.children || [])" :key="c.path" href="#" class="kc-drawer__sub" @click.prevent="navTo(c.path)">{{ c.label }}</a>
        </template>
      </nav>
    </q-drawer>
  </div>
</template>

<script lang="ts" setup>
import MainSearch from './MainSearch.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const width = computed(() => $q.screen.width)
const drawer = ref(false)
const $router = useRouter()
const route = useRoute()

const NAV = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'statistics', label: 'Statistics', children: [
    { label: 'Dungeons', path: '/statistics/dungeons' },
    { label: 'Classes', path: '/statistics/classes' },
    { label: 'Specs', path: '/statistics/specs' },
    { label: 'Compositions', path: '/statistics/compositions' },
    { label: 'Runs / Activity', path: '/statistics/runs' },
  ] },
  { key: 'leaderboard', label: 'Leaderboard', path: '/leaderboard/keystone' },
  { key: 'monitor', label: 'Live Monitor', path: '/monitor' },
  { key: 'info', label: 'Info', path: '/info' },
]

const activeKey = computed(() => {
  const p = route.path
  if (p === '/') return 'home'
  if (p.startsWith('/statistics')) return 'statistics'
  if (p.startsWith('/leaderboard')) return 'leaderboard'
  if (p.startsWith('/monitor')) return 'monitor'
  if (p.startsWith('/info')) return 'info'
  return ''
})

const go = (path: string) => $router.push(path)
const navTo = (path?: string) => { drawer.value = false; if (path) $router.push(path) }

/* sliding gradient underline */
const navRef = ref<HTMLElement | null>(null)
const underline = ref({ left: 0, width: 0, show: false })
function updateUnderline() {
  nextTick(() => {
    const root = navRef.value
    if (!root) { underline.value = { ...underline.value, show: false }; return }
    const el = root.querySelector(`[data-key="${activeKey.value}"]`) as HTMLElement | null
    if (el) underline.value = { left: el.offsetLeft, width: el.offsetWidth, show: true }
    else underline.value = { ...underline.value, show: false }
  })
}
onMounted(updateUnderline)
watch(activeKey, updateUnderline)
watch(width, updateUnderline)
</script>

<style scoped>
.kc-topbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 20px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--line-hairline);
}

.kc-burger {
  background: none; border: none; cursor: pointer; color: var(--text-mid);
  display: grid; place-items: center; padding: 4px;
}
.kc-burger:hover { color: var(--text-hi); }

.kc-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; flex: none; }
.kc-brand__mark {
  width: 30px; height: 30px; border-radius: 50%; overflow: hidden; display: grid; place-items: center;
  box-shadow: 0 0 12px -3px var(--accent);
}
.kc-brand__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kc-brand__word { font-size: 16px; font-weight: 700; color: var(--text-hi); letter-spacing: -0.01em; }

.kc-nav { position: relative; display: flex; align-items: center; gap: 4px; height: 100%; }
.kc-nav__item {
  display: flex; align-items: center; gap: 4px; height: 100%; padding: 0 12px;
  text-decoration: none; font-size: 14px; font-weight: 500; color: var(--text-mid);
  cursor: pointer; user-select: none;
}
.kc-nav__item:hover { color: var(--text-hi); }
.kc-nav__item.is-active { color: var(--text-hi); font-weight: 600; }
.kc-nav__underline {
  position: absolute; bottom: 0; height: 2px; border-radius: 2px; background: var(--brand-gradient);
  transition: left var(--motion-base) var(--ease-out), width var(--motion-base) var(--ease-out), opacity var(--motion-fast) ease;
}

.kc-topbar__right { margin-left: auto; display: flex; align-items: center; gap: 12px; }

.kc-region {
  display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 12px;
  border-radius: var(--r-md); background: var(--bg-inset); border: 1px solid var(--line-default);
  cursor: pointer; color: var(--text-hi);
}
.kc-region:hover { background: var(--bg-hover); }
.kc-region__flag { width: 14px; height: 10px; border-radius: 2px; flex: none; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12); }
.kc-region__code { color: var(--text-hi); }

/* shared menu styling (q-menu) */
:global(.kc-menu) {
  background: var(--bg-raised) !important;
  border: 1px solid var(--line-strong) !important;
  border-radius: var(--r-lg) !important;
  box-shadow: var(--shadow-lg) !important;
}
.kc-menu__list { padding: 6px; min-width: 200px; }
.kc-menu__item {
  display: block; padding: 8px 10px; border-radius: var(--r-sm); text-decoration: none;
  font-size: 13px; color: var(--text-mid);
}
.kc-menu__item:hover { background: var(--bg-hover); color: var(--text-hi); }
.kc-menu__region {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px;
  border-radius: var(--r-sm); background: transparent; border: none; cursor: pointer;
  color: var(--text-hi); font-size: 13px; text-align: left;
}
.kc-menu__region.is-sel { background: var(--accent-quiet); }
.kc-menu__region:hover { background: var(--bg-hover); }
.kc-menu__region-code { margin-left: auto; font-size: 11px; color: var(--text-low); }

/* drawer — Quasar puts the `kc-drawer` class on .q-drawer__content (fit), while
   the white default background sits on the parent aside.q-drawer (which has no
   scope attribute). Style globally: dark the content (covers the aside) + the
   aside itself, and the drawer text. */
:global(.q-drawer:has(.kc-drawer)) { background: var(--bg-surface) !important; }
:global(.kc-drawer) {
  background: var(--bg-surface) !important;
  color: var(--text-hi) !important;
  border-right: 1px solid var(--line-default);
}
.kc-drawer__head {
  height: 56px; display: flex; align-items: center; gap: 10px; padding: 0 18px;
  border-bottom: 1px solid var(--line-hairline);
}
.kc-drawer__head .kc-burger { margin-left: auto; }
.kc-drawer__search { padding: 14px 18px; border-bottom: 1px solid var(--line-hairline); }
.kc-drawer__nav { padding: 10px; }
.kc-drawer__item {
  display: block; padding: 11px 12px; border-radius: var(--r-md); text-decoration: none;
  font-size: 15px; font-weight: 600; color: var(--text-hi);
}
.kc-drawer__item.is-active { color: var(--accent); background: var(--accent-quiet); }
.kc-drawer__sub {
  display: block; padding: 8px 12px 8px 22px; border-radius: var(--r-sm); text-decoration: none;
  font-size: 13px; color: var(--text-mid);
}
.kc-drawer__sub:hover { color: var(--text-hi); }
</style>
