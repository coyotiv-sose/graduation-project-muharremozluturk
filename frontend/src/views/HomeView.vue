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
  computed: {
    categorizedExperts() {
      const groups = {
        career: [],
        activity: [],
        health: [],
        other: [],
      }
      for (const expert of this.experts) {
        groups[this.categoryForExpert(expert)].push(expert)
      }
      return [
        { key: 'career', title: 'Career', experts: groups.career },
        { key: 'activity', title: 'Activity', experts: groups.activity },
        { key: 'health', title: 'Health', experts: groups.health },
        { key: 'other', title: 'Other', experts: groups.other },
      ].filter((section) => section.experts.length > 0)
    },
  },
  async mounted() {
    await this.loadExperts()
  },
  methods: {
    categoryForExpert(expert) {
      const text = String(expert?.specialization || '').toLowerCase()
      const matches = (keywords) => keywords.some((keyword) => text.includes(keyword))
      if (
        matches([
          'career',
          'leadership',
          'executive',
          'hr',
          'human resources',
          'talent',
          'recruit',
          'interview',
          'resume',
          'cv',
          'product manager',
        ])
      ) {
        return 'career'
      }
      if (
        matches([
          'fitness',
          'pilates',
          'yoga',
          'running',
          'cycling',
          'strength',
          'dance',
          'sports',
          'climbing',
          'marathon',
          'mobility',
        ])
      ) {
        return 'activity'
      }
      if (
        matches([
          'health',
          'nutrition',
          'diet',
          'therapy',
          'psychology',
          'physio',
          'rehabilitation',
          'wellness',
          'medical',
          'sleep',
        ])
      ) {
        return 'health'
      }
      return 'other'
    },
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

    <div v-else-if="experts.length" class="d-grid gap-4">
      <section v-for="section in categorizedExperts" :key="section.key" class="d-grid gap-2">
        <h2 class="h5 mb-0">{{ section.title }}</h2>
        <div class="row g-3">
          <div v-for="expert in section.experts" :key="expert._id" class="col-12 col-md-6">
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
                      <h3 class="h6 mb-1 text-body">{{ expert.name || 'Unnamed expert' }}</h3>
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
      </section>
    </div>

    <div v-else class="alert alert-light border mb-0">No experts yet.</div>
  </section>
</template>

<style scoped>
/* Bootstrap handles layout */
</style>
