# Redesign Progress

Branch: `redesign/keystone-console-home`. See `Plan.md` for the strategy.
Status legend: ✅ done · 🔄 in progress · ⬜ not started.

_Last updated: end of Phase F (per-page rebuilds — all stat/activity views done)._

## Phase F — Full per-page rebuilds to the design ✅ (core views)
Shared primitives added (reusable under `.kc-root`): `KcRankChip`, `KcScorePill`,
`KcClassIcon` (+ existing `KcSuccessRing`/`KcSpecIcon`/`KcDungeonThumb`/`RoleGlyph`/
`KcRunRow`/`KcCard`/`KcLiveBadge`).

Browser-verified, real data, each on `.kc-root` canvas:
- ✅ **Specs** → per-role ranked tier board (medal ranks, spec icons, class-colored
  names + bars, avg/total/n, tier-heat rails). `Spec_Data`.
- ✅ **Dungeons** → ranked board (column header, dungeon art, tier rails,
  color-coded success rings, score follows Context-Bar score mode).
  `Dungeons_Data` + `/Dungeon/ontimerate`.
- ✅ **Classes** → per-role board (specs aggregated to classes, class icons,
  success rings from `/Class/ontimerate`).
- ✅ **Compositions** → ranked comp rows with role-grouped spec badges, runs bar,
  avg/total/n, success rings, Team/Healer&Tank/DPS tabs. `/Composition`.
- ✅ **Runs / Activity** → run-count card, faction-split card, region toggles,
  chart-cards (keys/hour, keys/day, by-level) — kept the chart data logic.
- ✅ **Live Monitor** → realtime stat tiles + LIVE feed of `KcRunRow`s via SignalR
  (manual reconnect, pause/resume). Rebuilt `KeystoneMonitor.vue` to script-setup.
- ✅ **Info** → header + clean reading column (kept Tools / Discords / projects).

Follow-up rebuilds (browser-verified):
- ✅ **Compositions** — added pagination (20/page, Prev/Next, "1 / 250").
- ✅ **Best week for each dungeon** → new `KcBestWeek.vue`: Success/Total/Avg
  toggle, week-range slider with affixes, dungeon grid (peak week + value),
  best-overall-week footer. Real `/Dungeon/BestAffixSetPerDungeon`. Replaced the
  old `BestWeekForAffix*` on the Dungeons page.
- ✅ **Lookup player** (`PlayerView.vue`) → rebuilt to the design: identity header
  (class-colored name, avatar, Armory/RaiderIO/WCL/Raidbots links, Score/Runs/
  iLvl/Raid stat block, OtherMatches banner, season selector), Talents/Gear/Stats
  cards, Recent runs (`KcRunRow`), By-dungeon breakdown, and the deeper analytics
  (friends/affix/dungeon/chest/rename/update) framed in cards. Verified on
  /lookup/player/eu/silvermoon/Doomsin.

Reskinned + headed + functional (NOT ground-up rebuilt — large data dashboards,
left intact to avoid breaking real functionality):
- ◻️ **Leaderboard** — filters + run table, on-palette, with `KcPageHeader`.
- ◻️ **Lookup** guild / run — dashboards, on-palette. (`PeriodeSelector` is
  per-player, not a shell duplicate.)

### Fixes
- ✅ **Run rows are clickable** — `KcRunRow` now navigates to `/lookup/run/:id`
  on click (cursor + hover). Fixes "click into a run" on Live Monitor, Home, and
  the player page. Verified: monitor row → run detail renders.
- ✅ **Dropdown scrolling** — `app.sass .q-menu` had `overflow: hidden`, which
  clipped long dropdown lists (e.g. the /info dungeon selector: 350px box vs
  3936px content) so they couldn't scroll. Changed to `overflow: auto` — fixes
  scrolling in every `q-menu`/`q-select` app-wide. Verified scrollable.

