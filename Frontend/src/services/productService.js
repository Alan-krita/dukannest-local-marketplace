// src/services/productService.js
import api from './api';

export const productService = {
  // Public — list products with optional filters
  getProducts: (params = {}) => api.get('/products', { params }),

  // Public — single product
  getProduct: (id) => api.get(`/products/${id}`),

  // SELLER — create product
  createProduct: (data) => api.post('/products', { body: data, auth: true }),

  // SELLER — update product
  updateProduct: (id, data) => api.patch(`/products/${id}`, { body: data, auth: true }),

  // SELLER — archive (soft delete)
  archiveProduct: (id) => api.delete(`/products/${id}`, { auth: true }),
};

export default productService;
