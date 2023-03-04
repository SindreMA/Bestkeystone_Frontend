<template>
    <div>
        <GuildHeader :guild="guildData" @Update="FetchData(true)"/>
        <GuildNav :guild="guildData" :tab="tab" @changedTab="tab = $event"/>
        <GuildBody :guild="guildData" :tab="tab"/>
    </div>
</template>


<script>
import GuildNav from '../../components//pages/guild/guildNav.vue'
import GuildHeader from '../../components/pages/guild/GuildHeader.vue'
import GuildBody from '../../components/pages/guild/GuildBody.vue'
import axios from 'axios'

export default {
    props: [],
    components: {
        GuildBody,
        GuildHeader,
        GuildNav
    },
    data() {
        return {
            guildData: null,
            tab: 'members',
        }
    },
    computed: {
        view() {
            var view = this.$route.query.view;
            if (view) {
                return view
            }
            return null
        },
        region() {
            return this.$route.params.region
        },
        realm() {
            return this.$route.params.realm
        },
        guild() {
            return this.$route.params.name
        },
    },
    watch: {
        region(_old, _new) {
            if (_old !== _new) {
                this.FetchData()    
            }
        },
        realm(_old, _new) {
            if (_old !== _new) {
                this.FetchData()    
            }
        },
        guild(_old, _new) {
            if (_old !== _new) {
                this.FetchData()    
            }
        },
        tab() {
            this.$router.replace({ query: { view: this.tab } })            
        }
    },
    methods: {
        FetchData(force) {
        if (!force) force = false
        var vm = this
        var apiUrl = this.$store.state.data.apiUrl;
            vm.guildData = null
        axios.get(`${apiUrl}/Guild?name=${vm.guild}&realm=${vm.realm}&region=${vm.region}&forceBlizzardScan=${force}`).then(x=> {
            vm.guildData = x.data
        }).catch(x=> {
            console.log(x)
        })
        }
    },
    created() {
        this.FetchData()
        if (this.view) {
            this.tab = this.view
        }
    }
}
</script>

<style scoped>

    
</style>