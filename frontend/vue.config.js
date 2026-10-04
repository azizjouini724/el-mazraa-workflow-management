const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  
  pwa: {
    name: 'EL-MAZRAA Workflow',
    shortName: 'Mazraa',
    description: 'Système de gestion des demandes de création d\'articles',
    themeColor: '#2d5f3f',
    msTileColor: '#2d5f3f',
    backgroundColor: '#ffffff',
    
    appleMobileWebAppCapable: true,
    appleMobileWebAppStatusBarStyle: 'black',
    appleMobileWebAppTitle: 'Mazraa',

    // ✅ FORCER LES ICÔNES PERSONNALISÉES
    manifestOptions: {
      name: 'EL-MAZRAA Article Workflow',
      short_name: 'Mazraa',
      description: 'Système de gestion des demandes de création d\'articles',
      background_color: '#ffffff',
      theme_color: '#2d5f3f',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/img/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/img/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },

    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      
      runtimeCaching: [
        // Cache des API - Réseau en priorité (5 min)
        {
          urlPattern: /^https?:\/\/(localhost|127\.0\.0\.1):5004\/api\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 300
            }
          }
        },
        
        // Cache des images - Cache en priorité (30 jours)
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 2592000
            }
          }
        },

        // Cache des assets (JS, CSS, fonts) - Cache en priorité (30 jours)
        {
          urlPattern: /\.(js|css|woff|woff2|eot|ttf|otf)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'assets-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 2592000
            }
          }
        }
      ]
    }
  },

  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true
      }
    }
  }
})