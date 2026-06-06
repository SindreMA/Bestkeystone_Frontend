<template>
  <div class="kc-root kc-player">
    <div class="kc-container">
      <PlayerFormatter
        v-if="periode"
        :periode="periode"
        :runs="data.run_data.runs"
        :data="details"
        v-slot="{ score, runs, raidProgress }"
      >
        <OtherMatches :matches="data.otherMatches" />

        <!-- identity header -->
        <div class="kc-card kc-card--l2 kc-ph">
          <q-img class="kc-ph__avatar" :src="details?.avatar_url ?? FALLBACK_AVATAR" />
          <div class="kc-ph__id">
            <div class="kc-disp kc-ph__name">
              <classTextColor :_class="details?.character_class">{{ details?.name ?? data.run_data.name }}</classTextColor>
            </div>
            <div class="kc-mono kc-ph__meta">
              <span>[{{ ((details?.region ?? data.run_data.region) || '').toUpperCase() }}] {{ details?.realm ?? data.run_data.realm }}</span>
              <router-link
                v-if="details?.guild"
                class="kc-ph__guild"
                :to="`/lookup/guild/${details.guild.region}/${details.guild.realm}/${details.guild.name}`"
              >
                <factionTextColor :faction="details.guild.faction">&lt;{{ details.guild.name }}&gt;</factionTextColor>
              </router-link>
            </div>
            <div class="kc-ph__links">
              <a v-for="l in playerLinks" :key="l.description" class="kc-ph__link" :href="l.link" target="_blank" rel="noopener" :title="l.description">
                <img :src="l.image" :alt="l.description" />
              </a>
            </div>
          </div>
          <div class="kc-ph__stats">
            <div v-for="s in headerStats(score, runs, raidProgress)" :key="s.k" class="kc-ph__stat">
              <div class="kc-eyebrow">{{ s.k }}</div>
              <div class="kc-disp kc-tnum kc-ph__stat-val">{{ s.v }}</div>
            </div>
          </div>
        </div>

        <!-- account / update strip — moved to the top -->
        <div class="kc-player__update"><updateBox @update="setDetails" :character="data.run_data" :compact="compact" :details="details" /></div>

        <!-- every content card in one balanced masonry so the columns fill evenly (no blank space) -->
        <div class="kc-player__masonry">
            <KcCard v-if="details" :level="1" header="Talents"><TalentLine :spec="details.active_spec" :talents="details.talents" /></KcCard>

            <KcCard v-if="details && details.equipment" :level="1" header="Gear">
              <template #headerRight><span class="kc-mono kc-pg-mut">{{ details.equipped_item_level }} / {{ details.average_item_level }}</span></template>
              <div class="kc-gear">
                <a
                  v-for="(item, i) in details.equipment"
                  :key="i"
                  class="kc-gear__cell"
                  :href="`http://www.wowhead.com/item=${item.id}`"
                  :data-wowhead="wowhead(item)"
                  target="_blank"
                  rel="noopener"
                >
                  <span class="kc-mono kc-gear__ilvl">{{ item.item_level }}</span>
                  <CloudinaryFormat :url="item.iconUrl ?? ('https://wow.zamimg.com/images/wow/icons/medium/' + item.icon + '.jpg')" :size="40" v-slot="{ link }">
                    <img class="kc-gear__icon" :src="link" />
                  </CloudinaryFormat>
                </a>
              </div>
            </KcCard>

            <KcCard v-if="statRows.length" :level="1" header="Stats">
              <div class="kc-stats">
                <div v-for="(s, i) in statRows" :key="i" class="kc-stats__row">
                  <span class="kc-stats__k">{{ s.k }}</span>
                  <span class="kc-mono kc-tnum kc-stats__v">{{ s.v }}</span>
                </div>
              </div>
            </KcCard>
            <KcCard :level="1" header="Recent runs" :body-style="{ padding: '0' }">
              <template v-if="recentRuns(runs).length">
                <KcRunRow v-for="(r, i) in recentRuns(runs)" :key="r.id ?? i" :run="r" />
              </template>
              <div v-else class="kc-player__empty">No runs for this season.</div>
            </KcCard>

            <KcCard :level="1" header="By dungeon" :body-style="{ padding: '0' }">
              <div v-for="d in byDungeon(runs)" :key="d.zone" class="kc-player__dgnrow">
                <KcDungeonThumb :keystone-id="d.zone" :size="28" />
                <span class="kc-player__dgnname">{{ dungeonName(d.zone) }}</span>
                <span class="kc-tnum kc-player__dgnruns">{{ d.count }} runs</span>
                <span class="kc-disp kc-tnum kc-player__dgnbest">{{ Math.round(d.best) }}</span>
                <KcSuccessRing :pct="d.success" :size="30" :caption="false" />
              </div>
              <div v-if="!byDungeon(runs).length" class="kc-player__empty">No runs for this season.</div>
            </KcCard>

            <template v-if="data.run_data.runs.length > 0">
              <AffixOverview :runs="data.run_data.runs" />
              <AffixSetOverview :runs="data.run_data.runs" />
              <keystoneFriends :region="region ?? data.run_data.region" :runs="data.run_data.runs" :mainPlayerId="data.run_data.player_id" />
              <DungeonOverview :runs="data.run_data.runs" />
              <ChestChart :runs="data.run_data.runs" />
              <renameBox v-if="data.run_data.renames && data.run_data.renames.length" :renames="data.run_data.renames" />
            </template>
        </div>
      </PlayerFormatter>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, toRefs } from "vue";
