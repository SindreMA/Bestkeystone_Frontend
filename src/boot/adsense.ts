import Ads from 'vue-google-adsense'
import vuescript2 from 'vue-script2'

export default ({ Vue }) => {
Vue.use(vuescript2)
    Vue.use(Ads.Adsense)
    Vue.use(Ads.InArticleAdsense)
    Vue.use(Ads.InFeedAdsense)
}


