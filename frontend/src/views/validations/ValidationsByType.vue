<template>
  <div class="validations-container">
    <div class="page-header">
      <h1>Validations - {{ formatType(validationType) }}</h1>
      <p class="text-muted">Validez les articles pour le département {{ formatType(validationType) }}</p>
    </div>

    <!-- Résumé -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="stat-card card">
          <div class="card-body">
            <p class="text-muted mb-1">Total</p>
            <h3>{{ stats.total }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card card">
          <div class="card-body">
            <p class="text-muted mb-1">En attente</p>
            <h3>{{ stats.pending }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card card">
          <div class="card-body">
            <p class="text-muted mb-1">Approuvés</p>
            <h3>{{ stats.approved }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card card">
          <div class="card-body">
            <p class="text-muted mb-1">Rejetés</p>
            <h3>{{ stats.rejected }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-section card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Statut</label>
            <select
              v-model="filters.status"
              class="form-select"
              @change="loadValidations"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">&nbsp;</label>
            <button @click="loadValidations" class="btn btn-outline-primary w-100">
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert d'erreur -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>

    <!-- Alert de succès -->
    <div v-if="success" class="alert alert-success alert-dismissible fade show">
      {{ success }}
      <button type="button" class="btn-close" @click="success = ''"></button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Liste des validations -->
    <div v-else class="validations-list">
      <div v-if="filteredValidations.length === 0" class="alert alert-info">
        Aucune validation à afficher
      </div>

      <div v-for="validation in filteredValidations" :key="validation._id" class="validation-card card mb-3">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <router-link :to="`/articles/${validation.article._id}`" class="article-title">
                {{ validation.article.title }}
              </router-link>
              
              <div class="validation-details mt-3">
                <span class="badge bg-info">
                  {{ validation.article.category }}
                </span>
                <span class="badge ms-2" :class="getStatusBadge(validation.status)">
                  {{ getStatusLabel(validation.status) }}
                </span>
                <small class="text-muted ms-2">
                  {{ formatDate(validation.createdAt) }}
                </small>
              </div>

              <div v-if="validation.comment" class="mt-3 p-3 bg-light rounded">
                <small class="d-block text-muted mb-1"><strong>Commentaire:</strong></small>
                <small class="text-dark">{{ validation.comment }}</small>
              </div>
            </div>

            <div class="col-md-4 d-flex align-items-center justify-content-end">
              <div v-if="validation.status === 'pending'" class="btn-group" role="group">
                <button
                  @click="openApproveModal(validation)"
                  class="btn btn-sm btn-success"
                >
                  Approuver
                </button>
                <button
                  @click="openRejectModal(validation)"
                  class="btn btn-sm btn-danger"
                >
                  Rejeter
                </button>
              </div>
              <div v-else class="text-center">
                <small class="d-block text-muted">Validé le</small>
                <small class="d-block">{{ formatDate(validation.validatedAt) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'approbation -->
    <div v-if="showApproveModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approuver</h5>
            <button type="button" class="btn-close" @click="showApproveModal = false"></button>
          </div>
          <div class="modal-body">
            <p><strong>Article:</strong></p>
            <p class="mb-3">{{ currentValidation?.article.title }}</p>
            <div class="mb-3">
              <label class="form-label">Commentaire (optionnel)</label>
              <textarea
                v-model="approvalComment"
                class="form-control"
                rows="3"
                placeholder="Entrez votre commentaire..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showApproveModal = false">
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="submitApproval"
              :disabled="submitting"
            >
              <span v-if="submitting">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Approbation...
              </span>
              <span v-else>Approuver</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de rejet -->
    <div v-if="showRejectModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rejeter</h5>
            <button type="button" class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <p><strong>Article:</strong></p>
            <p class="mb-3">{{ currentValidation?.article.title }}</p>
            <div class="mb-3">
              <label class="form-label">Raison du rejet</label>
              <textarea
                v-model="rejectionReason"
                class="form-control"
                rows="3"
                placeholder="Expliquez pourquoi vous rejetez cette validation..."
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRejectModal = false">
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="submitRejection"
              :disabled="submitting || !rejectionReason.trim()"
            >
              <span v-if="submitting">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Rejet...
              </span>
              <span v-else>Rejeter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import validationService from '@/services/validationservice'
import { mapGetters } from 'vuex'

export default {
  name: 'ValidationsByType',
  props: {
    type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      validations: [],
      filters: {
        status: ''
      },
      loading: false,
      error: '',
      success: '',
      showApproveModal: false,
      showRejectModal: false,
      currentValidation: null,
      approvalComment: '',
      rejectionReason: '',
      submitting: false
    }
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    validationType() {
      const typeMap = {
        'commercial': 'commercial',
        'finance': 'finance',
        'production': 'production',
        'marketing': 'marketing',
        'qualite': 'qualite',
        'controle': 'controle',
        'informatique': 'informatique'
      }
      return typeMap[this.type] || this.type
    },
    filteredValidations() {
      let validations = this.validations.filter(v => v.type === this.validationType)
      
      if (this.filters.status) {
        validations = validations.filter(v => v.status === this.filters.status)
      }
      
      return validations
    },
    stats() {
      const filtered = this.validations.filter(v => v.type === this.validationType)
      return {
        total: filtered.length,
        pending: filtered.filter(v => v.status === 'pending').length,
        approved: filtered.filter(v => v.status === 'approved').length,
        rejected: filtered.filter(v => v.status === 'rejected').length
      }
    }
  },
  methods: {
    async loadValidations() {
      this.loading = true
      this.error = ''

      try {
        const result = await validationService.getAllValidations()
        
        if (result.success) {
          this.validations = result.data.data
        } else {
          this.error = result.message
        }
      } catch (err) {
        this.error = 'Erreur lors du chargement'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    openApproveModal(validation) {
      this.currentValidation = validation
      this.approvalComment = ''
      this.showApproveModal = true
    },

    openRejectModal(validation) {
      this.currentValidation = validation
      this.rejectionReason = ''
      this.showRejectModal = true
    },

    async submitApproval() {
      if (!this.currentValidation) return

      this.submitting = true
      const result = await validationService.approveValidation(
        this.currentValidation._id,
        this.approvalComment
      )

      if (result.success) {
        this.success = 'Validation approuvée avec succès'
        this.showApproveModal = false
        this.loadValidations()
        setTimeout(() => this.success = '', 3000)
      } else {
        this.error = result.message || 'Erreur lors de l\'approbation'
      }

      this.submitting = false
    },

    async submitRejection() {
      if (!this.currentValidation || !this.rejectionReason.trim()) return

      this.submitting = true
      const result = await validationService.rejectValidation(
        this.currentValidation._id,
        this.rejectionReason
      )

      if (result.success) {
        this.success = 'Validation rejetée'
        this.showRejectModal = false
        this.loadValidations()
        setTimeout(() => this.success = '', 3000)
      } else {
        this.error = result.message || 'Erreur lors du rejet'
      }

      this.submitting = false
    },

    formatType(type) {
      const types = {
        commercial: 'Commercial',
        finance: 'Finance',
        production: 'Production',
        marketing: 'Marketing',
        qualite: 'Qualité',
        controle: 'Contrôle',
        informatique: 'Informatique'
      }
      return types[type] || type
    },

    getStatusBadge(status) {
      const badges = {
        pending: 'bg-warning',
        approved: 'bg-success',
        rejected: 'bg-danger'
      }
      return badges[status] || 'bg-secondary'
    },

    getStatusLabel(status) {
      const labels = {
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté'
      }
      return labels[status] || status
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  mounted() {
    this.loadValidations()
  }
}
</script>

<style scoped>
.validations-container {
  padding: 30px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  color: #3498db;
  font-weight: 700;
  margin: 0;
}

.filters-section {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.validation-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.validation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  text-decoration: none;
}

.article-title:hover {
  color: #3498db;
}

.validation-details {
  font-size: 14px;
}

.badge {
  font-weight: 600;
  padding: 6px 12px;
  font-size: 11px;
}

.btn-group {
  display: flex;
  gap: 5px;
}

.modal {
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  border: none;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>