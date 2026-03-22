import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:3000'

export const useAccountStore = defineStore('Account', {
  state: () => ({
    user: null
  }),
  actions: {
    async fetchUser(expectedRole) {
      const url =
        expectedRole != null
          ? `/accounts/session?role=${encodeURIComponent(expectedRole)}`
          : '/accounts/session'
      this.user = (await axios.get(url)).data
    },
    async login(email, password, role) {
      if (role !== 'client' && role !== 'expert') {
        throw new Error('login requires role: "client" or "expert"')
      }
      const q = `?role=${encodeURIComponent(role)}`
      this.user = (
        await axios.post(`/accounts/session${q}`, {
          email,
          password,
        })
      ).data
    },
    async logout() {
      await axios.delete('/accounts/session')
      this.user = null
    }
  }
})