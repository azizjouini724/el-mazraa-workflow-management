<template>
  <div id="app">
    <!-- ✅ Header uniquement si authentifié -->
    <Header v-if="isAuthenticated" @toggle-sidebar="toggleSidebar" />
    
    <!-- Main Container -->
    <div class="app-container" :class="{ 'full-height': !isAuthenticated }">
      <!-- ✅ Sidebar uniquement si authentifié -->
      <aside v-if="isAuthenticated" class="sidebar" :class="{ 'show': showSidebar }">
        <nav class="sidebar-nav">
          <!-- Section Principale -->
          <div class="nav-section">
            <h6 class="nav-title">Navigation</h6>
            <router-link to="/dashboard" class="nav-link" @click="closeSidebar">
              <i class="bi bi-speedometer2"></i>
              <span>Tableau de bord</span>
            </router-link>
            <!-- ✅ ARTICLES QAD -->
            <router-link to="/articles-qad" class="nav-link" @click="closeSidebar">
              <i class="bi bi-check-circle-fill"></i>
              <span>Articles QAD</span>
            </router-link>
            
            <!-- ✅ NOUVELLE DEMANDE - UNIQUEMENT POUR DEMANDEUR -->
            <router-link 
              v-if="currentUser && currentUser.role === 'demandeur'" 
              to="/articles/create" 
              class="nav-link" 
              @click="closeSidebar"
            >
              <i class="bi bi-plus-circle"></i>
              <span>Nouvelle Demande</span>
            </router-link>
          </div>
          
          <!-- Section Utilisateur -->
          <div class="nav-section">
            <h6 class="nav-title">Compte</h6>
            <router-link to="/profile" class="nav-link" @click="closeSidebar">
              <i class="bi bi-person"></i>
              <span>Mon Profil</span>
            </router-link>
            <router-link to="/notifications" class="nav-link" @click="closeSidebar">
              <i class="bi bi-bell"></i>
              <span>Notifications</span>
              <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
            </router-link>
            <router-link to="/settings" class="nav-link" @click="closeSidebar">
              <i class="bi bi-gear"></i>
              <span>Paramètres</span>
            </router-link>
          </div>

          <!-- Section Admin (si admin) -->
          <div v-if="currentUser && currentUser.role === 'admin'" class="nav-section">
            <h6 class="nav-title">Administration</h6>
            <router-link to="/dashboard" class="nav-link" @click="closeSidebar">
              <i class="bi bi-shield-lock"></i>
              <span>Gestion Système</span>
            </router-link>
          </div>

          <!-- Déconnexion -->
          <div class="nav-section border-0">
            <button @click="handleLogout" class="nav-link logout-btn">
              <i class="bi bi-box-arrow-right"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- Sidebar Overlay (Mobile) -->
    <div v-if="showSidebar && isAuthenticated" class="sidebar-overlay" @click="closeSidebar"></div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    Header
  },
  data() {
    return {
      showSidebar: false
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),
    // ✅ UTILISER LE STORE POUR LES NOTIFICATIONS
    ...mapGetters('notifications', ['unreadCount'])
  },
  mounted() {
    const isAuth = this.$store.getters['auth/isAuthenticated']
    console.log('✅ App initialisée. Authentification :', isAuth)
    
    // Fermer la sidebar au changement de route
    this.$router.afterEach(() => {
      this.closeSidebar()
    })
  },
  methods: {
    toggleSidebar() {
      this.showSidebar = !this.showSidebar
    },
    closeSidebar() {
      this.showSidebar = false
    },
    handleLogout() {
      if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        this.$store.commit('auth/LOGOUT')
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

.app-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.app-container.full-height {
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 1020;
}

.sidebar-nav {
  padding: 1.5rem 0;
}

.nav-section {
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
}

.nav-section:last-child {
  border-bottom: none;
}

.nav-section.border-0 {
  border-bottom: none;
}

.nav-title {
  padding: 0 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  letter-spacing: 0.5px;
  margin: 0 0 0.75rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 0.95rem;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #2d5f3f;
}

.nav-link.router-link-active {
  background: rgba(45, 95, 63, 0.05);
  border-left-color: #2d5f3f;
  color: #2d5f3f;
  font-weight: 600;
}

.nav-link i {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.badge {
  margin-left: auto;
  background: #dc3545;
  color: white;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.logout-btn {
  color: #dc3545;
}

.logout-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #c82333;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1015;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    height: calc(100vh - 64px);
    transform: translateX(-100%);
    z-index: 1020;
    width: 250px;
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }
}

@media (min-width: 769px) {
  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    height: calc(100vh - 64px);
    transform: translateX(-100%);
    z-index: 1020;
    width: 250px;
    transition: transform 0.3s ease;
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .main-content {
    width: 100%;
  }
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>