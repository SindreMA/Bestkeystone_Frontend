<template>
  <div class="kc-root kc-meta-tierlists">
    <div class="kc-container">
      <KcPageHeader
        eyebrow="Meta · Tier Lists"
        title="Role Tier Lists"
        :sub="headerSub"
      >
        <template #right>
          <span class="kc-tl__hint">share is within-role · all key levels</span>
        </template>
      </KcPageHeader>

      <!-- loaded -->
      <template v-if="!loading && hasData">
        <div class="kc-tl__cols">
          <KcCard v-for="role in scopedRoles" :key="role.role" :level="1" :body-style="{ padding: '0' }">
            <template #header>
              <span class="kc-tl__cardtitle">
                <RoleGlyph :role="roleGlyph(role.role)" :size="18" color="var(--kc-text-mid)" />
                <span>{{ role.label }}</span>
              </span>
            </template>
            <template #headerRight>
              <span class="kc-eyebrow">{{ role.specs.length }} specs</span>
            </template>

            <div class="kc-tl__list">
              <div v-for="s in role.specs" :key="s.id" class="kc-tl__row">
                <KcTierBadge :tier="s.tier" />

                <span
                  class="kc-tl__icon"
                  :style="{ background: iconBg(s.cls), color: clsColor(s.cls, true), borderColor: iconBorder(s.cls) }"
                  :title="`${s.name} ${clsName(s.cls)}`"
                >{{ iconAbbr(s.cls) }}</span>

                <span class="kc-tl__name min0">
                  <span class="kc-tl__spec" :style="{ color: clsColor(s.cls, true) }">{{ s.name }}</span>
                  <span class="kc-tl__cls">{{ clsName(s.cls) }}</span>
                </span>

                <span class="kc-tl__bar min0">
                  <span class="kc-tl__track">
                    <span
                      class="kc-tl__fill"
                      :style="{ width: `${Math.max(2, (s.pct / role.maxPct) * 100)}%`, background: clsColor(s.cls) }"
                    />
                  </span>
                  <span class="kc-tnum kc-tl__pct">{{ s.pct.toFixed(1) }}%</span>
                </span>

                <KcSuccessRing :pct="s.timed * 100" :size="30" :caption="false" />

                <KcDeltaChip :delta="s.delta" />
              </div>
            </div>
          </KcCard>
        </div>

        <p class="kc-tl__foot">
          Representation = share of runs within the role · ring = timed-rate · ▲▼ = week-over-week.
        </p>
      </template>

      <!-- loading skeleton -->
      <div v-else-if="loading" class="kc-tl__cols">
        <KcCard v-for="n in 3" :key="n" :level="1" :body-style="{ padding: '0' }">
          <template #header>
            <q-skeleton type="text" width="90px" />
          </template>
          <div class="kc-tl__list">
            <div v-for="i in 6" :key="i" class="kc-tl__row kc-tl__row--skel">
              <q-skeleton type="QChip" width="28px" height="28px" />
              <q-skeleton type="rect" width="26px" height="26px" />
              <q-skeleton type="text" width="100%" />
              <q-skeleton type="text" width="100%" />
              <q-skeleton type="QAvatar" size="30px" />
              <q-skeleton type="text" width="40px" />
            </div>
          </div>
        </KcCard>
      </div>

      <!-- error (endpoint unavailable) -->
      <div v-else-if="error" class="kc-tl__empty">
        <div class="kc-tl__empty-icon">⚠</div>
        <div>Tier data is unavailable right now.</div>
      </div>

      <!-- empty -->
      <div v-else class="kc-tl__empty">
        <div class="kc-tl__empty-icon">◌</div>
        <div>No tier data for this scope yet.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useKc } from 'components/keystone/useKc'
import KcPageHeader from 'components/layout/KcPageHeader.vue'
import KcCard from 'components/keystone/KcCard.vue'
import KcTierBadge from 'components/keystone/KcTierBadge.vue'
import KcDeltaChip from 'components/keystone/KcDeltaChip.vue'
import KcSuccessRing from 'components/keystone/KcSuccessRing.vue'
import RoleGlyph from 'components/keystone/RoleGlyph.vue'
import { type Role, type RoleGroup } from 'src/data/metaReference'