import SF from "src/SharedFunctions";
import { useKc } from "components/keystone/useKc";
import KcCard from "components/keystone/KcCard.vue";
import KcRunRow from "components/keystone/KcRunRow.vue";
import KcDungeonThumb from "components/keystone/KcDungeonThumb.vue";
import KcSuccessRing from "components/keystone/KcSuccessRing.vue";
import classTextColor from "components/containers/classTextColor.vue";
import factionTextColor from "components/containers/factionTextColor.vue";
import OtherMatches from "components/Pages/lookup/OtherMatches.vue";
import PlayerFormatter from "../../data_formatters/Lookup/PlayerFormatter.vue";
import TalentLine from "../../../components/lookup/player/v2/TalentLine.vue";
import DungeonOverview from "components/lookup/player/DungeonOverview.vue";
import AffixOverview from "components/lookup/player/AffixOverview.vue";
import AffixSetOverview from "components/lookup/player/AffixSetOverview.vue";
import keystoneFriends from "components/Pages/lookup/keystoneFriends.vue";
import numeral from "numeral";
import { format } from "quasar";
import CloudinaryFormat from "components/data_formatters/CloudinaryFormat.vue";
import ChestChart from "components/ListViews/ChestsChart.vue";
import renameBox from "components/Pages/lookup/renameBox.vue";
import updateBox from "components/Pages/lookup/updateBox.vue";

const props = defineProps({
  data: { type: Object, required: true },
  region: { type: String, required: true },
  realm: { type: String, required: true },
  player: { type: String, required: true },
  compact: { type: Boolean, default: false },
  periode: { type: Object, required: true },
});
const { data, region, realm, player, compact, periode } = toRefs(props);
const details = ref(data.value.details);
const setDetails = (x: any) => { details.value = x; };

const { capitalize } = format;
const short = (n: number, f = "0.0a") => numeral(n).format(f);

/* gear → wowhead tooltip string */
const wowhead = (item: any) => {
  let r = `item=${item.id}&ilvl=${item.item_level}`;
  if (item.enchantment) r += `&ench=${item.enchantment}`;
  if (item.socket) r += `&gems=${item.socket}`;
  if (item.transmog) r += `&transmog=${item.transmog}`;
  if (item.bonus_list) r += `&bonus=${String(item.bonus_list).replace(/,/g, ":")}`;
  return r;
};

