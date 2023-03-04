<template>
      <div>
        <q-resize-observer @resize="onResize" />
  <div ref="talentbox" v-if="details" id="Box" :style="`zoom: ${width * 0.0016}`" >
    <div id="Header" class="HeaderSize5 flex justify-between">
      <div>Talents</div>
      <div>
        <q-btn-toggle dark v-model="selectedSpec" :options="getSpecOptions"/>
      </div>
    </div>
    <div id="Container" >
      <div
        v-for="(tier, index) in selectedSpec"
        :key="index"
        class="flex"
      >
        <div class="tierItem box">{{tier[0].talent.level}}</div>
        <a v-for="(column, index2) in tier" :key="index2" :data-wowhead="`spell=${column.id}`">
          <div class="talentItem box" :class="{selected: column.selected}">
            <div class="Content">
              <img
                class="Image"
                :src="`${column.talent.spell.spell_icon_url}`"
              >
              <div class="Name absolute-center">{{column.talent.name}}</div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
      </div>
</template>

<script>
import { format } from "quasar";
import _ from "underscore";
const { capitalize } = format;
import {mapGetters} from 'vuex'

export default {
  props: ["details","compact"],
  data() {
    return {
      selectedSpec: null,
      width: this.$q.screen.width
     
    };
  },
  watch: {
    _size() {
      this.onResize(this._size)
    },
    getSpecOptions () {
      this.setSpec();
    },
    GetSpecs () {
      this.setSpec();
    },
    details () {
      this.setSpec();
    },
  },
  methods: {
      onResize(size) {
        this.width = size.width      
    },
    setSpec() {
      if (this.getSpecOptions && this.GetSpecs && this.details) {
        this.selectedSpec = this.getSpecOptions[0].value
      }
    },
    getSpec(id) {
      if (this.GetSpecs) {
        for (let i = 0; i < this.GetSpecs.length; i++) {
          const spec = this.GetSpecs[i];
          if (spec.id == id) {
            return spec;
          }
        }
      }
    },
    
  },
  computed: {
    ...mapGetters(['GetSpecs']),
        _size() {
      return { width: this.$q.screen.width, height: this.$q.screen.height}
    },
    getSpecOptions() {
      var ls = [];
      for (let i = 0; i < this.details.talents.length; i++) {
        const spec = this.details.talents[i];

        var specDetails =  {label: this.getSpec(spec[0][0].spec_id).name, value: spec};
        ls.push(specDetails)
      }
      return ls;
    },   
  },
  created() {
    this.setSpec();
  }
};
</script>

<style scoped>
#Box {
  border: 1px solid #696969;
  width: 518px;
  height: 380px;
  position: relative;

}

#Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
  position: absolute;
  width: 530px;
}
.tierItem.box {
  width: 50px;
  height: 49px;
  background: url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0 -50px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 50px -50px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0px 0px;
  color: goldenrod;
  text-align: center;
  padding-top: 15px;
}
.talentItem.box {
  height: 49px;
  overflow: hidden;
  padding: 0;
  width: 155px;
  background: url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0 -50px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 155px -50px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0px 0px;
}
.talentItem:hover {
  background: url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 155px -50px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0 -100px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0px 0px;
}
.talentItem.selected {
  background: url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0 -150px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 155px -200px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0px 0px;
}
.talentItem.selected:hover {
  background: url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0 -250px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 155px -200px,
    url(https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310108/talents/sprite.png) 0px 0px;
}
.talentItem .Content {
  position: relative;
}
.talentItem .Image {
  position: absolute;
  left: 25px;
  top: 12px;
  width: 260x;
  height: 26px;
  border: 1px grey solid;
  border-radius: 5px;
}
.talentItem .Name {
  font-size: 11px;
  width: 80px;
  position: absolute;
  top: 25px;
  left: 95px;
}
</style>
