import qs from 'qs'

import { getToken, removeToken } from '@/utils/auth'

/**
 * 切换至登录窗口
 * @param {*} redirect
 */
const toLogin = (redirect) => {
  redirect('/login')
}

/**
 * 处理response拦截器中错误情况
 * @param {*} redirect
 * @param {*} status 错误代码
 * @param {*} other 错误描述信息
 */
const handelResponseError = (redirect, status, other) => {
  switch (status.toString()) {
    case '401':
      // 未登录访问需登录的操作，跳转至登录页面
      toLogin(redirect)
      break
    case '403':
      // TOKEN过期，清空存储的TOKEN并跳转至登录页
      removeToken()
      setTimeout(() => {
        toLogin(redirect)
      }, 500)
      break
    case '404':
      // 请求资源不存在，跳转至404页面
      redirect('/404')
      break
    default:
      // eslint-disable-next-line no-console
      console.log(other)
  }
}

export default function ({ $axios, redirect }) {
  // 添加请求超时时间(10秒)
  $axios.defaults.timeout = 10000

  // 添加request拦截器
  $axios.interceptors.request.use(
    (config) => {
      if (config.method === 'get') {
        return config
      }

      // 判断是否有TOKEN，如果有添加到HEADER
      const authToken = getToken()
      if (authToken) {
        $axios.setToken(authToken, 'Bearer', ['post', 'delete', 'put', 'patch'])
      }

      // 序列化请求数据
      config.data = qs.stringify(config.data)

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 添加response拦截器
  $axios.interceptors.response.use(
    (response) =>
      response.status === 200
        ? Promise.resolve(response)
        : Promise.reject(response),
    (error) => {
      const { response } = error

      if (response) {
        // 请求已发出，但response状态码不在2xx范围内
        handelResponseError(redirect, response.status, response.data.message)
        return Promise.reject(response)
      } else if (!window.navigator.onLine) {
        // 处理断网或请求超时情况，跳转至无网络页面
        redirect('/offLine')
      } else {
        return Promise.reject(response)
      }
    }
  )
}
