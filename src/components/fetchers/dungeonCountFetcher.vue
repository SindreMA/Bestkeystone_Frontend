<template>
        <div>
            <slot :data="DungeonCountData"/>
        </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
    props: ['week'],
    methods: {
        ...mapActions(['fetchDungeonCountData']),
        FetchData() {
            if (!this.DungeonCountData && this.week) {
                this.fetchDungeonCountData(this.week)
            }
        }
    },
    computed: {
    ...mapGetters(['GetDungeonCountData']),
        DungeonCountData() {
            if (this.GetDungeonCountData) {
                const data = this.GetDungeonCountData.filter(x=> x.id == this.week)
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