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
    totalExperts() {
      return this.experts.length
    },
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
    categorySummary() {
      return this.categorizedExperts.map((section) => ({
        key: section.key,
        title: section.title,
        count: section.experts.length,
      }))
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
    <div class="hero-panel mb-4">
      <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <p class="text-uppercase text-body-secondary small fw-semibold letter-space mb-2">
            Find your next expert
          </p>
          <h1 class="h3 mb-2">Discover trusted specialists</h1>
          <p class="text-body-secondary mb-0">Browse experts and book available slots in minutes.</p>
        </div>
        <div class="expert-count-pill">
          <span class="fw-semibold">{{ totalExperts }}</span>
          <span class="text-body-secondary small">experts</span>
        </div>
      </div>
      <div v-if="categorySummary.length" class="d-flex gap-2 flex-wrap mt-3">
        <span v-for="section in categorySummary" :key="section.key" class="category-chip">
          {{ section.title }} · {{ section.count }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="modern-alert modern-alert--loading mb-0" role="status">Loading experts…</div>
    <div v-else-if="errorMessage" class="alert alert-danger mb-0" role="alert">
      {{ errorMessage }}
    </div>

    <div v-else-if="experts.length" class="d-grid gap-4">
      <section v-for="section in categorizedExperts" :key="section.key" class="d-grid gap-2">
        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <h2 class="h5 mb-0">{{ section.title }}</h2>
          <span class="section-count">{{ section.experts.length }}</span>
        </div>
        <div class="row g-3">
          <div v-for="expert in section.experts" :key="expert._id" class="col-12 col-md-6">
            <RouterLink
              class="text-decoration-none expert-link"
              :to="{ name: 'expert', params: { id: expert._id } }"
            >
              <div class="card h-100 expert-card">
                <div class="card-body d-flex gap-3 align-items-start">
                  <div
                    class="expert-avatar rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style="width: 52px; height: 52px"
                    aria-hidden="true"
                  >
                    {{ (expert.name || 'E').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="d-flex align-items-start justify-content-between gap-2">
                      <h3 class="h6 mb-1 text-body fw-semibold">{{ expert.name || 'Unnamed expert' }}</h3>
                      <i class="bi bi-arrow-up-right text-body-secondary" aria-hidden="true" />
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
.hero-panel {
  border: 1px solid rgba(120, 130, 160, 0.18);
  background: linear-gradient(145deg, rgba(248, 250, 255, 0.95), rgba(245, 248, 255, 0.8));
  border-radius: 16px;
  padding: 1rem 1rem 0.9rem;
}

.expert-count-pill {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 90px;
  padding: 0.45rem 0.7rem;
  border-radius: 12px;
  border: 1px solid rgba(120, 130, 160, 0.2);
  background: #fff;
  line-height: 1.1;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(120, 130, 160, 0.2);
  background: #fff;
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  font-size: 0.8rem;
  color: var(--bs-secondary-color);
}

.modern-alert {
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(120, 130, 160, 0.2);
}

.modern-alert--loading {
  color: var(--bs-secondary-color);
  background: rgba(242, 244, 248, 0.9);
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  background: rgba(13, 110, 253, 0.08);
  border: 1px solid rgba(13, 110, 253, 0.2);
  color: rgba(13, 110, 253, 1);
  font-size: 0.78rem;
  font-weight: 600;
}

.expert-link {
  display: block;
  padding: 0;
  background-color: transparent;
}

.expert-link:hover {
  background-color: transparent;
}

.expert-card {
  border-radius: 14px;
  border: 1px solid rgba(120, 130, 160, 0.35);
  background: rgba(255, 255, 255, 0.98);
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.expert-link:hover .expert-card {
  transform: translateY(-1px);
  border-color: rgba(13, 110, 253, 0.55);
}

.expert-avatar {
  font-weight: 600;
  font-size: 1rem;
  border: 1px solid rgba(120, 130, 160, 0.3);
  background: linear-gradient(160deg, rgba(13, 110, 253, 0.08), rgba(13, 110, 253, 0.18));
  color: rgba(20, 45, 85, 0.9);
}

.letter-space {
  letter-spacing: 0.08em;
}
</style>
