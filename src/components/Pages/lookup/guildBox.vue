<template>
  <div v-if="details" id="Box">
    <div id="Header" class="HeaderSize4">
     
    </div>
    <div id="Container">
      
    </div>
  </div>
</template>

<script>


export default {
  props: ["details"],
  data() {
    return {
    };
  },
  methods: {
  
  },
  computed: {

  }
};
</script>

<style scoped>
#Box {
  border: 1px solid #696969;
  width: 662px;
  height: 488px;
  position: relative;
}

#Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
  transform: scale(1.28); /* Equal to scaleX(0.7) scaleY(0.7) */
  position: absolute;
  top: 95px;
  right: 72px;
}
</style>
