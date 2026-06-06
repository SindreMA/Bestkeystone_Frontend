# BestKeystone — Feature & Data Proposal (2026-06-06)

Synthesized from a research+audit workflow (competitor scan of raider.io, archon.gg,
subcreation, mythicstats, wowprogress, warcraftlogs + a full audit of the BestKeystone
backend data model, stat-gen pipeline, and the "top 5000 per dungeon" cap).

## Hard constraints (govern everything below)
1. **Additive only** — never modify existing data or how it's saved.
2. **Scale** — `KeystoneRuns` is hundreds of millions of rows; never scan/sort a large
   fraction at request time. Prefer incrementally-maintained precomputed aggregates.
3. **No DB backup** — no destructive ops.
4. **Schema is sealed** — `BK_Context`, all entities, and all EF migrations live in the
   compiled NuGet package `KeystoneConnector v1.0.2`. You **cannot add an EF migration
   from this repo**. New tables must be created with idempotent raw SQL
   (`CREATE TABLE IF NOT EXISTS` via `_context.Database.ExecuteSqlRaw`) — live precedent
   at `SaveQueue.cs:233`. New Hangfire jobs = one `RecurringJob.AddOrUpdate` line each in
   `HangfireSetup.SetupTasks()`.

## The 5000-cap verdict
**Don't raise the live `.Take` for statistics — replace the stats with full-corpus
precomputed aggregates.** Key findings:
- `GetRuns` (`SqlHelper.cs:1274`) pushes `Take(amount)` down as a real SQL `LIMIT`
  ordered by (keystone_level, score) per zone+periode — this is the *only* safe place to
  modestly raise the cap (e.g. 10k) **IF** a covering index on
  `(zone, periode, keystone_level, score)` exists (indexes are sealed in the package —
  confirm first).
- `Get_Stats` / `Get_Stats_wCache` / `Get_Dungeon_Leaderboard` **materialize the entire
  period into memory then sort/Take** — their DB query is *already unbounded*, so raising
  their cap only makes a full scan bigger. These must move to aggregate reads, not get
  their numbers bumped.
- The cap was historically a stand-in for "we can't aggregate the whole corpus fast." The
  fix is to actually aggregate it (incrementally, per period), making "all runs" stats
  O(small) reads that never touch the live table.

## What's stored per run (bounds what's possible without new capture)
30 columns: keystone_level, duration, completed_timestamp, faction, dungeon/zone, region,
affix_1–4 (+ **Affix5 stored but unread** — free forward-proofing), periode/season, score,
and player{1–5}_id + player{1–5}_spec. **No deaths, no gear, no per-run names, no chest
count** (chests/ontime/timer are *derived* at read time). `Members` table exists but is
never populated (per-run role granularity unavailable — role inferred from spec).

## Proposed new tables (all additive, raw-SQL, history-retaining)
- `spec_period_stats(periode, season, spec, role, level_band, region, runs, timed_runs, representation_pct, avg_level, created)`
- `dungeon_level_stats(periode, season, zone, level, base_affix, region, runs, timed_runs, avg_clear_ms, chest_bucket_counts, created)`
- `comp_level_stats(periode, season, zone, type, setup, level_band, runs, timed_runs, avg_level, max_level, created)`
- `activity_buckets(periode, region, level_band, hour_of_day, day_of_week, runs, created)`
- `faction_region_stats(periode, region, faction, zone, level_band, runs, timed_runs, avg_score, created)`
- `player_season_score(player_id, season, region, faction, overall_score, computed_at)` + `cutoff_snapshots(season, region, faction, pct_label, score_threshold, captured_at)`
- `level_population(periode/season, region, zone, level, unique_players, runs, created)`

Jobs: one `GenerateMeta` family on the existing 30-min cron (tables 1–5, current period
only, **don't prune history**); a heavier `GenerateSeasonScores` on daily/hourly
(tables 6–7, dedup by character).

## Features (ranked by value ÷ effort)

### Tier A — high value, low/med effort, data ALREADY stored (one aggregate job family unlocks all)
| # | Feature | Value | Effort | Data |
|---|---------|-------|--------|------|
| 1 | Spec & comp **representation trends** across the season (line charts) | High | M | `spec_period_stats` (keep history) |
| 2 | **Role tier lists** (separate Tank/Healer/DPS, normalized within role) | High | S | reuse `spec_period_stats` |
| 3 | **Dungeon tier list** (S/A/B/C) with week-over-week delta arrows | High | S | reuse `SuccessRates` + retain prior period |
| 4 | **"Easiest dungeon to push at +N this week"** ladder (key-level filter) | High | M | `dungeon_level_stats` |
| 5 | **Key-level bracket filter** on spec/comp stats (+7/+10/+15/+20) | High | M | level-band dimension on aggregates |
| 6 | **Enriched comps** (timed-rate + avg/max level + n) & per-dungeon comp | High | M | reuse `Compositions` + `comp_level_stats` |
| 7 | **Meta diversity index** (Gini/Shannon) per role, charted weekly | High | S | math over `spec_period_stats` |
| 10 | **Tyrannical vs Fortified** affix-impact comparison | High | M | affix dimension on `dungeon_level_stats` |
| 12 | **Time-vs-par cushion** distribution ("how close to depleting") | Med | S | chest bucket on `dungeon_level_stats` |

### Tier B — high value, more effort, still no new capture
| # | Feature | Value | Effort | Data |
|---|---------|-------|--------|------|
| 13 | **Score percentile / title-cutoff** calculator + history & projection | High | L | `player_season_score` + `cutoff_snapshots` |
| 14 | **Key-level population funnel** + personal percentile | High | L | `level_population` (dedup by character) |
| 16 | **"What should I farm next / is this key worth pushing"** planner | High | M | scoring formula + `dungeon_level_stats` |
| 15 | Weekly **"what changed" digest** (auto recap) | High | S | diffs over the above (build last) |
| 9 | **Faction & region** comparison dashboard (near-unique angle) | Med | M | `faction_region_stats` |
| 8 | **Activity heatmap** (hour/day/hours-since-reset) | Med | S | bucket `completed_timestamp` |
| 11 | **Fastest-times / speed** leaderboard per dungeon | Med | M | bounded live query *or* precomputed top-N |
| 17 | **PUG-reliability benchmark** ("what score to require at +13 healer") | Med | L | depends on `player_season_score` |

### Tier C — needs NEW data capture (new ingest subsystems)
| # | Feature | Value | Effort | Why it's heavy |
|---|---------|-------|--------|------|
| 18 | Player run history w/ **party + gear snapshots** | Med | L | party is free; gear/ilvl per run NOT stored → new armory capture, forward-only |
| 19 | **Top talents/gear/gems/enchants per spec** | Med | XL | not on the run row; new armory ingest |
| 20 | **Death & wipe analysis** per spec/dungeon | Med | XL | no deaths anywhere; needs Warcraft Logs integration |
| 21 | Dungeon **route/replay link-out** | Low | L | no report id stored; best-effort link-out only |

## Recommended build order
1. **Foundation:** `spec_period_stats` + `dungeon_level_stats` tables + `GenerateMeta`
   Hangfire job (current-period, history-retaining). This *is* the >5000 fix and unlocks
   Tier A.
2. **Tier A cluster** (trends, role tier lists, dungeon tier list, easiest-to-push ladder,
   key-level brackets, diversity index) — biggest value from already-stored data.
3. **Tier B player tools** (cutoff/percentile, population funnel, farm planner) once the
   season-score rollup exists.
4. **Tier C** only if you want to stand up new armory / Warcraft Logs ingest.
