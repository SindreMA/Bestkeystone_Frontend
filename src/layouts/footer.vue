<template>
  <footer class="kc-footer">
    <div class="kc-footer__inner">
      <!-- brand zone -->
      <div class="kc-footer__brand">
        <router-link to="/" class="kc-footer__logo">
          <span class="kc-footer__mark"><img class="kc-footer__markimg" src="https://res.cloudinary.com/djpcbbeqx/image/upload/h_64,w_64/v1664310113/icons/inv_relics_hourglass.webp" alt="BestKeystone" /></span>
          <span class="kc-disp kc-footer__word">BestKeystone.com</span>
        </router-link>
        <p class="kc-footer__tagline">Bringing you keystone statistics since 2018.</p>
        <p class="kc-footer__copy">© {{ currentYear }} @SindreMA. Not affiliated with Blizzard Entertainment.</p>
        <div class="kc-footer__socials">
          <a v-for="s in socials" :key="s.label" :href="s.link" target="_blank" rel="noopener" class="kc-footer__social" :title="s.label">
            <img :src="s.icon" :alt="s.label" width="18" height="18" />
          </a>
        </div>
      </div>

      <!-- sitemap columns -->
      <div v-for="col in columns" :key="col.h" class="kc-footer__col">
        <div class="kc-eyebrow kc-footer__col-h">{{ col.h }}</div>
        <template v-for="l in col.links" :key="l.label">
          <a v-if="l.href" :href="l.href" target="_blank" rel="noopener" class="kc-footer__link">{{ l.label }}</a>
          <router-link v-else :to="l.to!" class="kc-footer__link">{{ l.label }}</router-link>
        </template>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const currentYear = new Date().getFullYear()

type FooterLink = { label: string; to?: string; href?: string }
const columns: { h: string; links: FooterLink[] }[] = [
  { h: 'Statistics', links: [
    { label: 'Dungeons', to: '/statistics/dungeons' },
    { label: 'Classes', to: '/statistics/classes' },
    { label: 'Specs', to: '/statistics/specs' },
    { label: 'Compositions', to: '/statistics/compositions' },
    { label: 'Runs', to: '/statistics/runs' },
  ] },
  { h: 'Overall', links: [
    { label: 'Talents', to: '/statistics/overall/talents' },
  ] },
  { h: 'Explore', links: [
    { label: 'Leaderboard', to: '/leaderboard/keystone' },
    { label: 'Live Monitor', to: '/monitor' },
    { label: 'Info', to: '/info' },
  ] },
  { h: 'Legacy', links: [
    { label: 'Super Legacy site', href: 'https://super-legacy.bestkeystone.com/' },
    { label: 'Classic site', href: 'https://legacy.bestkeystone.com' },
  ] },
]

const socials = [
  { link: 'https://discord.gg/rxU5SRZnd3', icon: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1668114131/Social/cnw8pghmenash6pnsp1x.png', label: 'Discord' },
  { link: 'https://github.com/SindreMA/Bestkeystone_Frontend', icon: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1678312407/Social/sduczryz3mefotbzxzlp.png', label: 'Github' },
]
</script>

<style scoped>
.kc-footer {
  width: 100%;
  background: var(--bg-surface);
  border-top: 1px solid var(--line-hairline);
  margin-top: var(--sp-8);
  /* clearance so the fixed legacy banner never covers footer content */
  padding-bottom: 72px;
}
.kc-footer__inner {
  width: 100%;
  max-width: var(--content-wide);
  margin: 0 auto;
  padding: 40px 24px;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
  gap: 32px;
}
@media (max-width: 815px) { .kc-footer__inner { grid-template-columns: 1fr 1fr; gap: 28px; } }
@media (max-width: 520px) { .kc-footer__inner { grid-template-columns: 1fr; } }

.kc-footer__logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 12px; }
.kc-footer__mark { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; }
.kc-footer__markimg { width: 100%; height: 100%; object-fit: cover; display: block; }
.kc-footer__word { font-size: 16px; font-weight: 700; color: var(--text-hi); }
.kc-footer__tagline { margin: 0 0 4px; font-size: 13px; color: var(--text-mid); }
.kc-footer__copy { margin: 0; font-size: 12px; color: var(--text-low); }
.kc-footer__socials { display: flex; gap: 8px; margin-top: 16px; }
.kc-footer__social {
  width: 34px; height: 34px; border-radius: var(--r-md); display: grid; place-items: center;
  background: var(--bg-inset); border: 1px solid var(--line-hairline);
}
.kc-footer__social:hover { border-color: var(--line-strong); }
.kc-footer__social img { object-fit: contain; opacity: 0.85; }
.kc-footer__social:hover img { opacity: 1; }

.kc-footer__col-h { margin-bottom: 12px; }
.kc-footer__link {
  display: block; font-size: 13px; color: var(--text-mid); text-decoration: none; padding: 4px 0;
}
.kc-footer__link:hover { color: var(--accent); }
</style>
