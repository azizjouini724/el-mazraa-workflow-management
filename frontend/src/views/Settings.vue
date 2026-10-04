<template>
  <div :style="{ 
    padding: '2rem',
    backgroundColor: settings.theme === 'dark' ? '#212529' : '#f8f9fa',
    minHeight: '100vh',
    transition: 'all 0.3s ease'
  }">
    <div class="settings-container">
      <!-- Page Header -->
      <div class="mb-4">
        <h1 class="fs-3 fw-bold mb-2">Paramètres</h1>
        <p class="text-muted mb-0">Gérez vos préférences et paramètres</p>
      </div>

      <div class="row">
        <!-- Sidebar Navigation -->
        <div class="col-lg-3 mb-4">
          <div class="settings-nav">
            <div
              v-for="item in menuItems"
              :key="item.id"
              class="nav-item"
              :class="{ active: activeTab === item.id }"
              @click="activeTab = item.id"
              role="button"
              tabindex="0"
            >
              <i :class="`bi ${item.icon}`"></i>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="col-lg-9">
          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Paramètres de Notifications</h5>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Notifications par Email</h6>
                  <p class="text-muted small mb-0">Recevoir les notifications importantes par email</p>
                </div>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="settings.emailNotifications"
                  />
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Notifications Push</h6>
                  <p class="text-muted small mb-0">Activer les notifications navigateur</p>
                </div>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="settings.pushNotifications"
                  />
                </div>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Notifications de Validation</h6>
                  <p class="text-muted small mb-0">Être notifié pour les demandes à valider</p>
                </div>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="settings.validationNotifications"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Privacy Tab -->
          <div v-if="activeTab === 'privacy'" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Confidentialité et Sécurité</h5>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Visibilité du Profil</h6>
                  <p class="text-muted small mb-0">Choisir qui peut voir votre profil</p>
                </div>
                <select 
                  class="form-select" 
                  v-model="settings.profileVisibility"
                >
                  <option value="private">Privé</option>
                  <option value="team">Mon équipe</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Authentification Deux Facteurs</h6>
                  <p class="text-muted small mb-0">Renforcer la sécurité de votre compte</p>
                </div>
                <button 
                  class="btn btn-sm btn-primary"
                  @click="show2FA = true"
                >
                  <i class="bi bi-shield-check me-2"></i>Activer
                </button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Sessions Actives</h6>
                  <p class="text-muted small mb-0">Gérer vos sessions de connexion</p>
                </div>
                <button 
                  class="btn btn-sm btn-outline-secondary"
                  @click="showSessions = true"
                >
                  <i class="bi bi-eye me-2"></i>Voir les Sessions
                </button>
              </div>
            </div>
          </div>

          <!-- Appearance Tab -->
          <div v-if="activeTab === 'appearance'" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Apparence</h5>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Thème</h6>
                  <p class="text-muted small mb-0">Choisir le thème de l'application</p>
                </div>
              </div>

              <div class="theme-options">
                <label 
                  v-for="mode in themeOptions"
                  :key="mode.value"
                  class="theme-option"
                  :class="{ active: settings.theme === mode.value }"
                >
                  <input
                    type="radio"
                    :value="mode.value"
                    v-model="settings.theme"
                  />
                  <i :class="`bi ${mode.icon}`"></i>
                  <span>{{ mode.label }}</span>
                </label>
              </div>

              <div class="setting-item mt-4">
                <div class="setting-info">
                  <h6 class="mb-1">Langue</h6>
                  <p class="text-muted small mb-0">Sélectionner votre langue</p>
                </div>
                <select 
                  class="form-select" 
                  v-model="settings.language"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Account Tab -->
          <div v-if="activeTab === 'account'" class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom">
              <h5 class="mb-0">Paramètres du Compte</h5>
            </div>
            <div class="card-body">
              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Changer le Mot de Passe</h6>
                  <p class="text-muted small mb-0">Mettre à jour votre mot de passe de sécurité</p>
                </div>
                <button 
                  class="btn btn-sm btn-primary"
                  @click="showChangePassword = true"
                >
                  <i class="bi bi-key me-2"></i>Changer
                </button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h6 class="mb-1">Télécharger vos Données</h6>
                  <p class="text-muted small mb-0">Obtenir une copie de vos données</p>
                </div>
                <button 
                  class="btn btn-sm btn-secondary"
                  @click="handleDownloadData"
                >
                  <i class="bi bi-download me-2"></i>Télécharger
                </button>
              </div>

              <div class="setting-item border-top pt-4">
                <div class="setting-info">
                  <h6 class="mb-1 text-danger">Supprimer le Compte</h6>
                  <p class="text-muted small mb-0">Supprimer définitivement votre compte et toutes les données</p>
                </div>
                <button 
                  class="btn btn-sm btn-danger"
                  @click="showDeleteAccount = true"
                >
                  <i class="bi bi-trash me-2"></i>Supprimer
                </button>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <button
            class="btn btn-primary btn-save"
            @click="saveSettings"
            :disabled="loading"
          >
            <i class="bi bi-check-circle me-2"></i>
            {{ loading ? 'Enregistrement...' : 'Enregistrer les Paramètres' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODALES ===== -->

    <!-- Modal - Change Password -->
    <div v-if="showChangePassword" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Changer le Mot de Passe</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showChangePassword = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Ancien Mot de Passe</label>
              <input
                type="password"
                class="form-control"
                v-model="passwordForm.oldPassword"
                placeholder="Entrez votre ancien mot de passe"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Nouveau Mot de Passe</label>
              <input
                type="password"
                class="form-control"
                v-model="passwordForm.newPassword"
                placeholder="Entrez votre nouveau mot de passe"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Confirmer le Mot de Passe</label>
              <input
                type="password"
                class="form-control"
                v-model="passwordForm.confirmPassword"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>
            <small class="text-muted">Le mot de passe doit contenir au moins 8 caractères</small>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showChangePassword = false"
            >
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleChangePassword"
            >
              Changer le Mot de Passe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal - 2FA -->
    <div v-if="show2FA" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Authentification Deux Facteurs</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="show2FA = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.</p>
            <p>Un code de vérification sera envoyé à votre email à chaque connexion.</p>
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Veuillez vérifier votre email pour confirmer l'activation.
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="show2FA = false"
            >
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleEnable2FA"
            >
              Activer 2FA
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal - Sessions -->
    <div v-if="showSessions" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sessions Actives</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showSessions = false"
            ></button>
          </div>
          <div class="modal-body">
            <div v-for="session in activeSessions" :key="session.id" class="session-item">
              <div>
                <div v-if="session.current" class="session-badge">Session Actuelle</div>
                <h6 class="mb-1">{{ session.device }}</h6>
                <small class="text-muted">{{ session.location }}</small><br/>
                <small class="text-muted">{{ session.lastActive }}</small>
              </div>
              <button 
                v-if="!session.current"
                class="btn btn-sm btn-outline-danger"
                @click="handleLogoutSession(session.id)"
              >
                Fermer
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showSessions = false"
            >
              Fermer
            </button>
            <button 
              type="button" 
              class="btn btn-warning" 
              @click="handleLogoutAllOthers"
            >
              Fermer Toutes les Autres
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal - Delete Account -->
    <div v-if="showDeleteAccount" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Supprimer le Compte</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showDeleteAccount = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Attention !</strong> Cette action est irréversible. Toutes vos données seront supprimées.
            </div>
            <p>Pour confirmer la suppression, veuillez :</p>
            <ol>
              <li>Entrer votre adresse email</li>
              <li>Cocher la case de confirmation</li>
            </ol>
            <div class="mb-3">
              <label class="form-label">Adresse Email</label>
              <input
                type="email"
                class="form-control"
                v-model="deleteConfirm.email"
                placeholder="user@example.com"
              />
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="deleteConfirm.confirmed"
              />
              <label class="form-check-label text-danger">
                Je confirme la suppression définitive de mon compte et de toutes mes données
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showDeleteAccount = false"
            >
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="handleDeleteAccount"
              :disabled="!deleteConfirm.email || !deleteConfirm.confirmed"
            >
              Supprimer Définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      activeTab: 'notifications',
      loading: false,
      settings: {
        emailNotifications: true,
        pushNotifications: false,
        validationNotifications: true,
        profileVisibility: 'team',
        theme: 'light',
        language: 'fr'
      },
      showChangePassword: false,
      showDeleteAccount: false,
      show2FA: false,
      showSessions: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      deleteConfirm: {
        email: '',
        confirmed: false
      },
      activeSessions: [
        { id: 1, device: 'Chrome - Windows', location: 'Tunis, TN', lastActive: 'À l\'instant', current: true },
        { id: 2, device: 'Safari - iPhone', location: 'Tunis, TN', lastActive: 'Il y a 2 heures', current: false },
        { id: 3, device: 'Firefox - Ubuntu', location: 'Tunis, TN', lastActive: 'Il y a 1 jour', current: false }
      ],
      menuItems: [
        { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
        { id: 'privacy', label: 'Sécurité', icon: 'bi-shield-lock' },
        { id: 'appearance', label: 'Apparence', icon: 'bi-palette' },
        { id: 'account', label: 'Compte', icon: 'bi-person-gear' }
      ],
      themeOptions: [
        { value: 'light', icon: 'bi-sun', label: 'Clair' },
        { value: 'dark', icon: 'bi-moon', label: 'Sombre' },
        { value: 'auto', icon: 'bi-circle-half', label: 'Auto' }
      ]
    }
  },
  mounted() {
    this.loadSettings()
  },
  watch: {
    'settings.theme'(newTheme) {
      this.applyTheme(newTheme)
    }
  },
  methods: {
    async loadSettings() {
      try {
        this.loading = true
        if (window.storage) {
          const result = await window.storage.get('user-settings')
          if (result) {
            this.settings = JSON.parse(result.value)
            console.log('✅ Paramètres chargés:', this.settings)
          }
        }
      } catch (error) {
        console.warn('Impossible de charger les paramètres:', error)
      } finally {
        this.loading = false
      }
    },
    async saveSettings() {
      try {
        this.loading = true
        if (window.storage) {
          await window.storage.set('user-settings', JSON.stringify(this.settings))
          console.log('✅ Paramètres enregistrés:', this.settings)
          alert('✅ Paramètres enregistrés avec succès!')
        } else {
          alert('❌ Stockage non disponible')
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error)
        alert('❌ Erreur lors de l\'enregistrement')
      } finally {
        this.loading = false
      }
    },
    applyTheme(theme) {
      const html = document.documentElement
      if (theme === 'dark') {
        html.setAttribute('data-bs-theme', 'dark')
      } else {
        html.removeAttribute('data-bs-theme')
      }
    },
    handleChangePassword() {
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
        alert('❌ Tous les champs sont obligatoires')
        return
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('❌ Les mots de passe ne correspondent pas')
        return
      }

      if (this.passwordForm.newPassword.length < 8) {
        alert('❌ Le mot de passe doit contenir au moins 8 caractères')
        return
      }

      console.log('Changement de mot de passe:', this.passwordForm)
      alert('✅ Mot de passe changé avec succès!')
      this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
      this.showChangePassword = false
    },
    handleEnable2FA() {
      console.log('Activation 2FA')
      alert('✅ Authentification 2FA activée! Un code a été envoyé à votre email.')
      this.show2FA = false
    },
    handleLogoutSession(sessionId) {
      this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId)
      alert('✅ Session fermée avec succès')
    },
    handleLogoutAllOthers() {
      this.activeSessions = this.activeSessions.filter(s => s.current)
      alert('✅ Toutes les autres sessions ont été fermées')
    },
    handleDownloadData() {
      try {
        const userData = {
          settings: this.settings,
          exportDate: new Date().toISOString(),
          email: 'user@example.com'
        }

        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `mes-donnees-${new Date().getTime()}.json`
        link.click()
        alert('✅ Vos données ont été téléchargées avec succès!')
      } catch (error) {
        alert('❌ Erreur lors du téléchargement')
      }
    },
    handleDeleteAccount() {
      if (!this.deleteConfirm.email || !this.deleteConfirm.confirmed) {
        alert('❌ Veuillez confirmer la suppression')
        return
      }

      console.log('Suppression du compte:', this.deleteConfirm.email)
      alert('✅ Votre compte a été supprimé définitivement')
      this.showDeleteAccount = false
      this.deleteConfirm = { email: '', confirmed: false }
    }
  }
}
</script>

