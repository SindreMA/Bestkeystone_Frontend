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
      var ls = [];

      for (let i = 0; i < this.runs.length; i++) {
        const element = this.runs[i];
        //SF.log(`Lookup->FilterRuns->For= Element: ${element.completed_timestamp} Periode:${(this.periode.start * 1000)}`,5)
        if (this.periode.start == null || this.periode.end == null) {
          ls.push(element);
        } else {
          if (
            element.time.completed_timestamp > this.periode.start * 1000 &&
            element.time.completed_timestamp < this.periode.end * 1000
          ) {
            ls.push(element);
          }
        }
      }
      return ls;
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