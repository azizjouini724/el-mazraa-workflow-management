<template>
  <nav class="site-header sticky-top">
    <div class="header-container">
      <div class="header-left">
        <button class="sidebar-toggle" @click="toggleSidebar" type="button">
          <i class="bi bi-list"></i>
        </button>
        <router-link to="/dashboard" class="brand">
          <img src="/logoPWA.png" alt="Logo" class="brand-logo">
          <div class="brand-text">
            <div class="brand-name">EL-MAZRAA</div>
            <div class="brand-subtitle">Workflow Management</div>
          </div>
        </router-link>
      </div>

      <div class="header-center"></div>

      <div class="header-right">
        <button class="btn-icon" @click="showHelp" title="Aide">
          <i class="bi bi-question-circle"></i>
        </button>

        <div class="dropdown" ref="notificationDropdown">
          <button class="btn-icon position-relative" type="button" @click="toggleNotificationDropdown">
            <i class="bi bi-bell"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
          <div class="dropdown-menu dropdown-menu-end notification-dropdown" :class="{ 'show': showNotifications }" @click.stop>
            <div class="dropdown-header-custom">
              <h6 class="mb-0">Notifications</h6>
              <button v-if="unreadCount > 0" class="btn-link-custom" @click="markAllAsRead">Tout lire</button>
            </div>
            <div class="notification-list">
              <div v-if="isLoading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary"></div>
              </div>
              <div v-else-if="notifications.length === 0" class="empty-state">
                <i class="bi bi-bell-slash"></i>
                <p>Aucune notification</p>
              </div>
              <div
                v-for="notification in notifications"
                :key="notification._id"
                class="notification-item"
                :class="{ 'unread': !notification.isRead }"
                @click="handleNotificationClick(notification)"
              >
                <i :class="getNotificationIcon(notification.type)"></i>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-text">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                </div>
              </div>
            </div>
            <div class="dropdown-footer-custom">
              <router-link to="/notifications" class="btn-link-custom">Voir tout</router-link>
            </div>
          </div>
        </div>

        <div class="dropdown" ref="userDropdown">
          <button class="user-menu-btn" type="button" @click="toggleUserDropdown">
            <!-- ✅ CORRIGÉ: utilise getPhotoUrl -->
            <div v-if="currentUser && currentUser.photoPath" class="user-avatar-photo">
              <img :src="getPhotoUrl(currentUser.photoPath)" alt="Photo">
            </div>
            <div v-else class="user-avatar" :style="{ background: getUserColor() }">{{ userInitials }}</div>
            <div class="user-info">
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ userRoleLabel }}</div>
            </div>
            <i class="bi bi-chevron-down"></i>
          </button>

          <ul class="dropdown-menu dropdown-menu-end user-dropdown" :class="{ 'show': showUserMenu }" @click.stop>
            <li class="user-dropdown-header">
              <!-- ✅ CORRIGÉ: utilise getPhotoUrl -->
              <div v-if="currentUser && currentUser.photoPath" class="user-avatar-lg-photo">
                <img :src="getPhotoUrl(currentUser.photoPath)" alt="Photo">
              </div>
              <div v-else class="user-avatar-lg" :style="{ background: getUserColor() }">{{ userInitials }}</div>
              <div>
                <div class="fw-bold">{{ userName }}</div>
                <div class="text-muted small">{{ userEmail }}</div>
                <div class="text-muted small">{{ userRoleLabel }}</div>
              </div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <router-link to="/dashboard" class="dropdown-item" @click="closeUserMenu">
                <i class="bi bi-speedometer2"></i> Tableau de bord
              </router-link>
            </li>
            <li>
              <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                <i class="bi bi-person"></i> Mon profil
              </router-link>
            </li>
            <li>
              <router-link to="/settings" class="dropdown-item" @click="closeUserMenu">
                <i class="bi bi-gear"></i> Paramètres
              </router-link>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button @click="handleLogout" class="dropdown-item text-danger">
                <i class="bi bi-box-arrow-right"></i> Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  name: 'Header',
  data() {
    return {
      showNotifications: false,
      showUserMenu: false,
      notificationCheckInterval: null
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    ...mapGetters('notifications', ['allNotifications', 'unreadCount', 'isLoading']),
    ...mapState('notifications', {
      notifications: state => state.notifications,
      loading: state => state.loading
    }),
    userName() {
      return this.currentUser?.name || 'Utilisateur'
    },
    userEmail() {
      return this.currentUser?.email || 'user@example.com'
    },
    userRoleLabel() {
      const role = this.currentUser?.role || 'user'
      const roleLabels = {
        'employe': 'Employé', 'user': 'Utilisateur', 'demandeur': 'Demandeur',
        'marketing': 'Marketing', 'production': 'Production', 'qualite': 'Qualité',
        'finance': 'Finance', 'commercial': 'Commercial', 'controle': 'Contrôle',
        'informatique': 'Informatique', 'admin': 'Administrateur',
        'validateur_marketing': 'Val. Marketing', 'validateur_production': 'Val. Production',
        'validateur_qualite': 'Val. Qualité', 'validateur_finance': 'Val. Finance',
        'validateur_commercial': 'Val. Commercial', 'validateur_informatique': 'Val. Informatique'
      }
      return roleLabels[role] || 'Utilisateur'
    },
    userInitials() {
      const name = this.userName
      if (!name || name === 'Utilisateur') return 'U'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
  },
  methods: {
    ...mapActions('notifications', ['fetchNotifications', 'markAsRead', 'markAllAsRead']),

    // ✅ MÉTHODE CORRIGÉE — gère tous les cas de photoPath
    getPhotoUrl(photoPath) {
  if (!photoPath) return null
  if (photoPath.startsWith('http')) return photoPath
  // ✅ port 5004 hardcodé directement
  if (!photoPath.startsWith('/')) {
    return `http://localhost:5004/uploads/${photoPath}`
  }
  return `http://localhost:5004${photoPath}`
},

    

    toggleSidebar() {
      this.$emit('toggle-sidebar')
    },

    showHelp() {
      alert('Aide : Contactez support@elmazraa.com')
    },

    toggleNotificationDropdown() {
      this.showNotifications = !this.showNotifications
      this.showUserMenu = false
      if (this.showNotifications) this.fetchNotifications()
    },

    toggleUserDropdown() {
      this.showUserMenu = !this.showUserMenu
      this.showNotifications = false
    },

    closeUserMenu() {
      this.showUserMenu = false
    },

    handleClickOutside(event) {
      if (this.$refs.notificationDropdown && !this.$refs.notificationDropdown.contains(event.target)) {
        this.showNotifications = false
      }
      if (this.$refs.userDropdown && !this.$refs.userDropdown.contains(event.target)) {
        this.showUserMenu = false
      }
    },

    handleLogout() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        this.$store.commit('auth/LOGOUT')
        setTimeout(() => { this.$router.push('/login') }, 300)
      }
    },

    async handleNotificationClick(notification) {
      if (!notification.isRead) await this.markAsRead(notification._id)
    },

    getNotificationIcon(type) {
      const icons = {
        'article_created': 'bi bi-star text-warning',
        'validation_required': 'bi bi-exclamation-circle text-danger',
        'validation_approved': 'bi bi-check-circle text-success',
        'validation_rejected': 'bi bi-x-circle text-danger',
        'article_published': 'bi bi-check-circle-fill text-success',
        'article_rejected': 'bi bi-x-circle text-danger'
      }
      return icons[type] || 'bi bi-bell'
    },

    formatTime(date) {
      if (!date) return "À l'instant"
      const diff = new Date() - new Date(date)
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      if (seconds < 60) return "À l'instant"
      if (minutes < 60) return `Il y a ${minutes} min`
      if (hours < 24) return `Il y a ${hours}h`
      if (days < 7) return `Il y a ${days}j`
      return new Date(date).toLocaleDateString('fr-FR')
    },

    getUserColor() {
      const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #2d5f3f 0%, #43e97b 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      ]
      return colors[this.userInitials.charCodeAt(0) % colors.length]
    }
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    this.fetchNotifications()
    this.notificationCheckInterval = setInterval(() => {
      this.fetchNotifications()
    }, 30000) // ✅ 30s au lieu de 5s pour éviter le spam
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    if (this.notificationCheckInterval) clearInterval(this.notificationCheckInterval)
  }
}
</script>

