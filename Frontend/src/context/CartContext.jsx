// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const LOCAL_CART_KEY = 'localmart_local_cart';

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_CART_KEY);
      return stored ? JSON.parse(stored) : { items: [] };
    } catch {
      return { items: [] };
    }
  });
  const [cartLoading, setCartLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    if (cart) {
      try {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
      } catch {}
    }
  }, [cart]);

  // Fetch cart from backend if authenticated customer
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    setCartLoading(true);
    try {
      const data = await cartService.getCart();
      if (data && Array.isArray(data.items)) {
        setCart(data);
      }
    } catch {
      // Keep existing local cart
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated, isCustomer]);

  const addItem = useCallback(async (product_id, quantity = 1, productObj = null) => {
    let syncedWithBackend = false;
    if (isAuthenticated && isCustomer) {
      try {
        await cartService.addItem(product_id, quantity);
        await refreshCart();
        syncedWithBackend = true;
      } catch (err) {
        // If product_id is not a backend DB UUID, continue with local cart
      }
    }

    if (!syncedWithBackend) {
      setCart(prev => {
        const currentItems = Array.isArray(prev?.items) ? [...prev.items] : [];
        const existingIdx = currentItems.findIndex(i => i.product_id === product_id || i.product?.id === product_id);
        if (existingIdx >= 0) {
          currentItems[existingIdx].quantity += quantity;
        } else {
          currentItems.push({
            id: 'item-' + Date.now(),
            product_id: product_id,
            quantity: quantity,
            product: productObj || {
              id: product_id,
              name: 'Local Product',
              price: 199,
              image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80',
            },
          });
        }
        return { ...prev, items: currentItems };
      });
    }
  }, [isAuthenticated, isCustomer, refreshCart]);

  const updateItem = useCallback(async (item_id, quantity) => {
    let synced = false;
    if (isAuthenticated && isCustomer) {
      try {
        await cartService.updateItem(item_id, quantity);
        await refreshCart();
        synced = true;
      } catch {}
    }
    if (!synced) {
      setCart(prev => {
        const items = (prev?.items || []).map(item => {
          if (item.id === item_id) return { ...item, quantity };
          return item;
        });
        return { ...prev, items };
      });
    }
  }, [isAuthenticated, isCustomer, refreshCart]);

  const removeItem = useCallback(async (item_id) => {
    let synced = false;
    if (isAuthenticated && isCustomer) {
      try {
        await cartService.removeItem(item_id);
        await refreshCart();
        synced = true;
      } catch {}
    }
    if (!synced) {
      setCart(prev => ({
        ...prev,
        items: (prev?.items || []).filter(item => item.id !== item_id),
      }));
    }
  }, [isAuthenticated, isCustomer, refreshCart]);

  const clearCart = useCallback(() => {
    setCart({ items: [] });
    try {
      localStorage.removeItem(LOCAL_CART_KEY);
    } catch {}
  }, []);

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const cartCount = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const cartTotal = items.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.product?.price) || 0)), 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, cartLoading, refreshCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export default CartContext;
