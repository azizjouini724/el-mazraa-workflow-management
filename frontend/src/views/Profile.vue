<template>
  <div class="profile-wrapper">
    <div v-if="!currentUser" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement du profil...</p>
    </div>

    <div v-else>
      <nav class="breadcrumb-nav mb-4">
        <span class="breadcrumb-item"><router-link to="/dashboard">Accueil</router-link></span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">Mon Profil</span>
      </nav>

      <div class="page-title-section mb-5">
        <h1 class="page-title">Mon Compte Professionnel</h1>
        <p class="page-subtitle">Gérez votre identité professionnelle et la sécurité de votre compte</p>
      </div>

      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h5>Modifier le Profil</h5>
            <button @click="closeEditModal" class="btn-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Nom Complet</label>
              <input type="text" class="form-control" v-model="editForm.name" placeholder="Entrez votre nom complet">
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="editForm.email" placeholder="Entrez votre email">
            </div>
            <div class="mb-3">
              <label class="form-label">Numéro de Téléphone</label>
              <input type="tel" class="form-control" v-model="editForm.phone" placeholder="Entrez votre numéro de téléphone">
            </div>
            <div v-if="editError" class="alert alert-danger mb-3">{{ editError }}</div>
          </div>
          <div class="modal-footer">
            <button @click="closeEditModal" class="btn btn-light">Annuler</button>
            <button @click="saveEditProfile" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h5>Changer le Mot de Passe</h5>
            <button @click="closePasswordModal" class="btn-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Ancien Mot de Passe</label>
              <input type="password" class="form-control" v-model="passwordForm.oldPassword" placeholder="Entrez votre ancien mot de passe">
            </div>
            <div class="mb-3">
              <label class="form-label">Nouveau Mot de Passe</label>
              <input type="password" class="form-control" v-model="passwordForm.newPassword" placeholder="Entrez votre nouveau mot de passe (min 6 caractères)">
            </div>
            <div class="mb-3">
              <label class="form-label">Confirmer le Mot de Passe</label>
              <input type="password" class="form-control" v-model="passwordForm.confirmPassword" placeholder="Confirmez votre nouveau mot de passe">
            </div>
            <div v-if="passwordError" class="alert alert-danger mb-3">{{ passwordError }}</div>
            <div v-if="passwordSuccess" class="alert alert-success mb-3">{{ passwordSuccess }}</div>
          </div>
          <div class="modal-footer">
            <button @click="closePasswordModal" class="btn btn-light">Annuler</button>
            <button @click="savePasswordChange" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Changement...' : 'Changer le Mot de Passe' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showPhotoModal" class="modal-overlay" @click="closePhotoModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h5>Changer la Photo de Profil</h5>
            <button @click="closePhotoModal" class="btn-close">&times;</button>
          </div>
          <div class="modal-body">
            <div class="photo-preview-container">
              <div v-if="photoPreview" class="photo-preview" :style="{ backgroundImage: `url(${photoPreview})` }"></div>
              <div v-else class="photo-placeholder"><i class="bi bi-image"></i><p>Aucune image sélectionnée</p></div>
            </div>
            <div class="mb-3 mt-3">
              <label class="form-label">Sélectionner une image</label>
              <input type="file" class="form-control" @change="onPhotoSelected" accept="image/jpeg,image/png,image/gif">
              <small class="text-muted">JPG, GIF ou PNG. Taille maximale de 2Mo.</small>
            </div>
            <div v-if="photoError" class="alert alert-danger mb-3">{{ photoError }}</div>
          </div>
          <div class="modal-footer">
            <button @click="closePhotoModal" class="btn btn-light">Annuler</button>
            <button @click="savePhoto" class="btn btn-primary" :disabled="isLoading || !selectedPhoto">
              {{ isLoading ? 'Chargement...' : 'Télécharger' }}
            </button>
          </div>
        </div>
      </div>

      <div class="container-fluid">
        <div class="row g-4">
          <div class="col-lg-3">
            <div class="card profile-card">
              <div class="avatar-section text-center">
                <div v-if="currentUser && currentUser.photoPath" class="avatar-container-photo">
                  <img :src="getPhotoUrl(currentUser.photoPath)" alt="Photo profil">
                </div>
                <div v-else class="avatar-container" :style="{ background: getUserColor() }">{{ userInitials }}</div>
                <h4 class="mt-3 mb-1">{{ currentUser.name }}</h4>
                <p class="role-badge">{{ userRoleLabel }}</p>
                <div class="status-badge"><span class="status-dot"></span><span>Vérifié</span></div>
              </div>
              <button @click="showPhotoModal = true" class="btn btn-primary btn-block w-100 mt-4">
                <i class="bi bi-camera"></i> Changer la photo
              </button>
              <p class="file-hint">JPG, GIF ou PNG. Taille maximale de 2Mo.</p>
            </div>
          </div>

          <div class="col-lg-9">
            <div class="card settings-card">
              <div class="card-header-custom">
                <h5 class="card-title">Informations Personnelles</h5>
                <p class="card-subtitle">Mettez à jour vos informations de base pour rester à jour.</p>
              </div>
              <div class="card-body">
                <div class="form-group-custom">
                  <label class="form-label-custom">PRÉNOM</label>
                  <p class="form-value">{{ currentUser.name.split(' ')[0] }}</p>
                  <button @click="openEditModal" class="btn-edit"><i class="bi bi-pencil"></i> Modifier</button>
                </div>
                <div class="form-group-custom">
                  <label class="form-label-custom">NOM</label>
                  <p class="form-value">{{ currentUser.name.split(' ').slice(1).join(' ') || 'N/A' }}</p>
                  <button @click="openEditModal" class="btn-edit"><i class="bi bi-pencil"></i> Modifier</button>
                </div>
                <div class="form-group-custom">
                  <label class="form-label-custom">ADRESSE EMAIL</label>
                  <p class="form-value email-verified">{{ currentUser.email }}<i class="bi bi-check-circle-fill text-success ms-2"></i></p>
                  <button @click="openEditModal" class="btn-edit"><i class="bi bi-pencil"></i> Modifier</button>
                </div>
                <div class="form-group-custom">
                  <label class="form-label-custom">NUMÉRO DE TÉLÉPHONE</label>
                  <p class="form-value">{{ currentUser.phone || 'Non défini' }}</p>
                  <button @click="openEditModal" class="btn-edit"><i class="bi bi-pencil"></i> Modifier</button>
                </div>
              </div>
            </div>

            <div class="card settings-card mt-4">
              <div class="card-header-custom">
                <h5 class="card-title">Sécurité</h5>
                <p class="card-subtitle">Gérez vos accès et la protection de vos données.</p>
              </div>
              <div class="card-body">
                <div class="form-group-custom border-bottom pb-4">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <label class="form-label-custom">MOT DE PASSE</label>
                      <p class="form-value">••••••••••••</p>
                      <p class="text-muted small">Dernière modification : {{ formatPasswordChangeDate() }}</p>
                    </div>
                    <button @click="showPasswordModal = true" class="btn btn-outline-secondary btn-sm">
                      <i class="bi bi-lock"></i> Changer le mot de passe
                    </button>
                  </div>
                </div>
                <div class="form-group-custom pt-4">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <label class="form-label-custom">AUTHENTIFICATION À DEUX FACTEURS<span class="badge bg-info text-dark ms-2">RECOMMANDÉ</span></label>
                      <p class="form-value">Désactivé</p>
                    </div>
                    <button class="btn btn-link text-primary">Activer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import authService from '@/services/authservice'

