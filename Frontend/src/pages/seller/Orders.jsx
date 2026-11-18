// src/pages/seller/Orders.jsx
// Premium Modern Seller Order Management
import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ShoppingBag,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const STATUS_OPTIONS = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_BADGE_STYLE = {
  PLACED: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Placed' },
  ACCEPTED: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Accepted' },
  PACKED: { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', label: 'Packed' },
  SHIPPED: { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', label: 'Shipped' },
  DELIVERED: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Delivered' },
  CANCELLED: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Cancelled' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getSellerOrders();
      setOrders(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load seller orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  if (loading) return <LoadingSpinner text="Loading incoming customer orders..." />;

  return (
    <div className="seller-orders-page">
      {/* Page Header */}
      <div className="orders-head-row">
        <div>
          <h1 className="dash-title-main">Customer Order Fulfillment</h1>
          <p className="dash-sub-desc">
            Review incoming orders, inspect item details, and update shipping progress in real time
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadOrders}
        >
          <RefreshCw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {error && <div className="error-box mb-16">{error}</div>}

      {/* Filter Tabs */}
      <div className="status-tabs-container">
        <button
          type="button"
          className={`status-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          <span>All Orders</span>
          <span className="count-chip">{orders.length}</span>
        </button>
        {STATUS_OPTIONS.map((st) => {
          const count = orders.filter(o => o.status === st).length;
          return (
            <button
              key={st}
              type="button"
              className={`status-filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              <span>{STATUS_BADGE_STYLE[st]?.label || st}</span>
              <span className="count-chip">{count}</span>
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card empty-orders-panel">
          <div className="empty-icon-wrap" style={{ margin: '0 auto 12px auto' }}>
            <ShoppingBag size={28} className="text-muted" />
          </div>
          <h3>No Orders Found</h3>
          <p>
            {statusFilter === 'ALL'
              ? 'No customer has placed an order for your shop yet.'
              : `No customer orders currently match status "${STATUS_BADGE_STYLE[statusFilter]?.label || statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="seller-orders-stack">
          {filteredOrders.map((order) => {
            const badge = STATUS_BADGE_STYLE[order.status] || STATUS_BADGE_STYLE.PLACED;
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={order.id} className="card order-fulfillment-card">
                {/* Header */}
                <div className="order-fulfillment-header">
                  <div className="order-title-group">
                    <span className="order-code">#{order.order_number}</span>
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

                  <div className="order-time-stamp">
                    <Calendar size={13} />
                    <span>Placed {formattedDate}</span>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="order-items-table-wrap">
                  <table className="table-modern items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th style={{ textAlign: 'right' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{item.product_name_snapshot || item.product_name}</strong>
                          </td>
                          <td>{item.quantity}</td>
                          <td>₹{Number(item.price_snapshot || item.unit_price || 0).toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'right' }}>
                            <strong>₹{Number(item.line_total || item.subtotal || 0).toLocaleString('en-IN')}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Info & Status Picker */}
                <div className="order-fulfillment-footer">
                  <div className="customer-delivery-info">
                    <div className="cust-info-row">
                      <User size={13} className="text-emerald" />
                      <strong>{order.delivery_name || 'Verified Customer'}</strong>
                      {order.delivery_phone && <span>• {order.delivery_phone}</span>}
                    </div>
                    <div className="cust-address-row">
                      <MapPin size={13} className="text-emerald" />
                      <span>{order.delivery_address}, {order.delivery_city}</span>
                    </div>
                  </div>

                  <div className="status-update-control-block">
                    <div className="total-display">
                      <span className="total-tag">Order Total:</span>
                      <strong className="total-amount">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="status-selector-wrap">
                      <label className="status-select-label">Update Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updating[order.id]}
                        className="status-dropdown"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_BADGE_STYLE[st]?.label || st}
                          </option>
                        ))}
                      </select>
                      {updating[order.id] && <span className="updating-indicator">Saving...</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .seller-orders-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .orders-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dash-title-main {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .dash-sub-desc {
          font-size: 13.5px;
          color: #64748B;
        }

        /* Filter Tabs */
        .status-tabs-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .status-filter-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          white-space: nowrap;
          transition: var(--transition);
        }
        .status-filter-pill:hover {
          color: #059669;
          border-color: #A7F3D0;
        }
        .status-filter-pill.active {
          background: #059669;
          color: #FFFFFF;
          border-color: #059669;
          box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
        }

        .count-chip {
          background: rgba(15, 23, 42, 0.08);
          font-size: 11px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 10px;
        }
        .status-filter-pill.active .count-chip {
          background: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }

        /* Orders Stack */
        .seller-orders-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-fulfillment-card {
          padding: 24px;
          background: #FFFFFF;
        }

        .order-fulfillment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 16px;
        }

        .order-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-code {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
        }

        .order-time-stamp {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: #64748B;
        }

        .order-items-table-wrap {
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border-color);
          margin-bottom: 18px;
        }

        .items-table th {
          background: #F8FAFC;
          font-size: 11.5px;
          padding: 10px 14px;
        }

        .items-table td {
          padding: 12px 14px;
          font-size: 13.5px;
        }

        /* Footer */
        .order-fulfillment-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 14px;
          border-top: 1px solid #F1F5F9;
        }

        .customer-delivery-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cust-info-row, .cust-address-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #334155;
        }

        .status-update-control-block {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .total-display {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .total-tag {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
        }

        .total-amount {
          font-size: 18px;
          font-weight: 800;
          color: #059669;
        }

        .status-selector-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
        }

        .status-select-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }

        .status-dropdown {
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
          background: #FFFFFF;
          cursor: pointer;
        }

        .updating-indicator {
          font-size: 11px;
          color: #059669;
          font-weight: 600;
        }

        .empty-orders-panel {
          padding: 60px 24px;
          text-align: center;
          background: #FFFFFF;
        }

        @media (max-width: 768px) {
          .order-fulfillment-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .status-update-control-block {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
