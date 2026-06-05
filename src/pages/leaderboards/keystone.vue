<template>
    <div>
        <KcPageHeader eyebrow="Leaderboard" title="Keystone Runs" sub="The week's top-scoring Mythic+ runs across the tracked region." />
        <KeystoneLeaderboard />
    </div>
</template>

<script lang="ts" setup>
import KeystoneLeaderboard from 'components/Pages/leaderboard/keystoneLeaderboard.vue'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
</script>