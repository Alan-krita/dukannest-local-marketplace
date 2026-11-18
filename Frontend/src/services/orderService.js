// src/services/orderService.js
import api from './api';

export const orderService = {
  // CUSTOMER — place order
  placeOrder: (data) => api.post('/orders', { body: data, auth: true }),

  // CUSTOMER — get own orders
  getMyOrders: () => api.get('/orders/mine', { auth: true }),

  // SELLER — get incoming orders
  getSellerOrders: () => api.get('/seller/orders', { auth: true }),

  // SELLER — update order status
  updateOrderStatus: (order_id, status) =>
    api.patch(`/seller/orders/${order_id}/status`, { body: { status }, auth: true }),
};

export default orderService;
