<template>
    <div>
        <h2>Talent usage</h2>
    <div>(Data is not limited to keystone runs)</div>
    <div>(We also just fetch details on lookup, so data is a bit outdated )</div>
    <div>(This will be changed later to fetch on keystone done)</div>
    <br>
    <TalentsTable :items="rows" />
    </div>
</template>

<script lang='ts' setup>
import TalentsTable from 'components/ListViews/Tables/Talents/TalentTable.vue';
import axios from 'axios';
import { useStore } from 'src/store';
import { ref } from 'vue';

const store = useStore();
const data = store.state.data

var rows = ref<Array<object>>([])

axios.get(`${data.apiUrl}/talents`).then((response) => {
  rows.value = response.data
});

</script>

<style scoped>

</style>
