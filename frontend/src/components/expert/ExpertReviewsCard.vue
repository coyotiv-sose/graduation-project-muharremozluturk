<script>
export default {
  name: 'ExpertReviewsCard',
  props: {
    reviews: {
      type: Array,
      required: true,
    },
    reviewsLoading: {
      type: Boolean,
      required: true,
    },
    reviewsError: {
      type: String,
      required: true,
    },
    isViewingOwnExpertProfile: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    formatDateTime(iso) {
      if (iso == null || iso === '') return '—'
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return '—'
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d)
    },
    starsLabel(n) {
      const r = Math.round(Number(n) || 0)
      return '★'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r))
    },
  },
}
</script>

<template>
  <section class="card modern-panel" aria-labelledby="reviews-heading">
    <div class="card-body">
      <h2 id="reviews-heading" class="h5 mb-3">Client reviews</h2>
      <div v-if="reviewsLoading" class="text-body-secondary">Loading reviews…</div>
      <div v-else-if="reviewsError" class="alert alert-danger mb-0" role="alert">{{ reviewsError }}</div>
      <div v-else-if="!reviews.length" class="text-body-secondary">No written reviews yet.</div>
      <ul v-else class="list-group list-group-flush">
        <li v-for="review in reviews" :key="review._id" class="list-group-item px-0 review-row">
          <div class="d-flex align-items-start justify-content-between gap-2 flex-wrap">
            <div>
              <div class="fw-semibold">{{ review.clientName || 'Client' }}</div>
              <div class="small text-warning-emphasis" :title="`${review.rating} / 5`">
                {{ starsLabel(review.rating) }} <span class="text-body-secondary ms-1">{{ review.rating }} / 5</span>
              </div>
              <div v-if="review.text" class="small text-body-secondary mt-1">
                {{ review.text }}
              </div>
              <div v-else class="small text-body-tertiary mt-1">No written comment.</div>
            </div>
            <span v-if="review.appointment?.startTime" class="badge text-bg-light border review-date-badge">
              {{ formatDateTime(review.appointment.startTime) }}
            </span>
          </div>
          <div
            v-if="isViewingOwnExpertProfile && review.appointment?.expertNotes"
            class="small text-body-secondary mt-2 review-notes"
          >
            <span class="fw-semibold text-body">Your note:</span>
            {{ review.appointment.expertNotes }}
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.modern-panel {
  border-radius: 14px;
  border: 1px solid rgba(120, 130, 160, 0.25);
  background: rgba(255, 255, 255, 0.98);
}

.review-row {
  border-bottom-color: rgba(120, 130, 160, 0.18);
}

.review-date-badge {
  white-space: normal;
  text-align: right;
}

.review-notes {
  border-top: 1px dashed rgba(120, 130, 160, 0.25);
  padding-top: 0.5rem;
}
</style>
