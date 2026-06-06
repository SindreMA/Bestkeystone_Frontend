<template>
  <div class="kc-root kc-meta-faction">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Meta · Faction & Region"
        title="Faction & Region"
        sub="Compare timed-rate, score spread and top comps across factions."
      >
        <template #right>
          <div class="fac-controls">
            <!-- region segmented control -->
            <div class="kc-seg" role="tablist" aria-label="Region">
              <button
                v-for="r in REGIONS"
                :key="r"
                class="kc-seg__btn"
                :class="{ 'is-sel': r === region }"
                @click="region = r"
              >{{ r }}</button>
            </div>
            <!-- faction toggle -->
            <div class="kc-seg" role="tablist" aria-label="Faction">
              <button
                v-for="o in FACTION_VIEWS"
                :key="o.v"
                class="kc-seg__btn kc-seg__btn--fac"
                :class="{ 'is-sel': o.v === factionView, [`is-${o.v}`]: o.v === factionView }"
                @click="factionView = o.v"
              >
                <span v-if="o.v !== 'both'" class="fac-dot" :style="{ background: crestColor(o.v) }" />
                {{ o.label }}
              </button>
            </div>
          </div>
        </template>
      </KcPageHeader>

      <!-- loading skeleton -->
      <div v-if="loading" class="fac-grid">
        <KcCard v-for="i in 2" :key="i" :level="1"><q-skeleton height="320px" /></KcCard>
      </div>

      <!-- empty -->
      <KcCard v-else-if="!hasData" :level="1">
        <div class="fac-empty">
          <div class="fac-empty__icon">◔</div>
          No faction data for {{ region }} yet.
        </div>
      </KcCard>

      <template v-else>
        <div class="fac-grid">
          <KcCard v-for="f in visibleFactions" :key="f.key" :level="1">
            <!-- card header: crest + faction name + region tag -->
            <template #header>
              <span class="fac-crest" :style="{ '--crest': crestColor(f.key) }">{{ f.crest }}</span>
              <span class="fac-name" :style="{ color: crestColor(f.key) }">{{ f.label }}</span>
            </template>
            <template #headerRight>
              <span class="kc-eyebrow fac-region-tag">{{ region }}</span>
            </template>

            <!-- timed-rate: ring + big number + week delta -->
            <div class="fac-stat">
              <KcSuccessRing :pct="f.timed * 100" :size="52" :caption="false" />
              <div class="fac-stat__txt">
                <div class="kc-disp kc-tnum fac-stat__big">{{ Math.round(f.timed * 100) }}%</div>
                <div class="fac-stat__unit">timed-rate</div>
              </div>
              <div class="fac-stat__delta">
                <KcDeltaChip :delta="f.delta" />
                <span class="fac-stat__delta-cap">vs last week</span>
              </div>
            </div>

            <!-- score distribution histogram -->
            <div class="kc-eyebrow fac-section">Score distribution</div>
            <div class="fac-hist" aria-hidden="true">
              <span
                v-for="(h, i) in f.hist"
                :key="i"
                class="fac-bar"
                :style="{ height: `${h * 2.6}px`, background: crestColor(f.key) }"
              />
            </div>
            <div class="fac-hist__axis">
              <span>low</span><span>median</span><span>title</span>
            </div>

            <!-- top comps -->
            <div class="kc-eyebrow fac-section">Top comps</div>
            <div class="fac-comps">
              <div v-for="(c, i) in f.comps" :key="i" class="fac-comp">
                <span class="fac-comp__rank" :class="{ 'is-top': i === 0 }">{{ i + 1 }}</span>
                <span class="fac-comp__icons">
                  <span
                    v-for="(id, j) in c"
                    :key="j"
                    class="fac-spec kc-disp"
                    :style="{ '--cls': specColor(id), color: specInk(id) }"
                    :title="specName(id)"
                  >{{ specAbbr(id) }}</span>
                </span>
              </div>
            </div>
          </KcCard>
        </div>

        <!-- secondary: affix split + role diversity (plausible fill) -->
        <div class="fac-secondary">
          <KcCard :level="1" header="Affix split · timed-rate by week type" :body-style="{ padding: '0' }">
            <div class="affix-head">
              <span>Dungeon</span>
              <span class="kc-right">Tyrannical</span>
              <span class="kc-right">Fortified</span>
              <span class="kc-right">Δ</span>
            </div>
            <div v-for="a in affixRows" :key="a.zone" class="affix-row">
              <span class="affix-zone">
                <span class="fac-thumb kc-disp" :style="{ '--tint': a.tint }">{{ a.abbr }}</span>
                <span class="affix-zone__name">{{ a.name }}</span>
              </span>
              <span class="affix-col">
                <span class="kc-tnum affix-col__pct">{{ Math.round(a.tyr.timed * 100) }}%</span>
                <span class="kc-mono affix-col__time">{{ fmtMs(a.tyr.ms) }}</span>
              </span>
              <span class="affix-col">
                <span class="kc-tnum affix-col__pct">{{ Math.round(a.fort.timed * 100) }}%</span>
                <span class="kc-mono affix-col__time">{{ fmtMs(a.fort.ms) }}</span>
              </span>
              <span class="kc-right">
                <span
                  class="kc-tnum affix-delta"
                  :class="a.fort.timed >= a.tyr.timed ? 'pos' : 'neg'"
                >{{ a.fort.timed >= a.tyr.timed ? '+' : '−'
                }}{{ Math.abs(Math.round((a.fort.timed - a.tyr.timed) * 100)) }}</span>
              </span>
            </div>
          </KcCard>

          <KcCard :level="1" header="Role diversity" :body-style="{ padding: '0' }">
            <div class="div-role" v-for="r in roleDiversity" :key="r.role">
              <RoleGlyph :role="r.glyph" :size="18" color="var(--kc-text-mid)" />
              <span class="div-role__name">{{ r.label }}</span>
              <span class="div-role__bar">
                <span class="div-role__track">
                  <span class="div-role__fill" :style="{ width: `${r.value * 100}%`, background: barColor(r.value) }" />
                </span>
              </span>
              <span class="kc-disp kc-tnum div-role__val">{{ r.value.toFixed(2) }}</span>
            </div>
            <div class="fac-foot">
              Both factions draw from the same spec pool — diversity is measured globally for {{ region }}.
              DPS stays the widest field; tanks remain the most concentrated.
            </div>
          </KcCard>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { affixCompare, dungeonByZone, diversity, specById, type Role } from 'src/mocks/meta'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
