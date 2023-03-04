<template>
    <div class="HeaderFont">
        <div class="flex justify-around text-center">
            <div class="tableAutoSizing">
                <div>Most played dungeons</div>
                <br>
                <dungeonCountFetcher :week="newestWeekid" v-slot="{data}">
                    <CleanDungeonStatShower :cols="['name','count']" :background="true" :data="data" count="5" />
                </dungeonCountFetcher>
                <router-link to="/statistics/dungeons">See more...</router-link>
            </div>
            <div class="tableAutoSizing">
                <div>Highest success rate dungeons</div>
                <br>
                <dungeonSuccessRateFetcher :week="newestWeekid" v-slot="{data}">
                    <CleanDungeonStatShower :cols="['name','ontime_percent']" :background="true" :data="data" count="5" />
                </dungeonSuccessRateFetcher>
                <router-link to="/statistics/dungeons">See more...</router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import CleanDungeonStatShower from './CleanDungeonStatShower.vue'
import dungeonCountFetcher from '../fetchers/dungeonCountFetcher.vue'
import dungeonSuccessRateFetcher from '../fetchers/dungeonSuccessRateFetcher.vue'
import { computed, ref } from 'vue'
import { useStore } from '../../store'
const store = useStore();
const data = store.state.data

let dungeonCount = ref(0)

const GetDungeonData = computed(x=> data.Dungeons_Data)
const GetDungeonCountData = computed(x=> data.Dungeon_Count_Data)
const GetPeriodes = computed(x=> data.Periodes)

const newestWeekid = computed(() => GetPeriodes?.value ?  GetPeriodes.value[0].id : null)


</script>