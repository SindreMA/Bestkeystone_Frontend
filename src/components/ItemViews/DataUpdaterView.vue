<template>
  <div id="UpdateTimer" class="HeaderFont  absolute-center">
    <q-tooltip v-if="countdown && !countup">
      If this number is counting upwards your browser is probably using a cached version.
      Try again in 15 min, or just click Shift-F5 to refresh without cache.
    </q-tooltip>
    <div>
      <div class="flex justify-around HeaderSize4">
        <div class="nummberBox flex flex-center">
          {{Hours}}
        </div>
        <div class="nummberBox flex flex-center">
          {{Mins}}
        </div>
        <div class="nummberBox flex flex-center">
          {{Secs}}
        </div>
        <!--<div class="nummberBox flex flex-center">
          {{MSecs}}
        </div>-->
      </div>
      <div class="HeaderSize2 flex justify-around">
          <div class=" flex flex-center">
              Hour
        </div>
        <div class=" flex flex-center">
          Min
        </div>
        <div class=" flex flex-center">
          Sec
        </div>
        <!--<div class=" flex flex-center">
          MSec
        </div>-->
      </div>
    </div>
  </div>
</template>
<script>
  import SF, {moment} from '../../SharedFunctions'

  export default {
      data() {
          return {
              Hours: "00",
              Mins: "00",
              Secs: "00",
              MSecs: "00",

          }
      },
      methods: {
          UpdateTimer() {
            var vm = this
            if (this.countdown) {
              var from = moment(new Date()); //todays date
              var to = moment(SF.TimeToRefresh(this.date).date); // another date
              var duration = moment.duration(from.diff(to)).add(-1, 's');


            vm.Hours = String(duration.hours()).replace('-','')
            vm.Mins = String(duration.minutes()).replace('-','')
            vm.Secs = String(duration.seconds()).replace('-','')
            vm.MSecs = String(duration.milliseconds()).replace('-','')
            } else if(vm.countup) {
              var to = moment(new Date()); //todays date
              var from = moment(this.date); // another date
              var duration = moment.duration(from.diff(to));


            vm.Hours = String(duration.hours()).replace('-','')
            vm.Mins = String(duration.minutes()).replace('-','')
            vm.Secs = String(duration.seconds()).replace('-','')
            vm.MSecs = String(duration.milliseconds()).replace('-','')
            }else {
            vm.Hours = new moment(this.date).hour()
            vm.Mins = new moment(this.date).minute()
            vm.Secs = new moment(this.date).second()
            vm.MSecs = new moment(this.date).millisecond()
            }

            if (vm.Hours.length <= 1) vm.Hours = "0" + vm.Hours
            if (vm.Mins.length <= 1) vm.Mins = "0" + vm.Mins
            if (vm.Secs.length <= 1) vm.Secs = "0" + vm.Secs

            setTimeout(function () {
             vm.UpdateTimer();
                     }, 1000)
          }
      },
    props: ['date', 'countdown', 'countup'],
    created() {
             this.UpdateTimer();

    },
  }


</script>
<style>
  .no-margin {
    margin: 0;
  }

  #UpdateTimer {
    position: relative;
    width: 150px;

    margin-bottom: 20px;
    margin-top: -6px;
  }

  .nummberBox {
    border-radius: 5px;
    background: #333333;
    width: 35px;
    height: 35px;
  }

</style>
