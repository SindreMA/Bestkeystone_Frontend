<template>
    <container title="Keystone friends" v-if="data.length > 0">
         <q-table
         ref="table"
         v-if="data"
      :rows="data"
      :columns="Columns"
      :pagination.sync="paginationControl"
      row-key="id"
      dense
        :rows-per-page-options="[]"

      dark
      color="amber"
      @update:pagination=" fetchDetails($event)"

    >
    <template v-slot:body="props">
        <q-tr :props="props" >
          <q-td key="role">
            <roleIcon :tooltip="true" class="rowIcon" :spec="props.row.spec"/>
          </q-td>
          <template v-if="!props.row.name && !props.row?.fetching">
              <q-td key="name" >
            <classTextColor :spec="props.row.spec">{{props.row.id}}</classTextColor>
          </q-td>
          </template>
          <template v-else-if="props.row.name">
              <q-td key="name">
                <classTextColor :spec="props.row.spec">
                    <router-link @click="reload()" :to="`/lookup/player/${region}/${props.row.realm}/${props.row.name}`">{{props.row.name}}</router-link>
                </classTextColor>
            </q-td>
          </template>
           <template v-else-if="props.row?.fetching">
              <q-td key="name">
                  <q-spinner-bars color="yellow" size="15px"/>
                <q-tooltip>fetching info from api</q-tooltip>
            </q-td>
          </template>


          <q-td key="sharedruns" >
              <div class="flex justify-end">
                  {{Math.round(props.row.sharedRunsAmount)}}
              </div>

          </q-td>
          <q-td key="teamscore">
              <div class="flex justify-end">
                  {{Math.round(props.row.sharedScore * 10 ) / 10}}
              </div>

          </q-td>

        <template v-if="props.row.score != undefined && !props.row?.fetching">
             <q-td key="score">
              <div class="flex justify-end">
                  {{Math.round(props.row.score * 10 ) / 10}}
              </div>

          </q-td>
          </template>
                     <template v-else-if="props.row?.fetching">
              <q-td key="score">
                  <div class="flex justify-end">
                      <q-spinner-bars color="yellow" size="15px"/>
                <q-tooltip>fetching info from api</q-tooltip>
                  </div>
            </q-td>
          </template>
                               <template v-else>
              <q-td key="score">
                  <div class="flex justify-end">
                     0
                  </div>
            </q-td>
          </template>

        </q-tr>
    </template>
    </q-table>
    </container>
</template>

<script>
import container from './wideContainerBox.vue'
import SF from '../../../SharedFunctions'
import roleIcon from '../../Icons/Role.vue'
import classTextColor from '../../containers/classTextColor.vue'
import axios from 'axios'

export default {
    props: ['runs', 'mainPlayerId','region'],
    components: {
        container,
        roleIcon,
        classTextColor
    },
    data() {
        return {
            data: null,
            paginationControl: {
                rowsPerPage: 6,
                page: 1,
                descending: true,
                sortBy: "sharedRunsAmount",
            },
      Columns: [
        {
          name: "role",
          label: "Role",
          align: "left"
        },
         {
          name: "name",
          label: "Name",
          align: "left"
        },
        {
          name: "sharedRunsAmount",
          label: "Shared Runs",
          field: "sharedRunsAmount",
          align: "right"
        },
        {
          name: "sharedScore",
          label: "Team Score",
          sortable: true,
          field: 'sharedScore',
          align: "right"
        },
        {
          name: "score",
          label: "Score in current season",
          sortable: true,
          field: 'score',
          align: "right"
        }
      ]
        }
    },

    methods: {
        fetchDetails(newPage) {
            var apiUrl = this.$store.state.data.apiUrl;
            var vm = this
            var ls = SF._sortBy(this.data,newPage.sortBy)
            if (newPage.descending) ls = ls.reverse();
            var o = (newPage.page - 1)  * newPage.rowsPerPage
            var offset =  SF.from(ls,o)
            for (let i = 0; i < newPage.rowsPerPage; i++) {
                const player = offset[i];
                if (player) {
                  player.fetching = true
                  axios.get(`${apiUrl}/Player/blizzard_id?id=${player.id}&region=${this.region}`).then(x=> {
                      player.name = x.data.name
                      player.realm = x.data.realm
                      player.score = x.data.score
                      player.details = x.data
                      player.fetching = false
                      vm.data = [...vm.data]
                  }).catch(x=> {
                      player.detailsFailed = true
                      player.fetching = false
                  })
                }
            }
        },
        getSpec(runs, id) {
            var specs = []
            runs.forEach(run => {
                run.players.forEach(player => {
                    if (player.id == id) {
                        var s = specs.filter(x=> x.spec == player.spec)
                        if (s.length != 0) {
                            s[0].count++;
                        } else {
                            specs.push({
                                spec: player.spec,
                                count: 1
                            })
                        }
                    }
                });
            });

            var spec = specs.sort().reverse()[0].spec
            return spec
        },
        reload() {
      setTimeout(() => {
        location.reload(true);
      }, 250);
    },
    },


    computed: {
        activeRows() {
            var table = this.$refs.table
            if (table) {
                var rows = table.computedRows
                if (rows) {
                    return rows
                }
            }

            return null
        },
        playedWithPlayers () {
            var rtnls = []
            if (this.runs) {
                var ls = []
                this.runs.forEach(run => {
                    run.players.forEach(player => {
                        if (player.id != this.mainPlayerId) {
                            var copyRun = {...run}
                        copyRun.distinctId = player.id
                        ls.push(copyRun)
                        }

                    });
                });
                var players = SF.groupBy(ls,x=> x.distinctId)

                for (const key in players) {
                    if (players.hasOwnProperty(key)) {
                        const playerRuns = players[key];
                        var data = {
                        id: key,
                        spec: this.getSpec(playerRuns, key),
                        sharedRunsAmount: playerRuns.length + (key * 0.00000000001),
                        sharedScore: SF.GetScore(playerRuns)+ (key * 0.00000000001),
                        }
                    rtnls.push(data);
                    }
                }

            }
            return rtnls
        }
    },
    watch: {
        runs() {
            this.data = this.playedWithPlayers
        }
    },
    created() {
        this.data = this.playedWithPlayers
    },

}
</script>

<style scoped>
a {
  color: inherit;
}
.rowIcon {
    width: 25px;
    height: 25px;
}
</style>
