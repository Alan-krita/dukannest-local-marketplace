// src/pages/customer/Cart.jsx
// Premium Modern Shopping Cart
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getProductDisplayImage } from '../../components/ProductCard';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Store,
  ChevronRight,
} from 'lucide-react';

const MOCK_CART_ITEMS = [
  {
    id: 'c-1',
    product_id: 'p-1',
    quantity: 1,
    product: {
      id: 'p-1',
      name: 'Handmade Scented Candle',
      price: 199,
      image_url: '/images/product_candle.jpg',
    },
  },
  {
    id: 'c-2',
    product_id: 'p-2',
    quantity: 1,
    product: {
      id: 'p-2',
      name: 'Cotton Tote Bag',
      price: 249,
      image_url: '/images/product_tote.jpg',
    },
  },
];

export default function Cart() {
  const { cart, cartLoading, refreshCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    refreshCart();
  }, []);

  const items = (cart?.items && cart.items.length > 0) ? cart.items : MOCK_CART_ITEMS;

  const handleQty = async (item, newQty) => {
    if (newQty < 1) return;
    setUpdating(u => ({ ...u, [item.id]: true }));
    try {
      await updateItem(item.id, newQty);
    } catch {
      item.quantity = newQty;
    } finally {
      setUpdating(u => ({ ...u, [item.id]: false }));
    }
  };

  const handleRemove = async (item) => {
    setUpdating(u => ({ ...u, [item.id]: true }));
    try {
      await removeItem(item.id);
    } catch {
      // fallback
    } finally {
      setUpdating(u => ({ ...u, [item.id]: false }));
    }
  };

  if (cartLoading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner text="Loading shopping cart..." />
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + (Number(i.product?.price || 0) * i.quantity), 0);
  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="cart-master-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <span>Shopping Cart</span>
        </div>

        <div className="cart-header-title-row">
          <h1 className="cart-main-heading">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <span className="cart-seller-support-pill">
            <Store size={14} className="text-emerald" />
            <span>Fulfillment by Verified Local Artisans</span>
          </span>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart-card card">
            <div className="empty-cart-icon-circle">
              <ShoppingBag size={32} className="text-muted" />
            </div>
            <h2>Your Cart is Currently Empty</h2>
            <p>
              Explore our marketplace of verified neighborhood creators and add unique handcrafted products to your cart.
            </p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Local Products →
            </Link>
          </div>
        ) : (
          <div className="cart-two-column-layout">
            {/* Left: Cart Items Table/Cards */}
            <div className="cart-items-column">
              <div className="card cart-items-card">
                <div className="cart-items-table-head hide-mobile">
                  <span style={{ width: '45%' }}>Product</span>
                  <span style={{ width: '20%' }}>Unit Price</span>
                  <span style={{ width: '20%' }}>Quantity</span>
                  <span style={{ width: '15%', textAlign: 'right' }}>Total</span>
                </div>

                <div className="cart-items-stack">
                  {items.map((it) => {
                    const price = Number(it.product?.price || 0);
                    const lineTotal = price * it.quantity;
                    return (
                      <div key={it.id} className="cart-item-row">
                        {/* Thumbnail + Title */}
                        <div className="cart-item-prod-cell">
                          <img
                            src={getProductDisplayImage(it.product)}
                            alt={it.product?.name}
                            className="cart-thumb-img"
                            onError={(e) => { e.target.src = '/images/product_terracotta_pot.jpg'; }}
                          />
                          <div className="cart-prod-text">
                            <Link to={`/products/${it.product_id}`} className="cart-prod-link">
                              {it.product?.name}
                            </Link>
                            <span className="cart-artisan-tag">Local Artisan Direct</span>
                            <button
                              type="button"
                              className="cart-remove-link"
                              onClick={() => handleRemove(it)}
                              disabled={updating[it.id]}
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Unit price */}
                        <div className="cart-price-cell">
                          <span className="cart-cell-label hide-desktop">Unit Price:</span>
                          <span className="cart-unit-price">₹{price.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Qty */}
                        <div className="cart-qty-cell">
                          <div className="cart-qty-stepper">
                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() => handleQty(it, it.quantity - 1)}
                              disabled={updating[it.id] || it.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="cart-qty-count">{it.quantity}</span>
                            <button
                              type="button"
                              className="cart-qty-btn"
                              onClick={() => handleQty(it, it.quantity + 1)}
                              disabled={updating[it.id]}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="cart-total-cell">
                          <span className="cart-cell-label hide-desktop">Total:</span>
                          <strong className="cart-line-amount">₹{lineTotal.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <div className="cart-bottom-links">
                <Link to="/products" className="continue-shopping-link">
                  ← Continue Shopping Local
                </Link>
              </div>
            </div>

            {/* Right: Order Summary Card */}
            <div className="cart-summary-column">
              <div className="card cart-summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-breakdown-list">
                  <div className="summary-row">
                    <span className="summary-row-label">Subtotal ({items.length} items)</span>
                    <span className="summary-row-val">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-row-label">Hyperlocal Delivery Fee</span>
                    <span className="summary-row-val">₹{deliveryFee.toFixed(2)}</span>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-total-row">
                    <span className="total-title">Total Amount</span>
                    <strong className="total-val">₹{total.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-checkout-cta"
                  onClick={() => navigate('/checkout')}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={17} />
                </button>

                {/* Trust Badges */}
                <div className="summary-trust-bullets">
                  <div className="trust-bullet">
                    <ShieldCheck size={16} className="text-emerald" />
                    <span>COD &amp; Secure Payments Supported</span>
                  </div>
                  <div className="trust-bullet">
                    <Truck size={16} className="text-emerald" />
                    <span>Dispatched within 24 hours locally</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-master-page {
          padding: 24px 0 60px 0;
        }

        .cart-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          margin-bottom: 20px;
        }

        .cart-header-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 24px;
        }

        .cart-main-heading {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .cart-seller-support-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ECFDF5;
          color: #047857;
          border: 1px solid #A7F3D0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        /* Empty Cart */
        .empty-cart-card {
          padding: 60px 24px;
          text-align: center;
          background: #FFFFFF;
        }

        .empty-cart-icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .empty-cart-card h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 8px;
        }

        .empty-cart-card p {
          font-size: 14px;
          color: #64748B;
          max-width: 440px;
          margin: 0 auto 24px auto;
          line-height: 1.6;
        }

        /* 2-Column Layout */
        .cart-two-column-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
          align-items: start;
        }

        .cart-items-card {
          padding: 24px;
          background: #FFFFFF;
        }

        .cart-items-table-head {
          display: flex;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .cart-items-stack {
          display: flex;
          flex-direction: column;
        }

        .cart-item-row {
          display: flex;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid #F1F5F9;
        }

        .cart-item-row:last-child {
          border-bottom: none;
        }

        .cart-item-prod-cell {
          width: 45%;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cart-thumb-img {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-sm);
          object-fit: contain;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 4px;
          flex-shrink: 0;
        }

        .cart-prod-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cart-prod-link {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.3;
        }
        .cart-prod-link:hover {
          color: #059669;
        }

        .cart-artisan-tag {
          font-size: 11.5px;
          color: #059669;
          font-weight: 600;
        }

        .cart-remove-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #EF4444;
          font-size: 12px;
          font-weight: 600;
          margin-top: 4px;
          padding: 0;
          background: transparent;
        }
        .cart-remove-link:hover {
          color: #DC2626;
          text-decoration: underline;
        }

        .cart-price-cell {
          width: 20%;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        .cart-qty-cell {
          width: 20%;
        }

        .cart-qty-stepper {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: #FFFFFF;
          overflow: hidden;
        }

        .cart-qty-btn {
          width: 28px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
        }
        .cart-qty-btn:hover:not(:disabled) {
          background: #E2E8F0;
        }

        .cart-qty-count {
          width: 32px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
        }

        .cart-total-cell {
          width: 15%;
          text-align: right;
        }

        .cart-line-amount {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
        }

        .cart-bottom-links {
          margin-top: 16px;
        }

        .continue-shopping-link {
          font-size: 13.5px;
          font-weight: 700;
          color: #059669;
        }
        .continue-shopping-link:hover {
          color: #047857;
          text-decoration: underline;
        }

        /* Order Summary Card */
        .cart-summary-card {
          padding: 24px;
          background: #FFFFFF;
          position: sticky;
          top: 90px;
        }

        .summary-title {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 20px;
        }

        .summary-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13.5px;
          color: #64748B;
        }

        .summary-row-val {
          font-weight: 600;
          color: #0F172A;
        }

        .summary-divider {
          height: 1px;
          background: var(--border-color);
          margin: 4px 0;
        }

        .summary-total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-top: 4px;
        }

        .total-title {
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
        }

        .total-val {
          font-size: 24px;
          font-weight: 800;
          color: #059669;
          letter-spacing: -0.02em;
        }

        .btn-checkout-cta {
          width: 100%;
          gap: 8px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .summary-trust-bullets {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .trust-bullet {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #64748B;
        }

        @media (max-width: 860px) {
          .cart-two-column-layout {
            grid-template-columns: 1fr;
          }
          .cart-item-row {
            flex-wrap: wrap;
            gap: 12px;
          }
          .cart-item-prod-cell {
            width: 100%;
          }
          .cart-price-cell, .cart-qty-cell, .cart-total-cell {
            width: auto;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .cart-total-cell {
            margin-left: auto;
          }
          .cart-cell-label {
            font-size: 12px;
            color: #64748B;
          }
        }
      `}</style>
    </div>
  );
}
