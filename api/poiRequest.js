import {
  poinameApi,
  shareApi
} from './../settings'
/**
 * 普通地名查询网络接口封装
 * @param {*} config
 */
export function poiSearch(config) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${poinameApi.url}/search`, {
        params: {
          postStr: {
            keyWord: config.input,
            level: '11',
            mapBound: config.mapBound,
            queryType: config.queryType,
            start: config.start,
            count: config.count,
            specifyAdminCode: config.cityCode,
            queryTerminal: '10000',
          },
          type: 'query',
          tk: poinameApi.key,
        },
      })
      .then((res) => {
        // eslint-disable-next-line no-console
        resolve(res)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        reject(err)
      })
  })
}
/**
 * 城市编码获取
 * @param {*} config
 */
export function citySearch(config) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${poinameApi.url}/administrative`, {
        params: {
          postStr: {
            searchWord: config.cityName,
            searchType: '1',
            needSubInfo: 'false',
            needAll: 'false',
            needPre: 'true',
          },
          tk: poinameApi.key,
        },
      })
      .then((res) => {
        // eslint-disable-next-line no-console
        resolve(res)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        reject(err)
      })
  })
}
/**
 * 视图范围内搜索
 * @param {*} config
 */
export function viewSearch(config) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${poinameApi.url}/search`, {
        params: {
          postStr: {
            keyWord: config.input,
            level: '15',
            mapBound: config.mapBound,
            queryType: config.queryType,
            start: config.start,
            count: config.count,
            queryTerminal: '10000',
          },
          type: 'query',
          tk: poinameApi.key,
        },
      })
      .then((res) => {
        // eslint-disable-next-line no-console
        resolve(res)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        reject(err)
      })
  })
}
/**
 * 周边搜索
 * @param {*} config
 */
export function nearbySearch(config) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${poinameApi.url}/search`, {
        params: {
          postStr: {
            keyWord: config.input,
            level: '15',
            mapBound: config.mapBound,
            queryType: config.queryType,
            pointLonlat: config.pointLonlat,
            queryRadius: config.queryRadius,
            start: config.start,
            count: config.count,
            queryTerminal: '10000',
          },
          type: 'query',
          tk: poinameApi.key,
        },
      })
      .then((res) => {
        // eslint-disable-next-line no-console
        resolve(res)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        reject(err)
      })
  })
}
/**
 * 地名分享
 * @param {*} config
 */
export function poiShare(pid) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${shareApi.url}/data/shareadd?pid=` + pid)
      .then((res) => {
        // eslint-disable-next-line no-console
        resolve(res)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        reject(err)
      })
  })
}
