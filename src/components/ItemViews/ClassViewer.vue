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
.ClassViewWindowMAIN {
    margin: 12px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    transition: border-color var(--transition-fast);
}

.ClassViewWindowMAIN:hover {
    border-color: var(--border-accent);
}

.ClassViewWindow {
    min-width: 330px;
    height: 80px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
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
    background: linear-gradient(180deg, rgba(13, 17, 23, 0.3) 0%, rgba(13, 17, 23, 0.7) 100%);
    backdrop-filter: blur(1px);
}

.TextCover {
    background: var(--bg-surface);
    border-radius: var(--radius-full);
    font-size: 1.1rem;
    font-weight: 600;
    padding: 6px 16px;
    margin-top: 14px;
    border: 1px solid var(--border-default);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
}

.Score {
    position: absolute;
    right: 12px;
    top: 12px;
    background: var(--gradient-primary);
    border-radius: var(--radius-full);
    font-size: 0.9rem;
    font-weight: 700;
    padding: 4px 12px;
    color: white;
    box-shadow: var(--shadow-md);
}

.Rank {
    position: absolute;
    left: 12px;
    top: 12px;
    text-align: center;
    background: var(--bg-surface);
    border: 2px solid var(--border-accent);
    border-radius: var(--radius-full);
    font-size: 1rem;
    font-weight: 700;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-accent);
    box-shadow: var(--shadow-glow);
}

.ShowMore {
    background: var(--bg-elevated);
    border-radius: var(--radius-full);
    bottom: -12px;
    position: absolute;
    padding: 2px;
    border: 1px solid var(--border-default);
    transition: all var(--transition-fast);
}

.ShowMore:hover {
    cursor: pointer;
    background: var(--bg-hover);
    border-color: var(--border-accent);
}

.ShowMore .material-icons {
    color: var(--text-secondary);
    font-size: 20px;
}

.MoreDetails {
    background: var(--bg-elevated);
    padding: 12px;
    border-top: 1px solid var(--border-default);
}

.MoreDetails > div {
    padding: 8px 12px;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 0.9rem;
    transition: all var(--transition-fast);
}

.MoreDetails > div:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.Marked {
    background: var(--bg-surface);
}

.middle {
    position: absolute;
}
</style>

