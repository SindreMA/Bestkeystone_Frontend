<template>
    
    <div class="DiscordCard shadow-18 col-grow">
        <a :href="discord.url" class="HeaderFont">
        <div>
            <div  class="float-left">
                <CloudinaryFormat :url="discord.logoUrl.replaceAll('/statics/','/')" v-slot="{ link }" size="80">
                    <q-img :src="link" class="logoImg"/>
                </CloudinaryFormat>
            </div>
            <div class=" text-left">
                <div > {{title}} </div>
                <div class="Description">{{discord.description}}</div>
            </div>
        </div>
    </a>    
    </div>
    
</template>
<script>
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'
export default {
    props: ['discord'],
    components: {
        CloudinaryFormat
    },
    data() {
        return {
            classDiscord: false
        }
    },
    methods: {
        getUrl(input) {
            if (input.startsWith(`/`)) {
                return `${this.baseUrl}${input}`
            } else {
                return input
            }
        }
    },
    computed: {
        baseUrl() {
            return document.location.origin
        },
        title() {
            if (this.discord.title) {
                if (this.discord.title.includes("[Class discord]")) {
                    this.classDiscord = true    
                }
                return this.discord.title.replace("[Class discord]","")
            }
        }
    },
}
</script>
<style>
.DiscordCard {
    max-width: 550px;
    min-width: 300px;
    padding: 5px;
    border-radius: 25px;
    min-height: 50px;
    margin: 5px;
    background-color: rgb(44, 44, 44);
}
.DiscordCard:hover {
    zoom: 1.05;
    background-color: rgb(46, 46, 46);
}
.logoImg {
    border-radius: 100%;
    margin: 1px 7px;
    width: 47px;
    height: 47px;
}
.Description {
    font-size: 12px;
}
</style>
