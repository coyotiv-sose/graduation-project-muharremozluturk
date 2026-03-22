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
  <main class="login-page">
    <div class="login-card">
      <h1 class="title">Sign in</h1>

      <div class="tabs" role="tablist" aria-label="Account type">
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: activeRole === 'client' }"
          :aria-selected="activeRole === 'client'"
          @click="setRole('client')"
        >
          Client
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          :class="{ active: activeRole === 'expert' }"
          :aria-selected="activeRole === 'expert'"
          @click="setRole('expert')"
        >
          Expert
        </button>
      </div>

      <p class="hint">
        {{ hintText }}
      </p>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span class="label">Email</span>
          <input v-model="email" type="email" name="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span class="label">Password</span>
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="errorMessage" class="error" role="alert">
          {{ errorMessage }}
        </p>

        <button type="submit" class="submit" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem 3rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 1.25rem;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  padding: 0.65rem 1rem;
  font: inherit;
  font-size: 0.95rem;
  border: none;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.tab + .tab {
  border-left: 1px solid var(--color-border);
}

.tab:hover {
  background: var(--color-background-mute);
}

.tab.active {
  background: var(--vt-c-indigo);
  color: var(--vt-c-white);
}

@media (prefers-color-scheme: dark) {
  .tab.active {
    background: var(--vt-c-indigo);
    color: var(--vt-c-white);
  }
}

.hint {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.85;
  margin-bottom: 1.25rem;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-heading);
}

.field input {
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
}

.field input:focus {
  outline: 2px solid var(--vt-c-indigo);
  outline-offset: 1px;
}

.error {
  font-size: 0.875rem;
  color: #c0392b;
}

@media (prefers-color-scheme: dark) {
  .error {
    color: #ff6b6b;
  }
}

.submit {
  margin-top: 0.25rem;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  background: var(--vt-c-indigo);
  color: var(--vt-c-white);
  cursor: pointer;
}

.submit:hover:not(:disabled) {
  filter: brightness(1.08);
}

.submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
