<template>
    <div class="DungeonsView">
        <p style="font-size 15px;">Best dungeon runs:</p>
        <div class="flex justify-between" style="font-size: 11px; ">
            <div class="dungeon_Name flex center justify-center">
                <div @click="sortClick('dungeon_name')" class="sortHead center">
                    Dungeon
                </div>
            </div>
            <div class="flex flex-nowrap">
                <div @click="sortClick('role')" class=" flex center justify-center sortHead">Role</div>
                <div @click="sortClick('keystone_level')" class=" flex center justify-center sortHead">Level</div>
                <div @click="sortClick('score')" class=" flex center justify-center sortHead">Score</div>
            </div>

        </div>
        <div v-for="dungeon in _sortBy(sortDungeons())" class="dungeonItem flex justify-between" :key="dungeon.keystonrun_id" :class="{inTimeColor: (dungeon).ontime, outTimeColor: !dungeon.ontime}">
            <CloudinaryFormat :url="`backgrounds/dungeons/${dungeon.dungeon_slug}.png`" v-slot="{ link }">
            <div class=" " :style="`background-size: 150% 150%; background-image: url('${`link`});`">
                <div class="dungeon_Name flex center justify-around " >
                    <div class="flex imageBackground ">
                        {{(dungeon).dungeon_name}}
                    </div>
                </div>
            </div>
        </CloudinaryFormat>
            <div class="dungeonInfoField row" >
                <div class=" dungeon_Role col-4 flex center justify-center">
                    <div class=" ">
                        <CloudinaryFormat :url="'roles/' + getRoleUrl(dungeon)+'.png'" v-slot="{ link }">
                            <img :src="link" style="width: 25px;">
                        </CloudinaryFormat>
                    </div>
                </div>
                <div class="dungeon_Level col-4 flex center justify-center">
                    <div>
                        {{dungeon.keystone_level}}
                    </div>
                </div>
                <div class="dungeon_score col-4 flex center justify-center">
                    <div>
                        {{getScore(dungeon.score)}}
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
<script>
import underscore from 'underscore'
import { mapGetters, mapActions, mapMutations } from 'vuex';
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'

export default {
    components: {
        CloudinaryFormat
    },
    data() {
        return {
            sortValue: 'score',
            reverse: true
        }
    },
    props: ['runs'],
    computed: {
            ...mapGetters(["GetSpecs"]),
    },
    methods: {
        sortClick(input) {
            if (input == this.sortValue) this.reverse = !this.reverse
            else this.sortValue = input
        },
        _sortBy(ls){
            var result = underscore.sortBy(ls,this.sortValue)
            if (this.reverse) return result.reverse()
            else return result
        },
        getBestRun(runs) {
            var orderRuns =  underscore.sortBy(runs,'score');
            return orderRuns[orderRuns.length -1]
        },
        sortDungeons() {
            var ls = []
            var sorted =  underscore.groupBy(underscore.sortBy(this.runs,'score'),'dungeon_slug');
            for(var propertyName in sorted) {
               ls.push(this.getBestRun(sorted[propertyName]))
            }

            return ls
        },
        getScore(score) {
            return Math.floor(score)
        },
        getRoleUrl(run) {
            var specID = this.getCurrentPlayerSpec(run)
            var spec = this.getSpec(specID)
            if(spec.role == "TANK"){
                run.role = "tank"
                return "tank"
            } else if(spec.role == "HEALER"){
                run.role = "healer"
                return "healer"
            } else if(spec.role == "DAMAGE"){
                run.role = "dps"
                return "dps"
            }
        },
        getCurrentPlayerSpec(run) {
            var player = run.player_id
            var spec = 0;
            if (run.player1_id == player) {
                spec =  run.player1_spec
            } else if (run.player2_id == player) {
                spec = run.player2_spec
            } else if (run.player3_id == player) {
                spec = run.player3_spec
            } else if (run.player4_id == player) {
                spec = run.player4_spec
            } else if (run.player5_id == player) {
                spec = run.player5_spec
            }
            return spec
        },
        getSpec (spec) {
            var _spec = null
            this.GetSpecs.forEach(element => {
                if (spec == element.id) {
                    _spec = element
                }
            });
            return _spec;
        }
    },
}
</script>
<style>
.DungeonsView {
width: 310px;
}
.dungeonItem {
    overflow: hidden;
    border: #424242 solid 1px;
        width: 500;
    min-width: 200px;
    max-width: 800px;
    z-index: 3;
    position: relative;
    border-radius: 25px;
    margin: 5px 2px;

}
.dungeon_Name {
    background-position: center;
    padding: 0 10px;
    width: 180px;

}

.imageBackground {
    background-color: #292929;
    border: 1px grey solid;
    border-radius: 15px;
    padding-left:  5px;
    padding-right: 5px;
}
.dungeonInfoField {
    width: 120px;
}
.inTimeColor {
    background-color: rgba(5, 41, 5, 0.514);
}
.outTimeColor {
    background-color: rgba(73, 12, 12, 0.514);
}
.sortHead {
    min-width: 20px;
    height: 20px;
    border-radius: 8px 8px 0 0;
    background-color: #424242;
    margin: 0 6px;
    padding: 0 2px;
}
.sortHead:hover {
    cursor: pointer;
}
</style>

