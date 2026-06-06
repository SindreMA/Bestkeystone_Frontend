<template>
  <div class="kc-root kc-rundetail">
    <div v-if="!fetching && runData" class="kc-rd__inner">
      <!-- header -->
      <div class="kc-rd__head">
        <KcDungeonThumb :keystone-id="runData.zone.id" :size="52" radius="var(--kc-r-lg)" />
        <div class="kc-rd__head-text">
          <h1 class="kc-disp kc-rd__title">{{ runData.zone.name }} <span class="kc-rd__lvl">+{{ runData.level }}</span></h1>
          <div class="kc-mono kc-rd__timing">
            Cleared {{ FormatTimeAgo(runData.time.completed_timestamp) }} in {{ FormatTimeUsed(runData.time.clear_time) }}
            <span :class="overTime ? 'kc-rd__neg' : 'kc-rd__pos'">· {{ overTime ? `over time by ${overBy}` : `under time by ${underBy}` }} ({{ parPct }}%)</span>
          </div>
        </div>
      </div>

      <!-- trio -->
      <div class="kc-rd__trio">
        <div class="kc-rd__stat">
          <div class="kc-eyebrow">Score</div>
          <div class="kc-disp kc-tnum kc-rd__stat-num">{{ Math.round(runData.score * 100) / 100 }}</div>
        </div>
        <div class="kc-rd__stat">
          <div class="kc-eyebrow">Affixes</div>
          <div class="kc-rd__affixes">
            <Affix v-for="(affix, index) in runData.affixes.filter((x) => x > 0)" :key="index" :size="28" :affixid="affix" :tooltip="true" />
          </div>
        </div>
        <div class="kc-rd__stat">
          <div class="kc-eyebrow">Group item level</div>
          <div class="kc-disp kc-tnum kc-rd__stat-num">{{ GroupIlvl }}</div>
        </div>
      </div>

      <!-- players -->
      <div class="kc-rd__players">
        <div class="kc-rd__phead">
          <span class="kc-eyebrow">Player</span>
          <span class="kc-eyebrow kc-rd__r">ilvl</span>
          <span class="kc-eyebrow kc-rd__c">Talents</span>
          <span class="kc-eyebrow kc-rd__r">Trinkets</span>
        </div>
        <div v-for="(p, i) in sortedPlayers" :key="i" class="kc-rd__prow">
          <span class="kc-rd__pname">
            <CloudinaryFormat :url="`${GetSpec(p.spec)?.icon_url}`" v-slot="{ link }"><img class="kc-rd__picon" :src="link" /></CloudinaryFormat>
            <ClassTextColor :spec="p.spec">
              <a :href="`/lookup/player/${p.region}/${p.realm}/${p.name}`">{{ p.name }}</a>
            </ClassTextColor>
          </span>
          <template v-if="p.details">
            <span class="kc-tnum kc-rd__ilvl kc-rd__r">{{ p.details.equipped_item_level }}</span>
            <span class="kc-rd__c">
              <span class="kc-chip-mini">Hover</span>
              <q-tooltip><div class="talentTooltip"><Talent v-for="talent in getCurrentSpecTalents(p)" :talent="talent" :key="`${talent.id}`" /></div></q-tooltip>
            </span>
            <span class="kc-rd__trinkets kc-rd__r">
              <a v-for="(item, index) in getItems(p, 'TRINKET')" :key="index" :href="`http://www.wowhead.com/item=${item.id}`" :data-wowhead="getWowheadTooltipItemString(item)">
                <img class="kc-rd__picon" :src="item.iconUrl ?? 'https://wow.zamimg.com/images/wow/icons/medium/' + item.icon + '.jpg'" />
              </a>
            </span>
          </template>
          <template v-else-if="p.renewing">
            <span class="kc-rd__r"><q-spinner-bars color="yellow" size="14px" /></span>
            <span class="kc-rd__c"><q-spinner-bars color="yellow" size="14px" /></span>
            <span class="kc-rd__r"><q-spinner-bars color="yellow" size="14px" /></span>
          </template>
          <template v-else>
            <span class="kc-rd__ghost kc-rd__r">—</span>
            <span class="kc-rd__ghost kc-rd__c">—</span>
            <span class="kc-rd__ghost kc-rd__r">—</span>
          </template>
        </div>
      </div>
    </div>

    <div v-else-if="fetching && !runData" class="kc-rd__loading">
      <q-spinner-bars style="color: var(--kc-accent)" size="6em" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import numeral from "numeral";
import SF, {moment} from "../../SharedFunctions";
import Affix from "../Icons/Affix/index.vue";
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import { useStore } from "src/store";
import { LookupTalents } from "src/types/talents";
import Talent from "../lookup/player/v2/Talent.vue";
import ClassTextColor from "../containers/classTextColor.vue";
import KcDungeonThumb from "components/keystone/KcDungeonThumb.vue";

