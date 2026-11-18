// src/components/Navbar.jsx
// Premium Refined Artisan Marketplace Header & Navigation
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomerSidebar from './CustomerSidebar';
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  Store,
  ChevronDown,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout, isCustomer, isSeller } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="site-header-refined">
        {/* Subtle Top Strip */}
        <div className="header-top-strip">
          <div className="container strip-inner">
            <div className="strip-message">
              <Sparkles size={12} className="text-emerald" />
              <span>Direct from verified Indian neighborhood artisans and independent creators.</span>
            </div>
            <div className="strip-meta hide-mobile">
              <span className="strip-location">
                <MapPin size={12} className="text-emerald" />
                <span>Serving Mathura &amp; NCR</span>
              </span>
              <span className="strip-divider">•</span>
              {!isSeller && (
                <Link to="/choose-role" className="strip-seller-cta">
                  Sell on DukanNest <ArrowRight size={11} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="navbar-main-row">
          <div className="container navbar-flex-layout">
            {/* Left Cluster: Menu Drawer Button + Brand Logo */}
            <div className="nav-left-group">
              <button
                type="button"
                className="nav-explore-btn"
                onClick={() => setSidebarOpen(true)}
                title="Browse Categories & Shops"
                aria-label="Open Navigation Menu"
              >
                <Menu size={18} />
                <span className="explore-label hide-mobile">Explore</span>
              </button>

              <Link to="/" className="brand-logo-link">
                <div className="brand-leaf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21C12 21 4 17 4 10C4 6.5 6.5 4 10 4C14 4 15 8 15 8C15 8 16 4 20 4C23.5 4 26 6.5 26 10C26 17 18 21 18 21"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform="scale(0.8) translate(-1, 0)"
                    />
                    <path d="M12 21V11" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="brand-titles">
                  <span className="brand-main-text">DukanNest</span>
                  <span className="brand-sub-text">Where Local Shops Feel at Home</span>
                </div>
              </Link>
            </div>

            {/* Proportional Center Search */}
            <form onSubmit={handleSearch} className="nav-search-bar">
              <div className="search-field-wrapper">
                <Search size={15} className="search-lead-icon" />
                <input
                  type="text"
                  placeholder="Search handmade pottery, soy candles, organic pantry..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input-box"
                />
              </div>
              <button type="submit" className="search-action-btn">
                Search
              </button>
            </form>

            {/* Right Action Cluster */}
            <div className="nav-right-group">
              {/* Explore Catalog link */}
              <Link to="/products" className="nav-text-link hide-mobile">
                <Compass size={16} />
                <span>Catalog</span>
              </Link>

              {/* Seller portal link if seller */}
              {isSeller && (
                <Link to="/seller/dashboard" className="nav-seller-portal-pill hide-mobile">
                  <Store size={15} />
                  <span>Seller Portal</span>
                </Link>
              )}

              {/* Shopping Cart Button */}
              {(!isAuthenticated || isCustomer) && (
                <Link to="/cart" className="nav-cart-trigger" title="Shopping Cart">
                  <div className="cart-badge-wrapper">
                    <ShoppingBag size={18} />
                    {cartCount > 0 && (
                      <span className="cart-count-pill">{cartCount}</span>
                    )}
                  </div>
                  <span className="cart-text hide-mobile">Cart</span>
                </Link>
              )}

              {/* User Account / Auth Dropdown */}
              {isAuthenticated ? (
                <div className="nav-account-dropdown" ref={userRef}>
                  <button
                    type="button"
                    className="account-trigger-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="user-avatar-initial">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="user-name-short hide-mobile">
                      {user?.full_name ? user.full_name.split(' ')[0] : 'Account'}
                    </span>
                    <ChevronDown size={13} className="account-chevron" />
                  </button>

                  {userDropdownOpen && (
                    <div className="account-dropdown-card">
                      <div className="dropdown-profile-header">
                        <strong className="profile-name">{user?.full_name}</strong>
                        <span className="profile-email">{user?.email}</span>
                        <span className="profile-role-badge">
                          {isSeller ? 'Verified Seller' : 'Shopper Account'}
                        </span>
                      </div>

                      <div className="dropdown-divider-line" />

                      {isCustomer && (
                        <>
                          <Link
                            to="/orders"
                            className="dropdown-nav-row"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <PackageCheck size={15} />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            to="/cart"
                            className="dropdown-nav-row"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <ShoppingBag size={15} />
                            <span>My Cart ({cartCount})</span>
                          </Link>
                        </>
                      )}

                      {isSeller && (
                        <Link
                          to="/seller/dashboard"
                          className="dropdown-nav-row"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={15} />
                          <span>Seller Dashboard</span>
                        </Link>
                      )}

                      <div className="dropdown-divider-line" />

                      <button
                        type="button"
                        className="dropdown-nav-row logout-row"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="nav-auth-actions">
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Log In
                  </Link>
                  <Link to="/choose-role" className="btn btn-primary btn-sm hide-mobile">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style>{`
        .site-header-refined {
          position: sticky;
          top: 0;
          z-index: 500;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0;
        }

        /* Subtle Top Strip */
        .header-top-strip {
          background: #F4F7F5;
          border-bottom: 1px solid #E6EDE8;
          font-size: 11.5px;
          color: #475569;
          padding: 5px 0;
        }
        .strip-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .strip-message {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }
        .strip-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .strip-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #64748B;
        }
        .strip-divider {
          color: #CBD5E1;
        }
        .strip-seller-cta {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #059669;
          font-weight: 600;
          text-decoration: none;
        }
        .strip-seller-cta:hover {
          text-decoration: underline;
        }

        /* Main Navbar Row */
        .navbar-main-row {
          padding: 10px 0;
        }
        .navbar-flex-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* Left cluster */
        .nav-left-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-explore-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          color: #0F172A;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .nav-explore-btn:hover {
          background: #ECFDF5;
          border-color: #A7F3D0;
          color: #059669;
        }
        .explore-label {
          font-size: 12.5px;
        }

        .brand-logo-link {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }
        .brand-leaf-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-titles {
          display: flex;
          flex-direction: column;
        }
        .brand-main-text {
          font-size: 18px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          line-height: 1.1;
        }
        .brand-sub-text {
          font-size: 10px;
          color: #059669;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* Center search */
        .nav-search-bar {
          flex: 1;
          max-width: 480px;
          display: flex;
          align-items: center;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 2px 2px 2px 12px;
          transition: all 0.15s ease;
        }
        .nav-search-bar:focus-within {
          border-color: #059669;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }
        .search-field-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .search-lead-icon {
          color: #94A3B8;
          flex-shrink: 0;
        }
        .search-input-box {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 13px;
          color: #0F172A;
          outline: none;
        }
        .search-input-box::placeholder {
          color: #94A3B8;
        }
        .search-action-btn {
          background: #059669;
          color: #FFFFFF;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .search-action-btn:hover {
          background: #047857;
        }

        /* Right cluster */
        .nav-right-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-text-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .nav-text-link:hover {
          background: #F1F5F9;
          color: #0F172A;
        }

        .nav-seller-portal-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 600;
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .nav-seller-portal-pill:hover {
          background: #059669;
          color: #FFFFFF;
          border-color: #059669;
        }

        .nav-cart-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          color: #0F172A;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .nav-cart-trigger:hover {
          background: #F1F5F9;
        }
        .cart-badge-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-count-pill {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #059669;
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 700;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
        }
        .cart-text {
          font-size: 13px;
          font-weight: 600;
        }

        /* Account Dropdown */
        .nav-account-dropdown {
          position: relative;
        }
        .account-trigger-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 8px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .account-trigger-btn:hover {
          background: #F1F5F9;
        }
        .user-avatar-initial {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #059669;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-name-short {
          font-size: 13px;
          font-weight: 600;
          color: #0F172A;
        }
        .account-chevron {
          color: #64748B;
        }

        .account-dropdown-card {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          box-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.1);
          padding: 8px;
          z-index: 600;
        }
        .dropdown-profile-header {
          padding: 8px 10px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .profile-name {
          font-size: 13.5px;
          color: #0F172A;
        }
        .profile-email {
          font-size: 11.5px;
          color: #64748B;
          word-break: break-all;
        }
        .profile-role-badge {
          display: inline-block;
          margin-top: 6px;
          font-size: 10.5px;
          font-weight: 600;
          color: #059669;
          background: #ECFDF5;
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }
        .dropdown-divider-line {
          height: 1px;
          background: #F1F5F9;
          margin: 4px 0;
        }
        .dropdown-nav-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 13px;
          color: #334155;
          text-decoration: none;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
        }
        .dropdown-nav-row:hover {
          background: #F8FAFC;
          color: #059669;
        }
        .logout-row {
          color: #DC2626;
          border: none;
          background: none;
          cursor: pointer;
        }
        .logout-row:hover {
          background: #FEF2F2;
          color: #DC2626;
        }

        .nav-auth-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 860px) {
          .nav-search-bar {
            max-width: 280px;
          }
          .hide-mobile {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .nav-search-bar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
