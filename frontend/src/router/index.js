import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ========== ROOT REDIRECT ==========
  {
    path: '/',
    redirect: '/login'
  },

  // ========== AUTH ROUTES ==========
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      requiresAuth: false,
      title: 'Connexion - Mazraa'
    }
  },

  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: {
      requiresAuth: false,
      title: 'Réinitialiser le mot de passe - Mazraa'
    }
  },

  // ========== USER DASHBOARD ==========
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashbord/dashbord.vue'),
    meta: {
      requiresAuth: true,
      title: 'Tableau de bord - Mazraa'
    }
  },

  // ========== ARTICLES ROUTES ==========
  {
    path: '/articles/create',
    name: 'CreateArticle',
    component: () => import('@/views/articles/CreateArticle.vue'),
    meta: {
      requiresAuth: true,
      title: 'Créer un article - Mazraa'
    }
  },

  {
    path: '/articles-qad',
    name: 'ArticlesQAD',
    component: () => import('@/views/articles/ArticlesQAD.vue'),
    meta: {
      requiresAuth: true,
      title: 'Articles QAD - Mazraa'
    }
  },

  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/articles/articledetails.vue'),
    meta: {
      requiresAuth: true,
      title: 'Détail article - Mazraa'
    }
  },

  // ========== VALIDATION ROUTES ==========
  {
    path: '/validate/:validationId',
    name: 'ValidateArticle',
    component: () => import('@/views/validations/ValidateArticle.vue'),
    meta: {
      requiresAuth: true,
      title: 'Valider un article - Mazraa'
    }
  },

  // ========== USER ROUTES ==========
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'Mon profil - Mazraa'
    }
  },

  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/Notifications.vue'),
    meta: {
      requiresAuth: true,
      title: 'Notifications - Mazraa'
    }
  },

  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      requiresAuth: true,
      title: 'Paramètres - Mazraa'
    }
  },

  // ========== ADMIN ROUTES ==========
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Gestion des utilisateurs - Mazraa'
    }
  },

  // ========== 404 PAGE ==========
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// ========== NAVIGATION GUARD ==========
router.beforeEach((to, from, next) => {
  // Récupérer le token du localStorage
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!token

  console.log('Navigation Guard:')
  console.log('- Route:', to.name)
  console.log('- Authentifié:', isAuthenticated)
  console.log('- Rôle:', user.role)

  // ===== CAS 1 : Route publique (login, reset-password) =====
  if (!to.meta.requiresAuth) {
    if (isAuthenticated && (to.name === 'Login' || to.name === 'ResetPassword')) {
      console.log('✅ Utilisateur connecté redirigé vers /dashboard')
      next('/dashboard')
    } else {
      console.log('✅ Accès autorisé à route publique')
      next()
    }
    return
  }

  // ===== CAS 2 : Route protégée (nécessite authentification) =====
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('❌ Utilisateur non authentifié - Redirection vers /login')
    next('/login')
    return
  }

  // ===== CAS 3 : Route admin (nécessite role admin) =====
  if (to.meta.requiresAdmin && user.role !== 'admin') {
    console.log('❌ Utilisateur non admin - Redirection vers /dashboard')
    next('/dashboard')
    return
  }

  // ===== CAS 4 : Tout est OK =====
  console.log('✅ Navigation autorisée')
  next()
})

// ========== AFTER EACH HOOK ==========
router.afterEach((to) => {
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = to.meta.title
  }
})

export default router