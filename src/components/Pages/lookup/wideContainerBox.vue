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
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
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
  padding: 16px;
}

.TakeAll {
  width: 100%;
  height: auto;
}
</style>
