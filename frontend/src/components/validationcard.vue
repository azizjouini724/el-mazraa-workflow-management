<template>
  <div class="validation-card">
    <div class="validation-header">
      <div class="step-info">
        <span class="step-number">{{ stepNumber }}</span>
        <div class="step-details">
          <h4>{{ validation.step }}</h4>
          <p class="validator-name">{{ validation.validatorName }}</p>
        </div>
      </div>
      <span :class="['status-badge', `status-${validation.status}`]">
        {{ statusText }}
      </span>
    </div>

    <div class="validation-body">
      <div class="validation-date">
        <span class="icon">📅</span>
        {{ formatDate(validation.date) }}
      </div>

      <div v-if="validation.avis" class="avis-section">
        <span class="label">Avis :</span>
        <span :class="['avis-value', validation.avis === 'Favorable' ? 'favorable' : 'defavorable']">
          {{ validation.avis }}
        </span>
      </div>

      <div v-if="validation.comment" class="comment-section">
        <span class="label">Commentaire :</span>
        <p class="comment-text">{{ validation.comment }}</p>
      </div>

      <div v-if="validation.data && Object.keys(validation.data).length > 0" class="data-section">
        <h5>Données saisies :</h5>
        <div class="data-grid">
          <div v-for="(value, key) in validation.data" :key="key" class="data-item">
            <span class="data-label">{{ formatLabel(key) }}</span>
            <span class="data-value">{{ value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ValidationCard',
  props: {
    validation: {
      type: Object,
      required: true
    },
    stepNumber: {
      type: Number,
      required: true
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        'pending': 'En attente',
        'approved': 'Validé',
        'rejected': 'Rejeté',
        'completed': 'Terminé'
      }
      return statusMap[this.validation.status] || this.validation.status
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'Non défini'
      const d = new Date(date)
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatLabel(key) {
      const labels = {
        'sousFamille': 'Sous-Famille',
        'gamme': 'Gamme',
        'uniteVente': 'Unité de vente',
        'facteurConversion': 'Facteur de conversion',
        'tare': 'Tare',
        'maxRemplissage': 'Max remplissage',
        'maxMatiere': 'Max matière',
        'chargeParKG': 'Charge par KG',
        'coutRevient': 'Coût de revient',
        'emballage': 'Emballage',
        'joursDLC': 'Jours DLC',
        'joursDLV': 'Jours DLV',
        'tauxTVA': 'Taux TVA',
        'compteVente': 'Compte de vente',
        'prixGrosHT': 'Prix Gros HT',
        'prixGrosTTC': 'Prix Gros TTC',
        'prixDetailTTC': 'Prix Détail TTC'
      }
      return labels[key] || key
    }
  }
}
</script>

<style scoped>
.validation-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 1rem;
}

.validation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.step-details h4 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: white;
}

.validator-name {
  font-size: 0.85rem;
  opacity: 0.9;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved,
.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.validation-body {
  padding: 1.5rem;
}

.validation-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.icon {
  font-size: 1.1rem;
}

.avis-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.label {
  font-weight: 600;
  color: var(--text-dark);
}

.avis-value {
  padding: 0.4rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
}

.avis-value.favorable {
  background: #d4edda;
  color: #155724;
}

.avis-value.defavorable {
  background: #f8d7da;
  color: #721c24;
}

.comment-section {
  margin-bottom: 1.5rem;
}

.comment-text {
  margin-top: 0.5rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: var(--radius-md);
  color: var(--text-dark);
  line-height: 1.6;
}

.data-section h5 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--bg-light);
  border-radius: var(--radius-md);
}

.data-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-value {
  font-size: 0.95rem;
  color: var(--text-dark);
  font-weight: 500;
}
</style>