import RoleGlyph from 'components/keystone/RoleGlyph.vue'

/* mock-backed for now; a later pass swaps to a per-region endpoint */
const loading = ref(false)

/* region segmented control */
const REGIONS = ['EU', 'US', 'KR', 'TW'] as const
type Region = (typeof REGIONS)[number]
const region = ref<Region>('EU')

/* faction view toggle: Both | Alliance | Horde */
const FACTION_VIEWS = [
  { v: 'both', label: 'Both' },
  { v: 'alliance', label: 'Alliance' },
  { v: 'horde', label: 'Horde' },
] as const
type FactionView = (typeof FACTION_VIEWS)[number]['v']
const factionView = ref<FactionView>('both')

/* ---- per-faction mock (ported from the design view) ----
   Region multipliers nudge the numbers so switching regions feels live.  */
const REGION_MULT: Record<Region, number> = { EU: 1, US: 1.03, KR: 0.97, TW: 0.94 }
const BASE = {
  alliance: {
    timed: 0.69,
    delta: 1.2,
    hist: [8, 14, 22, 28, 19, 12, 7],
    comps: [
      ['prot-warr', 'mw', 'aug', 'fdk', 'ret'],
      ['vdh', 'disc', 'aug', 'fire', 'ww'],
      ['blood', 'pres', 'fdk', 'ret', 'sp'],
    ],
  },
  horde: {
    timed: 0.71,
    delta: -0.8,
    hist: [6, 12, 20, 30, 21, 13, 8],
    comps: [
      ['prot-pal', 'mw', 'aug', 'ret', 'dh'],
      ['brew', 'rsham', 'aug', 'fire', 'boomy'],
      ['vdh', 'hpal', 'fdk', 'ww', 'enh'],
    ],
  },
} as const

const FACTIONS = [
  { key: 'alliance' as const, label: 'Alliance', crest: 'A' },
  { key: 'horde' as const, label: 'Horde', crest: 'H' },
]

const crestColor = (key: 'alliance' | 'horde') =>
  key === 'alliance' ? 'var(--kc-faction-alliance)' : 'var(--kc-faction-horde)'

const factions = computed(() =>
  FACTIONS.map((f) => {
    const b = BASE[f.key]
    const m = REGION_MULT[region.value]
    const timed = Math.max(0, Math.min(1, b.timed * m))
    return { ...f, timed, delta: b.delta, hist: b.hist, comps: b.comps }
  }),
)

const visibleFactions = computed(() =>
  factionView.value === 'both'
    ? factions.value
    : factions.value.filter((f) => f.key === factionView.value),
)

const hasData = computed(() => factions.value.length > 0)

/* ---- affix split (plausible fill from the affixCompare mock) ---- */
const affixRows = computed(() =>
  affixCompare.map((a) => {
    const d = dungeonByZone[a.zone]
    return { ...a, name: d?.name ?? a.zone, abbr: d?.abbr ?? a.zone, tint: d?.tint ?? '#5B8DEF' }
  }),
)

