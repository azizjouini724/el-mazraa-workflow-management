import validationService from '@/services/validationservice'

export default {
  namespaced: true,

  state: {
    pendingValidations: [],
    validationHistory: [],
    loading: false,
    validationsByRole: {},
    currentValidationStep: null,
    validationStats: {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0
    }
  },

  getters: {
    pendingValidations: state => state.pendingValidations,
    validationHistory: state => state.validationHistory,
    pendingCount: state => state.pendingValidations.length,
    validationsByRole: state => state.validationsByRole,
    currentValidationStep: state => state.currentValidationStep,
    validationStats: state => state.validationStats,
    loading: state => state.loading
  },

  mutations: {
    SET_PENDING_VALIDATIONS(state, validations) {
      state.pendingValidations = validations
    },
    SET_VALIDATION_HISTORY(state, history) {
      state.validationHistory = history
    },
    // ✅ CORRIGÉ: filtrer par _id de validation
    REMOVE_PENDING_VALIDATION(state, validationId) {
      state.pendingValidations = state.pendingValidations.filter(
        v => v._id !== validationId
      )
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    // ✅ CORRIGÉ: spread pour la réactivité Vue
    SET_VALIDATIONS_BY_ROLE(state, { role, validations }) {
      state.validationsByRole = { ...state.validationsByRole, [role]: validations }
    },
    SET_CURRENT_VALIDATION_STEP(state, step) {
      state.currentValidationStep = step
    },
    SET_VALIDATION_STATS(state, stats) {
      state.validationStats = { ...state.validationStats, ...stats }
    },
    ADD_TO_HISTORY(state, validation) {
      state.validationHistory.unshift(validation)
    },
    UPDATE_STATS(state) {
      state.validationStats.total = state.pendingValidations.length
      state.validationStats.pending = state.pendingValidations.length
    }
  },

  actions: {
    // ✅ CORRIGÉ: passe validationType au service
    async fetchPendingValidations({ commit }, validationType) {
      commit('SET_LOADING', true)
      try {
        const result = await validationService.getPendingValidations(validationType)
        if (result.success) {
          commit('SET_PENDING_VALIDATIONS', result.data)
          commit('UPDATE_STATS')
        }
        return result
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ✅ CORRIGÉ: utilise validationId au lieu de articleId
    async submitValidation({ commit }, { validationId, validationData }) {
      commit('SET_LOADING', true)
      try {
        const result = await validationService.submitValidation(validationId, validationData)
        if (result.success) {
          commit('REMOVE_PENDING_VALIDATION', validationId)
          commit('ADD_TO_HISTORY', validationData)
          commit('UPDATE_STATS')
        }
        return result
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchValidationHistory({ commit }, articleId) {
      try {
        const result = await validationService.getArticleValidations(articleId)
        if (result.success) commit('SET_VALIDATION_HISTORY', result.data)
        return result
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    // ✅ CORRIGÉ: reçoit { role, validationType } et passe validationType au service
    async fetchValidationsByRole({ commit }, { role, validationType }) {
      commit('SET_LOADING', true)
      try {
        const result = await validationService.getPendingValidations(validationType)
        if (result.success) {
          commit('SET_VALIDATIONS_BY_ROLE', { role, validations: result.data })
        }
        return result
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    setCurrentValidationStep({ commit }, step) {
      commit('SET_CURRENT_VALIDATION_STEP', step)
    }
  }
}