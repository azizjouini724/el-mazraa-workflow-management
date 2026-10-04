<template>
  <div class="container py-4">
    <div class="page-header mb-4">
      <h1 class="h3 fw-bold">
        <i class="bi bi-check-circle-fill text-success me-2"></i>
        Articles Créés en QAD
      </h1>
      <p class="text-muted">Liste de tous les articles validés et créés dans le système QAD</p>
    </div>

    <!-- STATISTIQUES -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-3">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-success text-white me-3">
              <i class="bi bi-check-circle"></i>
            </div>
            <div>
              <div class="small text-muted fw-bold">Total Créés</div>
              <div class="h4 mb-0 fw-bold">{{ articlesQAD.length }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-3">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-info text-white me-3">
              <i class="bi bi-calendar"></i>
            </div>
            <div>
              <div class="small text-muted fw-bold">Ce mois</div>
              <div class="h4 mb-0 fw-bold">{{ articlesThisMonth }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm p-3">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-success text-white me-3">
              <i class="bi bi-check-lg"></i>
            </div>
            <div>
              <div class="small text-muted fw-bold">Approuvés</div>
              <div class="h4 mb-0 fw-bold">{{ articlesQAD.length }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TABLEAU DES ARTICLES -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3 fw-bold">
        <i class="bi bi-list-ul me-2"></i>
        Liste des Articles QAD
      </div>
      <div class="card-body p-0">
        <!-- CHARGEMENT -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
          <p class="mt-3">Chargement des articles...</p>
        </div>

        <!-- VIDE -->
        <div v-else-if="articlesQAD.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox display-4"></i>
          <p class="mt-2">Aucun article créé en QAD pour le moment</p>
          <router-link to="/articles-produit/create" class="btn btn-primary btn-sm mt-2">
            <i class="bi bi-plus-lg me-2"></i>Créer une demande
          </router-link>
        </div>

        <!-- TABLEAU -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Code QAD</th>
                <th>Référence</th>
                <th>Demandeur</th>
                <th>Société</th>
                <th>Nature</th>
                <th>Description</th>
                <th>Date Création</th>
                <th>Statut</th>
                <th class="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in articlesQAD" :key="article._id">
                <td class="fw-bold text-success">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  {{ article.qadCode || 'N/A' }}
                </td>
                <td class="text-primary fw-bold">#{{ article._id.slice(-6).toUpperCase() }}</td>
                <td>{{ article.creator?.name || '---' }}</td>
                <td>{{ article.societe }}</td>
                <td>
                  <span class="badge bg-light text-dark border">{{ article.nature }}</span>
                </td>
                <td class="text-truncate" style="max-width: 250px;">
                  {{ article.description1 }}
                </td>
                <td>{{ formatDate(article.qadCreatedAt || article.createdAt) }}</td>
                <td>
                  <span class="badge bg-success">
                    <i class="bi bi-check-lg me-1"></i>
                    Créé en QAD
                  </span>
                </td>
                <td class="text-end px-4">
                  <button class="btn btn-sm btn-outline-primary" @click="viewDetails(article._id)">
                    <i class="bi bi-eye"></i> Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticlesQAD',
  data() {
    return {
      articlesQAD: [],
      loading: false
    }
  },
  computed: {
    articlesThisMonth() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      return this.articlesQAD.filter(a => {
        const date = new Date(a.qadCreatedAt || a.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
    }
  },
  async mounted() {
    await this.loadArticlesQAD();
  },
  methods: {
    async loadArticlesQAD() {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');
        
        // ✅ UTILISE LE BON ENDPOINT
        const res = await fetch('/api/articles/qad/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        console.log('📦 QAD Articles loaded:', data);
        
        if (data.success) {
          this.articlesQAD = data.data;
          console.log(`✅ ${this.articlesQAD.length} articles créés en QAD`);
        }
      } catch (error) {
        console.error('❌ Load error:', error);
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    viewDetails(articleId) {
      console.log('Voir détails:', articleId);
      this.$router.push(`/articles/${articleId}`);
    }
  }
}
</script>

<style scoped>
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.page-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1.5rem;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
</style>