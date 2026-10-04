import { createStore } from 'vuex'
import auth from './modules/auth'
import articles from './modules/articles'
import validations from './modules/validations'
import notifications from './modules/notifications'

export default createStore({
  modules: {
    auth,
    articles,
    validations,
    notifications
  }
})