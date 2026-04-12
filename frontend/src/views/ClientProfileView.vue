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
  <main class="profile-page">
    <h1 class="title">My Profile</h1>

    <p v-if="!user" class="muted">
      Log in as a client to view your profile.
    </p>
    <p v-else-if="user.role !== 'client'" class="muted">
      This page is only available for client accounts.
    </p>
    <p v-else-if="loading" class="muted">Loading…</p>
    <p v-else-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
    <div v-else class="sections">
      <section class="section">
        <div class="section-head">
          <h2 class="section-title">Profile</h2>
          <button
            v-if="!editingProfile"
            type="button"
            class="linkish"
            @click="editingProfile = true"
          >
            Edit
          </button>
        </div>

        <template v-if="!editingProfile">
          <dl v-if="profile" class="fields">
            <div class="row">
              <dt>Name</dt>
              <dd>{{ profile.name || '—' }}</dd>
            </div>
            <div class="row">
              <dt>Email</dt>
              <dd>{{ profile.email || '—' }}</dd>
            </div>
            <div class="row">
              <dt>Phone</dt>
              <dd>{{ profile.phone || '—' }}</dd>
            </div>
          </dl>
        </template>
        <div v-else class="profile-edit">
          <label class="field-label">
            <span>Name</span>
            <input v-model="profileForm.name" class="field-input" type="text" />
          </label>
          <label class="field-label">
            <span>Phone</span>
            <input v-model="profileForm.phone" class="field-input" type="text" />
          </label>
          <p v-if="profileFormError" class="error" role="alert">{{ profileFormError }}</p>
          <div class="profile-edit-actions">
            <button
              type="button"
              class="btn-primary"
              :disabled="profileSaving"
              @click="saveProfile"
            >
              {{ profileSaving ? 'Saving…' : 'Save' }}
            </button>
            <button
              type="button"
              class="btn-secondary"
              :disabled="profileSaving"
              @click="editingProfile = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">My Bookings</h2>
        <h3 class="subsection-title">Upcoming</h3>
        <p v-if="!upcomingBookings.length" class="muted">No upcoming bookings.</p>
        <ul v-else class="list">
          <li v-for="booking in upcomingBookings" :key="booking._id" class="item">
            <div class="info">
              <RouterLink
                class="expert-link"
                :to="{ name: 'expert', params: { id: expertId(booking) } }"
              >
                {{ expertName(booking) }}
              </RouterLink>
              <p class="time">
                {{ formatDateTime(booking.startTime) }} to {{ formatDateTime(booking.endTime) }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section class="section">
        <h3 class="subsection-title">Completed</h3>
        <p v-if="reviewError" class="error" role="alert">{{ reviewError }}</p>
        <p v-if="!completedBookings.length" class="muted">No completed bookings.</p>
        <ul v-else class="list">
          <li v-for="booking in completedBookings" :key="booking._id" class="item item--completed">
            <div class="info">
              <RouterLink
                class="expert-link"
                :to="{ name: 'expert', params: { id: expertId(booking) } }"
              >
                {{ expertName(booking) }}
              </RouterLink>
              <p class="time">
                {{ formatDateTime(booking.startTime) }} to {{ formatDateTime(booking.endTime) }}
              </p>
              <div v-if="booking.review" class="review-display">
                <p class="review-stars" :title="`${booking.review.rating} / 5`">
                  {{ starsLabel(booking.review.rating) }}
                </p>
                <p v-if="booking.review.text" class="review-text">{{ booking.review.text }}</p>
              </div>
              <div class="review-edit">
                <p class="review-label">{{ booking.review ? 'Update your review' : 'Rate this session' }}</p>
                <div class="review-row">
                  <label class="review-field">
                    <span>Rating</span>
                    <select
                      v-model.number="reviewDraft[booking._id].rating"
                      class="field-input field-input--narrow"
                    >
                      <option v-for="n in 5" :key="n" :value="n">{{ n }} — {{ starsLabel(n) }}</option>
                    </select>
                  </label>
                  <label class="review-field review-field--grow">
                    <span>Comment (optional)</span>
                    <textarea
                      v-model="reviewDraft[booking._id].text"
                      class="field-input field-textarea"
                      rows="2"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  class="btn-primary btn-small"
                  :disabled="reviewSavingId === booking._id"
                  @click="saveReview(booking._id)"
                >
                  {{ reviewSavingId === booking._id ? 'Saving…' : booking.review ? 'Update review' : 'Submit review' }}
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 0 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 1.25rem;
}

.sections {
  display: grid;
  gap: 1.25rem;
}

.section {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
  padding: 1rem 1.25rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-heading);
}

.linkish {
  font: inherit;
  font-size: 0.85rem;
  background: none;
  border: none;
  color: hsla(160, 100%, 28%, 1);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.subsection-title {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: var(--color-heading);
}

.fields {
  margin: 0;
}

.row {
  display: grid;
  grid-template-columns: 6rem 1fr;
  gap: 0.5rem 1rem;
  padding: 0.55rem 0;
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
}

.profile-edit {
  display: grid;
  gap: 0.75rem;
}

.field-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-heading);
}

.field-input {
  font: inherit;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
}

.field-input--narrow {
  max-width: 12rem;
}

.field-textarea {
  resize: vertical;
  min-height: 3rem;
}

.profile-edit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-primary {
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: var(--vt-c-indigo);
  color: var(--vt-c-white);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.08);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  background: var(--color-background-soft);
  color: var(--color-heading);
}

.btn-small {
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
  width: fit-content;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item:first-child {
  padding-top: 0;
}

.item--completed .info {
  gap: 0.5rem;
}

.info {
  display: grid;
  gap: 0.25rem;
}

.expert-link {
  width: fit-content;
  font-weight: 600;
  color: var(--color-heading);
  text-decoration: none;
}

.expert-link:hover {
  text-decoration: underline;
}

.time {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.review-display {
  margin-top: 0.35rem;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
}

.review-stars {
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  color: hsl(45, 90%, 38%);
}

.review-text {
  margin: 0.35rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text);
  white-space: pre-wrap;
}

.review-edit {
  margin-top: 0.65rem;
  padding-top: 0.65rem;
  border-top: 1px dashed var(--color-border);
}

.review-label {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-heading);
}

.review-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
}

.review-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.75rem;
  color: var(--color-heading);
}

.review-field--grow {
  flex: 1;
  min-width: 10rem;
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

  .review-stars {
    color: hsl(45, 85%, 62%);
  }
}

@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
