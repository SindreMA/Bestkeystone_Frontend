# BestKeystone — New Features: Design Spec (2026-06-06)

Design-first companion to `FEATURE_PROPOSAL.md`. This describes **what each new view
looks like and how it behaves**, so the UI can be designed/built with mock data *before*
the backend aggregates exist. Everything reuses the existing **Keystone Console** dark
design system — no new visual language.

---

## 0. Design system recap (build from these)

**Tokens** (`src/css/app.sass` `:root`, mirrored as `--kc-*` under `.kc-root`):
- Surfaces: `--bg-canvas #0A0E14` · `--bg-surface #11161F` · `--bg-raised #161D28` · `--bg-inset #0D121A` · `--bg-hover` · `--bg-active`
- Lines: `--line-hairline` · `--line-default` · `--line-strong`
- Text: `--text-hi #E8EEF6` · `--text-mid #9AA7B8` · `--text-low #5E6B7D` · `--text-ghost`
- Accent: `--accent #5B8DEF` · `--accent-quiet`
- Semantic: `--pos #3FB950` · `--neg #E5534B` · `--warn #D29922` · ranks gold/silver/bronze
- Spacing `--sp-1..8` (4→64) · radii `--radius-sm..xl` · `--content-wide 1560px`
- Type: `--font-ui` Inter, `.kc-disp` (display nums), `.kc-tnum` (tabular), `.kc-mono`, `.kc-eyebrow` (uppercase micro-label)

**Reusable components (already exist):**
| Component | Use for |
|---|---|
| `KcCard` (`:level="1\|2"`, `header`, `#headerRight`, `body-style`) | every panel |
| `KcPageHeader` (`eyebrow`,`title`,`sub`,`#right`) | page titles |
| `KcContextBar` | the sticky **scope bar** (Week/Min/Dungeon/Score/Sample/Options chips) |
| `KcDeltaChip` | **week-over-week ▲▼ deltas** (tier movement, spec gain/loss) |
| `KcSparkline` | inline trend lines in rows |
| `KcDungeonTrends` | existing multi-series trend chart (template for new charts) |
| `KcScorePill` · `KcSuccessRing` · `KcRankChip` · `KcKeystoneChip` · `KcChestPips` | scores, timed-rate ring, rank badge, +level chip, chest pips |
| `KcDungeonThumb` · `KcSpecIcon` · `KcClassIcon` · `RoleGlyph` · `Affix` | iconography |
| `.kc-seg` segmented control · `.kc-statlist` list system | tabs/toggles, dense tables |
| **ApexCharts** (booted `src/boot/apexcharts.ts`) | all charts — dark theme, `--accent` series |

**Two new shared primitives to add** (used across many features):
1. **Scope-bar `Level` chip** — same pattern as the Dungeon chip we just shipped:
   `[ LEVEL  +10 ▾ ]` → menu `All · +7 · +10 · +12 · +15 · +18 · +20`. Sets a
   `SelectedLevelBand` store value; powers key-level filtering everywhere.
