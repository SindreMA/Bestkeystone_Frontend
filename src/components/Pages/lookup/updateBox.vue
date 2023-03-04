<template>
  <div v-if="details" id="Box">
    <div id="Header" class="HeaderSize4">Update</div>
    <br />
    <div id="Container" class="flex justify-around">
      <div class="boxRow1">Last logout: {{niceTimestamp(details?.last_login_timestamp)}}</div>

      <div class="boxRow1">Last update on site: {{niceTimestamp(normalizeTime(details?.created -5))}}</div>
      <q-btn
        :disable="disAllowUpdate"
        @click="fetchDetails()"
        class="boxRow1"
        :label="btnText"
        icon="update"
        outline
      />
    </div>
    <br />
  </div>
</template>

<script>
import SF, {moment} from '../../../SharedFunctions'
import axios from 'axios'

export default {
  props: ["details","character"],
  data() {
    return {
        btnText : "Update",
        interval: null
    };
  },
  methods: {
    normalizeTime(time) {
      return (time * 1000);
    },
      startTimer(callback) {
          var vm = this
          var i = 0;
          this.interval = setInterval(() => {
              i++;
              var timeLeft =  (vm.normalizeTime(vm.details?.created) + 3600000) - (new Date().getTime())
              callback(moment.duration(timeLeft).format("hh:mm:ss"))
              if (timeLeft <= 0) {
                  callback(null)
                  clearInterval(vm.interval)
              }
          }, 1000);
      },
      niceTimestamp (time) {
          if (!time) {
              return "Unknown"
          }
          return moment.utc(time).local().fromNow()
      },
fetchDetails() {
    this.btnText = `Updating`

    var character = this.character
      var vm = this;
      var apiUrl = this.$store.state.data.apiUrl;
      axios
        .get(
          `${apiUrl}/Player/new_details?character=${
            character.name
          }&realm=${character.realm}&region=${character.region}&checkblizzard=true`
        )
        .then(x => {
          if (x.data) {
            x.data.character = character;
            if (!x.data.fetchTimestamp) {
                var ts = (new Date().getTime())
                x.data.fetchTimestamp = ts
            }
            vm.startTimer(x=> {
                if (x) {
                    vm.btnText = `Can be updated in ${x}`
                } else {
                    vm.btnText = `Update`
                }
            })
            this.$emit('update', x.data)
          }
        })
        .catch(x => {
        });
    }
  },
  computed: {
      now () {
          return new Date().getTime();
      },

      disAllowUpdate() {
          if (this.btnText === `Update`) {
              return false
          } else {
              return  true
          }
      },
  },
  created () {
      var vm = this
        var timeLeft =  (this.normalizeTime(vm.details?.created) + 3600000) - (new Date().getTime())
        if (timeLeft > 0) {
           this.startTimer(x=> {
                if (x) {
                    vm.btnText = `Can be updated in ${x}`
                } else {
                    vm.btnText = `Update`
                }
            })
      }
  }
};
</script>

<style scoped>
#Box {
  border: 1px solid #696969;
  width: 100%;
  max-width: 1250px;
  min-height: 100px;
  position: relative;
}

#Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
}
.boxRow1 {
  min-width: 200px;
  min-height: 29px;
  margin: 0 5px;
}
</style>
