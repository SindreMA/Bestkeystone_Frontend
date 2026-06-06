<template>
  <div class="kc-root kc-meta-diversity">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Meta · Diversity"
        title="Meta Diversity Index"
        sub="One number for how stale the meta is — Gini over spec representation. Higher = more diverse."
      />

      <!-- loading skeleton -->
      <template v-if="loading">
        <div class="div-grid">
          <KcCard :level="1"><q-skeleton height="200px" /></KcCard>
          <KcCard :level="1"><q-skeleton height="200px" /></KcCard>
        </div>
        <KcCard :level="1" class="div-note"><q-skeleton height="80px" /></KcCard>
      </template>

      <!-- empty -->
      <KcCard v-else-if="!hasData" :level="1">
        <div class="div-empty">
          <div class="div-empty__icon">◔</div>
          No diversity data for this scope yet.
        </div>
      </KcCard>

      <template v-else>
        <div class="div-grid">
          <!-- HERO: arc gauge + scope seg + delta + trend -->
          <KcCard :level="1">
            <div class="div-hero">
              <!-- custom SVG arc gauge (showpiece) -->
              <svg
                class="div-gauge"
                :width="GAUGE"
                :height="GAUGE"
                :viewBox="`0 0 ${GAUGE} ${GAUGE}`"
              >
                <defs>
                  <linearGradient id="div-gauge-grad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--kc-neg)" />
                    <stop offset="50%" stop-color="var(--kc-warn)" />
                    <stop offset="100%" stop-color="var(--kc-pos)" />
                  </linearGradient>
                </defs>
                <!-- track -->
                <path
                  :d="gaugeArc(angles.a0, angles.a1)"
                  fill="none"
                  stroke="var(--kc-bg-active)"
                  stroke-width="11"
                  stroke-linecap="round"
                />
                <!-- value arc -->
                <path
                  :d="gaugeArc(angles.a0, angles.ang)"
                  fill="none"
                  stroke="url(#div-gauge-grad)"
                  stroke-width="11"
                  stroke-linecap="round"
                />
                <!-- knob -->
                <circle
                  :cx="knob.x"
                  :cy="knob.y"
                  r="6"
                  fill="var(--kc-bg-canvas)"
                  :stroke="valueColor"
                  stroke-width="3"
                />
                <text
                  :x="GAUGE / 2"
                  :y="GAUGE / 2 - 2"
                  text-anchor="middle"
                  class="div-gauge__num kc-disp"
                >{{ value.toFixed(2) }}</text>
                <text
                  :x="GAUGE / 2"
                  :y="GAUGE / 2 + 20"
                  text-anchor="middle"
                  class="div-gauge__label"
                >DIVERSITY</text>
              </svg>

              <div class="div-hero__side min0">
                <!-- scope segmented control -->
                <div class="kc-seg">
                  <button
                    v-for="o in SCOPES"
                    :key="o"
                    class="kc-seg__btn"
                    :class="{ 'is-sel': o === scope }"
                    @click="scope = o"
                  >{{ o }}</button>
                </div>

                <!-- delta -->
                <div class="div-hero__delta">
                  <KcDeltaChip :delta="deltaRounded" />
                  <span class="text-low div-hero__delta-cap">vs last week</span>
                </div>

                <!-- gauge bar: accent -> warn -> neg gradient with a value marker -->
                <div class="div-gaugebar">
                  <div class="div-gaugebar__track">
                    <div
                      class="div-gaugebar__marker"
                      :style="{ left: `${value * 100}%`, borderColor: valueColor }"
                    />
                  </div>
                  <div class="div-gaugebar__scale">
                    <span>0.0</span><span>0.5</span><span>1.0</span>
                  </div>
                </div>

                <!-- 12-week trend area -->
                <div class="div-trend">
                  <div class="kc-eyebrow div-trend__label">12-week trend</div>
                  <KcSparkline
                    :points="trend"
                    :w="260"
                    :h="56"
                    color="var(--kc-accent)"
                    full
                    fill
                  />
                </div>
              </div>
            </div>
          </KcCard>

          <!-- BY ROLE -->
          <KcCard :level="1" header="By role" :body-style="{ padding: '0' }">
            <div class="kc-statlist">
              <div v-for="r in byRole" :key="r.role" class="div-role">
                <RoleGlyph :role="r.glyph" :size="18" color="var(--kc-text-mid)" />
                <span class="div-role__name">{{ r.label }}</span>
                <span class="div-role__bar min0">
                  <span class="div-role__track">
                    <span
                      class="div-role__fill"
                      :style="{ width: `${r.value * 100}%`, background: barColor(r.value) }"
                    />
                  </span>
                </span>
                <span class="kc-disp kc-tnum div-role__val">{{ r.value.toFixed(2) }}</span>
              </div>
            </div>
            <div v-if="roleSummary" class="div-foot">
              {{ roleSummary }}
            </div>
          </KcCard>
        </div>

        <!-- WHAT THIS MEASURES -->
        <KcCard :level="1" header="What this measures" class="div-note">
          <p class="div-note__text">
            The index is <strong>1 − Gini</strong> of spec representation within the selected
            pool. A value near <span class="kc-tnum pos">1.0</span> means runs are spread evenly
            across many specs; a value near <span class="kc-tnum neg">0.0</span> means a handful of
            specs dominate. Track the weekly line to see whether a patch widened or narrowed the meta.
          </p>
        </KcCard>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useKc } from 'components/keystone/useKc'
