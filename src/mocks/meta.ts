/* ============================================================
   BESTKEYSTONE — mock meta data (build-before-backend)
   Ported from /tmp/kc_design/private-redesign/project/data.js.
   Plausible current-season (The War Within) content.
   Replaces the window.KC globals with named ES exports.
   Field names / shapes are the API contract — keep them stable;
   a later pass swaps these mocks for real endpoints.
   ============================================================ */

/* ---------------- types ---------------- */
export type Role = 'tank' | 'healer' | 'dps'
export type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

export interface Dungeon {
  zone: string
  name: string
  abbr: string
  tint: string
}

export interface Spec {
  id: string
  name: string
  cls: string
  role: Role
  pct: number
  timed: number
  delta: number
  tier: Tier
}

export interface TrendPoint {
  week: number
  label: string
  pct: number
}

export interface TrendSpec {
  id: string
  name: string
  cls: string
  color: string
  points: TrendPoint[]
}

export interface Mover {
  id: string
  name: string
  cls: string
  pct: number
  delta: number
}

export interface RoleGroup {
  role: Role
  label: string
  specs: Spec[]
}

export interface DungeonTierRow {
  zone: string
  tier: Tier
  timed: number
  avgMs: number
  delta: number
}

export interface DungeonRankingRow {
  zone: string
  runs: number
  share: number
  avgKey: number
  delta: number
  spark: number[]
}

export interface Diversity {
  overall: number
  delta: number
  byRole: Record<Role, number>
  trend: number[]
}

export interface AffixCompareRow {
  zone: string
  tyr: { timed: number; ms: number }
  fort: { timed: number; ms: number }
}

export interface CushionRow {
  zone: string
  c3: number
  c2: number
  c1: number
  dep: number
  medianMs: number
}

export interface Cutoffs {
  regions: Record<string, number>
  delta: Record<string, number>
  percentiles: { label: string; score: number }[]
  projection: { week: number; score: number; proj: boolean }[]
}

export interface FunnelRow {
  lvl: number
  count: number
}

export interface PlannerRow {
  zone: string
  cur: string
  next: string
  gain: number
  attain: number
}

export interface FastestRow {
  rank: number
  zone: string
  lvl: number
  ms: number
  comp: string[]
  region: string
  underPar: number
}

/* ---- dungeon pool (8) · tint = --dthumb, abbr = thumb label ---- */
export const dungeons: Dungeon[] = [
  { zone: 'BREW', name: 'Stormstout Brewery', abbr: 'SSB', tint: '#E0A33B' },
  { zone: 'MISTS', name: 'Mists of Tirna Scithe', abbr: 'MISTS', tint: '#4FB860' },
  { zone: 'NW', name: 'Necrotic Wake', abbr: 'NW', tint: '#5BD4F2' },
  { zone: 'COT', name: 'City of Threads', abbr: 'COT', tint: '#B96BE0' },
  { zone: 'ARAK', name: 'Grim Batol', abbr: 'GB', tint: '#C8313A' },
  { zone: 'DAWN', name: 'The Dawnbreaker', abbr: 'DAWN', tint: '#5B8DEF' },
  { zone: 'SV', name: 'Siege of Boralus', abbr: 'SoB', tint: '#3DD6D0' },
  { zone: 'ML', name: 'Operation: Mechagon', abbr: 'OM', tint: '#FF9F1C' },
]

export const dungeonByZone: Record<string, Dungeon> = Object.fromEntries(
  dungeons.map((d) => [d.zone, d]),
)

/* class key → asset slug for icons (assets/classes/<slug>.png) */
export const CLASS_ICON: Record<string, string> = {
  deathknight: 'deathknight',
  demonhunter: 'demonhunter',
  druid: 'druid',
  evoker: 'evoker',
  hunter: 'hunter',
  mage: 'mage',
  monk: 'monk',
  paladin: 'paladin',
  priest: 'priest',
  rogue: 'rogue',
  shaman: 'shaman',
  warlock: 'warlock',
  warrior: 'warrior',
}