/* stats → clean key/value rows (primary + secondary + versatility) */
const statRows = computed(() => {
  const st: any = details.value?.statistics;
  if (!st) return [];
  const rows: { k: string; v: string }[] = [];
  for (const s of (st.stats || []).filter((x: any) => x.effective != 0)) rows.push({ k: capitalize(s.name), v: short(s.effective) });
  for (const s of (st.stats || []).filter((x: any) => x.rating != 0 && x.rating_bonus != 0 && x.value != 0 && !x.name.includes("ranged") && !x.name.includes("spell")))
    rows.push({ k: capitalize(s.name.replace("melee_crit", "Critical Strike").replace("melee_haste", "Haste")), v: short(s.rating) });
  if (st.versatility != null) rows.push({ k: "Versatility", v: short(st.versatility) });
  return rows;
});

const { dungeonByKeystoneId, fmtNum } = useKc();
const FALLBACK_AVATAR = "https://res.cloudinary.com/djpcbbeqx/image/upload/v1664310107/external/wow.png";

const playerLinks = computed(() => {
  const r = details.value?.region ?? data.value.run_data.region;
  const rl = details.value?.realm ?? data.value.run_data.realm;
  const n = details.value?.name ?? data.value.run_data.name;
  return [
    { image: SF.FormatToCloudinary(`external/wow.png`), description: "View on Armory", link: `https://www.worldofwarcraft.com/en-${(r || '').replace('eu', 'gb')}/character/${rl}/${n}` },
    { image: SF.FormatToCloudinary(`external/rio.png`), description: "View on Raider.IO", link: `https://raider.io/characters/${r}/${rl}/${n}` },
    { image: SF.FormatToCloudinary(`external/warcraftlogs.png`), description: "View on Warcraftlogs", link: `https://www.warcraftlogs.com/character/${r}/${rl}/${n}` },
    { image: SF.FormatToCloudinary(`external/raidbots.png`), description: "Simulate on Raidbots", link: `https://www.raidbots.com/simbot/quick?region=${r}&realm=${rl}&name=${n}` },
  ];
});

const headerStats = (score: number, runs: any[], raidProgress: any) => [
  { k: "Score", v: fmtNum(Math.round(score ?? data.value.run_data.score ?? 0)) },
  { k: "M+ Runs", v: `${(runs || []).length}x` },
  { k: "iLvl", v: details.value?.equipped_item_level ?? "—" },
  { k: "Raid", v: raidProgress ? `${raidProgress.name}: ${raidProgress.value}` : "—" },
];

const recentRuns = (runs: any[]) =>
  [...(runs || [])].sort((a, b) => (b?.time?.completed_timestamp ?? 0) - (a?.time?.completed_timestamp ?? 0)).slice(0, 8);

const byDungeon = (runs: any[]) => {
  const groups: Record<string, any> = {};
  for (const r of runs || []) {
    const z = r?.zone?.id;
    if (z == null) continue;
    if (!groups[z]) groups[z] = { zone: z, count: 0, best: 0, ontime: 0 };
    groups[z].count++;
    groups[z].best = Math.max(groups[z].best, r.score ?? 0);
    if (r?.time?.ontime) groups[z].ontime++;
  }
  return Object.values(groups)
    .map((g: any) => ({ ...g, success: g.count ? Math.round((g.ontime / g.count) * 100) : null }))
    .sort((a: any, b: any) => b.best - a.best);
};

const dungeonName = (zone: number) => dungeonByKeystoneId(zone)?.name || dungeonByKeystoneId(zone)?.short_name || `Zone ${zone}`;
</script>

<style scoped>
.kc-player { padding: var(--kc-sp-5) 0 var(--kc-sp-6); }
.kc-container { width: 100%; max-width: var(--kc-content-wide); margin: 0 auto; padding: 0 24px; }

