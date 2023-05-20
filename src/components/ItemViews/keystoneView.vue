<template>
  <div id="mainDivView" :class="`${noShadow ? '' : 'shadow-24'}`">
    <div v-if="!fetching && runData">
      <div class="text-center HeaderSize3">{{runData.zone.name}} +{{runData.level}}</div>
      <div class="flex justify-center">
        <p
          v-if="FormatTimeUsed((runData.time.map_time - 1000) - runData.time.clear_time).startsWith('-')"
        >
          Cleared
          <strong>{{" " + FormatTimeAgo(runData.time.completed_timestamp) + " "}}</strong> in
          <strong>{{' ' + FormatTimeUsed(runData.time.clear_time)}}</strong>
          . Over time by {{(`${FormatTimeUsed((runData.time.map_time - 1000) - runData.time.clear_time)}`).replace("-","")}} ({{(`${100 - Math.round(runData.time.clear_time / (runData.time.map_time - 1000) * 100)}`).replace("-","")}}%)
        </p>
        <p v-else>
          Cleared
          <strong>{{" " + FormatTimeAgo(runData.time.completed_timestamp) + " "}}</strong> in
          <strong>{{' ' + FormatTimeUsed(runData.time.clear_time)}}</strong>
          . Under time by {{FormatTimeUsed((runData.time.map_time - 1000) - runData.time.clear_time)}} ({{100 - Math.round(runData.time.clear_time / (runData.time.map_time - 1000) * 100)}}%)
        </p>
      </div>
      <div class="flex justify-around text-center">
        <div>
          <br />
          <div>Score</div>
          <div>{{Math.round(runData.score * 100 ) / 100}}</div>
        </div>

        <div style="width: 70%;">
          <div>Affixes</div>
          <div class="flex justify-around">
            <div v-for="(affix, index) in runData.affixes.filter((x,i)=> x > 0)" :key="index">
              <div>Level {{getAffixLevelFromIndex(index)}}</div>
              <div style="width: 35px; height: 35px;" class="flex justify-center">
                <Affix
                  :size="35"
                  class="AffixImg"
                  :affixid="affix"
                  :border="true"
                  :tooltip="true"
                  :customSize="true"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <br />
          <div>Item Level</div>
          <div>{{GroupIlvl}}</div>
        </div>
      </div>
      <br />
      <q-table
        :columns="columns "
        :rows="runData.players"
        dark
        dense
        :grid="$q.screen.width < 710"
        :bordered="$q.screen.width < 710"
        :flat="$q.screen.width < 710 || noShadow"
        card-class="background HeaderFont"
        table-class="HeaderFont"
        table-header-class="HeaderFont"
        :pagination.sync="paginationControl"
        row-key="sqlId"
        hide-bottom
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="role" :props="props">
              <CloudinaryFormat :url="`roles/${getRole(props.row.spec)?.toLowerCase()}.png`" v-slot="{ link }">
                <q-img id="roleImage" :src="link" />
              </CloudinaryFormat>
            </q-td>
            <q-td key="name" :props="props">
              <div class="flex" style="gap: 5px;">
                  <CloudinaryFormat :url="`${GetSpec(props.row.spec)?.icon_url}`" v-slot="{ link }">

                    <q-img class="itemIcon" :src="link" />
                  </CloudinaryFormat>
                <ClassTextColor :spec="props.row.spec">
                <a
                  :href="`/lookup/player/${props.row.region}/${props.row.realm}/${props.row.name}`"
                  @click="reload()"
                >{{props.row.name}}</a>
              </ClassTextColor>
              </div>
            </q-td>
            <template v-if="props.row.details">
              <q-td
                key="ilvl"
                :props="props"
              >{{props.row.details.equipped_item_level}}</q-td>
              <q-td key="talents" :props="props">
                <div class="flex justify-center">
                  <div>Hove to see</div>
                  <q-tooltip>
                  <div class="talentTooltip wrap">
                    <Talent v-for="(talent) in getCurrentSpecTalents(props.row)" :talent="talent" :key="`${talent.id}`" />
                  </div>
                  </q-tooltip>
                </div>
              </q-td>
              <q-td key="trinkets" :props="props">
                <a
                v-for="(item, index) in getItems(props.row,'TRINKET')" :key="index"
                  :href="`http://www.wowhead.com/item=${item.id}`"
                  :data-wowhead="getWowheadTooltipItemString(item)"
                >
                  <img
                    class="itemIcon"
                    :src="item.iconUrl ?? 'https://wow.zamimg.com/images/wow/icons/medium/' + item.icon + '.jpg'"
                  />
                </a>
              </q-td>
            </template>

            <template v-else-if="props.row && props.row.renewing">
              <q-td key="necklvl" :props="props">
                <q-spinner-bars color="yellow" size="15px"/>
                <q-tooltip>fetching info from blizzard</q-tooltip>
              </q-td>
              <q-td key="ilvl" :props="props">
                <q-spinner-bars color="yellow" size="15px"/>
                <q-tooltip>fetching info from blizzard</q-tooltip>
              </q-td>
              <q-td key="talents" :props="props">
                <q-spinner-bars color="yellow" size="15px"/>
                <q-tooltip>fetching info from blizzard</q-tooltip>
              </q-td>
              <q-td key="trinkets" :props="props">
                <q-spinner-bars color="yellow" size="15px"/>
                <q-tooltip>fetching info from blizzard</q-tooltip>
              </q-td>
            </template>
            <template v-else>
              <q-td key="ilvl" :props="props">
                <i class="material-icons" style="color: red;">clear</i>
                <q-tooltip>Could not gather details of player</q-tooltip>
              </q-td>
              <q-td key="talents" :props="props">
                <i class="material-icons" style="color: red;">clear</i>
                <q-tooltip>Could not gather details of player</q-tooltip>
              </q-td>
              <q-td key="trinkets" :props="props">
                <i class="material-icons" style="color: red;">clear</i>
                <q-tooltip>Could not gather details of player</q-tooltip>
              </q-td>
            </template>
          </q-tr>
        </template>
      </q-table>
    </div>

    <div v-else-if="fetching && !runData">
      <br />
      <br />
      <br />
      <div class="flex justify-center">
        <q-spinner-bars color="grey" size="15em" />
      </div>
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
#mainDivView {
  min-height: 300px;
  min-width: 300px;
  margin: 15px;
}
#roleImage {
  width: 23px;
  height: 23px;
}
.itemIcon {
  width: 23px;
  height: 23px;
  border: 1px solid grey;
  border-radius: 5px;
  margin: 0 2px;
}
.AffixImg {
  width: 35px;
  height: 35px;
}
.talentTooltip {
  min-width: 200px;
  max-width: 600px;
  display: flex;
  gap: 5px;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
</style>

