<template>
    <div v-if="data" class="HeaderFont text-center">
        <h2>Success rate</h2>
        <div class=" flex flex-center">
            <div v-for="(spec, index) in data" :key="index">
                <div v-if="spec.total_runs != 0" class="flex flex-between ListCSS">
                    <q-tooltip>
                        Runs: {{spec.total_runs}}
                    </q-tooltip>
                    <CloudinaryFormat :url="`classes/${classDetails(specDetails(spec.id).class).name.replace(' ','-')}.jpg`" v-slot="{ link }">
                        <div id="DungeonDot" class="text-center shadow-24 relative-position"
                            :style="{ 'background-image': `url(${link})` }">
                            <div class="percentBackground absolute-center">
                                <div>{{spec.ontime_percent.toFixed(0)}}%</div>
                            </div>
                        </div>
                    </CloudinaryFormat>
                    <div class="text-center" style="margin: auto;">{{specDetails(spec.id).name}}
                        {{classDetails(specDetails(spec.id).class).name}}</div>
                </div>

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
        ...mapGetters(['SelectedPeriode', 'GetSpecs', 'GetClasses']),
        Settings() {
            return this.$store.state.data.settings;
        },
    },
    methods: {
        classDetails(id) {
            for (let i = 0; i < this.GetClasses.length; i++) {
                const _class = this.GetClasses[i];
                if (_class.id == id) {
                    return _class
                }
            }
        },
        fetchData() {
            var vm = this;
            vm.fetching = true
            var apiUrl = this.$store.state.data.apiUrl;

            axios.get(apiUrl + '/Spec/ontimerate?periode=' +
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
        specDetails(id) {
            for (let i = 0; i < this.GetSpecs.length; i++) {
                const spec = this.GetSpecs[i];
                if (spec.id == id) {
                    return spec
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
    border-radius: 100%;
    margin: 15px;
    font-size: 50px;
    background-position: center;
    /* Center the image */
    background-size: cover
}

.ListCSS {
    width: 180px;
}
</style>
