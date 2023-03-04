<template>
  <container title="Player Renames">
    <div v-for="(rename, index) in renamesLimited" :key="index">
      <div class="container">
        <div class="flex justify-around">
          <div class="marginTop">
            {{timeFormatAgo(rename.changed)}}
            <q-tooltip>{{timeFormatDate(rename.changed)}}</q-tooltip>
          </div>
          <div class="marginTop">{{rename.old_name}}</div>
          <i class="fs25 material-icons">arrow_right_alt</i>
          <div class="marginTop">{{rename.new_name}}</div>
        </div>
      </div>
    </div>
  </container>
</template>

<script>
import container from "./wideContainerBox.vue";
import sf from "../../../SharedFunctions";
export default {
  props: ["renames"],
  components: {
    container
  },
  methods: {
    moment(time) {
      return sf.GetMoment(time);
    },
    timeFormatAgo(time) {
      return this.moment(time).fromNow();
    },
    timeFormatDate(time) {
      return this.moment(time);
    }
  },
  computed: {
    renamesLimited() {
        var ls = sf.take(this.renames, 4);
      return ls
    }
  }
};
</script>
<style scouped>
.container {
  width: 100%;
  height: auto;
  font-size: 16px;
  background: rgb(26, 26, 26);
  text-align: center;
  padding: 3px;
}
.fs25 {
  font-size: 35px;
}
.marginTop {
  margin-top: 5px;
}
</style>