/* ---- comp spec glyphs ----
   Mock comps reference string spec ids; KcSpecIcon resolves numeric store ids,
   so render the design's tinted class-initial fallback locally instead. */
const CLASS_COLOR: Record<string, string> = {
  deathknight: '#C41E3A',
  demonhunter: '#A330C9',
  druid: '#FF7C0A',
  evoker: '#33937F',
  hunter: '#AAD372',
  mage: '#3FC7EB',
  monk: '#00FF98',
  paladin: '#F48CBA',
  priest: '#FFFFFF',
  rogue: '#FFF468',
  shaman: '#0070DD',
  warlock: '#8788EE',
  warrior: '#C69B6D',
}
const CLASS_ABBR: Record<string, string> = {
  deathknight: 'DK',
  demonhunter: 'DH',
  druid: 'DR',
  evoker: 'EV',
  hunter: 'HU',
  mage: 'MG',
  monk: 'MO',
  paladin: 'PA',
  priest: 'PR',
  rogue: 'RO',
  shaman: 'SH',
  warlock: 'WK',
  warrior: 'WR',
}
const specClass = (id: string) => specById[id]?.cls ?? 'priest'
const specColor = (id: string) => CLASS_COLOR[specClass(id)] ?? 'var(--kc-text-mid)'
const specInk = (id: string) => {
  const c = specClass(id)
  // priest's near-white reads poorly as ink; clamp to hi text instead
  return c === 'priest' ? 'var(--kc-text-hi)' : CLASS_COLOR[c] ?? 'var(--kc-text-hi)'
}
const specAbbr = (id: string) => CLASS_ABBR[specClass(id)] ?? '??'
const specName = (id: string) => {
  const s = specById[id]
  return s ? `${s.name} ${s.cls}` : id
}

/* ---- role diversity (plausible fill from the diversity mock) ---- */
const ROLE_ROWS: { role: Role; label: string; glyph: string }[] = [
  { role: 'tank', label: 'Tank', glyph: 'Tank' },
  { role: 'healer', label: 'Healer', glyph: 'Healer' },
  { role: 'dps', label: 'DPS', glyph: 'DPS' },
]
const roleDiversity = computed(() => ROLE_ROWS.map((r) => ({ ...r, value: diversity.byRole[r.role] })))
const barColor = (v: number) =>
  v >= 0.66 ? 'var(--kc-pos)' : v >= 0.45 ? 'var(--kc-warn)' : 'var(--kc-neg)'

const fmtMs = (ms: number) => {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.kc-meta-faction { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* header controls */
.fac-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* ---- faction cards grid ---- */
.fac-grid {
  display: grid;
  gap: var(--kc-sp-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr));
}

/* card header crest */
.fac-crest {
  display: inline-grid; place-items: center; flex: none;
  width: 22px; height: 22px; border-radius: var(--kc-r-sm);
  font: 700 11px/1 var(--kc-font-display);
  color: var(--crest);
  background: color-mix(in oklab, var(--crest) 18%, var(--kc-bg-inset));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--crest) 45%, transparent);
}
.fac-name { font-size: 14px; font-weight: 700; }
.fac-region-tag { margin: 0; }

/* timed-rate stat row */
.fac-stat { display: flex; align-items: center; gap: var(--kc-sp-4); }
.fac-stat__txt { display: flex; flex-direction: column; line-height: 1.1; }
.fac-stat__big { font-size: 24px; font-weight: 700; color: var(--kc-text-hi); }
.fac-stat__unit { font-size: 10.5px; color: var(--kc-text-low); }
.fac-stat__delta { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.fac-stat__delta-cap { font-size: 10.5px; color: var(--kc-text-low); }

/* section eyebrows */
.fac-section { margin: 20px 0 8px; }

/* score histogram */
.fac-hist { display: flex; align-items: flex-end; gap: 6px; height: 84px; padding: 6px 0; }
.fac-bar { flex: 1; border-radius: 3px 3px 0 0; opacity: 0.85; min-width: 0; transition: height 0.5s var(--kc-ease-out); }
.fac-hist__axis {
  display: flex; justify-content: space-between;
  font-size: 9.5px; color: var(--kc-text-low);
  letter-spacing: 0.04em; margin-top: 2px;
}

/* top comps */
.fac-comps { display: grid; gap: 8px; }
.fac-comp {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 8px; background: var(--kc-bg-inset);
  border: 1px solid var(--kc-line-hairline); border-radius: var(--kc-r-md);
}
.fac-comp__rank {
  display: inline-grid; place-items: center; flex: none;
  width: 22px; height: 22px; border-radius: var(--kc-r-sm);
  font: 700 11px/1 var(--kc-font-display);
  background: var(--kc-bg-active); color: var(--kc-text-mid);
  border: 1px solid var(--kc-line-default);
}
.fac-comp__rank.is-top { color: var(--kc-rank-gold); border-color: color-mix(in oklab, var(--kc-rank-gold) 45%, transparent); }
.fac-comp__icons { display: flex; align-items: center; gap: 4px; }

/* comp spec glyph (tinted class-initial fallback, matches the design SpecIcon) */
.fac-spec {
  display: inline-grid; place-items: center; flex: none;
  width: 24px; height: 24px; border-radius: var(--kc-r-sm);
  font-size: 10px; font-weight: 700; letter-spacing: 0.01em;
  background: color-mix(in oklab, var(--cls) 26%, var(--kc-bg-inset));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--cls) 50%, transparent);
}

