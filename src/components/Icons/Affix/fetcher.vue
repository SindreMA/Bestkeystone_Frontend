<template>
    <div :style="`${fill && `width: 100%;`}`">
        <slot :data="GetAffixDetails(id)"/>
    </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  props: ['id', 'fill'],
  computed: {
    ...mapGetters(["GetAffixes"]),
  },
  methods: {
    GetAffixDetails(id) {
      if (this.GetAffixes) {
       for (let i = 0; i < this.GetAffixes.length; i++) {
        const affix = this.GetAffixes[i];
        if (affix.id == id) {
          return affix;
        }
       }
      }
    }
  }
};
</script>
