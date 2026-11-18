// src/services/cartService.js
import api from './api';

export const cartService = {
  getCart: () => api.get('/cart', { auth: true }),
  addItem: (product_id, quantity) => api.post('/cart/items', { body: { product_id, quantity }, auth: true }),
  updateItem: (item_id, quantity) => api.patch(`/cart/items/${item_id}`, { body: { quantity }, auth: true }),
  removeItem: (item_id) => api.delete(`/cart/items/${item_id}`, { auth: true }),
};

export default cartService;