/* evoker has no icon asset in the kit → fall back to a tinted placeholder handled in UI */
export const HAS_ICON: Record<string, boolean> = {
  evoker: false,
  deathknight: true,
  demonhunter: true,
  druid: true,
  hunter: true,
  mage: true,
  monk: true,
  paladin: true,
  priest: true,
  rogue: true,
  shaman: true,
  warlock: true,
  warrior: true,
}

/* ---- specs: {id,name,cls,role,pct(within role),timed,delta,tier} ---- */
const tanks: Spec[] = [
  { id: 'prot-warr', name: 'Protection', cls: 'warrior', role: 'tank', pct: 31.4, timed: 0.74, delta: +1.2, tier: 'S' },
  { id: 'vdh', name: 'Vengeance', cls: 'demonhunter', role: 'tank', pct: 24.8, timed: 0.71, delta: -3.1, tier: 'A' },
  { id: 'brew', name: 'Brewmaster', cls: 'monk', role: 'tank', pct: 16.2, timed: 0.69, delta: +0.4, tier: 'A' },
  { id: 'blood', name: 'Blood', cls: 'deathknight', role: 'tank', pct: 12.9, timed: 0.66, delta: +2.6, tier: 'B' },
  { id: 'prot-pal', name: 'Protection', cls: 'paladin', role: 'tank', pct: 9.1, timed: 0.68, delta: -0.8, tier: 'B' },
  { id: 'guardian', name: 'Guardian', cls: 'druid', role: 'tank', pct: 5.6, timed: 0.62, delta: -0.4, tier: 'C' },
]

const healers: Spec[] = [
  { id: 'mw', name: 'Mistweaver', cls: 'monk', role: 'healer', pct: 27.9, timed: 0.72, delta: +0.9, tier: 'S' },
  { id: 'pres', name: 'Preservation', cls: 'evoker', role: 'healer', pct: 23.1, timed: 0.70, delta: +3.4, tier: 'A' },
  { id: 'disc', name: 'Discipline', cls: 'priest', role: 'healer', pct: 18.4, timed: 0.69, delta: -1.1, tier: 'A' },
  { id: 'rsham', name: 'Restoration', cls: 'shaman', role: 'healer', pct: 13.2, timed: 0.67, delta: -2.2, tier: 'B' },
  { id: 'hpal', name: 'Holy', cls: 'paladin', role: 'healer', pct: 9.7, timed: 0.65, delta: -0.6, tier: 'B' },
  { id: 'rdruid', name: 'Restoration', cls: 'druid', role: 'healer', pct: 7.7, timed: 0.63, delta: -0.4, tier: 'C' },
]

const dps: Spec[] = [
  { id: 'aug', name: 'Augmentation', cls: 'evoker', role: 'dps', pct: 12.1, timed: 0.73, delta: +4.2, tier: 'S' },
  { id: 'fdk', name: 'Frost', cls: 'deathknight', role: 'dps', pct: 8.7, timed: 0.70, delta: +2.1, tier: 'A' },
  { id: 'fire', name: 'Fire', cls: 'mage', role: 'dps', pct: 9.4, timed: 0.68, delta: -3.0, tier: 'A' },
  { id: 'ret', name: 'Retribution', cls: 'paladin', role: 'dps', pct: 7.9, timed: 0.69, delta: +0.7, tier: 'A' },
  { id: 'ww', name: 'Windwalker', cls: 'monk', role: 'dps', pct: 6.8, timed: 0.66, delta: +1.4, tier: 'B' },
  { id: 'dh', name: 'Havoc', cls: 'demonhunter', role: 'dps', pct: 6.4, timed: 0.67, delta: -0.9, tier: 'B' },
  { id: 'sp', name: 'Shadow', cls: 'priest', role: 'dps', pct: 5.9, timed: 0.64, delta: +0.3, tier: 'B' },
  { id: 'boomy', name: 'Balance', cls: 'druid', role: 'dps', pct: 5.3, timed: 0.65, delta: -1.6, tier: 'B' },
  { id: 'destro', name: 'Destruction', cls: 'warlock', role: 'dps', pct: 4.8, timed: 0.63, delta: +0.5, tier: 'C' },
  { id: 'enh', name: 'Enhancement', cls: 'shaman', role: 'dps', pct: 4.2, timed: 0.62, delta: -0.7, tier: 'C' },
  { id: 'mm', name: 'Marksmanship', cls: 'hunter', role: 'dps', pct: 3.6, timed: 0.61, delta: +0.2, tier: 'C' },
  { id: 'arms', name: 'Arms', cls: 'warrior', role: 'dps', pct: 2.9, timed: 0.58, delta: -0.4, tier: 'D' },
]

