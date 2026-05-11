import api from '@/utils/axios';

export const accountService = {
  async getAllAccounts() {
    const response = await api.get('/api/portfolio/accounts');
    return response.data;
  },

  async activateAccount(accountName) {
    const response = await api.post('/api/portfolio/accounts/activate', { name: accountName });
    return response.data;
  }
};