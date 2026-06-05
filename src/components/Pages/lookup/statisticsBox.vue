<template>
  <div :class="{cWidth:compact,rncWidth: !compact}" v-if="details" id="Box">
    <div id="Header" class="HeaderSize4">Statistics</div>
    <div id="Container">
        <q-scroll-area style="height: 255px;">
            <q-tree dark :nodes="nodes" node-key="label"/>
        </q-scroll-area>
    </div>
  </div>
</template>

<script>
import { format } from "quasar";
const { capitalize } = format;

export default {
  props: ["details","compact"],
  methods: {
    change(input) {
      var _item = {
        label: input.name,
        id: input.id
      };

      var children = [];

      if (input.statistics) {
        for (let i = 0; i < input.statistics.length; i++) {
          const stat = input.statistics[i];

          var item = {
            label: `${stat.name}: ${stat.quantity}`
          };
          children.push(item);
        }
      }
      if (input.sub_categories) {
          for (let i = 0; i < input.sub_categories.length; i++) {
              const element = input.sub_categories[i];
              children.push(this.change(element))
          }
      }
      _item.children = children;
      return _item;
    }
  },
  computed: {
    nodes() {
      
      var categories = JSON.parse(this.details.achievements_statistics).categories
      var item = {
        id: 1,
        name: "Statistics",
        sub_categories: categories
      }
        var node = this.change(item)
        return node.children
    }
  }
};
</script>

<style scoped>
#Box {
    border: 1px solid var(--line-default);
    border-radius: var(--radius-lg);
    min-height: 255px;
    z-index: 1;
    background: var(--bg-surface);
    overflow: hidden;
}

#Header {
  background: var(--bg-raised);
  padding: 12px 16px;
  color: var(--text-hi);
  font-weight: 600;
  border-bottom: 1px solid var(--line-default);
}
#Container {
  padding: 8px;
}
</style>
