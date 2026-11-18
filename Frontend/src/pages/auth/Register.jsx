// src/pages/auth/Register.jsx
// Premium Modern Registration Interface
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
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
  CheckCircle2,
} from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'CUSTOMER';

  const [role, setRole] = useState(initialRole.toUpperCase());
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both passwords.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        full_name: fullName.trim(),
        email: isEmail ? identifier.trim() : `${identifier.replace(/\D/g, '')}@dukannest.internal`,
        phone: !isEmail ? identifier.trim() : null,
        password: password,
        role: role,
      };

      await register(payload);

      if (role === 'SELLER') {
        navigate('/seller/onboarding');
      } else {
        navigate('/login?registered=1');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
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
            Create Your Account
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
            Join the DukanNest community. Where local shops feel at home.
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

        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
              Full Name <span style={{ color: 'var(--rose-600)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                placeholder="Pari Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Password <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
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
                  style={{ paddingLeft: '38px', paddingRight: '36px' }}
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  style={{
                    position: 'absolute',
                    right: '10px',
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
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Confirm Password <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '36px' }}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  style={{
                    position: 'absolute',
                    right: '10px',
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
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ accentColor: '#059669', width: '15px', height: '15px', marginTop: '3px', cursor: 'pointer' }}
            />
            <label
              htmlFor="agree-checkbox"
              style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer', margin: 0, lineHeight: 1.4 }}
            >
              I agree to the DukanNest Terms of Service and Privacy Policy for local community commerce.
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'SELLER' ? 'Seller' : 'Customer'}`}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '13.5px', color: '#64748B' }}>
            Already registered on DukanNest?{' '}
          </span>
          <Link
            to={`/login?role=${role}`}
            style={{ fontSize: '13.5px', fontWeight: 700, color: '#059669', textDecoration: 'none' }}
          >
            Sign In Here →
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
          max-width: 480px;
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
