<template>
    <div>    
        <QuickRunsView >
            <!--<CurrentAffixes :nextWeek="true"/>
            <br>-->
            <TopSpecsView/>
        </QuickRunsView>        
        <br>
        <QuickDungeonView/>
        <br>
        <br>
    </div>
</template>

<script lang="ts" setup >
import  CurrentAffixes from 'components/ItemViews/CurrentAffixes.vue'
import  QuickRunsView from 'components/ItemViews/QuickRunsView.vue'
import  QuickDungeonView from 'components/ItemViews/QuickDungeonView.vue'
import  TopSpecsView from 'components/ItemViews/TopSpecsView.vue'

</script>

<style>

a {
  color: grey;
}
.tableAutoSizing {
    margin-bottom: 15px;
}
@media screen and (max-width: 1270px) {
  .tableAutoSizing {
    width: 100%;
    max-width: auto;
    }
}
@media screen and (min-width: 1270px) {
  .tableAutoSizing {
    width: 100%;
    max-width: 600px;
    }
}
.warning_box {
    text-align: center;
    color: white;
    max-width:  600px;
    padding: 20px;
}
p {
    margin: 0;
}
</style>