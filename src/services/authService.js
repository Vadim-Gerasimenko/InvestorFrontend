import apiClient from './api';

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async refresh() {
    const response = await apiClient.post('/auth/refresh_token');
    return response.data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  }
};