import api from './api'

export default {
  // Récupérer les commentaires d'un article
  async getArticleComments(articleId) {
    try {
      const response = await api.get(`/comments/article/${articleId}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Créer un commentaire
  async createComment(commentData) {
    try {
      const response = await api.post('/comments', commentData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la création'
      }
    }
  },

  // Mettre à jour un commentaire
  async updateComment(id, commentData) {
    try {
      const response = await api.put(`/comments/${id}`, commentData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour'
      }
    }
  },

  // Supprimer un commentaire
  async deleteComment(id) {
    try {
      const response = await api.delete(`/comments/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}