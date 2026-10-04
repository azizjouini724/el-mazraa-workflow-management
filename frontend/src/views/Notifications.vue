<template>
  <div class="notifications-container">
    <div class="page-header">
      <div>
        <h1>Notifications</h1>
        <p class="text-muted">Gérez vos notifications</p>
      </div>
      <button v-if="unreadCount > 0" class="btn btn-sm btn-outline-primary" @click="markAllAsRead">
        <i class="bi bi-check-all me-2"></i>Tout marquer comme lu
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="notification-filters mb-4">
      <button 
        v-for="filter in filters" 
        :key="filter"
        @click="activeFilter = filter"
        class="filter-btn"
        :class="{ active: activeFilter === filter }">
        {{ filter === 'all' ? 'Tous' : filter === 'unread' ? 'Non lus' : 'Lus' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Notifications List -->
    <div v-else-if="filteredNotifications.length > 0" class="notifications-list">
      <div 
        v-for="notification in filteredNotifications" 
        :key="notification._id"
        class="notification-card"
        :class="{ unread: !notification.isRead }">
        
        <div class="notification-icon" :class="getIconClass(notification.type)">
          <i :class="getIcon(notification.type)"></i>
        </div>

        <div class="notification-body">
          <div class="notification-header">
            <h6 class="notification-title">{{ notification.title }}</h6>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div v-if="notification.article" class="notification-meta">
            <span class="badge bg-light text-dark">
              Article: {{ notification.article.title }}
            </span>
          </div>
        </div>

        <div class="notification-actions">
          <button 
            v-if="!notification.isRead"
            class="btn-icon"
            @click="markAsRead(notification._id)"
            title="Marquer comme lu">
            <i class="bi bi-circle"></i>
          </button>
          <button 
            class="btn-icon"
            @click="deleteNotification(notification._id)"
            title="Supprimer">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="bi bi-inbox"></i>
      <h5>Aucune notification</h5>
      <p class="text-muted">
        {{ activeFilter === 'unread' ? 'Vous êtes à jour !' : 'Vous n\'avez aucune notification.' }}
      </p>
    </div>
  </div>
</template>

<script>
import notificationService from '@/services/notificationservice'

export default {
  name: 'Notifications',
  data() {
    return {
      activeFilter: 'all',
      filters: ['all', 'unread', 'read'],
      notifications: [],
      loading: false
    }
  },
  computed: {
    filteredNotifications() {
      switch (this.activeFilter) {
        case 'unread':
          return this.notifications.filter(n => !n.isRead)
        case 'read':
          return this.notifications.filter(n => n.isRead)
        default:
          return this.notifications
      }
    },
    unreadCount() {
      return this.notifications.filter(n => !n.isRead).length
    }
  },
  mounted() {
    this.loadNotifications()
  },
  methods: {
    async loadNotifications() {
      this.loading = true
      try {
        // ✅ UTILISER LE SERVICE au lieu du fetch direct
        const result = await notificationService.getNotifications()
        
        if (result.success) {
          // ✅ result.data contient le tableau des notifications
          this.notifications = result.data || []
          console.log('✅ Notifications chargées:', this.notifications)
        } else {
          console.warn('⚠️ API error:', result.message)
          this.notifications = []
        }
      } catch (error) {
        console.error('❌ Erreur chargement notifications:', error)
        this.notifications = []
      } finally {
        this.loading = false
      }
    },

    getIcon(type) {
      const icons = {
        'success': 'bi bi-check-circle-fill',
        'warning': 'bi bi-exclamation-circle-fill',
        'rejection': 'bi bi-x-circle-fill',
        'info': 'bi bi-info-circle-fill',
        'approval': 'bi bi-check-circle',
        'request': 'bi bi-plus-circle'
      }
      return icons[type] || 'bi bi-bell-fill'
    },

    getIconClass(type) {
      const classes = {
        'success': 'bg-success',
        'warning': 'bg-warning',
        'rejection': 'bg-danger',
        'info': 'bg-info',
        'approval': 'bg-primary',
        'request': 'bg-secondary'
      }
      return classes[type] || 'bg-secondary'
    },

    formatTime(date) {
      if (!date) return 'À l\'instant'
      
      const diff = new Date() - new Date(date)
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 1) return 'À l\'instant'
      if (minutes < 60) return `Il y a ${minutes}m`
      if (hours < 24) return `Il y a ${hours}h`
      if (days < 7) return `Il y a ${days}j`
      
      return new Date(date).toLocaleDateString('fr-FR')
    },

    async markAsRead(id) {
      try {
        const result = await notificationService.markAsRead(id)
        if (result.success) {
          const notification = this.notifications.find(n => n._id === id)
          if (notification) {
            notification.isRead = true
          }
          console.log('✅ Notification marquée comme lue')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    },

    async markAllAsRead() {
      try {
        const result = await notificationService.markAllAsRead()
        if (result.success) {
          this.notifications.forEach(n => n.isRead = true)
          console.log('✅ Toutes les notifications marquées comme lues')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    },

    async deleteNotification(id) {
      try {
        const result = await notificationService.deleteNotification(id)
        if (result.success) {
          const index = this.notifications.findIndex(n => n._id === id)
          if (index > -1) {
            this.notifications.splice(index, 1)
          }
          console.log('✅ Notification supprimée')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
      }
    }
  }
}
</script>

<style scoped>
.notifications-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.page-header p {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
}

.notification-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-btn:hover {
  border-color: #2d5f3f;
}

.filter-btn.active {
  background: #2d5f3f;
  border-color: #2d5f3f;
  color: white;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #e9ecef;
  transition: all 0.2s;
}

.notification-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notification-card.unread {
  background: rgba(45, 95, 63, 0.02);
  border-left-color: #2d5f3f;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notification-icon.bg-success {
  background: #198754;
}

.notification-icon.bg-warning {
  background: #ffc107;
  color: #000;
}

.notification-icon.bg-danger {
  background: #dc3545;
}

.notification-icon.bg-info {
  background: #0dcaf0;
}

.notification-icon.bg-primary {
  background: #0d6efd;
}

.notification-icon.bg-secondary {
  background: #6c757d;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.notification-title {
  margin: 0;
  color: #212529;
  font-weight: 600;
  font-size: 0.95rem;
}

.notification-time {
  font-size: 0.8rem;
  color: #adb5bd;
  white-space: nowrap;
  margin-left: 1rem;
}

.notification-message {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.notification-meta {
  margin-top: 0.75rem;
}

.badge {
  font-weight: 600;
  font-size: 0.75rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e9ecef;
  color: #2d5f3f;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

.empty-state h5 {
  color: #6c757d;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>