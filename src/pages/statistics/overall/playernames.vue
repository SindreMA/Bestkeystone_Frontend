<template>
    <div class="textColor">
        <KcPageHeader eyebrow="Overall" title="Player Names" sub="How many players share a pattern in their name — m+ players only, patterns with ≥50 occurrences." />
        <NamePatternTable v-model:search="search" v-model:length="length" v-model:useWords="useWords" :items="rows"  />
    </div>
</template>

<script lang='ts' setup>
import NamePatternTable from 'components/ListViews/Tables/Names/NamePatternTable.vue';
import KcPageHeader from 'components/layout/KcPageHeader.vue';
import axios from 'axios';
import { useStore } from 'src/store';
import { ref, watch } from 'vue';

const store = useStore();
const data = store.state.data

var search = ref<string>("")
var length = ref<number>()
var useWords = ref<boolean>(true)

var rows = ref<Array<any>>([])

watch([search, length, useWords],() => {
  fetchData()
})


const fetchData = async () => {
  // Build the query so empty/undefined params are omitted. Previously `length`
  // was always sent and, when unset, became the literal string "length=undefined"
  // which the backend rejects -> the table loaded empty. Omitting it makes the
  // page run the default DB search (top name patterns) on load.
  const params = new URLSearchParams()
  if (search.value) params.set('search', search.value)
  if (length.value != null && !Number.isNaN(length.value)) params.set('length', String(length.value))
  params.set('useWords', String(useWords.value))
  axios.get(`${data.apiUrl}/Player/names?${params.toString()}`).then((response) => {
    rows.value = response.data
  }).catch((e) => console.log(e));
}
fetchData()
</script>

<style scoped>

</style>