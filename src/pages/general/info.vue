<template>
  <div class="kc-root kc-info">
    <div class="kc-container">
      <KcPageHeader eyebrow="About" title="Info" sub="How BestKeystone works, useful links, and how to reach the creator." />

      <div class="kc-info__body">
        <Tools />

        <DiscordLinksFetcher v-slot="{ data }">
          <section class="kc-info__section" v-if="data && data.length">
            <h3 class="kc-info__h">Useful Discords</h3>
            <div class="kc-info__row">
              <DiscordLink :discord="discord" v-for="(discord, index) in data" :key="index" />
            </div>
          </section>
        </DiscordLinksFetcher>

        <section class="kc-info__section">
          <h3 class="kc-info__h">Other useful WoW sites</h3>
          <div class="kc-info__row">
            <DiscordLink :discord="site" v-for="(site, i) in sites" :key="i" />
          </div>
        </section>

        <CreatorsProjectsFetcher v-slot="{ data }">
          <section class="kc-info__section" v-if="data && data.length">
            <h3 class="kc-info__h">Other projects</h3>
            <div class="kc-info__row">
              <CreatorsProjects :project="pro" v-for="(pro, i) in data" :key="i" />
            </div>
          </section>
        </CreatorsProjectsFetcher>

        <section class="kc-info__section">
          <h3 class="kc-info__h">So how does it work?</h3>
          <p>
            Every 30 minutes a program runs on the BestKeystone server. It downloads the top 500 keystone
            runs per connected realm, checks which runs aren't in the database yet, and adds the new ones.
          </p>
          <p>
            It then updates some reports such as "Team compositions" — those take a while to generate and
            can't be changed on demand. The rest of the data is quick to regenerate, so you can change the
            scope from the Context Bar at the top of the page.
          </p>
          <CloudinaryFormat url="info/keystonecollector.gif" v-slot="{ link }">
            <video class="kc-info__video" :src="link" loop autoplay muted />
          </CloudinaryFormat>
        </section>

        <section class="kc-info__section">
          <h3 class="kc-info__h">Feedback</h3>
          <p>
            Got a great feature idea, or found a bug? Reach the creator on Discord <em>SindreMA#9630</em>,
            email <em>sindrema@gmail.com</em>, or join the community Discord.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import KcPageHeader from "components/layout/KcPageHeader.vue";
import DataUpdaterView from "../../components/ItemViews/DataUpdaterView.vue";
import AffixSchedule from "../../components/Pages/info/AffixSchedule.vue";
import DiscordLink from "../../components/Pages/info/DiscordLink.vue";
import Tools from "../../components/Pages/info/tools.vue";
import renameMonitor from "../../components/Pages/info/renameMonitor.vue";
import CreatorsProjects from "../../components/Pages/info/CreatorsProjects.vue";
import DiscordLinksFetcher from '../../components/fetchers/DiscordLinksFetcher.vue'
import AffixScheduleFetcher from '../../components/fetchers/AffixScheduleFetcher.vue'
import CreatorsProjectsFetcher from '../../components/fetchers/CreatorsProjectsFetcher.vue'
import CloudinaryFormat from '../../components/data_formatters/CloudinaryFormat.vue'

export default {
  data() {
    return {
      sites: [
        {
          title: 'Subcreations',
          url: 'https://mplus.subcreation.net',
          logoUrl: 'https://mplus.subcreation.net/images/affixes/tormented.jpg',
          description: 'A great site that provides other stats regarding m+'
        },
        {
          title: 'WowValor',
          url: 'https://wowvalor.app/en/',
          logoUrl: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1666209685/knohxoxsmidxy9hwaxsh.png',
          description: 'Another statistics webpage, focused on specs. Displayed in a very nice readable way.'
        }
      ]
    }
  },
  computed: {
    RIOData() {
      return this.GetRIOData;
    }
  },
  components: {
    KcPageHeader,
    CloudinaryFormat,
    DataUpdaterView,
    AffixSchedule,
    CreatorsProjects,
    DiscordLink,
    Tools,
    renameMonitor,
    DiscordLinksFetcher,
    AffixScheduleFetcher,
    CreatorsProjectsFetcher
  }
};
</script>

<style scoped>
.kc-info { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
.kc-info__body { max-width: 860px; }
.kc-info__section { margin-top: var(--kc-sp-6); }
.kc-info__h { font-size: 16px; font-weight: 600; color: var(--kc-text-hi); margin: 0 0 12px; }
.kc-info__row { display: flex; flex-wrap: wrap; gap: 12px; }
.kc-info__body :deep(p) { color: var(--kc-text-mid); line-height: 1.7; margin: 0 0 14px; }
.kc-info__video { width: 100%; max-width: 720px; border-radius: var(--kc-r-lg); border: 1px solid var(--kc-line-default); margin-top: 8px; }
</style>
