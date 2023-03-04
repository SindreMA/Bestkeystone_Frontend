<template>
        <div>
            <slot :data="data"/>
        </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
    methods: {
        ...mapActions(['fetchAffixSchedule']),
        FetchData() {
            if (!this.GetAffixSchedule || (this.GetAffixSchedule && this.GetAffixSchedule.length !== 0)) {
                this.fetchAffixSchedule()
            }
        }
    },
    computed: {
    ...mapGetters(['GetAffixSchedule']),
        data() {
            if (this.GetAffixSchedule ) {
                return this.GetAffixSchedule                
            }
        }
    },
    watch: {
        SelectedPeriode() {
            this.FetchData()
        }
    },
    created() {
        this.FetchData()
    },
}
</script>