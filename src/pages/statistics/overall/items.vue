<template>
    <div>
        <KcPageHeader eyebrow="Overall" title="Items" sub="Item usage across tracked players. Not limited to keystone runs; details are fetched on lookup, so data can lag." />
    <ItemsTable :items="items" />
    </div>
</template>

<script lang='ts' setup>
// NOTE: the API has no working items-usage endpoint (/Item → 500, /items → 404),
// so this page is unlinked from the footer. Kept as a stub.
import ItemsTable from 'components/ListViews/Tables/Items/ItemsTable.vue';
import KcPageHeader from 'components/layout/KcPageHeader.vue';
import { ref } from 'vue';
const items = ref<Array<any>>([]);
</script>

<style scoped>

</style>
