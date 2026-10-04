import articleService from '@/services/articleservice'

export default {
  state: {
    articles: [],
    currentArticle: null,
    loading: false
  },

  getters: {
    allArticles: state => state.articles,
    currentArticle: state => state.currentArticle,
    isLoading: state => state.loading
  },

  mutations: {
    SET_ARTICLES(state, articles) {
      state.articles = articles
    },

    SET_CURRENT_ARTICLE(state, article) {
      state.currentArticle = article
    },

    ADD_ARTICLE(state, article) {
      state.articles.unshift(article)
    },

    SET_LOADING(state, status) {
      state.loading = status
    }
  },

  actions: {
    async createArticle({ commit }, articleData) {
      commit('SET_LOADING', true)
      const result = await articleService.createArticle(articleData)
      
      if (result.success) {
        commit('ADD_ARTICLE', result.data)
      }
      
      commit('SET_LOADING', false)
      return result
    },

    async fetchMyArticles({ commit }) {
      commit('SET_LOADING', true)
      const result = await articleService.getMyArticles()
      
      if (result.success) {
        commit('SET_ARTICLES', result.data)
      }
      
      commit('SET_LOADING', false)
      return result
    },

    async fetchArticleById({ commit }, id) {
      commit('SET_LOADING', true)
      const result = await articleService.getArticleById(id)
      
      if (result.success) {
        commit('SET_CURRENT_ARTICLE', result.data)
      }
      
      commit('SET_LOADING', false)
      return result
    },

    async uploadArticleImage(_, file) {
      return await articleService.uploadImage(file)
    }
  }
}