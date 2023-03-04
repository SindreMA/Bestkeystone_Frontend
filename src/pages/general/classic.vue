<template>
  <div class="HeaderFont text-center">
    <h4>Check your classic login queue</h4>
    <div class="flex justify-around">
      <q-btn-toggle
        v-model="region"
        :options="[
                  {label: 'EU', value: 'eu'},
                  {label: 'US', value: 'us'},
                  {label: 'TW', value: 'tw'},
                  {label: 'KR', value: 'kr'}
                  ]"
      />
      <q-input label="Realm" filled v-model="realm" dark />
      <q-input label="name" filled v-model="name" dark />
    </div>
    <br />
    <q-separator dark />
    <div v-if="data[0]">
      <div>Latest result</div>
      <strong>
        <h2>{{data[0].queue}}</h2>
      </strong>
      <div>{{data[0].status}}</div>
      <br />
    </div>
    <q-separator dark />
    <br />
    <div class="flex">
      <q-linear-progress
        dark
        stripe
        rounded
        style="height: 20px;flex: 1 1 auto;"
        :value="refreshTime"
        color="orange"
        class="q-mt-sm col-10"
      />
      <q-checkbox v-model="refresh" style="flex: 0 0 auto;" class="col-2" />
    </div>

    <br />
    <q-separator dark />
    <br />
    <q-table dark :rows="data" :columns="columns" />

    <h6>(You need to use a custom reporter app local on ur computer to track this)</h6>
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import SF from "../../SharedFunctions";
import axios from "axios";

export default {
  data() {
    return {
      region: "",
      realm: "",
      name: "",
      data: null,
      refresh: true,
      refreshTime: 100,
      columns: [
        {
          name: "timestamp",
          label: "Scanned",
          field: row => this.moment(row.timestamp).fromNow(),
          align: "center",
          sortable: true,
        },
        {
          name: "region",
          label: "Region",
          field: row => row.region,
          align: "center",
          sortable: true
        },
        {
          name: "realm",
          label: "Realm",
          field: row => row.realm,
          align: "center",          
          sortable: true,
        },
        {
          name: "name",
          label: "Name",
          field: row => row.name,
          align: "center",          
          sortable: true,
        },
        {
          name: "status",
          label: "Status",
          field: row => row.status,
          align: "center",          
          sortable: true,
        },
        {
          name: "queue",
          label: "Queue",
          field: row => row.queue,
          align: "center",          
          sortable: true,
        }
      ]
    };
  },
  watch: {
    region() {
      this.fetchData();
    },
    realm() {
      this.fetchData();
    },
    name() {
      this.fetchData();
    }
  },
  methods: {
    moment(time) {
      return SF.GetMoment(time);
    },
    Timer(i) {
      var vm = this;
      if (this.refresh) {
      if (i > 0) {
          setTimeout(() => {
            vm.refreshTime = i / 100;
            vm.Timer(i - 1);
          }, 1000);
        
      } else {
        this.fetchData();
      }
      } else {
          setTimeout(() => {
              this.Timer(i)
          }, 1000);
      }
    },
    fetchData() {
      var vm = this;
      axios
        .get(
          `https://api2.bestkeystone.com/api/ClassicQueue/get?realm=${
            vm.realm
          }&region=${vm.region}&name=${
            vm.name
          }&timestamp=${new Date().getTime()}`
        )
        .then(x => {
          vm.data = x.data;
        })
        .then(x => {
          vm.Timer(100);
        });
    }
  },
  watch: {
      refresh () {
          //this.Timer(this.refreshTime)
      }
  },
  created() {
    this.fetchData();
  }
};
</script>
<style>
h2 {
  margin: 5px;
}
</style>