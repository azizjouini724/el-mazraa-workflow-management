import notificationService from '@/services/notificationservice'

export default {
  namespaced: true,

  state: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  },

  getters: {
    allNotifications: (state) => state.notifications,
    unreadNotifications: (state) => state.notifications.filter(n => !n.isRead),
    unreadCount: (state) => state.unreadCount,
    isLoading: (state) => state.loading
  },

  mutations: {
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications
      state.unreadCount = notifications.filter(n => !n.isRead).length
    },

    ADD_NOTIFICATION(state, notification) {
      // Ajouter en début de liste
      state.notifications.unshift(notification)
      if (!notification.isRead) {
        state.unreadCount++
      }
    },

    UPDATE_NOTIFICATION(state, updatedNotification) {
      const index = state.notifications.findIndex(n => n._id === updatedNotification._id)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead
        const isNowUnread = !updatedNotification.isRead
        
        state.notifications[index] = updatedNotification
        
        if (wasUnread && !isNowUnread) {
          state.unreadCount--
        } else if (!wasUnread && isNowUnread) {
          state.unreadCount++
        }
      }
    },

    REMOVE_NOTIFICATION(state, notificationId) {
      const notification = state.notifications.find(n => n._id === notificationId)
      if (notification && !notification.isRead) {
        state.unreadCount--
      }
      state.notifications = state.notifications.filter(n => n._id !== notificationId)
    },

    SET_LOADING(state, loading) {
      state.loading = loading
    },

    SET_ERROR(state, error) {
      state.error = error
    },

    MARK_ALL_AS_READ(state) {
      state.notifications.forEach(n => n.isRead = true)
      state.unreadCount = 0
    }
  },

  actions: {
    // ✅ CHARGER LES NOTIFICATIONS DEPUIS L'API
    async fetchNotifications({ commit }) {
      commit('SET_LOADING', true)
      try {
        const result = await notificationService.getNotifications()
        if (result.success) {
          commit('SET_NOTIFICATIONS', result.data || [])
          console.log('✅ Notifications chargées du store:', result.data)
        } else {
          commit('SET_ERROR', result.message)
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('❌ Erreur chargement notifications:', error)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // ✅ AJOUTER UNE NOTIFICATION (appelée par WebSocket)
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
      console.log('✅ Notification ajoutée au store:', notification.title)
    },

    // ✅ MARQUER COMME LU
    async markAsRead({ commit }, notificationId) {
      try {
        const result = await notificationService.markAsRead(notificationId)
        if (result.success) {
          commit('UPDATE_NOTIFICATION', result.data)
          console.log('✅ Notification marquée comme lue')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    },

    // ✅ MARQUER TOUS COMME LU
    async markAllAsRead({ commit }) {
      try {
        const result = await notificationService.markAllAsRead()
        if (result.success) {
          commit('MARK_ALL_AS_READ')
          console.log('✅ Toutes les notifications marquées comme lues')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    },

    // ✅ SUPPRIMER UNE NOTIFICATION
    async deleteNotification({ commit }, notificationId) {
      try {
        const result = await notificationService.deleteNotification(notificationId)
        if (result.success) {
          commit('REMOVE_NOTIFICATION', notificationId)
          console.log('✅ Notification supprimée')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    },

    // ✅ METTRE À JOUR LE COMPTEUR DE NON-LUES
    async updateUnreadCount({ commit }) {
      try {
        const result = await notificationService.getUnreadCount()
        if (result.success) {
          // Recalculer basé sur l'état local
          const unreadCount = result.data.count || 0
          console.log('✅ Unread count mis à jour:', unreadCount)
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    }
  }
}