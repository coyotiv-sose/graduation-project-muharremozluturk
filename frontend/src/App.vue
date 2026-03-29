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
  <header>
    <div class="wrapper">
      <nav class="main-nav">
        <RouterLink class="nav-home" :to="{ name: 'home' }">Home</RouterLink>
        <div v-if="!user" class="login-tabs" role="tablist" aria-label="Login as">
          <RouterLink
            class="login-tab"
            :class="loginTabActiveClass('client')"
            :to="{ name: 'login', query: { role: 'client' } }"
          >
            Client login
          </RouterLink>
          <RouterLink
            class="login-tab"
            :class="loginTabActiveClass('expert')"
            :to="{ name: 'login', query: { role: 'expert' } }"
          >
            Expert login
          </RouterLink>
        </div>
        <div v-else class="user-strip">
          <span class="user-email">{{ user.email }}</span>
          <span class="user-role">{{ user.role }}</span>
          <button type="button" class="logout-btn" @click="logout">Log out</button>
        </div>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.main-nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem 0;
}

.nav-home {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  margin-right: 0.5rem;
  font-weight: 500;
  color: var(--color-heading);
  text-decoration: none;
  border-radius: 8px;
}

.nav-home:hover {
  background: var(--color-background-mute);
}

.main-nav > a.router-link-exact-active:not(.nav-home) {
  color: var(--color-text);
}

.main-nav > a.router-link-exact-active:not(.nav-home):hover {
  background-color: transparent;
}

.login-tabs {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.login-tab {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  border-left: 1px solid var(--color-border);
  background: var(--color-background);
  transition:
    background 0.15s,
    color 0.15s;
}

.login-tab:first-child {
  border-left: none;
}

.login-tab:hover {
  background: var(--color-background-mute);
}

.login-tab.login-tab--active {
  background: var(--vt-c-indigo);
  color: var(--vt-c-white);
}

.user-strip {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 12px;
}

.user-email {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  text-transform: capitalize;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
}

.logout-btn {
  font: inherit;
  font-size: 12px;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.logout-btn:hover {
  background: var(--color-background-mute);
}

@media (min-width: 1024px) {
  .main-nav {
    text-align: left;
    font-size: 1rem;
    justify-content: flex-start;
    padding: 1rem 0;
  }

  .login-tab {
    font-size: 0.9rem;
    padding: 0.45rem 1rem;
  }

  .user-strip {
    font-size: 0.9rem;
  }

  .logout-btn {
    font-size: 0.9rem;
  }
}
</style>
