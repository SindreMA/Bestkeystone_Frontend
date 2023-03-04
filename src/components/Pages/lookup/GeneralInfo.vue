<template>
  <div v-if="details">
    <div
      id="GeneralInfoFader"
      :style="'background-image: linear-gradient(#252525,'+ColorLuminance(GetClass(details.character_class).color,-0.7)+');'"
    ></div>
    <div
      id="GeneralInfo"
      :style="
    'background-image: linear-gradient('+ColorLuminance(GetClass(details.character_class).color,-0.7)+','+ColorLuminance(GetClass(details.character_class).color,-0.2)+');'"
    >
      <div>        
        <div class="flex justify-center">
          <div id="playerLinksParent">
            
            <CloudinaryFormat :url="`factions/${details.faction.toLowerCase()}.png`">
              <img id="factionImage" :src="link">
            </CloudinaryFormat>
            <CloudinaryFormat :url="`roles/${getRole.toLowerCase()}.png`">
              <img id="roleImage" :src="link">
            </CloudinaryFormat>
            
            <div id="playerLinks">
              <div v-for="(item, index) in playerLinks" :key="index">
                <a :href="item.link">
                  <img class="iconLink" :src="item.image">
                  <q-tooltip>{{item.description}}</q-tooltip>
                </a>
              </div>
            </div>
          </div>
          <div id="PicturePlate" class="shadow-5">
            <img
              v-if="details"
              :src="`${details.avatar_url}`"
              style="width: 100%; height: 100%;"
            >
          </div>
        </div>
        <br>
        <div class="flex justify-center">
          <div id="NameLocationPlate" class="text-center relative">
            <i v-if="character.old_names" class="material-icons knownAs">info <q-tooltip><p>Old names</p>{{character.old_names}}</q-tooltip></i>
            <div class="HeaderSize4">{{character.name}}</div>
            <div
              class="HeaderSize2"
            >({{character.region.toUpperCase()}}) {{makeFirstBig(character.realm)}}</div>
          </div>
        </div>
        <div v-if="size && size.width < 1100">
          <br>
          <br>
          <br>
        </div>
        <div class="row DetailsPos" v-if="details">
          <div class="col-6 flex justify-center">
            <div class="InfoField text-center">
              <div>Score</div>
              <div>{{Math.floor(score *10) /10}}</div>
              <q-tooltip>The amount score in the selected periode</q-tooltip>
            </div>
            <div class="InfoField text-center">
              <div>Runs</div>
              <div>{{runs.length}}</div>
              <q-tooltip>The amount of keystone runs done in the selected periode</q-tooltip>
            </div>
          </div>
          <div class="col-6 flex justify-center">
            <div class="InfoField text-center">
              <div>Item level</div>
              <div>{{details.equipped_item_level}}</div>
              <q-tooltip>Inbag: {{details.average_item_level}}</q-tooltip>
            </div>
            <div class="InfoField text-center">
              <div>{{raidProgress.name}}</div>
              <div>{{raidProgress.value}}</div>
              <q-tooltip>The players progress in the current raid</q-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="GeneralInfoFader"
      :style="'background-image: linear-gradient('+ColorLuminance(GetClass(details.character_class).color,-0.2)+',#252525);'"
    ></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
import SF from '../../../SharedFunctions'
import CloudinaryFormat from "../../data_formatters/CloudinaryFormat.vue";

