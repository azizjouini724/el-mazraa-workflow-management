<template>
  <div class="dashboard-container">
    <ErrorToast 
      :show="showError" 
      :type="errorType"
      :title="errorTitle"
      :message="errorMessage"
      :duration="5000"
      @close="showError = false"
    />

    <div v-if="!currentUser" class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
      <p class="mt-3">Chargement...</p>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="header-section">
        <div class="container-fluid px-4">
          <div class="header-content">
            <div>
              <h1 class="header-title">{{ headerTitle }}</h1>
              <p class="header-subtitle">{{ headerSubtitle }}</p>
            </div>
            <router-link v-if="isNormalUser" :to="{ name: 'CreateArticle' }" class="btn-create">
              <i class="bi bi-plus-lg"></i>Nouvelle Demande
            </router-link>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="container-fluid px-4 mt-5">
        <div class="stats-grid">
          <div v-for="(stat, index) in displayStats" :key="index" class="stat-card" :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="stat-icon" :class="`stat-icon-${index}`">
              <i :class="getStatIcon(index)"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Table Card -->
        <div class="table-card mt-4">
          <div class="table-header">
            <h5 class="table-title">{{ tableTitle }}</h5>
          </div>

          <div class="table-content">
            <div v-if="displayItems.length === 0" class="empty-state">
              <i class="bi bi-inbox"></i>
              <p>Aucune demande</p>
            </div>

            <div v-else class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th v-if="!isNormalUser">Demandeur</th>
                    <th>Nature</th>
                    <th>Description</th>
                    <th>Étape</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in displayItems" :key="item._id" class="table-row">
                    <template v-if="getDemandaData(item)">
                      <td><span class="ref-badge">#{{ getDemandaData(item)._id.slice(-6).toUpperCase() }}</span></td>
                      <td v-if="!isNormalUser">{{ getDemandaData(item).creator?.name || '---' }}</td>
                      <td><span class="nature-tag">{{ getDemandaData(item).nature }}</span></td>
                      <td class="text-truncate">{{ getDemandaData(item).description1 }}</td>
                      <td><span class="step-tag">{{ formatValidationType(getDemandaData(item).currentValidationStep) }}</span></td>
                      <td>
                        <span :class="['status-tag', getStatusClass(getItemStatus(item))]">
                          {{ getStatusLabel(getItemStatus(item)) }}
                        </span>
                      </td>
                      <td class="text-muted small">{{ formatDate(getDemandaData(item).createdAt) }}</td>
                      <td class="text-end">
                        <button v-if="isValidator && getDemandaData(item).status === 'rejete'"
                          @click="showRejectionNotification(getDemandaData(item))"
                          class="action-btn">
                          <i class="bi bi-eye"></i>
                        </button>
                        
                        <router-link v-else-if="isValidator && (item.status === 'approved' || item.status === 'rejected')"
                          :to="`/articles/${getDemandaData(item)._id}`" 
                          class="action-btn">
                          <i class="bi bi-eye"></i> 
                        </router-link>
                        
                        <button v-else-if="isValidator"
                          @click="handleAction(item._id, getDemandaData(item).currentValidationStep)"
                          class="action-btn action-primary">
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        
                        <router-link v-else
                          :to="`/articles/${getDemandaData(item)._id}`" 
                          class="action-btn">
                          <i class="bi bi-eye"></i> 
                        </router-link>
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ErrorToast from '@/components/ErrorToast.vue'

