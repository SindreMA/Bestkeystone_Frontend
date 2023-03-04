<template>
    <router-link :to="`/lookup/run/${run.id}`">
    <CloudinaryFormat :url="Zone?.imageurl" v-slot="{link}">
        <div class="HeaderFont MainContainer ContainerSize text-center"
            :style="'background-image: url('+link+');' ">
            <div class="GreyTransOverlay ContainerSize">
                <strong style="font-size: 14px;">{{run.keystoneLevel}}</strong>
            </div>
            <q-tooltip>
                <div>{{Zone.name}} +{{run.keystoneLevel}}</div>
                <div>{{`Cleared in ${FormatTimeUsed(run.duration)} out of ${FormatTimeUsed(Zone.time)}
                for score ${Math.round(run.score * 100) / 100}`}}</div>
            </q-tooltip>
        </div>
    </CloudinaryFormat>
    </router-link>
</template>

<script lang="ts" setup>
import CloudinaryFormat from 'src/components/data_formatters/CloudinaryFormat.vue';
import SF, {moment} from 'src/SharedFunctions'
import { useStore } from 'src/store';
import { SeasonBestRun } from 'src/types/guild';
import { computed, PropType, toRefs } from 'vue';

const props = defineProps({
    run: {
        type: Object as PropType<SeasonBestRun>,
        required: true
    }
})
const { run } = toRefs(props)
const FormatTimeUsed = (time) => moment.duration(time).format("hh:mm:ss");

const store = useStore()
const data = store.state.data

const Zones = computed(() => data.Dungeons)

const Zone = computed(() => Zones.value.find((zone) => zone.keystone_id == run.value.zone))


</script>

<style scoped>
.ContainerSize {
    width: 35px;
    height: 35px;
    border-radius: 15px;

}

.GreyTransOverlay {
    background-color: rgba(0, 0, 0, 0.349);

    padding: 7px;
}

.MainContainer {
    width: 35px;
    height: 35px;
    border: grey 1px solid;
    background-position: center;
    /* Center the image */
    background-size: cover;
    /* Resize the background image to cover the entire container */
}

.MainContainer:hover {
    cursor: pointer;
}
</style>
