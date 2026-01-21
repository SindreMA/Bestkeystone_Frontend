<template>
  <div class="toolbar-wrapper">
    <q-toolbar class="toolbar-modern">
      <!-- Mobile burger menu button -->
      <q-btn
        v-if="width <= 815"
        flat
        dense
        round
        icon="menu"
        class="mobile-menu-btn"
        @click="drawer = true"
      />

      <router-link to="/" class="logo-link">
        <CloudinaryFormat :url="`icons/custom_logo.png`" v-slot="{ link }">
          <q-img :src="link" class="logoIcon" />
        </CloudinaryFormat>
      </router-link>
      <div class="toolbar-divider" v-if="width > 815"></div>
      <MainSearch v-if="width > 500" />

      <q-space />
      <template v-if="width > 815">
        <q-btn-dropdown
          content-class="dropdown-menu"
          dark
          stretch
          flat
          label="general"
          class="nav-dropdown"
        >
          <q-list>
            <q-item clickable @click="to('/info')" v-close-popup>
              <q-item-section side>
                <q-icon name="info" />
              </q-item-section>
              <q-item-section>Info</q-item-section>
            </q-item>
            <q-item clickable @click="to('/monitor')" v-close-popup>
              <q-item-section side>
                <q-icon name="monitor" />
              </q-item-section>
              <q-item-section>M+ Live Monitor</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown
          content-class="dropdown-menu"
          stretch
          flat
          label="statistics"
          class="nav-dropdown"
        >
          <q-list>
            <q-item clickable @click="to('/statistics/dungeons')" v-close-popup>
              <q-item-section side>
                <q-icon name="castle" />
              </q-item-section>
              <q-item-section>Dungeons</q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/classes')" v-close-popup>
              <q-item-section side>
                <q-icon name="groups" />
              </q-item-section>
              <q-item-section>Classes</q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/specs')" v-close-popup>
              <q-item-section side>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Specs</q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/compositions')" v-close-popup>
              <q-item-section side>
                <q-icon name="group_work" />
              </q-item-section>
              <q-item-section>Compositions</q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/runs')" v-close-popup>
              <q-item-section side>
                <q-icon name="directions_run" />
              </q-item-section>
              <q-item-section>Runs</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown
          content-class="dropdown-menu"
          stretch
          flat
          label="leaderboards"
          class="nav-dropdown"
        >
          <q-list>
            <q-item clickable @click="to('/leaderboard/keystone')" v-close-popup>
              <q-item-section side>
                <q-icon name="vpn_key" />
              </q-item-section>
              <q-item-section>Keystone (In progress)</q-item-section>
            </q-item>
            <q-item clickable @click="to('/leaderboard/players')" v-close-popup>
              <q-item-section side>
                <q-icon name="leaderboard" />
              </q-item-section>
              <q-item-section>Players (Not started)</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
    </q-toolbar>

    <!-- Mobile drawer -->
    <q-drawer
      v-model="drawer"
      side="left"
      overlay
      dark
      behavior="mobile"
      class="mobile-drawer"
      :width="280"
    >
      <q-scroll-area class="fit">
        <div class="drawer-header">
          <router-link to="/" class="logo-link" @click="drawer = false">
            <CloudinaryFormat :url="`icons/custom_logo.png`" v-slot="{ link }">
              <q-img :src="link" class="drawer-logo" />
            </CloudinaryFormat>
          </router-link>
          <q-btn flat round dense icon="close" @click="drawer = false" class="close-btn" />
        </div>

        <!-- Search in drawer for small screens -->
        <div class="drawer-search" v-if="width <= 500">
          <MainSearch />
        </div>

        <q-list>
          <q-item-label header class="section-header">General</q-item-label>
          <q-item clickable @click="navigateTo('/info')">
            <q-item-section side>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>Info</q-item-section>
          </q-item>
          <q-item clickable @click="navigateTo('/monitor')">
            <q-item-section side>
              <q-icon name="monitor" />
            </q-item-section>
            <q-item-section>M+ Live Monitor</q-item-section>
          </q-item>

          <q-separator class="drawer-separator" />

          <q-item-label header class="section-header">Statistics</q-item-label>
          <q-item clickable @click="navigateTo('/statistics/dungeons')">
            <q-item-section side>
              <q-icon name="castle" />
            </q-item-section>
            <q-item-section>Dungeons</q-item-section>
          </q-item>
          <q-item clickable @click="navigateTo('/statistics/classes')">
            <q-item-section side>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>Classes</q-item-section>
          </q-item>
          <q-item clickable @click="navigateTo('/statistics/specs')">
            <q-item-section side>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>Specs</q-item-section>
          </q-item>
          <q-item clickable @click="navigateTo('/statistics/compositions')">
            <q-item-section side>
              <q-icon name="group_work" />
            </q-item-section>
            <q-item-section>Compositions</q-item-section>
          </q-item>
          <q-item clickable @click="navigateTo('/statistics/runs')">
            <q-item-section side>
              <q-icon name="directions_run" />
            </q-item-section>
            <q-item-section>Runs</q-item-section>
          </q-item>

          <q-separator class="drawer-separator" />

          <q-item-label header class="section-header">Leaderboards</q-item-label>
          <q-item clickable @click="navigateTo('/leaderboard/keystone')">
            <q-item-section side>
              <q-icon name="vpn_key" />
            </q-item-section>
            <q-item-section>Keystone (In progress)</q-item-section>
          </q-item>
          <q-item clickable @click="navigateTo('/leaderboard/players')">
            <q-item-section side>
              <q-icon name="leaderboard" />
            </q-item-section>
            <q-item-section>Players (Not started)</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>
  </div>
