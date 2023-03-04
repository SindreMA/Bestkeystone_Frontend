/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js


const { configure } = require('quasar/wrappers');


module.exports = configure(function (/* ctx */) {
  return {
    boot: [
      'axios',
    ],
    css: [
      'app.sass'
    ],
    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    build: {
      target: {
        browser: [ 'es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1' ],
        node: 'node16'
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'
      //vueDevtools,
    },
    devServer: {
      // https: true
      host:['localhost', '192.168.10.111'],
      port: 8484,
      open: false // opens browser window automatically

    },
    framework: {
      config: {},
      plugins: []
    },
    animations: [],
    ssr: {
      pwa: false,

      prodPort: 3000, // The default port that the production server should use
      middlewares: [
        'render' // keep this as last one
      ]
    },

    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },

    cordova: {
    },

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager', // 'packager' or 'builder'
      packager: {
      },

      builder: {
        appId: 'bestkeystonev3'
      }
    },

    bex: {
      contentScripts: [
        'my-content-script'
      ],
    }
  }
});
