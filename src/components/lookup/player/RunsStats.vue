<template>
    <div id="RunstatsWindow">
            <div class="flex">
                <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        Level
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        Runs
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        On <br> time
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        Avg clear time
                    </div>
                </div>
            </div>

            <div class="SpacerLine"></div>

        <div v-for="(run, index) in sortDungeons()" :key="index">

            <div class="flex">
                <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        +{{run[0].keystone_level}}
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        {{run.length}}
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        {{getOnTimeProcent(run)}}%
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        {{epochToMin(getAvgClearTime(run))}}
                    </div>
                </div>
            </div>
        </div>
                    <div class="SpacerLine"></div>

          <div class="flex">
                <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        All
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        {{runs.length}}
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        {{getOnTimeProcent(runs)}}%
                    </div>
                </div>
                 <div class="LevelInfoBox flex flex-center">
                    <div class="flex flex-center">
                        {{epochToMin(getAvgClearTime(runs))}}
                    </div>
                </div>
            </div>
    </div>
</template>
<script>
import underscore from 'underscore'
export default {
    props: ['runs'],
    methods: {
         sortDungeons() {
            var sorted =  underscore.groupBy(this.runs,'keystone_level');
            return sorted
        },
        epochToMin(input) {
            var date = new Date(input);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();

            var formattedTime = minutes+ ':' + seconds;
            return formattedTime
        },
        getAvgClearTime (_runs) {
            var i = 0
            var sum = 0
            _runs.forEach(run => {
                i++;
                sum += run.clear_time
            });
            return sum / i
        },
        getOnTimeProcent(_runs) {
            var ls = _runs.filter(function(element){ return element.ontime; })
            return Math.floor(( ls.length / _runs.length) * 100);

        }
    },

}
</script>
<style>
.SpacerLine {
    border: grey solid 1px;
    width: 100%;
    height: 1px;
}
#RunstatsWindow {
    background-color: #292929;
    border: #323232 solid 1px;
    padding: 5px;
    width: 235px;
}
.InfoCardField{
    font-size: 13px;
    width: 100px;
}

.LevelInfoBox_Stats {
    background-color: #292929;
}
.LevelInfoBox{
    font-size: 12px;
    text-align: center;
    background-color: #323232;
    width: 45px;
    height: 45px;
    border-radius: 50px;
    margin: 5px;
}
</style>
