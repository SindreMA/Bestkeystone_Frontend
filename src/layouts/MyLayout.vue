<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="GreyBackground">
      <div class="MiddleAndSize">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
.gap-5 {
  gap: 5px;
}

@media screen and (min-width:  400px) {
.MiddleAndSize {
  max-width: 1100px;
  margin: auto;
  padding: 25px 25px 25px 25px;
  background-color: #252525;
}
}
.GreyBackground {
  background-color: #252525;
  min-height: 100vh;

}

</style>
