
<template>
    <div class="HeaderFont MainContainer shadow-24 flex justify-between" v-if="guild">
        <div>
           <h2 :class="`${guild.faction.toLowerCase()}`"><strong>{{guild.name}}</strong></h2>
            <div class="flex">
                <div>({{guild.region.toUpperCase()}}) </div>
                <div>{{capitalize(guild.realm)}}</div>
            </div>
        </div>
        <div class="DataTextField flex justify-around">
            <div> <h6>Members: {{guild.members.length}}</h6></div>
            <div>
                <q-btn :disable="!(timerText < 0)" @click="updateTrigger()" class="GreyBackground" :label="timerText < 0 ? 'Update Guild' :  `Can be updated in ${Math.round(timerText / 60)} min`" outline />
            </div>
            
        </div>
        
        
    </div>
    <q-skeleton class="MainContainer" v-else>

    </q-skeleton>
</template>

<script>
export default {
    props: ['guild'],
    data() {
        return {
            timer: null,
            timerText: null
        }
    },
    methods: {
         capitalize(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      },
      updateTrigger() {
          this.$emit('Update')
      },
      startTimer() {
            var vm = this
          if (this.guild) {
            var now = Math.round(new Date().getTime() / 1000)
            vm.timerText = vm.guild.created - (now - 3600)
          }
          
          var timer = setTimeout(() => {
              vm.startTimer()   
          }, 60000);
          this.timer = timer
      }
      
    },
    watch: {
        guild() {
            if (this.guild) {
                var now = Math.round(new Date().getTime() / 1000)
            this.timerText = this.guild.created - (now - 3600)
            }
        }
    },
   
      created() {
          this.startTimer()
      },
      destroyed() {
          if (this.timer) {
              clearTimeout(this.timer)
          }
      },
    
}
</script>


<style scoped>
h2{
    margin: 0px;
    padding: 0px;
}
.MainContainer {
    padding: 10px;
    height: 110px;
    border-radius: 15px;
    background-image: url('https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/backgrounds/grid_background_dark.webp');
}
.horde {
        color: rgb(150, 5, 155);
}
.alliance {
    color: rgb(25, 87, 231);
}
.DataTextField {
    margin-top: 30px;
}    
.DataTextField div{
    margin-right: 20px;
} 
.DataTextField h6{
    margin: 0px;

} 
.DataTextField q-btn{
    height: 30px;
} 
</style>
