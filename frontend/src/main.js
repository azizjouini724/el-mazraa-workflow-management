import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@/assets/Styles/variables.css'
import '@/assets/Styles/global.css'

const app = createApp(App)

app.use(store)
app.use(router)

// ✅ Initialiser l'authentification
console.log('🚀 Initialisation de l\'app')
store.dispatch('auth/initAuth')

// ===== ENREGISTREMENT SERVICE WORKER PWA =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(process.env.BASE_URL + 'service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré:', registration)
        setInterval(() => {
          registration.update()
        }, 60000)
      })
      .catch((error) => {
        console.error('❌ Erreur Service Worker:', error)
      })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker mis à jour!')
    })
  })
}

// ===== GESTION MODE HORS LIGNE =====
window.addEventListener('offline', () => {
  console.warn('⚠️ Mode HORS LIGNE activé')
})

window.addEventListener('online', () => {
  console.log('✅ Mode EN LIGNE')
})

app.mount('#app')

console.log('✅ App montée')