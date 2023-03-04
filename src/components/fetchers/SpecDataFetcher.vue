<template>
        <div>
            <slot :data="SpecData"/>
        </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
    methods: {
        ...mapActions(['fetchSpecData']),
        FetchData() {
            if (this.SelectedPeriode && !this.SpecData || (this.SpecData && this.SpecData.length !== 0)) {
                this.fetchSpecData()
            }
        }
    },
    computed: {
    ...mapGetters(['GetSpecData','SelectedPeriode']),
        SpecData() {
            if (this.GetSpecData ) {
                return this.GetSpecData                
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