
<template>
<div class="holder">
    <div ref="tooltip" v-if="hover" :style="'top: ' + (hover.y +20) + 'px; left: ' + (hover.x +20) + 'px;'" class="itemToolTip">
        <div id="Name">{{item.name}}</div>
        <div id="itemLevel">{{item.itemLevel}}</div>
        <div id="weaponHands"></div> <div id="WeaponType"></div>
        <div id="weapondmg"></div> <div id="weaponSpeed"></div>
        <div id="weapondps"></div>
        <div id="stat1"></div>
        <div id="stat2"></div>
        <div id="stat3"></div>
        <div id="stat4"></div>
        <div id="Durability"></div>
        <div id="Level"></div>
        <div id="price"></div>
        <div id="droppedby"></div>
        <div id="dropchance"></div>
    </div>
</div>

</template>
<script>
//this were a attempt to make a tooltip for items, but ended up not using it, as wowhead have own tooltip
export default {
    props: ['item','parent'],
    data() {
        return {
            hover: null,
        }
    },
    watch : {
        hover () {
        }
    },
    mounted () {
        var vm = this
        this.$el.parentElement.onmousemove = function (key) {
            vm.hover = key;
        };
        this.$el.parentElement.onmouseleave = function (key) {
            vm.hover = null
        };



    }

}
</script>

<style scoped>
.holder {
    width: 0px;
    position: relative;
    height: 0px;
    overflow: visible;
}
.itemToolTip {
    position: fixed;
    min-width: 200px;
    min-height: 200px;
    border: 1px yellow solid;
    background: rgba(6, 25, 46, 0.5)
}
</style>