import type { Diversity, Role } from 'src/data/metaReference'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
import KcSparkline from 'components/keystone/KcSparkline.vue'
import RoleGlyph from 'components/keystone/RoleGlyph.vue'

/* ------------------------------------------------------------------
   Real data only. GET ${apiUrl}/Meta/diversity?periode=${SelectedPeriode}
   -> { overall, delta, byRole:{tank,healer,dps}, trend:[...] }
   The endpoint may 404 until the backend deploys — that is acceptable:
   the view shows loading -> empty/error, never fabricated numbers.
   ------------------------------------------------------------------ */
const { data } = useKc()

const d = ref<Diversity | null>(null)
const loading = ref(false)

/* hasData drives the existing "No diversity data" empty state. We require a
   well-formed payload (numeric overall + a byRole object); anything missing,
   empty, or errored falls through to the empty state. */
const hasData = computed(() => {
  const v = d.value
  return !!v && typeof v.overall === 'number' && !!v.byRole
})

function fetchData() {
  const apiUrl = data.apiUrl
  const periode = data.SelectedPeriode
  if (!apiUrl || !periode) {
    d.value = null
    return
  }
  loading.value = true
  axios
    .get(`${apiUrl}/Meta/diversity?periode=${periode}`)
    .then((r) => {
      const p = r.data
      d.value = p && typeof p.overall === 'number' ? (p as Diversity) : null
    })
    .catch((e) => {
      console.log(e)
      d.value = null
    })
    .finally(() => {
      loading.value = false
    })
}
onMounted(fetchData)
watch([() => data.SelectedPeriode, () => data.Reloaded_Timestamp], fetchData)

/* scope segmented control: Overall | Tank | Healer | DPS */
const SCOPES = ['Overall', 'Tank', 'Healer', 'DPS'] as const
type Scope = (typeof SCOPES)[number]
const scope = ref<Scope>('Overall')

const value = computed(() => {
  const v = d.value
  if (!v) return 0
  if (scope.value === 'Overall') return v.overall
  return v.byRole[scope.value.toLowerCase() as Role] ?? 0
})

/* KcDeltaChip works in integer-ish steps; index deltas are tiny (±0.04),
   so scale to "points" (×100) for a readable +4 / −2 chip. */
const deltaRounded = computed(() => Math.round((d.value?.delta ?? 0) * 100))

/* 12-week trend series for the sparkline (number[] 0..1). */
const trend = computed<number[]>(() => d.value?.trend ?? [])

/* pos / warn / neg color by threshold (mirrors the design gauge) */
const colorFor = (v: number) =>
  v >= 0.66 ? 'var(--kc-pos)' : v >= 0.45 ? 'var(--kc-warn)' : 'var(--kc-neg)'
const valueColor = computed(() => colorFor(value.value))
const barColor = (v: number) => colorFor(v)

/* by-role rows for the right card */
const ROLE_ROWS: { role: Role; label: string; glyph: string }[] = [
  { role: 'tank', label: 'Tank', glyph: 'Tank' },
  { role: 'healer', label: 'Healer', glyph: 'Healer' },
  { role: 'dps', label: 'DPS', glyph: 'DPS' },
]
const byRole = computed(() =>
  ROLE_ROWS.map((r) => ({ ...r, value: d.value?.byRole[r.role] ?? 0 })),
)

/* data-derived caption: which role pool is most diverse vs most concentrated.
   Derived from the live values (no fixed claim); hidden when data is absent. */
