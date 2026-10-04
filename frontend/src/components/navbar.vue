<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-brand">
        <img src="@/assets/images/logoMazra.png" alt="EL-MAZRAA" class="logo" />
        <span class="brand-text">Workflow Création Article</span>
      </div>

      <!-- Menu Desktop -->
      <ul class="navbar-menu">
        <li>
          <router-link to="/dashboard" class="nav-link">
            Tableau de bord
          </router-link>
        </li>
        <li>
          <router-link to="/articles/create" class="nav-link">
            Nouvelle demande
          </router-link>
        </li>
        <li>
          <router-link to="/articles/list" class="nav-link">
            Mes demandes
          </router-link>
        </li>
        <li v-if="isValidator">
          <router-link to="/validations" class="nav-link">
            Validations
            <span v-if="pendingCount > 0" class="badge-notify">{{ pendingCount }}</span>
          </router-link>
        </li>
      </ul>

      <!-- User Menu -->
      <div class="navbar-user">
        <div class="user-avatar" v-if="userAvatar">
          <img :src="userAvatar" alt="Avatar" />
        </div>
        <div class="user-avatar user-avatar-fallback" v-else>
          {{ initials }}
        </div>

        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>

        <button @click="handleLogout" class="btn-logout" aria-label="Déconnexion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Toggle -->
      <button class="mobile-toggle" @click="toggleMobileMenu">
        <span class="hamburger"></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
      <router-link to="/dashboard" @click="closeMobileMenu">Tableau de bord</router-link>
      <router-link to="/articles/create" @click="closeMobileMenu">Nouvelle demande</router-link>
      <router-link to="/articles/list" @click="closeMobileMenu">Mes demandes</router-link>
      <router-link v-if="isValidator" to="/validations" @click="closeMobileMenu">
        À valider
        <span v-if="pendingCount > 0" class="badge-notify">{{ pendingCount }}</span>
      </router-link>
      <button @click="handleLogout" class="btn-logout-mobile">Déconnexion</button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      mobileMenuOpen: false,
      pendingCount: 0
    }
  },
  computed: {
    userName() {
      return this.$store.state.auth.user?.name || 'Utilisateur'
    },
    userRole() {
      return this.$store.state.auth.user?.role || 'Employé'
    },
    userAvatar() {
      return this.$store.state.auth.user?.avatarUrl || this.$store.state.auth.user?.photo || null
    },
    initials() {
      const name = this.userName || ''
      return name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0,2)
    },
    isValidator() {
      const role = this.$store.state.auth.user?.role
      return ['marketing', 'production', 'qualite', 'finance', 'commercial', 'controle', 'informatique'].includes(role)
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },
    handleLogout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.navbar {
  background: var(--primary-color);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 45px;
  width: auto;
}

.brand-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.15);
}

.nav-link .icon {
  font-size: 1.2rem;
}

.badge-notify {
  background: var(--danger-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: white;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  color: var(--accent-color);
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: transparent;
  color: rgba(255,255,255,0.95);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.12s ease;
  font-weight: 600;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.95);
  color: var(--primary-color);
  border-color: rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger {
  display: block;
  width: 28px;
  height: 3px;
  background: white;
  position: relative;
  transition: all 0.3s;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 3px;
  background: white;
  transition: all 0.3s;
}

.hamburger::before {
  top: -8px;
}

.hamburger::after {
  bottom: -8px;
}

.mobile-menu {
  display: none;
}

/* Responsive */
@media (max-width: 968px) {
  .navbar-menu,
  .user-info,
  .btn-logout {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    background: var(--primary-dark);
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .mobile-menu.active {
    max-height: 500px;
    box-shadow: var(--shadow-lg);
  }

  .mobile-menu a,
  .btn-logout-mobile {
    padding: 1rem 1.5rem;
    color: white;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.2s;
  }

  .mobile-menu a:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Avatar styles */
  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
  }
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .user-avatar-fallback {
    background: rgba(255,255,255,0.06);
  }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .btn-logout-mobile {
    background: var(--danger-color);
    border: none;
    cursor: pointer;
    font-weight: 600;
    text-align: left;
  }
}
</style>