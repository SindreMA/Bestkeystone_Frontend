# BestKeystone — Full App Redesign Brief

You are redesigning **BestKeystone.com**, a World of Warcraft Mythic+ (M+) analytics web app, end to end. Produce a complete, coherent, dark-first visual system and high-fidelity screen designs for every page listed below. Read this entire brief before designing. The output must be implementable in **Quasar (Vue 3)** with ApexCharts — so keep components, spacing, and states realistic for that stack (no exotic layouts a Quasar app can't ship). When in doubt, favor legibility and trustworthiness over spectacle.

> **Important context for the designer:** This is a redesign of a *live* app with an existing token system and component library. Section 2 includes an **OLD→NEW token migration table** so the token sheet you deliver name-maps to something an implementer can actually rename against. Several "stop-and-ask" specifics (the *Share of meta %* formula, the tier-bucketing algorithm, the rank-delta data source, the Wowhead tooltip mechanism, Context-Bar precedence, the chart series palette) are pinned down explicitly below — treat them as binding, not suggestions.

---

## 1. Product context & audience

**What World of Warcraft Mythic+ is (you need this to design the data correctly):**
World of Warcraft (WoW) is a fantasy online game. "Mythic+" (M+) is its competitive timed-dungeon mode. Players form a **5-person group** (1 Tank, 1 Healer, 3 DPS — "damage dealers") and run a dungeon against a timer at an escalating **keystone level** (written `+2`, `+10`, `+18`, up to roughly `+30`). Higher keystone level = harder = more reward. Each week, the game applies a rotating set of **affixes** — global modifiers that change how dungeons play (e.g. "Tyrannical", "Fortified", "Xal'atath's Bargain: Ascendant"). Affixes "unlock" at keystone breakpoints (**level 2, 4, 7, 10**), so a `+10` key runs more affixes than a `+4`.

Completing a dungeon **within the time limit** ("timed", "on time") earns **1–3 chests** (also called keystone upgrades) depending on how far under par you finished; failing the timer = "depleted" / "over time". Each run yields a numeric **M+ score** (roughly **165–500 per run**; a strong run is ~450+). A player's, spec's, dungeon's, or class's scores aggregate into the **thousands**.

There are **13 player classes**, each with a fixed **signature color** (e.g. Death Knight red, Mage cyan, Druid orange). Each class has **2–4 specializations ("specs")**, ~39 specs total, and every spec is one of three **roles**: Tank, Healer, or DPS. There are ~**8 active dungeons** per season, **4 regions** (US/EU/KR/TW), and **2 factions** (Alliance, Horde). Players also belong to **guilds** and play on **realms** (servers).

**Who uses BestKeystone:**
Min-maxing M+ players (semi-hardcore to hardcore) who want to answer practical, competitive questions fast:
- "Which dungeon gives the best score this week / is easiest to time?" (the app's tagline: *"What's the best dungeon this week?"*)
- "Which spec/class/group composition is strongest right now?"
- "How am I (or my guild, or this run) doing — and how do I compare?"

They are data-literate, value **trustworthy numbers over hype**, browse on **desktop primarily but also mobile**, and screenshot/share rankings. They already know WoW jargon (you can use "keystone", "affix", "DPS", "ilvl") but the UI must still make **score modes, affix breakpoints, and ranking logic explicit** because the current app hides them.

**Core job-to-be-done:** *Give me a fast, scannable, trustworthy read on the current M+ meta and on any specific player/guild/run, with the data scope (region · week · score type) always visible so no number is ambiguous.*

---

## 2. The chosen design direction — "Keystone Console"

**Mood / personality:** A calm, premium, dark-first **analytics instrument** — think *Linear's restraint + an esports stat overlay's confidence*, tuned for WoW. The interface chrome is **quiet and near-monochrome**; the **data carries the color**. Color is never decoration — every saturated pixel **encodes meaning** (class identity, tier/heat, success/failure, faction, live state). The product is confident and competitive where it matters (ranking moments: the home hero, tier ladders, top-3 slots, the live monitor pulse) and deliberately flat, dense, and legible everywhere data must be trusted (tables, charts, run detail). **No fantasy kitsch** (no parchment, rivets, blackletter, full-bleed glowing portraits). The "game" energy comes from class colors, tier heat, and a single live pulse — not from skins.

The two governing rules:
1. **Spectacle is reserved for ranking surfaces.** Big numbers, tier rails, top-3 glow, count-ups, FLIP re-sorts → only on home hero, tier boards, leaderboard top slots, live monitor. Analytics tables stay still and calm.
2. **Scope is always visible.** A persistent context bar states Region · Week (+ affixes) · Score mode · Min level so no number ever silently changes meaning.

### 2.0 Token migration (READ FIRST — the redesign retires a live token system)

The current codebase ships a working "GitHub-dark" token set in `src/css/app.sass` (base `#0d1117`) plus a layer of **hardcoded legacy greys** scattered across components. The redesign **retires both**: it moves the base from `#0d1117` → `#0A0E14` and renames the entire token vocabulary. Deliver your token sheet using the **NEW** names, and include this **OLD→NEW mapping table** on the token frame so an implementer has a literal rename guide. Both the live `--bg-base/--text-primary/--accent-primary` system *and* the stray hardcodes must be eradicated — there is **one palette only** after this.

**A. Live tokens being renamed/recolored (`src/css/app.sass`):**
| OLD token (retire) | OLD value | NEW token | NEW value | Notes |
|---|---|---|---|---|
| `--bg-base` | `#0d1117` | `--bg-canvas` | `#0A0E14` | App background; base color shifts cooler/darker |
| *(new)* | — | `--bg-deep` | `#06090F` | Page gutters / behind-hero vignette |
| `--bg-surface` | (kept name, recolor) | `--bg-surface` | `#11161F` | Cards/tables/panels |
| `--bg-elevated` | `#21262d` | `--bg-raised` | `#161D28` | Headers, top-3, expanded rows |
| *(new)* | — | `--bg-inset` | `#0D121A` | Inputs / inset wells |
| *(new)* | — | `--bg-hover` | `#1B2430` | Row/control hover |
| *(new)* | — | `--bg-active` | `#222D3C` | Pressed/selected |
| `--text-primary` | `#e6edf3` | `--text-hi` | `#E8EEF6` | ~39 files reference `--text-primary`; primary rename target |
| `--text-secondary` | `#8b949e` | `--text-mid` | `#9AA7B8` | Labels/secondary |
| `--text-muted` | (muted grey) | `--text-low` | `#5E6B7D` | Captions/units/sample sizes |
| *(new)* | — | `--text-ghost` | `#3D4757` | Disabled, em-dash empty value |
| `--text-accent` | (accent text) | `--accent` (as text) | `#5B8DEF` | Links/active |
| `--accent-primary` | indigo `#6366f1` | `--accent` | `#5B8DEF` | Primary actions/links/focus |
| `--accent-secondary` | cyan `#22d3ee` | `--signal-cyan` | `#3DD6D0` | **Now reserved for LIVE only** |
| `--accent-warm` | amber `#f59e0b` | `--warn` | `#D29922` | **Demoted to status-only, never brand** |
| `--accent-success` | `#22c55e` | `--pos` | `#3FB950` | Success/timed |
| `--border-default` | `#30363d` | `--line-default` | `#2A3645` | Card outlines |
| `--border-muted` | (muted) | `--line-hairline` | `#1E2733` | Dominant internal divider |
| `--border-accent` | (accent) | `--line-strong` | `#3A4759` | Focused/active outlines |
| `--gradient-primary` | indigo→cyan | `--brand-gradient` | `135deg #5B8DEF→#3DD6D0` | **Now limited to 3 blessed spots** (below) |
| `--shadow-glow` | (glow) | `--border-glow` | `rgba(91,141,239,0.40)` | Focus halo / active lane only |
| `--transition-fast/normal/slow` | — | `--motion-fast/base/slow` | `120/200/320ms` | Renamed |

**B. Legacy hardcoded values to delete on sight** (these exist as raw hex in `CompositionTableView`, `CompositionsLists`, `ClassTableView`/`SpecTableView`, `DpsSetViewer`, `RunsStats`, `DataUpdaterView`, `TimeGraph` `foreColor`, `LevelStats`, plus hardcoded faction `#0078ff`/`#b30000` and gold hexes): `#252525`, `#323232`, `#a1a1a1`, `#3d3d3d`, `#333`, `#0078ff`, `#b30000`, and any literal gold. **Map every one onto a NEW token** (greys → the surface/line/text ramp by role; faction → `--faction-*`; gold → `--rank-gold` or `--q-legendary` by meaning). No raw hex anywhere in the final design.

### Color system (dark-first)

Define all of the following as CSS custom properties (NEW names). **One palette, no legacy second palette.**

**Canvas & surfaces (4-step low-contrast elevation):**
| Token | Hex | Role |
|---|---|---|
| `--bg-canvas` | `#0A0E14` | App background (near-black, slight blue cast) |
| `--bg-deep` | `#06090F` | Page gutters, behind-hero vignette |
| `--bg-surface` | `#11161F` | Cards, tables, panels |
| `--bg-raised` | `#161D28` | Elevated panels, sticky/table headers, expanded rows, top-3 slots |
| `--bg-inset` | `#0D121A` | Input fields, inset wells |
| `--bg-hover` | `#1B2430` | Row/control hover |
| `--bg-active` | `#222D3C` | Pressed/selected |

**Borders (hairlines do most of the separation work since elevation steps are subtle):**
| Token | Hex | Role |
|---|---|---|
| `--line-hairline` | `#1E2733` | 1px internal dividers (dominant separator) |
| `--line-default` | `#2A3645` | Card outlines |
| `--line-strong` | `#3A4759` | Focused/active outlines |
| `--border-glow` | `rgba(91,141,239,0.40)` | Focus halo, active lane (state only) |

**Text:**
| Token | Hex | Role |
|---|---|---|
| `--text-hi` | `#E8EEF6` | Primary |
| `--text-mid` | `#9AA7B8` | Labels, secondary |
| `--text-low` | `#5E6B7D` | Muted, captions, units, sample sizes |
| `--text-ghost` | `#3D4757` | Disabled, placeholder, em-dash empty value |
| `--text-inverse` | `#06090F` | Text on bright chips |

**Brand accent — ONE primary, a refined cool blue, never gold:**
| Token | Hex | Role |
|---|---|---|
| `--accent` | `#5B8DEF` | Primary actions, links, active nav, focus ring |
| `--accent-hover` | `#6E9DF5` | Hover/active |
| `--accent-quiet` | `rgba(91,141,239,0.12)` | Selected-row tint, focus halo |
| `--signal-cyan` | `#3DD6D0` | **Reserved exclusively for live/realtime** (monitor pulse, sparkline strokes) — never used as a link so "live" always reads instantly |
| `--brand-gradient` | `135deg, #5B8DEF → #3DD6D0` | Used ONLY on: home-hero hairline rule, the LIVE pulse, the #1 rank halo. Never on body surfaces |

**Tier ladder ramp (the one bespoke semantic ramp — "heat, not virtue"):**
S = most-spammed/dominant this week, D = niche. Used as a **3px left rail + a squared tier badge**, low saturation so 30 rows don't vibrate.
| Token | Hex | Tier |
|---|---|---|
| `--tier-s` | `#FF4D6D` | S (hottest) |
| `--tier-a` | `#FF9F1C` | A |
| `--tier-b` | `#E8C84A` | B |
| `--tier-c` | `#4ADE80` | C |
| `--tier-d` | `#5AA9E6` | D (niche) |

**Rank / medal (top-3 only, rendered as a thin glowing ring + chip, not a fill):**
`--rank-gold #F5C518`, `--rank-silver #C7D0DA`, `--rank-bronze #CD7F47`.

**Status / delta (desaturated, not candy; amber is demoted to status-only, never brand):**
| Token | Hex | Role |
|---|---|---|
| `--pos` | `#3FB950` | Timed, good success rate, rank-up ▲ |
| `--neg` | `#E5534B` | Depleted/failed, rank-down ▼ |
| `--warn` | `#D29922` | Low-data confidence, between-seasons |
| `--neutral` | `#6E7B8C` | No change |

**Faction (tokenized, replaces all hardcoded `#0078ff`/`#b30000`; used as a small tinted crest glyph or a thin split meter — never a full row background):**
`--faction-alliance #5B8DEF` (blue-tinted), `--faction-horde #C8313A` (red-tinted).

**Item quality (WoW canon, clamped for contrast on `#0A0E14`):**
`--q-poor #8B949E`, `--q-common #E8EEF6`, `--q-uncommon #4FB860`, `--q-rare #4FA3E8`, `--q-epic #B96BE0`, `--q-legendary #E8943A`.

**Score magnitude / chest "fire" ramp (used as a thin under-bar on scores and for 1–3 chest pips):**
`--fire-0 #6E7B8C` (untimed/depleted grey), `--fire-1 #3FB950` (timed), `--fire-2 #E0A33B` (2-chest), `--fire-3 #F25C54` (3-chest, hottest).

**Chart series palette (categorical — NEW; the runs/charts page needs this):**
A dedicated **8-step neutral-but-distinct** ramp for ApexCharts multi-series (region lines, affix-set series, distributions), all verified ≥ 3:1 on `#0A0E14` and visually separable for color-vision deficiency. These are **distinct from** the semantic ramps above (never reuse class/tier/faction colors for arbitrary chart series, to avoid implying meaning that isn't there):
`--series-1 #5B8DEF`, `--series-2 #3DD6D0`, `--series-3 #E8C84A`, `--series-4 #B96BE0`, `--series-5 #4FB860`, `--series-6 #FF9F1C`, `--series-7 #9AA7B8`, `--series-8 #F25C54`.
**Region→series binding is fixed and consistent across every chart:** USA `--series-1`, Europe `--series-2`, Korea `--series-3`, Taiwan `--series-4`. Affix-set / level distributions use `--series-5…8` in declaration order. Show a legend on every multi-series chart.

#### How WoW class colors coexist with the UI palette (critical — get this right)
The 13 class signature colors are saturated and several fail contrast on the near-black canvas. Resolve this with a strict rule (note: the current codebase has **no canonical class-color map** — it derives from a store array via try/catch returning the literal string `"white"`, so a real tokenized map is mandatory):

- Source class colors from **ONE canonical tokenized map** (`--class-deathknight`, `--class-mage`, etc.), generated from the backend's color field. **Add Evoker** (`#33937F`). Fallback `--text-mid`.
- For **each class, derive TWO tokens**: `--class-X` (the **raw** canon color) and `--class-X-on-dark` (a **contrast-lifted variant**, ≥ 4.5:1 on `#0A0E14`).
- **Raw class color** is used ONLY as **structure/accent**: the 3px left "energy rail" on a row, an icon ring, a bar fill, a chart series, a chip border. **Never** as body text for the legibility-risky ones.
- **`--class-X-on-dark`** is used whenever the **class/player/spec name is rendered as text**. This fixes: Priest pure-white glare (→ soft `#E8EEF6`), Rogue near-yellow `#FFF569`, Warrior tan `#C79C6E`, Druid orange `#FF7D0A`, and dark Warlock/Death Knight never producing near-black text.
- **No full-bleed class-portrait backgrounds with text on top.** Class identity = a small framed icon with a class-color ring + a class-colored name. (Portraits may survive only as a heavily darkened texture behind a hero card, with an AA-passing scrim.)

Canonical raw values to use (clamp the text variants): Hunter `#ABD473`, Warlock `#8788EE`, Priest `#FFFFFF`, Paladin `#F58CBA`, Mage `#3FC7EB`, Rogue `#FFF569`, Druid `#FF7D0A`, Shaman `#0070DD`, Warrior `#C79C6E`, Death Knight `#C41F3B`, Monk `#00FF96`, Demon Hunter `#A330C9`, Evoker `#33937F`.

#### How affix colors coexist
Affix icons are full-color raster images (served via Cloudinary). Keep them crisp at 28–32px in a **squared icon frame** with a thin etched ring. Encode **affix breakpoint** (the level it unlocks: 2/4/7/10) as a small neutral pill on the chip and, optionally, a faint severity tint that goes warmer as the breakpoint rises — but never let the affix's own art clash: the chip frame is neutral `--bg-raised` so any affix icon sits cleanly. Affixes are a **headline concept**, so surface them as visible chips (home affix marquee, context bar), never hidden in hover-only tooltips.

### Typography

Three families, separated by job. Replace Roboto.

- **UI / Body — Inter.** All labels, table cells, nav, prose, descriptions. Weights 400/500/600 only.
- **Display / Numbers — Chakra Petch** (fallback Rajdhani). A squared, slightly condensed sporty face for **all big ranked numbers** (M+ scores, keystone levels, ranks, tier letters, runs/sec, stat-card values) and uppercase **eyebrows / tier labels** (`S TIER`, `THIS WEEK'S META`, `LIVE`). Force `font-feature-settings: 'tnum'` (tabular figures) so score columns align.
- **Mono — JetBrains Mono.** Realm/region IDs, run IDs, timestamps, live-feed timecodes, mm:ss durations — the "telemetry" texture.

**Numbers in columns are always tabular** (`font-variant-numeric: tabular-nums`), regardless of family.

**Type scale (Inter unless noted; Chakra Petch for display/numeric):**
| Token | Size/LH | Weight | Use |
|---|---|---|---|
| display-hero | 56/60 | 700 (Chakra) | Home hero verdict |
| display-1 | 40/44 | 700 (Chakra) | Hero score, page-hero answer |
| display-2 | 30/34 | 700 (Chakra) | Big stat-card values |
| h1 | 24/30 | 600 | Page titles |
| h2 | 20/26 | 600 | Section/card titles |
| h3 | 16/22 | 600 | Sub-headers |
| body | 14/22 | 400/500 | Default, table cells |
| label | 12/16 | 500, +0.04em | Column headers, chips |
| micro | 11/14 | 600 uppercase, +0.06em (Chakra) | Eyebrows, tier badges, units, sample sizes |

Letter-spacing: `-0.01em` on display; `+0.04–0.06em` on uppercase eyebrows/labels; none on data. **Proper-case roles** (Tank / Healer / DPS — never "tank"/"dps"). Emphasis comes from **color + one weight step**, not size jumps. The `¯\_(ツ)_/¯` and "Impact-font amber" treatments are **removed**.

### Spacing & grid

- **12-column fluid grid.** One canonical content max-width **`--content-max: 1320px`** (kills the 1200/1300/1400 drift — footer, container, home all align). A wider **`--content-wide: 1560px`** is allowed only for the home hero and the live monitor.
- **8px spacing scale**, tokenized: `--sp-1 4`, `--sp-2 8`, `--sp-3 12`, `--sp-4 16`, `--sp-5 24`, `--sp-6 32`, `--sp-7 48`, `--sp-8 64`. No raw `<br>` ladders; no magic-pixel margins.
- Gutters: 24px desktop / 16px mobile.
- **Two intrinsic density modes** (driven by surface type, not the user): **Spectacle** zones (hero, tier boards, top-3, monitor) get 24–32px padding and large type; **Data** zones (tables, run detail, guild roster, overall tables) get 36–40px row height and 12–16px cell padding.
- **The Compact (28px row) toggle is a deliberate per-context power-user override, not a contradiction of the above:** it lives **only in the DataTable header** (a small density icon-toggle at the top-right of any DataTable), affects **only that table's row height** (40px ↔ 28px), and **persists per-table in localStorage**. It never appears on Spectacle surfaces and is absent from the Settings panel. Draw both the 40px and 28px row states.

### Elevation & shadows

Four levels, expressed mostly by the surface ramp + hairlines, **not** heavy shadow:
- **e0 canvas** — flat, no shadow.
- **e1 card** — `--bg-surface`, 1px `--line-default`, `--shadow-sm` (`0 1px 2px rgba(0,0,0,.4)`).
- **e2 raised** (header / top-3 / expanded) — `--bg-raised`, 1px `--line-strong`, `--shadow-md`, subtle 1px inner top highlight `rgba(255,255,255,0.03)`.
- **e3 overlay** (hero / floating filter bar / dialog / menu) — `--shadow-lg` (`0 8px 24px rgba(0,0,0,.5)`) + an optional faint **contextual glow** (brand gradient on hero; class color on a focused player; cyan on the live badge).

### Iconography

- One typed **`<WowIcon>` family** (spec / class / role / affix / faction / dungeon) routed through a single **Cloudinary pipeline (webp + 2× srcset)**, fixed sizes 16 / 20 / 24 / 28 / 32. Move Cloudinary account/version/quality into config; raise quality above the current over-compressed `q_50` for small icons.
- **Role and faction glyphs become tintable inline SVG** (so they pick up theme color); stop authoring them as raster PNG and stop duplicating role art in component CSS.
- **Material Icons** stay for generic UI glyphs (search, settings, chevrons, info) but in the neutral text colors.
- Dungeon art used large **only** in the home hero and tier-card backgrounds, always with a dark gradient scrim + vignette for AA text; elsewhere a 40px rounded thumb + short_name chip.

### Corner radii (low/sharp = instrument, not bubbly)

`--r-sm 4`, `--r-md 6`, `--r-lg 8`, `--r-xl 12`, `--r-pill 9999`. **Tier badges, rank chips, and keystone chips use `--r-md` (squared)** — reads esports, not pill. Pills (`--r-pill`) reserved for status dots, the LIVE badge, and selectable filter chips.

### Motion principles

Purposeful, fast, "broadcast" — concentrated on ranking moments; tables stay still. Durations `--motion-fast 120ms` / `--motion-base 200ms` / `--motion-slow 320ms`; entrances ease-out `cubic-bezier(0.16,1,0.3,1)`. **Everything gated by `prefers-reduced-motion`** (fall back to opacity-only fades).
- Tier rows stagger-fade in top→bottom (40ms stagger); cards within a row slide up 8px + fade.
- **Switching week re-sorts a board with a FLIP transition** so cards visibly slide to new positions ("the meta rearranging") — the signature delight. **FLIP is scoped ONLY to the bounded tier-board card rails** (capped sets: ~8 dungeons / 13 classes / 39 specs) where every item is mounted. **FLIP is explicitly NOT used on any DataTable** — DataTables are virtualized/paginated and windowed rows can't FLIP; their sort/filter changes use a simple cross-fade instead. Cap animated item count and disable under reduced-motion.
- Rank-lane hover: 1px lift + brighten the class-color rail.
- Top-3 medal ring: slow 3s shimmer (rank-1 only; off under reduced-motion).
- Live monitor: new run flash-inserts (rail-color flash → settle, 320ms); the cyan LIVE dot breathes (1.6s), turns `--warn` on reconnect, `--neutral` on disconnect.
- Hero/stat-card big numbers **count up once** on mount (~400ms), then static.
- Filter changes debounce and **cross-fade numbers** (160ms, no layout shift) + show **skeletons** sized to real content. **No `location.reload()` anywhere** — true SPA navigation.

---

## 3. WoW data treatment rules

**Class colors:** one tokenized map (raw + `-on-dark` variant). Raw = rails/rings/bars/series; `-on-dark` = name text. Evoker added. Never full-bleed portraits behind text.

**Spec / class / affix / dungeon icons:** unified `<WowIcon>`, Cloudinary webp + retina. Spec icon = small square with a **class-color ring**; role shown as a tiny Tank/Healer/DPS glyph badge. Affix icon = 28–32px in a neutral squared frame with a breakpoint pill (2/4/7/10) and a **richer themed tooltip** (name + severity-aware description). Dungeon = 40px rounded thumb + short_name chip (e.g. `FLOOD`, `ARAK`); large art only in hero/tier-card backgrounds with an AA scrim.

**M+ scores & the three score modes (exact definitions — bind these, do not leave ambiguous):** scores are always Chakra Petch tabular, right-aligned, with a thin **2px under-bar in the subject's tier color** whose width is computed **consistently as `score ÷ (max score in the visible column)`** in ALL three modes (the under-bar always normalizes to the column max; it is a within-column magnitude cue, independent of which mode is selected). The score-mode segmented control (in the context bar / settings) replaces the cryptic legacy Total/Percent/Mean with three **explicitly defined** modes:
- **"Total score"** — the subject's summed M+ score across the sampled runs (e.g. `12,480`). Default.
- **"Share of meta %"** — the subject's **share of total runs** within its peer group (e.g. all dungeons this week, or all DPS specs), i.e. `subject_run_count ÷ Σ(peer_group_run_count) × 100` → `18.4%`. (It is a **popularity / play-rate share by run count**, NOT a share of summed score and NOT a percent-of-#1. State this in the inline legend.)
- **"Avg per run"** — `subject_total_score ÷ subject_run_count` (e.g. `462`).

Surface the active mode in the global context bar with a **one-line inline legend that states the formula in plain words** for the selected mode, so a column never silently changes meaning. **Always show sample size** (`n` runs) as an 11px `--text-low` caption beneath any aggregate score — never a number without its N.

**Keystone levels & chests:** `+N` in a squared chip whose **border/glow intensity scales with level tier** (`+2–9` muted, `+10–14` accent-blue edge, `+15–19` magenta-ish, `+20+` a hot-red edge with a faint pulse). **Disambiguation rule (resolve the red-on-red collision):** the keystone chip's emphasis is rendered as a **1px edge stroke + outer glow on a self-contained squared chip**, using a dedicated **keystone-heat token `--key-hot #F25C54`** (the fire ramp's hottest, NOT `--tier-s`); the tier ramp's `--tier-s #FF4D6D` is reserved for the **3px left tier rail / tier badge only**. They never share a hue value and are always in different positions (left rail vs. inline chip) and different shapes (flat rail vs. glowing stroked chip), so a red rail (tier) and a hot keystone chip read as two distinct things on the same RunRow. Replace the tiny 7px scaled stars with **1–3 chest pips** (`--fire-1/2/3`); untimed/depleted = grey `--fire-0` outline pip. Tap/hover reveals clear_time vs par.

**Tier / leaderboard ranking (deterministic bucketing — do not leave as "e.g."):** "Best this week" pages render as a **Tier Board** (S/A/B/C/D heat rows) by default, with a calm sortable **Table view** behind a toggle. Tiers are **server-provided when available**; when the design must render them client-side, use this **deterministic, relative-to-#1 thresholding** on the selected score mode's value (`v`), where `top` = the #1 subject's value:
- **S:** `v ≥ 0.90 × top`
- **A:** `0.75 ≤ v/top < 0.90`
- **B:** `0.55 ≤ v/top < 0.75`
- **C:** `0.35 ≤ v/top < 0.55`
- **D:** `v/top < 0.35`

This is robust for small sets (~8 dungeons, ~3 tank specs): the #1 subject is always S; tiers can legitimately be empty. **Render an empty tier as a labeled, collapsed band** ("A TIER — none this week") in `--text-low`, never as a missing/blank row, so the ladder structure stays legible. Tiers are explicitly **"heat, not virtue"** (a small legend says so) — a "D tier" reads as "niche, not bad." **Top-3 in any board get medal styling** (gold/silver/bronze ring + chip + faint glow).

**Rank-delta vs last week (flag the data dependency):** show **rank-delta** (`▲+3` `--pos` / `▼−1` `--neg` / `– ` `--neutral`, always **arrow shape + color**, never color alone) wherever historical data exists — boards, leaderboard, monitor. **Data note for implementers:** the current store has **no per-subject last-week rank field**; delta must come from the backend adding a `previousRank`/`previousValue` field, OR be computed client-side by fetching the prior week's ranking and diffing — a real data/perf cost. **Design the delta chip with a first-class "no comparison data" state** (render the neutral `–` with a muted "new"/"—" treatment) so boards remain correct before the delta source exists; do not assume the field is present.

**Region / realm / faction:** Region promoted to a **first-class, always-visible control** in the toolbar/context bar with a small flag glyph (US/EU/KR/TW; display full names USA/Europe/Korea/Taiwan). Realm rendered in JetBrains Mono as `Name-Realm` or `realm·region` telemetry. Faction = a 12px tinted crest chip (`--faction-alliance`/`--faction-horde`); faction split visualized as a single thin labeled split meter, not a heavy two-bar block.

**Success-rate ring (full visual spec — match the detail level of FactionMeter):** a **circular progress ring**, **stroke width 3px**, diameter 36px (compact) / 48px (hero/stat-card), track in `--line-hairline`, progress arc **starting at 12 o'clock, clockwise**, arc color thresholded: **≥ 70% `--pos`, 45–69% `--warn`, < 45% `--neg`**. The percentage label sits **centered inside the ring** in Chakra Petch tabular (micro/h3 by size). Below the ring (or as a caption) the sample size `n`. When success rate is unknown, the ring renders as a full `--line-hairline` track with a centered em-dash `—` (`--text-ghost`) and a tooltip + retry, never a bare warning triangle.

**Wowhead-style tooltips (the reconciliation mechanism — resolve the ambiguity):** the app uses **two tooltip systems** today: app-owned tooltips (affixes, specs, scores) and Wowhead's third-party injected tooltips (items/talents/gear/spells, which carry quality colors and rich game data we want to keep). The directive is a **themed-frame wrapper, NOT a custom replacement** (we keep Wowhead's data):
- Build ONE **app-owned themed tooltip card** primitive (`--bg-raised`, 1px `--line-strong`, `--r-lg`, `--shadow-lg`, quality color as a **top accent bar**) and use it for all app-owned tooltips.
- For Wowhead: since Wowhead injects its own markup/CSS via a third-party script and **we do not control its internal DOM**, do **not** rebuild it. Instead **theme the thin outer frame we can reach** (the wrapping container's background, border-radius, border, and shadow → match the app tooltip card) and **accept Wowhead's inner content as-is** (its quality-colored item text already aligns with our `--q-*` palette by coincidence of WoW canon). Design both: (a) the app tooltip card, and (b) a Wowhead tooltip shown inside the matched outer frame, so they read as one family even though only one is fully ours.
- **Touch parity:** every affix/talent/score/item datum that matters must also exist **outside hover** (visible chips, truncated previews, or tap-to-expand), because injected hover tooltips are unreliable on touch.

**Realistic example values to use in mockups** (use these exact-feeling values, not lorem):
- Regions: **USA, Europe, Korea, Taiwan** (codes us/eu/kr/tw).
- Realms: **Illidan, Tarren Mill, Area 52, Stormrage, Silvermoon**.
- Dungeons: **Operation: Floodgate** (`FLOOD`), **Ara-Kara, City of Echoes** (`ARAK`), **The Dawnbreaker** (`DAWN`), **Cinderbrew Meadery** (`BREW`), **Priory of the Sacred Flame** (`PRIORY`), **The Rookery** (`ROOK`).
- Keystone levels: `+12` … `+25`, mostly `+15`–`+20`.
- Run scores ~**185–498**; spec/dungeon aggregate scores in the **thousands** (e.g. `12,480`); "Share of meta" like **18.4%**; success rate like **72.4%**.
- Item levels: **636–678**; raid progress like **8/8 M** ("8 of 8 bosses on Mythic").
- Affixes: **Tyrannical, Fortified, Xal'atath's Bargain: Ascendant, Challenger's Peril** with breakpoint pills 2/4/7/10.
- Example player: **Thortok**, Frost Mage, `(EU) Tarren Mill`, score **3,142**, ilvl **671**, `8/8 M`, 247 M+ runs.
- Live counter: **"Runs Completed This Week — 1,284,553"** (reframe the old self-undercutting tooltip honestly, e.g. "tracked from public leaderboards").

---

## 4. Global app shell

### Top toolbar / primary navigation
A sticky 56px bar, `--bg-surface`, bottom hairline. Left→right:
- **Logo** (circular) → home.
- **Primary nav** with **active-section highlight** (a 2px `--brand-gradient` underline that slides between items via layout transition). Items expose **all real destinations** and remove status-leak labels:
  - **Home**
  - **Statistics** (lands on a **Statistics overview** — see §5.4a — with a dropdown/sub-nav exposing: Dungeons, Classes, Specs, Compositions, Runs, and **Overall → Player Names, Items, Talents** — the currently-orphaned pages must be reachable)
  - **Leaderboard** (Keystone). Drop the "(beta)" / "(In progress)" / "(Not started)" labels from primary nav; the dead `/leaderboard/players` link is removed, not advertised.
  - **Live Monitor** (promote `/monitor` into the nav)
  - **Info**
- **Global search** (player/guild type-ahead) — see §4a for its full anatomy and states; kept **reachable on all breakpoints**.
- **Region selector** — first-class, always visible (flag glyph + code).

Below the toolbar, a **persistent 40px Context Bar** (the spine of the app): a hairline-bordered strip of small-caps chips reading the live scope: **REGION · WEEK** (with the 4 affix glyphs inline) **· MIN +LVL · SAMPLE n · SCORE MODE**. Each chip is **click-to-edit** (touch-friendly popover, not hover). This **replaces the hidden floating gear** and reclaims the dead 120px decorative band.

**Context Bar source-of-truth & per-page precedence (resolve the conflict explicitly):** the Context Bar holds the **global default scope** (region, week, min-level, score mode) persisted to localStorage. Pages that own **richer/divergent filters** (the Leaderboard's faction + dungeon + affix-set filters; the Runs page's region MULTI-select; the Player/Guild Period-Season selectors) follow these rules:
- **Region & Week are global-first:** editing them in the Context Bar updates the global scope and the page reacts. The **Runs page multi-region** is the one documented exception — when active, its Context Bar Region chip shows a read-only summary ("3 regions" / "EU +2") and the multi-select in the page's own control bar is the source of truth; editing the page control updates the chip, and clicking the chip opens that same multi-select.
- **Faction has no global Context Bar chip** (it is leaderboard-specific); it lives only in the Leaderboard's own filter cluster.
- **Per-page chip inclusion (which chips are shown vs. hidden/inert):**
  - **Home, Statistics (Dungeons/Classes/Specs/Compositions):** all chips active — REGION · WEEK · MIN +LVL · SAMPLE n · SCORE MODE.
  - **Statistics → Runs:** REGION (multi, see above) · WEEK · SAMPLE n. **MIN +LVL and SCORE MODE are hidden** (activity volume, not aggregate scoring).
  - **Leaderboard:** REGION · WEEK (as the affix-set/week picker) · MIN +LVL · SAMPLE n. **SCORE MODE is hidden** (individual runs, not aggregates). Faction lives in the page filter cluster, not the bar.
  - **Live Monitor:** REGION · optional MIN +LVL. **WEEK, SAMPLE n, SCORE MODE hidden** (live stream of newest runs).
  - **Lookup (Player/Guild/Run):** the Context Bar shows REGION only as a **read-only reflection** of the looked-up character's region; WEEK is replaced by the page's own Period/Season selector; MIN +LVL / SCORE MODE / SAMPLE n hidden.
  - **Info / 404 / token-sheet:** Context Bar hidden entirely.
- A chip that is hidden on a page simply does not render (no greyed-out inert chips cluttering the bar).

**Mobile (≤ 815px):** primary nav collapses into a left drawer with grouped sections (Home / Statistics / Leaderboard / Live / Info) and active-state highlight; search stays in the toolbar (compact) at >500px and inside the drawer at ≤500px (this mirrors the existing acceptable pattern — search must be *reachable* on every breakpoint, but a persistent always-visible toolbar search at ≤500px is **not** required; the drawer-search at ≤500px is the intended design). Context-bar chips wrap to a horizontally scrollable row or collapse into a single "Scope" button that opens a sheet.

### 4a. Global search (full anatomy & states — this is an interactive surface that must be drawn)
The toolbar search is a player/guild type-ahead with these states:
- **Idle (empty, focused) — "Recent players":** when the box is empty and focused, surface a **"Recently searched" list** (the app tracks recent player lookups). Each recent row = small class-color-ringed avatar/spec icon · class-colored player name · `realm·region` in JetBrains Mono mono · faction crest chip. A small "Recent" micro-label header; a per-row or list-level clear affordance.
- **Typing (loading):** debounced; show 3–4 **skeleton result rows** sized to the real result-row height (no spinner).
- **Results:** grouped **Players** and **Guilds** sections; each player result row mirrors the recent-row anatomy (class-color ring + class-colored name + mono `realm·region` + faction crest); guild result row = faction-crested guild name + `realm·region` mono + member-count micro. Keyboard arrow-navigable; Enter opens the highlighted result; the active row uses `--accent-quiet` tint + `--accent` left edge.
- **No results:** a single calm line ("No players or guilds match 'x…'. Check spelling or try realm-name.") with the neutral empty-state icon — never dev copy.
- **Error:** inline calm message + Retry.
- Popover styling: e3 overlay, `--bg-raised`, `--line-strong`, `--r-lg`, `--shadow-lg`; max-height with internal scroll; full-width sheet on mobile.

### Settings panel
Replace the tiny undiscoverable floating gear with a clearly **labeled control** ("Filters") that opens a slide-over / popover, plus the inline context-bar chips for the most-used controls. The panel contains:
- **View** segmented: Tier Board / Table.
- **Score type** segmented: **Total score / Share of meta % / Avg per run** (with the one-line plain-words legend from §3; hidden when View = Table if not applicable).
- **Min keystone level** slider 0–25 (default 10), value shown in tabular mono.
- **Weeks to show** slider 4–60 (default 6).
- **Runs per dungeon** segmented: 10 / 100 / 1k / 5k (default 5k).
- **Limit to lowest dungeon** toggle with hint "Cap runs to match the smallest sample".
- **Region** US/EU/KR/TW (also mirrored in the toolbar).
- The **Compact-row density toggle is NOT here** (it lives per-table in the DataTable header per §2 Spacing).
Show a transient "Saved" confirmation. Persist to localStorage; on change, cross-fade affected data with skeletons (no full reload, no surprise refetch only-on-close).

### Footer
`--bg-surface`, top hairline, aligned to `--content-max` (1320px — matches the container). Three zones:
- **Brand**: "BestKeystone.com" + tagline "Bringing you keystone statistics since 2018" + © year.
- **Sitemap nav** (currently missing): columns linking Statistics (Overview/Dungeons/Classes/Specs/Compositions/Runs), Overall (Names/Items/Talents), Leaderboard, Live Monitor, Info, Privacy.
- **Social + support**: Discord, GitHub, and the **Donate/PayPal** affordance (restore it). Use inline SVG glyphs, not raster.

### Page container
`--bg-canvas` page, centered `--content-max` content column, consistent `--sp-5/-6` padding (no edge-to-edge on mobile — keep `--sp-4` horizontal padding). 4px `--brand-gradient` top accent line is optional and minimal; the dead 120px band is gone.

### Global loading / empty / error states (one consistent system)
- **Loading:** shimmer **skeletons sized to the real content** (skeleton rows match the exact 36–40px run-row height → zero layout jump). No giant `size=500`/`750` spinners, no 663px blank reserves.
- **Empty:** one branded empty-state component — neutral icon + a clear, **friendly** sentence + an action (e.g. "No runs match this scope. Try lowering Min +Level."). Remove all dev-grade copy ("Well this is sad…", "if you see this… haven't loaded any data yet…", "Not fetching atm").
- **Error:** a calm card with a short message + Retry button. Never silent `console.log` failures.
- **Between-seasons:** a `--warn`-tinted banner (using the shared Banner primitive) that **names the week being shown and when fresh data is expected** ("No data for the current week yet — showing Week 142 (ended 2 days ago)."), with a Learn-more link.
- Add a real **404 catch-all** route → the 404 page (below). Unknown URLs must never render a blank layout.

---

## 5. Page-by-page redesign specs

> For every "best this week" page, the default body is a **Tier Board**; a **Table view** toggle drops to the calm sortable table. The Context Bar sits above all data pages (chip inclusion per §4).

### 5.1 Home dashboard (`/`)
- **Purpose:** Answer "what's the best dungeon this week?" at a glance + pulse of live activity + entry points into the four pillars.
- **Key content & layout (a real bento dashboard, full `--content-wide`, left-aligned scannable data — not a centered brochure):**
  1. **Hero Meta Card** (full-bleed, `--brand-gradient` hairline on top): **"#1 THIS WEEK"** dungeon shown large with its (scrimmed) art, its tier badge, a **success-rate ring** (per §3 spec), run count, and a rank-delta vs last week. Beside it an **Affix Marquee**: the 4 active affixes as chips (icon + name + breakpoint pill) — this **renders the currently-imported-but-unused CurrentAffixes data**. Below the marquee, a tiny **S-tier specs rail**. This is the screenshot moment and the literal delivery of the tagline.
  2. **Live Run Tracking** card: honest reframed counter "Runs Completed This Week — **1,284,553**" (Chakra Petch, count-up, cyan sparkline) + a **LIVE** pulse badge with real connection state. Two clearly differentiated lists: **Top Runs** and **Recent Runs** (live) using the unified RunRow, each with a clean "View all →" CTA to Leaderboard / Monitor respectively. **Fix the broken nesting** — Top Performers and Dungeon Trends are their own sibling sections, NOT slotted inside the live-tracking widget.
  3. **Top Performers** card: best spec per role (Tank/Healer/DPS, proper-cased) with relative bars and runner-up context (not just #1), each linking to Specs.
  4. **Dungeon Trends** card: "Most played" and "Highest success rate" as two compact lists with **color-coded success %** (`--pos`/`--warn`/`--neg`) and visible sample sizes. Both link to Statistics → Dungeons.
- **Visual hierarchy:** Hero (largest) → live counter → tier/spec/dungeon cards in a responsive grid.
- **Ad slot (see §8 placement rule):** on this `--content-wide` layout, the optional ad rail sits in a **right side rail OUTSIDE the bento grid's content column** (the bento occupies the main column; the ad rail is a reserved 300px gutter that only appears ≥1100px and collapses entirely below it — the bento reflows to full width with no hole).
- **Mobile:** single column; hero stacks (verdict, then affix marquee, then specs rail); cards full-width; run lists become stacked RunRow cards; no ad rail.

### 5.2 Leaderboard — Keystone (`/leaderboard/keystone`)
- **Purpose:** Browse the globally ranked best timed runs, filterable.
- **Key content & layout:**
  - **Filter cluster** (in/near the context bar): **one "Affix set / Week" picker** (this is the SAME shared week-picker component as the Context Bar WEEK chip — see §6 WeekPicker; it absorbs and retires the legacy AffixSelector) instead of the three "Affix level 2/4/7" dropdowns; a **Dungeon picker with art**; **Region**; and an exposed **Faction** filter (currently dead in code; lives here, not in the global Context Bar). Add a "This week / This season" default and a visible **data-freshness timestamp**.
  - **Ranked table** built from **RunRow**: each row = 3px class/role energy rail · **rank** (top-3 get medal ring; rank-delta chip) · faction crest · dungeon thumb+short_name (auto-hide column when a dungeon filter is active) · keystone chip + chest pips · `mm:ss` (mono) · affix glyphs · class-colored player names (linking to `/lookup/player/{region}/{realm}/{name}` — **fix the outdated link**) · score (mono + under-bar).
  - **One paginator** (replace the duplicated top-floating + bottom + native pagers). Rows-per-page 10/20/50/100/500.
  - Expanding a row reveals the full Run Detail (keystoneView) inline.
- **Visual hierarchy:** top-3 emphasized; everything else calm and dense.
- **Mobile:** RunRow collapses to a 2-line card (rank + dungeon + score on line 1; players + time + affixes on line 2); filters in a sheet.

### 5.3 Live Keystone Monitor (`/monitor`)
- **Purpose:** Real-time pulse of the newest runs worldwide + rolling aggregates.
- **Key content & layout:**
  - **Header:** a real **LIVE pulse badge** (cyan, connection-state aware) + an On/Off toggle that honestly reflects the SignalR connection.
  - **Stat cards** (4): Runs/min, Avg score, Avg level, Success % — each Chakra Petch big number + units + a cyan sparkline, computed over a **sane rolling window** (label the window, e.g. "last 60 min"). Fix the visible typos ("Runs per secound", "Not fetching atm").
  - **Live feed:** the unified RunRow list; **new runs flash-insert** (rail flash → settle) and push the list down; a "X new runs" pill lets users pause the stream. Cap to a sensible length with a clear "showing newest N".
  - Optional region/level filters via the context bar.
- **Visual hierarchy:** LIVE state + stat cards on top; feed below.
- **Ad slot:** Monitor is `--content-wide`; treat like Home — ad in a right gutter OUTSIDE the feed column, ≥1100px only, never overlapping the live feed.
- **Mobile:** stat cards 2×2; feed as stacked cards; no ad rail.
- **Note:** the broken classic-card branch and the always-true view switch are gone — there is one feed renderer.

### 5.4 Statistics — Dungeons (`/statistics/dungeons`)
- **Purpose:** Rank the season's ~8 dungeons for the selected week (core tagline page).
- **Key content & layout:**
  - A clear page header (title + current-week affix summary) — not the playful "(ish)" copy.
  - **Tier Board** default (bucketed per the §3 deterministic thresholds; empty tiers render as labeled collapsed bands): dungeons placed into S/A/B/C/D by score; each dungeon = a card with 40px art thumb, short_name, score (mono + under-bar), success-rate ring (per §3), run count (sample size), rank-delta. **Table view** toggle = sortable DataTable columns: Dungeon · Runs (with per-level breakdown, **visible not hover-only**) · Total/Share/Avg score · Success rate.
  - Expanding a dungeon reveals tabs **Best Composition / Best Class / Best Spec** + a **faction split meter**.
  - **Success rate is treated as first-class** (unify the separate `/ontimerate` fetch into the payload conceptually; if missing, show the ring's em-dash state with a tooltip + retry, not a bare warning triangle).
  - Below: a modernized **"Best week for each dungeon"** analysis — replace the dated 150px circular dungeon "dots" with legible cards (text not buried over busy art); a week-range slider + a metric segmented control (Total / Success / Avg).
- **Ad slot:** `--content-max` page; ad rail allowed in a right gutter ≥1100px, outside the tier board / table column.
- **Mobile:** tier rows become vertically stacked, horizontally scrollable card rails; expansion is full-width; no ad rail.

### 5.4a Statistics — Overview (`/statistics`, NEW landing route)
- **Purpose:** The landing target for the Statistics nav item (a new index route is being created; today the nav has no overview). A scannable hub that previews each statistics pillar and routes into it.
- **Key content & layout:** a compact **bento of preview cards**, one per leaf page, each showing a 2–4 line teaser of that page's headline data for the current scope and a "View all →" link:
  - **Dungeons** preview: top-3 dungeons as mini tier chips + success rings.
  - **Classes** preview: top class per role.
  - **Specs** preview: S-tier specs rail.
  - **Compositions** preview: the #1 team comp as role-grouped spec badges.
  - **Runs/Activity** preview: the big runs-completed number + a sparkline.
  - **Overall** preview: a small tri-link card (Player Names · Items · Talents) with one stat each.
  - Page header + the current-week affix summary at top. Reuses Card, ScorePill, success-ring, TierBoard chips, Sparkline — no new primitives.
- **Mobile:** preview cards stack single-column.

### 5.5 Statistics — Classes (`/statistics/classes`)
- **Purpose:** Rank the 13 classes by performance, split by role.
- **Key content & layout:** Tier Board grouped by role (Tank/Healer/DPS), each class = a row with class-color energy rail, framed class icon, class-colored name, score + under-bar, success % (ring or color-coded value), sample size, and a **tap-to-expand spec breakdown** (replace hover-only; remove the awkward "1-6 / 7-12" DPS chunking and `Math.random()` keys). Table view = nested but flattened-friendly DataTable: role → class → spec, with consistent percent formatting and the success-rate disclaimer moved into a single info affordance. Hardcoded tank/healer class-id logic must not leak into the UI.
- **Mobile:** role sections stack; spec breakdown expands inline.

### 5.6 Statistics — Specs (`/statistics/specs`)
- **Purpose:** Rank ~39 specs by performance for the selected week.
- **Key content & layout:** Tier Board / Table grouped by role — **and crucially show Tank/Healer/DPS, not only DPS** (the current classic view hides Healer/Tank). Each spec = class-color rail + framed spec icon (class ring) + role glyph + "Spec Class" name (e.g. *Frost Mage*) + score + under-bar + success rate (ring per §3) + sample size. Replace the styled-div "Show all" with a real button (keyboard/aria). **Render the success-rate visualization here too** (it's a dead import today — restore parity with dungeons/classes).
- **Mobile:** stacked rows; show-all toggle full-width.

### 5.7 Statistics — Compositions (`/statistics/compositions`)
- **Purpose:** Most successful 5-player group comps (+ partial Healer&Tank / DPS-only).
- **Key content & layout:** A clean **segmented control** Team / Healer & Tank / DPS + a **ClassFilter** (fix the "Damge Dealers" typo → "Damage Dealers"; actually apply class colors and spec icons to options). Each composition = a structured **role-grouped spec-badge layout** (Tank | Healer | 3 DPS), each badge = framed spec icon (class ring) + class-colored short name — **replace the hand-parsed setup string + CSS clip-path chevrons** with a clean structured layout. Show Score + under-bar, Runs + sample size, success rate. **Lift the "(only 'Amount of runs' affects this data)" caveat out of 9px footer text into a visible filter chip/notice.** One paginator. Fully tokenized (this page is the worst legacy-grey offender — bring it onto the design system; map every `#252525/#323232/#a1a1a1/#3d3d3d` per §2.0).
- **Mobile:** comp rows stack; badges wrap to two lines (Tank/Healer row, DPS row).

### 5.8 Statistics — Runs / Activity (`/statistics/runs`)
- **Purpose:** Overall activity: run volume, faction split, runs over time per region, distributions by level/week.
- **Key content & layout:** Each chart **wrapped in a titled Chart Card** with standardized ApexCharts theming (one `foreColor`, consistent axes/grid, the **§2 chart series palette** keyed to region/affix-set — USA/Europe/Korea/Taiwan fixed to `--series-1…4`). Top: big **Runs-completed** number (Chakra Petch) with a week switcher + a **faction split meter**. A coherent **control bar** for region **multi-select** (display USA/Europe/Korea/Taiwan, consistent localization — this is the multi-region exception that drives the Context Bar Region chip per §4) and time range. Charts: **Keys per hour** (fix the broken `HH:MM`→`HH:mm` time-format bug), **Keys per day**, **Success rate by keystone level**, **Runs by keystone level**, **Runs per week** (fix the overflowing affix-name data labels and dead code). Reactive series (no `Math.random` componentKey + setTimeout redraw hacks). Shared loading/empty/error per Chart Card.
- **Mobile:** charts full-width stacked; controls collapse into a sheet.

### 5.9 Overall — Player Names (`/statistics/overall/player/names`)
- **Purpose:** Fun stat: how many M+ players have a given name pattern.
- **Key content & layout:** Give it the same page-header treatment as the rest of the suite (not a bare left-aligned `<h2>`). Use the **shared DataTable**: columns **Pattern** (fix the mislabeled "Item" header) · **Count**. Clarify the two searches: relabel **"Filter results" (client)** vs **"Search database" (server)**; add a clear-to-empty affordance (don't hardcode "lock"). Keep Name-length input + "Match words only" toggle, laid out cleanly. Fix the broken `sortBy:'usersCount'` reference. Fix the "occurances" typo → "occurrences".
- **Mobile:** controls stack; table scrolls.

### 5.10 Overall — Items (`/statistics/items`)
- **Purpose:** Most-used gear items.
- **Key content & layout:** Shared DataTable: icon · Item name (with a Wowhead tooltip via the §3 themed-frame mechanism) · Slot · **Quality (color-coded via `--q-*` tokens)** · Required level · Users (sample). Add real **filters** (slot, quality, required level) beyond text search. **Remove the stacked dev-note disclaimers** ("This will be changed later…"); if a single caveat is needed, use one calm muted line. **Fix the broken empty-array data source** — the table must actually load data.
- **Mobile:** quality color as a left edge on each row; columns prioritized (icon, name, quality, users).

### 5.11 Overall — Talents (`/statistics/talents`)
- **Purpose:** Most-used talents by spec/class.
- **Key content & layout:** Shared DataTable: icon · **Talent** name (fix the "Item" header) with a **Wowhead tooltip** (§3 themed-frame) · Spec (framed icon + class-colored name) · Class · **Description shown as a truncated preview** (not the placeholder "hover me"; full text in the themed tooltip + tap-to-expand) · Users. Add class/spec filters. Merge Spec+Class into one compact spec badge where space-constrained.
- **Mobile:** description collapses; spec badge + users prioritized.

### 5.12 Lookup — Player (`/lookup/player/:region/:realm/:name`, `/lookup/player/blizzardid/:key`)
- **Purpose:** A character's complete M+ identity for a chosen season.
- **Key content & layout (replace the endless single `<br>`-spaced column with a responsive 2–3 column dashboard):**
  - **Sticky identity header:** 96–120px avatar (class-color ring, AA scrim if portrait used) + class-colored name + faction-colored guild link + `(EU) Tarren Mill` (mono realm) + external links (Armory/Raider.IO/Warcraftlogs/Raidbots). A clean **4-stat block**: Raid (`8/8 M`), Score (`3,142`), M+ Runs (`247`), Ilvl (`671`) — robust to missing fields (no fragile index-3 separator hack; missing values render em-dash). The **Period/Season selector becomes a labeled, in-flow segmented control or chip** directly under the header (kill the floating orange-accented selector; remove "(Slow)" implementation-detail copy; auto-attempt last-seen on 404). This selector — not the global Context Bar WEEK chip — is the source of truth for this page's season.
  - **Left column (Build):** Talents (inline or clean popover, fix "Hove to see" → "Hover to see"), Gear (16 items, ilvl pills, Wowhead tooltips via §3 themed-frame), Stats (primary/secondary).
  - **Right column (Activity):** Recent Runs (RunRow cards, SPA links — **no `location.reload()`**), Run-with friends (skeletons not per-cell yellow spinners), Rename history.
  - **Full-width tabbed Analytics:** consolidate the three near-identical stat tables (AffixOverview / AffixSetOverview / DungeonOverview) + KeystoneLevelOverview into **one segmented "Run Analytics" panel** using the shared DataTable; **Top Dungeon Runs** table (best run per dungeon, expandable to full Run Detail + all runs); a **Chest distribution chart** (tokenized via the §2 chart series palette, not the bespoke gold/purple/green palette). Gate heavy charts behind a tab for first paint.
  - Curate or hide the raw Blizzard achievement-statistics tree (it's low-value noise today).
  - **Empty state:** styled "No run data for this season" with guidance (not a bare `<h5>`).
- **Mobile:** single column; identity header compresses; build/activity stack; analytics tabs scrollable.

### 5.13 Lookup — Guild (`/lookup/guild/:region/:realm/:name`)
- **Purpose:** Guild at a glance: roster, performance, top performers, weekly activity.
- **Key content & layout:** Keep the clean card system (this area is closest to target). **Overview tab:** faction-crested header (tokenized faction colors) + **Update control** (the reusable DataUpdater widget per §6; fix the "0m cooldown" edge → when cooldown is 0, show "Update now", never "0m") + a grid of Quick Stats (Members / Avg Score / Active This Week / Runs This Week), Top Performers (top-5 with medal ranks, class icons, class-colored names, score + highest-key chip), Weekly Activity, and Member Stats (Class Distribution + Score Distribution + overview) — sourcing class colors from the **shared token map**, not a local hardcoded object. **Members tab:** shared DataTable — Rank (crown for GM) · Player (class-colored link) · Best Runs (small dungeon tiles) · This week · Score (**fix the duplicate `key="score"` bug** — each column needs a unique key); add **search + role/class filters**; virtualize for large guilds (no FLIP on this table per §2). Remove the dead/unfinished tabs (mythicPlus/raid placeholder, doubled WeeklyRuns, stray "Success" text).
- **Mobile:** overview cards stack; members table → cards (rank + name + score primary).

### 5.14 Lookup — Run (`/lookup/run/:run`) + reused Run Detail (three contexts)
- **Purpose:** Full breakdown of one keystone run. The Run Detail component **adapts to three contexts**; design all three:
  1. **Full page (`/lookup/run/:run`):** real chrome — a header with dungeon art (scrimmed), a breadcrumb back to Dungeon stats / Leaderboard. Full-width.
  2. **Inline table-expand:** rendered inside an expanded RunRow on Leaderboard/Monitor — no page chrome/breadcrumb, fills the expanded row width, no hardcoded `margin:15px` (inherits row padding).
  3. **Dialog:** opened from a **PlayerQuickSelect** flow (e.g. tapping a player avatar within a run/feed opens a player-context dialog that can surface the run detail). The dialog variant is an e3 overlay (`--bg-raised`, `--shadow-lg`, `--r-lg`), click-to-open (touch-safe), with a close affordance and a focus trap; max-height with internal scroll; full-screen sheet on mobile. Trigger: a player chip/avatar's click within RunRow/feed.
- **Detail card content (all three contexts):** title `Ara-Kara, City of Echoes +18`; a clean timing block ("Cleared 3 days ago in 24:31 · 5:12 under par · 17%") — `--pos` if timed, `--neg` if over; a summary trio: **Score**, **Affixes** (each with its breakpoint label 2/4/7/10, but **derive correctly from the affix's own breakpoint, not by array index**), **Group Item Level**. Then a player table: Role glyph · Name (framed spec icon + class-colored SPA link — no reload) · ILVL · **Talents shown inline/popover** (fix "Hove to see") · Trinkets (Wowhead tooltips via §3 themed-frame). Prefetch/skeleton player details instead of per-cell yellow spinners that can fail to red X.
- **Mobile:** summary trio stacks; player table → per-player cards; full-page → dialog/sheet rules above.

### 5.15 Character Not Found (player 404 state)
- **Purpose:** Graceful fallback when a character no longer exists.
- **Key content & layout:** On-theme card (not a generic grey emoji): neutral icon, "Character No Longer Exists", short explanation, primary **Go Home** + secondary **View Last Seen Version** (auto-attempt the last-seen lookup; show similar/renamed suggestions sourced from the search endpoint, styled as §4a result rows). Calm `--neg` error state if retrieval fails.

### 5.16 Info (`/info`)
- **Purpose:** Affix rotation schedule + Discord links + creator projects + rename monitor + score-checker tool.
- **Key content & layout:** Split into clearly separated sections (utility vs promotional). **Affix Schedule** as a clean tokenized table: When (Ongoing / Last week / Next week / In 3 weeks) · the 4 affix chips per week, current week highlighted with `--accent-quiet` (not `bg-green-9`); affix labels visible (not hover-only above 700px). DiscordLink, CreatorsProjects, renameMonitor, scoreChecker tool each in their own card. Robust current-week detection (don't rely on fragile deep array equality in the UI layer).
- **Mobile:** sections stack; affix schedule horizontally scrollable.

### 5.17 Classic (`/classic`) — retire into Home
- **Purpose:** The legacy/alternate full-home experience (currently unlinked). **Decision: fold its still-useful sections into the main Home dashboard and retire the standalone page** (do not keep a parallel `/classic` route). The **specific sections to reclaim** from `Index.vue` / `Default_WithTopBar` / `MyLayout` (the app map flags these as the "far richer" home with reusable section components):
  - **Top-dungeon hero** → already absorbed by §5.1 Hero Meta Card.
  - **Dungeon rankings** section → routes/links into §5.4 Dungeons tier board (Home shows the top-3 preview only).
  - **Best compositions** section → preview on Home linking to §5.7.
  - **Class rankings** section → preview on Home linking to §5.5.
  - **Faction split** widget → reuse the FactionMeter primitive on Home / Statistics.
  - **Update timers** → reuse the DataUpdater widget (§6) for "last updated" affordance on Home.
- After reclaiming, **delete** `Index.vue`, `Default_WithTopBar`, `MyLayout`, and the `/classic` route. None of the legacy styling (`#333` timer boxes, amber Impact, 70vh hero) survives — everything must use the new design system. Deliver the reclaimed sections as part of the §5.1 Home frames (no separate Classic frame needed).

### 5.18 404 (`/:catchAll`)
- **Purpose:** Catch-all for unknown URLs (currently missing — unknown URLs render a blank layout).
- **Key content & layout:** On-theme centered card: big `404` (Chakra Petch), "Page not found", a short line, and quick links back to Home / Statistics / Leaderboard / search. Calm, no kitsch.

---

## 6. Reusable component inventory

Design these once, as a library; every page composes from them. Show each in default / hover / active / focus / loading / empty / error states where applicable.

- **Card (e1/e2/e3):** `--bg-surface`/`--bg-raised`, hairline border, `--r-lg`, optional `--bg-raised` header band (12–16px, 600 weight). Hover lifts border to `--line-strong`.
- **DataTable (single primitive):** column defs (each with a **unique key** — no duplicate keys), one search-input slot, one paginator, sortable, compact (36–40px rows) + the **per-table Compact (28px) toggle in its header** (§2; persists per-table), hairline dividers (no heavy zebra; inset well on hover/expand), one branded empty state, skeleton rows matching real height. **Virtualizes long lists (guild roster); never uses FLIP** (sort/filter changes cross-fade). Replaces every bespoke table (runs, items, talents, names, class/spec, guild roster).
- **RunRow (single responsive run renderer):** 3px class/role energy rail · rank (+medal/delta) · faction crest · dungeon thumb+short_name · keystone chip + chest pips · `mm:ss` mono · affix glyphs · class-colored players · score (mono + tier under-bar). Expands in place to Run Detail (inline context); player chip click opens the PlayerQuickSelect dialog (§5.14); collapses to a 2-line card ≤ 640px. Replaces the duplicated dense/classic/leaderboard/monitor renderers and the empty `runTableItem.vue` / broken `runClassicView`.
- **TierBoard + TierRow:** S/A/B/C/D bands with squared tier badge (`--tier-*`), a "heat not virtue" legend, a horizontally-scrollable card rail per tier; **empty tiers render as labeled collapsed bands** (§3); **FLIP re-sort on week change (bounded sets only)**.
- **WeekPicker (single shared component — absorbs and retires the legacy AffixSelector):** the one week/season-week switcher used BOTH as the Context Bar WEEK chip popover AND the Leaderboard "Affix set / Week" filter. Anatomy: a scrollable list of weeks (past + upcoming), each row = week label/date range + its **4 affix glyph chips** (icon + breakpoint pill); the **current week highlighted** with `--accent-quiet`; a "This week / This season" quick toggle at top. Drives the global `SelectedPeriode`. Popover (e3) on desktop, sheet on mobile.
- **RankChip + DeltaChip:** mono rank number; top-3 medal ring; delta `▲/▼/–` (arrow + color, never color alone); DeltaChip has an explicit **"no comparison data"** muted state (§3).
- **ScorePill:** Chakra Petch tabular number + 2px tier-colored under-bar (width = score ÷ column max, all modes) + sample-size caption.
- **KeystoneChip + ChestPips:** squared `+N` chip with level-tier glow using `--key-hot` (NOT `--tier-s`, per §3 disambiguation); 1–3 fire-ramp chest pips.
- **SuccessRing:** the circular success-rate ring per §3 (3px stroke, thresholded `--pos`/`--warn`/`--neg`, centered % label, em-dash unknown state, sample-size caption).
- **WowIcon family:** spec/class/role/affix/faction/dungeon, Cloudinary webp+srcset, fixed sizes, class-color rings.
- **AffixChip:** neutral framed icon + name + breakpoint pill (2/4/7/10) + themed tooltip.
- **Stat tile / Stat card:** big Chakra Petch value + label + units + optional cyan sparkline.
- **Chart card:** titled card wrapping ApexCharts with standardized dark theme (one `foreColor`, the §2 chart series palette, consistent axes/grid, fixed `HH:mm` time format, always-on legend for multi-series).
- **Sparkline (inline 40×16):** cyan stroke, no axes, for trends in cells/tiles.
- **Selectors / Filters (one FilterSelect contract):** region (flag glyph), dungeon (art), class filter (spec icons + class colors); the week/affix-set picker is the dedicated **WeekPicker** above. **Unify the emit contract to `update:modelValue`** (kill the `regionSelector` `change` event), unify "Any/All" wording, fix the unitless `min-width:135` bug, drop the 300px dungeon width.
- **Context Bar + Chip popovers:** the always-visible scope strip (per-page chip inclusion per §4); chips open popovers (WeekPicker, region, min-level slider, score-mode segmented, sample-n read-out).
- **Nav (toolbar + drawer):** active-section gradient underline.
- **Global Search (type-ahead):** the §4a surface — recent/idle, loading-skeleton, results (Players/Guilds), no-results, error; result-row anatomy (class ring + class-colored name + mono realm·region + faction crest).
- **DataUpdater (last-updated / refresh control):** a reusable "last updated Xm ago" label + Refresh button with cooldown; when cooldown is 0 show "Update now" (never "0m"); disabled/cooling state; used on Guild overview and Home "last updated."
- **Menus / Modals / Dialogs:** e3, `--shadow-lg`, click-to-open (touch-safe), focus-trapped; includes the PlayerQuickSelect dialog (§5.14).
- **Tooltip card (app-owned) + Wowhead frame:** the §3 themed-frame system — (a) fully app-owned tooltip card (quality top-accent bar), (b) the matched outer frame wrapping Wowhead's injected content.
- **Banner / Alert (one primitive, severity variants):** info `--accent`, warn `--warn`, error `--neg`, success `--pos`. Folds BetweenSeasonsBanner + WarningRunAmount (replace its alarming 8px red border with a subtle data-confidence notice).
- **Empty state:** neutral icon + friendly sentence + action.
- **LIVE badge:** cyan breathing pill with connection states (live/reconnecting/offline).
- **FactionMeter:** thin labeled split meter (tokenized faction colors).
- **Data-confidence indicator:** subtle chip shown when sample size is low (replaces the crude red-border warning), wired into the live home too.
- **Ad slot:** reserved-height `--bg-surface` card with "Advertisement" `--text-low` micro-label and a quiet branded empty state (§8).

---

## 7. Accessibility, performance & data-density guidelines

- **Contrast:** all text ≥ AA (4.5:1) on `--bg-canvas`/surfaces; use `--class-X-on-dark` for any class-colored text; verify tier colors, status colors, quality colors, and the chart series palette. Large display numbers ≥ 3:1.
- **Color is never the only signal:** rank-delta uses arrow shape + color; success/fail uses icon + color; tiers use letter badge + color; faction uses crest + color. Safe for color-vision deficiency.
- **Touch parity:** all data currently hidden in hover-only tooltips (per-level run counts, affix descriptions, talents, spec details, region start/end times, success-rate caveats, Wowhead item/talent data) must be reachable via tap-to-expand or visible secondary text.
- **Keyboard:** full focus order, 2px `--accent` focus ring + `--accent-quiet` halo, tables arrow-navigable, click-to-open menus (not hover-only), real buttons (not styled divs), dialogs focus-trapped.
- **Motion:** honor `prefers-reduced-motion` (disable pulses/shimmer/FLIP → opacity fades). Cap animated item counts; FLIP only on bounded tier rails; virtualize long tables/feeds.
- **Performance:** webfont subsetting for Chakra Petch / Inter / JetBrains Mono (3 families — keep weights minimal: 400/500/600/700); Cloudinary webp + retina for all icons; skeletons sized to content (no layout shift); defer/scope heavy data fetches so lookup/run/guild routes don't pull statistics datasets they don't show; lazy-load chart libs behind tabs.
- **Density discipline:** Data zones stay 36–40px rows (or 28px Compact), 13–14px text, hairline dividers; Spectacle zones get the air. Always show sample size with aggregates. Validate the dense RunRow (5 class-colored names + score + affixes) at **1280px and 1440px**, and its 2-line mobile collapse, not just full-width.
- **No XSS:** never render API-provided names via `v-html` (guild/affix names) — plain text binding.

---

## 8. Deliverables & constraints for the design tool

**Produce, for each page in Section 5 (5.1–5.18, including the new 5.4a Statistics Overview; 5.17 Classic is delivered as reclaimed Home sections, no separate frame):** a **desktop** frame (1440px) and a **mobile** frame (390px); plus a **tablet** (768px) frame for Home, Leaderboard, Statistics-Dungeons, and Player Lookup. Also deliver:
- A **style/token sheet** frame: full NEW color tokens (with the class-color raw + `-on-dark` pairs, the chart series palette, and `--key-hot`), type scale, spacing scale, radii, elevation, the tier/status/faction/quality ramps, **and the §2.0 OLD→NEW token migration table** so handoff has a literal rename guide.
- A **component library** frame covering every item in Section 6, each shown in default / hover / active / focus / loading / empty / error states where applicable (explicitly include: Global Search states, WeekPicker, SuccessRing, DataUpdater, PlayerQuickSelect dialog, the Run Detail in all three contexts, the app tooltip card + Wowhead matched frame).
- **Global states** frames: skeleton loading, empty, error, and the between-seasons banner, shown in context.

**Hard constraints:**
- **Dark-theme-first** (no light mode required). Base `--bg-canvas #0A0E14`.
- **Single palette:** the NEW token system fully replaces the live `--bg-base/--text-primary/--accent-primary` set AND the legacy hardcoded greys/faction/gold hexes (§2.0). No raw hex in the design; everything maps to a NEW token.
- **Quasar/Vue-friendly:** components must map to realistic Quasar primitives (q-table, q-btn, q-select, q-menu, q-tabs, q-slider, q-toggle, ApexCharts). Avoid layouts Quasar can't ship cleanly. Low/sharp radii, hairline borders, subtle elevation — not Material's heavy shadows or floating-label fields.
- **No-kitsch / legibility rules (enforce strictly):** no fantasy skins (parchment, rivets, blackletter, glowing fantasy borders); **chrome quiet, data colored**; saturated color only when it encodes meaning; **no full-bleed class-portrait backgrounds behind text**; spectacle (big numbers, glows, FLIP, count-ups) only on ranking surfaces; analytics tables stay calm and still. Reserve `--signal-cyan` for live only and `--brand-gradient` for the three blessed spots (hero rule, LIVE pulse, #1 halo). Keep `--tier-s` (tier rail/badge) and `--key-hot` (keystone chip) visually distinct (§3).
- **Scope is always visible:** the Context Bar appears on all data pages with the per-page chip inclusion and source-of-truth precedence defined in §4 (Region/Week global-first; Runs multi-region exception; faction is leaderboard-only; chips hidden where inapplicable).
- **Ad placements (concrete rule across layouts):** one optional, reserved, graceful ad slot. A `--bg-surface` card with fixed reserved height (no layout shift), subtle "Advertisement" `--text-low` micro-label, and a quiet branded empty/placeholder state when no ad is served (never the word "test"). Placement by layout: on the two `--content-wide` pages (Home, Monitor) the ad sits in a **right side gutter OUTSIDE the wide content column**, appearing only ≥1100px and collapsing entirely below it (content reflows to full width, no hole). On `--content-max` table/stat pages (Statistics, Leaderboard) the ad sits in a **right gutter beside but never inside the data column/table**, ≥1100px only. **Never on mobile, never inside a data table or the live feed, never on Lookup/Run critical paths.** Every page must look complete with the ad slot empty.
- **Eliminate visible defects** in all mockups: no "Damge Dealers" (→ "Damage Dealers"), "Hove to see" (→ "Hover to see"), "Runs per secound" (→ "Runs per minute"/correct unit), "occurances" (→ "occurrences"), "Not fetching atm", "haven't loaded any data yet…", "Well this is sad…", dev-note disclaimers, "(beta)/(In progress)/(Not started)" labels, mislabeled "Item" headers, "(Slow)" option labels, "0m cooldown", or `¯\_(ツ)_/¯`. Replace empty values with an em-dash `—` in `--text-ghost`.

Design the whole app as **one coherent instrument**: confident where it ranks, calm where it reports, and unambiguous everywhere.