export default {
  components: { ErrorToast },
  name: 'Dashboard',
  data() {
    return {
      demandes: [],
      validations: [],
      loading: false,
      showError: false,
      errorType: 'error',
      errorTitle: '❌ Erreur',
      errorMessage: '',
      refreshInterval: null,
      VALIDATION_SEQUENCE: [
        'marketing',
        'production',
        'qualite',
        'finance',
        'commercial',
        'controle',
        'informatique'
      ]
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser']),
    isNormalUser() { return this.currentUser?.role === 'user' || this.currentUser?.role === 'demandeur' },
    isValidator() { return this.currentUser?.role?.startsWith('validateur_') },
    isAdmin() { return this.currentUser?.role === 'admin' },
    validationType() { return this.isValidator ? this.currentUser.role.replace('validateur_', '') : null },
    
    headerTitle() {
      return this.isNormalUser ? 'Mes Demandes' : 'Toutes les Demandes'
    },
    
    headerSubtitle() {
      return this.isNormalUser 
        ? 'Suivi de vos demandes de création d\'articles'
        : 'Demandes en attente de validation'
    },

    tableTitle() {
      return this.isNormalUser ? 'Historique de mes demandes' : 'Toutes les demandes'
    },
    
    displayItems() {
      return this.isNormalUser ? this.demandes : this.validations
    },

    displayStats() {
      if (this.isNormalUser) {
        return [
          { label: 'Total', value: this.demandes.length },
          { label: 'En cours', value: this.demandes.filter(d => d.status === 'en_validation').length },
          { label: 'Approuvées', value: this.demandes.filter(d => d.status === 'créé_en_qad').length },
          { label: 'Rejetées', value: this.demandes.filter(d => d.status === 'rejete').length }
        ]
      }
      return [
        { label: 'À traiter', value: this.validations.filter(v => v.article?.currentValidationStep === this.validationType).length },
        { label: 'Total', value: this.validations.length }
      ]
    }
  },
  methods: {
    async loadDashboard() {
      if (!this.currentUser) return
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const headers = { 'Authorization': `Bearer ${token}` }

        if (this.isNormalUser) {
          const res = await fetch('/api/articles/all', { headers })
          const data = await res.json()
          if (data.success) this.demandes = data.data
        } else if (this.isValidator) {
          const res = await fetch(`/api/validations/all/${this.validationType}`, { headers })
          const data = await res.json()
          if (data.success) this.validations = data.data || []
        }
      } catch (err) {
        console.error('❌ Dashboard ERR:', err)
      } finally {
        this.loading = false
      }
    },

    getItemStatus(item) {
      return item.status || (item.article && item.article.status) || 'pending'
    },

    getDemandaData(item) {
      return item.article ? item.article : item
    },

    showRejectionNotification(article) {
      const rejectedValidation = article.validations.find(v => v.status === 'rejected')
      const rejectedService = rejectedValidation ? this.formatValidationType(rejectedValidation.type) : 'Un service'
      
      this.errorType = 'danger'
      this.errorTitle = '⚠️ Demande Rejetée'
      this.errorMessage = `Rejetée par ${rejectedService}`
      this.showError = true
    },

    handleAction(validationId, currentStep) {
      const validation = this.validations.find(v => v._id === validationId)
      if (!validation) {
        this.errorType = 'error'
        this.errorTitle = '❌ Erreur'
        this.errorMessage = 'Validation non trouvée'
        this.showError = true
        return
      }

      if (currentStep !== this.validationType) {
        this.errorType = 'warning'
        this.errorTitle = '⚠️ Pas votre tour'
        this.errorMessage = `Cette demande est actuellement traitée par ${this.formatValidationType(currentStep)}`
        this.showError = true
        return
      }

      if (validationId) {
        this.$router.push(`/validate/${validationId}`)
      }
    },

    getStatusClass(status) {
      const map = {
        'pending': 'status-pending',
        'en_validation': 'status-progress',
        'approved': 'status-approved',
        'créé_en_qad': 'status-approved',
        'rejected': 'status-rejected',
        'rejete': 'status-rejected',
        'waiting': 'status-waiting'
      }
      return map[status] || 'status-waiting'
    },

    getStatusLabel(status) {
      const map = {
        'pending': 'En attente',
        'en_validation': 'En cours',
        'approved': 'Approuvé',
        'créé_en_qad': 'Créé',
        'rejected': 'Refusé',
        'rejete': 'Refusé',
        'waiting': 'En attente'
      }
      return map[status] || status
    },

    formatValidationType(type) {
      const map = {
        'marketing': 'Marketing',
        'production': 'Production',
        'qualite': 'Qualité',
        'finance': 'Finance',
        'commercial': 'Commercial',
        'essanaouber': 'Essanaouber',
        'gms': 'GMS',
        'export': 'Export',
        'controle': 'Contrôle',
        'informatique': 'IT',
        'terminé': 'Terminé',
        'rejete': 'Rejeté'
      }
      return map[type] || type
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    getStatIcon(index) {
      const icons = ['bi bi-file-earmark-plus', 'bi bi-clock-history', 'bi bi-check-circle', 'bi bi-x-circle']
      return icons[index] || 'bi bi-file'
    }
  },
  mounted() {
    if (this.isAdmin) {
      this.$router.push('/admin')
      return
    }

    this.loadDashboard()
    this.refreshInterval = setInterval(() => { this.loadDashboard() }, 3000)
  },
  
  beforeUnmount() {
    if (this.refreshInterval) { clearInterval(this.refreshInterval) }
  }
}
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #f5f6f7 0%, #f0f4f3 100%);
  min-height: 100vh;
  padding-bottom: 2rem;
}

