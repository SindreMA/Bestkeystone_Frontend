<template>
  <div>
    <q-toolbar class="HeaderFont shadow-2 bar rounded-borders">
      <router-link to="/">
        <CloudinaryFormat :url="`icons/custom_logo.png`" v-slot="{ link }">
          <q-img :src="link" class="logoIcon shadow-15" />
        </CloudinaryFormat>
      </router-link>
      <q-separator dark vertical style="margin: 0 10px" />
      <MainSearch />

      <q-space />
      <template v-if="width > 815">
        <q-btn-dropdown
          content-class="greyBackground HeaderFont"
          dark
          stretch
          flat
          label="general"
        >
          <q-list>
            <q-item clickable @click="to('/info')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="info" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Info</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="to('/monitor')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>M+ Live Monitor</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-separator dark vertical />
        <q-btn-dropdown
          content-class="greyBackground HeaderFont"
          stretch
          flat
          label="statistics"
        >
          <q-list>
            <q-item clickable @click="to('/statistics/dungeons')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dungeons</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/classes')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Classes</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/specs')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Specs</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/compositions')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Compositions</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="to('/statistics/runs')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Runs</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-separator dark vertical />
        <q-btn-dropdown
          content-class="greyBackground HeaderFont"
          stretch
          flat
          label="leaderboards"
        >
          <q-list>
            <q-item clickable @click="to('/leaderboard/keystone')" v-close-popup>
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Keystone (In progress)</q-item-label>
              </q-item-section>
            </q-item>
            <q-item @click="to('/leaderboard/players')">
              <q-item-section avatar>
                <q-avatar icon="list" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Players (Not started)</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
      <template v-else>
        <q-btn icon="menu">
          <q-menu dark fit class="HeaderFont">
            <q-list :style="`width: ${width - width * 0.1}px;`">
              <q-item clickable @click="to('/info')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Info</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="to('/monitor')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>M+ Live Monitor</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator dark />
              <q-item clickable @click="to('/statistics/dungeons')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Dungeons</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="to('/statistics/classes')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Classes</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="to('/statistics/specs')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Specs</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="to('/statistics/compositions')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Compositions</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="to('/statistics/runs')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Runs</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator dark />
              <q-item clickable @click="to('/leaderboard/keystone')" v-close-popup>
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Keystone (In progress)</q-item-label>
                </q-item-section>
              </q-item>
              <q-item @click="to('/leaderboard/players')">
                <q-item-section avatar>
                  <q-avatar icon="list" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Players (Not started)</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </q-toolbar>
  </div>
</template>

<script lang="ts" setup>
import MainSearch from './MainSearch.vue'
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useQuasar } from "quasar";


const $q = useQuasar();
const width = $q.screen.width;
const drawer = ref(false);
const $router = useRouter();
const to = (url) => {
  $router.push(url);
};
</script>

<style scouped>
.bar {
  background-color: #181818;
  position: sticky;
  top: 0px;
  z-index: 1000;
}
</style>
