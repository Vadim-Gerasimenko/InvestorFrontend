import { defineStore } from 'pinia';
import axios from '@/utils/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
  }),

  getters: {
    isAuthenticated: (state) => {
      const hasToken = state.token !== null && state.token !== undefined && state.token !== '';
      console.log('isAuthenticated check:', hasToken, 'token:', state.token?.substring(0, 20));
      return hasToken;
    },
  },

  actions: {
    async login(email, password) {
      try {
        delete axios.defaults.headers.common['Authorization'];
        const response = await axios.post('/api/auth/login', { email, password });
        const token = response.data.accessToken;

        this.token = token;
        localStorage.setItem('access_token', token);
        this.$state.token = token;
        console.log('Token saved to localStorage:', localStorage.getItem('access_token')?.substring(0, 50));

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Ошибка входа' };
      }
    },

    async register(registerData) {
      try {
        delete axios.defaults.headers.common['Authorization'];
        const response = await axios.post('/api/auth/register', registerData);
        return { success: true };
      } catch (error) {
        console.error('Registration error:', error);
        return {
          success: false,
          message: error.response?.data?.message || 'Ошибка регистрации'
        };
      }
    },

    logout() {
      this.token = null;
      localStorage.removeItem('access_token');
      delete axios.defaults.headers.common['Authorization'];
    },
  },
});