export const strict = false
export const state = () => ({
  startPOI: '',// 用于存储起点地名字符串
  passPOI: '',// 用于存储途经点地名字符串
  endPOI: '',// 用于存储终点地名字符串
  isShowDown: false
})

export const getters = {}

export const mutations = {
  setStartPOI(state, startName) {
    state.startPOI = startName
  },
  setPassPOI(state, passName) {
    state.passPOI = passName
  },
  setEndPOI(state, endName) {
    state.endPOI = endName
  },
  changeState(state, data) {
    state.isShowDown = data
  }
}


export const actions = {
  setStartPOI(context, startName) {
    context.commit('setStartPOI', startName)
  },
  setPassPOI(context, passName) {
    context.commit('setPassPOI', passName)
  },
  setEndPOI(context, endName) {
    context.commit('setEndPOI', endName)
  },
  changeState(context, data) {
    context.commit('changeShow', data)
  }
}
