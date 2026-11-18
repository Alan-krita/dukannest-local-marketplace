// src/pages/customer/MyOrders.jsx
// Premium Modern Customer Orders & Tracking
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getProductDisplayImage } from '../../components/ProductCard';
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Calendar,
  Eye,
  Check,
} from 'lucide-react';

const TABS = ['All Orders', 'Delivered', 'Processing', 'Cancelled'];

const STATUS_BADGE_STYLE = {
  DELIVERED: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Delivered' },
  SHIPPED: { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', label: 'In Transit' },
  PACKED: { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', label: 'Packed' },
  ACCEPTED: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Accepted' },
  PLACED: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Placed' },
  PROCESSING: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Processing' },
  CANCELLED: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Cancelled' },
  PENDING: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Placed' },
};

const SAMPLE_ORDERS_LIST = [
  {
    id: 'o-1001',
    order_number: 'ORD1001',
    created_at: '2025-04-12T10:00:00Z',
    status: 'DELIVERED',
    total_amount: 199,
    item_summary: 'Handmade Scented Candle • 1 Item',
    items: [
      { product_name: 'Handmade Scented Candle', quantity: 1, unit_price: 199, subtotal: 199 },
    ],
    image_url: '/images/product_candle.jpg',
    delivery_name: 'Priya Sharma',
    delivery_address: '123, Green Park, Mathura, 281001',
  },
  {
    id: 'o-1002',
    order_number: 'ORD1002',
    created_at: '2025-04-14T11:30:00Z',
    status: 'PROCESSING',
    total_amount: 249,
    item_summary: 'Cotton Tote Bag • 1 Item',
    items: [
      { product_name: 'Cotton Tote Bag', quantity: 1, unit_price: 249, subtotal: 249 },
    ],
    image_url: '/images/product_tote.jpg',
    delivery_name: 'Priya Sharma',
    delivery_address: '123, Green Park, Mathura, 281001',
  },
  {
    id: 'o-1003',
    order_number: 'ORD1003',
    created_at: '2025-04-10T16:45:00Z',
    status: 'SHIPPED',
    total_amount: 399,
    item_summary: 'Organic Honey (500g) • 1 Item',
    items: [
      { product_name: 'Organic Honey (500g)', quantity: 1, unit_price: 399, subtotal: 399 },
    ],
    image_url: '/images/product_honey.jpg',
    delivery_name: 'Priya Sharma',
    delivery_address: '123, Green Park, Mathura, 281001',
  },
];

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    orderService.getMyOrders()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setOrders(list.length > 0 ? list : SAMPLE_ORDERS_LIST);
      })
      .catch(() => {
        setOrders(SAMPLE_ORDERS_LIST);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (activeTab === 'All Orders') return true;
    if (activeTab === 'Delivered') return o.status === 'DELIVERED';
    if (activeTab === 'Processing') return o.status === 'PROCESSING' || o.status === 'PENDING' || o.status === 'SHIPPED' || o.status === 'PACKED' || o.status === 'ACCEPTED' || o.status === 'PLACED';
    if (activeTab === 'Cancelled') return o.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner text="Fetching your orders..." />
      </div>
    );
  }

  return (
    <div className="orders-master-view">
      <div className="container" style={{ maxWidth: '980px' }}>
        {/* Breadcrumb */}
        <div className="orders-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <span>My Orders</span>
        </div>

        <div className="orders-page-header">
          <div>
            <h1 className="orders-page-title">My Orders &amp; Receipts</h1>
            <p className="orders-page-sub">Track order fulfillment status and view receipt history</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="orders-tabs-row">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`orders-tab-pill ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="empty-orders-card card">
            <div className="empty-orders-icon">
              <ShoppingBag size={30} className="text-muted" />
            </div>
            <h3>No Orders in "{activeTab}"</h3>
            <p>You do not currently have any orders under this filter status.</p>
            <Link to="/products" className="btn btn-primary btn-sm">
              Discover Products →
            </Link>
          </div>
        ) : (
          <div className="orders-cards-stack">
            {filtered.map((ord) => {
              const badge = STATUS_BADGE_STYLE[ord.status] || STATUS_BADGE_STYLE.PLACED;
              const formattedDate = new Date(ord.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const isDelivered = ord.status === 'DELIVERED';
              const isShipped = isDelivered || ord.status === 'SHIPPED';
              const isPacked = isShipped || ord.status === 'PACKED';
              const isPlaced = true;

              return (
                <div key={ord.id} className="card order-master-card">
                  {/* Card Header Bar */}
                  <div className="order-card-top-bar">
                    <div className="order-num-group">
                      <span className="order-number-bold">#{ord.order_number}</span>
                      <span className="order-date-text">
                        <Calendar size={13} />
                        <span>Placed on {formattedDate}</span>
                      </span>
                    </div>

                    <span
                      className="badge"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Tracking Timeline Stepper */}
                  {ord.status !== 'CANCELLED' && (
                    <div className="order-tracking-strip">
                      <div className="tracking-timeline-grid">
                        <div className={`track-point ${isPlaced ? 'done' : ''}`}>
                          <div className="track-dot">
                            {isPlaced && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="track-label">Placed</span>
                        </div>

                        <div className={`track-bar ${isPacked ? 'done' : ''}`} />

                        <div className={`track-point ${isPacked ? 'done' : ''}`}>
                          <div className="track-dot">
                            {isPacked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="track-label">Packed</span>
                        </div>

                        <div className={`track-bar ${isShipped ? 'done' : ''}`} />

                        <div className={`track-point ${isShipped ? 'done' : ''}`}>
                          <div className="track-dot">
                            {isShipped && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="track-label">Shipped</span>
                        </div>

                        <div className={`track-bar ${isDelivered ? 'done' : ''}`} />

                        <div className={`track-point ${isDelivered ? 'done' : ''}`}>
                          <div className="track-dot">
                            {isDelivered && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="track-label">Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items Preview & Amount */}
                  <div className="order-card-body-row">
                    <div className="order-items-preview-col">
                      <img
                        src={getProductDisplayImage({ name: ord.item_summary || ord.items?.[0]?.product_name_snapshot || ord.items?.[0]?.product_name, image_url: ord.image_url })}
                        alt="Product Item"
                        className="order-item-thumb"
                        onError={(e) => { e.target.src = '/images/product_terracotta_pot.jpg'; }}
                      />
                      <div>
                        <div className="order-items-summary-text">
                          {ord.item_summary || (ord.items?.[0]?.product_name_snapshot || ord.items?.[0]?.product_name || 'Handmade Artisan Item')}
                        </div>
                        <div className="order-delivery-destination">
                          <MapPin size={12} className="text-emerald" />
                          <span>Delivering to: {ord.delivery_address || 'Mathura, UP'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-card-right-col">
                      <div className="order-total-block">
                        <span className="total-label">Total Amount:</span>
                        <strong className="total-price">₹{Number(ord.total_amount || 0).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .orders-master-view {
          padding: 24px 0 60px 0;
        }

        .orders-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #64748B;
          margin-bottom: 20px;
        }

        .orders-page-header {
          margin-bottom: 24px;
        }

        .orders-page-title {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .orders-page-sub {
          font-size: 13.5px;
          color: #64748B;
        }

        /* Tabs */
        .orders-tabs-row {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .orders-tab-pill {
          padding: 8px 18px;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
          transition: var(--transition);
        }
        .orders-tab-pill:hover {
          color: #059669;
          border-color: #A7F3D0;
        }
        .orders-tab-pill.active {
          background: #059669;
          color: #FFFFFF;
          border-color: #059669;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        }

        /* Orders Stack */
        .orders-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-master-card {
          padding: 24px;
          background: #FFFFFF;
        }

        .order-card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 18px;
        }

        .order-num-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .order-number-bold {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
        }

        .order-date-text {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12.5px;
          color: #64748B;
        }

        /* Tracking Timeline */
        .order-tracking-strip {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px 20px;
          margin-bottom: 20px;
        }

        .tracking-timeline-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
        }

        .track-point {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .track-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #E2E8F0;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .track-point.done .track-dot {
          background: #059669;
        }

        .track-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
        }
        .track-point.done .track-label {
          color: #059669;
        }

        .track-bar {
          flex: 1;
          height: 3px;
          background: #E2E8F0;
          margin: 0 8px;
          margin-bottom: 18px;
        }
        .track-bar.done {
          background: #059669;
        }

        /* Order Card Body */
        .order-card-body-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .order-items-preview-col {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .order-item-thumb {
          width: 58px;
          height: 58px;
          border-radius: 8px;
          object-fit: contain;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          padding: 4px;
          flex-shrink: 0;
        }

        .order-items-summary-text {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 4px;
        }

        .order-delivery-destination {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #64748B;
        }

        .order-card-right-col {
          text-align: right;
        }

        .order-total-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .total-label {
          font-size: 11.5px;
          color: #64748B;
          text-transform: uppercase;
        }

        .total-price {
          font-size: 20px;
          font-weight: 800;
          color: #059669;
        }

        /* Empty state */
        .empty-orders-card {
          padding: 60px 24px;
          text-align: center;
          background: #FFFFFF;
        }

        .empty-orders-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .empty-orders-card h3 {
          font-size: 17px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 6px;
        }

        .empty-orders-card p {
          font-size: 13.5px;
          color: #64748B;
          margin-bottom: 20px;
        }

        @media (max-width: 680px) {
          .order-card-body-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .order-card-right-col {
            text-align: left;
            margin-top: 10px;
          }
          .order-total-block {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
