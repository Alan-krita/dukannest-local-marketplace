// src/pages/auth/RoleSelect.jsx
// Premium Modern Role Selection Experience
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="role-select-page">
      <div className="role-select-card card">
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '24px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              marginBottom: '14px',
            }}
          >
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
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
              DukanNest Marketplace
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
            Welcome to DukanNest
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Where local shops feel at home. Choose your account portal to continue.
          </p>
        </div>

        {/* 2 Role Choice Cards */}
        <div className="roles-cards-row">
          {/* Customer Choice */}
          <div
            className="role-choice-card"
            onClick={() => navigate('/login?role=CUSTOMER')}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShoppingBag size={26} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Customer Shopper
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '18px' }}>
              Discover local neighborhood artisans, shop authentic products, and enjoy fast local delivery.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} /> Hyperlocal neighborhood catalog
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} /> Real-time order progress tracking
              </li>
            </ul>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              Continue as Shopper <ArrowRight size={15} />
            </button>
          </div>

          {/* Seller Choice */}
          <div
            className="role-choice-card"
            onClick={() => navigate('/login?role=SELLER')}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Store size={26} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Merchant Seller
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '18px' }}>
              Launch your public storefront, manage product stock, and fulfill neighborhood customer orders.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                <CheckCircle2 size={14} style={{ color: '#2563EB', flexShrink: 0 }} /> Individual public storefront
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#2563EB' }}>
                <CheckCircle2 size={14} style={{ color: '#2563EB', flexShrink: 0 }} /> Smart inventory & stock alerts
              </li>
            </ul>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              Continue as Merchant <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '13.5px', color: '#64748B' }}>
            Already have an active account?{' '}
          </span>
          <Link
            to="/login"
            style={{ fontSize: '13.5px', fontWeight: 700, color: '#059669', textDecoration: 'none' }}
          >
            Direct Login →
          </Link>
        </div>
      </div>

      <style>{`
        .role-select-page {
          min-height: 100vh;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }
        .role-select-card {
          max-width: 680px;
          width: 100%;
          padding: 36px;
          border-radius: 20px;
        }
        .roles-cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .role-choice-card {
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
        }
        .role-choice-card:hover {
          border-color: #10B981;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.12);
          transform: translateY(-2px);
        }
        @media (max-width: 640px) {
          .roles-cards-row {
            grid-template-columns: 1fr;
          }
          .role-select-card {
            padding: 24px 18px;
          }
        }
      `}</style>
    </div>
  );
}
