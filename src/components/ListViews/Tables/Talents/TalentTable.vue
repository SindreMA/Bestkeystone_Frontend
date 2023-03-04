<template>
  <q-table
    dark
    :rows="items"
    :columns="columns"
    :pagination="paginator"
    :filter="filter"
      no-data-label="I didn't find anything for you"
      no-results-label="The filter didn't uncover any results"
  >
  <template v-slot:body="props">
    <TalentRow :data="props" />
  </template>
  <template v-slot:top-right>
        <q-input  dark dense filled debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
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
import { ref, toRefs } from 'vue';
import { QTableColumn, QTableProps } from 'quasar';
import TalentRow from './TalentRow.vue'
const columns : Array<QTableColumn> = [
  { name: 'icon', headerStyle:'width: 0px', align: 'left', label: '', field: 'iconUrl', sortable: false},
  { name: 'name', align: 'left', label: 'Item', field: 'name', sortable: true },
  { name: 'spec', align: 'left', label: 'Spec', field: 'specId', sortable: true },
  { name: 'class', align: 'left', label: 'Class', field: 'classId', sortable: true },
  { name: 'description', align: 'left', label: 'Description', field: 'description', sortable: false },
  { name: 'count', align: 'right', label: 'Users', field: 'usersCount', sortable: true },
]

const paginator : QTableProps['pagination'] = {
  sortBy: 'usersCount',
  descending: true,
  rowsPerPage: 20,
}

const filter = ref('');

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const { items } = toRefs(props);

</script>

<style scoped>

</style>