/* header */
.kc-ph { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 20px; }
.kc-ph__avatar { width: 96px; height: 96px; border-radius: var(--kc-r-lg); flex: none; border: 1px solid var(--kc-line-strong); }
.kc-ph__id { min-width: 0; flex: 1; }
.kc-ph__name { font-size: 30px; font-weight: 700; }
.kc-ph__meta { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--kc-text-low); margin-top: 4px; flex-wrap: wrap; }
.kc-ph__guild { text-decoration: none; }
.kc-ph__links { display: flex; gap: 8px; margin-top: 10px; }
.kc-ph__link { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: var(--kc-r-sm); background: var(--kc-bg-inset); border: 1px solid var(--kc-line-hairline); }
.kc-ph__link:hover { border-color: var(--kc-line-strong); }
.kc-ph__link img { width: 18px; height: 18px; border-radius: 50%; }
.kc-ph__stats { display: flex; gap: 28px; flex-wrap: wrap; }
.kc-ph__stat { min-width: 56px; }
.kc-ph__stat-val { font-size: 24px; font-weight: 700; color: var(--kc-text-hi); margin-top: 4px; max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* grid */
/* masonry: pack the build + activity cards into 2 balanced columns so a short
   side (e.g. no season runs) doesn't leave a tall empty gap */
.kc-player__masonry { columns: 2; column-gap: var(--kc-sp-5); column-fill: balance; margin-top: var(--kc-sp-5); }
.kc-player__masonry > * { break-inside: avoid; margin-bottom: var(--kc-sp-5); }
@media (max-width: 920px) { .kc-player__masonry { columns: 1; } }
.kc-player__empty { padding: 20px; text-align: center; color: var(--kc-text-mid); font-size: 13px; }

.kc-player__dgnrow { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto auto; align-items: center; gap: 12px; padding: 8px 16px; border-bottom: 1px solid var(--kc-line-hairline); }
.kc-player__dgnname { font-size: 13px; font-weight: 600; color: var(--kc-text-hi); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kc-player__dgnruns { font-size: 12px; color: var(--kc-text-mid); text-align: right; }
.kc-player__dgnbest { font-size: 14px; font-weight: 700; color: var(--kc-text-hi); text-align: right; }

.kc-player__update { margin-top: var(--kc-sp-5); }

/* gear */
.kc-pg-mut { font-size: 12px; color: var(--kc-text-mid); }
.kc-gear { display: flex; flex-wrap: wrap; gap: 8px; }
.kc-gear__cell { display: flex; flex-direction: column; align-items: center; gap: 3px; text-decoration: none; }
.kc-gear__ilvl { font-size: 10px; color: var(--kc-text-mid); background: var(--kc-bg-inset); border-radius: var(--kc-r-pill); padding: 1px 6px; }
.kc-gear__icon { width: 40px; height: 40px; border-radius: var(--kc-r-sm); border: 1px solid var(--kc-line-default); display: block; transition: transform var(--kc-motion-fast), border-color var(--kc-motion-fast); }
.kc-gear__cell:hover .kc-gear__icon { border-color: var(--kc-line-strong); transform: scale(1.08); }

/* stats */
.kc-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 20px; }
.kc-stats__row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid var(--kc-line-hairline); min-width: 0; }
.kc-stats__k { font-size: 12px; color: var(--kc-text-mid); }
.kc-stats__v { font-size: 12px; color: var(--kc-text-hi); }

/* card primitive (reused inline for the header) */
.kc-card { background: var(--kc-bg-surface); border: 1px solid var(--kc-line-default); border-radius: var(--kc-r-lg); box-shadow: var(--kc-shadow-sm); }
.kc-card--l2 { background: var(--kc-bg-raised); border-color: var(--kc-line-strong); box-shadow: var(--kc-shadow-md); }

/* phone tuning */
@media (max-width: 600px) { .kc-container { padding-left: 0; padding-right: 0; } }
@media (max-width: 520px) { .kc-stats { grid-template-columns: 1fr; } }
@media (max-width: 480px) {
  .kc-player__dgnrow { gap: 8px; padding: 8px 12px; }
  .kc-player__dgnruns { display: none; }
}
</style>
