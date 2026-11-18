// src/services/shopService.js
import api from './api';

export const shopService = {
  createShop: (data) => api.post('/shops', { body: data, auth: true }),
  getMyShop: () => api.get('/shops/mine', { auth: true }),
  updateMyShop: (data) => api.patch('/shops/mine', { body: data, auth: true }),
  getShop: (shop_id) => api.get(`/shops/${shop_id}`),
  getDashboard: (params) => api.get('/seller/dashboard', { auth: true, params }),
  getCategories: () => api.get('/categories'),
};

export default shopService;
