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
      bookings: [],
    }
  },
  computed: {
    ...mapState(useAccountStore, ['user']),
    clientId() {
      return String(this.user?._id ?? '')
    },
    upcomingBookings() {
      const now = Date.now()
      return this.bookings.filter((booking) => new Date(booking.endTime).getTime() >= now)
    },
    completedBookings() {
      const now = Date.now()
      return this.bookings.filter((booking) => new Date(booking.endTime).getTime() < now)
    },
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
    isOwnBookedAppointment(booking) {
      if (booking?.availability !== 'booked') return false
      const client = booking?.client
      const clientId = typeof client === 'object' ? String(client?._id ?? '') : String(client ?? '')
      return this.clientId !== '' && clientId === this.clientId
    },
    async loadBookings() {
      if (!this.user) {
        this.loading = false
        this.errorMessage = ''
        this.profile = null
        this.bookings = []
        return
      }
      if (this.user.role !== 'client') {
        this.loading = false
        this.errorMessage = ''
        this.profile = null
        this.bookings = []
        return
      }

      this.loading = true
      this.errorMessage = ''
      try {
        const [{ data: profile }, { data: appointmentsData }] = await Promise.all([
          http.get(`/clients/${this.user._id}`),
          http.get('/appointments'),
        ])
        const appointments = Array.isArray(appointmentsData) ? appointmentsData : []
        this.profile = profile
        this.bookings = appointments
          .filter((appointment) => this.isOwnBookedAppointment(appointment))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      } catch (e) {
        const d = e.response?.data
        this.errorMessage =
          (typeof d === 'string' ? d : d?.error) || e.message || 'Could not load profile'
        this.profile = null
        this.bookings = []
      } finally {
        this.loading = false
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
        <h2 class="section-title">Profile</h2>
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
        <p v-if="!completedBookings.length" class="muted">No completed bookings.</p>
        <ul v-else class="list">
          <li v-for="booking in completedBookings" :key="booking._id" class="item">
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

.section-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: var(--color-heading);
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

@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
}
</style>
