<template>
  <div class="register-wrapper">
    <div class="register-container">
      <!-- Décoration gauche -->
      <div class="decoration decoration-left"></div>
      
      <!-- Décoration droite -->
      <div class="decoration decoration-right"></div>

      <div class="register-card">
        <!-- Header -->
        <div class="register-header">
          <div class="logo-wrapper">
            <img src="@/assets/images/logo-mazraa.png" alt="Mazraa" class="logo" />
          </div>
          <h1 class="register-title">Créer un compte</h1>
          <p class="register-subtitle">Rejoignez Mazraa</p>
          <p class="register-description">Plateforme de gestion documentaire</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert-custom alert-danger" role="alert">
          <i class="bi bi-exclamation-circle-fill"></i>
          <div class="alert-content">
            <strong>Erreur!</strong> {{ error }}
          </div>
          <button @click="error = ''" class="alert-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="alert-custom alert-success" role="alert">
          <i class="bi bi-check-circle-fill"></i>
          <div class="alert-content">
            <strong>Succès!</strong> {{ success }}
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- Name Input -->
          <div class="form-group">
            <label for="name" class="form-label">
              <i class="bi bi-person"></i> Nom complet
            </label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              class="form-control"
              placeholder="Jean Dupont"
              required
              :disabled="loading"
            />
          </div>

          <!-- Email Input -->
          <div class="form-group">
            <label for="email" class="form-label">
              <i class="bi bi-envelope"></i> Adresse email
            </label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              class="form-control"
              placeholder="votre@email.com"
              required
              :disabled="loading"
            />
          </div>

          <!-- Role Select -->
          <div class="form-group">
            <label for="role" class="form-label">
              <i class="bi bi-briefcase"></i> Département / Rôle
              <span class="text-danger">*</span>
            </label>
            <select
              v-model="form.role"
              id="role"
              class="form-control form-select"
              required
              :disabled="loading"
            >
              <option value="">Sélectionner votre département</option>
              <optgroup label="👤 Utilisateur">
                <option value="user">Utilisateur (Créateur d'articles)</option>
              </optgroup>
              <optgroup label="✓ Validateurs">
                <option value="validateur_marketing">Validateur Marketing</option>
                <option value="validateur_production">Validateur Production</option>
                <option value="validateur_qualite">Validateur Qualité</option>
                <option value="validateur_finance">Validateur Finance & Comptabilité</option>
                <option value="validateur_commercial">Validateur Commercial</option>
                <option value="validateur_essanaouber">Validateur Essanaouber</option>
                <option value="validateur_gms">Validateur GMS</option>
                <option value="validateur_export">Validateur Export</option>
                <option value="validateur_ucpc">Validateur UCPC</option>
                <option value="validateur_controle">Validateur Contrôle de Gestion</option>
                <option value="validateur_informatique">Validateur Informatique</option>
              </optgroup>
              <optgroup label="🔒 Administration">
                <option value="admin">Administrateur</option>
              </optgroup>
            </select>
            <small class="form-hint">Sélectionnez votre rôle pour accéder à l'interface appropriée</small>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label for="password" class="form-label">
              <i class="bi bi-lock"></i> Mot de passe
            </label>
            <input
              v-model="form.password"
              type="password"
              id="password"
              class="form-control"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
            <small class="form-hint">Minimum 6 caractères</small>
          </div>

          <!-- Confirm Password Input -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              <i class="bi bi-lock-check"></i> Confirmer le mot de passe
            </label>
            <input
              v-model="form.confirmPassword"
              type="password"
              id="confirmPassword"
              class="form-control"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-register" :disabled="loading">
            <span v-if="loading" class="btn-loading">
              <span class="spinner"></span>
              Création en cours...
            </span>
            <span v-else>
              <i class="bi bi-check-circle"></i> Créer un compte
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="register-footer">
          <p class="footer-text">
            Vous avez déjà un compte?
            <router-link to="/login" class="link-primary">
              Se connecter
              <i class="bi bi-arrow-right"></i>
            </router-link>
          </p>
        </div>

        <!-- Info Message -->
        <div class="register-info">
          <i class="bi bi-info-circle"></i>
          <p>Utilisez votre email professionnel fourni par l'administration</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      form: {
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
      },
      error: '',
      success: '',
      loading: false
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters['auth/isAuthenticated']
    }
  },
  methods: {
    async handleRegister() {
      this.error = ''
      this.success = ''

      if (!this.form.name.trim()) {
        this.error = 'Le nom est requis'
        return
      }

      if (!this.form.email.trim()) {
        this.error = 'L\'email est requis'
        return
      }

      if (!this.form.role) {
        this.error = 'Veuillez sélectionner un département/rôle'
        return
      }

      if (this.form.password.length < 6) {
        this.error = 'Le mot de passe doit contenir au minimum 6 caractères'
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas'
        return
      }

      this.loading = true

      try {
        const result = await this.$store.dispatch('auth/register', {
          name: this.form.name,
          email: this.form.email,
          role: this.form.role,
          password: this.form.password
        })

        if (result.success) {
          this.success = 'Compte créé avec succès! Redirection en cours...'
          
          setTimeout(() => {
            this.$router.push('/dashboard')
          }, 1500)
        } else {
          this.error = result.message || 'Erreur lors de l\'inscription'
        }
      } catch (err) {
        console.error('Erreur register:', err)
        this.error = 'Erreur serveur'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    if (this.isAuthenticated) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
/* ===== LAYOUT PRINCIPAL ===== */
.register-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0f2ff 50%, #f0e5ff 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Décoration - Formes géométriques */
.decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  z-index: 0;
}

.decoration-left {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #2d5f3f, #4caf50);
  top: -100px;
  left: -100px;
}

.decoration-right {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #0066cc, #4caf50);
  bottom: -80px;
  right: -80px;
}

/* ===== CONTAINER ===== */
.register-container {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 10;
}

/* ===== CARD ===== */
.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 3.5rem 2.5rem;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== HEADER ===== */
.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #2d5f3f 0%, #4caf50 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(45, 95, 63, 0.2);
}

.logo {
  height: 60px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 1rem 0 0.5rem;
  letter-spacing: -0.5px;
}

.register-subtitle {
  font-size: 0.95rem;
  color: #2d5f3f;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.register-description {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0;
}

/* ===== ALERT ===== */
.alert-custom {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1.75rem;
  border-radius: 10px;
  border: 1px solid;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.alert-custom i {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-custom.alert-danger {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-color: #ffcccc;
  color: #c0392b;
}

.alert-custom.alert-success {
  background: linear-gradient(135deg, #f0fdf4 0%, #e8f7e8 100%);
  border-color: #ccffcc;
  color: #166534;
}

.alert-content {
  flex: 1;
  font-size: 0.9rem;
}

.alert-content strong {
  font-weight: 600;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.alert-close:hover {
  opacity: 1;
}

/* ===== FORM ===== */
.register-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.form-label i {
  font-size: 1rem;
  color: #2d5f3f;
}

.text-danger {
  color: #dc3545;
  margin-left: 2px;
}

.form-control,
.form-select {
  width: 100%;
  padding: 0.9rem 1.1rem;
  font-size: 0.95rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-control::placeholder,
.form-select::placeholder {
  color: #bdc3c7;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: #2d5f3f;
  background: white;
  box-shadow: 0 0 0 4px rgba(45, 95, 63, 0.1);
}

.form-control:disabled,
.form-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%232d5f3f' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
  padding-right: 2.5rem;
}

.form-hint {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* ===== BUTTON ===== */
.btn-register {
  width: 100%;
  padding: 1.1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2d5f3f 0%, #4caf50 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: 0 4px 16px rgba(45, 95, 63, 0.2);
  margin-top: 0.5rem;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(45, 95, 63, 0.3);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== FOOTER ===== */
.register-footer {
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
  margin-bottom: 1.5rem;
}

.footer-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.link-primary {
  color: #2d5f3f;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.4rem;
  transition: all 0.3s ease;
}

.link-primary:hover {
  color: #4caf50;
  gap: 0.6rem;
}

.link-primary i {
  font-size: 0.85rem;
}

/* ===== INFO MESSAGE ===== */
.register-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #e8f4f8 0%, #f0f8e8 100%);
  border-radius: 10px;
  border: 1px solid #d0e8f0;
  font-size: 0.85rem;
  color: #2c5f3f;
}

.register-info i {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.register-info p {
  margin: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .register-wrapper {
    padding: 15px;
  }

  .register-card {
    padding: 2.5rem 1.75rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .logo-wrapper {
    width: 70px;
    height: 70px;
  }

  .logo {
    height: 50px;
  }

  .form-control,
  .form-select {
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
  }

  .btn-register {
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
  }

  .decoration {
    display: none;
  }

  .register-info {
    font-size: 0.8rem;
  }
}
</style>