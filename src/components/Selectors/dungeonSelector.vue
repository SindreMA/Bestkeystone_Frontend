<template>
  <div id="mainDiv">
    <q-select
      dark
      v-model="dungeon"
      :options="GetDungeons?.filter(x=> x.seasons.includes(season?.season?.id))"
      hide-bottom-space
      borderless
      clearable
      :filled="filled"
    >
      <template v-slot:selected="scope">
        <template v-if="dungeon">
          <q-item v-bind="(scope as any)?.itemProps" v-on="(scope as any)?.itemEvents">
            <CloudinaryFormat
              :url="dungeon?.imageurl"
              v-slot="{ link }"
            >
              <q-img class="dungeonImg" spinner-size="5px" :src="link" />
            </CloudinaryFormat>
            <q-item-section>
              <q-item-label v-html="dungeon.name.replace('Operation: ', '')" />
            </q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item-section>
            <q-item-label v-html="'All'" />
          </q-item-section>
        </template>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" v-on="(scope as any)?.itemEvents">
          <CloudinaryFormat
            :url="scope.opt?.imageurl"
            v-slot="{ link }"
          >
            <q-img class="dungeonImg" :src="link" />
          </CloudinaryFormat>
          <q-item-section>
            <q-item-label v-html="scope.opt.name.replace('Operation: ', '')" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "src/store";
import { ref, toRefs, computed, watch, onMounted } from "vue";
import CloudinaryFormat from "../data_formatters/CloudinaryFormat.vue";

const props = defineProps({
  filled: {
    type: Boolean,
  },
  withImages: {
    type: Boolean,
  },
  season: {
    type: Object,
  },
});

const { filled, withImages, season } = toRefs(props);

const store = useStore();
const data = store.state.data;

const GetDungeons = computed(() => data.Dungeons);
const emit = defineEmits(["update:modelValue", "change", "delete"]);
const dungeon = ref(null);

const getValidLink = (url1, url2) => {
  if (url1) {
    return url1;
  }
  return url2;
};

const setDungeon = (id) => {
  if (GetDungeons?.value) {
    for (let i = 0; i < (GetDungeons?.value?.length ?? 0); i++) {
      const _dungeon = GetDungeons?.value?.[i];
      if (_dungeon.keystone_id == id) {
        dungeon.value = _dungeon;
      }
    }
  }
};
watch(dungeon, () => emit("update:modelValue", dungeon.value));

</script>

<style scoped>
.fullBackground {
  background-repeat: no-repeat;
  background-size: cover;
}

.dungeonImg {
  margin-right: 5px;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  border: solid grey 1px;
}

#mainDiv {
  min-width: 300px;
}
</style>
