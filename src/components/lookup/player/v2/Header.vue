<template>
  <div class="flex justify-between">
    <div>
      <div class="flex">
        <q-img class="avatarImage" :src="data?.avatar_url ?? `https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310107/external/wow.png`" />
        <div class="self-center capitalize">
          <div class="HeaderSize3">
            <classTextColor :_class="data?.character_class">
              {{ data?.name ?? backupData.name }}
            </classTextColor>
          </div>
          <div v-if="data?.guild">
            <router-link :to="`/lookup/guild/${data?.guild.region}/${data?.guild.realm}/${data?.guild.name}`">
              <factionTextColor :faction="data?.guild.faction">
                {{ data?.guild.name }}
              </factionTextColor>
            </router-link>
          </div>
          <div>[{{ data?.region ?? backupData.region }}] {{ data?.realm ?? backupData.realm }}</div>

        </div>
      </div>
      <br>
      <div class="flex">
        <div v-for="(item, index) in playerLinks" class="externalLinks" :key="index">
          <a :href="item.link" target="_blank">
            <img class="iconLink" :src="item.image">
            <q-tooltip>{{ item.description }}</q-tooltip>
          </a>
        </div>
      </div>
    </div>
    <div class="flex items-end">
      <div v-for="(val, field, i) in fields" :key="field" class="flex items-end">
        <div v-if="val != undefined && val != 'undefined: undefined'" class="flex items-end field">
          <div class="value self-end">
            {{ val }}
          </div>
          {{ field }}
        </div>

        <q-separator v-if="i !== 3" class="self-end" style="height: 40px" vertical dark />
      </div>


      <br style="margin-right: 60px">
    </div>
  </div>

</template>

<script lang="ts" setup>
import classTextColor from '../../../containers/classTextColor.vue'
import factionTextColor from '../../../containers/factionTextColor.vue'
import SF from '../../../../SharedFunctions'
import { computed, PropType, toRefs } from 'vue';
import { RunData } from 'src/types/lookup';


const props = defineProps({
  data: {
    type: Object,
  },
  fields: {
  },
  backupData: {
    type: Object as PropType<RunData>,
  },
})

const { data, fields } = toRefs(props)
const playerLinks = computed(() => {
  const region = data.value?.region ?? props.backupData.region
  const realm = data.value?.realm ?? props.backupData.realm
  const name = data.value?.name ?? props.backupData.name

  var sites = [
    {
      image: SF.FormatToCloudinary(`external/wow.png`),
      description: "View on armory",
      link: `https://www.worldofwarcraft.com/en-${region.replace(
        "eu",
        "gb"
      )}/character/${realm}/${name}`
    },
    {
      image: SF.FormatToCloudinary(`external/rio.png`),
      description: "View on Raider.IO",
      link: `https://raider.io/characters/${region}/${realm
        }/${name}`
    },
    {
      image: SF.FormatToCloudinary(`external/warcraftlogs.png`),
      description: "View on Warcraftlogs.com",
      link: `https://www.warcraftlogs.com/character/${region
        }/${realm}/${name}`
    },
    {
      image: SF.FormatToCloudinary(`external/raidbots.png`),
      description: "Simulate on Raidbots.com",
      link: `https://www.raidbots.com/simbot/quick?region=${region
        }&realm=${realm}&name=${name}`
    }
  ];
  return sites;
})
</script>

<style scouped>
a {
  text-decoration: inherit;
}

.field {
  margin: 0 5px;
}

.field .value {
  margin: 5px;
  font-size: 30px;
}

.avatarImage {
  width: 120px;
  height: 120px;
  border-radius: 100%;
  margin-right: 15px;
}

.iconLink {
  width: 18px;
  height: 18px;
  border-radius: 100%;
}

.externalLinks {
  margin: 0 6px;
}
</style>
