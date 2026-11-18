// src/services/authService.js
import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', { body: data }),
  login: (email, password) => api.post('/auth/login', { body: { email, password } }),
  getMe: () => api.get('/auth/me', { auth: true }),
};

export default authService;
