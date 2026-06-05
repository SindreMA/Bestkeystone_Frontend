<template>
  <div class="guild-header" v-if="guild">
    <div class="header-content">
      <div class="guild-identity">
        <CloudinaryFormat :url="`factions/${guild.faction.toLowerCase()}.png`" v-slot="{ link }">
          <img :src="link" class="faction-icon" :alt="guild.faction" />
        </CloudinaryFormat>
        <div class="guild-info">
          <h1 :class="['guild-name', guild.faction.toLowerCase()]">{{ guild.name }}</h1>
          <div class="guild-location text-secondary">
            <span class="region">{{ guild.region.toUpperCase() }}</span>
            <span class="separator">·</span>
            <span class="realm">{{ capitalize(guild.realm) }}</span>
            <span class="separator">·</span>
            <span class="member-count">{{ guild.members.length }} members</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <q-btn
          :disable="!(timerText < 0)"
          @click="updateTrigger()"
          :label="timerText < 0 ? 'Update Guild' : `${Math.round(timerText / 60)}m cooldown`"
          :icon="timerText < 0 ? 'refresh' : 'schedule'"
          flat
          class="update-btn"
        />
      </div>
    </div>
  </div>
  <q-skeleton class="guild-header-skeleton" v-else height="80px" />
</template>

<script>
import CloudinaryFormat from '../../data_formatters/CloudinaryFormat.vue'

export default {
  components: { CloudinaryFormat },
  props: ['guild'],
  data() {
    return {
      timer: null,
      timerText: null
    }
  },
  methods: {
    capitalize(s) {
      if (typeof s !== 'string') return ''
      return s.charAt(0).toUpperCase() + s.slice(1)
    },
    updateTrigger() {
      this.$emit('Update')
    },
    startTimer() {
      var vm = this
      if (this.guild) {
        var now = Math.round(new Date().getTime() / 1000)
        vm.timerText = vm.guild.created - (now - 3600)
      }

      var timer = setTimeout(() => {
        vm.startTimer()
      }, 60000);
      this.timer = timer
    }
  },
  watch: {
    guild() {
      if (this.guild) {
        var now = Math.round(new Date().getTime() / 1000)
        this.timerText = this.guild.created - (now - 3600)
      }
    }
  },
  created() {
    this.startTimer()
  },
  destroyed() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
}
</script>

<style scoped>
.guild-header {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.guild-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.guild-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.faction-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.guild-name {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.guild-name.horde {
  color: var(--faction-horde);
}

.guild-name.alliance {
  color: var(--faction-alliance);
}

.guild-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.separator {
  color: var(--text-low);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-btn {
  color: var(--text-mid);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-md);
}

.update-btn:hover:not(:disabled) {
  border-color: var(--line-strong);
  color: var(--text-hi);
}

.guild-header-skeleton {
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .guild-name {
    font-size: 1.5rem;
  }
}
</style>