2. **`KcTierBadge`** — S/A/B/C/D pill using the existing `--kc-tier-*` colors (already used
   on the dungeons rows' left border). 28px rounded badge.

---

## 1. Information architecture (nav changes)

Current top nav: `Home · Statistics(Dungeons/Classes/Specs/Compositions/Runs) · Leaderboard · Live Monitor · Info`

Proposed additions (2 new top-level groups, keeps each page focused):

```
Statistics ▾   Dungeons · Classes · Specs · Compositions · Runs/Activity
Meta ▾   (NEW)  Trends · Tier Lists · Diversity · Faction & Region
Tools ▾  (NEW)  Title Cutoffs · "What to Farm" Planner · Population Funnel
Leaderboard ▾   Keystone · Fastest Times (NEW)
```

Existing pages also gain the **Level** scope chip (Classes/Specs/Compositions/Dungeons),
and Dungeons gains a **tier-list mode**.

---

## 2. Tier A views (design in detail)

### A1 · Spec & Composition Trends  — `/meta/trends`
The headline feature: how the meta moves across the season.

```
┌ Statistics ───────────────────────────────────────────────────────────┐
│ META · Trends                                          [Specs|Comps] seg│
│ How the meta shifted across the season                                 │
├────────────────────────────────────────────────────────────────────────┤
│  ┌ Representation over time ──────────────────────────[ Role: DPS ▾ ]┐ │
│  │                                              ╱‾‾‾‾ Aug (DK)         │ │
│  │   %  ┤            ╱‾‾‾‾‾‾╲___╱                                      │ │
│  │      ┤    ___╱‾‾‾          ‾‾‾‾‾‾___ Fire Mage                      │ │
│  │      ┤‾‾‾                            ‾‾‾‾                           │ │
│  │      └────┬────┬────┬────┬────┬────┬────┬───  (week ticks)         │ │
│  │   ● DK  ● Fire  ● Aug  ● Ret  …  (legend = clickable series)       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│  ┌ Biggest movers this week ──────────────────────────────────────────┐ │
│  │  ▲ +4.2%  [icon] Augmentation Evoker      12.1% ███████░░  ▲ KcDelta│ │
│  │  ▲ +2.1%  [icon] Frost DK                  8.7% █████░░░░         │ │
│  │  ▼ −3.0%  [icon] Fire Mage                 9.4% █████░░░░  ▼      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```
- **Chart:** ApexCharts line/area, one series per spec/comp, `--accent` + class colors;
  legend toggles series. Pattern = `KcDungeonTrends`.
- **Movers list:** rows of `KcSpecIcon` + name + `KcDeltaChip` + mini bar (`.kc-classrow__bar`).
- **Controls:** `[Specs | Comps]` `.kc-seg`; `Role` menu chip; reacts to scope-bar Week range.
- **States:** skeleton = 1 chart block + 3 rows; empty = "Season just started — trends appear
  after 2+ weeks."
- **Mock shape:** `{ series:[{spec, name, color, points:[{periode,label,pct}]}], movers:[{spec,name,pct,delta}] }`

### A2 · Role Tier Lists  — `/meta/tier-lists` (and enhances `/statistics/specs`)
Three role-scoped tier lists; the thing players actually search ("best healer this week").

```
┌ META · Tier Lists ───────────────────────  [ Level: +15 ▾ ] [Week ▾] ──┐
│  ┌ TANK ──────────┐ ┌ HEALER ─────────┐ ┌ DPS ──────────────┐         │
│  │ S [icon] Prot   │ │ S [icon] MW Monk │ │ S [icon] Aug  ▲   │         │
│  │   ███████ 31%   │ │   ██████ 28%     │ │   ████ 12.1%  ▲   │         │
│  │ A [icon] VDH ▼  │ │ A [icon] Pres ▲  │ │ A [icon] DK       │         │
│  │ A [icon] Brew   │ │ B [icon] Disc    │ │ A [icon] Ret      │         │
│  │ B [icon] Blood  │ │ …                │ │ B …               │         │
│  └─────────────────┘ └──────────────────┘ └───────────────────┘         │
│  Representation is share WITHIN the role · timed-rate ring on each row   │
└────────────────────────────────────────────────────────────────────────┘
```
- Three `KcCard`s side by side (auto-fit grid → stacks on mobile).
- Each row: `KcTierBadge` (S/A/B…) · `KcSpecIcon` · name · within-role % bar ·
  `KcSuccessRing` (timed-rate) · `KcDeltaChip`.
- **Level** scope chip re-scopes the whole page (this is where the new chip shines).
- **Mock:** `{ roles:[{role, specs:[{spec,name,tier,pct,timedRate,delta}]}] }`

### A3 · Dungeon Tier List + "Easiest to push at +N"  — enhances `/statistics/dungeons`
Add a **mode toggle** to the existing dungeons page: `[ Ranking | Tier list ]`.

```
┌ STATISTICS · Dungeons ─────  [Ranking | Tier list] seg  [Level +15 ▾] ──┐
│  EASIEST → HARDEST to time at +15 this week                            │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ S  [thumb] Stormstout Brewery   timed 78% ◴   avg 24:10   ▲ +3% │ │  ← KcDeltaChip vs last wk
│  │ A  [thumb] Mists                 timed 71% ◴   avg 28:40   ▬     │ │
│  │ B  [thumb] Necrotic Wake         timed 64% ◴   avg 26:05   ▼ −2% │ │
│  │ C  [thumb] City of Threads       timed 49% ◴   avg 31:55   ▲     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  Tier from corpus timed-rate distribution · delta vs last week / season │
└────────────────────────────────────────────────────────────────────────┘
```
- Reuses current `kc-dgn__row` grid; swap score column for **timed-rate `KcSuccessRing`**,
  add `KcTierBadge` (already have tier colors on the left border) + `KcDeltaChip` + avg-clear.
- The **Level** chip drives "at +N"; default = a sensible mid key.
- **Mock:** `{ level:15, dungeons:[{zone,name,tier,timedRate,avgClearMs,delta}] }`

### A4 · Key-level brackets (scope chip, cross-page)
No new page — the **Level** scope chip added to Classes/Specs/Compositions/Dungeons. Picking
`+20` re-scopes the existing tier lists/leaderboards to that band. Same interaction model and
menu styling as the Dungeon chip already shipped. Inert visual change to pages; big analytical
value.

### A5 · Meta Diversity Index  — card on `/meta/trends` + `/meta/diversity`
A single 0–1 "how stale is the meta" number, charted weekly.

```
┌ Meta diversity ───────────────────────────────────────────┐
│   0.62  ▲ +0.04        Overall          [Overall|T|H|DPS]  │
│   ████████████░░░░░░░  (gauge bar, accent→warn→neg)        │
│   ┌ trend ─────────────────────────────────────────────┐  │
│   │   ╱‾‾╲__╱‾‾‾  (KcSparkline / small Apex area)        │  │
│   └─────────────────────────────────────────────────────┘  │
│   Higher = more diverse. Gini over spec representation.     │
└────────────────────────────────────────────────────────────┘
```
- Big `.kc-disp` number + `KcDeltaChip`; `.kc-seg` role toggle; `KcSparkline` trend.
- **Mock:** `{ overall:0.62, delta:0.04, byRole:{tank,healer,dps}, trend:[...] }`

### A6 · Tyrannical vs Fortified comparison  — `/meta/affix-compare` or tab on Dungeons
Two-column side-by-side per dungeon.

```
┌ Affix impact · Tyrannical vs Fortified ───────────────────────────────┐
│  Dungeon            │  TYRANNICAL          │  FORTIFIED       Δ        │
│  [thumb] Brewery    │  timed 71% · 25:10   │  timed 79% · 23:40  +8%  │
│  [thumb] Mists      │  timed 64% · 29:00   │  timed 68% · 27:30  +4%  │
└────────────────────────────────────────────────────────────────────────┘
```
- Mirror of the player `.kc-statlist`; two metric columns + a `KcDeltaChip` Δ column.

### A7 · Time-vs-par cushion distribution  — card on Dungeons detail
Stacked bar per dungeon: % finishing with 3-chest cushion / 2 / 1 / depleted, using
existing `KcChestPips` colors.

```
[thumb] Brewery   ◆◆◆ 22%  ◆◆ 41%  ◆ 27%  ✕ 10%   median +3:20 headroom
                  └─ 3-chest ──┴─ 2 ──┴─ 1 ─┴ depl
```

---

## 3. Tier B views (design briefs)

### B1 · Title Cutoff / Percentile calculator  — `/tools/cutoffs`
- **Hero stat:** current title cutoff score per region (big `.kc-disp`), `KcDeltaChip` vs
  yesterday, faction split `.kc-seg`.
- **Percentile table:** rows `0.1% (title) · 1% · 5% · 10% · 25% · 50%` → score thresholds.
- **Projection chart:** season-long line of the cutoff with a dashed projection to season end
  (ApexCharts, dashed forecast series).
- **"Where am I?":** input a score → returns percentile + distance to next bracket.
- Region/faction = local chips on the page (not global scope bar).

### B2 · Key-level Population Funnel  — `/tools/population`
- Horizontal funnel/bar: unique players who've timed +2 … +20 (`KcKeystoneChip` row labels,
  bars scaled to count, `.kc-tnum` counts).
