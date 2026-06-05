<template>
    <div>
        <KcPageHeader eyebrow="Overall" title="Talents" sub="Talent-build usage across tracked players. Not limited to keystone runs; details are fetched on lookup." />
    <TalentsTable :items="rows" />
    </div>
</template>

<script lang='ts' setup>
import TalentsTable from 'components/ListViews/Tables/Talents/TalentTable.vue';
import KcPageHeader from 'components/layout/KcPageHeader.vue';
import axios from 'axios';
import { useStore } from 'src/store';
import { ref } from 'vue';

const store = useStore();
const data = store.state.data

var rows = ref<Array<object>>([])

axios.get(`${data.apiUrl}/Talent`).then((response) => {
  rows.value = response.data
}).catch((e) => console.log(e));

</script>

<style scoped>

</style>
