// src/layouts/SellerLayout.jsx
// Professional Seller Admin Panel Layout matching FluxCart Modern Commerce Design
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  SlidersHorizontal,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const MAIN_NAV = [
  { path: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/seller/products', label: 'Products', icon: Package },
  { path: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/seller/shop', label: 'My Shop', icon: Store },
];

const ADMIN_NAV = [
  { path: '/seller/onboarding', label: 'Setup Guide', icon: SlidersHorizontal },
];

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topSearch, setTopSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTopSearch = (e) => {
    e.preventDefault();
    if (topSearch.trim()) {
      navigate(`/seller/products?search=${encodeURIComponent(topSearch.trim())}`);
    }
  };

  return (
    <div className={`seller-admin-wrapper ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Dark Sleek Slate Sidebar */}
      <aside className={`seller-admin-sidebar ${mobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="admin-brand-header">
          <Link to="/seller/dashboard" className="brand-logo-link">
            <div className="leaf-admin-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 21C12 21 4 17 4 10C4 6.5 6.5 4 10 4C14 4 15 8 15 8C15 8 16 4 20 4C23.5 4 26 6.5 26 10C26 17 18 21 18 21" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform="scale(0.8) translate(-1, 0)"/>
                <path d="M12 21V11" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="brand-text-block">
                <span className="admin-brand-text">DukanNest</span>
                <span className="admin-brand-sub">Seller Hub</span>
              </div>
            )}
          </Link>

          {/* Mobile close toggle */}
          <button
            type="button"
            className="mobile-close-btn hide-desktop"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="admin-nav-scroll">
          {/* Main Menu Group */}
          <div className="nav-group-section">
            {!isCollapsed && <span className="nav-section-title">MAIN MENU</span>}
            <nav className="admin-nav-links">
              {MAIN_NAV.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/seller/products' && location.pathname.startsWith('/seller/products'));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-nav-row ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <IconComponent size={19} className="admin-nav-icon" />
                    {!isCollapsed && <span className="admin-nav-label">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin / Setup Group */}
          <div className="nav-group-section">
            {!isCollapsed && <span className="nav-section-title">PREFERENCES</span>}
            <nav className="admin-nav-links">
              {ADMIN_NAV.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`admin-nav-row ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <IconComponent size={19} className="admin-nav-icon" />
                    {!isCollapsed && <span className="admin-nav-label">{item.label}</span>}
                  </Link>
                );
              })}

              <Link
                to="/"
                target="_blank"
                className="admin-nav-row"
                title="Customer Storefront"
              >
                <ExternalLink size={19} className="admin-nav-icon" />
                {!isCollapsed && <span className="admin-nav-label">View Marketplace</span>}
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="admin-sidebar-footer">
          {/* Collapse/Expand Toggle on Desktop */}
          <button
            type="button"
            className="admin-collapse-toggle-btn hide-mobile"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span className="toggle-label">Collapse Menu</span>}
          </button>

          <button
            type="button"
            className="admin-logout-row"
            onClick={handleLogout}
            title="Sign out of seller account"
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Backdrop shade for mobile drawer */}
      {mobileOpen && (
        <div
          className="sidebar-shade"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Container */}
      <div className="seller-admin-main">
        {/* Sleek Topbar */}
        <header className="seller-admin-topbar">
          <div className="topbar-left-controls">
            <button
              type="button"
              className="sidebar-open-close-btn"
              onClick={() => {
                if (window.innerWidth <= 860) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              title="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>

            {/* Quick search input */}
            <form onSubmit={handleTopSearch} className="topbar-search-form hide-mobile">
              <Search size={16} className="topbar-search-icon" />
              <input
                type="text"
                placeholder="Search products, orders, inventory..."
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                className="topbar-search-input"
              />
            </form>
          </div>

          <div className="topbar-right-controls">
            <div className="live-store-chip hide-mobile">
              <span className="live-pulse-dot" />
              <span className="live-store-text">Live Store</span>
            </div>

            <Link
              to="/seller/orders"
              className="topbar-icon-btn"
              title="Incoming Orders"
            >
              <Bell size={18} />
            </Link>

            {/* User Profile Pill */}
            <div className="topbar-profile-pill">
              <div className="profile-avatar-circle">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="profile-text-col hide-mobile">
                <span className="profile-name-line">{user?.full_name || 'Seller Partner'}</span>
                <span className="profile-role-sub">Artisan Merchant</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="seller-admin-body">
          <Outlet />
        </main>
      </div>

      <style>{`
        .seller-admin-wrapper {
          display: flex;
          min-height: 100vh;
          background: #F8FAFC;
          color: #0F172A;
          font-family: var(--font-sans);
        }

        /* Dark Slate Sidebar (FluxCart Style) */
        .seller-admin-sidebar {
          width: 256px;
          background: #0F172A; /* Deep Navy Charcoal */
          color: #94A3B8;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 1000;
          border-right: 1px solid #1E293B;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s ease;
          overflow: hidden;
        }

        .seller-admin-sidebar.collapsed {
          width: 76px;
        }

        .admin-brand-header {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid #1E293B;
          flex-shrink: 0;
        }

        .brand-logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }

        .leaf-admin-logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .brand-text-block {
          display: flex;
          flex-direction: column;
        }

        .admin-brand-text {
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.02em;
        }

        .admin-brand-sub {
          font-size: 11px;
          color: #10B981;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .mobile-close-btn {
          color: #94A3B8;
          padding: 6px;
          border-radius: 6px;
        }
        .mobile-close-btn:hover {
          color: #FFFFFF;
          background: #1E293B;
        }

        .admin-nav-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px 14px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-nav-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .admin-nav-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }

        .nav-group-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #64748B;
          padding: 0 12px 6px 12px;
          text-transform: uppercase;
        }

        .admin-nav-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-nav-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #94A3B8;
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.18s ease;
          position: relative;
        }

        .admin-nav-row:hover {
          color: #FFFFFF;
          background: #1E293B;
        }

        .admin-nav-row.active {
          color: #FFFFFF;
          background: #10B981; /* Fresh Emerald Green */
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
        }

        .admin-nav-icon {
          flex-shrink: 0;
        }

        .admin-nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-sidebar-footer {
          padding: 14px;
          border-top: 1px solid #1E293B;
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #0B1329;
        }

        .admin-collapse-toggle-btn, .admin-logout-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #94A3B8;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
        }

        .admin-collapse-toggle-btn:hover {
          color: #FFFFFF;
          background: #1E293B;
        }

        .admin-logout-row:hover {
          color: #F87171;
          background: rgba(239, 68, 68, 0.12);
        }

        /* Main Area */
        .seller-admin-main {
          flex: 1;
          margin-left: 256px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-is-collapsed .seller-admin-main {
          margin-left: 76px;
        }

        /* Topbar */
        .seller-admin-topbar {
          height: 70px;
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
        }

        .topbar-left-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sidebar-open-close-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-open-close-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
          border-color: #CBD5E1;
        }

        .topbar-search-form {
          position: relative;
          display: flex;
          align-items: center;
          width: 320px;
        }

        .topbar-search-icon {
          position: absolute;
          left: 12px;
          color: #94A3B8;
          pointer-events: none;
        }

        .topbar-search-input {
          width: 100%;
          padding: 8px 14px 8px 36px;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          background: #F8FAFC;
          font-size: 13px;
          color: #0F172A;
          transition: all 0.2s ease;
        }

        .topbar-search-input:focus {
          background: #FFFFFF;
          border-color: #10B981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
        }

        .topbar-right-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .live-store-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 5px 12px;
          border-radius: 20px;
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .live-store-text {
          font-size: 12px;
          font-weight: 700;
          color: #065F46;
        }

        .topbar-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .topbar-icon-btn:hover {
          color: #059669;
          background: #ECFDF5;
          border-color: #A7F3D0;
        }

        .topbar-profile-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 10px 4px 4px;
          border-radius: 30px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }

        .profile-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #10B981;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
        }

        .profile-text-col {
          display: flex;
          flex-direction: column;
        }

        .profile-name-line {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.2;
        }

        .profile-role-sub {
          font-size: 11px;
          color: #64748B;
        }

        .seller-admin-body {
          flex: 1;
          padding: 28px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .sidebar-shade {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(2px);
          z-index: 999;
        }

        /* Responsive Breakpoints */
        @media (max-width: 860px) {
          .seller-admin-sidebar {
            transform: translateX(-100%);
            width: 256px !important;
          }
          .seller-admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          .seller-admin-main {
            margin-left: 0 !important;
          }
          .seller-admin-topbar {
            padding: 0 16px;
          }
          .seller-admin-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
