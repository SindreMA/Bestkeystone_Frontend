<template>
  <div class="HeaderFont">
    <div id="filterMenu" class="flex justify-between">
      <div>
        Dungeon
        <dungeonSelector :widthImage="true" :season="season" v-model="zone" filled />
      </div>
      <div>
        Season
        <seasonSelector :onlySeasons="true" v-model="season" filled :region="'us'" />
      </div>
      <div>
        Affix level 2
        <affixSelector v-model="affix1" :level="2" filled />
      </div>
      <div>
        Affix level 4
        <affixSelector v-model="affix2" :level="4" filled />
      </div>
      <div>
        Affix level 7
        <affixSelector v-model="affix3" :level="7" filled />
      </div>

    </div>

    <q-table
      title="Keystone leaderboard"
      :rows="leaderboardData"
      :columns="Columns"
      v-model:pagination="paginationControl"
      :rows-per-page-options="[10,20,50,100,500]"
      row-key="rank"
      dark
      class="tableMinSize"
      @request="onRequest"
      :loading="loading"
      color="amber"
      :visible-columns="activeColumns"
    >
      <template v-slot:top-right="scope">
        <div class="text-center">
          Region
          <regionSelector :rounded="true" :input="query.region" :filled="true" @change="region = $event" />
          <div class="relative">
            <div class="absolute upperButtons" >
              <div class="flex" v-if="!loading">
                <q-btn round dense :disable="scope.pagination.page <= 1" @click="scope.prevPage()" icon="keyboard_arrow_left" />
                <q-btn round dense :disable="scope.pagination.page * scope.pagination.rowsPerPage < leaderboardData.maxRows" @click="scope.nextPage()" icon="keyboard_arrow_right" />
              </div>
            </div>
          </div>

        </div>
      </template>
      <template v-slot:bottom v-if="loading">
        <q-linear-progress indeterminate color="amber" />
      </template>
            <template v-slot:pagination="scope" v-else>

              <div class="flex">
                <div class="minorTopMargin">Page {{scope.pagination.page}}</div>
              <div class="flex float-right">
                <q-btn round dense :disable="scope.pagination.page <= 1" @click="scope.prevPage()" icon="keyboard_arrow_left" />
                <q-btn round dense :disable="scope.pagination.page * scope.pagination.rowsPerPage < leaderboardData.maxRows" @click="scope.nextPage()" icon="keyboard_arrow_right" />
            </div>
              </div>


      </template>

      <template v-slot:body="props">
        <q-tr :props="props" @click="props.expand = !props.expand">
          <q-td key="rank">
            <CloudinaryFormat :url="`factions/${props.row.faction.toLowerCase()}.png`" v-slot="{ link }">
            <div class="flex justify-around">
              <q-img
                spinner-size="10px"
                class="factionIconSize"
                spinner-color="white"
                :src="link"
              />
              {{props.row.rank}}
            </div>
          </CloudinaryFormat>
          </q-td>
          <q-td key="zone" :props="props"><div v-if="props.row.zone.short_name">{{props.row.zone.short_name}}</div> <div v-else>{{props.row.zone.name}}</div></q-td>
          <q-td key="level" :props="props">
            <div class="flex justify-around">
              +{{props.row.level}}
              <i
                v-for="(item, chestIndex) in chests(props.row)"
                :key="chestIndex"
                class="starIcon material-icons"
              >star</i>
            </div>
          </q-td>
          <q-td key="time" :props="props">{{FormatTimeUsed(props.row.time.clear_time)}}</q-td>
          <q-td key="affixes" :props="props">
            <div class="flex">
              <Affix
                :affixid="affix"
                v-for="(affix, index) in props.row.affixes"
                :tooltip="true"
                :key="index"
              />
            </div>
          </q-td>
          <q-td key="players" :props="props">
            <div class="flex justify-between">
              <div
                :style="`color: ${getClass(player.class).color};`"
                class="flex justify-center"
                v-for="(player, index) in getPlayersWithRoles(props.row.players)"
                :key="index"
              >
              <PlayerTextVue :player="player" :region="props.row.region"  >
              <CloudinaryFormat :url="`roles/${player.role}.png`" v-slot="{ link }">
                <q-img
                spinner-size="5px"
                  v-if="player.showIcon"
                  id="roleImage"
                  :src="link"
                />
              </CloudinaryFormat>

                {{/* this is outdated link and should be fixed */}}
                <a                
                  :href="`/#/lookup?characters=${props.row.region}.${player.realm}.${player.name}`"
                  v-if="(index + 1) !=  getPlayersWithRoles(props.row.players).length"
                >{{player.name + " "}}</a>
                <a
                  :href="`/#/lookup?characters=${props.row.region}.${player.realm}.${player.name}`"
                  v-else
                >{{player.name}}</a>
                <q-tooltip>
                  <div class="flex">
                    <SpecIcon :size="20" :text="true" :id="player.spec" />
                    <SpecIcon :size="20" :useclass="true" :text="true" :id="player.spec" />
                  </div>
                </q-tooltip>
              </PlayerTextVue>
              </div>

            </div>
          </q-td>
          <q-td key="score" :props="props">{{Math.round(props.row.score * 10) / 10}}</q-td>
        </q-tr>
        <q-tr class="hideHover " v-if="props.expand" :props="props">
          <q-td class="hideHover" colspan="100%">
            <keystoneView class="keystoneView" :id="props.row.id"></keystoneView>
          </q-td>
        </q-tr>
      </template>
    </q-table>
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
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStore } from "src/store";
import PlayerTextVue from "components/ItemViews/PlayerText.vue"

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
let activeColumns = ref<any>(visableColumns)
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


    const getRole = (spec) => GetSpec(spec).role;

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

    const fetchLeaderboard = (pagination) => {


      if (pagination) {
        if (pagination.page) paginationControl.value.page = pagination.page;
        if (pagination.rowsPerPage) paginationControl.value.rowsPerPage = pagination.rowsPerPage;
        if (pagination.sortBy) paginationControl.value.sortBy = pagination.sortBy;
      }
      var { page, rowsPerPage, sortBy } = paginationControl.value;

      var apiUrl = data.apiUrl;
      var apiString = `/KeystoneRun/leaderboard?from=${(page - 1) *
        rowsPerPage}&amount=${rowsPerPage}&seasonId=${season.value?.season?.id === 6 ? 5 : season.value?.season?.id}`;
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
          paginationControl.value.rowsNumber = x.data.maxRows;

          leaderboardData.value = x.data.list;

          paginationControl.value.page = page + 1;
          paginationControl.value.rowsPerPage = rowsPerPage;
          paginationControl.value.sortBy = sortBy;

          activeColumns.value = visableColumns.value;

          loading.value = false;
        })
        .catch(x => {
          console.log("Error", x);
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
a {
  color: inherit;
}
#roleImage {
  width: 20px;
  height: 20px;
}
.factionIconSize {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
.starIcon {
  transform: scale(0.6);
  width: 7px;
  color: goldenrod;
}
.upperButtons {
  right: 0px;
  }
  .minorTopMargin {
    margin-top: 8px;
  }
.tableMinSize {
  min-height: 663px;
}
</style>


