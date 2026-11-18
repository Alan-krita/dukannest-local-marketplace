// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import SellerLayout from './layouts/SellerLayout';

// Protection
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import ProductDetails from './pages/customer/ProductDetails';
import ShopProfile from './pages/customer/ShopProfile';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';

// Auth Pages
import RoleSelect from './pages/auth/RoleSelect';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Seller Pages
import Dashboard from './pages/seller/Dashboard';
import MyShop from './pages/seller/MyShop';
import ManageProducts from './pages/seller/ManageProducts';
import AddEditProduct from './pages/seller/AddEditProduct';
import SellerOrders from './pages/seller/Orders';
import SellerOnboarding from './pages/seller/SellerOnboarding';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Customer Layout (Navbar + Content + Footer) */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/shop/:id" element={<ShopProfile />} />

                {/* Customer Checkout & Order Tracking */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute role="CUSTOMER">
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute role="CUSTOMER">
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute role="CUSTOMER">
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Authentication Flow */}
              <Route path="/choose-role" element={<RoleSelect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Seller Guided Onboarding */}
              <Route
                path="/seller/onboarding"
                element={
                  <ProtectedRoute role="SELLER">
                    <SellerOnboarding />
                  </ProtectedRoute>
                }
              />

              {/* Seller Admin Panel Layout */}
              <Route
                path="/seller"
                element={
                  <ProtectedRoute role="SELLER">
                    <SellerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/seller/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="shop" element={<MyShop />} />
                <Route path="products" element={<ManageProducts />} />
                <Route path="products/add" element={<AddEditProduct />} />
                <Route path="products/edit/:id" element={<AddEditProduct />} />
                <Route path="orders" element={<SellerOrders />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
