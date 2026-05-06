<script>
import http from '@/api/http'
import { useAccountStore } from '@/stores/account'
import { mapState } from 'pinia'

export default {
  name: 'ClientProfileView',
  data() {
    return {
      loading: true,
      errorMessage: '',
      profile: null,
      upcomingBookings: [],
      completedBookings: [],
      profileSaving: false,
      profileFormError: '',
      editingProfile: false,
      profileForm: { name: '', phone: '' },
      /** Per appointment id: draft for review form */
      reviewDraft: {},
      reviewSavingId: null,
      reviewError: '',
    }
  },
  computed: {
    ...mapState(useAccountStore, ['user']),
  },
  watch: {
    user: {
      immediate: true,
      handler() {
        this.loadBookings()
      },
    },
  },
  methods: {
    expertId(booking) {
      const expert = booking?.expert
      if (expert == null) return ''
      return typeof expert === 'object' ? String(expert._id ?? '') : String(expert)
    },
    expertName(booking) {
      const expert = booking?.expert
      return typeof expert === 'object' ? expert.name || 'Expert' : 'Expert'
    },
    initReviewDrafts() {
      const next = {}
      for (const b of this.completedBookings) {
        next[b._id] = {
          rating: b.review?.rating ?? 5,
          text: b.review?.text ?? '',
        }
      }
      this.reviewDraft = next
    },
    starsLabel(n) {
      const r = Math.round(Number(n) || 0)
      return '★'.repeat(r) + '☆'.repeat(Math.max(0, 5 - r))
    },
    async loadBookings() {
      if (!this.user) {
        this.loading = false
        this.errorMessage = ''
        this.profile = null
        this.upcomingBookings = []
        this.completedBookings = []
        return
      }
      if (this.user.role !== 'client') {
        this.loading = false
        this.errorMessage = ''
        this.profile = null
        this.upcomingBookings = []
        this.completedBookings = []
        return
      }

      this.loading = true
      this.errorMessage = ''
      try {
        const id = this.user._id
        const [{ data: profile }, { data: upcoming }, { data: completed }] = await Promise.all([
          http.get(`/clients/${id}`),
          http.get(`/clients/${id}/upcoming-appointments`),
          http.get(`/clients/${id}/completed-appointments`),
        ])
        this.profile = profile
        this.profileForm = {
          name: profile?.name ?? '',
          phone: profile?.phone ?? '',
        }
        this.upcomingBookings = Array.isArray(upcoming) ? upcoming : []
        this.completedBookings = Array.isArray(completed) ? completed : []
        this.initReviewDrafts()
      } catch (e) {
        const d = e.response?.data
        this.errorMessage =
          (typeof d === 'string' ? d : d?.error) || e.message || 'Could not load profile'
        this.profile = null
        this.upcomingBookings = []
        this.completedBookings = []
      } finally {
        this.loading = false
      }
    },
    async saveProfile() {
      if (!this.user || this.user.role !== 'client') return
      this.profileSaving = true
      this.profileFormError = ''
      try {
        const { data } = await http.patch(`/clients/${this.user._id}`, {
          name: this.profileForm.name,
          phone: this.profileForm.phone,
        })
        this.profile = data
        this.editingProfile = false
        const store = useAccountStore()
        await store.fetchUser('client')
      } catch (e) {
        const d = e.response?.data
        this.profileFormError =
          (typeof d === 'string' ? d : d?.error) || e.message || 'Could not save profile'
      } finally {
        this.profileSaving = false
      }
    },
    async saveReview(appointmentId) {
      if (!this.user) return
      const draft = this.reviewDraft[appointmentId] || { rating: 5, text: '' }
      this.reviewSavingId = appointmentId
      this.reviewError = ''
      try {
        await http.put(`/appointments/${appointmentId}/review`, {
          rating: draft.rating,
          text: draft.text,
        })
        await this.loadBookings()
      } catch (e) {
        const d = e.response?.data
        this.reviewError =
          (typeof d === 'string' ? d : d?.error) || e.message || 'Could not save review'
      } finally {
        this.reviewSavingId = null
      }
    },
    formatDateTime(iso) {
      if (iso == null || iso === '') return '—'
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return '—'
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d)
    },
  },
}
</script>

