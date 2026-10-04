<template>
  <footer class="footer bg-white border-top mt-5">
    <div class="container-fluid px-4 py-4">
      <div class="row">
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="d-flex align-items-center mb-2">
            <div class="brand-logo-small me-2">EM</div>
            <strong>EL-MAZRAA</strong>
          </div>
          <p class="text-muted small mb-0">
            Système de gestion des demandes de création d'articles
          </p>
        </div>

        <div class="col-md-4 mb-3 mb-md-0">
          <h6 class="fw-bold mb-3">Liens rapides</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/dashboard" class="text-muted text-decoration-none small">
                Tableau de bord
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/articles/create" class="text-muted text-decoration-none small">
                Nouvelle demande
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/articles/list" class="text-muted text-decoration-none small">
                Mes demandes
              </router-link>
            </li>
          </ul>
        </div>

        <div class="col-md-4">
          <h6 class="fw-bold mb-3">Support</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="mailto:support@elmazraa.com" class="text-muted text-decoration-none small">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-1">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                support@elmazraa.com
              </a>
            </li>
            <li class="mb-2">
              <a href="tel:+21612345678" class="text-muted text-decoration-none small">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="me-1">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                +216 12 345 678
              </a>
            </li>
          </ul>
        </div>
      </div>

      <hr class="my-3">

      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <p class="text-muted small mb-0">
            &copy; {{ currentYear }} EL-MAZRAA. Tous droits réservés.
          </p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <p class="text-muted small mb-0">
            Développé par l'équipe IT
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  margin-top: auto;
}

.brand-logo-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2d5f3f 0%, #1a3d28 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
}

.footer a:hover {
  color: #2d5f3f !important;
}
</style>