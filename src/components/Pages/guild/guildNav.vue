
<template>
    <div class="HeaderFont">
         <q-tabs  
          narrow-indicator v-model="_tab" swipeable align="justify">
          <!--<q-tab name="overview" label="Overview" />-->
          <q-tab name="members" label="Members" />
          <!--<q-tab name="mythicPlus" label="Mythic Plus" />-->
          <!--<q-tab name="raid" label="Raid"/>-->
          
        </q-tabs>
    </div>
</template>

<script>
export default {
    props: ['tab'],
    data() {
        return {
            _tab: 'members'
        }
    },
    watch: {
        tab() {
            this.$emit('changedTab', this._tab)
        }
    },
    created() {
        if (this.tab) {
            this._tab = this.tab
        }
    },
    
}
</script>