// src/components/Footer.jsx
// Premium Refined Marketplace Footer
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  Store,
  MapPin,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer-refined">
      {/* Trust & Guarantee Highlights Bar */}
      <div className="footer-trust-strip">
        <div className="container">
          <div className="trust-features-grid">
            <div className="trust-item">
              <div className="trust-icon-box">
                <Store size={18} className="text-emerald" />
              </div>
              <div className="trust-text">
                <strong>100% Verified Local Sellers</strong>
                <span>Supporting genuine neighborhood artisans</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <Truck size={18} className="text-emerald" />
              </div>
              <div className="trust-text">
                <strong>Hyperlocal Fulfillment</strong>
                <span>Dispatched directly from nearby workshops</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <ShieldCheck size={18} className="text-emerald" />
              </div>
              <div className="trust-text">
                <strong>Cash on Delivery &amp; UPI</strong>
                <span>Flexible payment options at checkout</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <HeartHandshake size={18} className="text-emerald" />
              </div>
              <div className="trust-text">
                <strong>Community Commerce</strong>
                <span>Every purchase grows local livelihoods</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container footer-main-content">
        <div className="footer-columns-grid">
          {/* Brand Info Column */}
          <div className="footer-brand-column">
            <div className="footer-brand-title">
              <div className="footer-leaf-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
              <span>DukanNest</span>
            </div>
            <p className="footer-brand-desc">
              Where Local Shops Feel at Home. Empowering independent Indian artisans, makers, and neighborhood businesses with digital storefronts and local discovery.
            </p>
            <div className="footer-location-tag">
              <MapPin size={13} className="text-emerald" />
              <span>Serving Mathura &amp; NCR Region, India</span>
            </div>
          </div>

          {/* Explore Catalog */}
          <div className="footer-links-col">
            <h4 className="col-heading">Explore Catalog</h4>
            <Link to="/products">All Products</Link>
            <Link to="/products?category=handmade">Handmade Crafts</Link>
            <Link to="/products?category=home-decor">Home &amp; Living</Link>
            <Link to="/products?category=food">Food &amp; Gourmet</Link>
            <Link to="/products?category=clothing">Fashion &amp; Apparel</Link>
          </div>

          {/* Seller Hub */}
          <div className="footer-links-col">
            <h4 className="col-heading">Seller Hub</h4>
            <Link to="/choose-role">Register as a Seller</Link>
            <Link to="/login?role=SELLER">Seller Portal Login</Link>
            <Link to="/seller/dashboard">Merchant Dashboard</Link>
            <Link to="/seller/onboarding">Storefront Setup</Link>
          </div>

          {/* Shopper Care */}
          <div className="footer-links-col">
            <h4 className="col-heading">Shopper Care</h4>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Shopping Cart</Link>
            <Link to="/choose-role">Customer Account</Link>
            <Link to="/products">Browse Nearby Shops</Link>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} DukanNest. All rights reserved. Where local shops feel at home.</p>
          <div className="footer-sublinks">
            <Link to="/products">Locality Directory</Link>
            <span>•</span>
            <Link to="/choose-role">Merchant Network</Link>
            <span>•</span>
            <Link to="/">Where Local Shops Feel at Home</Link>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer-refined {
          background: #0F172A; /* Deep Navy */
          color: #94A3B8;
          margin-top: auto;
          font-family: var(--font-sans);
          border-top: 1px solid #1E293B;
        }

        /* Trust Strip */
        .footer-trust-strip {
          background: #1E293B; /* Slightly elevated navy surface */
          padding: 24px 0;
          border-bottom: 1px solid #334155;
        }
        .trust-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .trust-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .trust-text {
          display: flex;
          flex-direction: column;
        }
        .trust-text strong {
          color: #F8FAFC;
          font-size: 13px;
          font-weight: 700;
        }
        .trust-text span {
          color: #94A3B8;
          font-size: 11.5px;
          margin-top: 2px;
        }

        /* Main Footer Links */
        .footer-main-content {
          padding-top: 48px;
          padding-bottom: 32px;
        }
        .footer-columns-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-brand-column {
          display: flex;
          flex-direction: column;
        }
        .footer-brand-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #FFFFFF;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.3px;
          margin-bottom: 12px;
        }
        .footer-leaf-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-brand-desc {
          color: #94A3B8;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 16px;
          max-width: 320px;
        }
        .footer-location-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #E2E8F0;
          font-size: 12px;
          font-weight: 500;
        }

        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .col-heading {
          color: #F8FAFC;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .footer-links-col a {
          color: #94A3B8;
          font-size: 13px;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-links-col a:hover {
          color: #10B981;
        }

        /* Bottom Bar */
        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          border-top: 1px solid #1E293B;
          font-size: 12px;
          color: #64748B;
        }
        .footer-sublinks {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-sublinks a {
          color: #64748B;
          text-decoration: none;
        }
        .footer-sublinks a:hover {
          color: #10B981;
        }

        @media (max-width: 960px) {
          .trust-features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .footer-columns-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }
        }
        @media (max-width: 600px) {
          .trust-features-grid {
            grid-template-columns: 1fr;
          }
          .footer-columns-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .footer-bottom-bar {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
