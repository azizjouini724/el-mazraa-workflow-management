<template>
  <div class="card border-0 shadow-sm article-card" @click="viewDetails">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="flex-grow-1">
          <h6 class="fw-bold mb-1 text-dark">{{ article.description1 }}</h6>
          <p class="text-muted small mb-0">{{ article.description2 }}</p>
        </div>
        <span :class="['badge', `bg-${statusColor}`]">
          {{ statusText }}
        </span>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6 col-md-3">
          <div class="info-item">
            <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Société</small>
            <span class="fw-semibold small">{{ article.societe }}</span>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="info-item">
            <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Nature</small>
            <span class="fw-semibold small">{{ article.nature }}</span>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="info-item">
            <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Famille</small>
            <span class="fw-semibold small">{{ article.famille || 'N/A' }}</span>
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <div class="info-item">
            <small class="text-muted d-block text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Type</small>
            <span class="fw-semibold small">{{ article.type }}</span>
          </div>
        </div>
      </div>

      <div v-if="article.currentStep" class="alert alert-info py-2 px-3 mb-3 d-flex align-items-center">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="me-2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <small><strong>Étape actuelle :</strong> {{ article.currentStep }}</small>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-1">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ formatDate(article.createdAt) }}
        </small>
        <button class="btn btn-sm btn-link text-decoration-none">
          Voir détails
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="ms-1">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleCard',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusColor() {
      const colorMap = {
        'pending': 'warning',
        'in_progress': 'info',
        'approved': 'success',
        'rejected': 'danger',
        'completed': 'success'
      }
      return colorMap[this.article.status] || 'secondary'
    },
    statusText() {
      const textMap = {
        'pending': 'En attente',
        'in_progress': 'En cours',
        'approved': 'Approuvé',
        'rejected': 'Rejeté',
        'completed': 'Terminé'
      }
      return textMap[this.article.status] || this.article.status
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A'
      const d = new Date(date)
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    },
    viewDetails() {
      this.$router.push(`/articles/${this.article._id}`)
    }
  }
}
</script>

<style scoped>
.article-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.info-item {
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}
</style>