</template>

<script lang="ts" setup>
import MainSearch from './MainSearch.vue'
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import { useQuasar } from "quasar";


const $q = useQuasar();
const width = computed(() => $q.screen.width);
const drawer = ref(false);
const $router = useRouter();
const to = (url) => {
  $router.push(url);
};

const navigateTo = (url) => {
  drawer.value = false;
  $router.push(url);
};
</script>

<style scoped>
.toolbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.toolbar-modern {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  padding: 8px 16px;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logoIcon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
}

.logoIcon:hover {
  opacity: 0.85;
}

.toolbar-divider {
  width: 1px;
  height: 28px;
  background: var(--border-default);
  margin: 0 12px;
}

.nav-dropdown {
  color: var(--text-secondary) !important;
  font-weight: 500;
  text-transform: capitalize;
  border-radius: var(--radius-sm) !important;
  margin: 0 2px;
}

.nav-dropdown:hover {
  color: var(--text-primary) !important;
  background: var(--bg-hover) !important;
}

.dropdown-menu {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-md) !important;
  padding: 4px !important;
  min-width: 180px;
}

.dropdown-menu .q-item {
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.dropdown-menu .q-item:hover {
  background: var(--bg-hover) !important;
  color: var(--text-primary);
}

.dropdown-menu .q-item-section--avatar {
  min-width: 36px;
}

.dropdown-menu .q-avatar {
  background: var(--bg-elevated);
  color: var(--text-secondary);
}

.mobile-menu-btn {
  color: var(--text-secondary) !important;
}

.mobile-menu-btn:hover {
  color: var(--text-primary) !important;
}

.mobile-menu {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-default) !important;
  border-radius: var(--radius-md) !important;
  padding: 4px !important;
}

.mobile-menu .q-item {
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.mobile-menu .q-item:hover {
  background: var(--bg-hover) !important;
  color: var(--text-primary);
}

/* Mobile drawer styles */
:deep(.mobile-drawer) {
  background: var(--bg-surface) !important;
  color: var(--text-primary) !important;
}

:deep(.q-drawer) {
  background: var(--bg-surface) !important;
}

:deep(.q-drawer__content) {
  background: var(--bg-surface) !important;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-default);
}

.drawer-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
}

.close-btn {
  color: var(--text-secondary);
}

.close-btn:hover {
  color: var(--text-primary);
}

.drawer-search {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-default);
}

.section-header {
  color: var(--text-secondary) !important;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px 16px 8px;
}

.drawer-separator {
  background: var(--border-default) !important;
  margin: 8px 0;
}

:deep(.mobile-drawer .q-item) {
  border-radius: var(--radius-sm);
  margin: 2px 8px;
  color: var(--text-secondary);
}

:deep(.mobile-drawer .q-item:hover) {
  background: var(--bg-hover) !important;
  color: var(--text-primary);
}

:deep(.mobile-drawer .q-item-label--header) {
  color: var(--text-secondary);
}

:deep(.mobile-drawer .q-icon) {
  color: var(--text-secondary);
}

:deep(.mobile-drawer .q-item:hover .q-icon) {
  color: var(--text-primary);
}
</style>
