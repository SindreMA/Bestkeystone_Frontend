<template>
  <div class="guild-nav">
    <q-tabs
      v-model="_tab"
      narrow-indicator
      swipeable
      align="left"
      active-color="primary"
      indicator-color="primary"
      class="nav-tabs"
    >
      <q-tab name="overview" label="Overview" />
      <q-tab name="members" label="Members" />
    </q-tabs>
  </div>
</template>

<script>
export default {
  props: ['tab'],
  data() {
    return {
      _tab: 'overview'
    }
  },
  watch: {
    _tab() {
      this.$emit('changedTab', this._tab)
    },
    tab(newVal) {
      if (newVal && newVal !== this._tab) {
        this._tab = newVal
      }
    }
  },
  created() {
    if (this.tab) {
      this._tab = this.tab
    }
  }
}
</script>

<style scoped>
.guild-nav {
  margin-bottom: 16px;
}

.nav-tabs {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  padding: 4px;
}

.nav-tabs :deep(.q-tab) {
  border-radius: var(--radius-md);
  min-height: 40px;
}

.nav-tabs :deep(.q-tab--active) {
  background: var(--bg-raised);
}
</style>