export default {
  components: {
    CloudinaryFormat
  },
  props: ["runs", "details", "score", "character"],
  methods: {
    ColorLuminance(hex, lum) {
      // validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, "");
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      lum = lum || 0;

      // convert to decimal and change luminosity
      var rgb = "#",
        c,
        i;
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
      }

      return rgb;
    },
    makeFirstBig(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    GetSpec(spec_id) {
      if (!this.GetSpecs) return null;
      for (let i = 0; i < this.GetSpecs.length; i++) {
        const spec = this.GetSpecs[i];
        if (spec_id == spec.id) {
          return spec;
        }
      }
    },
    GetClass(class_id) {
      if (!this.GetClasses) return null;
      for (let i = 0; i < this.GetClasses.length; i++) {
        const _class = this.GetClasses[i];
        if (class_id == _class.id) {
          return _class;
        }
      }
    }
  },
  computed: {
    ...mapGetters(["GetClasses", "GetSpecs"]),
    size() {
      return { width: this.$q.screen.width, height: this.$q.screen.height}
    },
    getRole(){
      return this.GetSpec(this.character.spec).role
    },
    playerLinks() {
      var sites = [
        {
          image: SF.FormatToCloudinary(`external/wow.png`),
          description: "View on armory",
          link: `https://www.worldofwarcraft.com/en-${this.character.region.replace(
            "eu",
            "gb"
          )}/character/${this.character.realm}/${this.character.name}`
        },
        {
          image: SF.FormatToCloudinary(`external/rio.png`),
          description: "View on Raider.IO",
          link: `https://raider.io/characters/${this.character.region}/${
            this.character.realm
          }/${this.character.name}`
        },
        {
          image: SF.FormatToCloudinary(`external/warcraftlogs.png`),
          description: "View on Warcraftlogs.com",
          link: `https://www.warcraftlogs.com/character/${
            this.character.region
          }/${this.character.realm}/${this.character.name}`
        },
        {
          image: SF.FormatToCloudinary(`external/raidbots.png`),
          description: "Simulate on Raidbots.com",
          link: `https://www.raidbots.com/simbot/quick?region=${
            this.character.region
          }&realm=${this.character.realm}&name=${this.character.name}`
        }
      ];
      return sites;
    },
    raidProgress() {
      var expansions = this.details.encounters;
      var lastestExpansion = expansions[expansions.length - 1]
      var latestRaid = lastestExpansion.raids[lastestExpansion.raids.length - 1];
      var latestDifficulty = latestRaid.difficulties[latestRaid.difficulties.length - 1]

      var shortRaidName = "";
      for (let i = 0; i < latestRaid.raid.name.split(" ").length; i++) {
        const word = latestRaid.raid.name.split(" ")[i];
        if (word.toLowerCase() != "the") {
          shortRaidName += word.charAt(0);
        }
      }

      return {
          value: `${latestDifficulty.bosses.length}/${latestRaid.raid.bosses.length} ${latestDifficulty.difficulty.name}`,
          name: shortRaidName
        };

    }
  },
  created() { 
  }
};
</script>

<style scoped>
#GeneralInfoFader {
  min-height: 60px;
}
#GeneralInfo {
  min-height: 150px;

  text-decoration: none;
  /*border-radius: 30px 30px 0px 0;*/
}
#PicturePlate {
  width: 84px;
  height: 84px;
  background-color: #252525;
  border: solid goldenrod 1px;
}
#NameLocationPlate {
  width: 150px;
  border-radius: 15px 15px 15px 15px;
  background-color: #252525;
  padding: 2px;
  border: solid goldenrod 1px;
}
.InfoField {
  border-radius: 15px 15px 15px 15px;
  background-color: #252525;
  padding: 2px 20px;
  border: solid goldenrod 1px;
  height: 44px;
  min-width: 110px;
  margin: 0 20px;
}
.DetailsPos {
  position: relative;
  bottom: 30px;
}
.iconLink {
  width: 18px;
  height: 18px;
  border-radius: 100%;
}
#playerLinks {
  position: absolute;
  right: -105px;
}
#playerLinksParent {
  position: relative;
}
#factionImage {
  position: absolute;
  height: 30px;
  bottom: -23px;
  left: 23px;
}
#roleImage {
  position: absolute;
  height: 25px;
  bottom: -20px;
  left: 43px;
}
.knownAs {
  position: absolute;
  left: 10px;
  top: 10px;
}
</style>
