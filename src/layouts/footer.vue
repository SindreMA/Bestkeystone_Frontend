<template>
    <div id="pageFooter">
        <div class="Container">
          <div class="TextBox">
            <h5 class="footer-title">Bestkeystone.com</h5>
            <p class="footer-tagline">Bringing you keystone statistics since 2018</p>
            <p class="footer-copyright">© {{ currentYear }} @SindreMA. All rights reserved.</p>
          </div>
          <div class="gap-10 socials flex column">
            <div v-for="(social, index) in socials" :key="index" class="social-row">
              <span class="social-label">{{ social.label }}</span>
              <a :href="social.link" target="_blank" class="socialItem" :style="{'--social-color': social.bg}">
                <img :src="social.icon" alt="social icon" width="24px" height="24px" />
              </a>
            </div>
          </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

const currentYear = new Date().getFullYear()

const socials = [
  {
    link: 'https://discord.gg/rxU5SRZnd3',
    icon: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1668114131/Social/cnw8pghmenash6pnsp1x.png',
    label: 'Discord',
    bg: '#5865F2'
  },
  {
    link: 'https://github.com/SindreMA/Bestkeystone_Frontend',
    icon: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1678312407/Social/sduczryz3mefotbzxzlp.png',
    label: 'Github',
    bg: '#333'
  }
]

</script>


<style scoped>
#pageFooter {
  width: 100%;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-default);
}

.Container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.TextBox {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.footer-tagline {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.footer-copyright {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.socials {
  display: flex;
  gap: 12px;
}

.social-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.social-label {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.socialItem {
  --social-color: #6366f1;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--social-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

.socialItem:hover {
  opacity: 0.85;
}

.socialItem img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

@media (max-width: 600px) {
  .Container {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .social-label {
    display: none;
  }

  .socials {
    flex-direction: row;
  }

  .social-row {
    gap: 0;
  }
}
</style>
