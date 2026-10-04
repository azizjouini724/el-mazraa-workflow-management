import api from './api'

export default {
  // ✅ CRÉER UN ARTICLE
  async createArticle(articleData) {
    try {
      // ✅ CORRECTION: Ajouter '/create' à l'URL
      const response = await api.post('/articles/create', articleData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création'
      }
    }
  },

  // Récupérer tous les articles
  async getAllArticles(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get('/articles/all?' + params.toString())
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Récupérer un article par ID
  async getArticleById(id) {
    try {
      const response = await api.get(`/articles/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Mettre à jour un article
  async updateArticle(id, articleData) {
    try {
      const response = await api.put(`/articles/${id}`, articleData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour'
      }
    }
  },

  // Supprimer un article
  async deleteArticle(id) {
    try {
      const response = await api.delete(`/articles/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la suppression'
      }
    }
  },

  // Récupérer le statut du workflow d'un article
  async getArticleWorkflow(id) {
    try {
      const response = await api.get(`/articles/${id}/workflow`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // ✅ RÉCUPÉRER LES ARTICLES EN ATTENTE DE VALIDATION
  async getPendingArticles(validationType) {
    try {
      const response = await api.get(`/validations/pending/${validationType}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Exporter un article en PDF
  async exportArticlePDF(id) {
    try {
      const response = await api.get(`/export/article/${id}/pdf`, {
        responseType: 'blob'
      })
      
      // Créer un blob et télécharger
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `article_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'export PDF' }
    }
  },

  // Exporter tous les articles en PDF
  async exportAllArticlesPDF() {
    try {
      const response = await api.get('/export/articles/pdf', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'tous_les_articles.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'export PDF' }
    }
  }
}