const roleSummary = computed(() => {
  const rows = byRole.value
  if (!d.value || !rows.length) return ''
  const most = rows.reduce((a, b) => (b.value > a.value ? b : a))
  const least = rows.reduce((a, b) => (b.value < a.value ? b : a))
  if (most.role === least.role) return ''
  return `${most.label} is the most diverse pool; ${least.label} is the most concentrated.`
})

/* ---- custom arc gauge geometry (270° sweep) ---- */
const GAUGE = 184
const R = GAUGE / 2 - 14
const angles = computed(() => {
  const a0 = Math.PI * 0.75
  const a1 = Math.PI * 2.25
  const v = Math.max(0, Math.min(1, value.value))
  return { a0, a1, ang: a0 + (a1 - a0) * v }
})
const pt = (a: number, rad = R) => ({
  x: GAUGE / 2 + Math.cos(a) * rad,
  y: GAUGE / 2 + Math.sin(a) * rad,
})
const gaugeArc = (from: number, to: number, rad = R) => {
  const p0 = pt(from, rad)
  const p1 = pt(to, rad)
  const large = to - from > Math.PI ? 1 : 0
  return `M${p0.x} ${p0.y} A${rad} ${rad} 0 ${large} 1 ${p1.x} ${p1.y}`
}
const knob = computed(() => pt(angles.value.ang))
</script>

<style scoped>
.kc-meta-diversity { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* layout: hero (wide) + by-role (narrow) */
.div-grid {
  display: grid;
  gap: var(--kc-sp-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
}
.div-grid > :first-child { grid-column: span 1; }
@media (min-width: 821px) {
  .div-grid { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); }
}

/* hero */
.div-hero { display: flex; align-items: center; gap: var(--kc-sp-6); flex-wrap: wrap; }
.div-gauge { display: block; flex: none; }
.div-gauge__num { font-size: 34px; font-weight: 700; fill: var(--kc-text-hi); }
.div-gauge__label { font-size: 11px; letter-spacing: 0.1em; fill: var(--kc-text-low); }
.div-hero__side { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: var(--kc-sp-4); }
.div-hero__delta { display: flex; align-items: center; gap: 8px; }
.div-hero__delta-cap { font-size: 12px; }

/* gauge bar (accent -> warn -> neg scale under the dial) */
.div-gaugebar { display: flex; flex-direction: column; gap: 5px; }
.div-gaugebar__track {
  position: relative; height: 7px; border-radius: 99px;
  background: linear-gradient(90deg, var(--kc-accent), var(--kc-warn) 55%, var(--kc-neg));
  border: 1px solid var(--kc-line-hairline);
}
.div-gaugebar__marker {
  position: absolute; top: 50%; width: 11px; height: 11px;
  border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--kc-bg-canvas); border: 3px solid var(--kc-accent);
  transition: left 0.6s var(--kc-ease-out), border-color var(--kc-motion-fast) ease;
}
.div-gaugebar__scale {
  display: flex; justify-content: space-between;
  font-size: 9.5px; color: var(--kc-text-low);
  font-variant-numeric: tabular-nums;
}

/* trend */
.div-trend__label { margin-bottom: 6px; }

/* by role rows */
.kc-statlist { display: flex; flex-direction: column; }
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
.div-role__track {
  position: relative; display: block; height: 7px; border-radius: 99px;
  background: var(--kc-bg-inset); overflow: hidden;
}
.div-role__fill { position: absolute; inset: 0 auto 0 0; border-radius: 99px; transition: width 0.6s var(--kc-ease-out); }
.div-role__val { font-size: 17px; color: var(--kc-text-hi); text-align: right; }

.div-foot {
  padding: 12px 16px; font-size: 11.5px; color: var(--kc-text-low);
  border-top: 1px solid var(--kc-line-hairline);
}

/* note */
.div-note { margin-top: var(--kc-sp-5); }
.div-note__text {
  margin: 0; color: var(--kc-text-mid); font-size: 13.5px;
  line-height: 1.6; max-width: 760px;
}
.div-note__text strong { color: var(--kc-text-hi); }
.pos { color: var(--kc-pos); }
.neg { color: var(--kc-neg); }
.text-low { color: var(--kc-text-low); }

/* empty */
.div-empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: 32px 20px; }
.div-empty__icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

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
}
.kc-seg__btn.is-sel {
  background: var(--kc-bg-active); color: var(--kc-text-hi);
  box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600;
}

@media (max-width: 600px) {
  .div-hero { gap: var(--kc-sp-5); justify-content: center; }
  .div-hero__side { min-width: 0; }
}
</style>