- Dungeon + region filter chips. "Your key" marker line if a character is entered → personal
  percentile callout.

### B3 · "What should I farm next?" planner  — `/tools/planner`
- Input: paste character / region-realm-name (reuse existing player lookup).
- Output: ranked list of dungeons by **marginal score per +1**, each row showing current
  best, next target, +score, and an **attainability** `KcSuccessRing` (corpus timed-rate at
  that bracket) so unrealistic keys are flagged.
- Sort toggle: `Most score | Most attainable`.

### B4 · Weekly "What Changed" digest  — `/meta` landing or `/meta/digest`
- A single scannable card stack: "Biggest gainers/losers" (spec rows + `KcDeltaChip`),
  "Tier movements" (dungeon rows), "Cutoff change", "Diversity shift". Auto-generated; build
  last (depends on the other aggregates).

### B5 · Faction & Region dashboard  — `/meta/faction-region`
- Region selector (`.kc-seg` EU/US/KR/TW) + Alliance/Horde toggle.
- Side-by-side cards: timed-rate, score distribution (small histogram), top-3 comps per side.

### B6 · Activity heatmap  — enhances `/statistics/runs`
- ApexCharts heatmap: hour-of-day × day-of-week, color = run volume; level-band + region
  chips. "Hours since reset" push curve as a secondary line chart.