### Phase G — Leaderboard, run detail, scope-bar consolidation
- ✅ **Leaderboard** (`keystoneLeaderboard.vue`) rebuilt: clean filter bar (Season/
  Region/Dungeon/Affix — real query filters), medal-ranked clickable run rows
  (faction crest, dungeon thumb, keystone chip, chest pips, time, affixes, spec
  icons, score, tier rails), and Prev/Next pagination. Rows → run detail.
- ✅ **Run / dungeon detail** (`keystoneView.vue`) restyled to the design: card
  header (dungeon + level + timing), Score/Affixes/Group-iLvl trio, clean player
  table (class-colored names, ilvl, talents, trinkets).
- ✅ **Region selectors removed** where they weren't real filters: dropped from the
  top nav and the Context Bar (region didn't filter the stat datasets). Kept the
  Leaderboard region (a genuine query filter) and the Runs multi-region chart
  control.
- ✅ **Settings moved into the Context Bar** and the floating gear popup removed:
  the scope bar now hosts Week · Min · Score · **Sample (max_runs)** · **Options
  (weeks-to-show + limit-to-lowest)**. `blackSides_WithTopBar.vue` gear deleted.

### Phase H — Player tables, talents, polish
- ✅ **Talents** redesigned (`TalentLine.vue`): compact icon grid (hover = name +
  description) + spec switcher, instead of the long icon+name list.
- ✅ **Player build column** rebuilt inline in `PlayerView.vue` — **Gear** (single
  card, ilvl-badged icon grid, wowhead tooltips) and **Stats** (clean 2-col
  key/value grid). Removed the old `GearInfo`/`statsBox` cards (they caused
  card-in-card double headers).
- ✅ **Deeper analytics de-nested** — keystoneFriends / Affix / Affix-set / Dungeon
  / Chests render as their own single cards (dropped the wrapping `KcCard`).
- ✅ **Home** "Runs completed this week" graph is now **full-width** (`KcSparkline`
  gained a `full` mode: viewBox + 100% width).
- ✅ **Leaderboard region selector** now matches the other filters — `regionSelector`
  switched from `borderless`/`outlined` to `filled` (and fixed `min-width: 135` →
  `150px`).

### Phase I — Overall-pages API fix, logo, leaderboard polish
- ✅ **Leaderboard region selector** now full-size + uniform with the other filters
  (it was `dense`); filter cells equalised via flex + `:deep` width. **Page count
  hidden** — pager shows "Page N" + Prev/Next (Next disables on a short last page).
- ✅ **Overall pages API** (checked against the live swagger; base = `…/api`):
  - **Talents** `/talents` → **`/Talent`** (was 404) — now loads + paginates.
  - **Items**: no working endpoint (`/Item` → 500, `/items` → 404) — page unlinked,
    fetch removed. **Player Names**: no name-pattern endpoint exists — unlinked.
  - Footer "Overall" now lists only **Talents** (the one that works).
- ✅ **Logo** swapped to the metadata/favicon icon (`inv_relics_hourglass.webp`) in
  the top nav + footer (replaced the gradient-bolt mark).
- ✅ **Home** "Runs completed this week" graph is full-width (`KcSparkline` `full`).

### Phase J — Legacy "switch back" banner
- ✅ New `src/components/layout/KcLegacyBanner.vue`: a fixed, amber/warn bottom
  banner — "This is the new BestKeystone … you can switch back" + a **Use the
  classic site →** button to `https://legacy.bestkeystone.com` (the host from
  `sindre-k8s/manifests/bestkeystone/bestkeystone-frontend-legacy-ingress.yaml`)
  and a dismiss ✕ (persisted in localStorage). Wired into the layout (all pages);
  footer gained 72px bottom padding so it's never covered.

_Phase E below (dedup + headers) remains in place and feeds Phase F._

_Last updated: after Phase E (page de-duplication + consistent headers)._

## Phase E — Per-page de-duplication + headers ✅ (in progress overall)
- ✅ Removed the `AffixSelector` duplicate (current-week affixes + "View other
  weeks") from `statistics/dungeons|classes|specs|compositions` — the Context Bar
  Week chip now owns affixes + the periode picker
- ✅ New reusable `src/components/layout/KcPageHeader.vue` (eyebrow + title + sub)
- ✅ Applied it to: dungeons, classes, specs, compositions, runs, overall ×3
  (player names / items / talents), leaderboard — replacing the old giant
  centered "What's the best X this week? (ish)" titles
- ✅ Hid the single-region Context Bar chip on `/statistics/runs` (that page has
  its own multi-region chart control — avoids a second region duplicate)
- ✅ Build green; verified in browser: dungeons + classes show clean headers,
  **no duplicate affix box**, real data still loads, class colors correct
- ◻️ Leaderboard's dungeon/affix/region inputs are genuine *filter* controls
  (not a redundant display) — left as-is
- ⬜ NOT YET: deeper layout match to the prototype (tier boards for
  classes/specs/dungeons, design chart-cards on runs, RunRow leaderboard list,
  lookup player/guild dashboards, live monitor, info) — these are full per-page
  rebuilds, still to do

## Phase 0 — Home redesign ✅
- ✅ Scoped token sheet `src/css/keystone-tokens.css` (`.kc-root`, `--kc-*`)
- ✅ 16 new components in `src/components/keystone/` (hero, live tracking, top
  performers, dungeon trends + presentational bits + `useKc.ts`)
- ✅ `src/pages/home.vue` rebuilt to compose them, wired to real data
- ✅ Fonts (Inter / Chakra Petch / JetBrains Mono) registered in `index.html`;
  CSS registered in `quasar.config.js`
- ✅ Build green
- ✅ Adversarial review (4 dims, 18 agents): 0 high-sev; 4 of my findings fixed
  (SignalR reconnect + honest badge state, redundant fetch removed, class-color
  fallback to `Class_Colors`, sparkline single-point guard); blast-radius
  confirmed nothing leaks out of `.kc-root`

## Phase A — Global palette swap ✅
- ✅ `src/css/app.sass :root` rewritten to the full new palette (new names) +
  legacy aliases; recolored Quasar overrides; fixed in-file raw hex
- ✅ `src/css/quasar.variables.sass` brand vars → new accent/canvas/status
- ✅ Build green (entire app reskinned via aliases, nothing broken)

## Phase B1 — Deterministic token rename ✅
- ✅ `sed` rewrote every `var(--old)` → `var(--new)` across all `src` files
  (null-delimited to handle spaced filenames)
- ✅ 55 files migrated; 0 `var(--old)` references remain

## Phase B2 — Hardcoded-hex migration ✅
- ✅ Verified workflow, one agent per file over 29 files (migrate → verify)
- ✅ 24 clean first pass; 5 flagged leftovers reviewed
- ✅ Fixed real misses by hand: `factionTextColor` alliance branch, `RunsStats`
  + `DungeonList` + `Default_WithTopBar` `#292929` panels, `feedBox` `.loot`
  → `--q-epic`
- ✅ Build green

## Phase C — Cleanup & proof ✅
- ✅ Removed old-name aliases from `app.sass` (kept `--shadow-glow`, still used)
- ✅ Grep proof: **0** old-token references, **0** legacy GitHub-dark hex outside
  the token-definition files
- ✅ Final `quasar build` succeeded (only the pre-existing `tr:nth-child()` CSS
  warning, unrelated to this work)

## Phase D — Global shell redesign ✅
- ✅ Rewrote `src/components/layout/CustomToolbar.vue` → Keystone Console top nav:
  gradient logo mark + wordmark, nav items with a **sliding brand-gradient
  underline** (measured per active route), Statistics dropdown (q-menu), search,
  region control bound to `settings.region`, mobile drawer
- ✅ New `src/components/layout/KcContextBar.vue` → persistent 40px **Context Bar**,
  per-route chips wired to the live store: Region (`settings.region`), Week +
  affixes (`GetPeriodes` / `ChangeSelectedPeriode`), Min level
  (`settings.min_keystonelevel` → save + refetch), Score mode
  (`settings.score_type`), with the plain-words legend
- ✅ Rewrote `src/layouts/footer.vue` → 3-zone footer (brand + Statistics/Overall/
  Explore sitemap + Discord/Github)
- ✅ Wired both into `src/layouts/blackSides_WithTopBar.vue` (full-width sticky;
  removed the old 120px header band)
- ✅ Build green
- ✅ **Live browser QA** (chrome-devtools, 1440px): home + `/statistics/dungeons`
  render correctly with **real data**; sliding underline tracks the active route;
  Context Bar shows Europe · This week (real affixes) · +10 · Avg per run; the
  Statistics dropdown + region menu (teleported q-menus) are correctly styled;
  3-zone footer renders; **0 console errors/warnings**

## Change set
- ~78 modified tracked files + 18 new components (16 Home + ContextBar) + 1 token sheet.
- The whole app now renders on the single Keystone Console palette.

## Open follow-ups (not blocking)
- ⬜ Per-page QA of the deeper routes (lookup/player, leaderboard, runs charts)
- ⬜ Optional: collapse `--kc-*` Home tokens onto the global unprefixed tokens
- ⬜ Optional (pre-existing, out of scope): fix `GetClasses` getter
  (`state.GetClasses`→`state.Classes`) and `SaveDungeon*Data` nested `.push`

## Phase K — Full app QA + polish pass (2026-06-05)

Drove the browser (chrome-devtools) through **every** routed page at 1440px +
ran a 52-agent static audit (188 confirmed findings) + a 10-agent parallel
fix-workflow. All fixes verified live; `quasar build` green (×2).

### Foundational / shared (inline)
- ✅ `app.sass`: global `.kc-eyebrow/.kc-disp/.kc-tnum/.kc-mono` (shell chrome —
  footer/context-bar/toolbar — render outside `.kc-root`, so these utilities
  were silently inert → footer eyebrows were plain Roboto). Now global.
- ✅ `app.sass`: app-wide **QTable theme** (eyebrow headers, hairline rows, token
  colours, themed pager) → all remaining default Quasar tables (Overall stats,
  player deeper-analytics, guild) now match the bespoke boards.
- ✅ `quasar.variables.sass`: `$accent` #B96BE0→#5B8DEF (killed `.text-accent`
  collision; empty-state messages now brand-blue).
- ✅ `KcSpecIcon.vue`: `@error` fallback → broken spec-icon CDN assets degrade to
  the class-colored square instead of an empty box.

### Per-page (workflow + manual)
- ✅ **classic**: merged duplicate `watch:` keys (region/realm/name refetch
  restored), `data:[]` (was `null[0]` crash), scoped style (killed global `h2`
  leak), warn-token progress bar, guarded fetch (no 400/uncaught).
- ✅ **runs**: charts fully themed (no toolbars, dark grid, accent colours, smooth);
  `HH:MM`→`HH:mm` (was month-not-minutes); accent sliders; removed empty `()`;
  removed dead `tspan *` (themed PerWeekChart + LevelStats + ChestsChart too).
- ✅ **leaderboard**: imported missing `<Affix>` (Affixes column was blank);
  fixed `ref(visableColumns)` → "computed readonly" warning (now `ref([])`);
  uniform filter widths (`#mainDivSel` too).
- ✅ **talents**: real description (was literal "hover me"), null-safe spec/class
  lookups, `align-content`→`items-center`.
- ✅ **info**: empty "Useful Discords"/"Other projects" headings hidden when no
  data; Score-Checker sliders accent-themed.
- ✅ **guild**: `--color-accent`→`--accent` (bars were dead), member-list null
  guards + `key="weekly"` column fix, medal-token rank colours.
- ✅ **specs**: refetch Spec_Data on period change (was stale).
- ✅ items/playernames/OtherMatches/KcBestWeek/KcKeystoneChip/KcContextBar/
  MainSearch/CompositionsLists: uncaught-rejection catches, null guards, token
  fixes.

### Result
- **0 console errors/warnings** on every in-nav page. Remaining logs are the
  documented [known non-issues] (dev-only Faction CORS; dead-API 404 on the two
  orphan Overall routes). 26 files changed; nothing committed (per git pref).

## Phase L — Alignment / visual-polish pass (2026-06-05)

Re-swept every page with a geometry probe (icon↔text centers, header↔row grid
tracks, value right-edges) + a 38-agent alignment audit (54 confirmed). Fixed via
a 13-agent parallel workflow + manual. `quasar build` green. All verified live.

Key alignment fixes:
- **Leaderboard** (found via probe): header & rows were SEPARATE grids with `auto`
  tracks, so KEY/GROUP/AFFIXES headers floated off their columns (header sized to
  the word, rows to the chip). Pinned explicit tracks + centered the `#`.
- **Home top-performers**: rank-0 icon 28px vs rank-1 22px on independent rows →
  6px stair-step; wrapped icons in a shared 28px track → names/bars/values align.
- **Runs**: RunsCompletedCount centered (was top-left, jumped from spinner) + now
  shows real data (getCount got a non-numeric weekId → fixed normalize + immediate
  watch; was showing 0 while the API had 304k); FactionBar icon/text centered +
  valid border + centered pill text.
- **Dungeons**: first grid track `auto`→`30px` + centered `#`.
- **Info**: Discord/Projects cards were float/block (icon top-pinned, thumbnail
  stacked below text) → flex rows; titles now --text-hi bold.
- **Guild**: name column fills + scores/bracket-counts right-align + tabular figs;
  bracket labels nowrap so bars share a left edge.
- **Run-detail trio**, **classes/compositions** number columns (fixed tracks,
  number-first, tabular), **LevelStats** slider labels over handles, **KcHero**
  ring caption, **KcRunRow / KcLiveTracking** rail-aligned left edges,
  **KcChestPips** gap, **KcPageHeader** center, **TalentRow** tabular Users.

## Phase M — Specific alignment bugs + full mobile pass (2026-06-05)

User-reported desktop bugs (fixed + verified):
- **Context-bar week chip**: affix icons sat 3–4px below the text because the
  Quasar `q-img` was `inline-block` on a text baseline → forced `display:block`
  in affix.vue (fixes affix alignment everywhere). delta 4→1px.
- **Home "Live run tracking" vs "Top performers"**: top-aligned but the left card
  (468px) was 240px shorter than the right column (Top performers + Dungeon
  trends stacked). Restructured into an equal-height top row (Live | Top
  performers, `align-items:stretch`) with **Dungeon trends now full-width below**.
  Cards now bottom-align (delta 0).
- Bonus: RunsCompletedCount flaky `0` — getCount got a non-numeric weekId; now
  normalized + immediate watch (shows real 304k).

Mobile / responsive (28-agent audit → 65 confirmed → 11-agent fix workflow):
- Tested every page at a real 390px device viewport (CDP emulation).
- **Shell**: `.MainPadd` had no base gutter <600px → added 12px; per-page
  `.kc-container` side padding zeroed on phones (uniform gutter).
- **Compositions**: score overlapped the 5th spec icon → shrink icons to 20px +
  shrinkable badges track + scorepill min-width at ≤480px. Fixed.
- **Leaderboard**: `minmax(150px,…)` floor caused overflow → `minmax(0,…)`;
  815px block now 5 explicit tracks so the score stays on one line.
- scoreChecker `col-6`→`col-12 col-sm-6`; KcRunRow group shrinks; KcBestWeek
  range stacks; context-bar chips bigger tap targets + fitted menus; KcHero/
  KcLiveTracking/keystoneView/player q-tables/talents all get phone breakpoints.
- All `@media (max-width:600px)` (desktop-safe). Build green; desktop verified
  unchanged (home cards still bottom-align, console clean).

## Phase N — Player lookup: deeper-analytics redesign (2026-06-05)

User: "remake the lookup Chest statistics looks bad, also the table view needs a
different view" + "fill space, now it wraps weirdly".

- **Chest statistics** (ChestsChart.vue): dropped the garish ApexCharts bar chart
  for a bespoke distribution — tier-toned diamond pips (3=gold…0=outlined) +
  proportional bars + %/count per tier + "N% in time · N total runs" footer.
- **The 4 stat tables → a bespoke ".kc-statlist" view** (new shared style in
  app.sass; no more Quasar q-tables): Dungeon / Affix / Affix-combination
  statistics + Keystone friends now render as eyebrow-header + hairline rows with
  entity icon+name, +key, score, time, runs, and a colour-coded Win%. Keystone
  friends keeps its lazy per-page detail fetch behind a clean Prev/Next pager.
- **Layout**: .kc-player__deep reordered so similar-height cards pair up
  (Friends|Dungeon, Affix|Affix-set) and **Chest statistics spans full width** →
  no more lone card with dead space.
- **Mobile**: 6-col stat lists collapsed the name to nothing at 390px → added a
  phone rule (.kc-statlist--stats / --friends) that drops the secondary
  Score/Time/Team columns so the entity name + Key/Runs/Win stay readable.
- Build green; desktop + 390px verified; 0 q-tables left in the section; console clean.

## Phase O — Player lookup: balance the top section (2026-06-05)

User: "way more items on the left than on right ... so much empty space".
The top grid was a fixed 1fr/1.2fr split: left = Talents+Gear+Stats (881px), right
= Recent runs + By dungeon (246px, both "No runs this season") → a 635px dead gap.
A static 2-col split can't balance this (it just flips for active players), so
switched .kc-player__grid to a balanced CSS-columns masonry (column-fill:balance,
break-inside:avoid). The 5 cards now pack into 2 even columns (Talents+Gear |
Stats+Recent+By-dungeon ≈ 649 vs 478) regardless of how much season activity the
player has. Mobile collapses to one column. Build green.

## Phase P — Player lookup: Update-at-top + single packed masonry (2026-06-05)

User: "make update at top and make the boxes auto scale to size to fit the area
so we dont have blank spaces".
- Moved the Update box from the page bottom to the top (full-width strip right
  under the identity header; now always shown, not gated on having runs).
- Merged the two separate grids (build cards + deeper-analytics cards) into ONE
  balanced CSS-columns masonry (.kc-player__masonry, column-fill:balance). Ordered
  the analytics so the two short Affix lists sit next to the build cards, which
  lets the greedy column-fill balance: the two columns now end within ~89px of
  each other (was a 635px dead gap → 357px after the first masonry attempt).
  Chest statistics is a normal masonry card now (no longer forced full-width).
- Mobile collapses to a single column. Build green; console clean.

## Phase Q — Fix mobile nav drawer rendering light (2026-06-05)

The mobile hamburger drawer rendered with a white/light background. Cause: Quasar
applies the `class="kc-drawer"` to the inner `.q-drawer__content`, but the white
default background lives on the parent `aside.q-drawer` (which carries no scope
attribute), so the old scoped selector `.kc-drawer :deep(.q-drawer)` matched
nothing. Fixed with global rules: dark the `.kc-drawer` content (it's `fit`, so it
covers the aside) + `:global(.q-drawer:has(.kc-drawer))` for the aside itself, plus
the drawer text colour. Drawer now renders on the dark Keystone Console palette.
Build green.
