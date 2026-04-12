<script>
import http from '@/api/http'
import { useAccountStore } from '@/stores/account'
import { mapState } from 'pinia'

export default {
  name: 'ExpertView',
  data() {
    return {
      expert: null,
      appointments: [],
      loading: true,
      errorMessage: '',
      bookingApptId: null,
      cancellingApptId: null,
      reschedulingFromApptId: null,
      reschedulingToApptId: null,
      actionError: '',
      newSlotStart: '',
      newSlotEnd: '',
      creatingSlot: false,
      createSlotError: '',
      expertForm: {
        name: '',
        phone: '',
        specialization: '',
        hourlyRate: '',
      },
      profileSaving: false,
      profileError: '',
      notesDraft: {},
      notesSavingId: null,
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
  computed: {
    ...mapState(useAccountStore, ['user']),
    isViewingOwnExpertProfile() {
      if (!this.user || this.user.role !== 'expert') return false
      return String(this.user._id ?? '') === String(this.$route.params.id ?? '')
    },
    /** Clients do not see slots that are over or free slots that already started. */
    visibleAppointments() {
      if (!this.user || this.user.role !== 'client') {
        return this.appointments
      }
      return this.appointments.filter((a) => !this.isSlotHiddenFromClient(a))
    },
  },
  methods: {
    expertIdFromAppointment(appointment) {
      const e = appointment?.expert
      if (e == null) return ''
      if (typeof e === 'object') return String(e._id ?? e)
      return String(e)
    },
    clientIdFromAppointment(appointment) {
      const c = appointment?.client
      if (c == null) return ''
      if (typeof c === 'object') return String(c._id ?? c)
      return String(c)
    },
    clientOwnsAppointment(appt) {
      if (!this.user || this.user.role !== 'client') return false
      const sessionId = String(this.user._id ?? '')
      return sessionId !== '' && this.clientIdFromAppointment(appt) === sessionId
    },
    /** Active booking only (not completed past sessions). */
    isClientsOwnBookedAppointment(appt) {
      return appt?.availability === 'booked' && this.clientOwnsAppointment(appt)
    },
    canExpertCancelAppointment(appt) {
      return (
        this.isViewingOwnExpertProfile &&
        appt?.availability !== 'cancelled' &&
        appt?.availability !== 'completed'
      )
    },
    isSlotHiddenFromClient(appt) {
      const start = new Date(appt?.startTime)
      const end = new Date(appt?.endTime)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true
      const now = Date.now()
      if (end.getTime() <= now) {
        if (appt.availability === 'completed' && this.clientOwnsAppointment(appt)) return false
        return true
      }
      if (appt.availability === 'free' && start.getTime() < now) return true
      return false
    },
    filterExpertAppointments(list, expertIdStr) {
      return list
        .filter((a) => this.expertIdFromAppointment(a) === expertIdStr)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    },
    async refreshAppointments() {
      const id = this.$route.params.id
      if (!this.expert) return
      try {
        const { data: allAppointments } = await http.get('/appointments')
        const list = Array.isArray(allAppointments) ? allAppointments : []
        this.appointments = this.filterExpertAppointments(list, String(id))
        this.syncNotesDraftFromAppointments()
      } catch {
        /* keep existing list */
      }
    },
    syncNotesDraftFromAppointments() {
      const next = { ...this.notesDraft }
      for (const a of this.appointments) {
        next[a._id] = a.expertNotes != null && a.expertNotes !== '' ? a.expertNotes : (next[a._id] ?? '')
      }
      this.notesDraft = next
    },
    async saveExpertProfile() {
      if (!this.isViewingOwnExpertProfile) return
      this.profileError = ''
      this.profileSaving = true
      try {
        const id = this.$route.params.id
        await http.patch(`/experts/${id}`, {
          name: this.expertForm.name,
          phone: this.expertForm.phone,
          specialization: this.expertForm.specialization,
          hourlyRate: this.expertForm.hourlyRate === '' ? undefined : Number(this.expertForm.hourlyRate),
        })
        await this.loadExpert()
        const store = useAccountStore()
        await store.fetchUser('expert')
      } catch (e) {
        this.profileError = this.parseActionError(e, 'Could not save profile')
      } finally {
        this.profileSaving = false
      }
    },
    async saveAppointmentNotes(appt) {
      if (!this.isViewingOwnExpertProfile || appt.availability === 'cancelled') return
      this.actionError = ''
      this.notesSavingId = appt._id
      try {
        await http.put(`/appointments/${appt._id}/notes`, {
          notes: this.notesDraft[appt._id] ?? '',
        })
        await this.refreshAppointments()
      } catch (e) {
        this.actionError = this.parseActionError(e, 'Could not save notes')
      } finally {
        this.notesSavingId = null
      }
    },
    async loadExpert() {
      const id = this.$route.params.id
      this.loading = true
      this.errorMessage = ''
      this.actionError = ''
      this.reschedulingFromApptId = null
      this.reschedulingToApptId = null
      this.newSlotStart = ''
      this.newSlotEnd = ''
      this.createSlotError = ''
      this.expert = null
      this.appointments = []
      try {
        const { data } = await http.get(`/experts/${id}`)
        this.expert = data
        this.expertForm = {
          name: data.name || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          hourlyRate: data.hourlyRate ?? '',
        }
        try {
          const { data: allAppointments } = await http.get('/appointments')
          const list = Array.isArray(allAppointments) ? allAppointments : []
          this.appointments = this.filterExpertAppointments(list, String(id))
          this.syncNotesDraftFromAppointments()
        } catch {
          this.appointments = []
        }
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
    parseActionError(e, fallback) {
      const d = e.response?.data
      return (typeof d === 'string' ? d : d?.error) || e.message || fallback
    },
    isReschedulingFrom(appt) {
      return this.reschedulingFromApptId === appt?._id
    },
    canRescheduleTo(appt) {
      return (
        this.user?.role === 'client' &&
        this.reschedulingFromApptId != null &&
        appt?.availability === 'free' &&
        appt?._id !== this.reschedulingFromApptId
      )
    },
    startReschedule(appt) {
      if (!this.isClientsOwnBookedAppointment(appt)) return
      this.actionError = ''
      this.reschedulingFromApptId = appt._id
    },
    cancelReschedule() {
      this.reschedulingFromApptId = null
      this.reschedulingToApptId = null
    },
    async bookSlot(appt) {
      if (
        !this.user ||
        this.user.role !== 'client' ||
        appt.availability !== 'free' ||
        this.reschedulingFromApptId != null
      ) {
        return
      }
      this.actionError = ''
      this.bookingApptId = appt._id
      try {
        await http.post(`/appointments/${appt._id}/client`, {})
        await this.refreshAppointments()
      } catch (e) {
        this.actionError = this.parseActionError(e, 'Could not book this slot')
      } finally {
        this.bookingApptId = null
      }
    },
    async rescheduleToSlot(appt) {
      if (!this.canRescheduleTo(appt)) return
      this.actionError = ''
      this.reschedulingToApptId = appt._id
      try {
        await http.put(`/appointments/${this.reschedulingFromApptId}`, {
          expert: this.$route.params.id,
          newAppointmentId: appt._id,
        })
        await this.refreshAppointments()
        this.cancelReschedule()
      } catch (e) {
        this.actionError = this.parseActionError(e, 'Could not reschedule this booking')
      } finally {
        this.reschedulingToApptId = null
      }
    },
    async cancelSlot(appt) {
      if (!this.isClientsOwnBookedAppointment(appt)) return
      this.actionError = ''
      this.cancellingApptId = appt._id
      try {
        await http.delete(`/appointments/${appt._id}/client`)
        await this.refreshAppointments()
        if (this.isReschedulingFrom(appt)) {
          this.cancelReschedule()
        }
      } catch (e) {
        this.actionError = this.parseActionError(e, 'Could not cancel this booking')
      } finally {
        this.cancellingApptId = null
      }
    },
    async createFreeSlot() {
      if (!this.isViewingOwnExpertProfile) return
      this.actionError = ''
      this.createSlotError = ''
      const start = this.newSlotStart ? new Date(this.newSlotStart) : null
      const end = this.newSlotEnd ? new Date(this.newSlotEnd) : null
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        this.createSlotError = 'Choose a start and end date and time.'
        return
      }
      if (end <= start) {
        this.createSlotError = 'End time must be after start time.'
        return
      }
      const now = Date.now()
      if (start.getTime() < now) {
        this.createSlotError = 'Start time cannot be in the past.'
        return
      }
      this.creatingSlot = true
      try {
        await http.post('/appointments', {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        })
        this.newSlotStart = ''
        this.newSlotEnd = ''
        await this.refreshAppointments()
      } catch (e) {
        this.createSlotError = this.parseActionError(e, 'Could not create this slot')
      } finally {
        this.creatingSlot = false
      }
    },
    async cancelAppointment(appt) {
      if (!this.canExpertCancelAppointment(appt)) return
      this.actionError = ''
      this.cancellingApptId = appt._id
      try {
        await http.delete(`/appointments/${appt._id}`, {
          data: { expert: this.$route.params.id },
        })
        await this.refreshAppointments()
        if (this.isReschedulingFrom(appt)) {
          this.cancelReschedule()
        }
      } catch (e) {
        this.actionError = this.parseActionError(e, 'Could not cancel this appointment')
      } finally {
        this.cancellingApptId = null
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
    formatDateTime(iso) {
      if (iso == null || iso === '') return '—'
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return '—'
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d)
    },
    statusLabel(availability) {
      if (availability == null || availability === '') return '—'
      const s = String(availability)
      return s.charAt(0).toUpperCase() + s.slice(1)
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
        <div class="row">
          <dt>Client reviews</dt>
          <dd v-if="expert.reviewCount > 0">
            {{ expert.averageRating }} / 5 · {{ expert.reviewCount }}
            {{ expert.reviewCount === 1 ? 'review' : 'reviews' }}
          </dd>
          <dd v-else class="muted-inline">No reviews yet</dd>
        </div>
      </dl>

      <section
        v-if="isViewingOwnExpertProfile"
        class="expert-profile-edit"
        aria-labelledby="expert-profile-edit-heading"
      >
        <h3 id="expert-profile-edit-heading" class="expert-profile-edit-title">Edit your profile</h3>
        <div class="expert-profile-edit-grid">
          <label class="expert-field">
            <span>Name</span>
            <input v-model="expertForm.name" type="text" class="expert-input" />
          </label>
          <label class="expert-field">
            <span>Phone</span>
            <input v-model="expertForm.phone" type="text" class="expert-input" />
          </label>
          <label class="expert-field">
            <span>Specialization</span>
            <input v-model="expertForm.specialization" type="text" class="expert-input" />
          </label>
          <label class="expert-field">
            <span>Hourly rate (USD)</span>
            <input v-model="expertForm.hourlyRate" type="number" min="0" step="1" class="expert-input" />
          </label>
        </div>
        <p v-if="profileError" class="error expert-profile-err" role="alert">{{ profileError }}</p>
        <button
          type="button"
          class="book-btn"
          :disabled="profileSaving"
          @click="saveExpertProfile"
        >
          {{ profileSaving ? 'Saving…' : 'Save profile' }}
        </button>
      </section>

      <section class="appts" aria-labelledby="appts-heading">
        <h2 id="appts-heading" class="appts-title">Appointments</h2>
        <p v-if="isViewingOwnExpertProfile" class="muted appts-hint">
          Add free slots for clients to book, or cancel your own appointments and unavailable slots.
        </p>
        <div v-if="isViewingOwnExpertProfile" class="create-slot" aria-labelledby="create-slot-heading">
          <h3 id="create-slot-heading" class="create-slot-title">Add a free slot</h3>
          <div class="create-slot-row">
            <label class="create-slot-label">
              <span class="create-slot-label-text">Start</span>
              <input
                v-model="newSlotStart"
                class="create-slot-input"
                type="datetime-local"
                :disabled="creatingSlot"
              />
            </label>
            <label class="create-slot-label">
              <span class="create-slot-label-text">End</span>
              <input
                v-model="newSlotEnd"
                class="create-slot-input"
                type="datetime-local"
                :disabled="creatingSlot"
              />
            </label>
            <button
              type="button"
              class="book-btn create-slot-btn"
              :disabled="creatingSlot"
              @click="createFreeSlot"
            >
              {{ creatingSlot ? 'Adding…' : 'Add slot' }}
            </button>
          </div>
          <p v-if="createSlotError" class="error create-slot-err" role="alert">{{ createSlotError }}</p>
        </div>
        <p v-else-if="user && user.role !== 'client'" class="muted appts-hint">
          Log in as a client to book available slots.
        </p>
        <p v-else-if="reschedulingFromApptId" class="muted appts-hint">
          Choose a free slot to move your appointment, or cancel rescheduling.
        </p>
        <p v-if="actionError" class="error appts-book-err" role="alert">{{ actionError }}</p>
        <p v-if="!visibleAppointments.length" class="muted appts-empty">No appointments scheduled.</p>
        <ul v-else class="appts-list">
          <li v-for="appt in visibleAppointments" :key="appt._id" class="appts-block">
            <div class="appts-item">
            <div class="appts-times">
              <span>{{ formatDateTime(appt.startTime) }}</span>
              <span class="appts-sep">→</span>
              <span>{{ formatDateTime(appt.endTime) }}</span>
            </div>
            <div class="appts-right">
              <div class="appts-tags">
                <span class="appts-status" :class="`appts-status--${String(appt.availability || '')}`">
                  {{ statusLabel(appt.availability) }}
                </span>
                <span
                  v-if="
                    clientOwnsAppointment(appt) &&
                    (appt.availability === 'booked' || appt.availability === 'completed')
                  "
                  class="appts-yours"
                >
                  Your appointment
                </span>
              </div>
              <button
                v-if="user?.role === 'client' && appt.availability === 'free'"
                type="button"
                class="book-btn"
                :disabled="
                  bookingApptId === appt._id ||
                  cancellingApptId === appt._id ||
                  reschedulingToApptId === appt._id ||
                  (reschedulingFromApptId != null && !canRescheduleTo(appt))
                "
                @click="canRescheduleTo(appt) ? rescheduleToSlot(appt) : bookSlot(appt)"
              >
                {{
                  canRescheduleTo(appt)
                    ? reschedulingToApptId === appt._id
                      ? 'Rescheduling…'
                      : 'Move here'
                    : bookingApptId === appt._id
                      ? 'Booking…'
                      : 'Book'
                }}
              </button>
              <button
                v-if="isClientsOwnBookedAppointment(appt) && !isReschedulingFrom(appt)"
                type="button"
                class="reschedule-btn"
                :disabled="
                  cancellingApptId === appt._id ||
                  bookingApptId != null ||
                  reschedulingToApptId != null
                "
                @click="startReschedule(appt)"
              >
                Reschedule
              </button>
              <button
                v-if="isReschedulingFrom(appt)"
                type="button"
                class="reschedule-btn reschedule-btn--secondary"
                :disabled="reschedulingToApptId != null"
                @click="cancelReschedule"
              >
                Cancel reschedule
              </button>
              <button
                v-if="isClientsOwnBookedAppointment(appt)"
                type="button"
                class="cancel-btn"
                :disabled="
                  cancellingApptId === appt._id ||
                  bookingApptId === appt._id ||
                  reschedulingToApptId != null
                "
                @click="cancelSlot(appt)"
              >
                {{ cancellingApptId === appt._id ? 'Cancelling…' : 'Cancel booking' }}
              </button>
              <button
                v-else-if="canExpertCancelAppointment(appt)"
                type="button"
                class="cancel-btn"
                :disabled="
                  cancellingApptId === appt._id ||
                  bookingApptId === appt._id ||
                  reschedulingToApptId != null
                "
                @click="cancelAppointment(appt)"
              >
                {{ cancellingApptId === appt._id ? 'Cancelling…' : 'Cancel appointment' }}
              </button>
              <RouterLink
                v-else-if="!user && appt.availability === 'free'"
                class="book-login"
                :to="{ name: 'login', query: { role: 'client' } }"
              >
                Log in to book
              </RouterLink>
            </div>
            </div>
            <div
              v-if="isViewingOwnExpertProfile && appt.availability !== 'cancelled'"
              class="appts-notes-panel"
            >
              <p class="appts-notes-label">Private notes (only you see this)</p>
              <textarea
                v-model="notesDraft[appt._id]"
                class="appts-notes-input"
                rows="2"
                :disabled="notesSavingId === appt._id"
              />
              <button
                type="button"
                class="cancel-btn appts-notes-save"
                :disabled="notesSavingId === appt._id"
                @click="saveAppointmentNotes(appt)"
              >
                {{ notesSavingId === appt._id ? 'Saving…' : 'Save notes' }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </article>
  </main>
</template>

<style scoped>
.expert-page {
  max-width: 560px;
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

.muted-inline {
  opacity: 0.75;
  margin: 0;
}

.expert-profile-edit {
  margin: 1.25rem 0 0;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}

.expert-profile-edit-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.65rem;
}

.expert-profile-edit-grid {
  display: grid;
  gap: 0.65rem;
  margin-bottom: 0.65rem;
}

.expert-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-heading);
}

.expert-input {
  font: inherit;
  font-size: 0.9rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
}

.expert-profile-err {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
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

.appts {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.appts-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.75rem;
}

.create-slot {
  margin: 0 0 1.25rem;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
}

.create-slot-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.65rem;
}

.create-slot-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.65rem 1rem;
}

.create-slot-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-heading);
}

.create-slot-label-text {
  font-weight: 600;
  opacity: 0.85;
}

.create-slot-input {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  min-width: 11rem;
}

.create-slot-btn {
  align-self: flex-end;
}

.create-slot-err {
  margin: 0.65rem 0 0;
  font-size: 0.875rem;
}

.appts-empty {
  margin: 0;
}

.appts-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.appts-block {
  border-bottom: 1px solid var(--color-border);
  padding: 0.65rem 0;
}

.appts-block:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.appts-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  font-size: 0.9rem;
}

.appts-notes-panel {
  margin-top: 0.65rem;
  padding: 0.65rem 0 0;
  border-top: 1px dashed var(--color-border);
}

.appts-notes-label {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-heading);
  opacity: 0.85;
}

.appts-notes-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  margin-bottom: 0.4rem;
}

