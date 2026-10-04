<template>
  <div class="article-card">
    <div class="card-header">
      <h3>{{ title }}</h3>
      <span :class="['status', `status-${status}`]">{{ status }}</span>
    </div>
    <div class="card-body">
      <p v-if="author"><strong>Author:</strong> {{ author }}</p>
      <p v-if="category"><strong>Category:</strong> {{ category }}</p>
      <p v-if="createdDate"><strong>Created:</strong> {{ createdDate }}</p>
      <p v-if="excerpt" class="excerpt">{{ excerpt }}</p>
      <div v-if="validationStats" class="validation-stats">
        <div class="stat">
          <span class="stat-label">Commercial</span>
          <span :class="['stat-badge', validationStats.commercial]">{{ validationStats.commercial }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Finance</span>
          <span :class="['stat-badge', validationStats.finance]">{{ validationStats.finance }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Quality</span>
          <span :class="['stat-badge', validationStats.quality]">{{ validationStats.quality }}</span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <button @click="view" class="btn btn-primary">View Details</button>
      <button @click="edit" class="btn btn-secondary">Edit</button>
      <button @click="deleteArticle" class="btn btn-danger">Delete</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleCard',
  props: {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: null
    },
    createdDate: {
      type: String,
      default: null
    },
    excerpt: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: 'draft'
    },
    validationStats: {
      type: Object,
      default: null
    }
  },
  methods: {
    view() {
      this.$emit('view');
    },
    edit() {
      this.$emit('edit');
    },
    deleteArticle() {
      this.$emit('delete');
    }
  }
}
</script>

<style scoped>
.article-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 1rem;
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.25rem;
  flex: 1;
}

.status {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-transform: uppercase;
}

.status-draft {
  background: #e9ecef;
  color: #495057;
}

.status-submitted {
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

.status-published {
  background: #d1ecf1;
  color: #0c5460;
}

.card-body {
  flex: 1;
  margin-bottom: 1rem;
}

.card-body p {
  margin: 0.5rem 0;
  color: var(--text-dark);
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-body strong {
  color: var(--primary-color);
  font-weight: 600;
}

.excerpt {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-left: 4px solid var(--primary-color);
  border-radius: var(--radius-sm);
  color: var(--text-dark);
  font-style: italic;
  font-size: 0.95rem;
  line-height: 1.5;
}

.validation-stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.stat-label {
  font-weight: 600;
  color: var(--text-dark);
}

.stat-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.stat-badge.approved {
  background: #d4edda;
  color: #155724;
}

.stat-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
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