/* -- class colour map (canon + on-dark) ported from design class-colors.css.
      The live app has no --class-* tokens; keep these local to the page. -- */
const CLASS_COLOR: Record<string, string> = {
  deathknight: '#C41F3B', demonhunter: '#A330C9', druid: '#FF7D0A', evoker: '#33937F',
  hunter: '#ABD473', mage: '#3FC7EB', monk: '#00FF96', paladin: '#F58CBA',
  priest: '#FFFFFF', rogue: '#FFF569', shaman: '#0070DD', warlock: '#8788EE', warrior: '#C79C6E',
}
const CLASS_COLOR_ON_DARK: Record<string, string> = {
  deathknight: '#E5566B', demonhunter: '#C264E0', druid: '#FF9D45', evoker: '#4FBBA3',
  hunter: '#BBE085', mage: '#5BD4F2', monk: '#2BFFAC', paladin: '#F8A6CC',
  priest: '#E8EEF6', rogue: '#F2EA6E', shaman: '#3E8BE8', warlock: '#9FA0F2', warrior: '#D8B488',
}
const CLASS_NAME: Record<string, string> = {
  deathknight: 'Death Knight', demonhunter: 'Demon Hunter', druid: 'Druid', evoker: 'Evoker',
  hunter: 'Hunter', mage: 'Mage', monk: 'Monk', paladin: 'Paladin', priest: 'Priest',
  rogue: 'Rogue', shaman: 'Shaman', warlock: 'Warlock', warrior: 'Warrior',
}
const clsColor = (cls: string, onDark = false) =>
  (onDark ? CLASS_COLOR_ON_DARK[cls] : CLASS_COLOR[cls]) || 'var(--kc-text-mid)'
const clsName = (cls: string) => CLASS_NAME[cls] || cls

/* spec icon (no class PNG assets in this project) → tinted initial tile,
   matching the design's HAS_ICON=false fallback treatment. */
const iconAbbr = (cls: string) => (cls === 'evoker' ? 'EV' : cls.slice(0, 2).toUpperCase())
const iconBg = (cls: string) => `color-mix(in oklab, ${clsColor(cls)} 28%, var(--kc-bg-inset))`
const iconBorder = (cls: string) => `color-mix(in oklab, ${clsColor(cls)} 50%, transparent)`

/* RoleGlyph in this project expects Tank | Healer | DPS. */
const roleGlyph = (role: Role) => (role === 'dps' ? 'DPS' : role === 'tank' ? 'Tank' : 'Healer')

/* ── data source: real /Meta/tierlists endpoint ──────────────────────────────
   Periode is global scope (Vuex). The backend currently only generates the
   "all" level band (per-band snapshots aren't computed yet), so we always
   request 'all' — the page must not break if SelectedLevelBand is set to a
   non-"all" value on another page. We NEVER fabricate stats: the page shows
   loading → data | empty | error, and nothing in between. */
const { data } = useKc()

const loading = ref(false)
const error = ref(false)
const roles = ref<RoleGroup[]>([])

async function fetchTierlists() {
  if (!data.apiUrl || !data.SelectedPeriode) {
    roles.value = []
    return
  }
  loading.value = true
  error.value = false
  const periode = data.SelectedPeriode
  try {
    const r = await axios.get(`${data.apiUrl}/Meta/tierlists?periode=${periode}&levelBand=all`)
    // guard against a stale response arriving after the periode changed again
    if (periode !== data.SelectedPeriode) return
    const payload = (r.data && r.data.roles) || []
    roles.value = Array.isArray(payload) ? payload : []
  } catch (e) {
    console.log(e)
    roles.value = []
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchTierlists)
watch(() => data.SelectedPeriode, fetchTierlists)

interface ScopedRole extends RoleGroup {
  maxPct: number
}

const scopedRoles = computed<ScopedRole[]>(() =>
  roles.value.map((r) => ({
    ...r,
    maxPct: Math.max(...r.specs.map((s) => s.pct), 1),
  })),
)

const hasData = computed(() => scopedRoles.value.some((r) => r.specs.length > 0))

const headerSub = computed(() => 'Best spec per role at all key levels · this week')
</script>

<style scoped>
.kc-meta-tierlists { padding: var(--kc-sp-6) 0; }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }
@media (max-width: 600px) { .kc-container { padding-left: 12px; padding-right: 12px; } }

