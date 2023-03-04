import axios from 'axios'
import { colors } from 'quasar'
const { rgbToHex } = colors

const state = {

    state: {
        apiUrl: 'https://bestkeystone.com/api',
        settings: {
            viewMode: null,
            region: null,
            score_type: 'mean',
            limitbylowestdungeon: false,
            min_keystonelevel: 10,
            max_runs: 5000,
            WeeksToShow: 6,
        },

        notifications: [],
        //Colors are sent from backend now
        Class_Colors: {
            HUNTER: [0.67, 0.83, 0.45],
            WARLOCK: [0.53, 0.53, 0.93],
            PRIEST: [1.0, 1.0, 1.0],
            PALADIN: [0.96, 0.55, 0.73],
            MAGE: [0.25, 0.78, 0.92],
            ROGUE: [1.0, 0.96, 0.41],
            DRUID: [1.0, 0.49, 0.04],
            SHAMAN: [0.0, 0.44, 0.87],
            WARRIOR: [0.78, 0.61, 0.43],
            DEATHKNIGHT: [0.77, 0.12, 0.23],
            MONK: [0.0, 1.0, 0.59],
            DEMONHUNTER: [0.64, 0.19, 0.79]
        },
        Reloaded_Timestamp: null,
        Seasons: null,
        Selected: null,
        SelectedAffixSet: null,
        RIOData: null,
        Regions: ['eu', 'us', 'kr', 'tw'],
        Realms: [],
        Affixes: null,
        Periodes: null,
        SelectedPeriode: null,
        WorstPlayerRank: null,
        Dungeons: null,
        Dungeons_Data: null,

        Dungeon_Count_Data: null,
        Dungeon_SuccessRate_Data: null,

        Classes: null,

        Specs: null,
        Spec_Data: null,
        Spec_Dungeon_Data: [],

        AffixSchedule: null,
        AffixDetails: [],

        DiscordLinks: null,
        CreatorsProjects: null
    },

    mutations: {
        SaveReloadTimestamp(state) {
            state.Reloaded_Timestamp = Date.now();
        },
        SaveAffixSchedule(state, data) {
            state.AffixSchedule = data
        },
        SaveDiscordLinks(state, data) {
            state.DiscordLinks = data
        },
        AddAffixDetails(state, data) {
            if (state.AffixDetails.filter(x => { return x.id == data.id }).length == 0) {
                state.AffixDetails.push(data)
            }
        },
        SaveSelectedAffixSet(state, data) {
            state.SelectedAffixSet = data
        },
        SaveRIOData(state, data) {
            state.RIOData = data
        },
        SaveRealms(state, data) {
            data.forEach(element => {
                state.Realms.push(element)
            });
        },
        SaveAffixes(state, data) {
            state.Affixes = data
        },
        SaveCreatorsProjects(state, data) {
            state.CreatorsProjects = data
        },
        SavePeriodes(state, data) {
            state.Periodes = data
            state.SelectedPeriode = state.Periodes[0].id
        },
        ChangeSelectedPeriode(state, data) {
            state.SelectedPeriode = data
        },
        seenNotification(state, data) {
            var val = 1;
            if (data.value) {
                val = data.value
            }
            var notifiers = state.notifications.filter(x => { return x.notification == data.key })
            if (notifiers.length != 0) {
                notifiers[0].times_seen += val
                if (!notifiers[0].expire) {
                    notifiers[0].expire = data.expire
                }
            } else {
                state.notifications.push({
                    times_seen: val,
                    notification: data.key,
                    expire: data.expire
                })
            }
            localStorage.setItem("notifications", JSON.stringify(state.notifications))
        },
        fetchNotificationStats(state) {
            if (localStorage.getItem("notifications")) {
                state.notifications = JSON.parse(localStorage.getItem("notifications"))
            }
        },
        SaveSettings(state, data) {
            state.settings[data.setting] = data.value
            localStorage.setItem("settings", JSON.stringify(state.settings))
        },
        GetCacheSettings(state) {
            if (localStorage.getItem("settings")) {
                state.settings = JSON.parse(localStorage.getItem("settings"))
            }
        },
        SaveDungeonData(state, data) {
            state.Dungeons_Data = {
                created: Date.now(),
                data: data,
                periode: state.SelectedPeriode
            }
        },
        SaveDungeons(state, data) {
            state.Dungeons = data
        },
        SaveDungeonSuccessRateData(state, data) {
            if (!state.Dungeon_SuccessRate_Data) {
                state.Dungeon_SuccessRate_Data = [data]
            } else {
                state.Dungeon_SuccessRate_Data.push([data])
            }

        },
        SaveDungeonCountData(state, data) {
            if (!state.Dungeon_Count_Data) {
                state.Dungeon_Count_Data = [data]
            } else {
                state.Dungeon_Count_Data.push([data])
            }

        },
        SaveClasses(state, data) {
            state.Classes = data;
        },
        SaveSpecs(state, data) {
            state.Specs = data;
        },
        SaveSeasons(state, data) {
            state.Seasons = data;
        },
        SaveWorstPlayerRank(state, data) {
            state.WorstPlayerRank = data
        },
        SaveSpecData(state, data) {
            if (data.dungeon_id) {

                state.Spec_Dungeon_Data.push({
                    dungeon: data.dungeon_id,
                    created: Date.now(),
                    data: data.data,
                    periode: state.SelectedPeriode
                })

                /*
                console.log("test2");

                for (let i = 0; i < state.Dungeons_Data.data.length; i++) {
                  const dungeon = state.Dungeons_Data.data[i];

                  if (dungeon.id == data.dungeon_id) {
                    dungeon.Spec_Data = {
                      created: Date.now(),
                      data: data.data,
                      periode: state.SelectedPeriode
                    }
                  }
                }
                */
            } else {
                state.Spec_Data = {
                    created: Date.now(),
                    data: data,
                    periode: state.SelectedPeriode
                }
            }

        }

    },
    actions: {
        fetchWorstPlayer({ commit, dispatch, state }, season) {
            //Deprecated
        },
        fetchSeasons({ commit, dispatch, state }) {
            axios.get(state.apiUrl + '/Periode/Seasons')
                .then(function(response) {
                    commit('SaveSeasons', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },

        fetchDungeonSuccessRateData({ commit, dispatch, state }, id) {
            axios.get(state.apiUrl + `/Dungeon/ontimerate?periode=${id}&min_level=${state.settings.min_keystonelevel}&amount=${state.settings.max_runs}&limitToLowestDungeon=${state.settings.limitbylowestdungeon}`)
                .then(function(response) {
                    commit('SaveDungeonSuccessRateData', { data: response.data, id: id, settings: {...state.settings } })
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchDungeonCountData({ commit, dispatch, state }, id) {
            axios.get(state.apiUrl + '/Dungeon/RunsPerDungeon?week=' + id)
                .then(function(response) {
                    commit('SaveDungeonCountData', { data: response.data, id: id })
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchAffixSchedule({ commit, dispatch, state }) {
            axios.get(state.apiUrl + '/Affix/GetUpcommingWeeks')
                .then(function(response) {
                    commit('SaveAffixSchedule', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchDiscordLinks({ commit, dispatch, state }) {
            axios.get(state.apiUrl + '/DynamicData/discord/links')
                .then(function(response) {
                    commit('SaveDiscordLinks', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchCreatorsProjects({ commit, dispatch, state }) {
            axios.get(state.apiUrl + '/DynamicData/author/projects')
                .then(function(response) {
                    commit('SaveCreatorsProjects', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchDungeonData({ commit, dispatch, state }) {
            axios.get(state.apiUrl + '/Dungeon/leaderboard?periode=' +
                    state.SelectedPeriode + '&min_level=' +
                    state.settings.min_keystonelevel + '&amount=' +
                    state.settings.max_runs + '&limitToLowestDungeon=' +
                    state.settings.limitbylowestdungeon)
                .then(function(response) {
                    commit('SaveDungeonData', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchSpecData({ commit, dispatch, state }, payload) {
            var url = state.apiUrl + '/Spec/leaderboard?periode=' +
                state.SelectedPeriode + '&min_level=' +
                state.settings.min_keystonelevel + '&amount=' +
                state.settings.max_runs + '&limitToLowestDungeon=' +
                state.settings.limitbylowestdungeon;
            if (payload) url += '&zone=' + payload.id

            axios.get(url)
                .then(function(response) {
                    if (!payload) commit('SaveSpecData', response.data)
                    else if (payload) commit('SaveSpecData', { data: response.data, dungeon_id: payload.id })

                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        fetchDungeons({ commit, dispatch, state }) {
            axios.get(state.apiUrl + '/Dungeon/all')
                .then(function(response) {
                    commit('SaveDungeons', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        GetSelectedData({ commit, dispatch, state }, affixes) {
            axios.get(state.apiUrl + '/keystonedata//GetAffix?Affixes=' + affixes[0] + '&Affixes=' + affixes[1] +
                    '&Affixes=' + affixes[2] + '&Affixes=' + affixes[3] + '')
                .then(function(response) {
                    commit('SaveSelectedData', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        GetAllAffixData({ commit, dispatch, state }, affixes) {
            axios.get(state.apiUrl + '/Affix/All')
                .then(function(response) {
                    commit('SaveAffixes', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        GetPeriodesData({ commit, dispatch, state }, affixes) {
            axios.get(state.apiUrl + '/Periode?weeks=' + state.settings.WeeksToShow)
                .then(function(response) {
                    commit('SavePeriodes', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        GetAllSpecs({ commit, dispatch, state }, affixes) {
            axios.get(state.apiUrl + '/Spec/all')
                .then(function(response) {
                    commit('SaveSpecs', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        GetAllClasses({ commit, dispatch, state }, affixes) {
            axios.get(state.apiUrl + '/Class/all')
                .then(function(response) {
                    commit('SaveClasses', response.data)
                })
                .catch(function(error) {
                    console.log(error);
                })
        },
        GetAllRealms({ commit, dispatch, state }) {
            state.Regions.forEach(region => {
                axios.get(state.apiUrl + '/Realm/all?region=' + region)
                    .then(function(response) {
                        commit('SaveRealms', response.data)
                    })
                    .catch(function(error) {
                        console.log(error);
                    })
            });
        }
    },
    getters: {
        GetSavedSelected(state, affixes) {
            var rio = state.Selected;
            return rio
        },
        GetSelectedAffixSet(state) {
            return state.SelectedAffixSet
        },
        GetRIOData(state) {
            return state.RIOData
        },
        GetRealms(state) {
            return state.Realms
        },
        GetSpecs(state) {
            return state.AllSpecs
        },
        GetAffixes(state) {
            return state.Affixes
        },
        GetPeriodes(state) {
            return state.Periodes
        },
        GetSelectedPeriode(state) {
            return state.SelectedPeriode
        },
        SelectedPeriode(state) {
            if (state.Periodes)
                for (let i = 0; i < state.Periodes.length; i++) {
                    const periode = state.Periodes[i];
                    if (periode.id == state.SelectedPeriode) {
                        return periode
                    }
                }
        },
        GetNotifications(state) {
            return state.notifications
        },

        GetSettings(state) {
            return state.settings
        },
        GetDungeons(state) {
            return state.Dungeons
        },
        GetDungeonData(state) {
            return state.Dungeons_Data
        },
        GetSpecData(state) {
            return state.Spec_Data
        },
        GetClasses(state) {
          var classes = [...(state.GetClasses ?? [])].map(x=> ({...x}))
            if (classes) {
                classes.forEach(Class => {
                    var className = Class.name
                    var s = state.Class_Colors[String(className).replace(' ', '').toUpperCase()]
                    var rtn = {
                        r: s[0] * 255,
                        g: s[1] * 255,
                        b: s[2] * 255
                    }
                    var hex = rgbToHex(rtn)
                    Class.color = hex
                });
            }


            return classes
        },
        GetDungeonSpecData(state) {
            return state.Spec_Dungeon_Data
        },
        getReloaded_Timestamp(state) {
            return state.Reloaded_Timestamp
        },
        GetSeasons(state) {
            return state.Seasons
        },
        GetAffixDetails(state) {
            return state.AffixDetails
        },
        GetWorstPlayerRank(state) {
            return state.WorstPlayerRank
        },
        GetAffixSchedule(state) {
            return state.AffixSchedule
        },
        GetRegions(state) {
            return state.Regions
        },
        GetDiscordLinks(state) {
            return state.DiscordLinks
        },
        GetCreatorsProjects(state) {
            return state.CreatorsProjects
        },
        GetDungeonCountData(state) {
            var item = state.Dungeon_Count_Data
            return item
        },
        GetDungeonSuccessRateData(state) {
            var item = state.Dungeon_SuccessRate_Data
            return item
        },
    }
}

interface IData {
    state: {
        Specs: any[]
    }
}

const _state :  IData & typeof state = state
export default _state
