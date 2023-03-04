<template>
    <div>
        <div class="redText text-center">
            <div class="HeaderSize3">This page is a work in progress</div>
            <p>The leaderboard might not be 100% correct</p>
        </div>
        <KeystoneLeaderboard />
    </div>
</template>

<script lang="ts" setup>
import KeystoneLeaderboard from 'components/Pages/leaderboard/keystoneLeaderboard.vue'
</script>

<style scoped>
.redText {
    color: red;
    margin: 0px;
    padding: 0px;
}

</style>