.appts-notes-save {
  font-size: 0.78rem;
}

.appts-times {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-text);
}

.appts-sep {
  opacity: 0.5;
}

.appts-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.appts-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.appts-hint {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
}

.appts-book-err {
  margin: 0 0 0.75rem;
}

.book-btn {
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: var(--vt-c-indigo);
  color: var(--vt-c-white);
  white-space: nowrap;
}

.book-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.book-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  background: var(--color-background);
  color: var(--color-heading);
  white-space: nowrap;
}

.cancel-btn:hover:not(:disabled) {
  background: var(--color-background-mute);
}

.cancel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reschedule-btn {
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: 1px solid hsla(210, 50%, 45%, 0.35);
  cursor: pointer;
  background: hsla(210, 60%, 45%, 0.08);
  color: hsl(210, 55%, 35%);
  white-space: nowrap;
}

.reschedule-btn:hover:not(:disabled) {
  background: hsla(210, 60%, 45%, 0.14);
}

.reschedule-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reschedule-btn--secondary {
  background: var(--color-background);
  color: var(--color-heading);
  border-color: var(--color-border);
}

.reschedule-btn--secondary:hover:not(:disabled) {
  background: var(--color-background-mute);
}

.book-login {
  font-size: 0.8rem;
  font-weight: 500;
  color: hsla(160, 100%, 28%, 1);
  text-decoration: none;
  white-space: nowrap;
}

.book-login:hover {
  text-decoration: underline;
}

.appts-yours {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: hsla(210, 60%, 45%, 0.12);
  color: hsl(210, 55%, 35%);
  border: 1px solid hsla(210, 50%, 45%, 0.35);
}

@media (prefers-color-scheme: dark) {
  .appts-yours {
    background: hsla(210, 45%, 55%, 0.2);
    color: hsl(210, 70%, 78%);
    border-color: hsla(210, 45%, 50%, 0.45);
  }
}

.appts-status {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: capitalize;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
}

.appts-status--free {
  color: hsl(145, 45%, 32%);
}

.appts-status--booked {
  color: hsl(210, 55%, 38%);
}

.appts-status--cancelled {
  color: hsl(0, 45%, 42%);
  text-decoration: line-through;
  text-decoration-color: currentColor;
}

.appts-status--completed {
  color: hsl(265, 35%, 42%);
  opacity: 0.95;
}

@media (prefers-color-scheme: dark) {
  .appts-status--completed {
    color: hsl(265, 45%, 72%);
  }
}
</style>
