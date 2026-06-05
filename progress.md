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
