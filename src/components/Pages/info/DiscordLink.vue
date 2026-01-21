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
    padding: 12px;
    border-radius: var(--radius-xl);
    min-height: 50px;
    margin: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    transition: all var(--transition-normal);
}
.DiscordCard:hover {
    transform: translateY(-4px) scale(1.02);
    background: var(--bg-elevated);
    border-color: var(--border-accent);
}
.logoImg {
    border-radius: 100%;
    margin: 1px 7px;
    width: 47px;
    height: 47px;
    border: 2px solid var(--border-default);
}
.Description {
    font-size: 12px;
    color: var(--text-secondary);
}
</style>
