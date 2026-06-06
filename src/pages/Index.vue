<template>
  <q-page ref="PageRef" class="home-page">

    <!-- Massive Hero Section -->
    <section class="massive-hero">
      <div class="hero-inner">
        <!-- Title -->
        <div class="hero-title-wrapper">
          <div class="title-sub">Find Your</div>
          <div class="title-main">Best Keystone</div>
          <div class="title-desc">Mythic+ Dungeon Rankings</div>
        </div>

        <!-- Stats Row -->
        <div class="hero-stats" v-if="Selected">
          <div class="hero-stat">
            <span class="stat-value">{{ getTotalRuns() }}</span>
            <span class="stat-label">Runs Analyzed</span>
          </div>
          <div class="hero-stat highlight">
            <span class="stat-value">{{ Selected.dungeons[0]?.name || '...' }}</span>
            <span class="stat-label">Top Dungeon</span>
          </div>
          <div class="hero-stat">
            <span class="stat-value">{{ Selected.dungeons.length }}</span>
            <span class="stat-label">Dungeons</span>
          </div>
        </div>
      </div>
    </section>

    <WarningRunAmount :Selected="Selected"></WarningRunAmount>

    <!-- Affix Selector -->
    <section class="affix-section">
      <div class="affix-section-inner">
        <span class="affix-label">This Week's Affixes</span>
        <AffixSelector></AffixSelector>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="!Selected && SelectedAffixSet" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>

    <!-- Main Content with New Layout -->
    <div v-if="Selected != null" class="main-content">

      <!-- Top Dungeon -->
      <section class="top-dungeon">
        <div class="top-dungeon-inner">
          <span class="top-label">Top Dungeon This Week</span>
          <h2 class="top-name">{{ Selected.dungeons[0]?.name || 'Loading...' }}</h2>
          <div class="top-stats">
            <span><strong>#1</strong> Rank</span>
            <span><strong>{{ Math.round(Selected.dungeons[0]?.score || 0) }}</strong> Score</span>
            <span><strong>{{ (Selected.dungeons[0]?.total_runs || 0).toLocaleString() }}</strong> Runs</span>
          </div>
        </div>
      </section>

      <!-- Dungeon Rankings -->
      <section class="rankings-section">
        <h2 class="section-title">Dungeon Rankings</h2>
        <div class="dungeon-list">
          <div v-for="dungeon in Selected.dungeons" :key="dungeon.name">
            <DungeonViewer :Selected="Selected" @click="ExpandedDungeon = $event" :expanded="ExpandedDungeon" :dungeon="dungeon"></DungeonViewer>
          </div>
        </div>
      </section>

      <!-- Two Column Layout -->
      <div class="two-column-layout">
        <!-- Compositions -->
        <section class="content-card" v-if="Selected && Selected.compositions">
          <h3 class="card-title">Top Compositions</h3>
          <CompositionsLists :Selected="Selected" :Compositions="Selected.compositions" :Affixes="Selected.affixes"></CompositionsLists>
        </section>

        <!-- Specs -->
        <section class="content-card">
          <h3 class="card-title">Spec Performance</h3>
          <SpecList :Selected="Selected"></SpecList>
        </section>
      </div>

      <!-- Classes -->
      <section class="classes-section">
        <h2 class="section-title">Class Rankings</h2>
        <ClassLists :Selected="Selected"></ClassLists>
      </section>

      <!-- Faction Section -->
      <section class="faction-section-new">
        <FactionShower :Selected="Selected"></FactionShower>
      </section>
    </div>

    <!-- Footer -->
    <section class="page-footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-brand">BestKeystone</div>
          <p>Mythic+ analytics for World of Warcraft</p>
        </div>

        <div class="footer-meta">
          <div class="meta-item">Updates every 4 hours</div>
          <div class="meta-item">Up to 5,000 runs per dungeon</div>
          <div class="meta-item">Min key level: +6</div>
        </div>

        <div class="footer-timers" v-if="RIOData">
          <div class="timer-item">
            <span class="timer-label">Last Update</span>
            <DataUpdaterView :date="RIOData.dataupdated" :countup="true"></DataUpdaterView>
          </div>
          <div class="timer-item">
            <span class="timer-label">Next Update</span>
            <DataUpdaterView :date="RIOData.dataupdated" :countdown="true"></DataUpdaterView>
          </div>
        </div>

        <div class="footer-links">
          <a href="mailto:sindrema@gmail.com">Contact</a>
          <button @click="Redirect('https://paypal.me/SindreMA')">Support Project</button>
        </div>

        <div class="footer-credit">Made by SindreMA</div>
      </div>
    </section>
  </q-page>
