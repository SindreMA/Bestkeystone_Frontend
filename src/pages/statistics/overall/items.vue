<template>
    <div class="textColor">
        <KcPageHeader eyebrow="Overall" title="Items" sub="Item usage across tracked players. Not limited to keystone runs; details are fetched on lookup, so data can lag." />
        <div v-if="loading" class="kc-overall__loading">Loading item usage…</div>
        <ItemsTable :items="items" />
    </div>
</template>

<script lang='ts' setup>
import ItemsTable from 'components/ListViews/Tables/Items/ItemsTable.vue';
import KcPageHeader from 'components/layout/KcPageHeader.vue';
import axios from 'axios';
import { useStore } from 'src/store';
import { ref, onMounted } from 'vue';

const store = useStore();
const data = store.state.data;

const items = ref<Array<any>>([]);
const loading = ref(false);

// GET /Item returns every tracked item with a precomputed usersCount
// (DynamicDatapoints "Items_<id>"). The cold-cache response is heavy (~6s);
// RedisCache(3600) keeps it warm thereafter, so use a generous timeout.
onMounted(() => {
  loading.value = true;
  axios.get(`${data.apiUrl}/Item`, { timeout: 30000 })
    .then((r) => { items.value = Array.isArray(r.data) ? r.data : []; })
    .catch((e) => console.log(e))
    .finally(() => { loading.value = false; });
});
</script>

<style scoped>
.kc-overall__loading { padding: 12px 0; color: var(--text-mid, #9AA7B8); font-size: 13px; }
</style>
