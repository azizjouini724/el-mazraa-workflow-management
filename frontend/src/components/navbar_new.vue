<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-brand">
        <img src="@/assets/images/logoMazra.png" alt="EL-MAZRAA" class="logo" />
        <span class="brand-text">EL-MAZRAA</span>
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
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
        <button @click="handleLogout" class="btn-logout">
          Déconnexion
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
        Validations
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
  background: linear-gradient(135deg, #2d5f3f 0%, #1a3d28 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.logo {
  height: 40px;
  width: auto;
}

.brand-text {
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 0;
  margin: 0;
  padding: 0;
  flex: 1;
  justify-content: center;
}

.navbar-menu li {
  margin: 0;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-link.router-link-active {
  color: #b8941f;
  background-color: rgba(184, 148, 31, 0.1);
  border-bottom: 2px solid #b8941f;
}

.badge-notify {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  background: #b8941f;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.btn-logout {
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
  padding: 0.5rem;
}

.hamburger {
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  display: block;
}

.hamburger::before,
.hamburger::after {
  content: '';
  display: block;
  width: 25px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-toggle.active .hamburger {
  transform: rotate(45deg) translate(10px, 10px);
}

.mobile-toggle.active .hamburger::before {
  opacity: 0;
}

.mobile-toggle.active .hamburger::after {
  transform: rotate(-90deg) translate(-10px, 10px);
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0;
  background: rgba(26, 61, 40, 0.98);
  padding: 1rem 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-menu.active {
  max-height: 500px;
}

.mobile-menu a,
.mobile-menu button {
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mobile-menu a:hover,
.mobile-menu button:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

@media (max-width: 768px) {
  .navbar-menu,
  .navbar-user {
    display: none;
  }

  .mobile-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }

  .navbar-container {
    padding: 0 1rem;
  }
}
</style>
