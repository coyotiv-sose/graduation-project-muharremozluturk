import { defineStore } from 'pinia'
import http from '@/api/http'

export const useAccountStore = defineStore('Account', {
  state: () => ({
    user: null,
  }),
  actions: {
    async fetchUser(expectedRole) {
      const url =
        expectedRole != null
          ? `/accounts/session?role=${encodeURIComponent(expectedRole)}`
          : '/accounts/session'
      this.user = (await http.get(url)).data
    },
    async login(email, password, role) {
      if (role !== 'client' && role !== 'expert') {
        throw new Error('login requires role: "client" or "expert"')
      }
      const q = `?role=${encodeURIComponent(role)}`
      this.user = (
        await http.post(`/accounts/session${q}`, {
          email,
          password,
        })
      ).data
    },
    async logout() {
      await http.delete('/accounts/session')
      this.user = null
    },
  },
})
