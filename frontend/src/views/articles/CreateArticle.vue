<template>
  <div class="create-article-container">
    <div class="page-header">
      <h1>Créer une Nouvelle Demande d'Article</h1>
      <p class="text-muted">Remplissez le formulaire ci-dessous pour soumettre une demande de création d'article</p>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- Société -->
          <div class="form-section">
            <h5 class="form-section-title">Informations Générales</h5>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="societe" class="form-label fw-500">Société <span class="text-danger">*</span></label>
                <select v-model="form.societe" id="societe" class="form-select form-select-lg" required>
                  <option value="">Sélectionner une société</option>
                  <option value="Mazraa">Mazraa</option>
                  <option value="Dick">Dick</option>
                  <option value="Essanaouber">Essanaouber</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label for="nature" class="form-label fw-500">Nature de la Demande <span class="text-danger">*</span></label>
                <select v-model="form.nature" id="nature" class="form-select form-select-lg" required>
                  <option value="">Sélectionner la nature</option>
                  <option value="GMS">GMS</option>
                  <option value="Réseaux">Réseaux</option>
                  <option value="UCPC">UCPC</option>
                  <option value="Croquette">Croquette</option>
                  <option value="Export">Export</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Descriptions -->
          <div class="form-section">
            <h5 class="form-section-title">Descriptions</h5>
            
            <div class="mb-3">
              <label for="description1" class="form-label fw-500">Description 1 <span class="text-danger">*</span></label>
              <textarea v-model="form.description1" id="description1" class="form-control form-control-lg" rows="3" required placeholder="Entrez la première description"></textarea>
            </div>

            <div class="mb-3">
              <label for="description2" class="form-label fw-500">Description 2</label>
              <textarea v-model="form.description2" id="description2" class="form-control form-control-lg" rows="3" placeholder="Entrez la deuxième description (optionnel)"></textarea>
            </div>
          </div>

          <!-- Famille et Type -->
          <div class="form-section">
            <h5 class="form-section-title">Classification du Produit</h5>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="familleArticle" class="form-label fw-500">Famille d'Article <span class="text-danger">*</span></label>
                <select v-model="form.familleArticle" id="familleArticle" class="form-select form-select-lg" required>
                  <option value="">Sélectionner une famille</option>
                  <option value="Charcuterie">Charcuterie</option>
                  <option value="Dinde">Dinde</option>
                  <option value="Volaille">Volaille</option>
                  <option value="Produits Laitiers">Produits Laitiers</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label for="typeArticle" class="form-label fw-500">Type d'Article <span class="text-danger">*</span></label>
                <select v-model="form.typeArticle" id="typeArticle" class="form-select form-select-lg" required>
                  <option value="">Sélectionner le type</option>
                  <option value="Frais">Frais</option>
                  <option value="Congelé">Congelé</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Photo -->
          <div class="form-section">
            <h5 class="form-section-title">Photo du Produit</h5>
            
            <div class="mb-3">
              <label for="photo" class="form-label fw-500">Télécharger une photo</label>
              <input type="file" id="photo" class="form-control form-control-lg" accept="image/*" @change="handlePhotoUpload">
              <small class="text-muted d-block mt-2">Formats acceptés: JPG, PNG. Taille max: 5MB</small>
            </div>
          </div>

          <!-- Messages d'erreur et succès -->
          <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-circle me-2"></i>
            <strong>Erreur:</strong> {{ error }}
            <button type="button" class="btn-close" @click="error = ''"></button>
          </div>

          <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle me-2"></i>
            <strong>Succès:</strong> {{ success }}
            <button type="button" class="btn-close" @click="success = ''"></button>
          </div>

          <!-- Boutons -->
          <div class="form-actions">
            <button type="button" class="btn btn-lg btn-outline-secondary" @click="resetForm">
              <i class="bi bi-arrow-counterclockwise me-2"></i>Réinitialiser
            </button>
            <button type="submit" class="btn btn-lg btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-send me-2"></i>
              {{ loading ? 'Création en cours...' : 'Soumettre la Demande' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import productArticleService from '@/services/productArticleService'

export default {
  name: 'CreateArticle',
  data() {
    return {
      form: {
        societe: '',
        nature: '',
        description1: '',
        description2: '',
        familleArticle: '',
        typeArticle: '',
        photo: ''
      },
      loading: false,
      error: '',
      success: ''
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.error = ''
      this.success = ''

      try {
        const result = await productArticleService.createArticle(this.form)
        
        if (result.success) {
          this.success = 'Demande créée avec succès ! Elle est maintenant en validation.'
          this.resetForm()
          setTimeout(() => {
            this.$router.push('/dashboard')
          }, 2000)
        } else {
          this.error = result.message || 'Erreur lors de la création'
        }
      } catch (err) {
        this.error = 'Erreur de connexion au serveur'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    validateForm() {
      if (!this.form.societe) {
        this.error = 'Veuillez sélectionner une société'
        return false
      }
      if (!this.form.nature) {
        this.error = 'Veuillez sélectionner la nature de la demande'
        return false
      }
      if (!this.form.description1.trim()) {
        this.error = 'La description 1 est obligatoire'
        return false
      }
      if (!this.form.familleArticle) {
        this.error = 'Veuillez sélectionner une famille d\'article'
        return false
      }
      if (!this.form.typeArticle) {
        this.error = 'Veuillez sélectionner un type d\'article'
        return false
      }
      return true
    },

    resetForm() {
      this.form = {
        societe: '',
        nature: '',
        description1: '',
        description2: '',
        familleArticle: '',
        typeArticle: '',
        photo: ''
      }
      this.error = ''
      this.success = ''
    },

    handlePhotoUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.form.photo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
  }
}
</script>

<style scoped>
.create-article-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px);
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.page-header p {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-body {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.form-section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background-color: #0d6efd;
  margin-right: 0.75rem;
  border-radius: 2px;
}

.form-label {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-label .text-danger {
  margin-left: 0.25rem;
}

.form-control,
.form-select {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-control-lg,
.form-select-lg {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.alert {
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.alert-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

@media (max-width: 768px) {
  .create-article-container {
    padding: 1rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }
}
</style>