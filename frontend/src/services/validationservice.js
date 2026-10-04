import api from './api'

export default {

  async getAllValidations(validationType) {
    try {
      const response = await api.get(`/validations/all/${validationType}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // ✅ CORRIGÉ: accepte validationType et appelle le bon endpoint
  async getPendingValidations(validationType) {
    try {
      const response = await api.get(`/validations/pending/${validationType}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  async getArticleValidations(articleId) {
    try {
      const response = await api.get(`/articles/${articleId}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  async submitValidation(validationId, validationData) {
    try {
      const response = await api.post(`/validations/${validationId}/validate`, validationData)
      if (response.data && response.data.success) {
        return { success: true, data: response.data }
      }
      return { success: false, message: response.data?.message || 'Erreur inconnue' }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors de la validation'
      console.error('Erreur validation:', errorMsg)
      return { success: false, message: errorMsg }
    }
  },

  async approveValidation(id, comment = '') {
    return this.submitValidation(id, { avis: 'Favorable', commentaire: comment })
  },

  async rejectValidation(id, comment = '') {
    return this.submitValidation(id, { avis: 'Défavorable', rejectionComment: comment })
  }
}