import api from './api'

export default {
  // ✅ Créer un nouvel article produit (ProductArticle workflow)
  async createArticle(articleData) {
    try {
      const response = await api.post('/articles/create', articleData)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Erreur création article produit:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création de l\'article'
      }
    }
  },

  // ✅ CORRECTION: Utiliser /validations/pending au lieu de /articles/pending
  async getPendingValidations(validationType) {
    try {
      const response = await api.get(`/validations/pending/${validationType}`)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Erreur récupération validations:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des validations'
      }
    }
  },

  // ✅ Récupérer tous les articles produit
  async getAllArticles(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.nature) params.append('nature', filters.nature)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get('/articles/all?' + params.toString())
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur récupération articles:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des articles'
      }
    }
  },

  // ✅ Récupérer un article produit spécifique
  async getArticleById(articleId) {
    try {
      const response = await api.get(`/articles/${articleId}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur récupération article:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de l\'article'
      }
    }
  },

  // ✅ CORRECTION: Utiliser /validations au lieu de /articles/validate
  async submitValidation(validationId, validationData) {
    try {
      const response = await api.post(`/validations/${validationId}/validate`, validationData)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Erreur validation:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la soumission de la validation'
      }
    }
  },

  // ✅ Mettre à jour un article produit
  async updateArticle(articleId, articleData) {
    try {
      const response = await api.put(`/articles/${articleId}`, articleData)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Erreur mise à jour article:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour'
      }
    }
  },

  // ✅ Supprimer un article produit
  async deleteArticle(articleId) {
    try {
      const response = await api.delete(`/articles/${articleId}`)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Erreur suppression article:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression'
      }
    }
  },

  // ✅ Récupérer le workflow d'un article produit
  async getArticleWorkflow(articleId) {
    try {
      const response = await api.get(`/articles/${articleId}/workflow`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur récupération workflow:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du workflow'
      }
    }
  },

  // ✅ Exporter un article en PDF
  async exportArticlePDF(articleId) {
    try {
      const response = await api.get(`/export/articles/${articleId}/pdf`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `article_${articleId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      
      return { success: true }
    } catch (error) {
      console.error('Erreur export PDF:', error)
      return { success: false, message: 'Erreur lors de l\'export PDF' }
    }
  }
}