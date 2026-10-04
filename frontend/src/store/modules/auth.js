import authService from '@/services/authservice'

// ✅ Stockage en mémoire si localStorage bloqué
let memoryStore = {
  user: null,
  token: null
}

export default {
  namespaced: true,

  state: {
    user: null,
    token: null,
    isAuthenticated: false
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    userRole: state => state.user?.role || null,
    isAdmin: state => state.user?.role === 'admin',
    isValidator: state => state.user?.role?.startsWith('validateur_') || false,
    isNormalUser: state => state.user?.role === 'user' || state.user?.role === 'demandeur'
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      state.isAuthenticated = !!token
      memoryStore.token = token
      
      try {
        if (token) {
          localStorage.setItem('token', token)
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.warn('localStorage non disponible, utilisation de mémoire:', error.message)
      }
    },

    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
      memoryStore.user = user
      
      console.log('✅ User défini:', user)
      console.log('✅ Role utilisateur:', user?.role)
      
      try {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        } else {
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.warn('localStorage non disponible, utilisation de mémoire:', error.message)
      }
    },

    setCurrentUser(state, user) {
      if (state.user) {
        state.user = { ...state.user, ...user }
      } else {
        state.user = user
      }
      state.isAuthenticated = !!state.user
      memoryStore.user = state.user
      
      console.log('✅ User mis à jour:', state.user)
      
      try {
        localStorage.setItem('user', JSON.stringify(state.user))
      } catch (error) {
        console.warn('localStorage non disponible:', error.message)
      }
    },

    LOGOUT(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      memoryStore.user = null
      memoryStore.token = null
      
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch (error) {
        console.warn('localStorage non disponible:', error.message)
      }
      
      console.log('✅ Déconnexion réussie')
    }
  },

  actions: {
    initAuth({ commit }) {
      // ✅ Essayer localStorage d'abord
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          const user = JSON.parse(userStr)
          console.log('✅ Auth restaurée depuis localStorage - Role:', user?.role)
          commit('SET_TOKEN', token)
          commit('SET_USER', user)
          return
        }
      } catch (error) {
        console.warn('localStorage non disponible:', error.message)
      }
      
      // ✅ Utiliser la mémoire si localStorage échoue
      if (memoryStore.token && memoryStore.user) {
        console.log('✅ Auth restaurée depuis mémoire - Role:', memoryStore.user?.role)
        commit('SET_TOKEN', memoryStore.token)
        commit('SET_USER', memoryStore.user)
      }
    },

    async login({ commit }, credentials) {
      console.log('🔐 Tentative de connexion avec:', credentials.email)
      const result = await authService.login(credentials)
      
      if (result.success) {
        console.log('✅ Login réussi!')
        console.log('📊 Données reçues du serveur:', result.data.user)
        console.log('🔑 Role reçu:', result.data.user?.role)
        
        commit('SET_TOKEN', result.data.token)
        commit('SET_USER', result.data.user)
        
        console.log('✅ Store mis à jour - Rôle final:', result.data.user?.role)
      } else {
        console.error('❌ Login échoué:', result.message)
      }
      return result
    },

    async register({ commit }, userData) {
      const result = await authService.register(userData)
      if (result.success) {
        commit('SET_TOKEN', result.data.token)
        commit('SET_USER', result.data.user)
      }
      return result
    },

    async fetchCurrentUser({ commit, state }) {
      if (!state.token) return { success: false }

      const result = await authService.getCurrentUser()
      if (result.success) {
        console.log('✅ Profil récupéré - Role:', result.data?.role)
        commit('SET_USER', result.data)
      }
      return result
    },

    logout({ commit }) {
      commit('LOGOUT')
    }
  }
}