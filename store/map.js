export const strict = false
export const state = () => ({
  mainView: '222', // 存储全局mapview
})

export const getters = {
  getMainView: (state) => {
    return state.mainView // 获取全局mapview
  },
}

export const mutations = {
  saveMainView(state, mapview) {
    state.mainView = mapview
  },
}

export const actions = {
  saveMainView(context, mapview) {
    context.commit('saveMainView', mapview)
  },
}
