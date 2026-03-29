<script>
import http from '@/api/http'

export default {
  name: 'ExpertView',
  data() {
    return {
      expert: null,
      loading: true,
      errorMessage: '',
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() {
        this.loadExpert()
      },
    },
  },
  methods: {
    async loadExpert() {
      const id = this.$route.params.id
      this.loading = true
      this.errorMessage = ''
      this.expert = null
      try {
        const { data } = await http.get(`/experts/${id}`)
        this.expert = data
      } catch (e) {
        const status = e.response?.status
        const d = e.response?.data
        const msg =
          typeof d === 'string' ? d : d?.error || e.message || 'Could not load expert'
        this.errorMessage = status === 404 ? 'Expert not found' : msg
      } finally {
        this.loading = false
      }
    },
    formatRate(rate) {
      if (rate == null || rate === '') return '—'
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(rate))
    },
  },
}
</script>

<template>
  <main class="expert-page">
    <p class="back-row">
      <RouterLink class="back" :to="{ name: 'home' }">← Experts</RouterLink>
    </p>
    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <article v-else-if="expert" class="card">
      <h1 class="name">{{ expert.name || 'Expert' }}</h1>
      <dl class="fields">
        <div v-if="expert.specialization" class="row">
          <dt>Specialization</dt>
          <dd>{{ expert.specialization }}</dd>
        </div>
        <div v-if="expert.email" class="row">
          <dt>Email</dt>
          <dd>
            <a :href="`mailto:${expert.email}`">{{ expert.email }}</a>
          </dd>
        </div>
        <div v-if="expert.phone" class="row">
          <dt>Phone</dt>
          <dd>{{ expert.phone }}</dd>
        </div>
        <div class="row">
          <dt>Hourly rate</dt>
          <dd>{{ formatRate(expert.hourlyRate) }}</dd>
        </div>
      </dl>
    </article>
  </main>
</template>

<style scoped>
.expert-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 0 2rem;
}

.back-row {
  margin: 0 0 1rem;
}

.back {
  font-size: 0.9rem;
  color: var(--color-heading);
  text-decoration: none;
}

.back:hover {
  text-decoration: underline;
}

.muted {
  color: var(--color-text);
  opacity: 0.75;
  margin: 0;
}

.error {
  color: #c0392b;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .error {
    color: #ff6b6b;
  }
}

.card {
  padding: 1.75rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 1.25rem;
}

.fields {
  margin: 0;
}

.row {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 0.5rem 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--color-border);
}

.row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row:first-of-type {
  padding-top: 0;
}

dt {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-heading);
  opacity: 0.85;
}

dd {
  margin: 0;
  font-size: 0.95rem;
}

dd a {
  color: hsla(160, 100%, 30%, 1);
}

@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
