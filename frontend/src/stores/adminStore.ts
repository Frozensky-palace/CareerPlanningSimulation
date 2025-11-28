import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: localStorage.getItem('adminToken') || ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('adminToken', token)
    },

    logout() {
      this.token = ''
      localStorage.removeItem('adminToken')
    }
  }
})
