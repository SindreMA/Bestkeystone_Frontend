<template>
        <div>
            <slot :data="Data"/>
        </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
    props: ['week'],
    methods: {
        ...mapActions(['fetchDungeonSuccessRateData']),
        FetchData() {
            if (!this.Data && this.week) {
                this.fetchDungeonSuccessRateData(this.week)
            }
        }
    },
    computed: {
    ...mapGetters(['GetDungeonSuccessRateData','GetSettings']),
        Data() {
            if (this.GetDungeonSuccessRateData) {
                const data = this.GetDungeonSuccessRateData.filter(x=> 
                x.id === this.week && 
                this.GetSettings.max_runs === x.settings.max_runs && 
                this.GetSettings.limitbylowestdungeon === x.settings.limitbylowestdungeon && 
                this.GetSettings.min_keystonelevel === x.settings.min_keystonelevel)

                if (data.length != 0) {                    
                    return data[0]
                }
            }
        }
    },
    watch: {
        week() {
            this.FetchData()
        }
    },
    created() {
        this.FetchData()
    },
}
</script>