<template>
  <div class="reset-password-wrapper">
    <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div class="reset-card shadow-lg">
        <!-- Header -->
        <div class="text-center mb-4">
          <img src="@/assets/images/logo-mazraa.png" alt="Mazraa" class="logo mb-3" />
          <h1 class="h2 fw-bold text-dark">Réinitialiser votre mot de passe</h1>
          <p class="text-muted small">Créez un nouveau mot de passe sécurisé</p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-circle-fill me-2"></i>
          <strong>Erreur!</strong> {{ error }}
          <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong>Succès!</strong> {{ success }}
        </div>

        <!-- Form or Success Message -->
        <div v-if="!success && tokenValid">
          <form @submit.prevent="handleResetPassword">
            <!-- New Password -->
            <div class="mb-3">
              <label for="newPassword" class="form-label fw-500">
                <i class="bi bi-lock me-2"></i>Nouveau mot de passe
              </label>
              <input
                v-model="form.newPassword"
                type="password"
                id="newPassword"
                class="form-control form-control-lg"
                placeholder="••••••••"
                required
                :disabled="loading"
                @input="updatePasswordStrength"
              />
              <!-- Password Strength -->
              <div class="progress mt-2" style="height: 4px;">
                <div class="progress-bar" :class="'bg-' + strengthColor" :style="{width: strengthWidth + '%'}"></div>
              </div>
              <small class="d-block mt-1" :class="'text-' + strengthColor">
                Force: {{ strengthTexts[passwordStrength] }}
              </small>
            </div>

            <!-- Confirm Password -->
            <div class="mb-3">
              <label for="confirmPassword" class="form-label fw-500">
                <i class="bi bi-lock me-2"></i>Confirmer le mot de passe
              </label>
              <input
                v-model="form.confirmPassword"
                type="password"
                id="confirmPassword"
                class="form-control form-control-lg"
                placeholder="••••••••"
                required
                :disabled="loading"
              />
            </div>

            <!-- Password Requirements -->
            <div class="card bg-light border-0 mb-3">
              <div class="card-body p-3">
                <h6 class="card-title small fw-bold mb-2">Exigences du mot de passe :</h6>
                <ul class="list-unstyled small mb-0">
                  <li :class="{ 'text-success': form.newPassword.length >= 6 }">
                    <i class="bi" :class="form.newPassword.length >= 6 ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                    Au moins 6 caractères
                  </li>
                  <li :class="{ 'text-success': /[a-z]/.test(form.newPassword) }">
                    <i class="bi" :class="/[a-z]/.test(form.newPassword) ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                    Au moins une lettre minuscule
                  </li>
                  <li :class="{ 'text-success': /[A-Z]/.test(form.newPassword) }">
                    <i class="bi" :class="/[A-Z]/.test(form.newPassword) ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                    Au moins une lettre majuscule
                  </li>
                  <li :class="{ 'text-success': /[0-9]/.test(form.newPassword) }">
                    <i class="bi" :class="/[0-9]/.test(form.newPassword) ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                    Au moins un chiffre
                  </li>
                </ul>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold" :disabled="loading || !isFormValid">
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-2"></span>Réinitialisation...
              </span>
              <span v-else>
                <i class="bi bi-check-lg me-2"></i>Réinitialiser le mot de passe
              </span>
            </button>
          </form>
        </div>

        <!-- Success Message -->
        <div v-else-if="success" class="text-center">
          <div class="mb-3">
            <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
          </div>
          <h3 class="fw-bold text-dark mb-2">Mot de passe réinitialisé</h3>
          <p class="text-muted mb-3">Votre mot de passe a été réinitialisé avec succès.</p>
          <p class="text-secondary small mb-3">
            Redirection vers la connexion dans <strong>{{ redirectCountdown }}</strong> secondes...
          </p>
          <router-link to="/login" class="btn btn-primary btn-lg w-100 fw-bold">
            <i class="bi bi-arrow-left me-2"></i>Retour au login
          </router-link>
        </div>

        <!-- Invalid Token -->
        <div v-else class="text-center">
          <div class="mb-3">
            <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
          </div>
          <h3 class="fw-bold text-dark mb-2">Lien invalide ou expiré</h3>
          <p class="text-muted mb-2">Le lien de réinitialisation est invalide ou a expiré.</p>
          <p class="text-secondary small mb-3">Les liens de réinitialisation sont valables 1 heure.</p>
          <router-link to="/login" class="btn btn-primary btn-lg w-100 fw-bold">
            <i class="bi bi-arrow-left me-2"></i>Retour au login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'ResetPassword',
  data() {
    return {
      form: {
        newPassword: '',
        confirmPassword: ''
      },
      error: '',
      success: '',
      loading: false,
      tokenValid: false,
      passwordStrength: 0,
      redirectCountdown: 5,
      strengthTexts: {
        0: 'Faible',
        1: 'Faible',
        2: 'Moyen',
        3: 'Bon',
        4: 'Très bon'
      },
      strengthColors: ['danger', 'danger', 'warning', 'info', 'success']
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.newPassword.length >= 6 &&
        this.form.confirmPassword === this.form.newPassword &&
        /[a-z]/.test(this.form.newPassword) &&
        /[A-Z]/.test(this.form.newPassword) &&
        /[0-9]/.test(this.form.newPassword)
      )
    },
    strengthColor() {
      return this.strengthColors[this.passwordStrength]
    },
    strengthWidth() {
      return (this.passwordStrength + 1) * 20
    }
  },
  methods: {
    updatePasswordStrength() {
      let strength = 0
      
      if (this.form.newPassword.length >= 6) strength++
      if (/[a-z]/.test(this.form.newPassword)) strength++
      if (/[A-Z]/.test(this.form.newPassword)) strength++
      if (/[0-9]/.test(this.form.newPassword)) strength++
      if (/[^a-zA-Z0-9]/.test(this.form.newPassword)) strength++

      this.passwordStrength = Math.min(strength - 1, 4)
    },

    async handleResetPassword() {
      this.error = ''

      if (!this.form.newPassword || !this.form.confirmPassword) {
        this.error = 'Tous les champs sont requis'
        return
      }

      if (this.form.newPassword.length < 6) {
        this.error = 'Le mot de passe doit contenir au minimum 6 caractères'
        return
      }

      if (this.form.newPassword !== this.form.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas'
        return
      }

      if (!this.isFormValid) {
        this.error = 'Le mot de passe ne répond pas aux exigences'
        return
      }

      this.loading = true

      try {
        const token = this.$route.query.token

        const response = await api.post('/auth/reset-password', {
          token,
          newPassword: this.form.newPassword
        })

        if (response.data.success) {
          this.success = 'Votre mot de passe a été réinitialisé avec succès !'
          this.startRedirectCountdown()
        } else {
          this.error = response.data.message || 'Erreur lors de la réinitialisation'
        }
      } catch (err) {
        console.error('Erreur reset password:', err)
        if (err.response?.status === 400) {
          this.error = 'Lien de réinitialisation invalide ou expiré'
          this.tokenValid = false
        } else {
          this.error = 'Erreur serveur'
        }
      } finally {
        this.loading = false
      }
    },

    startRedirectCountdown() {
      const interval = setInterval(() => {
        this.redirectCountdown--
        if (this.redirectCountdown <= 0) {
          clearInterval(interval)
          this.$router.push('/login')
        }
      }, 1000)
    },

    verifyToken() {
      const token = this.$route.query.token
      if (token) {
        this.tokenValid = true
      } else {
        this.tokenValid = false
      }
    }
  },
  mounted() {
    this.verifyToken()
  }
}
</script>

<style scoped>
.reset-password-wrapper {
  background: linear-gradient(135deg, #f0f4ff 0%, #e0f2ff 50%, #f0e5ff 100%);
  min-height: 100vh;
}

.reset-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
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

.logo {
  height: 80px;
  object-fit: contain;
}

.fw-500 {
  font-weight: 500;
}

.form-control-lg:focus {
  border-color: #0066cc;
  box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0052a3 0%, #003d80 100%);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.65;
}

.min-vh-100 {
  min-height: 100vh;
}

.progress {
  background-color: #e9ecef;
}

.text-success { color: #28a745 !important; }
.text-danger { color: #dc3545 !important; }
.text-warning { color: #ffc107 !important; }
.text-info { color: #17a2b8 !important; }

.bg-success { background-color: #28a745 !important; }
.bg-danger { background-color: #dc3545 !important; }
.bg-warning { background-color: #ffc107 !important; }
.bg-info { background-color: #17a2b8 !important; }

@media (max-width: 576px) {
  .reset-card {
    padding: 1.5rem;
  }

  .logo {
    height: 60px;
  }
}
</style>