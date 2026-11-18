// src/components/CustomerSidebar.jsx
// Professional Off-Canvas Customer Drawer Navigation
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  X,
  ShoppingBag,
  Store,
  Compass,
  Heart,
  User,
  LogIn,
  LogOut,
  MapPin,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

const SIDEBAR_CATEGORIES = [
  { name: 'Food & Gourmet', slug: 'food' },
  { name: 'Handmade Crafts', slug: 'handmade' },
  { name: 'Home & Living', slug: 'home-decor' },
  { name: 'Clothing & Apparel', slug: 'clothing' },
  { name: 'Jewelry & Accessories', slug: 'accessories' },
  { name: 'Stationery & Gifts', slug: 'stationery' },
];

const POPULAR_LOCAL_SHOPS = [
  { id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365', name: 'The Candle Co.', category: 'Handmade Candles', city: 'Mathura', image: '/images/shop_candle.jpg' },
  { id: 'shop-2', name: 'Green Basket', category: 'Organic Goods', city: 'Mathura', image: '/images/shop_green_basket.jpg' },
  { id: 'shop-3', name: "Aarav's Kitchen", category: 'Bakery & Sweets', city: 'Mathura', image: '/images/shop_kitchen.jpg' },
  { id: 'shop-4', name: 'Craft Corner', category: 'Pottery & Ceramics', city: 'Mathura', image: '/images/shop_craft_corner.jpg' },
];

export default function CustomerSidebar({ isOpen, onClose }) {
  const { isAuthenticated, user, logout, isCustomer, isSeller } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCategoryClick = (slug) => {
    onClose();
    navigate(`/products?category=${slug}`);
  };

  const handleShopClick = (shopId) => {
    onClose();
    navigate(`/shop/${shopId}`);
  };

  const handleNavClick = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="customer-sidebar-overlay" onClick={onClose}>
      <aside
        className="customer-sidebar-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cust-sidebar-header">
          <Link to="/" className="cust-sidebar-brand" onClick={onClose}>
            <div className="cust-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21C12 21 4 17 4 10C4 6.5 6.5 4 10 4C14 4 15 8 15 8C15 8 16 4 20 4C23.5 4 26 6.5 26 10C26 17 18 21 18 21"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="scale(0.8) translate(-1, 0)"
                />
                <path d="M12 21V11" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="cust-brand-title">DukanNest</div>
              <div className="cust-brand-tagline">Where Local Shops Feel at Home</div>
            </div>
          </Link>
          <button
            type="button"
            className="cust-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="cust-sidebar-user-section">
          {isAuthenticated ? (
            <div className="cust-user-badge-card">
              <div className="cust-user-avatar">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="cust-user-meta">
                <div className="cust-user-name">{user?.full_name}</div>
                <div className="cust-user-email">{user?.email}</div>
                <span className="badge badge-emerald" style={{ marginTop: '4px' }}>
                  <ShieldCheck size={12} />
                  {isSeller ? 'Seller Account' : 'Verified Shopper'}
                </span>
              </div>
            </div>
          ) : (
            <div className="cust-guest-card">
              <p className="cust-guest-title">Welcome to DukanNest</p>
              <p className="cust-guest-sub">Discover and support verified local sellers in your area.</p>
              <div className="cust-guest-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleNavClick('/login')}
                >
                  <LogIn size={14} /> Login
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleNavClick('/choose-role')}
                >
                  Join DukanNest
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Nav Links */}
        <div className="cust-sidebar-scroll">
          <div className="cust-section-block">
            <span className="cust-section-title">NAVIGATION</span>
            <div className="cust-links-col">
              <button
                type="button"
                className="cust-nav-btn"
                onClick={() => handleNavClick('/products')}
              >
                <Compass size={17} className="cust-icon" />
                <span>Explore All Products</span>
                <ChevronRight size={15} className="cust-arr" />
              </button>

              {isCustomer && (
                <>
                  <button
                    type="button"
                    className="cust-nav-btn"
                    onClick={() => handleNavClick('/cart')}
                  >
                    <ShoppingBag size={17} className="cust-icon" />
                    <span>My Shopping Cart</span>
                    {cartCount > 0 && <span className="cust-pill-num">{cartCount}</span>}
                  </button>
                  <button
                    type="button"
                    className="cust-nav-btn"
                    onClick={() => handleNavClick('/orders')}
                  >
                    <PackageCheck size={17} className="cust-icon" />
                    <span>My Orders &amp; Receipts</span>
                    <ChevronRight size={15} className="cust-arr" />
                  </button>
                </>
              )}

              {isSeller && (
                <button
                  type="button"
                  className="cust-nav-btn cust-seller-highlight"
                  onClick={() => handleNavClick('/seller/dashboard')}
                >
                  <LayoutDashboard size={17} className="cust-icon" />
                  <span>Seller Dashboard</span>
                  <ChevronRight size={15} className="cust-arr" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="cust-section-block">
            <span className="cust-section-title">BROWSE CATEGORIES</span>
            <div className="cust-cat-grid">
              {SIDEBAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  className="cust-cat-pill"
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Local Shops */}
          <div className="cust-section-block">
            <span className="cust-section-title">FEATURED LOCAL SHOPS</span>
            <div className="cust-shops-list">
              {POPULAR_LOCAL_SHOPS.map((shop) => (
                <div
                  key={shop.id}
                  className="cust-shop-row"
                  onClick={() => handleShopClick(shop.id)}
                >
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="cust-shop-thumb"
                    onError={(e) => { e.target.src = '/images/shop_candle.jpg'; }}
                  />
                  <div className="cust-shop-meta">
                    <span className="cust-shop-title">{shop.name}</span>
                    <span className="cust-shop-cat">{shop.category} • {shop.city}</span>
                  </div>
                  <ChevronRight size={15} className="cust-arr" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        {isAuthenticated && (
          <div className="cust-sidebar-footer">
            <button
              type="button"
              className="cust-logout-btn"
              onClick={() => {
                logout();
                onClose();
                navigate('/');
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      <style>{`
        .customer-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(3px);
          z-index: 2000;
          display: flex;
          justify-content: flex-start;
          animation: fadeIn 0.2s ease-out;
        }

        .customer-sidebar-panel {
          width: 320px;
          max-width: 85vw;
          height: 100%;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-dropdown);
          animation: slideRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .cust-sidebar-header {
          padding: 18px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cust-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cust-brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ECFDF5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cust-brand-title {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.1;
        }

        .cust-brand-tagline {
          font-size: 10.5px;
          color: #059669;
          font-weight: 700;
        }

        .cust-sidebar-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cust-sidebar-close-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
        }

        .cust-sidebar-user-section {
          padding: 16px 20px;
          background: #F8FAFC;
          border-bottom: 1px solid var(--border-color);
        }

        .cust-user-badge-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cust-user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #10B981;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          flex-shrink: 0;
        }

        .cust-user-name {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
        }

        .cust-user-email {
          font-size: 12px;
          color: #64748B;
        }

        .cust-guest-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 2px;
        }

        .cust-guest-sub {
          font-size: 12px;
          color: #64748B;
          margin-bottom: 12px;
        }

        .cust-guest-actions {
          display: flex;
          gap: 8px;
        }

        .cust-sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .cust-section-title {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #64748B;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .cust-links-col {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cust-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          width: 100%;
          text-align: left;
          transition: var(--transition);
        }
        .cust-nav-btn:hover {
          background: #F1F5F9;
          color: #059669;
        }

        .cust-nav-btn .cust-icon {
          color: #64748B;
        }
        .cust-nav-btn:hover .cust-icon {
          color: #059669;
        }

        .cust-arr {
          margin-left: auto;
          color: #94A3B8;
        }

        .cust-pill-num {
          margin-left: auto;
          background: #059669;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 10px;
        }

        .cust-seller-highlight {
          background: #ECFDF5;
          color: #047857;
        }

        .cust-cat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .cust-cat-pill {
          padding: 8px 10px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          text-align: center;
        }
        .cust-cat-pill:hover {
          border-color: #059669;
          color: #059669;
          background: #ECFDF5;
        }

        .cust-shops-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cust-shop-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: var(--transition);
        }
        .cust-shop-row:hover {
          border-color: #A7F3D0;
          background: #F8FAFC;
        }

        .cust-shop-thumb {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .cust-shop-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .cust-shop-title {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cust-shop-cat {
          font-size: 11px;
          color: #64748B;
        }

        .cust-sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          background: #F8FAFC;
        }

        .cust-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #DC2626;
          font-size: 13px;
          font-weight: 700;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .cust-logout-btn:hover {
          background: #FEF2F2;
        }
      `}</style>
    </div>
  );
}
