<template>
    <div>
        <LineProgress :max="12" :value="6" line-color="#FE745A" outline-color="#FFFFF" :show-numbers="true" :data="talents"> 

        </LineProgress>      
        <div class="flex">
            <div class="grey-bg padding  rounded minor-margin-right">
            <div class="whiteSheet">
                LFR
            </div>
        </div>
        <div class="green-bg padding  rounded minor-margin-right">
            <div class="whiteSheet">
                Normal
            </div>
        </div>
        <div class="blue-bg padding  rounded minor-margin-right">
            <div class="whiteSheet">
                Heroic
            </div>
        </div>
        <div class="purple-bg padding -bg rounded minor-margin-right">
            <div class="whiteSheet">
                Mythic
            </div>
        </div>    
        </div>  
        
    </div>
</template>

<script>
import LineProgress from '../../../LineProgress.vue'
export default {
    props: ['raids'],
    components: {
        LineProgress
    }
}
</script>

<style scoped>
.rounded {
    border-radius: 10px;
}
.minor-margin-right {
    margin-left: 10px;
}
.grey-bg  {
    background-color: rgb(54, 54, 54);
}

.blue-bg  {
    background-color: rgb(12, 65, 212);
}
.green-bg  {
    background-color: rgb(38, 110, 10);
}

.purple-bg  {
    background-color: rgb(125, 2, 156);
}
.padding {
    padding: 0 20px;
}

</style>