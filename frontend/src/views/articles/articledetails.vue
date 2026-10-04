<template>
  <div class="article-details-container">
    <!-- Header -->
    <div class="article-header">
      <router-link to="/dashboard" class="btn btn-sm btn-outline-secondary mb-3">
        <i class="bi bi-arrow-left me-2"></i>Retour au Dashboard
      </router-link>

      <div v-if="article" class="article-title-section">
        <h1>{{ article.familleArticle }} - {{ article.societe }}</h1>
        <div class="article-info">
          <span class="badge" :class="getStatusBadge(article.status)">
            {{ getStatusLabel(article.status) }}
          </span>
          <span class="text-muted ms-3">{{ article.nature }}</span>
          <span class="text-muted ms-3">{{ formatDate(article.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Contenu -->
    <div v-else-if="article" class="row">
      <!-- Colonne gauche: Article -->
      <div class="col-lg-8">
        <div class="card mb-4 shadow-sm">
          <div class="card-body p-5">
            <h5 class="card-title fw-bold">Description du Produit</h5>
            <hr class="my-3" />
            <p class="article-content"><strong>Description 1:</strong> {{ article.description1 }}</p>
            <p class="article-content" v-if="article.description2"><strong>Description 2:</strong> {{ article.description2 }}</p>

            <!-- Photo -->
            <div v-if="article.photo" class="mt-5">
              <h6 class="fw-bold mb-3">Photo du Produit</h6>
              <img 
                :src="getPhotoSrc(article.photo)"
                alt="Photo produit" 
                class="img-fluid rounded photo-zoom shadow-sm" 
                style="max-width: 350px; max-height: 350px; object-fit: cover; cursor: pointer;"
                @click="showPhotoModal = true"
              >
            </div>

            <!-- Modal Photo -->
            <div v-if="showPhotoModal" class="photo-modal" @click="showPhotoModal = false">
              <div class="photo-modal-content" @click.stop>
                <button class="btn-close-modal" @click="showPhotoModal = false">&times;</button>
                <img :src="getPhotoSrc(article.photo)" alt="Photo produit" class="photo-modal-img">
              </div>
            </div>

            <!-- Créateur -->
            <div v-if="article.creator" class="article-author mt-5 pt-4 border-top">
              <strong>Demandeur:</strong>
              <div class="mt-2">
                <span class="ms-2">{{ article.creator.name }}</span>
                <span class="text-muted ms-2">{{ article.creator.email }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-4 pt-3 border-top">
              <button @click="exportPDF" class="btn btn-primary" :disabled="exportLoading">
                <span v-if="exportLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-file-pdf me-2"></i>
                {{ exportLoading ? 'Export en cours...' : 'Exporter en PDF' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Infos Produit -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="mb-0 fw-bold">Informations du Produit</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold text-muted">Société</label>
                <p class="mb-0">{{ article.societe }}</p>
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold text-muted">Nature de la Demande</label>
                <p class="mb-0">{{ article.nature }}</p>
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold text-muted">Famille Article</label>
                <p class="mb-0">{{ article.familleArticle }}</p>
              </div>
              <div class="col-md-6 mb-4">
                <label class="form-label fw-bold text-muted">Type Article</label>
                <p class="mb-0">{{ article.typeArticle }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ✅ ACCORDION OPTIMISÉ POUR VALIDATIONS -->
        <div class="card shadow-sm">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="mb-0 fw-bold">Validations et Commentaires</h5>
          </div>
          <div class="card-body p-0">
            <div v-if="article.validations && article.validations.length > 0">
              <div class="accordion" id="validationsAccordion">
                <div v-for="(validation, index) in article.validations" :key="validation._id" class="accordion-item">
                  <h2 class="accordion-header">
                    <button 
                      class="accordion-button collapsed" 
                      type="button" 
                      :data-bs-target="`#validation-${index}`"
                      data-bs-toggle="collapse"
                      :aria-expanded="false"
                      :aria-controls="`validation-${index}`">
                      
                      <!-- Icône + Service + Badge -->
                      <div class="d-flex align-items-center w-100">
                        <i :class="getServiceIcon(validation.type)" class="me-3"></i>
                        <strong class="me-3">{{ formatValidationType(validation.type) }}</strong>
                        <span class="badge" :class="getValidationBadge(validation.status)">
                          {{ getValidationLabel(validation.status) }}
                        </span>
                        <span class="ms-auto text-muted small" v-if="validation.avis">
                          {{ validation.avis === 'Favorable' ? '✅ Favorable' : '❌ Défavorable' }}
                        </span>
                      </div>
                    </button>
                  </h2>
                  
                  <!-- Contenu déroulable -->
                  <div :id="`validation-${index}`" class="accordion-collapse collapse" :data-bs-parent="`#validationsAccordion`">
                    <div class="accordion-body">
                      <!-- Info validateur -->
                      <div class="mb-3">
                        <small class="text-muted d-block" v-if="validation.validator && validation.status !== 'pending'">
                          <strong>Validateur:</strong> {{ validation.validator.name }}
                        </small>
                        <small class="text-muted d-block" v-if="!validation.validator || validation.status === 'pending'">
                          En attente d'assignation
                        </small>
                        <small class="text-muted d-block" v-if="validation.validatedAt">
                          <strong>Date:</strong> {{ formatDate(validation.validatedAt) }}
                        </small>
                      </div>

                      <hr class="my-2">

                      <!-- Avis -->
                      <div class="mb-3">
                        <strong>Avis:</strong>
                        <div v-if="validation.status === 'approved'" class="text-success fw-bold mt-2">
                          <i class="bi bi-check-circle me-1"></i>Favorable
                        </div>
                        <div v-else-if="validation.status === 'rejected'" class="text-danger fw-bold mt-2">
                          <i class="bi bi-x-circle me-1"></i>Défavorable
                        </div>
                        <div v-else-if="validation.status === 'cancelled'" class="text-secondary fw-bold mt-2">
                          <i class="bi bi-dash-circle me-1"></i>Annulée
                        </div>
                        <div v-else class="text-warning fw-bold mt-2">
                          <i class="bi bi-hourglass-split me-1"></i>En attente
                        </div>
                      </div>

                      <!-- Motif du refus -->
                      <div v-if="validation.rejectionComment" class="alert alert-danger py-2 px-3 mb-2 rounded">
                        <strong class="d-block mb-1">Motif du Refus</strong>
                        <p class="mb-0">{{ validation.rejectionComment }}</p>
                      </div>

                      <!-- Commentaire -->
                      <div v-if="validation.commentaire" class="alert alert-info py-2 px-3 rounded">
                        <strong class="d-block mb-1">Commentaire</strong>
                        <p class="mb-0">{{ validation.commentaire }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted text-center py-3">
              Aucune validation enregistrée
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne droite: Workflow et Statut -->
      <div class="col-lg-4">
        <!-- Workflow -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="mb-0 fw-bold">Progression du Workflow</h5>
          </div>
          <div class="card-body">
            <div v-if="article.validations && article.validations.length > 0" class="workflow-status">
              <div class="workflow-progress mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-muted">Progression</span>
                  <span class="fw-bold">{{ approvedCount }}/{{ article.validations.length }}</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{ width: workflowPercentage + '%' }"
                  ></div>
                </div>
              </div>

              <div class="validations-list">
                <div v-for="validation in article.validations" :key="validation._id" class="validation-item mb-3 p-3 border rounded-2 bg-light">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <strong class="d-block">{{ formatValidationType(validation.type) }}</strong>
                      <small class="text-muted" v-if="validation.validator && validation.status !== 'pending'">
                        {{ validation.validator.name }}
                      </small>
                      <small class="text-muted d-block" v-else>
                        En attente
                      </small>
                    </div>
                    <span class="badge" :class="getValidationBadge(validation.status)">
                      {{ getValidationLabel(validation.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted text-center py-3">
              Aucune validation
            </div>
          </div>
        </div>

        <!-- État Global -->
        <div class="card shadow-sm">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="mb-0 fw-bold">État Global</h5>
          </div>
          <div class="card-body">
            <div class="info-group mb-4">
              <label class="form-label text-muted fw-bold">Statut</label>
              <p class="mb-0">
                <span class="badge" :class="getStatusBadge(article.status)">
                  {{ getStatusLabel(article.status) }}
                </span>
              </p>
            </div>
            <div class="info-group mb-4">
              <label class="form-label text-muted fw-bold">Créé le</label>
              <p class="mb-0">{{ formatDate(article.createdAt) }}</p>
            </div>
            <div class="info-group mb-4">
              <label class="form-label text-muted fw-bold">Dernière modification</label>
              <p class="mb-0">{{ formatDate(article.updatedAt) }}</p>
            </div>
            <div v-if="article.qadCode" class="info-group pt-3 border-top">
              <label class="form-label text-muted fw-bold">Code QAD</label>
              <p class="mb-0"><span class="badge bg-success">{{ article.qadCode }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-danger">
      Article non trouvé
    </div>
  </div>
</template>

<script>
import productArticleService from '@/services/productArticleService'

export default {
  name: 'ArticleDetails',
  data() {
    return {
      article: null,
      loading: false,
      error: '',
      showPhotoModal: false,
      exportLoading: false
    }
  },
  computed: {
    approvedCount() {
      if (!this.article || !this.article.validations) return 0
      return this.article.validations.filter(v => v.status === 'approved').length
    },
    workflowPercentage() {
      if (!this.article || !this.article.validations) return 0
      return (this.approvedCount / this.article.validations.length) * 100
    }
  },
  methods: {
    async loadArticle() {
      this.loading = true
      try {
        const result = await productArticleService.getArticleById(this.$route.params.id)
        if (result.success) {
          this.article = result.data.data
          console.log('✅ Article chargé:', this.article)
        } else {
          this.error = 'Article non trouvé'
        }
      } catch (error) {
        console.error('Erreur:', error)
        this.error = 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },

    getPhotoSrc(photo) {
      if (!photo) return ''
      if (photo.startsWith('data:image')) return photo
      return `data:image/jpeg;base64,${photo}`
    },

    async exportPDF() {
      try {
        this.exportLoading = true
        const token = localStorage.getItem('token')
        
        const res = await fetch(`/api/export/articles/${this.$route.params.id}/pdf`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        
        const blob = await res.blob()
        if (blob.size === 0) throw new Error('Le PDF est vide')
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Article-${this.article._id.slice(-6)}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.parentElement.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        alert('✅ PDF exporté avec succès!')
      } catch (error) {
        alert(`❌ Erreur lors de l'export PDF:\n${error.message}`)
      } finally {
        this.exportLoading = false
      }
    },

    getStatusLabel(status) {
      const labels = {
        'draft': 'Brouillon',
        'en_validation': 'En Validation',
        'validé': 'Validé',
        'rejete': 'Rejeté',
        'créé_en_qad': 'Créé en QAD'
      }
      return labels[status] || status
    },

    getStatusBadge(status) {
      const badges = {
        'draft': 'bg-secondary',
        'en_validation': 'bg-warning text-dark',
        'validé': 'bg-success',
        'rejete': 'bg-danger',
        'créé_en_qad': 'bg-success'
      }
      return badges[status] || 'bg-secondary'
    },

    getValidationBadge(status) {
      const badges = {
        'pending': 'bg-warning text-dark',
        'approved': 'bg-success',
        'rejected': 'bg-danger',
        'cancelled': 'bg-secondary',
        'waiting': 'bg-secondary text-white'
      }
      return badges[status] || 'bg-secondary'
    },

    getValidationLabel(status) {
      const labels = {
        'pending': 'En attente',
        'approved': 'Approuvé',
        'rejected': 'Rejeté',
        'cancelled': 'Annulée',
        'waiting': 'En attente'
      }
      return labels[status] || status
    },

    formatValidationType(type) {
      const types = {
        'marketing': 'Marketing',
        'production': 'Production',
        'qualite': 'Qualité',
        'finance': 'Finance',
        'commercial': 'Commercial',
        'essanaouber': 'Essanaouber',
        'gms': 'GMS',
        'export': 'Export',
        'ucpc': 'UCPC',
        'controle': 'Contrôle de Gestion',
        'informatique': 'Informatique'
      }
      return types[type] || type
    },

    getServiceIcon(type) {
      const icons = {
        'marketing': 'bi bi-graph-up',
        'production': 'bi bi-gear',
        'qualite': 'bi bi-shield-check',
        'finance': 'bi bi-cash-coin',
        'commercial': 'bi bi-bag-check',
        'gms': 'bi bi-shop',
        'export': 'bi bi-globe',
        'essanaouber': 'bi bi-box',
        'controle': 'bi bi-clipboard-check',
        'informatique': 'bi bi-laptop'
      }
      return icons[type] || 'bi bi-info-circle'
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('fr-FR')
    }
  },
  mounted() {
    this.loadArticle()
  }
}
</script>

<style scoped>
.article-details-container {
  padding: 30px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px);
}

.article-header {
  margin-bottom: 30px;
}

.article-title-section h1 {
  font-size: 32px;
  color: #2c3e50;
  margin: 20px 0 15px 0;
  font-weight: 600;
}

.article-info {
  font-size: 14px;
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.card-header {
  border-radius: 12px 12px 0 0;
}

.card-body {
  padding: 1.5rem;
}

.article-content {
  line-height: 1.8;
  color: #555;
  font-size: 15px;
  margin: 0.5rem 0;
}

.article-author {
  font-size: 14px;
}

/* ✅ ACCORDION OPTIMISÉ */
.accordion-button {
  padding: 1rem 1.25rem;
  background-color: #f8f9fa;
  border: none;
  font-weight: 500;
}

.accordion-button:not(.collapsed) {
  background-color: #e9ecef;
  color: #000;
}

.accordion-button:focus {
  border-color: #0d6efd;
  box-shadow: none;
}

.accordion-body {
  padding: 1.25rem;
  background-color: #fff;
}

.validation-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.validation-item:hover {
  background-color: #e9ecef;
}

.info-group {
  padding-bottom: 15px;
}

.info-group label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.info-group p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

.badge {
  font-weight: 600;
  padding: 8px 12px;
  font-size: 0.85rem;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  background-color: #0d6efd;
}

.workflow-status {
  padding: 10px 0;
}

.photo-zoom {
  transition: all 0.3s ease;
}

.photo-zoom:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.photo-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.photo-modal-img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.btn-close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
}

@media (max-width: 768px) {
  .article-title-section h1 {
    font-size: 24px;
  }
}
</style>