<template>
    <div v-if="Selected && Selected.dungeons[0].runs < 50" class="WarningWindow Centertext HeaderFont">
        <h3>Data is currently collected from only {{Selected.dungeons[0].runs}} runs per dungeon!</h3>
        <h5>Data might not be accurate</h5>
        <h5>This will be updated when more +7 or higher runs have been done on time on the lowest dungeon</h5>
    </div>
</template>
<script>
export default {
    props: ['Selected']
    
}
</script>


<style scoped>
* {
    margin: 0;
}
.WarningWindow {
    border: red 8px solid;
    padding: 10px;
}
</style>
