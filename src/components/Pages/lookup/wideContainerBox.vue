<template>
  <div id="Box">
    <div id="Header" class="HeaderSize4">
     {{title}}
    </div>
    <div id="Container">
      <slot class="TakeAll"/>
    </div>
  </div>
</template>

<script>


export default {
  props: ["title"],
  data() {
    return {
    };
  },
};
</script>

<style scoped>
#Box {
  border: 1px solid #696969;
  position: relative;
}

#Header {
  background-color: #414141;
  padding: 5px;
}

.TakeAll{
  width: 100%;
  height: auto;
}
</style>
