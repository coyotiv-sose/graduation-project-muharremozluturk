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
  <section>
    <RouterLink class="btn btn-sm btn-outline-secondary mb-3" :to="{ name: 'home' }">
      <i class="bi bi-arrow-left me-1" aria-hidden="true" />
      Back to experts
    </RouterLink>

    <div v-if="loading" class="alert alert-secondary mb-0" role="status">Loading…</div>
    <div v-else-if="errorMessage" class="alert alert-danger mb-0" role="alert">{{ errorMessage }}</div>

    <div v-else-if="expert" class="d-grid gap-3">
      <section class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex align-items-start gap-3">
            <div
              class="rounded-circle bg-body-tertiary border d-flex align-items-center justify-content-center flex-shrink-0"
              style="width: 64px; height: 64px"
              aria-hidden="true"
            >
              <i class="bi bi-person-circle fs-2 text-body-secondary" />
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

      <section v-if="isViewingOwnExpertProfile" class="card shadow-sm">
        <div class="card-body">
          <h2 class="h5 mb-3">Edit your profile</h2>
          <div class="row g-2">
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Name</label>
              <input v-model="expertForm.name" type="text" class="form-control" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Phone</label>
              <input v-model="expertForm.phone" type="text" class="form-control" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Specialization</label>
              <input v-model="expertForm.specialization" type="text" class="form-control" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-semibold">Hourly rate (USD)</label>
              <input v-model="expertForm.hourlyRate" type="number" min="0" step="1" class="form-control" />
            </div>
            <div v-if="profileError" class="col-12">
              <div class="alert alert-danger mb-0" role="alert">{{ profileError }}</div>
            </div>
            <div class="col-12">
              <button type="button" class="btn btn-primary" :disabled="profileSaving" @click="saveExpertProfile">
                {{ profileSaving ? 'Saving…' : 'Save profile' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="card shadow-sm" aria-labelledby="appts-heading">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h2 id="appts-heading" class="h5 mb-0">Appointments</h2>
            <span v-if="reschedulingFromApptId" class="badge text-bg-info-subtle border text-info-emphasis">
              Rescheduling mode
            </span>
          </div>

          <p v-if="isViewingOwnExpertProfile" class="text-body-secondary mb-3">
            Add free slots for clients to book, or cancel your own appointments and unavailable slots.
          </p>
          <p v-else-if="user && user.role !== 'client'" class="text-body-secondary mb-3">
            Log in as a client to book available slots.
          </p>
          <p v-else-if="reschedulingFromApptId" class="text-body-secondary mb-3">
            Choose a free slot to move your appointment, or cancel rescheduling.
          </p>

          <div v-if="isViewingOwnExpertProfile" class="border rounded p-3 bg-body-tertiary mb-3">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
              <h3 class="h6 mb-0">Add a free slot</h3>
            </div>
            <div class="row g-2 align-items-end">
              <div class="col-12 col-md-5">
                <label class="form-label small fw-semibold">Start</label>
                <input v-model="newSlotStart" class="form-control" type="datetime-local" :disabled="creatingSlot" />
              </div>
              <div class="col-12 col-md-5">
                <label class="form-label small fw-semibold">End</label>
                <input v-model="newSlotEnd" class="form-control" type="datetime-local" :disabled="creatingSlot" />
              </div>
              <div class="col-12 col-md-2 d-grid">
                <button type="button" class="btn btn-primary" :disabled="creatingSlot" @click="createFreeSlot">
                  {{ creatingSlot ? 'Adding…' : 'Add slot' }}
                </button>
              </div>
            </div>
            <div v-if="createSlotError" class="alert alert-danger mt-2 mb-0" role="alert">{{ createSlotError }}</div>
          </div>

          <div v-if="actionError" class="alert alert-danger" role="alert">{{ actionError }}</div>
          <div v-if="!visibleAppointments.length" class="text-body-secondary">No appointments scheduled.</div>

          <ul v-else class="list-group list-group-flush">
            <li v-for="appt in visibleAppointments" :key="appt._id" class="list-group-item px-0">
              <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                <div>
                  <div class="fw-semibold">
                    {{ formatDateTime(appt.startTime) }}
                    <span class="text-body-secondary mx-1">→</span>
                    {{ formatDateTime(appt.endTime) }}
                  </div>
                  <div class="mt-1 d-flex gap-2 flex-wrap">
                    <span
                      class="badge border"
                      :class="{
                        'text-bg-success-subtle text-success-emphasis': appt.availability === 'free',
                        'text-bg-primary-subtle text-primary-emphasis': appt.availability === 'booked',
                        'text-bg-danger-subtle text-danger-emphasis': appt.availability === 'cancelled',
                        'text-bg-secondary-subtle text-secondary-emphasis': appt.availability === 'completed',
                      }"
                    >
                      {{ statusLabel(appt.availability) }}
                    </span>
                    <span
                      v-if="
                        clientOwnsAppointment(appt) &&
                        (appt.availability === 'booked' || appt.availability === 'completed')
                      "
                      class="badge text-bg-info-subtle border text-info-emphasis"
                    >
                      Your appointment
                    </span>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <button
                    v-if="user?.role === 'client' && appt.availability === 'free'"
                    type="button"
                    class="btn btn-sm btn-primary"
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
                    class="btn btn-sm btn-outline-primary"
                    :disabled="cancellingApptId === appt._id || bookingApptId != null || reschedulingToApptId != null"
                    @click="startReschedule(appt)"
                  >
                    Reschedule
                  </button>

                  <button
                    v-if="isReschedulingFrom(appt)"
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    :disabled="reschedulingToApptId != null"
                    @click="cancelReschedule"
                  >
                    Cancel reschedule
                  </button>

                  <button
                    v-if="isClientsOwnBookedAppointment(appt)"
                    type="button"
                    class="btn btn-sm btn-outline-danger"
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
                    class="btn btn-sm btn-outline-danger"
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
                    class="btn btn-sm btn-outline-primary"
                    :to="{ name: 'login', query: { role: 'client' } }"
                  >
                    Log in to book
                  </RouterLink>
                </div>
              </div>

              <div
                v-if="isViewingOwnExpertProfile && appt.availability !== 'cancelled'"
                class="mt-2 border-top pt-2"
              >
                <div class="small fw-semibold text-body-secondary mb-1">
                  Private notes (only you see this)
                </div>
                <textarea
                  v-model="notesDraft[appt._id]"
                  class="form-control"
                  rows="2"
                  :disabled="notesSavingId === appt._id"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary mt-2"
                  :disabled="notesSavingId === appt._id"
                  @click="saveAppointmentNotes(appt)"
                >
                  {{ notesSavingId === appt._id ? 'Saving…' : 'Save notes' }}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* Bootstrap handles layout */
</style>
