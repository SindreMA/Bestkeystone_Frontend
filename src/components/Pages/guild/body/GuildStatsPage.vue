<template>
<div>
    <div class="flex justify-around weekly-runs-row">
            <WeeklyRuns :guildMembers="guildMembers" :region="region" />
            <WeeklyRuns :guildMembers="guildMembers" :region="region" />
    </div>
    
            <div>
              Success
            </div>
</div>
</template>
<script>
 import WeeklyRuns from './WeeklyRuns.vue'

export default {
    props: ['guildMembers','region'],
    components: {
        WeeklyRuns
    }

}
</script>

<style scoped>
.weekly-runs-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>