</template>


<script>
  import axios from 'axios'
  import DungeonViewer from '../components/DungeonViewer.vue';
  import FactionShower from '../components/FactionShower.vue';
  import ClassLists from '../components/ListViews/ClassLists.vue';
  import SpecList from '../components/ListViews/SpecList.vue';
  import CompositionsLists from '../components/ListViews/CompositionsLists.vue';
  import WarningRunAmount from '../components/Warnings/WarningRunAmount.vue';
  import DataUpdaterView from '../components/ItemViews/DataUpdaterView.vue';
  import {
    mapGetters,
    mapActions,
    mapMutations
  } from 'vuex';

    import AffixSelector from '../components/ListViews/AffixSelector.vue';


  export default {
    name: 'PageIndex',
    data() {
      return {
        startdetect: true,
        ShowSelectAffix: false,
        ShowDonate: false,
        ExpandedDungeon: null
      }
    },
    methods: {
      ...mapActions(['GetSelectedData']),
      ...mapMutations(['SaveSelectedAffixSet', 'SaveRIOData']),

      DonateHover() {
        this.ShowDonate = true
      },
      getTotalRuns() {
        if (this.Selected && this.Selected.dungeons) {
          let total = 0;
          this.Selected.dungeons.forEach(d => {
            total += d.total_runs || 0;
          });
          return total.toLocaleString();
        }
        return '...';
      },
      GetSelectList(list) {
        var ls = []

        if (this.RIOData) {
          var index = 0;
          list.forEach(item => {
            if (item != null && item.affixes != null) {
              ls.push({
                label: item.affixes[0]['name'] + ' - ' + item.affixes[1]['name'] + ' - ' + item.affixes[2][
                  'name'
                ] + ' - ' + item.affixes[3]['name'],
                value: item,
              })
              index++;
            }
          });
        }
        return ls

      },
      GetSelectorWidth() {
        if (this.$refs.selectBox !== undefined) {
          return this.$refs.selectBox.clientWidth + "px"
        } else {
          return "500px"
        }

      },
      Redirect(url) {
        window.location.href = url
      }
    },
    computed: {
      ...mapGetters(["GetSavedSelected", "GetSelectedAffixSet", "GetRIOData"]),
      Selected() {
        return this.GetSavedSelected
      },
      SelectedAffixSet() {
        return this.GetSelectedAffixSet
      },
      RIOData() {
        return this.GetRIOData
      }

    },
    watch: {
      SelectedAffixSet(newValue, oldValue) {
        if (this.startdetect) {
          var ls = newValue
          var vm = this

          var payload = [ls[0].id, ls[1].id, ls[2].id, ls[3].id]
          this.GetSelectedData(payload)

        }
      }
    },
    created() {

  var apiUrl = this.$store.state.data.apiUrl;
      var w = window
      setTimeout(function() {
        w.scrollTo(0, 0);
      }, 500)
      if (!this.Selected && !this.SelectedAffixSet) {
        var vm = this
        var selected = null
        axios.get(apiUrl + '/keystonedata/GetAffixes')
          .then(function(response) {
            vm.SaveRIOData(response.data)

            if (vm.SelectedAffixSet == null) vm.SaveSelectedAffixSet(vm.RIOData.affixes[vm.RIOData.affixes.length - 1])
          })
          .catch(function(error) {
            console.log(error);
            vm.startdetect = true;
          })
      }
    },
    components: {
      DungeonViewer,
      ClassLists,
      SpecList,
      CompositionsLists,
      FactionShower,
      WarningRunAmount,
      DataUpdaterView,
  AffixSelector
    }
  }
