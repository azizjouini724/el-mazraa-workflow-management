import api from './api'

export default {
  async login(credentials) {
    try {
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          message: 'Email et mot de passe sont obligatoires'
        }
      }

      const response = await api.post('/auth/login', credentials)
      
      if (response.data && response.data.token) {
        // Charger les données complètes de l'utilisateur (avec photoPath et phone)
        try {
          const userResponse = await api.get('/auth/me')
          if (userResponse.data && userResponse.data.data) {
            return { 
              success: true, 
              data: {
                token: response.data.token,
                user: userResponse.data.data
              }
            }
          }
        } catch (error) {
          console.warn('Erreur lors du chargement du profil complet:', error)
          // Retourner les données du login si getCurrentUser échoue
          return { 
            success: true, 
            data: {
              token: response.data.token,
              user: response.data.user
            }
          }
        }
      }
      
      return {
        success: false,
        message: response.data?.message || 'Erreur de connexion'
      }
    } catch (error) {
      console.error('Login error:', error)
      
      if (!error.response) {
        return {
          success: false,
          message: 'Impossible de se connecter au serveur'
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Email ou mot de passe incorrect'
      }
    }
  },

  async register(userData) {
    try {
      if (!userData.name || !userData.email || !userData.password) {
        return {
          success: false,
          message: 'Tous les champs sont obligatoires'
        }
      }

      if (userData.password.length < 6) {
        return {
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        }
      }

      const dataToSend = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user'
      }

      const response = await api.post('/auth/register', dataToSend)
      
      if (response.data && response.data.token) {
        return { 
          success: true, 
          data: {
            token: response.data.token,
            user: response.data.user
          }
        }
      }
      
      return {
        success: false,
        message: response.data?.message || 'Erreur d\'inscription'
      }
    } catch (error) {
      console.error('Register error:', error)
      
      if (!error.response) {
        return {
          success: false,
          message: 'Impossible de se connecter au serveur'
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Erreur d\'inscription'
      }
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      if (response.data && response.data.data) {
        return { 
          success: true, 
          data: response.data.data
        }
      }
      return { 
        success: false, 
        message: 'Données utilisateur non trouvées'
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return { 
        success: false, 
        message: error.message 
      }
    }
  },

  async updateProfile(userData) {
    try {
      if (!userData.name || !userData.email) {
        return {
          success: false,
          message: 'Tous les champs sont obligatoires'
        }
      }

      const response = await api.put('/auth/profile', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      })

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Profil mis à jour avec succès'
        }
      }

      return {
        success: false,
        message: response.data?.message || 'Erreur lors de la mise à jour'
      }
    } catch (error) {
      console.error('Update profile error:', error)

      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Session expirée, veuillez vous reconnecter'
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      }
    }
  },

  async changePassword(passwordData) {
    try {
      if (!passwordData.oldPassword || !passwordData.newPassword) {
        return {
          success: false,
          message: 'Les deux mots de passe sont obligatoires'
        }
      }

      if (passwordData.newPassword.length < 6) {
        return {
          success: false,
          message: 'Le mot de passe doit contenir au minimum 6 caractères'
        }
      }

      const response = await api.post('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Mot de passe changé avec succès'
        }
      }

      return {
        success: false,
        message: response.data?.message || 'Erreur lors du changement du mot de passe'
      }
    } catch (error) {
      console.error('Change password error:', error)

      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Ancien mot de passe incorrect'
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du changement du mot de passe'
      }
    }
  },

  async uploadPhoto(formData) {
    try {
      const response = await api.post('/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Photo téléchargée avec succès'
        }
      }

      return {
        success: false,
        message: response.data?.message || 'Erreur lors du téléchargement'
      }
    } catch (error) {
      console.error('Upload photo error:', error)

      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Session expirée, veuillez vous reconnecter'
        }
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du téléchargement de la photo'
      }
    }
  },

  async forgotPassword(email) {
    try {
      if (!email) {
        return {
          success: false,
          message: 'Email est obligatoire'
        }
      }

      const response = await api.post('/auth/forgot-password', { email })

      return {
        success: true,
        message: response.data?.message || 'Email de réinitialisation envoyé'
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email'
      }
    }
  },

  async resetPassword(token, newPassword) {
    try {
      if (!token || !newPassword) {
        return {
          success: false,
          message: 'Token et nouveau mot de passe sont obligatoires'
        }
      }

      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      })

      return {
        success: true,
        message: response.data?.message || 'Mot de passe réinitialisé avec succès'
      }
    } catch (error) {
      console.error('Reset password error:', error)
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la réinitialisation'
      }
    }
  }
}