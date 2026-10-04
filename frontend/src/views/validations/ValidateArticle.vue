<template>
  <div>
    <ErrorToast 
      :show="showError" 
      :type="errorType"
      :title="errorTitle"
      :message="errorMessage"
      :duration="5000"
      @close="showError = false"
    />
    <ErrorToast 
      :show="showSuccess" 
      :type="successType"
      :title="successTitle"
      :message="successMessage"
      :duration="3000"
      @close="showSuccess = false"
    />

    <div class="container py-4">
      <div class="card shadow border-0" v-if="article._id">
        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-check-circle me-2"></i>
            Validation {{ stepLabel }} - Demande #{{ article._id.slice(-6).toUpperCase() }}
          </h5>
          <router-link :to="`/articles/${article._id}`" class="btn btn-sm btn-light">
            <i class="bi bi-eye me-1"></i>
            Voir les détails
          </router-link>
        </div>

        <div class="card-body">
          <!-- DONNÉES DE L'ARTICLE -->
          <div class="mb-4 p-3 bg-light rounded">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-file-earmark-text me-2"></i>
              Données de l'article créé
            </h6>
            <div class="row">
              <div class="col-md-6 mb-2"><strong>Demandeur:</strong> {{ article.creator?.name }}</div>
              <div class="col-md-6 mb-2"><strong>Société:</strong> {{ article.societe }}</div>
              <div class="col-md-6 mb-2"><strong>Nature:</strong> {{ article.nature }}</div>
              <div class="col-md-6 mb-2"><strong>Description 1:</strong> {{ article.description1 }}</div>
              <div class="col-md-6 mb-2"><strong>Description 2:</strong> {{ article.description2 }}</div>
              <div class="col-md-6 mb-2"><strong>Famille:</strong> {{ article.familleArticle }}</div>
              <div class="col-md-6 mb-2"><strong>Type:</strong> {{ article.typeArticle }}</div>
            </div>
          </div>

          <!-- VALIDATIONS PRÉCÉDENTES -->
          <div class="mb-4 p-3 bg-white rounded border">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-list-check me-2"></i>
              Avis et Données des Services Précédents
            </h6>
            <div v-if="previousValidations.length > 0">
              <div v-for="validation in previousValidations" :key="validation._id" class="mb-4 p-3 rounded service-card bg-light-grey">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 class="fw-bold mb-1">
                      <i :class="getServiceIcon(validation.type)" class="me-2"></i>
                      {{ formatValidationType(validation.type) }}
                    </h6>
                    <small class="text-muted d-block" v-if="validation.validator?.name">
                      <strong>Validateur:</strong> {{ validation.validator.name }}
                    </small>
                    <small class="text-muted d-block" v-if="validation.validatedAt">
                      <strong>Date:</strong> {{ formatDate(validation.validatedAt) }}
                    </small>
                  </div>
                  <span class="badge" :class="getValidationBadge(validation.status)">
                    {{ getValidationLabel(validation.status) }}
                  </span>
                </div>

                <hr class="my-2">

                <div class="mb-2">
                  <strong>Avis:</strong>
                  <span v-if="validation.status === 'approved'" class="ms-2 text-success fw-bold">Favorable</span>
                  <span v-else-if="validation.status === 'rejected'" class="ms-2 text-danger fw-bold">Défavorable</span>
                  <span v-else class="ms-2 text-secondary fw-bold">En attente</span>
                </div>

                <div v-if="validation.rejectionComment" class="alert alert-danger py-2 px-3 mb-2">
                  <strong>Motif du refus:</strong>
                  <p class="mb-0 mt-1">{{ validation.rejectionComment }}</p>
                </div>

                <div v-if="validation.commentaire" class="alert alert-info py-2 px-3 mb-2">
                  <strong>Commentaire:</strong>
                  <p class="mb-0 mt-1">{{ validation.commentaire }}</p>
                </div>

                <!-- DONNÉES MARKETING -->
                <div v-if="validation.type === 'marketing' && validation.status === 'approved'" class="mt-3">
                  <div class="data-grid">
                    <div class="data-item" v-if="validation.sousFamille">
                      <span class="data-label">Sous-famille</span>
                      <span class="data-value">{{ validation.sousFamille }}</span>
                    </div>
                    <div class="data-item" v-if="validation.gamme">
                      <span class="data-label">Gamme</span>
                      <span class="data-value">{{ validation.gamme }}</span>
                    </div>
                  </div>
                </div>

                <!-- DONNÉES PRODUCTION -->
                <div v-if="validation.type === 'production' && validation.status === 'approved'" class="mt-3">
                  <div class="data-grid">
                    <div class="data-item" v-if="validation.uniteVente">
                      <span class="data-label">Unité de vente</span>
                      <span class="data-value">{{ validation.uniteVente }}</span>
                    </div>
                    <div class="data-item" v-if="validation.facteurConversion">
                      <span class="data-label">Facteur de conversion</span>
                      <span class="data-value">{{ validation.facteurConversion }}</span>
                    </div>
                    <div class="data-item" v-if="validation.tare">
                      <span class="data-label">Tare (kg)</span>
                      <span class="data-value">{{ validation.tare }}</span>
                    </div>
                    <div class="data-item" v-if="validation.maxRemplissage">
                      <span class="data-label">Max remplissage</span>
                      <span class="data-value">{{ validation.maxRemplissage }}</span>
                    </div>
                    <div class="data-item" v-if="validation.maxMatiere">
                      <span class="data-label">Max matière</span>
                      <span class="data-value">{{ validation.maxMatiere }}</span>
                    </div>
                    <div class="data-item" v-if="validation.coutRevient">
                      <span class="data-label">Coût de revient</span>
                      <span class="data-value">{{ validation.coutRevient }}</span>
                    </div>
                    <div class="data-item" v-if="validation.emballage">
                      <span class="data-label">Emballage</span>
                      <span class="data-value">{{ validation.emballage }}</span>
                    </div>
                  </div>
                </div>

                <!-- DONNÉES QUALITÉ -->
                <div v-if="validation.type === 'qualite' && validation.status === 'approved'" class="mt-3">
                  <div class="data-grid">
                    <div class="data-item" v-if="validation.dlc">
                      <span class="data-label">Jours DLC</span>
                      <span class="data-value">{{ validation.dlc }} jours</span>
                    </div>
                    <div class="data-item" v-if="validation.dlv">
                      <span class="data-label">Jours DLV</span>
                      <span class="data-value">{{ validation.dlv }} jours</span>
                    </div>
                  </div>
                </div>

                <!-- DONNÉES FINANCE -->
                <div v-if="validation.type === 'finance' && validation.status === 'approved'" class="mt-3">
                  <div class="data-grid">
                    <div class="data-item" v-if="validation.tauxTVA !== undefined && validation.tauxTVA !== null">
                      <span class="data-label">Taux TVA</span>
                      <span class="data-value">{{ validation.tauxTVA }}%</span>
                    </div>
                    <div class="data-item" v-if="validation.compteVente">
                      <span class="data-label">Compte de vente</span>
                      <span class="data-value">{{ validation.compteVente }}</span>
                    </div>
                  </div>
                </div>

                <!-- DONNÉES COMMERCIAL / GMS / EXPORT / ESSANAOUBER -->
                <div v-if="['commercial','gms','export','essanaouber'].includes(validation.type) && validation.status === 'approved'" class="mt-3">
                  <div class="data-grid">
                    <div class="data-item" v-if="validation.prixGrosHT">
                      <span class="data-label">Prix Gros HT</span>
                      <span class="data-value">{{ validation.prixGrosHT }}</span>
                    </div>
                    <div class="data-item" v-if="validation.prixGrosTTC">
                      <span class="data-label">Prix Gros TTC</span>
                      <span class="data-value">{{ validation.prixGrosTTC }}</span>
                    </div>
                    <div class="data-item" v-if="validation.prixDetailTTC">
                      <span class="data-label">Prix Détail TTC</span>
                      <span class="data-value">{{ validation.prixDetailTTC }}</span>
                    </div>
                  </div>
                </div>

                <!-- DONNÉES CONTRÔLE -->
                <div v-if="validation.type === 'controle' && validation.status === 'approved'" class="mt-3">
                  <div class="data-grid">
                    <div class="data-item" v-if="validation.chargeParKG">
                      <span class="data-label">Charge par KG</span>
                      <span class="data-value">{{ validation.chargeParKG }}</span>
                    </div>
                    <div class="data-item" v-if="validation.commentaireControle">
                      <span class="data-label">Commentaire contrôle</span>
                      <span class="data-value">{{ validation.commentaireControle }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div v-else class="text-muted text-center py-3">
              Aucun avis des autres services pour le moment
            </div>
          </div>

          <!-- FORMULAIRE -->
          <form @submit.prevent="submitValidation">
            <div class="mb-4 p-3 bg-light rounded">
              <label class="form-label fw-bold fs-5">Votre décision <span class="text-danger">*</span></label>
              <select v-model="form.avis" class="form-select" required>
                <option value="">Sélectionner...</option>
                <option value="Favorable">Favorable (Passer à l'étape suivante)</option>
                <option value="Défavorable">Défavorable (Refus)</option>
              </select>
            </div>

            <div v-if="form.avis === 'Défavorable'" class="alert alert-danger mb-4">
              <label class="form-label fw-bold">Motif du rejet <span class="text-danger">*</span></label>
              <textarea v-model="form.rejectionComment" class="form-control" rows="3" required
                placeholder="Expliquez pourquoi vous rejetez..."></textarea>
            </div>

            <!-- ✅ Commentaire général — caché pour contrôle -->
            <div v-if="form.avis === 'Favorable' && validationType !== 'controle'" class="mb-4">
              <label class="form-label fw-bold">Commentaire <span class="text-muted">(Optionnel)</span></label>
              <textarea v-model="form.commentaire" class="form-control" rows="2"
                placeholder="Ajoutez un commentaire..."></textarea>
            </div>

            <!-- CHAMPS MARKETING -->
            <div v-if="validationType === 'marketing' && form.avis === 'Favorable'" class="card mb-4">
              <div class="card-header bg-info text-white">
                <h6 class="mb-0"><i class="bi bi-graph-up me-2"></i>Données Marketing</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Sous-Famille <span class="text-danger">*</span></label>
                    <input v-model="form.sousFamille" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Gamme <span class="text-danger">*</span></label>
                    <select v-model="form.gamme" class="form-select" required>
                      <option value="">Choisir...</option>
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                      <option value="Économie">Économie</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHAMPS PRODUCTION -->
            <div v-if="validationType === 'production' && form.avis === 'Favorable'" class="card mb-4">
              <div class="card-header bg-warning text-dark">
                <h6 class="mb-0"><i class="bi bi-gear me-2"></i>Données Production</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Unité de vente <span class="text-danger">*</span></label>
                    <select v-model="form.uniteVente" class="form-select" required>
                      <option value="">Choisir...</option>
                      <option value="KG">KG</option>
                      <option value="PC">PC</option>
                      <option value="CT">CT</option>
                      <option value="SC">SC</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Facteur de conversion <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.facteurConversion" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Tare (kg) <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.tare" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Max remplissage <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.maxRemplissage" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Max matière <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.maxMatiere" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Coût de revient <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.coutRevient" class="form-control" required>
                  </div>
                  <div class="col-md-12 mb-3">
                    <label class="form-label">Emballage <span class="text-danger">*</span></label>
                    <input v-model="form.emballage" class="form-control" required>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHAMPS QUALITÉ -->
            <div v-if="validationType === 'qualite' && form.avis === 'Favorable'" class="card mb-4">
              <div class="card-header bg-danger text-white">
                <h6 class="mb-0"><i class="bi bi-shield-check me-2"></i>Données Qualité</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nombre de jours DLC <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.dlc" class="form-control" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nombre de jours DLV <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.dlv" class="form-control" required>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHAMPS FINANCE -->
            <div v-if="validationType === 'finance' && form.avis === 'Favorable'" class="card mb-4">
              <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="bi bi-cash-coin me-2"></i>Données Finance</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Taux TVA <span class="text-danger">*</span></label>
                    <select v-model="form.tauxTVA" class="form-select" required>
                      <option value="">Choisir...</option>
                      <option value="0">0%</option>
                      <option value="7">7%</option>
                      <option value="19">19%</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Compte de vente <span class="text-danger">*</span></label>
                    <!-- ✅ CORRIGÉ: 8 chiffres uniquement -->
                    <input
                      v-model="form.compteVente"
                      class="form-control"
                      placeholder="00000000"
                      type="text"
                      inputmode="numeric"
                      maxlength="8"
                      @input="form.compteVente = form.compteVente.replace(/[^0-9]/g, '').slice(0, 8)"
                      required
                    >
                    <small class="text-muted">Exactement 8 chiffres</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHAMPS COMMERCIAL / GMS / EXPORT / UCPC -->
            <div v-if="['commercial', 'gms', 'export', 'essanaouber'].includes(validationType) && form.avis === 'Favorable'" class="card mb-4">
              <div class="card-header bg-primary text-white">
                <h6 class="mb-0"><i class="bi bi-bag-check me-2"></i>Données Commerciales</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Prix Gros HT <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.prixGrosHT" class="form-control" required>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Prix Gros TTC <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.prixGrosTTC" class="form-control" required>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Prix Détail TTC <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.prixDetailTTC" class="form-control" required>
                  </div>
                </div>
              </div>
            </div>

            <!-- ✅ CHAMPS CONTRÔLE — un seul commentaire -->
            <div v-if="validationType === 'controle' && form.avis === 'Favorable'" class="card mb-4">
              <div class="card-header bg-secondary text-white">
                <h6 class="mb-0"><i class="bi bi-clipboard-check me-2"></i>Contrôle de Gestion</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Charge par KG <span class="text-danger">*</span></label>
                    <input type="number" v-model="form.chargeParKG" class="form-control" required>
                  </div>
                  <div class="col-md-12 mb-3">
                    <label class="form-label">Commentaire <span class="text-danger">*</span></label>
                    <textarea v-model="form.commentaireControle" class="form-control" rows="2" required
                      placeholder="Votre commentaire de contrôle..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
              <button type="button" @click="$router.push('/dashboard')"
                class="btn btn-outline-secondary me-md-2" :disabled="loading">
                <i class="bi bi-arrow-left me-2"></i>
                Retour
              </button>
              <button type="submit" class="btn btn-success px-4 fw-bold" :disabled="!form.avis || loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-lg me-2"></i>
                {{ loading ? 'Envoi...' : (form.avis === 'Favorable' ? 'Approuver' : 'Rejeter') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-else-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-3">Chargement...</p>
      </div>

      <div v-else class="alert alert-danger text-center py-5">
        <i class="bi bi-exclamation-triangle h1 me-2"></i>
        <h5>Article introuvable</h5>
        <p class="text-muted">{{ errorMessage }}</p>
        <router-link to="/dashboard" class="btn btn-primary">Retour Dashboard</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import ErrorToast from '@/components/ErrorToast.vue'

export default {
  components: { ErrorToast },
  data() {
    return {
      article: {},
      validation: {},
      validationType: 'marketing',
      loading: true,
      showError: false,
      errorType: 'error',
      errorTitle: 'Erreur',
      errorMessage: '',
      showSuccess: false,
      successType: 'success',
      successTitle: 'Succès',
      successMessage: '',
      form: {
        avis: '',
        rejectionComment: '',
        commentaire: '',
        sousFamille: '',
        gamme: '',
        uniteVente: '',
        facteurConversion: '',
        tare: '',
        maxRemplissage: '',
        maxMatiere: '',
        coutRevient: '',
        emballage: '',
        dlc: '',
        dlv: '',
        tauxTVA: '',
        compteVente: '',
        prixGrosHT: '',
        prixGrosTTC: '',
        prixDetailTTC: '',
        chargeParKG: '',
        commentaireControle: ''
      }
    }
  },
  computed: {
    stepLabel() {
      return this.validationType.charAt(0).toUpperCase() + this.validationType.slice(1)
    },
    previousValidations() {
      if (!this.article.validations) return []
      const currentIndex = this.article.validations.findIndex(v => v._id === this.validation._id)
      const previousVals = this.article.validations.slice(0, currentIndex)
      const uniqueByType = new Map()
      previousVals.forEach(validation => {
        const type = validation.type
        if (!uniqueByType.has(type) || new Date(validation.validatedAt) > new Date(uniqueByType.get(type).validatedAt)) {
          uniqueByType.set(type, validation)
        }
      })
      return Array.from(uniqueByType.values()).filter(v => v.status !== 'pending')
    }
  },
  async mounted() {
    await this.loadValidation()
  },
  methods: {
    async loadValidation() {
      try {
        const validationId = this.$route.params.validationId
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/validations/${validationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data) {
          this.validation = data.data
          this.validationType = data.data.type
          await this.loadArticle(data.data.article)
        } else {
          this.errorMessage = 'Validation non trouvée'
          this.loading = false
        }
      } catch (error) {
        this.errorMessage = error.message
        this.loading = false
      }
    },

    async loadArticle(articleId) {
      try {
        const id = typeof articleId === 'object' ? articleId._id : articleId
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/articles/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && data.data) {
          this.article = data.data
          this.loading = false
        } else {
          this.errorMessage = 'Article non trouvé'
          this.loading = false
        }
      } catch (error) {
        this.errorMessage = error.message
        this.loading = false
      }
    },

    async submitValidation() {
      try {
        this.loading = true

        // ✅ Validation compte de vente — 8 chiffres
        if (this.validationType === 'finance' && this.form.avis === 'Favorable') {
          if (!/^\d{8}$/.test(this.form.compteVente)) {
            this.errorType = 'error'
            this.errorTitle = '❌ Erreur'
            this.errorMessage = 'Le compte de vente doit contenir exactement 8 chiffres'
            this.showError = true
            this.loading = false
            return
          }
        }

        const token = localStorage.getItem('token')
        const dataToSend = {
          avis: this.form.avis,
          rejectionComment: this.form.rejectionComment,
          commentaire: this.form.commentaire
        }

        if (this.form.avis === 'Favorable') {
          if (this.validationType === 'marketing') {
            dataToSend.sousFamille = this.form.sousFamille
            dataToSend.gamme = this.form.gamme
          }
          if (this.validationType === 'production') {
            dataToSend.uniteVente = this.form.uniteVente
            dataToSend.facteurConversion = this.form.facteurConversion
            dataToSend.tare = this.form.tare
            dataToSend.maxRemplissage = this.form.maxRemplissage
            dataToSend.maxMatiere = this.form.maxMatiere
            dataToSend.coutRevient = this.form.coutRevient
            dataToSend.emballage = this.form.emballage
          }
          if (this.validationType === 'qualite') {
            dataToSend.dlc = this.form.dlc
            dataToSend.dlv = this.form.dlv
          }
          if (this.validationType === 'finance') {
            dataToSend.tauxTVA = this.form.tauxTVA
            dataToSend.compteVente = this.form.compteVente
          }
          if (['commercial', 'gms', 'export', 'essanaouber'].includes(this.validationType)) {
            dataToSend.prixGrosHT = this.form.prixGrosHT
            dataToSend.prixGrosTTC = this.form.prixGrosTTC
            dataToSend.prixDetailTTC = this.form.prixDetailTTC
          }
          if (this.validationType === 'controle') {
            dataToSend.chargeParKG = this.form.chargeParKG
            dataToSend.commentaireControle = this.form.commentaireControle
          }
        }

        const res = await fetch(`/api/validations/${this.validation._id}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend)
        })

        const data = await res.json()

        if (res.ok && data.success) {
          this.successType = this.form.avis === 'Favorable' ? 'success' : 'warning'
          this.successTitle = this.form.avis === 'Favorable' ? '✅ Approuvé!' : '⚠️ Rejeté!'
          this.successMessage = data.message || (
            this.form.avis === 'Favorable'
              ? "La demande a été approuvée et passe à l'étape suivante."
              : 'La demande a été rejetée.'
          )
          this.showSuccess = true
          setTimeout(() => { this.$router.push('/dashboard') }, 2000)
        } else {
          this.errorType = 'error'
          this.errorTitle = '❌ Erreur'
          this.errorMessage = data.message || 'Une erreur est survenue lors de la validation'
          this.showError = true
        }
      } catch (error) {
        this.errorType = 'error'
        this.errorTitle = '❌ Erreur Réseau'
        this.errorMessage = error.message || 'Impossible de contacter le serveur'
        this.showError = true
      } finally {
        this.loading = false
      }
    },

    formatDate(date) {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    },

    formatValidationType(type) {
      const map = {
        marketing: 'Marketing', production: 'Production', qualite: 'Qualité',
        finance: 'Finance & Comptabilité', commercial: 'Validation Commerciale',
        controle: 'Contrôle de Gestion', informatique: 'Informatique',
        essanaouber: 'Essanaouber', gms: 'GMS', export: 'Export', ucpc: 'UCPC'
      }
      return map[type] || type
    },

    getServiceIcon(type) {
      const icons = {
        marketing: 'bi bi-graph-up', production: 'bi bi-gear',
        qualite: 'bi bi-shield-check', finance: 'bi bi-cash-coin',
        commercial: 'bi bi-bag-check', gms: 'bi bi-shop',
        export: 'bi bi-globe', essanaouber: 'bi bi-box',
        controle: 'bi bi-clipboard-check', informatique: 'bi bi-laptop'
      }
      return icons[type] || 'bi bi-info-circle'
    },

    getValidationBadge(status) {
      const badges = {
        pending: 'bg-warning text-dark', approved: 'bg-success text-white',
        rejected: 'bg-danger text-white', cancelled: 'bg-secondary text-white',
        waiting: 'bg-secondary text-white'
      }
      return badges[status] || 'bg-secondary text-white'
    },

    getValidationLabel(status) {
      const labels = {
        pending: 'En attente', approved: 'Approuvé',
        rejected: 'Rejeté', cancelled: 'Annulé', waiting: 'En attente'
      }
      return labels[status] || status
    }
  }
}
</script>

<style scoped>
.container { padding: 2rem 0; }
.card { margin-bottom: 1rem; border-radius: 8px; }
.card-header { font-weight: bold; border-radius: 8px 8px 0 0; }
.form-label { color: #333; font-weight: 500; }
.service-card { border-radius: 8px; transition: box-shadow 0.3s ease; }
.service-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.bg-light-grey { background-color: #f8f9fa !important; border-left: 4px solid #d0d0d0; }
.badge { white-space: nowrap; padding: 0.5rem 0.75rem; font-weight: 600; font-size: 0.9rem; }
.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  background: #fff;
  border-radius: 6px;
  padding: 10px;
  border: 1px solid #e9ecef;
}
.data-item {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  background: #f8f9fa;
  border-radius: 4px;
}
.data-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
}
.data-value {
  font-size: 0.95rem;
  color: #212529;
  font-weight: 500;
}
</style>