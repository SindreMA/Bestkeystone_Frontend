<template>
    <div>
        <CloudinaryFormat :url="DungeonDetails(dungeon.id).imageurl" v-slot="{ link }">
            <div v-for="(run, index) in runs" class="newRun shadow-15 "
                :style="`background-image: ${  `url(  ${link}) `} `">
                :key="index">
                <div class=" flex justify-around">
                    <div>{{run.zone.name}}</div>
                    <div>{{run.level}}</div>

                </div>
                <div class="flex justify-around">
                    <div v-for="(player, index) in run.players" :key="index">
                        {{player.name}}
                    </div>
                </div>

                <br>
            </div>
        </CloudinaryFormat>
    </div>
</template>


<script>
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'
export default {
    components: {
        CloudinaryFormat
    },
    props: ['runs'],
    methods: {
        getValidLink(url1, url2) {
            if (url1) {
                return url1
            }
            return url2
        },
    },

}
</script>

<style scoped>
.newRun {
    background-position: center;
    /* Center the image */
    background-size: cover;
    /* Resize the background image to cover the entire container */
    height: 100px;
    background-color: rgb(44, 44, 44);
    border-radius: 25px;
    padding: 10px;
    text-shadow: 1px 1px 1px #000;
    margin: 15px 0;

}
</style>