import {
  poinameApi
} from './../settings'
/**
 * 公交路径导航
 * @param {*} config
 */
export function busRoute(config) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${poinameApi.url}/transit`, {
        params: {
          postStr: {
            startposition: config.startposition,
            endposition: config.endposition,
            linetype: config.linetype,
          },
          type: 'busline',
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
 * 自驾路径导航
 * @param {*} config
 */
export function driveRoute(config) {
  return new Promise((resolve, reject) => {
    window.$nuxt.$axios
      .get(`${poinameApi.url}/drive`, {
        params: {
          postStr: {
            orig: config.startposition,
            dest: config.endposition,
            mid: config.passposition,
            style: config.style,
          },
          type: 'search',
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
