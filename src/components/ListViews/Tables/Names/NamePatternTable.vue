<template>
  <q-table
    dark
    :rows="items ?? []"
    :columns="columns"
    :pagination="paginator"
    :filter="filter"
      no-data-label="I didn't find anything for you"
      no-results-label="The filter didn't uncover any results"
  >
  <template v-slot:top-left>
    <q-input  dark dense filled debounce="300" placeholder="Table search"
          v-model="filter"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
  </template>

  <template v-slot:top-right>
    <div class="flex gap-15">
        <q-input class="searchInput" dark dense filled debounce="300" label="Db search"        
          :model-value="search"
          @update:model-value="emits('update:search', $event)"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>


        <q-input  dark dense filled class="lengthInput" debounce="300" label="Name length" type="number"
          :model-value="length"
          @update:model-value="emits('update:length', $event)"
        />

        <q-toggle dark :model-value="useWords" @click="emits('update:useWords', !useWords)" label="Match words only" />
      </div>
      </template>

      <template v-slot:no-data="{ icon, message }">
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>
            Well this is sad... {{ message }}
          </span>
        </div>
      </template>
  </q-table>
</template>

<script setup lang="ts">
import { PropType, ref, toRefs } from 'vue';
import { QIcon, QInput, QTable, QTableColumn, QTableProps, QToggle } from 'quasar';
const columns : Array<QTableColumn> = [
  { name: 'name', align: 'left', label: 'Item', field: x=> x[0], sortable: true },
  { name: 'count', align: 'right', label: 'Count', field: x=> x[1], sortable: true },
]

const paginator : QTableProps['pagination'] = {
  sortBy: 'usersCount',
  descending: true,
  rowsPerPage: 20,
}

const emits = defineEmits(["update:search", "update:length", "update:useWords"]);

const filter = ref('');

const props = defineProps({
  items: {
    type: Array as PropType<Array<any>>,
    required: true,
  },
  search: {
    type: String,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
  useWords: {
    type: Boolean,
    required: true,
  },

});

const { items, length, search, useWords } = toRefs(props);

</script>

<style scoped>
.searchInput {
  width: 160px;
}
.lengthInput {
  width: 110px;
}
</style>