<style scoped>
.site-header { height: 64px; background: white; border-bottom: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.04); z-index: 1030; }
.header-container { height: 100%; padding: 0 1.5rem; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 2rem; }
.header-left { display: flex; align-items: center; gap: 1rem; }
.sidebar-toggle { width: 40px; height: 40px; border: none; background: transparent; border-radius: 8px; color: #6c757d; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.sidebar-toggle:hover { background: #f8f9fa; color: #2d5f3f; }
.sidebar-toggle i { font-size: 1.5rem; }
.brand { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
.brand-logo { height: 40px; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-name { font-size: 1.1rem; font-weight: 700; color: #2d5f3f; }
.brand-subtitle { font-size: 0.7rem; color: #6c757d; text-transform: uppercase; }
.header-center { max-width: 500px; margin: 0 auto; }
.header-right { display: flex; align-items: center; gap: 0.5rem; }
.btn-icon { width: 40px; height: 40px; border: none; background: transparent; border-radius: 8px; color: #6c757d; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; }
.btn-icon:hover { background: #f8f9fa; color: #2d5f3f; }
.btn-icon i { font-size: 1.25rem; }
.notification-badge { position: absolute; top: 6px; right: 6px; background: #dc3545; color: white; font-size: 0.65rem; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid white; }
.user-menu-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.375rem 0.75rem 0.375rem 0.375rem; background: transparent; border: 1px solid #e9ecef; border-radius: 50px; cursor: pointer; }
.user-menu-btn:hover { background: #f8f9fa; border-color: #2d5f3f; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem; }
.user-avatar-photo { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.user-avatar-photo img { width: 100%; height: 100%; object-fit: cover; }
.user-info { display: flex; flex-direction: column; text-align: left; line-height: 1.2; }
.user-name { font-size: 0.875rem; font-weight: 600; color: #212529; }
.user-role { font-size: 0.75rem; color: #6c757d; }
.dropdown { position: relative; }
.dropdown-menu { position: absolute !important; top: 100% !important; right: 0 !important; z-index: 9999 !important; display: none; min-width: 320px; padding: 0; margin: 0.5rem 0 0 0 !important; font-size: 0.875rem; color: #212529; background-color: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
.dropdown-menu.show { display: block !important; }
.dropdown-header-custom { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e9ecef; }
.btn-link-custom { background: none; border: none; color: #2d5f3f; font-size: 0.8rem; cursor: pointer; padding: 0; }
.btn-link-custom:hover { text-decoration: underline; }
.notification-list { max-height: 350px; overflow-y: auto; padding: 0.5rem; }
.notification-item { display: flex; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; cursor: pointer; }
.notification-item:hover { background: #f8f9fa; }
.notification-item.unread { background: rgba(45, 95, 63, 0.05); }
.notification-content { flex: 1; }
.notification-title { font-size: 0.875rem; font-weight: 600; }
.notification-text { font-size: 0.8rem; color: #6c757d; }
.notification-time { font-size: 0.75rem; color: #adb5bd; }
.empty-state { text-align: center; padding: 2rem 1rem; color: #adb5bd; }
.dropdown-footer-custom { border-top: 1px solid #e9ecef; padding: 0.75rem; text-align: center; }
.user-dropdown-header { display: flex; gap: 1rem; padding: 1rem; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px 12px 0 0; }
.user-avatar-lg { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem; flex-shrink: 0; }
.user-avatar-lg-photo { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.user-avatar-lg-photo img { width: 100%; height: 100%; object-fit: cover; }
.dropdown-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; background-color: transparent; border: 0; font-size: 0.875rem; cursor: pointer; text-decoration: none; color: #212529; }
.dropdown-item:hover { background-color: #f8f9fa; }
.dropdown-item i { width: 18px; }
.dropdown-divider { height: 0; margin: 0.5rem 0; border-top: 1px solid #e9ecef; }
.text-danger { color: #dc3545 !important; }
.fw-bold { font-weight: 700 !important; }
.text-muted { color: #6c757d !important; }
.small { font-size: 0.875rem !important; }
.mb-0 { margin-bottom: 0 !important; }
.py-3 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
.position-relative { position: relative !important; }
@media (max-width: 992px) {
  .header-center { display: none; }
  .header-container { grid-template-columns: auto 1fr; }
  .user-info { display: none; }
}
@media (max-width: 768px) {
  .brand-subtitle { display: none; }
}
</style>