<template>
  <div class="kc-statlist kc-statlist--friends" style="--statcols: 26px minmax(0, 1fr) 50px 66px 66px;" v-if="data && data.length > 0">
    <div class="kc-statlist__head">
      <span>Keystone friends</span>
      <span class="kc-statlist__count">{{ data.length }} players</span>
    </div>
    <div class="kc-statlist__cols">
      <span class="kc-eyebrow"></span>
      <span class="kc-eyebrow">Name</span>
      <span class="kc-eyebrow r">Runs</span>
      <span class="kc-eyebrow r">Team</span>
      <span class="kc-eyebrow r">Score</span>
    </div>
    <div class="kc-statlist__scroll">
      <div v-for="row in pagedRows" :key="row.id" class="kc-statlist__row">
        <roleIcon :tooltip="true" class="kc-friend__role" :spec="row.spec" />
        <span class="kc-statlist__entity">
          <classTextColor :spec="row.spec">
            <q-spinner-bars v-if="row.fetching" color="amber" size="13px" />
            <router-link v-else-if="row.name" @click="reload()" class="kc-statlist__name"
              :to="`/lookup/player/${region}/${row.realm}/${row.name}`">{{ row.name }}</router-link>
            <span v-else class="kc-statlist__name">{{ row.id }}</span>
          </classTextColor>
        </span>
        <span class="kc-statlist__num kc-statlist__num--hi">{{ Math.round(row.sharedRunsAmount) }}</span>
        <span class="kc-statlist__num">{{ Math.round(row.sharedScore * 10) / 10 }}</span>
        <span class="kc-statlist__num">{{ row.fetching ? '…' : (row.score != undefined ? Math.round(row.score * 10) / 10 : 0) }}</span>
      </div>
    </div>
    <div v-if="totalPages > 1" class="kc-friend__pager">
      <span class="kc-tnum kc-friend__pager-info">{{ pageStart + 1 }}–{{ pageEnd }} of {{ data.length }}</span>
      <span class="kc-friend__pager-ctrl">
        <button class="kc-friend__pbtn" :disabled="page <= 1" @click="goPage(page - 1)">Prev</button>
        <button class="kc-friend__pbtn" :disabled="page >= totalPages" @click="goPage(page + 1)">Next</button>
      </span>
    </div>
  </div>
</template>

<script>
import SF from '../../../SharedFunctions'
import roleIcon from '../../Icons/Role.vue'
import classTextColor from '../../containers/classTextColor.vue'
import axios from 'axios'

export default {
  props: ['runs', 'mainPlayerId', 'region'],
  components: { roleIcon, classTextColor },
  data() {
    return {
      data: null,
      page: 1,
      perPage: 6,
    }
  },
  methods: {
    // lazy-load blizzard details only for the players currently visible on this page
    fetchVisible() {
      var apiUrl = this.$store.state.data.apiUrl
      var vm = this
      this.pagedRows.forEach((player) => {
        if (player && !player.name && !player.fetching && !player.detailsFailed) {
          player.fetching = true
          axios.get(`${apiUrl}/Player/blizzard_id?id=${player.id}&region=${this.region}`).then((x) => {
            player.name = x.data.name
            player.realm = x.data.realm
            player.score = x.data.score
            player.details = x.data
            player.fetching = false
            vm.data = [...vm.data]
          }).catch(() => {
            player.detailsFailed = true
            player.fetching = false
            vm.data = [...vm.data]
          })
        }
      })
    },
    goPage(p) {
      this.page = p
      this.fetchVisible()
    },
    getSpec(runs, id) {
      var specs = []
      runs.forEach((run) => {
        run.players.forEach((player) => {
          if (player.id == id) {
            var s = specs.filter((x) => x.spec == player.spec)
            if (s.length != 0) {
              s[0].count++
            } else {
              specs.push({ spec: player.spec, count: 1 })
            }
          }
        })
      })
      var spec = specs.sort().reverse()[0].spec
      return spec
    },
    reload() {
      setTimeout(() => { location.reload(true) }, 250)
    },
  },
  computed: {
    sortedData() {
      if (!this.data) return []
      return [...this.data].sort((a, b) => b.sharedRunsAmount - a.sharedRunsAmount)
    },
    totalPages() {
      return Math.max(1, Math.ceil((this.data ? this.data.length : 0) / this.perPage))
    },
    pageStart() {
      return (this.page - 1) * this.perPage
    },
    pageEnd() {
      return Math.min(this.pageStart + this.perPage, this.data ? this.data.length : 0)
    },
    pagedRows() {
      return this.sortedData.slice(this.pageStart, this.pageEnd)
    },
    playedWithPlayers() {
      var rtnls = []
      if (this.runs) {
        var ls = []
        this.runs.forEach((run) => {
          run.players.forEach((player) => {
            if (player.id != this.mainPlayerId) {
              var copyRun = { ...run }
              copyRun.distinctId = player.id
              ls.push(copyRun)
            }
          })
        })
        var players = SF.groupBy(ls, (x) => x.distinctId)

        for (const key in players) {
          if (players.hasOwnProperty(key)) {
            const playerRuns = players[key]
            var data = {
              id: key,
              spec: this.getSpec(playerRuns, key),
              sharedRunsAmount: playerRuns.length + (key * 0.00000000001),
              sharedScore: SF.GetScore(playerRuns) + (key * 0.00000000001),
            }
            rtnls.push(data)
          }
        }
      }
      return rtnls
    },
  },
  watch: {
    runs() {
      this.data = this.playedWithPlayers
      this.page = 1
      this.$nextTick(() => this.fetchVisible())
    },
  },
  created() {
    this.data = this.playedWithPlayers
    this.$nextTick(() => this.fetchVisible())
  },
}
</script>

<style scoped>
.kc-friend__role { width: 22px; height: 22px; }
.kc-statlist__name { color: inherit; }
.kc-friend__pager {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; border-top: 1px solid var(--line-hairline);
  font-size: 12px; color: var(--text-low);
}
.kc-friend__pager-ctrl { display: flex; gap: 6px; }
.kc-friend__pbtn {
  background: var(--bg-inset); border: 1px solid var(--line-default); color: var(--text-mid);
  border-radius: var(--radius-md); padding: 3px 12px; font-size: 12px; cursor: pointer;
  transition: all var(--transition-fast);
}
.kc-friend__pbtn:hover:not(:disabled) { border-color: var(--line-strong); color: var(--text-hi); }
.kc-friend__pbtn:disabled { opacity: 0.4; cursor: default; }
</style>
