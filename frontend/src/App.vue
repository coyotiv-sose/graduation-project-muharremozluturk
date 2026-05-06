<script>
import { RouterLink, RouterView } from 'vue-router'

import { useAccountStore } from './stores/account'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView,
  },
  async mounted() {
    await this.fetchUser()
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser', 'logout']),
    loginTabActiveClass(role) {
      if (this.$route.name !== 'login') {
        return {}
      }
      const q = this.$route.query.role || 'client'
      return { 'login-tab--active': q === role }
    },
  },
  computed: {
    ...mapState(useAccountStore, ['user']),
  },
}
</script>

<template>
  <header class="border-bottom bg-body">
    <nav class="navbar navbar-expand-lg">
      <div class="container">
        <RouterLink class="navbar-brand fw-semibold" :to="{ name: 'home' }">
          Expert Booking
        </RouterLink>

        <div class="d-flex align-items-center gap-2 ms-auto">
          <RouterLink class="btn btn-outline-secondary btn-sm" :to="{ name: 'home' }">
            <i class="bi bi-house me-1" aria-hidden="true" />
            Home
          </RouterLink>

          <RouterLink
            v-if="user?.role === 'client'"
            class="btn btn-outline-secondary btn-sm"
            :to="{ name: 'profile' }"
          >
            <i class="bi bi-person-badge me-1" aria-hidden="true" />
            My profile
          </RouterLink>

          <div v-if="!user" class="btn-group" role="group" aria-label="Login as">
            <RouterLink
              class="btn btn-sm"
              :class="['btn-outline-primary', loginTabActiveClass('client')]"
              :to="{ name: 'login', query: { role: 'client' } }"
            >
              Client login
            </RouterLink>
            <RouterLink
              class="btn btn-sm"
              :class="['btn-outline-primary', loginTabActiveClass('expert')]"
              :to="{ name: 'login', query: { role: 'expert' } }"
            >
              Expert login
            </RouterLink>
          </div>

          <div v-else class="d-flex align-items-center gap-2">
            <span class="text-body-secondary small text-truncate" style="max-width: 220px">
              {{ user.email }}
            </span>
            <span class="badge text-bg-light text-capitalize border">
              {{ user.role }}
            </span>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="logout">
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <main class="container py-4">
    <RouterView />
  </main>
</template>

<style scoped>
/* keep empty (Bootstrap handles layout) */
</style>