const props = defineProps({
  id: {
  },
  data: {
  },
  noShadow: {
    type: Boolean,
  },
});

const { id, data, noShadow } = toRefs(props);

const runData = ref(null)
const fetching = ref(false)

const paginationControl = ref({
  sortBy: "role",
  rowsPerPage: 999,
  page: 1
})


watch(id, ()=> getData(id.value))

const store = useStore();
const _data = store.state.data

const GetSpecs = computed(() => _data.Specs )
const GetClasses = computed(() => _data.Classes )
const GroupIlvl = computed(()=> {
      if (runData.value) {
        var ilvlList = runData.value.players
          .filter(x => x.details && x.details.equipped_item_level)
          .map(x => x.details.equipped_item_level);
        const sum = ilvlList.reduce((a, b) => a + b, 0);
        const avg = sum / ilvlList.length || 0;
        return Math.round(avg * 10) / 10;
      }
    })

const overTime = computed(() => !!runData.value && FormatTimeUsed((runData.value.time.map_time - 1000) - runData.value.time.clear_time).startsWith('-'))
const underBy = computed(() => runData.value ? FormatTimeUsed((runData.value.time.map_time - 1000) - runData.value.time.clear_time) : '')
const overBy = computed(() => underBy.value.replace('-', ''))
const parPct = computed(() => runData.value ? Math.abs(100 - Math.round(runData.value.time.clear_time / (runData.value.time.map_time - 1000) * 100)) : 0)
const sortedPlayers = computed(() => runData.value ? [...runData.value.players].sort((a, b) => getRoleNr(a.spec) - getRoleNr(b.spec)) : [])

const getItems = ( row,itemSlot) => {
      return row.details.equipment.filter(x=> x.slot.replace('_1','').replace('_2','') == itemSlot.toUpperCase())
      }

const getAffixLevelFromIndex = (index) => {
      if (index == 0) return 2;
      if (index == 1) return 4;
      if (index == 2) return 7;
      if (index == 3) return 10;
    }

const reload = () => {
      setTimeout(() => {
        location.reload();
      }, 250);
    }

const FormatTimeUsed = (time) => moment.duration(time).format("hh:mm:ss");
const FormatTimeAgo = (time) => moment(time).fromNow();

const GetClass = (class_id) => {
      if (!GetClasses.value) return null;
      for (let i = 0; i < GetClasses.value.length; i++) {
        const _class = GetClasses.value[i];
        if (class_id == _class.id) {
          return _class;
        }
      }
    }

const short = (num, format) => numeral(num).format(format);

const getCurrentSpecTalents = (row) => {
  if (!row?.details?.talents) return [];
  const talents: LookupTalents[][] = row?.details?.talents;
  var specTals = talents.find(x=> x[0]?.specId === row.spec)
  return specTals
}

const getWowheadTooltipItemString = (item) => {
            var result = `item=${item.id}&ilvl=${item.item_level}`;

            if (item.transmog) {
                result += `&transmog=${item.transmog}`
            }

            if (item.bonus_lists !== null && item.bonus_lists !== undefined) {
                result += `&bonus=${item.bonus_lists.replace(",",":")}`
            }
            return result
    }

const getRole = (spec) => GetSpec(spec)?.role;

const getRoleNr = (spec) => {
  const _spec = GetSpec(spec);
  if (_spec?.role.toLowerCase() == "tank") return 0;
  if (_spec?.role.toLowerCase() == "healer") return 1;
  return 2;
}

const GetSpec = (spec_id) => {
      if (!GetSpecs.value) return null;
      return GetSpecs.value.find(x=> x.id == spec_id)
}


    const refreshPlayers = () => {
      const timestampNow = SF.GetMoment(new Date()).unix() * 1000;
      var apiUrl = _data.apiUrl;
      var playersInUpdateNeed = runData.value.players.filter(
        c =>
          (c.details &&
            c.details.fetchTimestamp + 3600000 < timestampNow) ||
          !c.details
      );

      playersInUpdateNeed.forEach(player => {
        if (player) {
          player.renewing = true;
          axios
            .get(
              `${apiUrl}/Player/new_details?character=${player.name}&realm=${player.realm}&region=${player.region}&timestamp=${runData.value.time.completed_timestamp}`
            )
            .then(v => {

              player.details = v.data;
              player.renewing = false;
              runData.value.players = [...runData.value.players]
            })
            .catch(c => (player.renewing = false));
        }
      });
    }

