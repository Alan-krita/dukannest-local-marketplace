// src/pages/seller/Dashboard.jsx
// Premium Modern Commerce Seller Dashboard matching FluxCart Design System
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import shopService from '../../services/shopService';
import orderService from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowUpRight,
  SlidersHorizontal,
  Edit3,
  PlusCircle,
  Eye,
  RefreshCw,
  Store,
  Calendar,
  MapPin,
  TrendingUp,
  Boxes,
  ArrowRight,
} from 'lucide-react';

const STATUS_STYLE = {
  DELIVERED: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Delivered' },
  SHIPPED: { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', label: 'Shipped' },
  PACKED: { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', label: 'Packed' },
  ACCEPTED: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Accepted' },
  PLACED: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Placed' },
  CANCELLED: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Cancelled' },
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_products: 0,
    active_products: 0,
    total_orders: 0,
    pending_orders: 0,
    total_sales: 0,
    in_stock_products: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
  });
  const [threshold, setThreshold] = useState(5);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = (currThreshold) => {
    return shopService.getDashboard({ low_stock_threshold: currThreshold })
      .then((dash) => {
        if (dash) {
          setShopInfo(dash.shop || null);
          setMetrics({
            total_products: dash.total_products ?? 0,
            active_products: dash.active_products ?? 0,
            total_orders: dash.total_orders ?? 0,
            pending_orders: dash.pending_orders ?? 0,
            total_sales: dash.total_sales ?? 0,
            in_stock_products: dash.in_stock_products ?? 0,
            low_stock_products: dash.low_stock_products ?? 0,
            out_of_stock_products: dash.out_of_stock_products ?? 0,
          });
          setLowStockItems(dash.low_stock_items || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard metrics:', err);
      });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardData(threshold),
      orderService.getSellerOrders().catch(() => null),
    ])
      .then(([_, orders]) => {
        const list = Array.isArray(orders) ? orders : orders?.items || [];
        setRecentOrders(
          list.slice(0, 6).map((o) => ({
            id: o.id,
            order_number: o.order_number,
            customer: o.delivery_name || 'Verified Customer',
            amount: o.total_amount,
            status: o.status,
            date: new Date(o.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleThresholdChange = (newVal) => {
    const val = Math.max(1, parseInt(newVal, 10) || 1);
    setThreshold(val);
    setRefreshing(true);
    fetchDashboardData(val).finally(() => setRefreshing(false));
  };

  if (loading) return <LoadingSpinner text="Loading seller analytics & inventory..." />;

  const formattedSales = Number(metrics.total_sales || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });

  return (
    <div className="modern-dashboard-container">
      {/* 1. Header Banner with Shop Greeting & Quick Action Buttons */}
      <div className="dash-hero-banner">
        <div className="dash-hero-details">
          <div className="shop-avatar-stage">
            <img
              src="/images/shop_candle.jpg"
              alt="Shop Logo"
              className="shop-hero-logo"
            />
            <div className="shop-verified-badge" title="Verified Artisan Shop">
              <CheckCircle2 size={13} strokeWidth={3} />
            </div>
          </div>
          <div>
            <div className="shop-hero-title-row">
              <h1 className="dash-hero-title">{shopInfo?.shop_name || 'My Local Shop'}</h1>
              <span className="shop-locality-pill">
                <MapPin size={12} />
                {shopInfo?.locality ? `${shopInfo.locality}, ${shopInfo.city}` : (shopInfo?.city || 'Local Artisan')}
              </span>
            </div>
            <p className="dash-hero-subtitle">
              Welcome back! Here is your live business overview, order flow, and inventory health.
            </p>
          </div>
        </div>

        <div className="dash-hero-actions">
          <Link to="/seller/products/add" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Add Product</span>
          </Link>
          <Link to="/seller/products" className="btn btn-outline btn-sm">
            <Boxes size={16} />
            <span>Manage Catalog</span>
          </Link>
          {shopInfo?.id && (
            <Link
              to={`/shop/${shopInfo.id}`}
              target="_blank"
              className="btn btn-outline btn-sm hide-mobile"
              title="Preview Customer Storefront"
            >
              <Eye size={16} />
              <span>Public Storefront</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Top Tier Sales & Operations Analytics Cards (FluxCart Style) */}
      <div className="dash-kpi-grid">
        {/* Total Sales */}
        <div className="kpi-card card-kpi-sales">
          <div className="kpi-header">
            <span className="kpi-title">Total Revenue</span>
            <div className="kpi-icon-pill icon-sales">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">₹{formattedSales}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend-pill trend-up">
              <TrendingUp size={12} /> Live
            </span>
            <span className="kpi-subtext">Across completed orders</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Orders</span>
            <div className="kpi-icon-pill icon-orders">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">{metrics.total_orders}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend-pill trend-neutral">
              All Time
            </span>
            <span className="kpi-subtext">{metrics.pending_orders} awaiting fulfillment</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Product Catalog</span>
            <div className="kpi-icon-pill icon-products">
              <Package size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">{metrics.total_products}</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend-pill trend-up">
              {metrics.active_products} Active
            </span>
            <span className="kpi-subtext">Listed in public catalog</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pending Orders</span>
            <div className="kpi-icon-pill icon-pending">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-main-val">{metrics.pending_orders}</span>
          </div>
          <div className="kpi-footer">
            <span className={`kpi-trend-pill ${metrics.pending_orders > 0 ? 'trend-alert' : 'trend-neutral'}`}>
              Needs Action
            </span>
            <Link to="/seller/orders" className="kpi-action-link">
              View Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Smart Inventory Management Suite */}
      <div className="inventory-suite-card card">
        <div className="inventory-suite-header">
          <div>
            <div className="inventory-title-line">
              <Boxes size={20} className="icon-emerald" />
              <h2 className="suite-title">Smart Inventory & Health Monitoring</h2>
            </div>
            <p className="suite-subtitle">
              Automated stock categorization, threshold monitoring, and fulfillment alerts.
            </p>
          </div>

          {/* Threshold Control */}
          <div className="threshold-control-box">
            <label htmlFor="threshold-dropdown" className="threshold-label">
              <SlidersHorizontal size={14} />
              <span>Low-Stock Alert Level:</span>
            </label>
            <select
              id="threshold-dropdown"
              value={threshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="threshold-select"
              disabled={refreshing}
            >
              <option value="3">≤ 3 Units</option>
              <option value="5">≤ 5 Units (Default)</option>
              <option value="10">≤ 10 Units</option>
              <option value="15">≤ 15 Units</option>
              <option value="20">≤ 20 Units</option>
            </select>
            {refreshing && <RefreshCw size={14} className="spin-icon text-emerald" />}
          </div>
        </div>

        {/* 4 Inventory Summary Cards */}
        <div className="inventory-summary-cards">
          <div className="inv-stat-card">
            <span className="inv-stat-num">{metrics.total_products}</span>
            <span className="inv-stat-tag">Total Products</span>
          </div>

          <div className="inv-stat-card inv-card-healthy">
            <div className="inv-stat-top">
              <span className="inv-stat-num text-emerald">{metrics.in_stock_products}</span>
              <CheckCircle2 size={16} className="text-emerald" />
            </div>
            <span className="inv-stat-tag">In Stock (&gt; {threshold} units)</span>
          </div>

          <div className={`inv-stat-card ${metrics.low_stock_products > 0 ? 'inv-card-warning' : ''}`}>
            <div className="inv-stat-top">
              <span className="inv-stat-num text-amber">{metrics.low_stock_products}</span>
              <AlertTriangle size={16} className="text-amber" />
            </div>
            <span className="inv-stat-tag">Low Stock (1 - {threshold} units)</span>
          </div>

          <div className={`inv-stat-card ${metrics.out_of_stock_products > 0 ? 'inv-card-danger' : ''}`}>
            <div className="inv-stat-top">
              <span className="inv-stat-num text-rose">{metrics.out_of_stock_products}</span>
              <AlertOctagon size={16} className="text-rose" />
            </div>
            <span className="inv-stat-tag">Out of Stock (0 units)</span>
          </div>
        </div>

        {/* Critical Stock Alert Banner if any exist */}
        {metrics.out_of_stock_products > 0 && (
          <div className="critical-stock-alert-bar">
            <AlertOctagon size={18} className="critical-alert-icon" />
            <div className="critical-alert-content">
              <strong>Action Required:</strong> {metrics.out_of_stock_products} product(s) are completely out of stock. These items cannot be purchased by shoppers on the marketplace until restocked.
            </div>
          </div>
        )}

        {/* Low Stock Alerts Table */}
        <div className="inventory-alerts-stage">
          <div className="alerts-subhead">
            <h3 className="alerts-title">
              Attention Queue
              {lowStockItems.length > 0 && (
                <span className="alerts-count-pill">{lowStockItems.length}</span>
              )}
            </h3>
            <span className="alerts-hint">Products requiring immediate inventory replenishment</span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="healthy-empty-state">
              <div className="healthy-icon-circle">
                <CheckCircle2 size={32} className="text-emerald" />
              </div>
              <h4 className="healthy-title">All Inventory Is Healthy!</h4>
              <p className="healthy-desc">
                Every active product in your shop has more than {threshold} units available. Shoppers can order smoothly without stock interruption.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Available Stock</th>
                    <th>Inventory Status</th>
                    <th style={{ textAlign: 'right' }}>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((prod) => {
                    const isOutOfStock = prod.stock_quantity === 0;
                    return (
                      <tr key={prod.id} className={isOutOfStock ? 'tr-out-of-stock' : 'tr-low-stock'}>
                        <td>
                          <div className="table-prod-info">
                            <img
                              src={prod.image_url || '/images/product_candle.jpg'}
                              alt={prod.name}
                              className="table-prod-img"
                              onError={(e) => { e.target.src = '/images/product_candle.jpg'; }}
                            />
                            <div>
                              <div className="table-prod-name">{prod.name}</div>
                              {prod.sku && <span className="table-prod-sku">SKU: {prod.sku}</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>₹{Number(prod.price).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className={`stock-level-pill ${isOutOfStock ? 'pill-danger' : 'pill-warning'}`}>
                            {prod.stock_quantity} units
                          </span>
                        </td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge badge-rose">
                              <AlertOctagon size={12} /> Out of Stock
                            </span>
                          ) : (
                            <span className="badge badge-amber">
                              <AlertTriangle size={12} /> Low Stock ({prod.stock_quantity} left)
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/seller/products/edit/${prod.id}`}
                            className="btn btn-sm btn-outline btn-edit-stock"
                          >
                            <Edit3 size={13} />
                            <span>Edit Stock</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Incoming Customer Orders (FluxCart Table Style) */}
      <div className="recent-orders-suite card">
        <div className="recent-orders-header">
          <div>
            <h2 className="suite-title">Recent Customer Orders</h2>
            <p className="suite-subtitle">Latest orders received for your artisan shop</p>
          </div>
          <Link to="/seller/orders" className="view-all-link">
            <span>View All Orders</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Order Value</th>
                <th>Fulfillment Status</th>
                <th>Order Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                    No customer orders received yet. Once customers place orders, they will appear here.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => {
                  const style = STATUS_STYLE[ord.status] || STATUS_STYLE.PLACED;
                  return (
                    <tr key={ord.id}>
                      <td>
                        <strong>#{ord.order_number}</strong>
                      </td>
                      <td>
                        <span className="customer-name-text">{ord.customer}</span>
                      </td>
                      <td>
                        <strong>₹{Number(ord.amount || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: style.bg,
                            color: style.color,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td style={{ color: '#64748B' }}>{ord.date}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to="/seller/orders" className="btn btn-sm btn-outline">
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .modern-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* 1. Hero Greeting Banner */
        .dash-hero-banner {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-sm);
        }

        .dash-hero-details {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .shop-avatar-stage {
          position: relative;
          width: 58px;
          height: 58px;
          flex-shrink: 0;
        }

        .shop-hero-logo {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          object-fit: cover;
          border: 1px solid #E2E8F0;
        }

        .shop-verified-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: #059669;
          color: #FFFFFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
        }

        .shop-hero-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .dash-hero-title {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .shop-locality-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .dash-hero-subtitle {
          font-size: 13.5px;
          color: #64748B;
        }

        .dash-hero-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* 2. KPI Analytics Cards Grid (FluxCart Style) */
        .dash-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .kpi-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: var(--radius-md);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-title {
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .kpi-icon-pill {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-sales { background: #ECFDF5; color: #059669; }
        .icon-orders { background: #F0F9FF; color: #0284C7; }
        .icon-products { background: #F5F3FF; color: #7C3AED; }
        .icon-pending { background: #FFFBEB; color: #D97706; }

        .kpi-main-val {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          margin-top: 4px;
        }

        .kpi-trend-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .trend-up { background: #ECFDF5; color: #059669; }
        .trend-neutral { background: #F1F5F9; color: #475569; }
        .trend-alert { background: #FEF2F2; color: #DC2626; }

        .kpi-subtext {
          color: #64748B;
        }

        .kpi-action-link {
          margin-left: auto;
          color: #059669;
          font-weight: 700;
        }

        /* 3. Inventory Suite Card */
        .inventory-suite-card {
          padding: 26px;
          background: #FFFFFF;
        }

        .inventory-suite-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 22px;
        }

        .inventory-title-line {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .suite-title {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
        }

        .suite-subtitle {
          font-size: 13px;
          color: #64748B;
        }

        .icon-emerald {
          color: #059669;
        }

        .threshold-control-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 6px 14px;
          border-radius: 10px;
        }

        .threshold-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .threshold-select {
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
          background: #FFFFFF;
          cursor: pointer;
        }

        .threshold-select:focus {
          border-color: #059669;
        }

        .spin-icon {
          animation: spin 0.8s linear infinite;
        }

        /* 4 Inventory Cards Grid */
        .inventory-summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .inv-stat-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .inv-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .inv-stat-num {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
        }

        .inv-stat-tag {
          font-size: 12px;
          font-weight: 600;
          color: #64748B;
        }

        .inv-card-healthy {
          border-color: #A7F3D0;
          background: #F6FEF9;
        }

        .inv-card-warning {
          border-color: #FDE68A;
          background: #FFFDF5;
        }

        .inv-card-danger {
          border-color: #FECACA;
          background: #FFF5F5;
        }

        .text-emerald { color: #059669; }
        .text-amber { color: #D97706; }
        .text-rose { color: #DC2626; }

        /* Critical Stock Banner */
        .critical-stock-alert-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          padding: 12px 18px;
          color: #991B1B;
          margin-bottom: 20px;
          font-size: 13.5px;
          line-height: 1.4;
        }

        .critical-alert-icon {
          flex-shrink: 0;
          color: #DC2626;
        }

        /* Attention Queue Subheader */
        .alerts-subhead {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .alerts-title {
          font-size: 14.5px;
          font-weight: 800;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .alerts-count-pill {
          background: #DC2626;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 12px;
        }

        .alerts-hint {
          font-size: 12.5px;
          color: #64748B;
        }

        /* Healthy Empty State */
        .healthy-empty-state {
          padding: 40px 24px;
          text-align: center;
          background: #F8FAFC;
          border: 1px dashed #CBD5E1;
          border-radius: 12px;
        }

        .healthy-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px auto;
        }

        .healthy-title {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 4px;
        }

        .healthy-desc {
          font-size: 13px;
          color: #64748B;
          max-width: 480px;
          margin: 0 auto;
        }

        /* Table custom cells */
        .table-prod-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .table-prod-img {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #E2E8F0;
        }

        .table-prod-name {
          font-weight: 700;
          color: #0F172A;
        }

        .table-prod-sku {
          font-size: 11.5px;
          color: #64748B;
        }

        .stock-level-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12.5px;
        }

        .pill-danger { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
        .pill-warning { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }

        .tr-out-of-stock td { background: #FFF8F8; }
        .btn-edit-stock:hover {
          border-color: #059669;
          color: #059669;
          background: #ECFDF5;
        }

        /* 4. Recent Orders Suite */
        .recent-orders-suite {
          padding: 26px;
          background: #FFFFFF;
        }

        .recent-orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #059669;
        }
        .view-all-link:hover {
          color: #047857;
          gap: 8px;
        }

        .customer-name-text {
          font-weight: 600;
          color: #1E293B;
        }

        /* Responsive */
        @media (max-width: 1120px) {
          .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .inventory-summary-cards { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 860px) {
          .dash-hero-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .dash-hero-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 560px) {
          .dash-kpi-grid { grid-template-columns: 1fr; }
          .inventory-summary-cards { grid-template-columns: 1fr; }
          .inventory-suite-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
