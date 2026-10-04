<template>
  <aside class="sidebar bg-white border-end" :class="{ collapsed: isCollapsed }">
    <nav class="nav flex-column py-3">
      <router-link 
        to="/dashboard" 
        class="nav-link d-flex align-items-center gap-3 px-4 py-3"
        active-class="active"
      >
        <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span class="nav-text">Tableau de bord</span>
      </router-link>

      <router-link 
        to="/articles/create" 
        class="nav-link d-flex align-items-center gap-3 px-4 py-3"
        active-class="active"
      >
        <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span class="nav-text">Nouvelle demande</span>
      </router-link>

      <router-link 
        to="/articles/list" 
        class="nav-link d-flex align-items-center gap-3 px-4 py-3"
        active-class="active"
      >
        <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span class="nav-text">Mes demandes</span>
      </router-link>

      <router-link 
        v-if="isValidator" 
        to="/validations" 
        class="nav-link d-flex align-items-center gap-3 px-4 py-3 position-relative"
        active-class="active"
      >
        <svg class="nav-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <span class="nav-text">À valider</span>
        <span v-if="pendingCount > 0" class="badge bg-danger rounded-pill ms-auto">
          {{ pendingCount }}
        </span>
      </router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isValidator() {
      const role = this.$store.getters.userRole
      return ['marketing', 'production', 'qualite', 'finance', 'commercial', 'controle', 'informatique'].includes(role)
    },
    pendingCount() {
      return this.$store.getters.pendingCount || 0
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1020;
}

.sidebar.collapsed {
  width: 72px;
}

.nav-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.collapsed .nav-link {
  justify-content: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #2d5f3f;
}

.nav-link.active {
  background-color: #f0fdf4;
  color: #2d5f3f;
  font-weight: 600;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #2d5f3f;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
  overflow: hidden;
}

.collapsed .nav-text {
  display: none;
}

.collapsed .badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.65rem;
  padding: 0.125rem 0.375rem;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}
</style>