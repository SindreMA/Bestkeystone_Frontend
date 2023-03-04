<template>
    <div v-if="data" class="HeaderFont text-center">
        <h2>Success rate</h2>
        <div class=" flex flex-center">
            <div class="flex flex-between ListCSS" v-for="(dungeon, index) in data" :key="index">
                <q-tooltip>
                    Runs: {{dungeon.total_runs}}
                </q-tooltip>
                <CloudinaryFormat :url="DungeonDetails(dungeon.id)?.imageurl" v-slot="{ link }">
                    <div id="DungeonDot" class="text-center shadow-24 relative-position"
                        :style="{ 'background-image': `url(${link})`}">
                        <div class="percentBackground absolute-center">
                            <div class="textBox">{{dungeon.ontime_percent.toFixed(0)}}%</div>
                        </div>
                    </div>
                </CloudinaryFormat>
                <div class="text-center" style="margin: auto;">{{DungeonDetails(dungeon.id)?.name}}</div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'

export default {
    components: {
        CloudinaryFormat
    },
    data() {
        return {
            data: null,
            fetching: false,
            error: false
        }
    },
    created() {
        if (this.SelectedPeriode) {
            this.fetchData();
        }
    },
    computed: {
        ...mapGetters(['SelectedPeriode', 'GetDungeons']),
        Settings() {
            return this.$store.state.data.settings;
        },
    },
    methods: {
        getValidLink(url1, url2) {
            if (url1) {
                return url1
            }
            return url2
        },
        fetchData() {
            var vm = this;
            vm.fetching = true
            var apiUrl = this.$store.state.data.apiUrl;

            axios.get(apiUrl + '/Dungeon/ontimerate?periode=' +
                this.SelectedPeriode.id + '&min_level=' +
                this.Settings.min_keystonelevel + '&amount=' +
                this.Settings.max_runs + '&limitToLowestDungeon=' +
                this.Settings.limitbylowestdungeon)
                .then(function (response) {
                    vm.data = response.data
                    vm.fetching = false

                })
                .catch(function (error) {
                    console.log(error);
                    vm.error = true
                    vm.fetching = false

                })
        },
        DungeonDetails(id) {
            for (let i = 0; i < this.GetDungeons.length; i++) {
                const dungeon = this.GetDungeons[i];
                if (dungeon.keystone_id == id) {
                    return dungeon
                }
            }
        }
    },
    watch: {
        SelectedPeriode() {
            this.data = null
            this.error = false
            this.fetchData()
        }
    },

}
</script>
<style>
.percentBackground {
    border-radius: 25px;
    opacity: 0.8;
    padding: 5px 5px 5px 5px;
    background-color: black;
}

#DungeonDot {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 15px;
    background-position: center;
    /* Center the image */
    background-size: cover
}

.ListCSS {
    width: 180px;
}

.textBox {
    max-height: 50px;
    font-size: 30px;
    margin: 5px;
}
</style>
