<template>
  <transition name="slide-down">
    <div v-if="show" class="error-toast" :class="`error-toast-${type}`">
      <div class="error-container">
        <!-- Icon -->
        <div class="error-icon">
          <i :class="getIcon"></i>
        </div>

        <!-- Content -->
        <div class="error-content">
          <h4 class="error-title">{{ title }}</h4>
          <p class="error-message">{{ message }}</p>
        </div>

        <!-- Close Button -->
        <button class="error-close" @click="close">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="error-progress" :style="{ animationDuration: `${duration}ms` }"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ErrorToast',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['error', 'warning', 'success', 'info'],
      default: 'error'
    },
    title: {
      type: String,
      default: 'Erreur'
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  computed: {
    getIcon() {
      const icons = {
        'error': 'bi bi-exclamation-circle-fill',
        'warning': 'bi bi-exclamation-triangle-fill',
        'success': 'bi bi-check-circle-fill',
        'info': 'bi bi-info-circle-fill'
      }
      return icons[this.type] || 'bi bi-exclamation-circle-fill'
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.close()
        }, this.duration)
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 9999;
  animation: slideDown 0.3s ease-out;
}

.error-container {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
}

.error-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
}

.error-message {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.85;
}

.error-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.error-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.error-progress {
  height: 3px;
  animation: progressBar linear forwards;
}

/* ===== TYPES D'ERREURS ===== */
.error-toast-error {
  border-left: 4px solid #dc3545;
}

.error-toast-error .error-icon {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.error-toast-error .error-progress {
  background: #dc3545;
}

.error-toast-warning {
  border-left: 4px solid #ffc107;
}

.error-toast-warning .error-icon {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.error-toast-warning .error-progress {
  background: #ffc107;
}

.error-toast-success {
  border-left: 4px solid #198754;
}

.error-toast-success .error-icon {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.error-toast-success .error-progress {
  background: #198754;
}

.error-toast-info {
  border-left: 4px solid #0dcaf0;
}

.error-toast-info .error-icon {
  background: rgba(13, 202, 240, 0.1);
  color: #0dcaf0;
}

.error-toast-info .error-progress {
  background: #0dcaf0;
}

/* ===== ANIMATIONS ===== */
@keyframes slideDown {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes progressBar {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateX(400px);
  opacity: 0;
}

@media (max-width: 768px) {
  .error-toast {
    max-width: calc(100% - 20px);
    left: 10px;
    right: 10px;
  }
}
</style>