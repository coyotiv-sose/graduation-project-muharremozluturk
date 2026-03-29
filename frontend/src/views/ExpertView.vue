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
    isClientsOwnBookedAppointment(appt) {
      if (!this.user || this.user.role !== 'client') return false
      if (appt.availability !== 'booked') return false
      const sessionId = String(this.user._id ?? '')
      return sessionId !== '' && this.clientIdFromAppointment(appt) === sessionId
    },
    async loadExpert() {
      const id = this.$route.params.id
      this.loading = true
      this.errorMessage = ''
      this.expert = null
      this.appointments = []
      try {
        const { data } = await http.get(`/experts/${id}`)
        this.expert = data
        try {
          const { data: allAppointments } = await http.get('/appointments')
          const list = Array.isArray(allAppointments) ? allAppointments : []
          const idStr = String(id)
          this.appointments = list
            .filter((a) => this.expertIdFromAppointment(a) === idStr)
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
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
      </dl>

      <section class="appts" aria-labelledby="appts-heading">
        <h2 id="appts-heading" class="appts-title">Appointments</h2>
        <p v-if="!appointments.length" class="muted appts-empty">No appointments scheduled.</p>
        <ul v-else class="appts-list">
          <li v-for="appt in appointments" :key="appt._id" class="appts-item">
            <div class="appts-times">
              <span>{{ formatDateTime(appt.startTime) }}</span>
              <span class="appts-sep">→</span>
              <span>{{ formatDateTime(appt.endTime) }}</span>
            </div>
            <div class="appts-tags">
              <span class="appts-status" :class="`appts-status--${String(appt.availability || '')}`">
                {{ statusLabel(appt.availability) }}
              </span>
              <span
                v-if="isClientsOwnBookedAppointment(appt)"
                class="appts-yours"
              >
                Your appointment
              </span>
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

.appts-empty {
  margin: 0;
}

.appts-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.appts-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
}

.appts-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
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

.appts-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
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
</style>
