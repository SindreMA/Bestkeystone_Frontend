<template>
    <div v-if="data && data.data" class="mainContainer">
        <q-table
      :rows="data.data"
      :columns="columns"
      :pagination="initialPagination"
      :rows-per-page-options="[]"
      row-key="name"
      dark
      :hide-bottom="true"
      color="amber"
      :visible-columns="cols"
    >
    
     <template v-slot:pagination></template>       
     <template v-slot:body="props">
        <q-tr :props="props">          
         <q-td key="name" :props="props" v-if="GetDungeonsDetails(props.colsMap.name.field(props.row))">
           <q-img class="dungeonImage" :img-style="{ transform: 'scale(1.5)' }" :src="GetDungeonsDetails(props.colsMap.name.field(props.row)).imageurl"/>
            {{GetDungeonsDetails(props.colsMap.name.field(props.row)).name}}
         </q-td>
         <q-td key="ontime_percent" :props="props" v-if="cols.includes('ontime_percent')">
            {{props.colsMap.ontime_percent.field(props.row)}}%
         </q-td>
         <q-td key="count" :props="props" v-if="cols.includes('count')">
            {{formatNr(props.row.count)}}
         </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>
    <div v-else>
                <q-skeleton style="height: 200px; min-width: 600px" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import numeral from 'numeral'

export default {
    props: ['cols','background','data','count'],
data() {
    return {
              
      columns: [
        
        {
          name: "name",
          align: "left",
          label: "Dungeon",
          field: x => x.id ? x.id : x.zone_id,
          sortable: true
        },
        {
          name: "ontime_percent",
          align: "right",
          label: "Success Rate",
          field: x => Math.round(x.ontime_percent),
        sortable: true

        },
        {
          name: "count",
          align: "right",
          label: "Count",
          field: 'count',
                    sortable: true

        },
      ]
    }
},
methods: {
  formatNr(nr) {
    return numeral(nr).format('0.0a');
  },
    GetDungeonsDetails(id) {
      
        for (let i = 0; i < this.GetDungeons.length; i++) {
            const dungeon = this.GetDungeons[i];
            if (dungeon.keystone_id === id) {
                return dungeon
            }
        }
    }
},
computed: {
    ...mapGetters(['GetDungeons']),
    baseUrl() {
      return document.location.origin
    },
    initialPagination(){
      var ob = {
        sortBy: this.data && this.data.data[0].count ? 'count' : 'ontime_percent',
        descending: true,
        rowsPerPage: this.count
      }
    return ob
    },
}
    
}
</script>

<style scouped>
.imageFormat {

  background-position: center; /* Center the image */
  background-size: cover;
} 
.dungeonImage {
  margin-right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  border: 1px grey solid;
}
</style>