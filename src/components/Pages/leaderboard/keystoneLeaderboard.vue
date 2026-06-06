<template>
  <div class="kc-root kc-lb">
    <!-- filters (these are real query filters, kept) -->
    <div class="kc-lb__filters">
      <div class="kc-lb__filter"><span class="kc-eyebrow">Season</span><seasonSelector :onlySeasons="true" v-model="season" filled :region="'us'" /></div>
      <div class="kc-lb__filter"><span class="kc-eyebrow">Region</span><regionSelector :input="query.region" :filled="true" @change="region = $event" /></div>
      <div class="kc-lb__filter"><span class="kc-eyebrow">Dungeon</span><dungeonSelector :widthImage="true" :season="season" v-model="zone" filled /></div>
      <div class="kc-lb__filter"><span class="kc-eyebrow">Affix +2</span><affixSelector v-model="affix1" :level="2" filled /></div>
      <div class="kc-lb__filter"><span class="kc-eyebrow">Affix +4</span><affixSelector v-model="affix2" :level="4" filled /></div>
      <div class="kc-lb__filter"><span class="kc-eyebrow">Affix +7</span><affixSelector v-model="affix3" :level="7" filled /></div>
    </div>

    <div v-if="loading" class="kc-lb__loading"><q-skeleton v-for="i in 12" :key="i" height="46px" /></div>

    <div v-else-if="leaderboardData.length" class="kc-lb__card">
      <div class="kc-lb__head">
        <span class="kc-eyebrow kc-lb__rank-h">#</span>
        <span class="kc-eyebrow">Dungeon</span>
        <span class="kc-eyebrow">Key</span>
        <span class="kc-eyebrow">Time</span>
        <span class="kc-eyebrow">Affixes</span>
        <span class="kc-eyebrow">Group</span>
        <span class="kc-eyebrow kc-lb__r">Score</span>
      </div>
      <div
        v-for="(run, i) in leaderboardData"
        :key="run.id"
        class="kc-lb__row"
        :style="{ borderLeftColor: railFor(run) }"
        title="View run details"
        @click="openRun(run.id)"
      >
        <KcRankChip :rank="run.rank ?? ((paginationControl.page - 1) * paginationControl.rowsPerPage + i + 1)" size="sm" />
        <span class="kc-lb__dgn">
          <CloudinaryFormat :url="`factions/${run.faction.toLowerCase()}.png`" v-slot="{ link }"><img class="kc-lb__faction" :src="link" /></CloudinaryFormat>
          <KcDungeonThumb :keystone-id="run.zone.id" :size="28" />
          <span class="kc-lb__dgn-name">{{ run.zone.short_name || run.zone.name }}</span>
        </span>
        <span class="kc-lb__key"><KcKeystoneChip :level="run.level" size="sm" /><KcChestPips :chests="chests(run)" /></span>
        <span class="kc-mono kc-lb__time" :class="chests(run) > 0 ? 'kc-lb__pos' : 'kc-lb__neg'">{{ FormatTimeUsed(run.time.clear_time) }}</span>
        <span class="kc-lb__affixes"><Affix v-for="(a, j) in run.affixes" :key="j" :affixid="a" :size="18" :tooltip="true" /></span>
        <span class="kc-lb__players"><KcSpecIcon v-for="(p, j) in sortPlayers(run.players)" :key="j" :spec-id="p.spec" :size="20" /></span>
        <span class="kc-disp kc-tnum kc-lb__score kc-lb__r">{{ Math.round(run.score * 10) / 10 }}</span>
      </div>

      <div class="kc-lb__pager">
        <span class="kc-tnum kc-lb__pager-info">Page {{ paginationControl.page }}</span>
        <span class="kc-lb__pager-ctrl">
          <button class="kc-lb__pager-btn" :disabled="paginationControl.page <= 1" @click="goPage(paginationControl.page - 1)">Prev</button>
          <button class="kc-lb__pager-btn" :disabled="leaderboardData.length < paginationControl.rowsPerPage" @click="goPage(paginationControl.page + 1)">Next</button>
        </span>
      </div>
    </div>

    <div v-else class="kc-lb__empty">No runs match these filters.</div>
  </div>
</template>

<script lang="ts" setup>

