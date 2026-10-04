<template>
  <div class="validations-container">
    <div class="page-header">
      <h1>Validations</h1>
      <p class="text-muted">Gérez les validations des articles</p>
    </div>

    <!-- Filtres -->
    <div class="filters-section card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Statut</label>
            <select
              v-model="filters.status"
              class="form-select"
              @change="loadValidations"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Type</label>
            <select
              v-model="filters.type"
              class="form-select"
              @change="loadValidations"
            >
              <option value="">Tous les types</option>
              <option value="commercial">Commercial</option>
              <option value="finance">Finance</option>
              <option value="production">Production</option>
              <option value="marketing">Marketing</option>
              <option value="qualite">Qualité</option>
              <option value="controle">Contrôle</option>
              <option value="informatique">Informatique</option>
            </select>
          </div>

          <div class="col-md-4">
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

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Liste des validations -->
    <div v-else class="validations-list">
      <div v-if="validations.length === 0" class="alert alert-info">
        Aucune validation trouvée
      </div>

      <div v-for="validation in validations" :key="validation._id" class="validation-card card mb-3">
        <div class="card-body">
          <div class="row">
            <div class="col-md-7">
              <h5 class="mb-2">{{ validation.article.title }}</h5>
              <div class="validation-meta">
                <span class="badge" :class="getTypeBadge(validation.type)">
                  {{ formatType(validation.type) }}
                </span>
                <span class="badge ms-2" :class="getStatusBadge(validation.status)">
                  {{ getStatusLabel(validation.status) }}
                </span>
              </div>
              <div class="mt-3">
                <small class="text-muted">
                  <strong>Validateur:</strong> {{ validation.validator.name }}
                </small>
              </div>
              <div v-if="validation.comment" class="mt-2">
                <small class="text-muted d-block">
                  <strong>Commentaire:</strong> {{ validation.comment }}
                </small>
              </div>
            </div>

            <div class="col-md-5 d-flex align-items-center justify-content-end">
              <div v-if="validation.status === 'pending'" class="btn-group" role="group">
                <button
                  @click="openValidationModal(validation)"
                  class="btn btn-sm btn-outline-success"
                >
                  Approuver
                </button>
                <button
                  @click="openRejectModal(validation)"
                  class="btn btn-sm btn-outline-danger"
                >
                  Rejeter
                </button>
              </div>
              <div v-else>
                <router-link
                  :to="`/articles/${validation.article._id}`"
                  class="btn btn-sm btn-outline-primary"
                >
                  Voir l'article
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'approbation -->
    <div v-if="showModal" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approuver la validation</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <p><strong>Article:</strong> {{ currentValidation?.article.title }}</p>
            <p><strong>Type:</strong> {{ formatType(currentValidation?.type) }}</p>
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
            <button type="button" class="btn btn-secondary" @click="showModal = false">
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="approveValidation"
              :disabled="submitting"
            >
              Approuver
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
            <h5 class="modal-title">Rejeter la validation</h5>
            <button type="button" class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <p><strong>Article:</strong> {{ currentValidation?.article.title }}</p>
            <p><strong>Type:</strong> {{ formatType(currentValidation?.type) }}</p>
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
              @click="rejectValidation"
              :disabled="submitting || !rejectionReason.trim()"
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import validationService from '@/services/validationservice'

export default {
  name: 'ValidationsList',
  data() {
    return {
      validations: [],
      filters: {
        status: '',
        type: ''
      },
      loading: false,
      error: '',
      showModal: false,
      showRejectModal: false,
      currentValidation: null,
      approvalComment: '',
      rejectionReason: '',
      submitting: false
    }
  },
  methods: {
    async loadValidations() {
      this.loading = true
      this.error = ''

      try {
        const result = await validationService.getAllValidations()
        
        if (result.success) {
          let validations = result.data.data

          // Filtrer par statut
          if (this.filters.status) {
            validations = validations.filter(v => v.status === this.filters.status)
          }

          // Filtrer par type
          if (this.filters.type) {
            validations = validations.filter(v => v.type === this.filters.type)
          }

          this.validations = validations
        } else {
          this.error = result.message
        }
      } catch (err) {
        this.error = 'Erreur lors du chargement des validations'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    openValidationModal(validation) {
      this.currentValidation = validation
      this.approvalComment = ''
      this.showModal = true
    },

    openRejectModal(validation) {
      this.currentValidation = validation
      this.rejectionReason = ''
      this.showRejectModal = true
    },

    async approveValidation() {
      if (!this.currentValidation) return

      this.submitting = true
      const result = await validationService.approveValidation(
        this.currentValidation._id,
        this.approvalComment
      )

      if (result.success) {
        this.showModal = false
        this.loadValidations()
      } else {
        this.error = result.message || 'Erreur lors de l\'approbation'
      }

      this.submitting = false
    },

    async rejectValidation() {
      if (!this.currentValidation || !this.rejectionReason.trim()) return

      this.submitting = true
      const result = await validationService.rejectValidation(
        this.currentValidation._id,
        this.rejectionReason
      )

      if (result.success) {
        this.showRejectModal = false
        this.loadValidations()
      } else {
        this.error = result.message || 'Erreur lors du rejet'
      }

      this.submitting = false
    },

    getTypeBadge(type) {
      const badges = {
        commercial: 'bg-info',
        finance: 'bg-warning',
        production: 'bg-primary',
        marketing: 'bg-success',
        qualite: 'bg-secondary',
        controle: 'bg-dark',
        informatique: 'bg-purple'
      }
      return badges[type] || 'bg-secondary'
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

.validation-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  font-weight: 600;
  padding: 6px 12px;
  font-size: 11px;
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

.btn-group {
  display: flex;
  gap: 5px;
}
</style>