export default {
  name: 'Profile',
  data() {
    return {
      apiUrl: process.env.VUE_APP_API_URL || 'http://localhost:5004',
      showEditModal: false,
      showPasswordModal: false,
      showPhotoModal: false,
      isLoading: false,
      lastPasswordChangeDate: null,
      
      editForm: { name: '', email: '', phone: '' },
      editError: '',
      passwordForm: { oldPassword: '', newPassword: '', confirmPassword: '' },
      passwordError: '',
      passwordSuccess: '',
      selectedPhoto: null,
      photoPreview: '',
      photoError: ''
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    userInitials() {
      if (!this.currentUser || !this.currentUser.name) return 'U'
      return this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    userRoleLabel() {
      if (!this.currentUser) return 'Utilisateur'
      const role = this.currentUser.role
      const roleLabels = {
        'demandeur': 'Demandeur', 'user': 'Utilisateur', 'admin': 'Administrateur',
        'validateur_marketing': 'Validateur Marketing', 'validateur_production': 'Validateur Production',
        'validateur_qualite': 'Validateur Qualité', 'validateur_finance': 'Validateur Finance',
        'validateur_commercial': 'Validateur Commercial', 'validateur_informatique': 'Validateur Informatique'
      }
      return roleLabels[role] || role
    }
  },
  async mounted() {
    if (!this.currentUser) {
      console.log('❌ Pas d\'utilisateur, chargement du profil...')
      try {
        const result = await this.$store.dispatch('auth/fetchCurrentUser')
        if (result.success && this.currentUser) {
          console.log('✅ Profil chargé:', this.currentUser)
          this.resetForms()
          this.lastPasswordChangeDate = this.currentUser.updatedAt
        } else {
          console.log('❌ Impossible de charger le profil, redirection vers login')
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('❌ Erreur:', error)
        this.$router.push('/login')
      }
      return
    }
    this.resetForms()
    this.lastPasswordChangeDate = this.currentUser.updatedAt
  },
  methods: {
    resetForms() {
      if (this.currentUser && this.currentUser.name) {
        this.editForm = { name: this.currentUser.name, email: this.currentUser.email, phone: this.currentUser.phone || '' }
      }
    },
    getUserColor() {
      const colors = ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #2d5f3f 0%, #43e97b 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)']
      return colors[this.userInitials.charCodeAt(0) % colors.length]
    },
    openEditModal() { this.editError = ''; this.showEditModal = true },
    closeEditModal() { this.showEditModal = false; this.editError = ''; this.resetForms() },
    async saveEditProfile() {
      if (!this.editForm.name || !this.editForm.name.trim()) { this.editError = 'Le nom est obligatoire'; return }
      if (!this.editForm.email || !this.editForm.email.trim()) { this.editError = 'L\'email est obligatoire'; return }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.editForm.email)) { this.editError = 'Email invalide'; return }
      try {
        this.isLoading = true; this.editError = ''
        const response = await authService.updateProfile({ name: this.editForm.name, email: this.editForm.email, phone: this.editForm.phone })
        if (response.success) {
          this.$store.commit('auth/setCurrentUser', { ...this.currentUser, name: this.editForm.name, email: this.editForm.email, phone: this.editForm.phone })
          this.closeEditModal()
          alert('Profil mis à jour avec succès!')
        } else { this.editError = response.message || 'Erreur lors de la mise à jour' }
      } catch (error) { console.error('Erreur:', error); this.editError = 'Une erreur s\'est produite' }
      finally { this.isLoading = false }
    },
    closePasswordModal() { this.showPasswordModal = false; this.passwordError = ''; this.passwordSuccess = ''; this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' } },
    async savePasswordChange() {
      if (!this.passwordForm.oldPassword) { this.passwordError = 'L\'ancien mot de passe est obligatoire'; return }
      if (!this.passwordForm.newPassword) { this.passwordError = 'Le nouveau mot de passe est obligatoire'; return }
      if (this.passwordForm.newPassword.length < 6) { this.passwordError = 'Le mot de passe doit contenir au minimum 6 caractères'; return }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) { this.passwordError = 'Les mots de passe ne correspondent pas'; return }
      if (this.passwordForm.oldPassword === this.passwordForm.newPassword) { this.passwordError = 'Le nouveau mot de passe doit être différent de l\'ancien'; return }
      try {
        this.isLoading = true; this.passwordError = ''; this.passwordSuccess = ''
        const response = await authService.changePassword({ oldPassword: this.passwordForm.oldPassword, newPassword: this.passwordForm.newPassword })
        if (response.success) { 
          this.passwordSuccess = 'Mot de passe changé avec succès!'
          await this.$store.dispatch('auth/fetchCurrentUser')
          setTimeout(() => { this.closePasswordModal() }, 2000) 
        }
        else { this.passwordError = response.message || 'Erreur lors du changement du mot de passe' }
      } catch (error) { console.error('Erreur:', error); this.passwordError = 'Une erreur s\'est produite' }
      finally { this.isLoading = false }
    },
    closePhotoModal() { this.showPhotoModal = false; this.photoError = ''; this.photoPreview = ''; this.selectedPhoto = null },
    onPhotoSelected(event) {
      const file = event.target.files[0]
      if (!file) return
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) { this.photoError = 'La taille de l\'image ne doit pas dépasser 2MB'; return }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) { this.photoError = 'Format d\'image non valide. Utilisez JPG, PNG ou GIF'; return }
      this.photoError = ''; this.selectedPhoto = file
      const reader = new FileReader()
      reader.onload = (e) => { this.photoPreview = e.target.result }
      reader.readAsDataURL(file)
    },
    async savePhoto() {
      if (!this.selectedPhoto) { this.photoError = 'Veuillez sélectionner une image'; return }
      try {
        this.isLoading = true; this.photoError = ''
        const formData = new FormData()
        formData.append('photo', this.selectedPhoto)
        const response = await authService.uploadPhoto(formData)
        if (response.success) {
          this.$store.commit('auth/setCurrentUser', { ...this.currentUser, photoPath: response.data.photoPath })
          alert('Photo mise à jour avec succès!')
          this.closePhotoModal()
        } else { this.photoError = response.message || 'Erreur lors du téléchargement' }
      } catch (error) { console.error('Erreur:', error); this.photoError = 'Une erreur s\'est produite' }
      finally { this.isLoading = false }
    },
    formatPasswordChangeDate() {
      if (!this.lastPasswordChangeDate) return 'N/A'
      const date = new Date(this.lastPasswordChangeDate)
      const now = new Date()
      const diff = Math.floor((now - date) / 1000)
      
      if (diff < 60) return 'À l\'instant'
      if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} minute(s)`
      if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} heure(s)`
      if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)} jour(s)`
      return `Il y a ${Math.floor(diff / 2592000)} mois`
    },

    getPhotoUrl(photoPath) {
  if (!photoPath) return null
  if (photoPath.startsWith('http')) return photoPath
  // ✅ port 5004 hardcodé directement
  if (!photoPath.startsWith('/')) {
    return `http://localhost:5004/uploads/${photoPath}`
  }
  return `http://localhost:5004${photoPath}`
},
  }
}
</script>

