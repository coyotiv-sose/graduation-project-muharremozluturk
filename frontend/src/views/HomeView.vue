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
  <section>
    <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
      <div>
        <h1 class="h3 mb-1">Experts</h1>
        <p class="text-body-secondary mb-0">Browse experts and book available slots.</p>
      </div>
    </div>

    <div v-if="loading" class="alert alert-secondary mb-0" role="status">Loading…</div>
    <div v-else-if="errorMessage" class="alert alert-danger mb-0" role="alert">
      {{ errorMessage }}
    </div>

    <div v-else-if="experts.length" class="row g-3">
      <div v-for="expert in experts" :key="expert._id" class="col-12 col-md-6">
        <RouterLink
          class="text-decoration-none"
          :to="{ name: 'expert', params: { id: expert._id } }"
        >
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex gap-3">
              <div
                class="rounded-circle bg-body-tertiary border d-flex align-items-center justify-content-center flex-shrink-0"
                style="width: 52px; height: 52px"
                aria-hidden="true"
              >
                <i class="bi bi-person-circle fs-3 text-body-secondary" />
              </div>
              <div class="min-w-0">
                <div class="d-flex align-items-start justify-content-between gap-2">
                  <h2 class="h6 mb-1 text-body">{{ expert.name || 'Unnamed expert' }}</h2>
                  <i class="bi bi-chevron-right text-body-secondary" aria-hidden="true" />
                </div>
                <div v-if="expert.specialization" class="text-body-secondary small mb-1">
                  {{ expert.specialization }}
                </div>
                <div class="small">
                  <span
                    v-if="expert.reviewCount > 0"
                    class="badge text-bg-warning-subtle border text-warning-emphasis"
                    :title="`${expert.averageRating} / 5`"
                  >
                    <i class="bi bi-star-fill me-1" aria-hidden="true" />
                    {{ expert.averageRating }} / 5 · {{ expert.reviewCount }}
                    {{ expert.reviewCount === 1 ? 'review' : 'reviews' }}
                  </span>
                  <span v-else class="badge text-bg-light border text-body-secondary">
                    No reviews yet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div v-else class="alert alert-light border mb-0">No experts yet.</div>
  </section>
</template>

<style scoped>
/* Bootstrap handles layout */
</style>
