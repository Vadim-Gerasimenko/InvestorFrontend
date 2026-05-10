import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('access_token') || null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    getUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await authApi.login(credentials)
        const { accessToken, user } = response.data

        this.accessToken = accessToken
        this.user = user

        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Ошибка входа'
        }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      try {
        const response = await authApi.register(userData)
        return { success: true, data: response.data }
      } catch (error) {
        console.error('Registration error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Ошибка регистрации'
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
        this.isLoading = false
        router.push('/login')
      }
    },

    clearAuth() {
      this.accessToken = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },

    restoreSession() {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.accessToken = token
        this.user = JSON.parse(user)
        return true
      }
      return false
    }
  }
})