/* header right cluster */
.kc-tl__hint { font-family: var(--kc-font-mono); font-size: 11px; color: var(--kc-text-low); white-space: nowrap; }

/* segmented level control */
.kc-seg { display: inline-flex; background: var(--kc-bg-inset); border-radius: var(--kc-r-md); border: 1px solid var(--kc-line-default); padding: 2px; gap: 2px; }
.kc-seg__btn { height: 28px; padding: 0 12px; border-radius: var(--kc-r-sm); border: none; cursor: pointer; font: 500 12px/1 var(--kc-font-ui); background: transparent; color: var(--kc-text-mid); white-space: nowrap; transition: color var(--kc-motion-fast) ease, background var(--kc-motion-fast) ease; }
.kc-seg__btn:hover { color: var(--kc-text-hi); }
.kc-seg__btn.is-sel { background: var(--kc-bg-active); color: var(--kc-text-hi); box-shadow: inset 0 0 0 1px var(--kc-line-strong); font-weight: 600; }

/* three-column auto-fit grid; stacks on mobile */
.kc-tl__cols {
  display: grid;
  gap: var(--kc-sp-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

/* card header bits */
.kc-tl__cardtitle { display: inline-flex; align-items: center; gap: 8px; }

/* row */
.kc-tl__list { display: flex; flex-direction: column; }
.kc-tl__row {
  display: grid;
  align-items: center;
  gap: var(--kc-sp-2);
  grid-template-columns: 28px 26px minmax(0, 1.4fr) minmax(56px, 1fr) 30px 44px;
  min-height: 44px;
  padding: 0 var(--kc-sp-4);
  border-bottom: 1px solid var(--kc-line-hairline);
  transition: background var(--kc-motion-fast) ease;
}
.kc-tl__row:last-child { border-bottom: 0; }
.kc-tl__row:hover { background: var(--kc-bg-hover); }
.kc-tl__row--skel { pointer-events: none; }

/* inline spec icon (tinted initial tile) */
.kc-tl__icon {
  width: 26px; height: 26px; flex-shrink: 0;
  display: inline-grid; place-items: center;
  border-radius: var(--kc-r-sm);
  border: 1px solid var(--kc-line-hairline);
  font-family: var(--kc-font-display); font-weight: 700; font-size: 11px;
}

/* name */
.kc-tl__name { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
.kc-tl__spec { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-tl__cls { color: var(--kc-text-low); font-size: 10.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* within-role bar */
.kc-tl__bar { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; }
.kc-tl__track { position: relative; display: block; height: 6px; border-radius: 99px; background: var(--kc-bg-inset); overflow: hidden; }
.kc-tl__fill { position: absolute; inset: 0 auto 0 0; height: 100%; border-radius: 99px; opacity: 0.9; transition: width 0.6s var(--kc-ease-out); }
.kc-tl__pct { font-size: 12px; color: var(--kc-text-mid); min-width: 42px; text-align: right; }

/* footnote */
.kc-tl__foot { margin-top: var(--kc-sp-5); font-family: var(--kc-font-mono); font-size: 11px; color: var(--kc-text-low); }

/* empty state */
.kc-tl__empty { text-align: center; color: var(--kc-text-mid); font-size: 13px; padding: var(--kc-sp-7) var(--kc-sp-5); }
.kc-tl__empty-icon { font-size: 22px; opacity: 0.5; margin-bottom: 8px; }

.min0 { min-width: 0; }

/* mobile: drop the bar column for breathing room */
@media (max-width: 520px) {
  .kc-tl__row { grid-template-columns: 28px 26px minmax(90px, 1fr) 30px auto; }
  .kc-tl__bar { display: none; }
}
</style>
