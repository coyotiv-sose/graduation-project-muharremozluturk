<script>
import { useAccountStore } from '@/stores/account'
import { mapActions } from 'pinia'

export default {
  name: 'LoginView',
  data() {
    return {
      activeRole: 'client',
      email: '',
      password: '',
      errorMessage: '',
      submitting: false,
    }
  },
  computed: {
    hintText() {
      return this.activeRole === 'client'
        ? 'Log in with your client account.'
        : 'Log in with your expert account.'
    },
  },
  watch: {
    '$route.query.role': {
      immediate: true,
      handler() {
        this.syncRoleFromRoute()
      },
    },
  },
  methods: {
    ...mapActions(useAccountStore, ['login']),
    syncRoleFromRoute() {
      const r = this.$route.query.role
      if (r === 'client' || r === 'expert') {
        this.activeRole = r
      }
    },
    setRole(role) {
      this.activeRole = role
      this.$router.replace({ path: '/login', query: { role } })
    },
    async onSubmit() {
      this.errorMessage = ''
      this.submitting = true
      try {
        await this.login(this.email, this.password, this.activeRole)
        await this.$router.push({ name: 'home' })
      } catch (e) {
        const data = e.response?.data
        this.errorMessage =
          (typeof data === 'string' ? data : data?.error) || e.message || 'Login failed'
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<template>
  <section class="login-shell d-flex justify-content-center py-4">
    <div class="card modern-login-card w-100" style="max-width: 420px">
      <div class="card-body p-4">
        <div class="text-center mb-3">
          <div class="login-avatar rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style="width: 56px; height: 56px" aria-hidden="true">
            <i class="bi bi-shield-lock fs-4" />
          </div>
          <h1 class="h4 mb-1">Sign in</h1>
          <p class="text-body-secondary mb-0">{{ hintText }}</p>
        </div>

        <div class="btn-group w-100 mb-3 role-switch" role="tablist" aria-label="Account type">
          <button
            type="button"
            role="tab"
            class="btn btn-outline-primary"
            :class="{ active: activeRole === 'client' }"
            :aria-selected="activeRole === 'client'"
            @click="setRole('client')"
          >
            <i class="bi bi-person me-1" aria-hidden="true" />
            Client
          </button>
          <button
            type="button"
            role="tab"
            class="btn btn-outline-primary"
            :class="{ active: activeRole === 'expert' }"
            :aria-selected="activeRole === 'expert'"
            @click="setRole('expert')"
          >
            <i class="bi bi-person-workspace me-1" aria-hidden="true" />
            Expert
          </button>
        </div>

        <div v-if="activeRole === 'client'" class="signup-cta mb-3">
          <div class="small text-body-secondary">New here?</div>
          <RouterLink class="btn btn-sm btn-outline-primary" :to="{ name: 'signup' }">
            Create a client account
          </RouterLink>
        </div>

        <form @submit.prevent="onSubmit" class="d-grid gap-3">
          <div>
            <label class="form-label small fw-semibold">Email</label>
            <input
              v-model="email"
              class="form-control"
              type="email"
              name="email"
              autocomplete="email"
              required
            />
          </div>
          <div>
            <label class="form-label small fw-semibold">Password</label>
            <input
              v-model="password"
              class="form-control"
              type="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </div>

          <div v-if="errorMessage" class="alert alert-danger mb-0" role="alert">
            <i class="bi bi-exclamation-triangle me-1" aria-hidden="true" />
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {{ submitting ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-shell {
  padding-inline: 0.35rem;
}

.modern-login-card {
  border-radius: 16px;
  border: 1px solid rgba(120, 130, 160, 0.25);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
}

.login-avatar {
  border: 1px solid rgba(120, 130, 160, 0.3);
  background: linear-gradient(160deg, rgba(13, 110, 253, 0.08), rgba(13, 110, 253, 0.18));
  color: rgba(20, 45, 85, 0.9);
}

.role-switch .btn {
  border-radius: 10px !important;
}

.signup-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.65rem;
  border: 1px solid rgba(120, 130, 160, 0.2);
  border-radius: 12px;
  background: rgba(247, 249, 253, 0.8);
}
</style>