/* ---- trend series (12 weeks) for A1 ---- */
export const WEEKS = 12

function mkPoints(start: number, vol: number, seed: number): TrendPoint[] {
  let v = start
  const out: TrendPoint[] = []
  for (let i = 0; i < WEEKS; i++) {
    v += Math.sin(seed + i * 0.7) * vol + Math.cos(seed * 2 + i) * vol * 0.4
    v = Math.max(1.2, v)
    out.push({ week: i + 1, label: `Wk ${i + 1}`, pct: +v.toFixed(1) })
  }
  return out
}

export const trendSpecs: TrendSpec[] = [
  { id: 'aug', name: 'Augmentation', cls: 'evoker', color: 'var(--class-evoker)', points: mkPoints(6.5, 0.9, 1) },
  { id: 'fire', name: 'Fire Mage', cls: 'mage', color: 'var(--class-mage)', points: mkPoints(11.5, 0.8, 4) },
  { id: 'fdk', name: 'Frost DK', cls: 'deathknight', color: 'var(--class-deathknight)', points: mkPoints(7.2, 0.7, 2.5) },
  { id: 'ret', name: 'Ret Paladin', cls: 'paladin', color: 'var(--class-paladin)', points: mkPoints(8.4, 0.6, 6) },
  { id: 'ww', name: 'Windwalker', cls: 'monk', color: 'var(--class-monk)', points: mkPoints(5.6, 0.7, 3.2) },
  { id: 'sp', name: 'Shadow', cls: 'priest', color: 'var(--text-hi)', points: mkPoints(6.1, 0.6, 5.5) },
]
/* force last-point spread so movers read clean */
trendSpecs[0].points[WEEKS - 1].pct = 12.1
trendSpecs[1].points[WEEKS - 1].pct = 9.4
trendSpecs[2].points[WEEKS - 1].pct = 8.7

export const movers: Mover[] = [
  { id: 'aug', name: 'Augmentation Evoker', cls: 'evoker', pct: 12.1, delta: +4.2 },
  { id: 'fdk', name: 'Frost DK', cls: 'deathknight', pct: 8.7, delta: +2.1 },
  { id: 'blood', name: 'Blood DK', cls: 'deathknight', pct: 6.4, delta: +2.6 },
  { id: 'fire', name: 'Fire Mage', cls: 'mage', pct: 9.4, delta: -3.0 },
  { id: 'rsham', name: 'Resto Shaman', cls: 'shaman', pct: 7.1, delta: -2.2 },
  { id: 'boomy', name: 'Balance Druid', cls: 'druid', pct: 5.3, delta: -1.6 },
]

/* ---- A3 dungeon tier list (at level band) ---- */
export const dungeonTier: { level: number; rows: DungeonTierRow[] } = {
  level: 15,
  rows: [
    { zone: 'BREW', tier: 'S', timed: 0.78, avgMs: 24 * 60000 + 10000, delta: +3.0 },
    { zone: 'MISTS', tier: 'A', timed: 0.71, avgMs: 28 * 60000 + 40000, delta: +0.0 },
    { zone: 'SV', tier: 'A', timed: 0.69, avgMs: 27 * 60000 + 5000, delta: +1.2 },
    { zone: 'NW', tier: 'B', timed: 0.64, avgMs: 26 * 60000 + 5000, delta: -2.0 },
    { zone: 'DAWN', tier: 'B', timed: 0.61, avgMs: 29 * 60000 + 15000, delta: +0.4 },
    { zone: 'ML', tier: 'C', timed: 0.55, avgMs: 30 * 60000 + 50000, delta: -1.1 },
    { zone: 'COT', tier: 'C', timed: 0.49, avgMs: 31 * 60000 + 55000, delta: +2.4 },
    { zone: 'ARAK', tier: 'D', timed: 0.41, avgMs: 33 * 60000 + 20000, delta: -0.8 },
  ],
}

