<template>
  <div class="container-fluid admin-dashboard py-4">
    <!-- Page Header -->
    <div class="row mb-5">
      <div class="col-md-8">
        <h1 class="h2 fw-bold mb-2">
          <i class="bi bi-people-fill text-primary"></i> Gestion des Utilisateurs
        </h1>
        <p class="text-muted">Ajoutez, modifiez ou supprimez des utilisateurs</p>
      </div>
      <div class="col-md-4 text-end">
        <button @click="openAddUserModal()" class="btn btn-primary btn-lg">
          <i class="bi bi-plus-circle me-2"></i> Ajouter un utilisateur
        </button>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle me-2"></i>
      <strong>Succès!</strong> {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-circle me-2"></i>
      <strong>Erreur!</strong> {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-4 mb-5">
      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                <i class="bi bi-people text-primary fs-4"></i>
              </div>
              <div>
                <small class="text-muted d-block">Utilisateurs Total</small>
                <h5 class="mb-0 fw-bold">{{ filteredUsers.length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3">
                <i class="bi bi-check-circle text-success fs-4"></i>
              </div>
              <div>
                <small class="text-muted d-block">Utilisateurs Actifs</small>
                <h5 class="mb-0 fw-bold">{{ filteredUsers.filter(u => u.active !== false).length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
                <i class="bi bi-x-circle text-danger fs-4"></i>
              </div>
              <div>
                <small class="text-muted d-block">Utilisateurs Inactifs</small>
                <h5 class="mb-0 fw-bold">{{ filteredUsers.filter(u => u.active === false).length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                <i class="bi bi-clipboard-check text-warning fs-4"></i>
              </div>
              <div>
                <small class="text-muted d-block">Validateurs</small>
                <h5 class="mb-0 fw-bold">{{ filteredUsers.filter(u => u.role.startsWith('validateur_')).length }}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3 border-bottom">
        <div class="row align-items-center g-2">
          <div class="col-md-6">
            <h5 class="mb-0 fw-bold">
              <i class="bi bi-table me-2"></i> Liste des utilisateurs
            </h5>
            <small class="text-muted">{{ filteredUsers.length }} utilisateur(s)</small>
          </div>
          <div class="col-md-6">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Chercher un utilisateur..."
            />
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <div v-if="filteredUsers.length === 0" class="text-center py-5">
          <i class="bi bi-inbox display-4 text-muted"></i>
          <h5 class="mt-3">Aucun utilisateur trouvé</h5>
          <p class="text-muted">Créez votre premier utilisateur</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user._id">
                <td>
                  <div class="d-flex align-items-center">
                    <div 
                      class="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                      :style="{ background: getUserColor(user.name), width: '40px', height: '40px' }"
                    >
                      {{ getInitials(user.name) }}
                    </div>
                    <span class="fw-500">{{ user.name }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" :class="getRoleBadgeClass(user.role)">
                    {{ formatRole(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="user.active !== false ? 'bg-success' : 'bg-danger'">
                    <i class="bi" :class="user.active !== false ? 'bi-check-circle me-1' : 'bi-x-circle me-1'"></i>
                    {{ user.active !== false ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="text-muted small">{{ formatDate(user.createdAt) }}</td>
                <td class="text-end">
                  <button 
                    @click="openEditUserModal(user)" 
                    class="btn btn-sm btn-outline-primary me-2"
                    title="Modifier"
                  >
                    <i class="bi bi-pencil"></i> 
                  </button>
                  <button 
                    @click="openDeleteModal(user)" 
                    class="btn btn-sm btn-outline-danger"
                    title="Supprimer"
                  >
                    <i class="bi bi-trash"></i> 
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========== MODAL AJOUTER/MODIFIER UTILISATEUR ========== -->
    <div v-if="isAddUserModalOpen" class="modal-overlay" @click.self="closeAddUserModal()">
      <div class="modal-dialog modal-professional">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header-professional">
            <div class="modal-title-section">
              <h5 class="modal-title-professional">
                {{ editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur' }}
              </h5>
              <p class="modal-subtitle">{{ editingUser ? 'Mettez à jour les informations' : 'Remplissez les informations ci-dessous' }}</p>
            </div>
            <button type="button" class="btn-close" @click="closeAddUserModal()"></button>
          </div>

          <form @submit.prevent="saveUser" class="form-professional">
            <div class="modal-body-professional">
              <!-- Nom -->
              <div class="form-section">
                <label class="form-label-professional">Nom complet</label>
                <input 
                  v-model="userForm.name" 
                  type="text" 
                  class="form-control-professional" 
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <!-- Email -->
              <div class="form-section">
                <label class="form-label-professional">Adresse email</label>
                <input 
                  v-model="userForm.email" 
                  type="email" 
                  class="form-control-professional" 
                  placeholder="jean.dupont@exemple.com"
                  required
                />
              </div>

              <!-- Rôle -->
              <div class="form-section">
                <label class="form-label-professional">Rôle</label>
                <select v-model="userForm.role" class="form-control-professional" required>
                  <option value="">Sélectionner un rôle</option>
                  <optgroup label="Utilisateur">
                    <option value="user">Utilisateur Normal</option>
                    <option value="demandeur">Demandeur (Créateur d'articles)</option>
                  </optgroup>
                  <optgroup label="Validateurs">
                    <option value="validateur_marketing">Validateur Marketing</option>
                    <option value="validateur_production">Validateur Production</option>
                    <option value="validateur_qualite">Validateur Qualité</option>
                    <option value="validateur_finance">Validateur Finance</option>
                    <option value="validateur_commercial">Validateur Commercial</option>
                    <option value="validateur_essanaouber">Validateur Essanaouber</option>
                    <option value="validateur_gms">Validateur GMS</option>
                    <option value="validateur_export">Validateur Export</option>
                    <option value="validateur_ucpc">Validateur UCPC</option>
                    <option value="validateur_controle">Validateur Contrôle</option>
                    <option value="validateur_informatique">Validateur Informatique</option>
                  </optgroup>
                </select>
              </div>

              <!-- Mot de passe (seulement pour nouvelle création) -->
              <div v-if="!editingUser" class="form-section">
                <label class="form-label-professional">Mot de passe</label>
                <input 
                  v-model="userForm.password" 
                  type="password" 
                  class="form-control-professional" 
                  placeholder="Entrez un mot de passe sécurisé"
                  required
                />
                <small class="form-help-text">Minimum 6 caractères</small>
              </div>

              <!-- Statut Actif/Inactif -->
              <div class="form-section form-switch-section">
                <label class="form-label-professional">Statut du compte</label>
                <div class="form-switch-wrapper">
                  <label class="form-switch-label">
                    <input 
                      v-model="userForm.active" 
                      type="checkbox" 
                      class="form-switch-input"
                    />
                    <span class="form-switch-slider"></span>
                    <span class="form-switch-text">{{ userForm.active ? 'Actif' : 'Inactif' }}</span>
                  </label>
                </div>
              </div>

              <!-- Messages d'erreur -->
              <div v-if="errorMessage" class="alert-form">
                <i class="bi bi-exclamation-circle me-2"></i>
                {{ errorMessage }}
              </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer-professional">
              <button type="button" class="btn btn-secondary-professional" @click="closeAddUserModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary-professional" :disabled="loadingForm">
                <span v-if="loadingForm">
                  <i class="bi bi-hourglass-split me-2"></i>En cours...
                </span>
                <span v-else>{{ editingUser ? 'Mettre à jour' : 'Créer le compte' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ========== MODAL CONFIRMATION SUPPRESSION ========== -->
    <div v-if="isDeleteModalOpen" class="modal-overlay" @click.self="closeDeleteModal()">
      <div class="modal-dialog modal-delete">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header-delete">
            <div class="delete-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <h5 class="modal-title-delete">Confirmer la suppression</h5>
          </div>

          <!-- Body -->
          <div class="modal-body-delete">
            <p class="delete-message">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.name }}</strong> ?
            </p>
            <p class="delete-warning">
              <i class="bi bi-info-circle me-2"></i>
              Cette action est irréversible et ne peut pas être annulée.
            </p>
          </div>

          <!-- Footer -->
          <div class="modal-footer-delete">
            <button type="button" class="btn btn-secondary-professional" @click="closeDeleteModal()" :disabled="loadingForm">
              Annuler
            </button>
            <button type="button" class="btn btn-danger-professional" @click="deleteUser" :disabled="loadingForm">
              <span v-if="loadingForm">
                <i class="bi bi-hourglass-split me-2"></i>Suppression...
              </span>
              <span v-else>
                <i class="bi bi-trash me-2"></i> Supprimer définitivement
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/services/api'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      allUsers: [],
      searchQuery: '',
      isAddUserModalOpen: false,
      isDeleteModalOpen: false,
      loadingForm: false,
      editingUser: null,
      userToDelete: null,
      successMessage: '',
      errorMessage: '',
      userForm: {
        name: '',
        email: '',
        role: '',
        password: '',
        active: true
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    filteredUsers() {
      return this.allUsers
        .filter(user => user.role !== 'admin')
        .filter(user => {
          const query = this.searchQuery.toLowerCase()
          return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
          )
        })
    }
  },
  methods: {
    async loadUsers() {
      try {
        const response = await api.get('/auth/users')
        
        if (response.data.success) {
          this.allUsers = response.data.data || []
        }
      } catch (err) {
        console.error('Erreur:', err)
        this.showError(err.response?.data?.message || 'Erreur serveur')
      }
    },

    openAddUserModal() {
      this.editingUser = null
      this.userForm = {
        name: '',
        email: '',
        role: '',
        password: '',
        active: true
      }
      this.errorMessage = ''
      this.isAddUserModalOpen = true
    },

    openEditUserModal(user) {
      this.editingUser = user
      this.userForm = {
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
        active: user.active
      }
      this.errorMessage = ''
      this.isAddUserModalOpen = true
    },

    closeAddUserModal() {
      this.isAddUserModalOpen = false
      this.editingUser = null
      this.userForm = {
        name: '',
        email: '',
        role: '',
        password: '',
        active: true
      }
    },

    openDeleteModal(user) {
      this.userToDelete = user
      this.isDeleteModalOpen = true
    },

    closeDeleteModal() {
      this.isDeleteModalOpen = false
      this.userToDelete = null
    },

    async saveUser() {
      this.errorMessage = ''

      if (!this.userForm.name.trim() || !this.userForm.email.trim() || !this.userForm.role) {
        this.errorMessage = 'Tous les champs sont requis'
        return
      }

      if (!this.editingUser && !this.userForm.password) {
        this.errorMessage = 'Le mot de passe est requis'
        return
      }

      if (!this.editingUser && this.userForm.password.length < 6) {
        this.errorMessage = 'Le mot de passe doit contenir au minimum 6 caractères'
        return
      }

      this.loadingForm = true

      try {
        if (this.editingUser) {
          const response = await api.put(`/auth/users/${this.editingUser._id}`, {
            name: this.userForm.name,
            email: this.userForm.email,
            role: this.userForm.role,
            active: this.userForm.active
          })
          
          // Mettre à jour l'utilisateur localement dans la liste
          const userIndex = this.allUsers.findIndex(u => u._id === this.editingUser._id)
          if (userIndex !== -1) {
            this.allUsers[userIndex] = {
              ...this.allUsers[userIndex],
              name: this.userForm.name,
              email: this.userForm.email,
              role: this.userForm.role,
              active: this.userForm.active
            }
          }
          
          this.successMessage = 'Utilisateur mis à jour avec succès'
        } else {
          await api.post('/auth/register', this.userForm)
          this.successMessage = 'Utilisateur créé avec succès'
        }

        await new Promise(resolve => setTimeout(resolve, 500))
        this.closeAddUserModal()
        
        // Recharger seulement pour les nouveaux utilisateurs
        if (!this.editingUser) {
          this.loadUsers()
        }
      } catch (err) {
        console.error('Erreur:', err)
        this.errorMessage = err.response?.data?.message || 'Erreur serveur'
      } finally {
        this.loadingForm = false
      }
    },

    async deleteUser() {
      if (!this.userToDelete) return

      this.loadingForm = true

      try {
        await api.delete(`/auth/users/${this.userToDelete._id}`)

        this.successMessage = 'Utilisateur supprimé avec succès'
        await new Promise(resolve => setTimeout(resolve, 500))
        this.closeDeleteModal()
        this.loadUsers()
      } catch (err) {
        console.error('Erreur:', err)
        this.errorMessage = err.response?.data?.message || 'Erreur serveur'
      } finally {
        this.loadingForm = false
      }
    },

    showError(message) {
      this.errorMessage = message
    },

    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },

    getUserColor(name) {
      const colors = ['#2d5f3f', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
      return colors[name.charCodeAt(0) % colors.length]
    },

    formatRole(role) {
      const roleMap = {
        'user': 'Utilisateur',
        'demandeur': 'Demandeur',
        'admin': 'Admin',
        'validateur_marketing': 'Validateur Marketing',
        'validateur_production': 'Validateur Production',
        'validateur_qualite': 'Validateur Qualité',
        'validateur_finance': 'Validateur Finance',
        'validateur_commercial': 'Validateur Commercial',
        'validateur_essanaouber': 'Validateur Essanaouber',
        'validateur_gms': 'Validateur GMS',
        'validateur_export': 'Validateur Export',
        'validateur_ucpc': 'Validateur UCPC',
        'validateur_controle': 'Validateur Contrôle',
        'validateur_informatique': 'Validateur Informatique'
      }
      return roleMap[role] || role
    },

    getRoleBadgeClass(role) {
      if (role === 'admin') return 'bg-danger'
      if (role === 'demandeur' || role === 'user') return 'bg-info'
      if (role.startsWith('validateur_')) return 'bg-success'
      return 'bg-secondary'
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    }
  },
  mounted() {
    if (this.currentUser?.role !== 'admin') {
      this.$router.push('/dashboard')
      return
    }
    
    this.loadUsers()
  }
}
</script>

<style scoped>
.admin-dashboard {
  background: linear-gradient(135deg, #f5f6f7 0%, #f0f4f3 100%);
  min-height: calc(100vh - 64px);
}

.card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.card:hover {
  box-shadow: 0 12px 24px rgba(45, 95, 63, 0.12) !important;
  transform: translateY(-4px);
  border-color: #43e97b !important;
}

.card-header {
  background: linear-gradient(135deg, rgba(45, 95, 63, 0.05) 0%, rgba(67, 233, 123, 0.05) 100%) !important;
}

.table-hover tbody tr:hover {
  background-color: #f9fafb;
  border-left: 3px solid #43e97b;
}

.fw-500 {
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #2d5f3f 0%, #43e97b 100%) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(45, 95, 63, 0.2) !important;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 95, 63, 0.3) !important;
}

.btn-lg {
  padding: 0.75rem 1.5rem !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline-primary {
  color: #2d5f3f !important;
  border-color: #2d5f3f !important;
}

.btn-outline-primary:hover {
  background: #2d5f3f !important;
  color: white !important;
}

.btn-outline-danger {
  color: #dc2626 !important;
  border-color: #dc2626 !important;
}

.btn-outline-danger:hover {
  background: #dc2626 !important;
  color: white !important;
}

.badge {
  font-weight: 500;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
}

.bg-info {
  background: linear-gradient(135deg, rgba(45, 95, 63, 0.1) 0%, rgba(67, 233, 123, 0.1) 100%) !important;
  color: #2d5f3f !important;
  border: 1px solid rgba(45, 95, 63, 0.2);
}

.bg-success {
  background: linear-gradient(135deg, #dcfce7 0%, #c6f6d5 100%) !important;
  color: #15803d !important;
}

/* ========== MODAL OVERLAY ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  animation: slideUp 0.3s ease-in-out;
}

.modal-professional {
  max-width: 550px;
}

.modal-delete {
  max-width: 420px;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  display: flex;
  flex-direction: column;
  border: none;
}

/* ========== MODAL HEADER (CREATE/EDIT) ========== */
.modal-header-professional {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(45, 95, 63, 0.05) 0%, rgba(67, 233, 123, 0.05) 100%);
}

.modal-title-section {
  flex: 1;
}

.modal-title-professional {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d5f3f;
  margin: 0;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: #6c757d;
  margin: 0;
}

/* ========== MODAL BODY ========== */
.modal-body-professional {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.form-section {
  margin-bottom: 1.75rem;
}

.form-label-professional {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d5f3f;
  margin-bottom: 0.75rem;
}

.form-control-professional {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-control-professional::placeholder {
  color: #9ca3af;
}

.form-control-professional:focus {
  outline: none;
  border-color: #2d5f3f;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(45, 95, 63, 0.1);
}

.form-help-text {
  display: block;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

/* ========== FORM SWITCH ========== */
.form-switch-section {
  margin-bottom: 1rem;
}

.form-switch-wrapper {
  display: flex;
  align-items: center;
}

.form-switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
}

.form-switch-input {
  display: none;
}

.form-switch-slider {
  position: relative;
  width: 50px;
  height: 28px;
  background: #ccc;
  border-radius: 14px;
  transition: background 0.3s ease;
}

.form-switch-slider::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: left 0.3s ease;
}

.form-switch-input:checked + .form-switch-slider {
  background: #2d5f3f;
}

.form-switch-input:checked + .form-switch-slider::after {
  left: 24px;
}

.form-switch-text {
  font-size: 0.95rem;
  color: #2d5f3f;
  font-weight: 500;
}

/* ========== ALERT FORM ========== */
.alert-form {
  padding: 0.875rem 1rem;
  background: #fff5f5;
  border: 1px solid #ffcccc;
  border-radius: 8px;
  color: #c0392b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* ========== MODAL FOOTER ========== */
.modal-footer-professional {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* ========== BUTTONS ========== */
.btn-primary-professional {
  padding: 0.85rem 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2d5f3f 0%, #43e97b 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(45, 95, 63, 0.2);
}

.btn-primary-professional:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e4620 0%, #2db86a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 95, 63, 0.3);
}

.btn-primary-professional:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary-professional {
  padding: 0.85rem 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary-professional:hover:not(:disabled) {
  background: #e0e0e0;
}

.btn-secondary-professional:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger-professional {
  padding: 0.85rem 2rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  background: #dc3545;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-danger-professional:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-danger-professional:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ========== MODAL DELETE ========== */
.modal-header-delete {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
  text-align: center;
  background: linear-gradient(135deg, rgba(45, 95, 63, 0.05) 0%, rgba(67, 233, 123, 0.05) 100%);
}

.delete-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: #fff5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #dc3545;
}

.modal-title-delete {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d5f3f;
  margin: 0;
}

.modal-body-delete {
  padding: 2rem;
}

.delete-message {
  font-size: 0.95rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.delete-warning {
  padding: 0.875rem 1rem;
  background: #fffbf0;
  border-left: 4px solid #ff9800;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  display: flex;
  align-items: flex-start;
}

.modal-footer-delete {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #6c757d;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: #2d5f3f;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 576px) {
  .modal-dialog {
    width: 95%;
  }

  .modal-header-professional,
  .modal-body-professional,
  .modal-footer-professional,
  .modal-header-delete,
  .modal-body-delete,
  .modal-footer-delete {
    padding: 1.5rem;
  }

  .modal-title-professional {
    font-size: 1.25rem;
  }
}
</style>