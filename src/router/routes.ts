import { RouteRecordRaw } from 'vue-router';
import layout from 'layouts/blackSides_WithTopBar.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: layout,
    children: [

      { path: '', component: () => import('pages/home.vue') },
      { path: 'classic', component: () => import('pages/general/classic.vue') },
      { path: 'info', component: () => import('pages/general/info.vue') },
      { path: 'monitor', component: () => import('components/ListViews/KeystoneMonitor.vue') },
    ]
  },
  {
    path: '/test-react',
    component: layout,
    children: [
      { path: '', component: () => import('pages/test.vue') },    ]
  },
  {
    path: '/leaderboard',
    component: layout,
    children: [
      { path: 'keystone', component: () => import('pages/leaderboards/keystone.vue') },
      { path: 'fastest', component: () => import('pages/leaderboards/fastest.vue') },
    ]
  },
  {
    path: '/meta',
    component: layout,
    children: [
      { path: 'trends', component: () => import('pages/meta/trends.vue') },
      { path: 'tier-lists', component: () => import('pages/meta/tierlists.vue') },
      { path: 'diversity', component: () => import('pages/meta/diversity.vue') },
      { path: 'faction-region', component: () => import('pages/meta/factionRegion.vue') },
    ]
  },
  {
    path: '/tools',
    component: layout,
    children: [
      { path: 'cutoffs', component: () => import('pages/tools/cutoffs.vue') },
      { path: 'planner', component: () => import('pages/tools/planner.vue') },
      { path: 'population', component: () => import('pages/tools/population.vue') },
    ]
  },
  {
    path: '/statistics',
    component: layout,
    children: [
      { path: 'dungeons', component: () => import('pages/statistics/dungeons.vue') },
      { path: 'classes', component: () => import('pages/statistics/classes.vue') },
      { path: 'specs', component: () => import('pages/statistics/specs.vue') },
      { path: 'compositions', component: () => import('pages/statistics/compositions.vue') },
      { path: 'runs', component: () => import('pages/statistics/runs.vue') },
      {
        path: 'overall',
        children: [
          { path: 'player/names', component: () => import('pages/statistics/overall/playernames.vue') },
          { path: 'items', component: () => import('pages/statistics/overall/items.vue') },
          { path: 'talents', component: () => import('pages/statistics/overall/talents.vue') },
        ]
      },
    ]
  },
  {
    path: '/lookup',
    component: layout,
    children: [
      { path: 'player/:region/:realm/:name', component: () => import('pages/lookup/player.vue') },
      { path: 'player/blizzardid/:key', component: () => import('pages/lookup/player.vue') },
      { path: 'guild/:region/:realm/:name', component: () => import('pages/lookup/guild.vue') },
      { path: 'run/:run', component: () => import('pages/lookup/run.vue') },
    ]
  }
];

export default routes;
