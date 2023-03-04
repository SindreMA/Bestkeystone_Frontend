<template >
    <q-tr >
      <q-td key="icon" >
        <q-img :src="data.row.iconUrl" width="35px" height="35px" />
      </q-td>
      <q-td key="name" >
        {{ data.row.name }}
      </q-td>
      <q-td key="spec" >
      <div class="flex  align-content-center gap-5">
        <q-img :src="spec.icon_url" width="30px" height="30px" />
        <classTextColor :spec="spec.id">
          {{ capitalize(spec.name) }}
        </classTextColor>
      </div>
      </q-td>
      <q-td key="class" >
        <div class="flex  align-content-center gap-5">
        <q-img :src="_class.icon_url" width="30px" height="30px" />
        <classTextColor :spec="spec.id">
          {{ capitalize(_class.name) }}
        </classTextColor>
        </div>
      </q-td>
      <q-td key="description" >
        hover me
        <q-tooltip>
          {{ data.row.description }}
        </q-tooltip>
      </q-td>
      <q-td key="count" class="text-right" >
        {{ data.row.usersCount }}
      </q-td>
    </q-tr>
</template>

<script lang='ts' setup>
import classTextColor from 'components/containers/classTextColor.vue'
import { computed, toRefs } from 'vue';
import _ from 'lodash';
import { useStore } from 'src/store';

const capitalize = _.capitalize;

const store = useStore();
const _data = store.state.data

const classes = computed(() => _data.Classes);
const _class = computed(() => classes.value.find(x=> x.id === data.value.row.classId));

const specs = computed(() => _data.Specs);
const spec = computed(() => specs.value.find(x=> x.id === data.value.row.specId));


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
