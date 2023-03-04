<template >
    <q-tr >
      <q-td key="icon" >
        <q-img :src="data.row.iconUrl" width="35px" height="35px" />
      </q-td>
      <q-td key="name" >
        {{ data.row.name }}
      </q-td>
      <q-td key="inventoryType" >
        {{ capitalize(data.row.inventoryType) }}
      </q-td>
      <q-td key="quality" >
        {{ capitalize(data.row.quality) }}
      </q-td>
      <q-td key="requiredLevel" >
        {{ data.row.requiredLevel }}
      </q-td>
      <q-td key="count" class="text-right" >
        {{ data.row.usersCount }}
      </q-td>
    </q-tr>
</template>

<script lang='ts' setup>
import { toRefs } from 'vue';
import _ from 'lodash';

const capitalize = _.capitalize;


const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const { data } = toRefs(props);

</script>

<style scoped>

</style>