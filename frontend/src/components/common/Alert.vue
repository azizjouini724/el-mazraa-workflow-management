<template>
  <transition name="alert-fade">
    <div v-if="visible" :class="['alert', `alert-${type}`]">
      <button @click="close" class="alert-close">&times;</button>
      <strong v-if="title">{{ title }}: </strong>
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      default: null
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      visible: true
    }
  },
  watch: {
    message() {
      this.visible = true;
      this.startAutoClose();
    }
  },
  mounted() {
    this.startAutoClose();
  },
  methods: {
    close() {
      this.visible = false;
      this.$emit('close');
    },
    startAutoClose() {
      setTimeout(() => {
        this.visible = false;
      }, this.duration);
    }
  }
}
</script>

<style scoped>
.alert {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

.alert-fade-enter-active, .alert-fade-leave-active {
  transition: opacity 0.3s;
}

.alert-fade-enter-from, .alert-fade-leave-to {
  opacity: 0;
}
</style>