import axios from "axios";
import seasonSelector from "components/lookup/PeriodeSelector.vue";
import SF, {moment} from '../../../SharedFunctions'
import SpecIcon from "../../Icons/SpecIcon.vue";
import  dungeonSelector from '../../Selectors/dungeonSelector.vue'
import  affixSelector from '../../Selectors/affixSelector.vue'
import  regionSelector from '../../Selectors/regionSelector.vue'
import keystoneView from '../../ItemViews/keystoneView.vue'
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'
import Affix from '../../Icons/Affix/index.vue'
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "src/store";
import PlayerTextVue from "components/ItemViews/PlayerText.vue"
import KcRankChip from "components/keystone/KcRankChip.vue"
import KcDungeonThumb from "components/keystone/KcDungeonThumb.vue"
import KcKeystoneChip from "components/keystone/KcKeystoneChip.vue"
import KcChestPips from "components/keystone/KcChestPips.vue"
import KcSpecIcon from "components/keystone/KcSpecIcon.vue"
import { useKc } from "components/keystone/useKc"

const visableColumns = computed(() => {
      return Columns.value.map(x=> x.name).filter(x=> {
        var show = true
        if (zone.value && x == 'zone') show = false;
        return show;
      })
    })

let leaderboardData = ref<any>([])
let season = ref(null)
let zone = ref(null)
let affix1 = ref(null)
let affix2 = ref(null)
let affix3 = ref(null)
let affix4 = ref(null)
let region = ref(null)
// plain writable ref. (Was ref(visableColumns), which aliased the readonly
// computed and made the `activeColumns.value = …` assignment below throw a
// "computed value is readonly" warning. Empty init avoids evaluating the
// computed before `Columns` is declared.)
let activeColumns = ref<any>([])
let faction = ref(null)

let paginationControl = ref({
        rowsPerPage: 20,
        page: 1,
        sortBy: "rank",
        rowsNumber: 12
      })
let loading = ref(false)

