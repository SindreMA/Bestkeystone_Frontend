<template>
  <div class="flex text-center pointer talentComp ">
    <CloudinaryFormat :url="talent?.spell?.spellIconUrl" v-slot="{link}" :size="30">
      <q-img class="talentImg" :src="link"  />
    </CloudinaryFormat>
    <div class="talentLabel">{{ talent.talent?.name }}</div>
    <q-tooltip>
      {{ talent.talent?.description }}
    </q-tooltip>
  </div>
</template>

<script lang="ts" setup>
import CloudinaryFormat from "src/components/data_formatters/CloudinaryFormat.vue";
import { LookupTalents } from "src/types/talents";

const props = defineProps<{
  talent: LookupTalents;
}>();
const { talent } = props;
</script>

<style scoped>
.talentImg {
  width: 30px;
  height: 30px;
}
.talentComp {
  gap: 5px;
  width: 150px;
  align-items: center;
  justify-content: center;
}
.talentLabel {
  font-size: 12px;
  text-align: left;
  width: 100px;
  overflow: hidden;

}
</style>
