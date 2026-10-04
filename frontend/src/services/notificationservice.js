import api from './api'

export default {
  // Récupérer toutes les notifications
  async getNotifications(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.unreadOnly) params.append('unreadOnly', filters.unreadOnly)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await api.get('/notifications?' + params.toString())
      
      // ✅ RETOURNER DIRECTEMENT response.data qui contient déjà success, data, unreadCount
      return response.data
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        data: {
          data: [],
          unreadCount: 0
        }
      }
    }
  },

  // Récupérer le nombre de notifications non-lues
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread/count')
      return response.data
    } catch (error) {
      return { 
        success: false, 
        message: error.message,
        data: { count: 0 }
      }
    }
  },

  // Marquer une notification comme lue
  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`)
      return response.data
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      }
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all')
      return response.data
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      }
    }
  },

  // Supprimer une notification
  async deleteNotification(id) {
    try {
      const response = await api.delete(`/notifications/${id}`)
      return response.data
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      }
    }
  }
}