/* faction toggle dot */
.fac-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }

/* ---- secondary blocks ---- */
.fac-secondary {
  display: grid; gap: var(--kc-sp-5); margin-top: var(--kc-sp-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
}
.kc-right { text-align: right; justify-self: end; }

/* affix split table */
.affix-head, .affix-row {
  display: grid;
  grid-template-columns: minmax(120px, 1.4fr) minmax(74px, 1fr) minmax(74px, 1fr) 52px;
  align-items: center; gap: var(--kc-sp-3);
}
.affix-head {
  padding: 10px 16px; font-size: 10px; color: var(--kc-text-low);
  text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 1px solid var(--kc-line-hairline);
}
.affix-row {
  min-height: 46px; padding: 0 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.affix-row:last-child { border-bottom: 0; }
.affix-row:hover { background: var(--kc-bg-hover); }
.affix-zone { display: flex; align-items: center; gap: 10px; min-width: 0; }
.affix-zone__name { font-size: 13px; font-weight: 600; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fac-thumb {
  display: inline-grid; place-items: center; flex: none;
  width: 30px; height: 30px; border-radius: var(--kc-r-md);
  font-size: 9.5px; font-weight: 700; letter-spacing: 0.02em;
  color: var(--kc-text-hi); position: relative; overflow: hidden;
  background: linear-gradient(160deg, color-mix(in oklab, var(--tint) 38%, var(--kc-bg-raised)), var(--kc-bg-inset));
  box-shadow: inset 0 0 0 1px var(--kc-line-default);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}
.affix-col { display: flex; flex-direction: column; line-height: 1.25; align-items: flex-end; }
.affix-col__pct { font-size: 13.5px; font-weight: 600; color: var(--kc-text-hi); }
.affix-col__time { font-size: 10.5px; color: var(--kc-text-low); }
.affix-delta { font-size: 13px; font-weight: 700; }

/* role diversity rows (mirrors diversity.vue) */
.div-role {
  display: grid;
  grid-template-columns: 20px minmax(56px, 1fr) minmax(80px, 2fr) 46px;
  align-items: center; gap: var(--kc-sp-3);
  min-height: 46px; padding: 0 16px;
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.div-role:last-child { border-bottom: 0; }
.div-role:hover { background: var(--kc-bg-hover); }
.div-role__name { font-size: 13px; font-weight: 600; color: var(--kc-text-hi); }
.div-role__track { position: relative; display: block; height: 7px; border-radius: 99px; background: var(--kc-bg-inset); overflow: hidden; }
.div-role__fill { position: absolute; inset: 0 auto 0 0; border-radius: 99px; transition: width 0.6s var(--kc-ease-out); }
.div-role__val { font-size: 17px; color: var(--kc-text-hi); text-align: right; }

.fac-foot { padding: 12px 16px; font-size: 11.5px; color: var(--kc-text-low); border-top: 1px solid var(--kc-line-hairline); }
.pos { color: var(--kc-pos); }
.neg { color: var(--kc-neg); }

/* empty */
.fac-empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 32px 20px; }
.fac-empty__icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

/* segmented control (matches existing kc-seg usage) */
.kc-seg {
  display: inline-flex; align-self: flex-start;
  background: var(--kc-bg-inset); border-radius: var(--kc-r-md);
  border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px;
}
.kc-seg__btn {
  height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm);
  border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui);
  background: transparent; color: var(--kc-text-mid); white-space: nowrap;
  display: inline-flex; align-items: center; gap: 6px;
}
.kc-seg__btn.is-sel {
  background: var(--kc-bg-active); color: var(--kc-text-hi);
  box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600;
}
.kc-seg__btn--fac.is-alliance { color: var(--kc-faction-alliance); }
.kc-seg__btn--fac.is-horde { color: var(--kc-faction-horde); }

@media (max-width: 640px) {
  .fac-controls { width: 100%; }
}
</style>
