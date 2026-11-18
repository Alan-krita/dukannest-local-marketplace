// src/pages/seller/SellerOnboarding.jsx
// Premium Modern Seller Onboarding Flow
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import shopService from '../../services/shopService';
import {
  Store,
  MapPin,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
  ShieldCheck,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    name: 'The Candle Co.',
    category: 'Handmade & Crafts',
    description: 'We create natural, eco-friendly candles and aromatherapy goods for a better tomorrow.',
    address: '123 Craft Lane, Near City Center',
    city: 'Mathura',
    pincode: '281001',
    phone: '+91 98765 43210',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      await shopService.createShop({
        shop_name: form.name.trim(),
        description: form.description?.trim() || null,
        city: form.city?.trim() || null,
        address: form.address?.trim() || null,
        category: form.category?.trim() || null,
        pincode: form.pincode?.trim() || null,
        status: 'ACTIVE',
      });
      navigate('/seller/dashboard');
    } catch (err) {
      if (err.status === 409 || err.message?.includes('already owns a shop')) {
        navigate('/seller/dashboard');
      } else {
        setError(err.message || 'Failed to complete shop registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Shop Details' },
    { num: 2, label: 'Location & Phone' },
    { num: 3, label: 'Verification' },
  ];

  return (
    <div className="onboarding-page-shell">
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Brand Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
                DukanNest Seller Studio
              </span>
            </div>
          </div>

          <Link to="/choose-role" className="btn btn-ghost btn-sm" style={{ fontSize: '13px', color: '#64748B' }}>
            Exit Setup
          </Link>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="card card-body mb-24" style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {steps.map((st, idx) => {
              const isCompleted = currentStep > st.num;
              const isActive = currentStep === st.num;

              return (
                <React.Fragment key={st.num}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        background: isCompleted
                          ? '#10B981'
                          : isActive
                            ? '#0F172A'
                            : '#F1F5F9',
                        color: isCompleted || isActive ? '#FFFFFF' : '#64748B',
                        boxShadow: isActive ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : st.num}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600 }}>
                        STEP 0{st.num}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#0F172A' : '#64748B',
                        }}
                      >
                        {st.label}
                      </div>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        margin: '0 16px',
                        background: currentStep > st.num ? '#10B981' : '#E2E8F0',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="error-box mb-20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Shop Information */}
        {currentStep === 1 && (
          <div className="card card-body" style={{ padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                  Tell us about your shop
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Enter your store brand and craft specialty so neighborhood buyers can find you.
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Store size={24} />
              </div>
            </div>

            <div className="form-group mb-18">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Store / Business Name <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. The Candle Co."
                className="form-input"
                required
              />
            </div>

            <div className="form-group mb-18">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Primary Specialty / Category <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Handmade & Crafts">Handmade & Crafts</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Art & Collectibles">Art & Collectibles</option>
              </select>
            </div>

            <div className="form-group mb-24">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Store Story & Bio <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell customers about your craftsmanship, local origin, and materials..."
                className="form-input form-textarea"
                rows={4}
                required
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              onClick={() => setCurrentStep(2)}
            >
              Continue to Location <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Address and Contact Details */}
        {currentStep === 2 && (
          <div className="card card-body" style={{ padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                  Location & Contact Details
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Hyperlocal customers order from sellers in their city and neighborhood.
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={24} />
              </div>
            </div>

            <div className="form-group mb-18">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Workshop / Store Address <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Craft Lane, Near City Center"
                className="form-input"
                required
              />
            </div>

            <div className="form-grid form-grid-2 mb-18">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  City <span style={{ color: 'var(--rose-600)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Mathura"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Postal Code (Pincode) <span style={{ color: 'var(--rose-600)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 281001"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-24">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Business Phone Number <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                onClick={() => setCurrentStep(3)}
              >
                Continue to Verification <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verification & Launch */}
        {currentStep === 3 && (
          <div className="card card-body" style={{ padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                  Verification & Launch
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
                  Upload optional documents now or proceed directly to launch your store.
                </p>
              </div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#F0FDF4',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="mb-20">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                Trade License / Business Registration <span className="text-muted">(Optional)</span>
              </label>
              <div
                style={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <UploadCloud size={28} style={{ color: '#94A3B8', margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Click to browse or drop certificate
                </div>
                <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                  PDF, JPG, PNG up to 5MB
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
              <div style={{ fontSize: '12.5px', color: '#166534', lineHeight: 1.5 }}>
                <strong>Instant Activation:</strong> Your store will be published with <em>ACTIVE</em> status immediately upon completion.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
                onClick={() => setCurrentStep(2)}
                disabled={loading}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? 'Setting up Store...' : 'Launch My Storefront'} <Sparkles size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .onboarding-page-shell {
          min-height: 100vh;
          background: #F8FAFC;
          padding: 40px 16px 80px;
        }
      `}</style>
    </div>
  );
}
