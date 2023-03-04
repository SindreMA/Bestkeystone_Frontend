<template>
    <div v-if="details">

        <div id="gearDivContainer">
            <div id="gearDivHeader" class="flex justify-between">
                <div class="HeaderSize4">Gear</div>
                <div>{{ details.equipped_item_level }}/{{ details.average_item_level }}</div>
            </div>
            <div id="gearContent">
                <div class="flex">
                    <div class="item" v-for="(item, index) in details.equipment" :key="index">
                        <div :id="'gearSlot' + item.slot" class="text-center">
                            <div class="ilvlBox">{{ item.item_level }}</div>
                            <a :href="`http://www.wowhead.com/item=${item.id}`"
                                :data-wowhead="getWowheadTooltipItemString(item)">
                                <CloudinaryFormat :url="item.iconUrl ?? 'https://wow.zamimg.com/images/wow/icons/medium/' + item.icon + '.jpg'" size="35px" v-slot="{ link }" >
                                <img class="itemIcon"
                                    :src="link">
                                </CloudinaryFormat>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<script lang="ts" setup>
import { computed, toRefs } from "vue";
import ItemTooltip from "../../ItemViews/ItemTooltip.vue";
import CloudinaryFormat from 'components/data_formatters/CloudinaryFormat.vue'

const props = defineProps({
    details: {
        type: Object,
    }
})

const { details } = toRefs(props)

const getWowheadTooltipItemString = (item) => {
    var result = `item=${item.id}&ilvl=${item.item_level}`;

    if (item.azerite_powers) {
        result += `&azerite-powers=${item.azerite_powers.map(x => x.id).join(':')}`
    }
    if (item.enchantment) {
        result += `&ench=${item.enchantment}`
    }
    if (item.socket) {
        result += `&gems=${item.socket}`
    }

    if (item.azerite) {

        var ls = []

        if (item.azerite.slot_0_id != undefined && item.azerite.slot_0_id != null) {
            ls.push(item.azerite.slot_0_id)
        }

        if (item.azerite.slot_1_id != undefined && item.azerite.slot_1_id != null) {
            ls.push(item.azerite.slot_1_id)
        }

        if (item.azerite.slot_2_id != undefined && item.azerite.slot_2_id != null) {
            ls.push(item.azerite.slot_2_id)
        }

        if (item.azerite.slot_3_id != undefined && item.azerite.slot_3_id != null) {
            ls.push(item.azerite.slot_3_id)
        }

        result += `&azerite-essence-powers=${ls.join(':')}`;

    }

    if (item.transmog) {
        result += `&transmog=${item.transmog}`
    }

    if (item.bonus_list !== null && item.bonus_list !== undefined) {
        result += `&bonus=${item.bonus_list.replace(/,/g, ":")}`
    }

    return result
}

const items = computed(() => {
    if (details.value) {
        var items = Object.keys(details.value.items).map(function (slot) {
            if (slot != "averageItemLevelEquipped" && slot != "averageItemLevel") {
                var item = details.value.items[slot]
                item.slot = slot
                return item
            }
        }).filter(x => x);

        return items
    }
})

</script>
<style scoped>
#gearDivContainer {
    border: 1px solid #696969;
}

.item {
    width: 40px;
    margin: 5px 2px 2px 2px;
}

.itemIcon {
    border: #696969 solid 1px;
    border-radius: 7px;

}

#gearDivHeader {
    background-color: #414141;
    padding: 5px;
}

.gearContent {}

.wowhead-tooltip-powered * {
    opacity: 0;
    width: 0;
    height: 0;
    visibility: hidden;
    overflow: hidden;
}

.ilvlBox {
    background-color: #414141;
    border-radius: 10px;
    margin-bottom: 2px;
}
</style>


