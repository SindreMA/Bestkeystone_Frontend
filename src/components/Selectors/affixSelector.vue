<template>
  <div id="mainDivSel">
    <q-select
      v-if="GetAffixes"
      dark
      v-model="affix"
      :options="GetAffixes.filter((x) => x.starting_level == level)"
      hide-bottom-space
      borderless
      clearable
      :filled="filled"
    >
      <template v-slot:selected="scope">
        <template v-if="affix">
          <q-item v-bind="(scope as any)?.itemProps" v-on="(scope as any)?.itemEvents">
            <affixImg class="affixImg" size="10px" :affixid="affix.id" />
          </q-item>
        </template>
        <template v-else>
          <q-item-section>
            <q-item-label v-html="'Any'" />
          </q-item-section>
        </template>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps" v-on="scope.selected">
          <affixImg class="affixImg" size="8px" :affixid="scope.opt.id" />

          <q-item-section>
            <q-item-label v-html="scope.opt.name" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "src/store";
import { computed, onBeforeMount, ref, toRefs, watch } from "vue";
import affixImg from "../Icons/Affix/index.vue";

const props = defineProps({
  filled: {
    type: Boolean,
  },
  level: {
    type: Number,
  }
});

const { filled, level } = toRefs(props);

const affix = ref(null);

const store = useStore();
const data = store.state.data;
const GetAffixes = computed(() => data.Affixes);

const emits = defineEmits(["update:modelValue"]);

watch(affix, () => {
  emits("update:modelValue", affix.value);
});
</script>

<style scoped>
.affixImg {
  width: 25px;
  height: 25px;
  border-radius: 10px;
  border: solid grey 1px;
  margin: 0 10px 0 0;
}
#mainDivSel {
  min-width: 153px;
}
</style>