<style scoped>
.profile-wrapper { padding: 2rem; background-color: #f8f9fc; min-height: calc(100vh - 64px); }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 64px); gap: 1rem; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #0066cc; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.breadcrumb-nav { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #6c757d; }
.breadcrumb-item a { color: #0066cc; text-decoration: none; }
.breadcrumb-item a:hover { text-decoration: underline; }
.breadcrumb-item.active { color: #2c3e50; font-weight: 600; }
.page-title-section { margin-bottom: 3rem; }
.page-title { font-size: 2rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem 0; }
.page-subtitle { color: #6c757d; font-size: 1rem; margin: 0; }
.card { border: 1px solid #e9ecef; border-radius: 10px; background: white; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); }
.card:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1); }
.profile-card { padding: 2rem 1.5rem; }
.settings-card { padding: 0; overflow: hidden; }
.card-header-custom { padding: 2rem; border-bottom: 1px solid #e9ecef; background-color: #fafbfc; }
.card-title { font-size: 1.25rem; font-weight: 700; color: #2c3e50; margin: 0 0 0.5rem 0; }
.card-subtitle { color: #6c757d; font-size: 0.9rem; margin: 0; }
.card-body { padding: 2rem; }
.avatar-section { text-align: center; padding-bottom: 2rem; border-bottom: 1px solid #e9ecef; }
.avatar-container { width: 140px; height: 140px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 3rem; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.avatar-container-photo { width: 140px; height: 140px; border-radius: 50%; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.avatar-container-photo img { width: 100%; height: 100%; object-fit: cover; }
.avatar-section h4 { font-weight: 700; color: #2c3e50; margin-top: 1.5rem; }
.role-badge { color: #6c757d; font-size: 0.95rem; margin: 0.5rem 0; }
.status-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; background-color: #e8f5e9; border-radius: 20px; color: #2e7d32; font-weight: 600; font-size: 0.85rem; margin-top: 1rem; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #2e7d32; }
.btn-block { width: 100%; padding: 0.75rem 1.5rem; background-color: #0066cc; border: none; color: white; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-block:hover { background-color: #0052a3; }
.file-hint { font-size: 0.8rem; color: #6c757d; margin-top: 0.5rem; }
.form-group-custom { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #e9ecef; }
.form-group-custom:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.form-label-custom { display: block; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #6c757d; margin-bottom: 0.5rem; }
.form-value { font-size: 1rem; color: #2c3e50; margin: 0.5rem 0; font-weight: 500; }
.email-verified { display: flex; align-items: center; gap: 0.5rem; }
.btn-edit { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0; background: none; border: none; color: #0066cc; font-weight: 600; cursor: pointer; margin-top: 0.5rem; font-size: 0.9rem; }
.btn-edit:hover { text-decoration: underline; }
.form-control { border: 1px solid #e9ecef; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.95rem; width: 100%; }
.form-control:focus { border-color: #0066cc; box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1); outline: none; }
.btn { border-radius: 6px; font-weight: 600; padding: 0.6rem 1.2rem; font-size: 0.9rem; border: none; cursor: pointer; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background-color: #0066cc; color: white; }
.btn-primary:hover:not(:disabled) { background-color: #0052a3; }
.btn-light { background-color: #e9ecef; color: #2c3e50; }
.btn-light:hover { background-color: #dee2e6; }
.btn-outline-secondary { border: 1px solid #dee2e6; color: #6c757d; background: white; }
.btn-outline-secondary:hover { background-color: #f8f9fa; }
.btn-sm { padding: 0.4rem 0.75rem; font-size: 0.85rem; }
.btn-link { background: none; border: none; color: #0066cc; font-weight: 600; padding: 0; }
.btn-link:hover { text-decoration: underline; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-content { background: white; border-radius: 10px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e9ecef; }
.modal-header h5 { margin: 0; color: #2c3e50; font-weight: 600; }
.btn-close { background: none; border: none; font-size: 1.8rem; color: #6c757d; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.btn-close:hover { color: #2c3e50; }
.modal-body { padding: 1.5rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e9ecef; }
.form-label { font-weight: 600; margin-bottom: 0.5rem; color: #2c3e50; font-size: 0.9rem; }
.mb-3 { margin-bottom: 1rem; }
.badge { padding: 0.35rem 0.65rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; }
.bg-info { background-color: #17a2b8 !important; }
.text-dark { color: #2c3e50 !important; }
.text-success { color: #28a745 !important; }
.text-muted { color: #6c757d !important; }
.text-primary { color: #0066cc !important; }
.ms-2 { margin-left: 0.5rem !important; }
.mb-1 { margin-bottom: 0.25rem !important; }
.mt-3 { margin-top: 1rem !important; }
.mt-4 { margin-top: 1.5rem !important; }
.pt-4 { padding-top: 1.5rem !important; }
.pb-4 { padding-bottom: 1.5rem !important; }
.border-bottom { border-bottom: 1px solid #e9ecef !important; }
.w-100 { width: 100% !important; }
.d-flex { display: flex !important; }
.justify-content-between { justify-content: space-between !important; }
.align-items-center { align-items: center !important; }
.align-items-start { align-items: flex-start !important; }
.text-center { text-align: center !important; }
.small { font-size: 0.875rem !important; }
.photo-preview-container { width: 100%; height: 300px; border: 2px dashed #e9ecef; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
.photo-preview { width: 100%; height: 100%; background-size: cover; background-position: center; }
.photo-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #f8f9fc; color: #6c757d; }
.photo-placeholder i { font-size: 3rem; margin-bottom: 0.5rem; }
.alert { padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.container-fluid { max-width: 100%; }
.row { margin-right: -0.5rem; margin-left: -0.5rem; }
.col-lg-3, .col-lg-9 { padding-right: 0.5rem; padding-left: 0.5rem; }
@media (max-width: 768px) {
  .profile-wrapper { padding: 1rem; }
  .page-title { font-size: 1.5rem; }
  .avatar-container, .avatar-container-photo { width: 100px; height: 100px; }
  .avatar-container { font-size: 2.5rem; }
  .btn { width: 100%; }
  .card-header-custom, .card-body { padding: 1.5rem 1rem; }
  .d-flex { flex-direction: column; }
  .modal-content { width: 95%; }
}
</style>