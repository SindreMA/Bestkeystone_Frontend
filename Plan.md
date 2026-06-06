# BestKeystone — "Keystone Console" Redesign Plan

Branch: `redesign/keystone-console-home` (a test branch — not merged to `main`).

Source of truth for the design: `REDESIGN_PROMPT.md` (the full brief) and the
Claude Design handoff bundle (HTML/React prototype of the "Keystone Console"
visual system). This file records the *plan and decisions*; `progress.md` tracks
live status.

---

## Goal

Replace the live app's "GitHub-dark" look with the **Keystone Console** system:
a calm, premium, dark-first analytics instrument. One dark palette only, the
data carries the color, chrome stays quiet. Must ship in Quasar (Vue 3) +
ApexCharts.

## Scope (as agreed, in two stages)

1. **Home redesign** (done first, scoped) — rebuild the Home dashboard to the new
   design, wired to the real live data sources, scoped under `.kc-root` so it
   couldn't disturb the rest of the app.
2. **Full token migration** (the "hundreds of files" job) — retire the live
   `--bg-base` / `--text-primary` / `--accent-primary` token system app-wide,
   rename to the new vocabulary, and eradicate legacy hardcoded hex so there is
   **one palette only**.

## The palette (NEW → values)

Defined globally in `src/css/app.sass :root` and mirrored (prefixed `--kc-*`,
scoped) in `src/css/keystone-tokens.css` for the Home components.

| Group | Tokens |
|---|---|
| Canvas/surfaces | `--bg-canvas #0A0E14`, `--bg-deep`, `--bg-surface #11161F`, `--bg-raised #161D28`, `--bg-inset`, `--bg-hover`, `--bg-active` |
| Lines | `--line-hairline #1E2733`, `--line-default #2A3645`, `--line-strong #3A4759`, `--border-glow` |
| Text | `--text-hi #E8EEF6`, `--text-mid #9AA7B8`, `--text-low #5E6B7D`, `--text-ghost`, `--text-inverse` |
| Accent | `--accent #5B8DEF` (+hover/quiet), `--signal-cyan #3DD6D0` (LIVE only), `--brand-gradient` |
| Tier ramp | `--tier-s..d` |
| Status | `--pos #3FB950`, `--neg #E5534B`, `--warn #D29922`, `--neutral` |
| Faction | `--faction-alliance #5B8DEF`, `--faction-horde #C8313A` |
| Fire/chest | `--fire-0..3`, `--key-hot` |
| Item quality | `--q-poor..legendary` |
| Chart series | `--series-1..8` (region-bound) |
| Rank | `--rank-gold/silver/bronze` |
| Scale | `--sp-1..8`, `--r-*`/`--radius-*`, `--shadow-sm/md/lg/glow`, `--motion-*`/`--transition-*`, fonts |

## OLD → NEW token migration map (the rename that was applied)

| OLD (retired) | NEW |
|---|---|
| `--bg-base` | `--bg-canvas` |
| `--bg-elevated` | `--bg-raised` |
| `--border-default` | `--line-default` |
| `--border-muted` | `--line-hairline` |
| `--border-accent` | `--line-strong` |
| `--text-primary` | `--text-hi` |
| `--text-secondary` | `--text-mid` |
| `--text-muted` | `--text-low` |
| `--text-accent` | `--accent` |
| `--accent-primary` | `--accent` |
| `--accent-secondary` | `--signal-cyan` |
| `--accent-warm` | `--warn` |
| `--accent-success` | `--pos` |
| `--gradient-primary` | `--brand-gradient` |
| `--shadow-glow` | *kept* (semantic state shadow) |
| `--transition-*`, `--radius-*` | *kept* (functional aliases, recolored/renumbered values) |

Legacy hardcoded hex (`#0d1117`, `#6366f1`, `#0078ff`/`#b30000` faction,
`#f59e0b`, `#22c55e`, grey `#252525`/`#323232`/`#292929`, gold, etc.) were mapped
onto the token ramp by role.

## Execution strategy (phased, every phase build-verified)

- **Phase 0 — Home redesign.** New `.kc-root`-scoped components under
  `src/components/keystone/`, wired to the real Vuex store / fetchers / SignalR.
- **Phase A — Global palette swap.** Rewrite `app.sass :root` to the new palette
  + Quasar SCSS brand vars; alias old names → new values so every un-migrated
  component reskins instantly with zero risk.
- **Phase B1 — Deterministic rename.** `sed` rewrite of every `var(--old)`
  reference → new name across all of `src` (safe 1:1, never touches definitions).
- **Phase B2 — Hardcoded-hex migration.** One agent per affected file (verified
  workflow). Rule: CSS/SVG contexts → `var(--token)`; ApexCharts/canvas contexts →
  the **literal new hex** (canvas can't read CSS vars); rgba tints rebased to the
  new channels.
- **Phase C — Cleanup.** Remove the old-name aliases (one palette only), grep to
  prove zero old tokens / zero legacy hex remain, final build.
- **Phase D — Global shell.** Redesign the app-wide chrome: Keystone Console top
  nav (sliding brand-gradient underline), the persistent **Context Bar**
  (Region · Week · Min · Score, wired to the store), and a 3-zone footer. Verified
  live in a browser with real data.

## Key decisions / non-obvious choices

- **Real data, not mock.** The Home cards reuse the exact data the old home used
  (`QuickRunsView` API + SignalR, `SpecDataFetcher`, dungeon count/success
  fetchers, `CurrentAffixes`). Cloudinary art/icons used instead of the
  prototype's CSS placeholders.
- **Charts keep raw hex.** ApexCharts renders to canvas and cannot resolve CSS
  custom properties, so chart color config uses literal new hex values.
- **Kept functional aliases.** `--radius-*`, `--transition-*`, `--shadow-glow`
  retained (renaming them is churn with no visual benefit / easing-keyword risk).
- **Pre-existing store bugs left alone** (flagged, not fixed on a test branch):
  `GetClasses` getter reads `state.GetClasses` (always `[]`); the
  `SaveDungeon*Data` mutations `.push([data])` (nested). The Home components are
  defensive against both.

## Verification

- `quasar build` green after every phase.
- Two adversarial review workflows (Home correctness/fidelity/blast-radius; and
  per-file migration verification).
- Final grep: 0 old-token references, 0 legacy hex outside the token-definition
  files.

## Not done (possible follow-ups)

- Per-page visual QA of the deeper routes (lookup/player, guild, leaderboard,
  runs charts) — home + statistics/dungeons verified live.
- Optional: unify the `--kc-*` Home tokens onto the now-global unprefixed tokens.
- Optional (pre-existing, out of scope): the two shared store bugs above.
