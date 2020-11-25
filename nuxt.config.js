export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'universal',
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'server',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Global CSS
   */
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@/assets/css/global.css',
    '@/assets/css/element-ui-cover.css',
    '@/assets/iconFont/iconfont.css',
  ],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: ['@/plugins/element-ui', '@/plugins/axios'],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    https: false,
    progress: true,
    proxy: true,
  },
  /**
   ** Proxy module configuration
   ** See https://github.com/nuxt-community/proxy-module
   */
  proxy: [
    [
      '/search',
      {
        target: 'http://api.tianditu.gov.cn',
        // changeOrigin: 'true',
        ws: true,
      },
    ],
  ],
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    transpile: [/^element-ui/],
  },
  // router: {
  //   extendRoutes(routes, resolve) {
  //     let index = routes.findIndex((route) => route.name === 'zxdt')
  //     routes[index] = {
  //       ...routes[index],
  //       components: {
  //         default: routes[index].component,
  //         esriMapContent: resolve(__dirname, 'components/Map'),
  //         rightTopTool: resolve(__dirname, 'components/RightTopTool'),
  //       },
  //       chunkNames: {
  //         esriMapContent: 'components/Map',
  //         rightTopTool: 'components/RightTopTool',
  //       },
  //     }

  //     index = routes.findIndex((route) => route.name === 'ztdt')
  //     routes[index] = {
  //       ...routes[index],
  //       components: {
  //         default: routes[index].component,
  //         esriMapContent: resolve(__dirname, 'components/Map'),
  //         rightTopTool: resolve(__dirname, 'components/RightTopTool'),
  //       },
  //       chunkNames: {
  //         esriMapContent: 'components/Map',
  //         rightTopTool: 'components/RightTopTool',
  //       },
  //     }
  //   },
  // },
}
