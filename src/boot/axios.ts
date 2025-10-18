import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { loadConfig } from '../config/env';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: 'https://api.example.com' });

export default boot(async ({ app, store }) => {
  // Load runtime configuration before initializing the app
  const config = await loadConfig();

  console.log('[Boot] Loaded config:', config);
  console.log('[Boot] Setting API URL to:', config.apiUrl);

  // Set the API URL in the store
  store.commit('SetApiUrl', config.apiUrl);

  console.log('[Boot] Store state after commit:', store.state.data?.state?.apiUrl || store.state.data?.apiUrl);

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
