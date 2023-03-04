<template>
<div>
    <div class="flex justify-around">
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