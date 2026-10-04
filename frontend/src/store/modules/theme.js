// store/modules/theme.js
const state = {
  theme: localStorage.getItem('app-theme') || 'light',
  language: localStorage.getItem('app-language') || 'fr'
}

const mutations = {
  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem('app-theme', theme)
    applyTheme(theme)
  },
  SET_LANGUAGE(state, language) {
    state.language = language
    localStorage.setItem('app-language', language)
  }
}

const actions = {
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
  }
}

const getters = {
  currentTheme: state => state.theme,
  currentLanguage: state => state.language,
  isDarkMode: state => state.theme === 'dark'
}

function applyTheme(theme) {
  const html = document.documentElement
  if (theme === 'dark') {
    html.setAttribute('data-bs-theme', 'dark')
  } else {
    html.removeAttribute('data-bs-theme')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}