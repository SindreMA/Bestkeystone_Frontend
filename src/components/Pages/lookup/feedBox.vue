<template>
  <div :class="{cWidth:compact,ncWidth: !compact,}" v-if="details" id="Box">
    <div id="Header" class="HeaderSize4">Character feed</div>
    <div id="Container">
      <q-scroll-area style="height: 158px;">
        <div :class="{dark: isOdd(index)}" v-for="(item, index) in details.feed" :key="index">
          <a
            v-if="item.type == 'ACHIEVEMENT'"
            class="placeLeft achievement"
            :href="`http://www.wowhead.com/achievement=${item.achievement.id}`"
            :data-wowhead="getWowheadTooltipItemString(item)"
          >Completed: {{item.achievement.title}}</a>
          <a
            v-if="item.type == 'CRITERIA'"
            class="placeLeft achievement"
            :href="`http://www.wowhead.com/achievement=${item.achievement.id}`"
            :data-wowhead="getWowheadTooltipItemString(item)"
          >Progress: {{item.achievement.title}}</a>
          <a
            v-else-if="item.type == 'BOSSKILL'"
            class="placeLeft bosskill"
            :onmouseover="`$WowheadPower.showTooltip(event, 'Boss kill: ${item.achievement.title.replace(`'`,'´')}', 'inv_sword_14')`"
            onmousemove="$WowheadPower.moveTooltip(event)"
            onmouseout="$WowheadPower.hideTooltip();"
          >{{item.achievement.title}}</a>
          <a
            v-else-if="item.type == 'LOOT'"
            class="placeLeft loot"
            :href="`http://www.wowhead.com/item=${item.itemId}`"
            :data-wowhead="getWowheadTooltipItemString(item)"
          >{{item.name}}</a>
          <div class="placeRight">
            {{FormatTimeAgo(item.timestamp)}}
            <q-tooltip>{{FormatTime(item.timestamp)}}</q-tooltip>
          </div>
          <br>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: ["details"],
  data() {
    return {
      compact: false
    };
  },
  watch: {
    _size() {
      this.compact = this._size.width <= 1081  
    }
  },
  methods: {
    FormatTimeAgo(time) {
      return moment(time).fromNow();
    },
    FormatTime(time) {
      return moment(time).format("DD.MM.YYYY");
    },
    isOdd(num) {
      return num % 2 === 1;
    },
    getRef() {
      return this.$refs;
    },
    getWowheadTooltipItemString(item) {
      if (item.type == "ACHIEVEMENT") {
        var result = `achievement=${
          item.achievement.id
        }&amp;who=Maelstrata&amp;when=1273022820000`;
        return result;
      } else if (item.type == "LOOT") {
        var result = `item=${item.itemId}`;

        if (
          item.azeriteEmpoweredItem &&
          item.azeriteEmpoweredItem.azeritePowers &&
          item.azeriteEmpoweredItem.azeritePowers.length > 0
        ) {
          var powers = item.azeriteEmpoweredItem.azeritePowers;
          result += `&azerite-powers=${powers.map(x => x.id).join(":")}`;
        }

        if (item.appearance && item.appearance.itemId) {
          result += `&transmog=${item.appearance.itemId}`;
        }
        if (item.tooltipParams) {
          if (item.tooltipParams.enchant) {
            result += `&ench=${item.tooltipParams.enchant}`;
          }
          if (item.tooltipParams.gem0) {
            result += `&gems=${item.tooltipParams.gem0}`;
          }
        }
        if (item.bonusLists && item.bonusLists.length > 0) {
          result += `&bonus=${item.bonusLists.join(":")}`;
        }
        return result;
      }
    }
  },
  computed: {
      _size() {
      return { width: this.$q.screen.width, height: this.$q.screen.height}
    },
  }
};
</script>

<style scoped>
.cWidth {
  max-width: 1031px;
}
.ncWidth {
  max-width: 662px;
}
#Box {
  border: 1px solid #696969;
  min-width: 300px;
  width: 100%;
  height: 200px;
  position: relative;
}

#Header {
  background-color: #414141;
  padding: 5px;
}
#Container {
  position: relative;
}
.achievement {
  color: #ffd000d0;
}
.loot {
  color: blueviolet;
}
.bosskill {
  color: rgba(255, 0, 0, 0.596);
}
.dark {
  background-color: #2b2b2b;
}
.placeLeft {
  position: absolute;
  left: 5px;
  height: 20px;
  overflow: hidden;
}
.placeRight {
  position: absolute;
  height: 20px;
  right: 5px;
}
</style>