/* ===== HEADER ===== */
.header-section {
  padding: 3rem 0;
  box-shadow: 0 5px 10px rgba(10, 05, 13, 0.053);
  
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  color: rgb(57, 192, 71);
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  color: rgba(15, 13, 13, 0.85);
  font-size: 0.95rem;
  margin: 0.5rem 0 0 0;
}

.btn-create {
  background: rgb(57, 192, 71);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* ===== STATS ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(45, 95, 63, 0.12);
  border-color: #43e97b;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon-0 { background: linear-gradient(135deg, #2d5f3f 0%, #43e97b 100%); }
.stat-icon-1 { background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); }
.stat-icon-2 { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); }
.stat-icon-3 { background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d5f3f;
  margin: 0;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

/* ===== TABLE CARD ===== */
.table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.table-header {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(45, 95, 63, 0.05) 0%, rgba(67, 233, 123, 0.05) 100%);
  border-bottom: 2px solid #e5e7eb;
}

.table-title {
  color: #2d5f3f;
  font-weight: 600;
  margin: 0;
}

.table-content {
  padding: 0;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

/* ===== DATA TABLE ===== */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.data-table tbody tr:hover {
  background: #f9fafb;
  border-left: 3px solid #43e97b;
}

.data-table tbody td {
  padding: 1.25rem 1.5rem;
  color: #1a1a1a;
  font-size: 0.9rem;
}

/* ===== BADGES ===== */
.ref-badge {
  font-weight: 700;
  color: #2d5f3f;
  font-size: 0.9rem;
}

.nature-tag, .step-tag {
  display: inline-block;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.nature-tag {
  background: #f3f4f6;
  color: #374151;
}

.step-tag {
  background: linear-gradient(135deg, rgba(45, 95, 63, 0.1) 0%, rgba(67, 233, 123, 0.1) 100%);
  color: #2d5f3f;
  border: 1px solid rgba(45, 95, 63, 0.2);
}

.status-tag {
  display: inline-block;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-progress { background: #bfdbfe; color: #0c63e4; }
.status-approved { background: linear-gradient(135deg, #dcfce7 0%, #c6f6d5 100%); color: #15803d; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.status-waiting { background: #f3f4f6; color: #6b7280; }

/* ===== ACTION BUTTONS ===== */
.action-btn {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #1a1a1a;
  transform: scale(1.1);
}

.action-btn.action-primary {
  background: linear-gradient(135deg, #2d5f3f 0%, #43e97b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(45, 95, 63, 0.2);
}

.action-btn.action-primary:hover {
  box-shadow: 0 6px 20px rgba(45, 95, 63, 0.3);
  transform: scale(1.12);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>