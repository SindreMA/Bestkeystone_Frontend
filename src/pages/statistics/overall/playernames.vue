<template>
    <div class="textColor">
        <h2>Playernames patterns</h2>
        <p>This is a page where you can see how many players have a certain pattern in their name.</p>
        <p>(Pattern with less than 50 occurances are not saved, it also only tracks m+ players)</p>
        <NamePatternTable v-model:search="search" v-model:length="length" v-model:useWords="useWords" :items="rows"  />
    </div>
</template>

<script lang='ts' setup>
import NamePatternTable from 'components/ListViews/Tables/Names/NamePatternTable.vue';
import axios from 'axios';
import { useStore } from 'src/store';
import { ref, watch } from 'vue';

const store = useStore();
const data = store.state.data

var search = ref<string>("lock")
var length = ref<number>()
var useWords = ref<boolean>(true)

var rows = ref<Array<any>>([])

watch([search, length, useWords],() => {
  fetchData()
})


const fetchData = async () => {
  axios.get(`${data.apiUrl}/Player/names?search=${search.value}&length=${length.value}&useWords=${useWords.value}`).then((response) => {
    rows.value = response.data
  });
}
fetchData()
</script>

<style scoped>

</style>