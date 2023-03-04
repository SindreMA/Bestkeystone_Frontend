<template>
  <div class="playerBoxContainer">
    <div class="flex justify-center">
      <div class="text-center"  v-for="(player, index) in GetPlayers" :key="player.id" @click="playerSelected(player)">
      <div class="playerBox HeaderFont" v-if="index < 4">
        ({{player.region.toUpperCase()}}){{ player.name }}-{{player.realm}}          
      </div>
      </div>
    </div>
  </div>
</template>
<script>
import SF from '../../../SharedFunctions'
export default {
  computed: {
    GetPlayers() {
      var PlayerSearch = JSON.parse(localStorage.getItem("PlayerSearch"));
      if (!PlayerSearch) {
        PlayerSearch = []
      }
      var orderLS = SF._sortBy(PlayerSearch,'lastSeen').reverse()
      return orderLS
    }
  },
  methods: {
    playerSelected(player) {
      this.$emit('selected', player)
    },    
  }
};
</script>

<style scoped>
.playerBox {
  min-width: 100px;
  max-width: 250px;
  text-align: bottom;
  color: rgb(51, 51, 51);
  margin: 5px 2px;
  padding: 4px 5px;
  height: 30px;
  background-color: rgb(85, 85, 85);
  border-radius: 10px;
}
.playerBox:hover {
  background-color: rgb(66, 66, 66);
  zoom: 1.1;
  cursor: pointer;
}
.playerBoxContainer {
  min-height: 45px;
}
</style>
