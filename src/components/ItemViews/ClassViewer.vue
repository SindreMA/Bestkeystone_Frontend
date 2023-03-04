<template>
    <div v-if="ClassItem.class" class="ClassViewWindowMAIN" @mouseover="ShowDetails = true"
        @mouseout="ShowDetails = false">
        <CloudinaryFormat :url="`classes/${ClassItem.class.name.replace(' ','-')}.jpg`" v-slot="{ link }">
            <div v-if="Hide" class="ClassViewWindow" :class="{TopBack: TopBack}" :style="{ 'background-image': `url(${link})` }">
                <div class="GreyOverlay">
                    <div class="flex flex-center">

                        <div class="TextCover">
                            {{ClassItem.class.name}}</div>
                    </div>
                    <div class="Score flex">
                        <div class="flex">
                            <div >{{ClassItem.display_score}}</div>
                            <div v-if="Settings.score_type== 'percent'">%</div>
                        </div>
                        <q-tooltip>
                            Runs: {{ClassItem.runs}}
                        </q-tooltip>
                    </div>
                    <div class=" Rank flex flex-center">
                        <div >{{ClassItem.rank}}</div>
                    </div>
                    <div class=" flex flex-center">
                        <div class="ShowMore">
                            <i v-if="true" class="material-icons  keyboard_arrow_down icon-grey">keyboard_arrow_down</i>
                            <i v-else class="material-icons  keyboard_arrow_up icon-grey">keyboard_arrow_up</i>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="ShowDetails" class="MoreDetails">
                <div v-for="(spec, index) in rankAdder(ClassItem.specs)" :key="spec.score"
                    :class="{Marked: !isEven(index)}">
                    <div class="flex justify-between">
                        <div>{{spec.rank}}</div>
                        <div>{{spec.details.name}}</div>
                        <div class="flex">
                            <div>{{spec.display_score}}</div>
                            <div v-if="Settings.score_type== 'percent'">%</div>
                        </div>

                        <q-tooltip>
                            Runs: {{spec.runs}}
                        </q-tooltip>
                    </div>

                </div>
            </div>
        </CloudinaryFormat>
    </div>
</template>

<script>
import sf from '../../SharedFunctions'
import underscore from 'underscore'
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'

export default {
    props: ['ClassItem', 'ShowAll'],
    components: {
        CloudinaryFormat
    },
    data() {
        return {
            ShowDetails: false
        }
    },
    methods: {
        rankAdder(ls) {
            ls.forEach(spec => {

                spec.display_score = sf.GetPoints(spec.score, this.Settings.score_type, this.ClassItem.score, spec.runs);
            });
            return underscore.toArray(sf.getListWithRank(ls))

        },
        isEven(n) {
            return n % 2 == 0;
        }

    },
    computed: {
        Settings() {
            return this.$store.state.data.settings;
        },
        Hide() {
            if (!this.ShowAll) {
                if (this.ClassItem.Rank > 5) {
                    return false
                }
            }
            return true
        },
        TopBack() {
            if (this.ClassItem.ClassSlug == 'rouge') {
                return true
            }
            else if (this.ClassItem.ClassSlug == 'priest') {
                return true
            }
            else if (this.ClassItem.ClassSlug == 'hunter') {
                return true
            }
            else if (this.ClassItem.ClassSlug == 'warrior') {
                return true
            }
            else if (this.ClassItem.ClassSlug == 'paladin') {
                return true
            }
            else if (this.ClassItem.ClassSlug == 'mage') {
                return true
            }
            return false

        }
    }
}
</script>


<style>
.TextCover {
    background-color: #252525;
    border-radius: 10px;
    font-size: 25px;
    padding: 2px 12px;
    margin-top: 10px;
    border: rgb(161, 161, 161) 0.5px solid;



}

.Score {
    position: absolute;
    right: 10px;
    top: 10px;

    background-color: #252525;
    border-radius: 10px;
    font-size: 20px;
    border: rgb(161, 161, 161) 0.5px solid;

    padding: 0 5px;
    margin-top: 10px;

}

.Rank {
    position: absolute;
    left: 10px;
    top: 10px;
    text-align: center;
    border: rgb(161, 161, 161) 0.5px solid;

    background-color: #252525;
    border-radius: 50px;
    font-size: 20px;

    width: 30px;
    height: 30px;
    margin-top: 10px;
}

.middle {

    position: absolute;
}

.ClassViewWindow {
    min-width: 330px;
    height: 70px;
    background-size: cover;
    /* <------ */
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
}

.TopBack {
    background-position: top;
}

.GreyOverlay {
    top: 0px;
    left: 0px;
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);

}

.ShowMore {
    background-color: #252525;
    border-radius: 55px;
    bottom: 1px;
    position: absolute;

}

.ShowMore:hover {
    cursor: pointer;
}

.MoreDetails {
    background-color: #313131;
    padding: 5px;
}

.Marked {
    background-color: #292929
}

.ClassViewWindowMAIN {
    margin: 10px 11px;
    border-radius: 10px;

}
</style>

