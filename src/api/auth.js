import api from '@/utils/axios';

export const authApi = {
  login(credentials) {
    return api.post('/api/auth/login', credentials);
  },

  register(userData) {
    return api.post('/api/auth/register', userData);
  },

  refreshToken() {
    return api.post('/api/auth/refresh_token');
  },

  logout() {
    return api.post('/api/auth/logout');
  },

  getCurrentUser() {
    return api.get('/api/user/profile');
  }
};