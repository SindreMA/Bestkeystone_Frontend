<template>
  <q-select
          class="search"
          ref="SearchBox"
          dark
          filled
          v-model="playerSearch"
          use-input
          dense
          hide-selected
          :input-debounce="500"
          options-dark
          hide-dropdown-icon
          @focus="placeholderValue = 'Enter guild or player name'"
          @blur="placeholderValue = 'Search'"
          :placeholder="placeholderValue"
          :options="searchList"
          @filter="(x,a,b) => filterFn(x,a,b)"
          popup-content-class="searchResultsBox"
        >
          <template v-slot:append>
            <q-avatar>
              <q-spinner-bars v-if="searching === true" size="25px" />
              <i v-else class="material-icons">search</i>
            </q-avatar>
          </template>
          <template v-slot:option="scope" class="HeaderFont">
            <q-item v-if="scope.opt?.class" v-bind="scope.itemProps" v-on="(scope as any).itemEvents">
              <q-item-section avatar>
                <q-img
                  spinner-size="15px"
                  spinner-color="white"
                  class="tableIcon"
                  :src="getClass(scope.opt?.class).icon_url"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label >
                  <div class="flex ">
                    <ClassTextColor :_class="scope.opt?.class">
                        {{scope.opt?.name}}
                    </ClassTextColor>
                  </div>
                </q-item-label>
                <q-item-label
                  caption
                >({{scope.opt.region.toUpperCase()}}) {{capitalize(scope.opt.realm)}}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-else v-bind="scope.itemProps" v-on="(scope as any).itemEvents">
              <q-item-section avatar>
                <CloudinaryFormat :url="`factions/${scope.opt.faction.toLowerCase()}.png`" v-slot="{ link }">
                <q-img
                  id="factionImage"
                  :src="link"
                />
              </CloudinaryFormat>
              </q-item-section>
              <q-item-section>
                <q-item-label v-html="scope.opt.name" />
                <q-item-label
                  caption
                >({{scope.opt.region.toUpperCase()}}) {{capitalize(scope.opt.realm)}}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
</template>

  <script lang="ts" setup>
  import axios from "axios";
  import SF from '../../SharedFunctions'
  import CloudinaryFormat from '../data_formatters/CloudinaryFormat.vue'
  import { useRouter } from "vue-router";
  import { useStore } from "src/store";
  import { computed, ref, watch } from "vue";
import ClassTextColor from "../containers/classTextColor.vue";

  const placeholderValue = ref("Search")
  const searchList = ref([])
  const searching = ref(false)
  const playerSearch = ref("")

  const store = useStore()
  const data = store.state.data
  const GetClasses = computed(() => data.Classes)
  const LastSearchedPlayers = computed(()=> {
    var SearchItems = JSON.parse(localStorage.getItem("SearchItems"));
    if (!SearchItems) {
      SearchItems = []
    }
    var orderLS = SF._sortBy(SearchItems,'lastSeen').reverse()
    return orderLS
  })

  const $router = useRouter()

    const to = (url) => {
            $router.push(url)
        }
      const capitalize = (s) => {
        if (typeof s !== "string") return "";
        return s.charAt(0).toUpperCase() + s.slice(1);
      }
      const getClass = (id) => {
        if (GetClasses.value) {
          for (let i = 0; i < GetClasses.value.length; i++) {
            const _class = GetClasses.value[i];
            if (_class.id == id) {
              return _class;
            }
          }
        }
      }

      const filterFn = (val, update, abort) => {
          if (val.length === 0) {
              update(() => {
                  searchList.value = LastSearchedPlayers.value
                  update(() => {}, ()=> {});
              },()=> {});
          } else if (val.length < 2) {
          abort();
          return;
        }
        else {
            update(() => {
          searchList.value = [];
          searching.value = true;
          search(val, update);
        });
        }
      }
      const search = async (terms, update) => {
        var _ls = []
        var apiUrl = data.apiUrl;
        return await axios
          .get(apiUrl + "/Search?search=" + terms)
          .then(function(x) {
            searching.value = false;
            if (x.data.length == 0) {
              _ls.push({ label: "No results...", value: "" });
            } else {
              searchList.value = x.data;
            }

            if (update) {
              update(() => {});
            }

            return x.data;
          })
          .catch(function(ex) {
            searching.value = false;
            console.log(ex);
          });
      }

      const SearchItemClicked = (item) => {
          SaveSearchItem(item)
        if (item?.class) {
          $router.push(
            `/lookup/player/${item.region}/${item.realm}/${item.name}`
          );
        } else {
          $router.push(
            `/lookup/guild/${item.region}/${item.realm}/${item.name}`
          );
        }
      }

      const SaveSearchItem = (item) => {
        var ls = LastSearchedPlayers.value;
        var _player = ls.filter(x=> {return x.realm == item.realm && x.region == item.region && x.name == item.name})
        if (_player[0]) {
          if (_player[0].seen) {
            _player[0].seen++;
            _player[0].lastSeen = new Date().getTime()
          }
        }else {
          item.seen = 1;
          item.lastSeen = new Date().getTime()
          ls.push(item)
        }
        localStorage.setItem("SearchItems", JSON.stringify(ls));
      }

    watch(playerSearch, ()=> {
        SearchItemClicked(playerSearch.value);
      })
  </script>

  <style scouped>
  .search {
    min-width: min(250px, 20vw);
    max-width: 350px;
  }
  .bar {
    background-color: #181818;
    position: sticky;
    top: 0px;
    z-index: 100001;
  }
  .searchResultsBox {
      max-height: 300px;
  }
  .tableIcon {
    width: 30px;
  }
  </style>
