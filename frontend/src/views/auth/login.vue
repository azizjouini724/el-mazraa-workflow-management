<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- Forme gauche - Décoration -->
      <div class="decoration decoration-left"></div>
      
      <!-- Forme droite - Décoration -->
      <div class="decoration decoration-right"></div>

      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="logo-wrapper">
            <img src="@/assets/images/logo-mazraa.png" alt="Mazraa" class="logo" />
          </div>
          <h1 class="login-title">Se connecter</h1>
          <p class="login-subtitle">Bienvenue sur Mazraa</p>
          <p class="login-description">Plateforme de gestion documentaire</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-circle-fill me-2"></i>
          <strong>Erreur!</strong> {{ error }}
          <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form">
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
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="form-footer-row">
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="remember" />
              <label class="form-check-label" for="remember">
                Se souvenir de moi
              </label>
            </div>
            <button 
              type="button" 
              class="btn btn-link p-0 forgot-password-link"
              data-bs-toggle="modal" 
              data-bs-target="#forgotPasswordModal"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary w-100 fw-bold" :disabled="loading">
            <span v-if="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Connexion en cours...
            </span>
            <span v-else>
              <i class="bi bi-box-arrow-in-right me-2"></i>Se connecter
            </span>
          </button>
        </form>
      </div>
    </div>

    <!-- ========== BOOTSTRAP MODAL ========== -->
    <div 
      class="modal fade" 
      id="forgotPasswordModal" 
      tabindex="-1" 
      aria-labelledby="forgotPasswordModalLabel" 
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="forgotPasswordModalLabel">
              Réinitialiser votre mot de passe
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              data-bs-dismiss="modal" 
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <p>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            <div v-if="forgotPasswordError" class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="bi bi-exclamation-circle-fill me-2"></i>
              {{ forgotPasswordError }}
              <button type="button" class="btn-close" @click="forgotPasswordError = ''" aria-label="Close"></button>
            </div>

            <div v-if="forgotPasswordSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              {{ forgotPasswordSuccess }}
            </div>

            <form @submit.prevent="handleForgotPassword" v-if="!forgotPasswordSuccess">
              <div class="mb-3">
                <label for="forgotEmail" class="form-label">
                  <i class="bi bi-envelope me-2"></i>Adresse email
                </label>
                <input
                  v-model="forgotPasswordForm.email"
                  type="email"
                  id="forgotEmail"
                  class="form-control"
                  placeholder="votre@email.com"
                  required
                  :disabled="loadingForgot"
                />
              </div>

              <div class="modal-footer">
                <button 
                  type="button" 
                  class="btn btn-secondary" 
                  data-bs-dismiss="modal"
                  :disabled="loadingForgot"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="loadingForgot"
                >
                  <span v-if="loadingForgot">
                    <span class="spinner-border spinner-border-sm me-2"></span>Envoi...
                  </span>
                  <span v-else>Envoyer le lien</span>
                </button>
              </div>
            </form>

            <div v-else class="modal-footer">
              <button 
                type="button" 
                class="btn btn-primary w-100" 
                data-bs-dismiss="modal"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      error: '',
      loading: false,
      forgotPasswordForm: {
        email: ''
      },
      forgotPasswordError: '',
      forgotPasswordSuccess: '',
      loadingForgot: false
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters['auth/isAuthenticated']
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''

      if (!this.form.email.trim()) {
        this.error = 'L\'email est requis'
        return
      }

      if (!this.form.password.trim()) {
        this.error = 'Le mot de passe est requis'
        return
      }

      this.loading = true

      try {
        const result = await this.$store.dispatch('auth/login', {
          email: this.form.email,
          password: this.form.password
        })

        if (result.success) {
          this.$router.push('/dashboard')
        } else {
          this.error = result.message || 'Erreur de connexion'
        }
      } catch (err) {
        console.error('Erreur login:', err)
        this.error = 'Erreur serveur'
      } finally {
        this.loading = false
      }
    },

    async handleForgotPassword() {
      this.forgotPasswordError = ''
      this.forgotPasswordSuccess = ''

      if (!this.forgotPasswordForm.email.trim()) {
        this.forgotPasswordError = 'L\'email est requis'
        return
      }

      this.loadingForgot = true

      try {
        const response = await api.post('/auth/forgot-password', {
          email: this.forgotPasswordForm.email
        })

        if (response.data.success) {
          this.forgotPasswordSuccess = 'Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte mail.'
          this.forgotPasswordForm.email = ''
          
          setTimeout(() => {
            const modalElement = document.getElementById('forgotPasswordModal')
            if (modalElement) {
              const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement)
              modal.hide()
            }
            this.forgotPasswordSuccess = ''
          }, 3000)
        } else {
          this.forgotPasswordError = response.data.message || 'Erreur lors de l\'envoi'
        }
      } catch (err) {
        console.error('Erreur forgot password:', err)
        this.forgotPasswordError = 'Erreur serveur'
      } finally {
        this.loadingForgot = false
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
.login-wrapper {
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
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #2d5f3f, #4caf50);
  top: -100px;
  left: -100px;
}

.decoration-right {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #0066cc, #4caf50);
  bottom: -50px;
  right: -50px;
}

/* ===== CONTAINER ===== */
.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 10;
}

/* ===== CARD ===== */
.login-card {
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
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 100px;
  object-fit: contain;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 1rem 0 0.5rem;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #2d5f3f;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.login-description {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin: 0;
}

/* ===== FORM ===== */
.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.75rem;
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

.form-control {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #2d5f3f;
  background: white;
  box-shadow: 0 0 0 0.2rem rgba(45, 95, 63, 0.25);
}

/* ===== FOOTER ROW ===== */
.form-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-check {
  font-size: 0.9rem;
}

.form-check-input {
  border: 2px solid #e0e0e0;
  border-radius: 5px;
}

.form-check-input:checked {
  background: linear-gradient(135deg, #2d5f3f 0%, #4caf50 100%);
  border-color: #2d5f3f;
}

.forgot-password-link {
  color: #2d5f3f !important;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-password-link:hover {
  color: #4caf50 !important;
  text-decoration: underline;
}

/* ===== BUTTON ===== */
.btn-primary {
  background: linear-gradient(135deg, #2d5f3f 0%, #4caf50 100%);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1f4c2f 0%, #3a8a3f 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(45, 95, 63, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .login-wrapper {
    padding: 15px;
  }

  .login-card {
    padding: 2.5rem 1.75rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .logo-wrapper {
    width: 70px;
    height: 70px;
  }

  .logo {
    height: 50px;
  }

  .decoration {
    display: none;
  }

  .form-footer-row {
    flex-direction: column;
    align-items: stretch;
  }

  .forgot-password-link {
    text-align: center;
  }
}
</style>