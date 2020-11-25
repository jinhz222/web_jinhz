module.exports = {
  title: '西藏天地图',
  jsApi: {
    url: 'https://js.arcgis.com/4.16/init.js',
    css: 'https://js.arcgis.com/4.16/esri/themes/light/main.css',
  },
  tianditu: {
    urlTemplateHost: 'http://{subDomain}.tianditu.gov.cn',
    subDomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
    key: '3ff5dc1d09bff763d37d723ec7286c71',
  },
  weatherApi: {
    url: 'https://devapi.heweather.net',
    key: '87c4b983ce7e40638711505dc1b2f739',
  },
  shareApi: {
    url: 'https://map.tianditu.gov.cn',
  },
  poinameApi: {
    url: 'http://api.tianditu.gov.cn',
    key: '423dbdf2713bf0202c495dd58c49ce45',
  },
}