/* ---- A3 ranking mode (popularity) ---- */
export const dungeonRanking: DungeonRankingRow[] = dungeons.map((d, i) => ({
  zone: d.zone,
  runs: Math.round(48200 - i * 4100 + Math.sin(i) * 1500),
  share: +(17.5 - i * 1.6 + Math.cos(i) * 0.6).toFixed(1),
  avgKey: +(13.8 - i * 0.3).toFixed(1),
  delta: +(Math.sin(i * 1.7) * 3).toFixed(1),
  spark: Array.from({ length: 10 }, (_, k) => 40 + Math.sin(i + k * 0.6) * 14 + k * 1.2),
}))

/* ---- A5 diversity ---- */
export const diversity: Diversity = {
  overall: 0.62,
  delta: +0.04,
  byRole: { tank: 0.54, healer: 0.66, dps: 0.71 },
  trend: Array.from({ length: WEEKS }, (_, i) => +(0.5 + Math.sin(i * 0.5) * 0.06 + i * 0.008).toFixed(3)),
}

/* ---- A6 affix compare (tyrannical vs fortified) ---- */
export const affixCompare: AffixCompareRow[] = [
  { zone: 'BREW', tyr: { timed: 0.71, ms: 25 * 60000 + 10000 }, fort: { timed: 0.79, ms: 23 * 60000 + 40000 } },
  { zone: 'MISTS', tyr: { timed: 0.64, ms: 29 * 60000 }, fort: { timed: 0.68, ms: 27 * 60000 + 30000 } },
  { zone: 'NW', tyr: { timed: 0.60, ms: 27 * 60000 + 20000 }, fort: { timed: 0.67, ms: 25 * 60000 + 10000 } },
  { zone: 'COT', tyr: { timed: 0.44, ms: 33 * 60000 + 10000 }, fort: { timed: 0.53, ms: 30 * 60000 + 40000 } },
  { zone: 'SV', tyr: { timed: 0.66, ms: 28 * 60000 }, fort: { timed: 0.72, ms: 26 * 60000 + 20000 } },
]

/* ---- A7 cushion distribution (chest headroom) ---- */
export const cushion: CushionRow[] = [
  { zone: 'BREW', c3: 22, c2: 41, c1: 27, dep: 10, medianMs: 3 * 60000 + 20000 },
  { zone: 'MISTS', c3: 14, c2: 38, c1: 33, dep: 15, medianMs: 1 * 60000 + 50000 },
  { zone: 'COT', c3: 7, c2: 29, c1: 40, dep: 24, medianMs: 40000 },
  { zone: 'SV', c3: 18, c2: 40, c1: 30, dep: 12, medianMs: 2 * 60000 + 45000 },
]

/* ---- B1 cutoffs ---- */
export const cutoffs: Cutoffs = {
  regions: { EU: 3284, US: 3361, KR: 3120, TW: 2998 },
  delta: { EU: +12, US: +8, KR: +21, TW: +5 },
  percentiles: [
    { label: '0.1% · Title', score: 3284 },
    { label: '1%', score: 2940 },
    { label: '5%', score: 2610 },
    { label: '10%', score: 2415 },
    { label: '25%', score: 2080 },
    { label: '50%', score: 1690 },
  ],
  projection: Array.from({ length: WEEKS + 4 }, (_, i) =>
    i < WEEKS
      ? { week: i + 1, score: Math.round(2400 + i * 70 + Math.sin(i) * 30), proj: false }
      : { week: i + 1, score: Math.round(2400 + (WEEKS - 1) * 70 + (i - WEEKS + 1) * 62), proj: true },
  ),
}

