// src/pages/auth/Login.jsx
// Premium Modern Authentication Interface
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Store,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'CUSTOMER';

  const [role, setRole] = useState(initialRole.toUpperCase());
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      if (user?.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper-page">
      <div className="auth-central-card card">
        {/* Top Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link
            to="/choose-role"
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px', fontSize: '13px', color: '#64748B' }}
          >
            <ArrowLeft size={15} /> Back to role selector
          </Link>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px', margin: '0 0 4px 0' }}>
            Sign In to DukanNest
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
            Where local shops feel at home. Enter your credentials below.
          </p>
        </div>

        {/* Role Toggle Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '20px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            style={{
              border: 'none',
              background: role === 'CUSTOMER' ? '#FFFFFF' : 'transparent',
              color: role === 'CUSTOMER' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: role === 'CUSTOMER' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ShoppingBag size={15} style={{ color: role === 'CUSTOMER' ? '#059669' : '#64748B' }} />
            Customer
          </button>

          <button
            type="button"
            onClick={() => setRole('SELLER')}
            style={{
              border: 'none',
              background: role === 'SELLER' ? '#FFFFFF' : 'transparent',
              color: role === 'SELLER' ? '#0F172A' : '#64748B',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: role === 'SELLER' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Store size={15} style={{ color: role === 'SELLER' ? '#2563EB' : '#64748B' }} />
            Seller Portal
          </button>
        </div>

        {error && (
          <div className="error-box mb-18" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
              Email or Phone Number <span style={{ color: 'var(--rose-600)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>
                Password <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <a
                href="#forgot"
                style={{ fontSize: '12px', color: '#059669', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="remember-me-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#059669', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            <label
              htmlFor="remember-me-checkbox"
              style={{ fontSize: '13px', color: '#475569', cursor: 'pointer', margin: 0 }}
            >
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign in as ${role === 'SELLER' ? 'Seller' : 'Customer'}`}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '13.5px', color: '#64748B' }}>
            Don't have an account yet?{' '}
          </span>
          <Link
            to={`/register?role=${role}`}
            style={{ fontSize: '13.5px', fontWeight: 700, color: '#059669', textDecoration: 'none' }}
          >
            Create an Account →
          </Link>
        </div>
      </div>

      <style>{`
        .auth-wrapper-page {
          min-height: 100vh;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }
        .auth-central-card {
          max-width: 440px;
          width: 100%;
          padding: 32px 36px;
          border-radius: 20px;
        }
        @media (max-width: 480px) {
          .auth-central-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}