const getData = (id) => {
      var apiUrl = _data.apiUrl;
      fetching.value = true;

      axios
        .get(`${apiUrl}/KeystoneRun?keystone_id=${id}`)
        .then(x => {
          fetching.value = false;
          runData.value = x.data;

          refreshPlayers();
        })
        .catch(x => {
          console.log(x);
          fetching.value = false;
        });
    }


    const columns : any = [
        {
          name: "role",
          label: "Role",
          sortable: true,
          field: row => getRoleNr(row.spec),
          sort: (a, b, rowA, rowB) => getRoleNr(rowA.spec) - getRoleNr(rowB.spec),
          format: (val, row) => getRole(row.spec),
          align: "left"
        },
        {
          name: "name",
          label: "Name",
          field: "name",
          sortable: true,
          align: "left"
        },
        {
          name: "ilvl",
          label: "ILVL",
          field: row => row.details.equipped_item_level,
          sortable: true,
          sort: (a, b, rowA, rowB) =>
            rowA.details.equipped_item_level -
            rowB.details.equipped_item_level,
          format: (val, row) => row.details.equipped_item_level,
          align: "left"
        },
        {
          name: "talents",
          label: "Talents",
          field: "Talents", // row => row.details.talents,
          align: "center"
        },
        {
          name: "trinkets",
          label: "Trinkets",
          field: "Trinkets", //row => row.details.items['trinket1'].id +"-"+ row.details.items['trinket2'].id,
          align: "right"
        }
      ]


onBeforeMount(() => {
  if (!data.value) {
      getData(id.value);
    } else {
      runData.value = data.value;
      refreshPlayers();
    }
    })

</script>
<style scoped>
.kc-rundetail { padding: var(--kc-sp-5); background: var(--kc-bg-surface); border: 1px solid var(--kc-line-default); border-radius: var(--kc-r-lg); }

.kc-rd__head { display: flex; align-items: center; gap: 14px; margin-bottom: var(--kc-sp-5); }
.kc-rd__head-text { min-width: 0; }
.kc-rd__title { font-size: 26px; font-weight: 700; color: var(--kc-text-hi); margin: 0; overflow-wrap: anywhere; }
.kc-rd__lvl { color: var(--kc-key-hot); }
.kc-rd__timing { font-size: 13px; color: var(--kc-text-mid); margin-top: 4px; }
.kc-rd__pos { color: var(--kc-pos); font-weight: 600; }
.kc-rd__neg { color: var(--kc-neg); font-weight: 600; }

.kc-rd__trio { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 12px; margin-bottom: var(--kc-sp-5); }
.kc-rd__stat { padding: 12px 14px; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); }
.kc-rd__stat-num { font-size: 22px; font-weight: 700; margin-top: 4px; min-height: 30px; display: flex; align-items: center; }
.kc-rd__affixes { display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap; min-height: 30px; }

.kc-rd__players { border: 1px solid var(--kc-line-hairline); border-radius: var(--kc-r-md); overflow: hidden; }
.kc-rd__phead, .kc-rd__prow { display: grid; grid-template-columns: minmax(0, 1fr) 70px 100px 110px; align-items: center; gap: 12px; padding: 8px 14px; }
.kc-rd__phead { background: var(--kc-bg-raised); border-bottom: 1px solid var(--kc-line-hairline); }
.kc-rd__phead .kc-eyebrow { color: var(--kc-text-low); }
.kc-rd__prow { border-bottom: 1px solid var(--kc-line-hairline); }
.kc-rd__prow:last-child { border-bottom: none; }
.kc-rd__prow:nth-child(odd) { background: var(--kc-bg-inset); }
.kc-rd__r { text-align: right; justify-self: end; }
.kc-rd__c { text-align: center; justify-self: center; }
.kc-rd__pname { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.kc-rd__pname a { text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; display: inline-block; max-width: 100%; }
.kc-rd__pname a:hover { text-decoration: underline; }
.kc-rd__picon { width: 24px; height: 24px; border-radius: var(--kc-r-sm); border: 1px solid var(--kc-line-default); flex: none; }
.kc-rd__trinkets { display: inline-flex; gap: 4px; }
.kc-rd__ilvl { font-size: 13px; color: var(--kc-text-mid); }
.kc-rd__ghost { color: var(--kc-text-ghost); }
.kc-chip-mini { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: var(--kc-r-pill); background: var(--kc-bg-inset); border: 1px solid var(--kc-line-hairline); font-size: 11px; color: var(--kc-text-mid); cursor: help; }

.kc-rd__loading { display: flex; justify-content: center; padding: 60px 0; }

.talentTooltip { min-width: 200px; max-width: 600px; display: flex; gap: 5px; flex-wrap: wrap; justify-content: space-between; align-items: center; }

@media (max-width: 768px) {
  .kc-rundetail { padding: var(--kc-sp-4); }
  .kc-rd__trio { grid-template-columns: 1fr; }
  .kc-rd__phead, .kc-rd__prow { grid-template-columns: 1fr auto auto; }
  .kc-rd__c { display: none; }
}
</style>

