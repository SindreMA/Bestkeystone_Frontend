<template>
    <div>
        <h2>Items usage</h2>
    <div>(Data is not limited to keystone runs)</div>
    <div>(We also just fetch details on lookup, so data is a bit outdated )</div>
    <div>(This will be changed later to fetch on keystone done)</div>
    <br>
    <ItemsTable :items="items" />
    </div>
</template>

<script lang='ts' setup>
import ItemsTable from 'components/ListViews/Tables/Items/ItemsTable.vue';
const items = []

</script>

<style scoped>

</style>