### B7 · Fastest Times leaderboard  — `/leaderboard/fastest`
- Like the keystone leaderboard but ranked ascending by clear time / % under par; columns:
  rank `KcRankChip` · dungeon `KcDungeonThumb` · `KcKeystoneChip` +level · time `.kc-mono` ·
  comp (`KcSpecIcon` ×5) · region. Dungeon/level/affix/region filters.

---

## 4. Shared states & responsive rules
- **Loading:** `q-skeleton` matching each block's footprint (never collapse layout).
- **Empty:** friendly one-liner in `--text-mid` centered in the card (e.g. tier lists before
  enough sample, trends before 2 weeks).
- **Error:** card with `--neg` eyebrow + retry; never a blank page.
- **Responsive:** every multi-column block uses the project's overflow-proof grid
  (`repeat(auto-fit, minmax(min(100%, Xpx), 1fr))` + `min-width:0`); side-by-side tier/compare
  cards stack on phones; scope bar stays horizontally scrollable.
- **Charts:** ApexCharts dark theme, `--bg-inset` plot, `--line-hairline` grid,
  `--text-low` labels, `--accent` primary series, class/spec colors for multi-series.

## 5. Build-before-backend plan
All Tier A/B views can be built against **mock JSON** matching the shapes above (drop a
`/src/mocks/*.json` per view, swap to the real endpoint later). Suggested order to design:
1. **Level scope chip** + `KcTierBadge` (primitives everything reuses)
2. **A2 Role tier lists** (highest clarity, pure component composition)
3. **A3 Dungeon tier-list mode** (enhances an existing page)
4. **A1 Trends** (first chart-heavy view; sets the chart style for the rest)
5. **A5 Diversity** + **B1 Cutoffs** (headline single-number + projection patterns)
6. Remaining B views reuse the patterns above.
