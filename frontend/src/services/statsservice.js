import api from './api'

export default {
  // Récupérer les statistiques globales (admin seulement)
  async getGlobalStats() {
    try {
      const response = await api.get('/stats')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  },

  // Récupérer le dashboard de l'utilisateur connecté
  async getUserDashboard() {
    try {
      const response = await api.get('/stats/user/dashboard')
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}