const Columns = ref([
        {
          name: "rank",
          label: "Rank",
          sortable: false,
          field: x=> x,
          align: "left" as any
        },
        {
          name: "zone",
          label: "Dungeon",
          sortable: false,
          field: x=> x,
          align: "left"
        },
        {
          name: "level",
          label: "Level",
          sortable: false,
          field: x=> x,
          align: "left"
        },
        {
          name: "time",
          label: "Time",
          sortable: false,
          field: x=> x,
          align: "left"
        },
        {
          name: "affixes",
          label: "Affixes",
          sortable: false,
          field: x=> x,
          align: "left"
        },

        {
          name: "players",
          label: "Players",
          sortable: false,
          field: x=> x,
          align: "left"
        },
        {
          name: "score",
          label: "Score",
          sortable: false,
          field: x=> x,
          align: "center"
        }
      ])

      const $router = useRouter();
      const query = computed(() => $router.currentRoute.value.query);
    const GetSpecs = computed(() => data.Specs);
    const GetClasses = computed(() => data.Classes);

    const updateUrl = () => {
      var query : any = {
        page: paginationControl.value.page
      }
      if (paginationControl.value.rowsPerPage &&  paginationControl.value.rowsPerPage != 10) query.rows = paginationControl.value.rowsPerPage;
      if (season.value) query.season = season.value?.season?.id;

      if (zone.value) query.zone = zone.value.keystone_id;
      if (affix1.value) query.affix1 = affix1.value.id;
      if (affix2.value) query.affix2 = affix2.value.id;
      if (affix3.value) query.affix3 = affix3.value.id;
      if (region.value) query.region = region.value;

      $router.push({query: query})
    }

    const $q = useQuasar()

    const rowPageSize = () => {
      if ($q.screen.width > 970) {
        return Math.floor(($q.screen.height - 350) / 35)
      } else {
        return  10
      }
    }

    const onRequest = (props) => {
        const { page, rowsPerPage, sortBy } = props.pagination;
        loading.value = true;
        fetchLeaderboard(props.pagination);
    }

    const getClass = (id) => {
      if (GetClasses.value) {
        for (let i = 0; i < GetClasses.value.length; i++) {
          const _class = GetClasses.value[i];
          if (_class.id == id) {
            return _class;
          }
        }
      }
    }
    const chests = (item) => {
      var time = item.time.clear_time / item.time.map_time;
      if (time <= 0.6) {
        return 3;
      } else if (time <= 0.8) {
        return 2;
      } else if (time <= 1) {
        return 1;
      } else {
        return 0;
      }
    }
    const FormatTimeUsed = (time) => moment.duration(time).format("hh:mm:ss");


    const getRole = (spec) => GetSpec(spec)?.role;

    const getRoleNr = (spec) => {
      if (GetSpec(spec).role == "TANK") {
        return 10000 + spec;
      } else if (GetSpec(spec).role == "HEALER") {
        return 20000 + spec;
      } else {
        return 30000 + spec;
      }
    }
    const GetSpec = (spec_id) => {
      if (!GetSpecs.value) return null;
      for (let i = 0; i < GetSpecs.value.length; i++) {
        const spec = GetSpecs.value[i];
        if (spec_id == spec.id) {
          return spec;
        }
      }
    }

    const getPlayersWithRoles = (players) => {
      players.forEach(player => {
        player.sortNR = getRoleNr(player.spec);
        player.role = getRole(player.spec);
      });
      var ls = SF._sortBy(players, "sortNR");

      for (const key in SF.groupBy(ls, "role")) {
        if (SF.groupBy(ls, "role").hasOwnProperty(key)) {
          const element = SF.groupBy(ls, "role")[key];
          element[0].showIcon = true;
        }
      }
      return ls;
    }

    const store = useStore();
    const data = store.state.data

    /* ---- Keystone Console row helpers ---- */
    const { classColorForSpec } = useKc()
    const openRun = (id) => $router.push(`/lookup/run/${id}`)
    const rolePriority = (spec) => { const r = (GetSpec(spec)?.role || '').toUpperCase(); return r === 'TANK' ? 0 : r === 'HEALER' ? 1 : 2 }
    const sortPlayers = (players) => [...(players || [])].sort((a, b) => rolePriority(a.spec) - rolePriority(b.spec))
    const railFor = (run) => { const ps = sortPlayers(run.players); return (chests(run) > 0 && ps[0]) ? classColorForSpec(ps[0].spec) : 'var(--kc-fire-0)' }
    const totalPages = computed(() => Math.max(1, Math.ceil((paginationControl.value.rowsNumber || 0) / paginationControl.value.rowsPerPage)))
    const goPage = (p) => onRequest({ pagination: { ...paginationControl.value, page: p } })

    let requestSeq = 0;

    const fetchLeaderboard = (pagination) => {
      if (pagination) {
        if (pagination.page) paginationControl.value.page = pagination.page;
        if (pagination.rowsPerPage) paginationControl.value.rowsPerPage = pagination.rowsPerPage;
        if (pagination.sortBy) paginationControl.value.sortBy = pagination.sortBy;
      }
      var { page, rowsPerPage, sortBy } = paginationControl.value;

      const seasonId = season.value?.season?.id;
      if (!seasonId) {
        loading.value = false;
        return;
      }

      const myReq = ++requestSeq;

      var apiUrl = data.apiUrl;
      var apiString = `/KeystoneRun/leaderboard?from=${(page - 1) *
        rowsPerPage}&amount=${rowsPerPage}&seasonId=${seasonId}`;
      if (zone.value) apiString += `&zone=${zone.value.keystone_id}`;
      if (affix1.value) apiString += `&affix1=${affix1.value.id}`;
      if (affix2.value) apiString += `&affix2=${affix2.value.id}`;
      if (affix3.value) apiString += `&affix3=${affix3.value.id}`;
      if (affix4.value) apiString += `&affix4=${affix4.value.id}`;
      if (region.value) apiString += `&region=${region.value}`;
      if (faction.value) apiString += `&faction=${faction.value}`;
      axios
        .get(`${apiUrl}${apiString}`)
        .then(x => {
          if (myReq !== requestSeq) return;
          paginationControl.value.rowsNumber = x.data.maxRows;
          leaderboardData.value = x.data.list ?? [];
          paginationControl.value.page = page;
          paginationControl.value.rowsPerPage = rowsPerPage;
          paginationControl.value.sortBy = sortBy;
          activeColumns.value = visableColumns.value;
          loading.value = false;
        })
        .catch(x => {
          if (myReq !== requestSeq) return;
          console.log("Error", x);
          leaderboardData.value = [];
          loading.value = false;
        });
      }

     const cleanPaginationControl = computed (() => {
       var pg = {
         pagination: {
          rowsNumber: 0,
          rowsPerPage: paginationControl.value.rowsPerPage,
          page: paginationControl.value.page,
          sortBy: paginationControl.value.sortBy,

        }
      }
      if (paginationControl.value.rowsNumber) {
        pg.pagination.rowsNumber = paginationControl.value.rowsNumber
      }
      return pg
    })


    watch(affix1, () => {
      onRequest(cleanPaginationControl.value)
    })
    watch(affix2, () => {
      onRequest(cleanPaginationControl.value)
    })
    watch(affix3, () => {
      onRequest(cleanPaginationControl.value)
    })
    watch(affix4, () => {
      onRequest(cleanPaginationControl.value)
    })
    watch(region, () => {
      onRequest(cleanPaginationControl.value)
    })
    watch(season, () => {
      onRequest(cleanPaginationControl.value)
    })
    watch(zone, () => {
      onRequest(cleanPaginationControl.value)
    })

