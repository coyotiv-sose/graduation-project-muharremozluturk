<script>
import http from '@/api/http'

export default {
  name: 'HomeView',
  data() {
    return {
      experts: [],
      loading: true,
      errorMessage: '',
    }
  },
  async mounted() {
    await this.loadExperts()
  },
  methods: {
    async loadExperts() {
      this.loading = true
      this.errorMessage = ''
      try {
        const { data } = await http.get('/experts')
        this.experts = Array.isArray(data) ? data : []
      } catch (e) {
        const d = e.response?.data
        this.errorMessage =
          (typeof d === 'string' ? d : d?.error) || e.message || 'Could not load experts'
        this.experts = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <main class="home">
    <h1 class="title">Experts</h1>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <ul v-else-if="experts.length" class="list">
      <li v-for="expert in experts" :key="expert._id" class="item">
        <RouterLink class="link" :to="{ name: 'expert', params: { id: expert._id } }">
          <span class="name">{{ expert.name || 'Unnamed expert' }}</span>
          <span v-if="expert.specialization" class="meta">{{ expert.specialization }}</span>
          <span v-if="expert.reviewCount > 0" class="rating">
            {{ expert.averageRating }} / 5 · {{ expert.reviewCount }}
            {{ expert.reviewCount === 1 ? 'review' : 'reviews' }}
          </span>
          <span v-else class="rating rating--muted">No reviews yet</span>
        </RouterLink>
      </li>
    </ul>

    <p v-else class="muted">No experts yet.</p>
  </main>
</template>

<style scoped>
.home {
  max-width: 560px;
  margin: 0 auto;
  padding: 0 0 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 1.25rem;
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

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-background-soft);
}

.item {
  border-bottom: 1px solid var(--color-border);
}

.item:last-child {
  border-bottom: none;
}

.link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.25rem;
  text-decoration: none;
  color: var(--color-text);
  transition: background 0.15s;
}

.link:hover {
  background: var(--color-background-mute);
}

.name {
  font-weight: 600;
  color: var(--color-heading);
}

.meta {
  font-size: 0.875rem;
  opacity: 0.85;
}

.rating {
  font-size: 0.8rem;
  color: hsl(45, 75%, 36%);
  font-weight: 500;
}

.rating--muted {
  color: var(--color-text);
  opacity: 0.65;
  font-weight: 400;
}

@media (prefers-color-scheme: dark) {
  .rating {
    color: hsl(45, 80%, 68%);
  }
}
</style>
