<template>
  <div>
    <slot :score="PlayerScore" :raidProgress="raidProgress" :runs="filterdRuns" />
  </div>
</template>

<script>
import SF from "../../../SharedFunctions";

export default {
  props: ["runs", "periode", "data"],
  methods: {
    shortName(name) {
      var newName = "";
      for (let i = 0; i < name.split(" ").length; i++) {
        const word = name.split(" ")[i];
        if (word.toLowerCase() !== "the") {
          newName += word.charAt(0);
        }
        
      }
      return newName;
    }
  },
  computed: {
    filterdRuns() {
      // Filter runs to the selected season's window. periode.season carries the
      // real millisecond start/end (the same object whose .id drives the API
      // season param). The legacy periode.start/end were unreliable — they could
      // resolve to ~now and hide EVERY run ("No runs for this season"). If no
      // season window is available, show all runs rather than hide them.
      const season = this.periode && this.periode.season;
      if (season && season.start != null && season.end != null) {
        return this.runs.filter(
          (el) =>
            el.time &&
            el.time.completed_timestamp > season.start &&
            el.time.completed_timestamp < season.end
        );
      }
      return [...this.runs];
    },
    raidProgress() {
      if (!this.data) return;
      var expansions = this.data.encounters;
      var lastestExpansion = expansions[expansions.length - 1];
      if (!lastestExpansion) return;
      var latestRaid =
        lastestExpansion?.raids[lastestExpansion?.raids.length - 1];
      if (!latestRaid) return;
      var latestDifficulty = SF._sortBy(latestRaid.difficulties,x=> x.difficulty.order).reverse()[0];
      if (!latestDifficulty) return;
      if (!latestRaid.raid?.bosses) return;

      var shortRaidName = this.shortName(latestRaid.raid.name);

      return {
        value: `${latestDifficulty.bosses.length}/${
          latestRaid.raid.bosses.length
        } ${this.shortName(latestDifficulty.difficulty.name)}`,
        name: shortRaidName
      };
    },
    PlayerScore() {
      var dungeonRuns = SF.groupBy(this.filterdRuns, x => {
        return x.zone.id;
      });
      var score = 0;

      for (const p in dungeonRuns) {
        if (dungeonRuns.hasOwnProperty(p)) {
          const runs = dungeonRuns[p];
          var bestrun = null;

          for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            if (bestrun == null || bestrun.score < run.score) {
              bestrun = run;
            }
          }

          score += bestrun.score;
        }
      }

      return score;
    }
  }
};
</script>