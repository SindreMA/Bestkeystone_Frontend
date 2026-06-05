<template>

  <div v-if="matches.length > 0" class="MatchContainer">
    <div>There are multiple matches for this character path</div>

    <div v-for="(item, index) in matches" :key="index" class="matchItem flex wrap">
      [{{ item.player.blizzardId }}]
      <ClassTextColor :_class="item.player.class" >
        {{ item.player.name }},
        {{Specs.find(x=> x.id == item.lastSeenSpec)?.name}}
        {{Classes.find(x=> x.id == item.player.class)?.name}},
      </ClassTextColor> last seen {{ moment.utc(item.lastRun.completedTimestamp).local().fromNow() }}
       - <a :href="`/lookup/player/blizzardId/${item.player.blizzardId}`">View character</a>
    </div>
  </div>
</template>

<script lang="ts" setup >
import moment from 'moment';
import ClassTextColor from 'src/components/containers/classTextColor.vue';
import { useStore } from 'src/store';
import { MatchResult } from 'src/types/lookup';
import {computed, toRefs} from 'vue';

const props = defineProps({
  matches: {
    type: Array<MatchResult>,
    required: true
  }
});

const { matches } = toRefs(props);

const store = useStore();
const data = store.state.data;

const Classes = computed(() => data.Classes);
const Specs = computed(() => data.Specs);

</script>

<style scoped>
.MatchContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 25px 0;
  min-height: 80px;
  padding: 10px 30px;
  text-align: center;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--line-default);
  color: var(--text-hi);
}
.matchItem {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  margin: 15px 0;
  min-height: 50px;
  padding: 2px 20px;
  text-align: center;
  background: var(--bg-raised);
  border-radius: var(--radius-md);
  border: 1px solid var(--line-default);
  transition: border-color var(--transition-fast);
}
.matchItem:hover {
  border-color: var(--line-strong);
}
a {
  color: var(--accent);
  transition: color var(--transition-fast);
}
a:hover {
  color: var(--text-hi);
}
</style>