<template>
  <section class="modern-page">
    <div class="hero-panel d-flex align-items-start justify-content-between gap-3 flex-wrap mb-3">
      <div class="d-flex align-items-center gap-3">
        <div
          class="rounded-circle profile-avatar d-flex align-items-center justify-content-center flex-shrink-0"
          style="width: 56px; height: 56px"
          aria-hidden="true"
        >
          {{ (profile?.name || user?.email || 'C').charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="h3 mb-1">My Profile</h1>
          <p class="text-body-secondary mb-0">Manage your details and reviews.</p>
        </div>
      </div>
    </div>

    <div v-if="!user" class="alert alert-light border mb-0">
      Log in as a client to view your profile.
    </div>
    <div v-else-if="user.role !== 'client'" class="alert alert-light border mb-0">
      This page is only available for client accounts.
    </div>
    <div v-else-if="loading" class="modern-alert modern-alert--loading mb-0" role="status">Loading…</div>
    <div v-else-if="errorMessage" class="alert alert-danger mb-0" role="alert">{{ errorMessage }}</div>
    <div v-else class="d-grid gap-3">
      <section class="card modern-panel">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
            <h2 class="h5 mb-0">Profile</h2>
            <button
              v-if="!editingProfile"
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click="editingProfile = true"
            >
              <i class="bi bi-pencil me-1" aria-hidden="true" />
              Edit
            </button>
          </div>

          <template v-if="!editingProfile">
            <dl v-if="profile" class="row g-2 mb-0">
              <dt class="col-12 col-sm-3 text-body-secondary">Name</dt>
              <dd class="col-12 col-sm-9 mb-0">{{ profile.name || '—' }}</dd>

              <dt class="col-12 col-sm-3 text-body-secondary">Email</dt>
              <dd class="col-12 col-sm-9 mb-0">{{ profile.email || '—' }}</dd>

              <dt class="col-12 col-sm-3 text-body-secondary">Phone</dt>
              <dd class="col-12 col-sm-9 mb-0">{{ profile.phone || '—' }}</dd>
            </dl>
          </template>

          <div v-else class="row g-2">
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Name</label>
              <input v-model="profileForm.name" class="form-control" type="text" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Phone</label>
              <input v-model="profileForm.phone" class="form-control" type="text" />
            </div>

            <div v-if="profileFormError" class="col-12">
              <div class="alert alert-danger mb-0" role="alert">{{ profileFormError }}</div>
            </div>

            <div class="col-12 d-flex gap-2 flex-wrap">
              <button
                type="button"
                class="btn btn-primary"
                :disabled="profileSaving"
                @click="saveProfile"
              >
                {{ profileSaving ? 'Saving…' : 'Save' }}
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                :disabled="profileSaving"
                @click="editingProfile = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="card modern-panel">
        <div class="card-body">
          <h2 class="h5 mb-3">My Bookings</h2>

          <h3 class="booking-section-title">Upcoming</h3>
          <div v-if="!upcomingBookings.length" class="text-body-secondary">No upcoming bookings.</div>
          <ul v-else class="list-group list-group-flush mb-3">
            <li v-for="booking in upcomingBookings" :key="booking._id" class="list-group-item px-0 booking-row">
              <div class="d-flex align-items-center gap-3">
                <div
                  class="rounded-circle list-avatar d-flex align-items-center justify-content-center flex-shrink-0"
                  style="width: 40px; height: 40px"
                  aria-hidden="true"
                >
                  {{ expertName(booking).charAt(0).toUpperCase() }}
                </div>
                <div class="flex-grow-1 min-w-0">
                  <RouterLink
                    class="fw-semibold text-decoration-none booking-link"
                    :to="{ name: 'expert', params: { id: expertId(booking) } }"
                  >
                    {{ expertName(booking) }}
                  </RouterLink>
                  <div class="small text-body-secondary">
                    {{ formatDateTime(booking.startTime) }} to {{ formatDateTime(booking.endTime) }}
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <h3 class="booking-section-title">Completed</h3>
          <div v-if="reviewError" class="alert alert-danger" role="alert">{{ reviewError }}</div>
          <div v-if="!completedBookings.length" class="text-body-secondary">No completed bookings.</div>
          <ul v-else class="list-group list-group-flush">
            <li v-for="booking in completedBookings" :key="booking._id" class="list-group-item px-0 booking-row">
              <div class="d-flex align-items-start gap-3">
                <div
                  class="rounded-circle list-avatar d-flex align-items-center justify-content-center flex-shrink-0"
                  style="width: 40px; height: 40px"
                  aria-hidden="true"
                >
                  {{ expertName(booking).charAt(0).toUpperCase() }}
                </div>

                <div class="flex-grow-1">
                  <div class="d-flex align-items-start justify-content-between gap-2">
                    <RouterLink
                      class="fw-semibold text-decoration-none booking-link"
                      :to="{ name: 'expert', params: { id: expertId(booking) } }"
                    >
                      {{ expertName(booking) }}
                    </RouterLink>
                    <span class="badge text-bg-light border">
                      {{ formatDateTime(booking.startTime) }}
                    </span>
                  </div>
                  <div class="small text-body-secondary mb-2">
                    {{ formatDateTime(booking.startTime) }} to {{ formatDateTime(booking.endTime) }}
                  </div>

                  <div v-if="booking.review" class="review-box mb-2">
                    <div class="small fw-semibold" :title="`${booking.review.rating} / 5`">
                      {{ starsLabel(booking.review.rating) }}
                    </div>
                    <div v-if="booking.review.text" class="small text-body-secondary mt-1">
                      {{ booking.review.text }}
                    </div>
                  </div>

                  <div class="review-form pt-2">
                    <div class="small fw-semibold mb-2">
                      {{ booking.review ? 'Update your review' : 'Rate this session' }}
                    </div>
                    <div class="row g-2 align-items-end">
                      <div class="col-12 col-md-3">
                        <label class="form-label small fw-semibold">Rating</label>
                        <div class="rating-stars" role="radiogroup" aria-label="Choose rating">
                          <button
                            v-for="n in 5"
                            :key="n"
                            type="button"
                            class="rating-star-btn"
                            :class="{ active: n <= reviewDraft[booking._id].rating }"
                            :aria-label="`${n} star${n === 1 ? '' : 's'}`"
                            :aria-pressed="n === reviewDraft[booking._id].rating"
                            @click="reviewDraft[booking._id].rating = n"
                          >
                            <i class="bi bi-star-fill" aria-hidden="true" />
                          </button>
                        </div>
                        <div class="form-text mt-1">{{ reviewDraft[booking._id].rating }} / 5</div>
                      </div>
                      <div class="col-12 col-md-9">
                        <label class="form-label small fw-semibold">Comment (optional)</label>
                        <textarea
                          v-model="reviewDraft[booking._id].text"
                          class="form-control"
                          rows="2"
                        />
                      </div>
                      <div class="col-12">
                        <button
                          type="button"
                          class="btn btn-sm btn-primary"
                          :disabled="reviewSavingId === booking._id"
                          @click="saveReview(booking._id)"
                        >
                          {{
                            reviewSavingId === booking._id
                              ? 'Saving…'
                              : booking.review
                                ? 'Update review'
                                : 'Submit review'
                          }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.modern-page {
  display: grid;
  gap: 0.35rem;
}

.hero-panel {
  border: 1px solid rgba(120, 130, 160, 0.18);
  background: linear-gradient(145deg, rgba(248, 250, 255, 0.95), rgba(245, 248, 255, 0.8));
  border-radius: 16px;
  padding: 0.95rem;
}

.profile-avatar,
.list-avatar {
  font-weight: 600;
  border: 1px solid rgba(120, 130, 160, 0.3);
  background: linear-gradient(160deg, rgba(13, 110, 253, 0.08), rgba(13, 110, 253, 0.18));
  color: rgba(20, 45, 85, 0.9);
}

.list-avatar {
  font-size: 0.95rem;
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

.modern-panel {
  border-radius: 14px;
  border: 1px solid rgba(120, 130, 160, 0.25);
  background: rgba(255, 255, 255, 0.98);
}

.booking-row {
  border-bottom-color: rgba(120, 130, 160, 0.18);
}

.booking-link {
  background-color: transparent;
}

.booking-link:hover {
  background-color: transparent;
}

.review-box {
  border: 1px solid rgba(120, 130, 160, 0.2);
  border-radius: 10px;
  padding: 0.6rem;
  background: rgba(247, 249, 253, 0.85);
}

.review-form {
  border-top: 1px solid rgba(120, 130, 160, 0.2);
}

.booking-section-title {
  margin-bottom: 0.65rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--bs-body-color);
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-star-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(120, 130, 160, 0.25);
  border-radius: 999px;
  background: #fff;
  color: rgba(120, 130, 160, 0.75);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.rating-star-btn.active {
  border-color: rgba(255, 168, 0, 0.5);
  color: rgba(255, 168, 0, 1);
  background: rgba(255, 168, 0, 0.08);
}
</style>
