import { defineStore } from 'pinia'
import type { User } from '@/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.user?.id || 0,
    username: (state) => state.user?.username || '',
    email: (state) => state.user?.email || '',
    createdAt: (state) => state.user?.createdAt || ''
  },

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },

    setUser(user: User) {
      this.user = user
    },

    setUsername(username: string) {
      if (this.user) {
        this.user.username = username
      }
    },

    setEmail(email: string) {
      if (this.user) {
        this.user.email = email
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
    }
  }
})