</script>

<style>
/* Clean Homepage Styles */
.home-page {
  background: var(--bg-canvas);
}

/* Hero Section */
.massive-hero {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.hero-inner {
  text-align: center;
  max-width: 800px;
}

.hero-title-wrapper {
  margin-bottom: 40px;
}

.title-sub {
  font-size: 1rem;
  color: var(--text-low);
  margin-bottom: 8px;
}

.title-main {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--text-hi);
  margin-bottom: 8px;
}

.title-desc {
  font-size: 1.1rem;
  color: var(--text-mid);
}

/* Hero Stats */
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.hero-stat {
  text-align: center;
  padding: 16px 24px;
}

.hero-stat.highlight {
  color: var(--warn);
}

.hero-stat .stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-hi);
}

.hero-stat.highlight .stat-value {
  color: var(--warn);
}

.hero-stat .stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-low);
  margin-top: 4px;
}

/* Affix Section */
.affix-section {
  padding: 24px 20px;
  border-top: 1px solid var(--line-default);
  border-bottom: 1px solid var(--line-default);
}

.affix-section-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.affix-label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-mid);
  margin-bottom: 12px;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  color: var(--text-low);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--line-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Top Dungeon */
.top-dungeon {
  padding: 40px 0;
  text-align: center;
}

.top-dungeon-inner {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.top-label {
  font-size: 0.8rem;
  color: var(--text-low);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.top-name {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-hi);
  margin: 12px 0 20px;
}

.top-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  color: var(--text-mid);
  font-size: 0.9rem;
}

.top-stats strong {
  color: var(--warn);
}

/* Section Titles */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-hi);
  margin: 40px 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line-default);
}

/* Rankings */
.rankings-section {
  padding: 20px 0;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 20px 0;
}

.content-card {
  background: var(--bg-surface);
  border: 1px solid var(--line-default);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-hi);
  margin: 0 0 16px 0;
}

/* Classes Section */
.classes-section {
  padding: 20px 0 40px;
}

/* Faction Section */
.faction-section-new {
  padding: 20px 0;
}

/* Footer */
.page-footer {
  margin-top: 60px;
  padding: 40px 20px;
  border-top: 1px solid var(--line-default);
  background: var(--bg-surface);
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.footer-brand {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-hi);
  margin-bottom: 8px;
}

.footer-info p {
  color: var(--text-low);
  margin: 0 0 24px;
}

.footer-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  font-size: 0.85rem;
  color: var(--text-mid);
}

.footer-timers {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.timer-item {
  text-align: center;
}

.timer-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-low);
  margin-bottom: 4px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.footer-links a {
  color: var(--text-mid);
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid var(--line-default);
  border-radius: var(--radius-md);
}

.footer-links a:hover {
  border-color: var(--line-strong);
  color: var(--text-hi);
}

.footer-links button {
  background: var(--warn);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 500;
}

.footer-links button:hover {
  background: #d97706;
}

.footer-credit {
  font-size: 0.85rem;
  color: var(--text-low);
}

/* Responsive */
@media (max-width: 768px) {
  .title-main {
    font-size: 2.5rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }

  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .top-stats {
    flex-direction: column;
    gap: 12px;
  }

  .footer-meta {
    flex-direction: column;
    gap: 8px;
  }

  .footer-timers {
    flex-direction: column;
    gap: 16px;
  }
}

/* Legacy support */
.HeaderFont { color: var(--text-mid); }
.Centertext { text-align: center; }
</style>
