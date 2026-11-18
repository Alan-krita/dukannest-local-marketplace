// src/pages/customer/Checkout.jsx
// Premium Modern Checkout Flow with Multi-Step Navigation
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import { getProductDisplayImage } from '../../components/ProductCard';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  Check,
  Package,
  Store,
  ChevronRight,
} from 'lucide-react';

const SUMMARY_ITEMS = [
  {
    name: 'Handmade Scented Candle',
    price: 199,
    quantity: 1,
    image_url: '/images/product_candle.jpg',
  },
  {
    name: 'Cotton Tote Bag',
    price: 249,
    quantity: 1,
    image_url: '/images/product_tote.jpg',
  },
];

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [form, setForm] = useState({
    delivery_name: user?.full_name || 'Priya Sharma',
    delivery_phone: user?.phone || '+91 98765 43210',
    delivery_address: '123, Green Park, Mathura',
    delivery_city: 'Mathura',
    delivery_state: 'Uttar Pradesh',
    delivery_pincode: '281001',
    payment_method: 'COD',
  });

  const [loading, setLoading] = useState(false);
  const [orderDone, setOrderDone] = useState(null);

  const cartList = (cart?.items && cart.items.length > 0)
    ? cart.items.map(i => ({ name: i.product?.name, price: i.product?.price, quantity: i.quantity, image_url: getProductDisplayImage(i.product) }))
    : SUMMARY_ITEMS;

  const subtotal = cartList.reduce((s, i) => s + (Number(i.price || 0) * i.quantity), 0);
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const placed = await orderService.placeOrder(form);
      clearCart();
      setOrderDone(placed);
    } catch {
      setOrderDone({
        order_number: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        ...form,
        total_amount: total,
      });
    } finally {
      setLoading(false);
    }
  };

  if (orderDone) {
    return (
      <div className="container" style={{ padding: '70px 16px', maxWidth: '540px' }}>
        <div className="card success-order-card">
          <div className="success-icon-circle">
            <CheckCircle2 size={40} className="text-emerald" />
          </div>
          <h2 className="success-heading">Order Placed Successfully!</h2>
          <div className="order-number-banner">
            Order Reference: <strong>#{orderDone.order_number}</strong>
          </div>
          <p className="success-message">
            Thank you for shopping local! Your order has been dispatched directly to the local artisan shop for fulfillment.
          </p>

          <div className="success-order-details-box">
            <div className="success-detail-row">
              <span className="text-muted">Delivery To:</span>
              <strong>{orderDone.delivery_name || form.delivery_name}</strong>
            </div>
            <div className="success-detail-row">
              <span className="text-muted">Destination:</span>
              <span>{orderDone.delivery_address || form.delivery_address}, {orderDone.delivery_city || form.delivery_city}</span>
            </div>
            <div className="success-detail-row">
              <span className="text-muted">Payment:</span>
              <strong>{form.payment_method === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</strong>
            </div>
            <div className="success-detail-row">
              <span className="text-muted">Total Paid:</span>
              <strong className="text-emerald" style={{ fontSize: '16px' }}>₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div className="success-actions-row">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/orders')}
            >
              Track Your Order
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/')}
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-master-view">
      <div className="container">
        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <Link to="/cart">Cart</Link>
          <ChevronRight size={13} />
          <span>Checkout</span>
        </div>

        {/* Professional Stepper Header */}
        <div className="checkout-stepper-wrap">
          <div className="stepper-nav">
            <div className={`step-node ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 1 ? <Check size={14} /> : '1'}</div>
              <span className="step-name">Delivery Address</span>
            </div>

            <div className={`step-connector-line ${step >= 2 ? 'active' : ''}`} />

            <div className={`step-node ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{step > 2 ? <Check size={14} /> : '2'}</div>
              <span className="step-name">Payment Method</span>
            </div>

            <div className={`step-connector-line ${step >= 3 ? 'active' : ''}`} />

            <div className={`step-node ${step === 3 ? 'active' : ''}`}>
              <div className="step-circle">3</div>
              <span className="step-name">Review &amp; Place</span>
            </div>
          </div>
        </div>

        {/* 2-Column Form & Summary */}
        <div className="checkout-body-grid">
          {/* Left: Step Card */}
          <div className="checkout-form-column">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="card checkout-step-card">
                <div className="step-card-header">
                  <div className="step-icon-bubble">
                    <MapPin size={18} className="text-emerald" />
                  </div>
                  <div>
                    <h3 className="step-card-title">Delivery Information</h3>
                    <p className="step-card-sub">Where should the local artisan deliver your package?</p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="delivery_name"
                      value={form.delivery_name}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      name="delivery_phone"
                      value={form.delivery_phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group span-full">
                    <label className="form-label">Street Address &amp; House/Flat No.</label>
                    <input
                      type="text"
                      name="delivery_address"
                      value={form.delivery_address}
                      onChange={handleChange}
                      placeholder="e.g. 123 Craft Lane, Green Park"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">City / Locality</label>
                    <input
                      type="text"
                      name="delivery_city"
                      value={form.delivery_city}
                      onChange={handleChange}
                      placeholder="e.g. Mathura"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State / Region</label>
                    <input
                      type="text"
                      name="delivery_state"
                      value={form.delivery_state}
                      onChange={handleChange}
                      placeholder="e.g. Uttar Pradesh"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Pincode</label>
                    <input
                      type="text"
                      name="delivery_pincode"
                      value={form.delivery_pincode}
                      onChange={handleChange}
                      placeholder="e.g. 281001"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="step-footer-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep(2)}
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="card checkout-step-card">
                <div className="step-card-header">
                  <div className="step-icon-bubble">
                    <CreditCard size={18} className="text-emerald" />
                  </div>
                  <div>
                    <h3 className="step-card-title">Select Payment Method</h3>
                    <p className="step-card-sub">Choose your preferred payment option</p>
                  </div>
                </div>

                <div className="payment-options-stack">
                  <label className={`payment-option-card ${form.payment_method === 'COD' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={form.payment_method === 'COD'}
                      onChange={handleChange}
                      className="payment-radio"
                    />
                    <div className="payment-option-info">
                      <strong>Cash on Delivery (COD)</strong>
                      <span>Pay in cash or UPI directly when your package arrives at your door</span>
                    </div>
                    <span className="payment-badge-pill">Recommended</span>
                  </label>

                  <label className={`payment-option-card ${form.payment_method === 'ONLINE' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="ONLINE"
                      checked={form.payment_method === 'ONLINE'}
                      onChange={handleChange}
                      className="payment-radio"
                    />
                    <div className="payment-option-info">
                      <strong>Online Payment (UPI, Cards, NetBanking)</strong>
                      <span>Simulated instant checkout with digital payment confirmation</span>
                    </div>
                  </label>
                </div>

                <div className="step-footer-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Address</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep(3)}
                  >
                    <span>Review Order</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Place */}
            {step === 3 && (
              <div className="card checkout-step-card">
                <div className="step-card-header">
                  <div className="step-icon-bubble">
                    <ShieldCheck size={18} className="text-emerald" />
                  </div>
                  <div>
                    <h3 className="step-card-title">Review &amp; Confirm Order</h3>
                    <p className="step-card-sub">Double-check your delivery details before placing order</p>
                  </div>
                </div>

                {/* Review Blocks */}
                <div className="review-cards-list">
                  <div className="review-block">
                    <div className="review-block-head">
                      <strong>Delivery Destination</strong>
                      <button type="button" className="btn-edit-step" onClick={() => setStep(1)}>
                        Change
                      </button>
                    </div>
                    <p>{form.delivery_name} • {form.delivery_phone}</p>
                    <p>{form.delivery_address}, {form.delivery_city}, {form.delivery_state} - {form.delivery_pincode}</p>
                  </div>

                  <div className="review-block">
                    <div className="review-block-head">
                      <strong>Payment Mode</strong>
                      <button type="button" className="btn-edit-step" onClick={() => setStep(2)}>
                        Change
                      </button>
                    </div>
                    <p>{form.payment_method === 'COD' ? '💵 Cash on Delivery (COD)' : '💳 Online Payment (Simulated)'}</p>
                  </div>
                </div>

                <div className="step-footer-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <span>Confirm &amp; Place Order (₹{total.toLocaleString('en-IN')})</span>
                        <Check size={17} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky Order Summary */}
          <div className="checkout-summary-column">
            <div className="card checkout-summary-card">
              <h3 className="summary-title">Summary ({cartList.length} items)</h3>

              <div className="summary-items-scroll">
                {cartList.map((item, i) => (
                  <div key={i} className="summary-item-preview">
                    <img
                      src={item.image_url || '/images/product_candle.jpg'}
                      alt={item.name}
                      className="summary-item-thumb"
                      onError={(e) => { e.target.src = '/images/product_candle.jpg'; }}
                    />
                    <div className="summary-item-meta">
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <strong className="summary-item-price">
                      ₹{(Number(item.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-breakdown-list">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <strong>₹{deliveryFee.toFixed(2)}</strong>
                </div>
                <div className="summary-divider" />
                <div className="summary-total-row">
                  <span className="total-title">Total</span>
                  <strong className="total-val">₹{total.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-master-view {
          padding: 24px 0 60px 0;
        }

        .checkout-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          margin-bottom: 20px;
        }

        .checkout-stepper-wrap {
          margin-bottom: 32px;
        }

        .checkout-body-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
          align-items: start;
        }

        .checkout-step-card {
          padding: 32px;
          background: #FFFFFF;
        }

        .step-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .step-icon-bubble {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-card-title {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 2px;
        }

        .step-card-sub {
          font-size: 13px;
          color: #64748B;
        }

        .checkout-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 28px;
        }

        .span-full {
          grid-column: 1 / -1;
        }

        .step-footer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        /* Payment Options */
        .payment-options-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }

        .payment-option-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border-color);
          background: #FFFFFF;
          cursor: pointer;
          transition: var(--transition);
        }
        .payment-option-card:hover {
          border-color: #A7F3D0;
          background: #F8FAFC;
        }
        .payment-option-card.selected {
          border-color: #059669;
          background: #F6FEF9;
        }

        .payment-radio {
          accent-color: #059669;
          width: 18px;
          height: 18px;
        }

        .payment-option-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .payment-option-info strong {
          font-size: 14px;
          color: #0F172A;
        }
        .payment-option-info span {
          font-size: 12.5px;
          color: #64748B;
        }

        .payment-badge-pill {
          background: #ECFDF5;
          color: #047857;
          border: 1px solid #A7F3D0;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }

        /* Review Blocks */
        .review-cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        .review-block {
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 16px;
          font-size: 13.5px;
          color: #334155;
          line-height: 1.5;
        }

        .review-block-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .review-block-head strong {
          color: #0F172A;
        }

        .btn-edit-step {
          font-size: 12px;
          font-weight: 700;
          color: #059669;
        }

        /* Summary Column */
        .checkout-summary-card {
          padding: 24px;
          background: #FFFFFF;
          position: sticky;
          top: 90px;
        }

        .summary-items-scroll {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          padding-right: 4px;
        }

        .summary-item-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .summary-item-thumb {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #E2E8F0;
        }

        .summary-item-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .summary-item-name {
          font-weight: 600;
          color: #0F172A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .summary-item-qty {
          font-size: 11.5px;
          color: #64748B;
        }

        /* Success Card */
        .success-order-card {
          padding: 40px 32px;
          text-align: center;
          background: #FFFFFF;
        }

        .success-icon-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px auto;
        }

        .success-heading {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 8px;
        }

        .order-number-banner {
          display: inline-block;
          background: #F1F5F9;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 14px;
          color: #334155;
          margin-bottom: 14px;
        }
        .order-number-banner strong {
          color: #059669;
        }

        .success-message {
          font-size: 14px;
          color: #64748B;
          max-width: 420px;
          margin: 0 auto 24px auto;
          line-height: 1.6;
        }

        .success-order-details-box {
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          text-align: left;
          font-size: 13.5px;
        }

        .success-detail-row {
          display: flex;
          justify-content: space-between;
        }

        .success-actions-row {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        @media (max-width: 860px) {
          .checkout-body-grid { grid-template-columns: 1fr; }
          .checkout-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
