<template>
  <div class="validation-card">
    <div class="card-header">
      <h3>{{ title }}</h3>
      <span :class="['status', `status-${status}`]">{{ status }}</span>
    </div>
    <div class="card-body">
      <p><strong>Document:</strong> {{ documentTitle }}</p>
      <p><strong>Submitted by:</strong> {{ submittedBy }}</p>
      <p v-if="submittedDate"><strong>Date:</strong> {{ submittedDate }}</p>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    <div class="card-footer">
      <button @click="view" class="btn btn-primary">View</button>
      <button v-if="canValidate" @click="approve" class="btn btn-success">Approve</button>
      <button v-if="canValidate" @click="reject" class="btn btn-danger">Reject</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ValidationCard',
  props: {
    title: {
      type: String,
      required: true
    },
    documentTitle: {
      type: String,
      required: true
    },
    submittedBy: {
      type: String,
      required: true
    },
    submittedDate: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: 'pending'
    },
    canValidate: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    view() {
      this.$emit('view');
    },
    approve() {
      this.$emit('approve');
    },
    reject() {
      this.$emit('reject');
    }
  }
}
</script>

<style scoped>
.validation-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.validation-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 1rem;
}

.card-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.25rem;
}

.status {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.card-body {
  margin-bottom: 1.5rem;
  color: var(--text-dark);
}

.card-body p {
  margin: 0.5rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-body strong {
  color: var(--primary-color);
  font-weight: 600;
}

.description {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-sm);
  color: var(--text-dark);
  font-size: 0.95rem;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
