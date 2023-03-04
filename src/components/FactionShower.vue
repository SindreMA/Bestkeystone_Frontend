<template>
  <div>
    <div ref="resizediv" style="width: 100%">
      <q-resize-observable @resize="SetSize()" />
    </div>

    <div v-if="Dungeon == null">
      <div v-if="Selected && Selected.factions && Selected.factions[0] && Selected.factions[1]" id="FactionShower">
        <br>
        <br>
        <br>
        <div class="Centertext HeaderSize HeaderFont">What's the "best" faction this week?</div>

        <br>
        <br>
        <div class="flex justify-around">
          <div :style="'width: ' + FactionImageSize + 'px; height: ' + FactionImageSize + 'px;'">
            <CloudinaryFormat :url="`factions/${Selected.factions[0].faction}.png`" v-slot="{ link }">
              <div class="FactionImage" :style="{'background-image': `url(${link})` }">
                <q-tooltip>
                  Runs: {{Selected.factions[0].runs}} Score: {{GetPoints(Selected.factions[0].score)}}
                </q-tooltip>
              </div>
            </CloudinaryFormat>
          </div>
          <i :style="'font-size: '+FactionPointerSize+'em;'"
            v-if="Selected.factions[0].score > Selected.factions[1].score"
            class="material-icons  arrow_back icon-grey">arrow_back</i>
          <i :style="'font-size: '+FactionPointerSize+'em;'" v-else
            class="material-icons  arrow_forward icon-grey ">arrow_forward</i>
          <div :style="'width: ' + FactionImageSize + 'px; height: ' + FactionImageSize + 'px;'">
            <CloudinaryFormat :url="`factions/${Selected.factions[1].faction}.png`" v-slot="{ link }">
              <div class="FactionImage"
                :style="{ 'background-image': `url(${link})`}">
                <q-tooltip>
                  Runs: {{Selected.factions[1].runs}} Score: {{GetPoints(Selected.factions[1].score)}}
                </q-tooltip>
              </div>
            </CloudinaryFormat>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="Dungeon && Dungeon.factions && Dungeon.factions[0] && Dungeon.factions[1]" id="FactionShower">

        <div class="flex justify-around">
          <div :style="'width: ' + FactionImageSize + 'px; height: ' + FactionImageSize + 'px;'">
            <CloudinaryFormat :url="`factions/${Selected.factions[0].faction}.png`" v-slot="{ link }">
              <div class="FactionImage" :style="{ 'background-image': `url(${link})` }">
                <q-tooltip>
                  Runs: {{Dungeon.factions[0].runs}} Score: {{GetPoints(Dungeon.factions[0].score)}}
                </q-tooltip>
              </div>
            </CloudinaryFormat>
          </div>
          <i :style="'font-size: '+FactionPointerSize+'em;'"
            v-if="Dungeon.factions[0].score > Dungeon.factions[1].score"
            class="material-icons  arrow_back icon-grey">arrow_back</i>
          <i :style="'font-size: '+FactionPointerSize+'em;'" v-else
            class="material-icons  arrow_forward icon-grey ">arrow_forward</i>
          <div :style="'width: ' + FactionImageSize + 'px; height: ' + FactionImageSize + 'px;'">
            <CloudinaryFormat :url="`factions/${Selected.factions[1].faction}.png`" v-slot="{ link }">
              <div class="FactionImage" :style="{ 'background-image': `url(${link})`}">
                <q-tooltip>
                  Runs: {{Dungeon.factions[1].runs}} Score: {{GetPoints(Dungeon.factions[1].score)}}
                </q-tooltip>
              </div>
            </CloudinaryFormat>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CloudinaryFormat from './data_formatters/CloudinaryFormat.vue'
export default {
  props: ['Dungeon', 'Selected'],
  components: {
    CloudinaryFormat
  },
  data() {
    return {
      FactionPointerSize: 8,
      FactionImageSize: 300,
    }
  },
  methods: {

    SetSize() {
      if (this.$refs.resizediv !== undefined) {
        if (this.$refs.resizediv.clientWidth) {
          var width = this.$refs.resizediv.clientWidth
          this.FactionPointerSize = width / 130
          this.FactionImageSize = width / 2.8
        }
      }

    },
    GetPoints(points) {
      var strFirstThree = String(points / 1000).substring(0, 4);
      if (strFirstThree.includes('.')) {
        strFirstThree = String(points / 1000).substring(0, 5);
      }
      return strFirstThree
    },
  },
}

</script>
