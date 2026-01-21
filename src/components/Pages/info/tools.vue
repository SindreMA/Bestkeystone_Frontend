<template>
    <div  >
        <div class="HeaderSize3">Tools</div>
        <q-tabs v-model="tab" animated swipeable color="3a3a3a" align="justify">
            <q-tab default  label="Score checker" name="tab-1" />
        </q-tabs>
        
        <div id="ToolsTabs">
            <q-tab-panels v-model="tab" class="transperant" animated>
                <q-tab-panel  name="tab-1"><scoreChecker class="tab"></scoreChecker> </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</template>
<script>
import scoreChecker from '../info/tools/scoreChecker.vue'
export default {
    data() {
        return {
            tab: 'tab-1'
        }
    },
    components: {
        scoreChecker
    }
    
}
</script>
<style scoped>
#ToolsTabs {
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    border: 1px solid var(--border-default);
    border-top: 0px;
    padding: 1px;
    background: var(--bg-surface);
}
.tab {
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}
</style>
