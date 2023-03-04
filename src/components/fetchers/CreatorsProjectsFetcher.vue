<template>
        <div>
            <slot :data="data"/>
        </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
    methods: {
        ...mapActions(['fetchCreatorsProjects']),
        FetchData() {
            if (!this.GetCreatorsProjects ) {
                this.fetchCreatorsProjects()
            }
        }
    },
    computed: {
    ...mapGetters(['GetCreatorsProjects']),
        data() {
            if (this.GetCreatorsProjects ) {
                return this.GetCreatorsProjects                
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