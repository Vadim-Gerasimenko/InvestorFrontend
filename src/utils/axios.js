import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9095',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request:', config.url);
    } else {
      console.log('No token for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized, fake clearing token');
      //localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default api;