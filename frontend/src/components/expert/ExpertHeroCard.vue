<script>
export default {
  name: 'ExpertHeroCard',
  props: {
    expert: {
      type: Object,
      required: true,
    },
  },
  methods: {
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
  <section class="card modern-panel modern-hero">
    <div class="card-body">
      <div class="d-flex align-items-start gap-3">
        <div
          class="rounded-circle expert-avatar d-flex align-items-center justify-content-center flex-shrink-0"
          style="width: 64px; height: 64px"
          aria-hidden="true"
        >
          {{ (expert.name || 'E').charAt(0).toUpperCase() }}
        </div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-start justify-content-between gap-2 flex-wrap">
            <div>
              <h1 class="h3 mb-1">{{ expert.name || 'Expert' }}</h1>
              <div v-if="expert.specialization" class="text-body-secondary">
                {{ expert.specialization }}
              </div>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <span v-if="expert.reviewCount > 0" class="badge text-bg-warning-subtle border text-warning-emphasis">
                <i class="bi bi-star-fill me-1" aria-hidden="true" />
                {{ expert.averageRating }} / 5 · {{ expert.reviewCount }}
              </span>
              <span v-else class="badge text-bg-light border text-body-secondary">No reviews yet</span>
              <span class="badge text-bg-light border">{{ formatRate(expert.hourlyRate) }} / hour</span>
            </div>
          </div>

          <dl class="row g-2 mt-3 mb-0">
            <template v-if="expert.email">
              <dt class="col-12 col-sm-3 text-body-secondary">Email</dt>
              <dd class="col-12 col-sm-9 mb-0">
                <a class="link-primary text-decoration-none" :href="`mailto:${expert.email}`">{{ expert.email }}</a>
              </dd>
            </template>
            <template v-if="expert.phone">
              <dt class="col-12 col-sm-3 text-body-secondary">Phone</dt>
              <dd class="col-12 col-sm-9 mb-0">{{ expert.phone }}</dd>
            </template>
            <dt class="col-12 col-sm-3 text-body-secondary">Hourly rate</dt>
            <dd class="col-12 col-sm-9 mb-0">{{ formatRate(expert.hourlyRate) }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.modern-panel {
  border-radius: 14px;
  border: 1px solid rgba(120, 130, 160, 0.25);
  background: rgba(255, 255, 255, 0.98);
}

.modern-hero {
  background: linear-gradient(145deg, rgba(248, 250, 255, 0.95), rgba(245, 248, 255, 0.8));
}

.expert-avatar {
  font-weight: 600;
  font-size: 1.15rem;
  border: 1px solid rgba(120, 130, 160, 0.3);
  background: linear-gradient(160deg, rgba(13, 110, 253, 0.08), rgba(13, 110, 253, 0.18));
  color: rgba(20, 45, 85, 0.9);
}
</style>
