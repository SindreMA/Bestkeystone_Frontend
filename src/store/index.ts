import { store } from 'quasar/wrappers'
import { InjectionKey } from 'vue'
import { Router } from 'vue-router'
import {
  createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
} from 'vuex'

import data from './data'

export interface IState {
  // Define your own store structure, using submodules if needed
  // example: ExampleIState;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  data: typeof data.state
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<IState>
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<IState>> = Symbol('vuex-key')

// Provide typings for `this.$router` inside Vuex stores
 declare module "vuex" {
   export interface Store<S> {
     readonly $router: Router;
   }
 }

export default store(function (/* { ssrContext } */) {
  const Store = createStore<IState>({

    modules: {
      data
    },

    strict: !!process.env.DEBUGGING
  })

  return Store;
})

export function useStore() {
  return vuexUseStore(storeKey)
}
