<script>
import http from '@/api/http'

export default {
  name: 'SignUpView',
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        password: '',
      },
      submitting: false,
      errorMessage: '',
      isSuccess: false,
      createdEmail: '',
    }
  },
  methods: {
    normalizePhone(value) {
      return String(value || '').replace(/\s+/g, '')
    },
    async onSubmit() {
      this.submitting = true
      this.errorMessage = ''
      try {
        const normalizedPhone = this.normalizePhone(this.form.phone)
        if (!/^\d+$/.test(normalizedPhone) || normalizedPhone.length < 10 || normalizedPhone.length > 15) {
          throw new Error('Please enter a valid phone number (10 to 15 digits, numbers only).')
        }
        const payload = {
          name: this.form.name.trim(),
          email: this.form.email.trim().toLowerCase(),
          phone: normalizedPhone,
          password: this.form.password,
        }
        await http.post('/clients', payload)
        this.isSuccess = true
        this.createdEmail = payload.email
      } catch (e) {
        const d = e.response?.data
        this.errorMessage =
          (typeof d === 'string' ? d : d?.error) || e.message || 'Could not create your account'
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<template>
  <section class="signup-shell d-flex justify-content-center py-4">
    <div class="card modern-signup-card w-100" style="max-width: 520px">
      <div class="card-body p-4 p-md-4">
        <template v-if="!isSuccess">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div
              class="signup-avatar rounded-circle d-inline-flex align-items-center justify-content-center"
              style="width: 56px; height: 56px"
              aria-hidden="true"
            >
              <i class="bi bi-person-plus fs-4" />
            </div>
            <div>
              <h1 class="h4 mb-1">Create your client account</h1>
              <p class="text-body-secondary mb-0">Sign up to book sessions and manage your appointments.</p>
            </div>
          </div>

          <form class="d-grid gap-3" @submit.prevent="onSubmit">
            <div>
              <label class="form-label small fw-semibold">Full name</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                name="name"
                autocomplete="name"
                required
              />
            </div>

            <div>
              <label class="form-label small fw-semibold">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                name="email"
                autocomplete="email"
                inputmode="email"
                required
              />
            </div>

            <div>
              <label class="form-label small fw-semibold">Phone</label>
              <input
                v-model="form.phone"
                type="tel"
                class="form-control"
                name="phone"
                autocomplete="tel"
                inputmode="numeric"
                pattern="[0-9 ]+"
                required
              />
              <div class="form-text">Use numbers only. Spaces are okay and will be removed.</div>
            </div>

            <div>
              <label class="form-label small fw-semibold">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="form-control"
                name="password"
                autocomplete="new-password"
                minlength="8"
                required
              />
              <div class="form-text">Use at least 8 characters.</div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger mb-0" role="alert">
              <i class="bi bi-exclamation-triangle me-1" aria-hidden="true" />
              {{ errorMessage }}
            </div>

            <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap pt-1">
              <RouterLink class="btn btn-outline-secondary" :to="{ name: 'login', query: { role: 'client' } }">
                Back to login
              </RouterLink>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                {{ submitting ? 'Creating account…' : 'Create account' }}
              </button>
            </div>
          </form>
        </template>

        <template v-else>
          <div class="success-panel">
            <div
              class="success-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style="width: 60px; height: 60px"
              aria-hidden="true"
            >
              <i class="bi bi-check2 fs-3" />
            </div>
            <h2 class="h4 mb-2">Account created successfully</h2>
            <p class="text-body-secondary mb-3">
              Your client account for <span class="fw-semibold">{{ createdEmail }}</span> is ready.
              You can now sign in and start booking experts.
            </p>
            <RouterLink class="btn btn-primary" :to="{ name: 'login', query: { role: 'client' } }">
              Go to client login
            </RouterLink>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.signup-shell {
  padding-inline: 0.35rem;
}

.modern-signup-card {
  border-radius: 16px;
  border: 1px solid rgba(120, 130, 160, 0.25);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
}

.signup-avatar,
.success-icon {
  border: 1px solid rgba(120, 130, 160, 0.3);
  background: linear-gradient(160deg, rgba(13, 110, 253, 0.08), rgba(13, 110, 253, 0.18));
  color: rgba(20, 45, 85, 0.9);
}

.success-panel {
  text-align: center;
  padding: 0.8rem 0.4rem;
}
</style>
