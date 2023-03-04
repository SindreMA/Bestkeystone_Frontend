<template>
        <div>
            <slot :data="data"/>
        </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
    methods: {
        ...mapActions(['fetchDiscordLinks']),
        FetchData() {
            if (!this.GetDiscordLinks) {
                this.fetchDiscordLinks()
            }
        }
    },
    computed: {
    ...mapGetters(['GetDiscordLinks']),
        data() {
            if (this.GetDiscordLinks ) {
                return this.GetDiscordLinks                
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