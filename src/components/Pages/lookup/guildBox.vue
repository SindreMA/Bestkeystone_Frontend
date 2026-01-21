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
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  width: 662px;
  height: 488px;
  position: relative;
  overflow: hidden;
  background: var(--bg-surface);
}

#Header {
  background: var(--bg-elevated);
  padding: 12px 16px;
  color: var(--text-primary);
  font-weight: 600;
  border-bottom: 1px solid var(--border-default);
}
#Container {
  transform: scale(1.28);
  position: absolute;
  top: 95px;
  right: 72px;
}
</style>