<style scoped>
.settings-container {
  transition: all 0.3s ease;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: sticky;
  top: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  color: #2c3e50;
  font-weight: 500;
}

[data-bs-theme="dark"] .nav-item {
  background: #2a2a2a;
  color: #ffffff;
}

.nav-item:hover {
  background: #f0f0f0;
  transform: translateX(4px);
}

[data-bs-theme="dark"] .nav-item:hover {
  background: #333333;
}

.nav-item.active {
  background: #f8f9fa;
  border-left-color: #2d5f3f;
  color: #2d5f3f;
  font-weight: 600;
}

[data-bs-theme="dark"] .nav-item.active {
  background: #2d5f3f;
  color: #ffffff;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

[data-bs-theme="dark"] .setting-item {
  border-bottom-color: #444444;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h6 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-weight: 600;
}

[data-bs-theme="dark"] .setting-info h6 {
  color: #ffffff;
}

.form-check-input:checked {
  background-color: #2d5f3f;
  border-color: #2d5f3f;
}

.form-select {
  max-width: 200px;
  border-radius: 6px;
}

[data-bs-theme="dark"] .form-select {
  background-color: #333333;
  color: #ffffff;
  border-color: #444444;
}

.theme-options {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 100px;
  background: white;
}

[data-bs-theme="dark"] .theme-option {
  background: #2a2a2a;
  border-color: #444444;
}

.theme-option input {
  display: none;
}

.theme-option:hover {
  border-color: #2d5f3f;
  transform: translateY(-2px);
}

.theme-option.active {
  background: #f8f9fa;
  border-color: #2d5f3f;
  color: #2d5f3f;
}

[data-bs-theme="dark"] .theme-option.active {
  background: #2d5f3f;
  color: #ffffff;
  border-color: #2d5f3f;
}

.btn-primary {
  background-color: #2d5f3f;
  border-color: #2d5f3f;
}

.btn-primary:hover {
  background-color: #25453e;
  border-color: #25453e;
}

.btn-save {
  margin-top: 2rem;
  width: 100%;
}

.session-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

[data-bs-theme="dark"] .session-item {
  border-color: #444444;
  background: #2a2a2a;
}

.session-badge {
  display: inline-block;
  background: #2d5f3f;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 6px;
}

[data-bs-theme="dark"] .form-control {
  background-color: #333333;
  color: #ffffff;
  border-color: #444444;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }
  
  .col-lg-3, .col-lg-9 {
    flex: 0 0 100% !important;
  }

  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .theme-options {
    flex-direction: column;
  }
}
</style>