onMounted(()=> {
    if (query.value.page) {
      paginationControl.value.page = query.value.page as any
    }
    if (query.value.rows) {
      paginationControl.value.rowsPerPage = query.value.rows as any
    }
    if (season.value) {
      onRequest(cleanPaginationControl.value)
    }
})
</script>
<style scoped>
.kc-lb { min-height: 663px; }

.kc-lb__filters { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: var(--kc-sp-5); align-items: stretch; }
.kc-lb__filter { display: flex; flex-direction: column; gap: 4px; flex: 1 1 170px; min-width: 150px; }
.kc-lb__filter .kc-eyebrow { color: var(--kc-text-low); }
/* make every filter selector fill its cell at a uniform width.
   selectors use different root ids (#mainDiv for region/dungeon, #mainDivSel
   for the affix selector), so reset all of them. */
.kc-lb__filter :deep(.q-field) { width: 100%; min-width: 0; }
.kc-lb__filter :deep(#mainDiv),
.kc-lb__filter :deep(#mainDivSel) { width: 100%; min-width: 0; }

.kc-lb__loading { display: flex; flex-direction: column; gap: 1px; }

.kc-lb__card { background: var(--kc-bg-surface); border: 1px solid var(--kc-line-default); border-radius: var(--kc-r-lg); overflow: hidden; }
.kc-lb__head, .kc-lb__row {
  display: grid;
  /* fixed tracks for the #, Key and Affixes columns so the header grid and the
     row grid resolve identically (auto tracks size to each grid's own content,
     which made the Key/Group headers drift off their data columns). */
  grid-template-columns: 30px minmax(0, 1.4fr) 72px 72px 92px 1fr 56px;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
}
.kc-lb__head { height: 38px; background: var(--kc-bg-raised); border-bottom: 1px solid var(--kc-line-hairline); }
/* center the # header and the rank chip within the 30px leading track so they sit over each other */
.kc-lb__rank-h { text-align: center; }
.kc-lb__head > :first-child, .kc-lb__row > :first-child { justify-self: center; }
.kc-lb__head .kc-eyebrow { color: var(--kc-text-low); }
.kc-lb__r { text-align: right; justify-self: end; }
.kc-lb__row {
  min-height: 48px;
  border-left: 3px solid var(--kc-line-strong);
  border-bottom: 1px solid var(--kc-line-hairline);
  cursor: pointer;
  transition: background var(--kc-motion-fast) ease;
}
.kc-lb__row:hover { background: var(--kc-bg-hover); }
.kc-lb__dgn { display: flex; align-items: center; gap: 8px; min-width: 0; }
.kc-lb__faction { width: 16px; height: 16px; flex: none; }
.kc-lb__dgn-name { font-size: 13px; font-weight: 600; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-lb__key { display: flex; align-items: center; gap: 8px; }
.kc-lb__time { font-size: 12px; }
.kc-lb__pos { color: var(--kc-pos); }
.kc-lb__neg { color: var(--kc-neg); }
.kc-lb__affixes { display: inline-flex; gap: 4px; }
.kc-lb__players { display: inline-flex; gap: 4px; }
.kc-lb__score { font-size: 15px; font-weight: 700; color: var(--kc-text-hi); }

.kc-lb__pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; }
.kc-lb__pager-info { font-size: 11px; color: var(--kc-text-low); }
.kc-lb__pager-ctrl { display: flex; align-items: center; gap: 10px; }
.kc-lb__pager-num { font-size: 12px; color: var(--kc-text-mid); }
.kc-lb__pager-btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-md); cursor: pointer; background: var(--kc-bg-inset); border: 1px solid var(--kc-line-default); color: var(--kc-text-hi); font: 500 12px/1 var(--kc-font-ui); }
.kc-lb__pager-btn:hover:not(:disabled) { background: var(--kc-bg-hover); }
.kc-lb__pager-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.kc-lb__empty { padding: 40px; text-align: center; color: var(--kc-text-mid); }

@media (max-width: 815px) {
  .kc-lb__head { display: none; }
  .kc-lb__row { grid-template-columns: auto minmax(0, 1.4fr) auto auto auto; gap: 10px; }
  .kc-lb__time, .kc-lb__affixes { display: none; }
}

@media (max-width: 480px) {
  .kc-lb__row { padding: 0 10px; gap: 8px; }
  .kc-lb__players { gap: 2px; }
  .kc-lb__players :deep(.kc-specicon) { width: 16px !important; height: 16px !important; }
}
</style>