/* ---- B2 population funnel ---- */
export const funnel: FunnelRow[] = [
  { lvl: 2, count: 412900 },
  { lvl: 5, count: 388400 },
  { lvl: 7, count: 331200 },
  { lvl: 10, count: 268100 },
  { lvl: 12, count: 198400 },
  { lvl: 15, count: 121800 },
  { lvl: 18, count: 54300 },
  { lvl: 20, count: 18920 },
  { lvl: 22, count: 4120 },
]

/* ---- B3 planner output ---- */
export const planner: PlannerRow[] = [
  { zone: 'COT', cur: '+14', next: '+15', gain: +7.4, attain: 0.49 },
  { zone: 'ARAK', cur: '+12', next: '+13', gain: +6.9, attain: 0.41 },
  { zone: 'ML', cur: '+15', next: '+16', gain: +6.2, attain: 0.55 },
  { zone: 'DAWN', cur: '+16', next: '+17', gain: +5.5, attain: 0.61 },
  { zone: 'NW', cur: '+17', next: '+18', gain: +4.8, attain: 0.64 },
  { zone: 'BREW', cur: '+18', next: '+19', gain: +4.1, attain: 0.78 },
]

/* ---- B7 fastest times ---- */
export const fastest: FastestRow[] = [
  { rank: 1, zone: 'BREW', lvl: 18, ms: 14 * 60000 + 22000, comp: ['prot-warr', 'mw', 'aug', 'fdk', 'ret'], region: 'EU', underPar: -0.38 },
  { rank: 2, zone: 'BREW', lvl: 20, ms: 15 * 60000 + 5000, comp: ['blood', 'pres', 'aug', 'fire', 'ww'], region: 'US', underPar: -0.33 },
  { rank: 3, zone: 'MISTS', lvl: 18, ms: 16 * 60000 + 48000, comp: ['vdh', 'disc', 'aug', 'ret', 'sp'], region: 'KR', underPar: -0.29 },
  { rank: 4, zone: 'NW', lvl: 17, ms: 17 * 60000 + 12000, comp: ['prot-pal', 'mw', 'fdk', 'fire', 'dh'], region: 'EU', underPar: -0.27 },
  { rank: 5, zone: 'SV', lvl: 18, ms: 18 * 60000 + 40000, comp: ['brew', 'rsham', 'aug', 'ret', 'boomy'], region: 'US', underPar: -0.24 },
  { rank: 6, zone: 'DAWN', lvl: 16, ms: 19 * 60000 + 2000, comp: ['prot-warr', 'pres', 'fdk', 'ww', 'enh'], region: 'TW', underPar: -0.21 },
  { rank: 7, zone: 'ML', lvl: 17, ms: 20 * 60000 + 15000, comp: ['vdh', 'hpal', 'aug', 'fire', 'mm'], region: 'EU', underPar: -0.18 },
  { rank: 8, zone: 'COT', lvl: 16, ms: 21 * 60000 + 50000, comp: ['blood', 'mw', 'ret', 'sp', 'destro'], region: 'US', underPar: -0.15 },
]

const allSpecs: Spec[] = [...tanks, ...healers, ...dps]
export const specById: Record<string, Spec> = {}
allSpecs.forEach((s) => {
  specById[s.id] = s
})

export const roles: RoleGroup[] = [
  { role: 'tank', label: 'Tank', specs: tanks },
  { role: 'healer', label: 'Healer', specs: healers },
  { role: 'dps', label: 'DPS', specs: dps },
]

export const levelBands: string[] = ['All', '+7', '+10', '+12', '+15', '+18', '+20']

/* convenience default — mirrors the old window.KC object shape */
const meta = {
  WEEKS,
  dungeons,
  dungeonByZone,
  CLASS_ICON,
  HAS_ICON,
  roles,
  specById,
  trendSpecs,
  movers,
  dungeonTier,
  dungeonRanking,
  diversity,
  affixCompare,
  cushion,
  cutoffs,
  funnel,
  planner,
  fastest,
  levelBands,
}

export default meta
