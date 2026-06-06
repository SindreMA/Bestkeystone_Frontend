/* ============================================================
   BESTKEYSTONE — genuine reference / label data
   Split out of the old src/mocks/meta.ts. This file holds ONLY
   real reference data (dungeon/spec/class metadata, label
   constants) and the shared TYPE interfaces that views need to
   typecheck. It deliberately contains NO fabricated stats —
   those now live in test/fixtures/meta.mock.ts (tests only).
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

export const levelBands: string[] = ['All', '+7', '+10', '+12', '+15', '+18', '+20']
