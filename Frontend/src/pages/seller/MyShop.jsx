// src/pages/seller/MyShop.jsx
// Premium Modern Shop Profile & Storefront Management
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import shopService from '../../services/shopService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Edit3,
  ShieldCheck,
  Building,
  Sparkles,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

export default function MyShop() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    shop_name: '',
    description: '',
    city: '',
    address: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    shopService
      .getMyShop()
      .then((data) => {
        setShop(data);
        setForm({
          shop_name: data.shop_name || data.name || '',
          description: data.description || '',
          city: data.city || '',
          address: data.address || '',
          status: data.status || 'ACTIVE',
        });
      })
      .catch((err) => {
        if (
          err.status === 404 ||
          err.message?.includes('No shop') ||
          err.message?.includes('not created a shop')
        ) {
          setCreating(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      shop_name: form.shop_name.trim(),
      description: form.description?.trim() || null,
      city: form.city?.trim() || null,
      address: form.address?.trim() || null,
      status: form.status || 'ACTIVE',
    };

    try {
      if (creating) {
        const newShop = await shopService.createShop(payload);
        setShop(newShop);
        setCreating(false);
        setSuccess('Shop profile created successfully!');
      } else {
        const updated = await shopService.updateMyShop(payload);
        setShop(updated);
        setEditing(false);
        setSuccess('Shop profile updated successfully!');
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save shop profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <LoadingSpinner text="Loading shop profile..." />
      </div>
    );
  }

  const showForm = editing || creating;
  const shopName = shop?.shop_name || shop?.name || 'Local Artisan Shop';
  const isActive = shop?.status === 'ACTIVE';

  return (
    <div className="my-shop-container">
      {/* Top Header */}
      <div className="flex-between mb-24">
        <div>
          <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 800 }}>
            My Shop Profile
          </h1>
          <p className="text-muted" style={{ fontSize: '13.5px', marginTop: '2px' }}>
            {creating
              ? 'Set up your public merchant storefront to start selling to local neighborhood buyers.'
              : 'Manage public branding, contact location, and customer-facing visibility.'}
          </p>
        </div>

        {shop && !showForm && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to={`/shop/${shop.id}`}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={15} /> View Live Storefront
            </Link>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <Edit3 size={15} /> Edit Shop Details
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-box mb-20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-box mb-20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} style={{ color: 'var(--emerald-600)', flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {/* View Mode */}
      {shop && !showForm && (
        <div className="shop-showcase-card card">
          {/* Cover Header */}
          <div
            style={{
              height: '140px',
              background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
              position: 'relative',
              borderRadius: '16px 16px 0 0',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '24px',
                top: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '20px',
              }}
            >
              <ShieldCheck size={14} /> Verified Local Merchant
            </div>

            {/* Avatar Pill overlapping */}
            <div
              style={{
                position: 'absolute',
                bottom: '-28px',
                left: '28px',
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                background: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #FFFFFF',
              }}
            >
              <Store size={32} style={{ color: 'var(--primary)' }} />
            </div>
          </div>

          <div className="card-body" style={{ paddingTop: '42px', paddingBottom: '28px' }}>
            <div className="flex-between mb-16" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                    {shopName}
                  </h2>
                  <span className={`badge ${isActive ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '12px' }}>
                    {isActive ? '● Live Store' : '● Draft Mode'}
                  </span>
                </div>
                <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px', maxWidth: '640px', lineHeight: 1.6 }}>
                  {shop.description || 'No store bio added yet. Tell your customers about your craft, values, and story.'}
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                paddingTop: '16px',
                borderTop: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={16} className="text-muted" />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>CITY</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    {shop.city || 'Not Specified'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} className="text-muted" />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>LOCAL ADDRESS</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    {shop.address || 'Address not listed'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} className="text-muted" />
                </div>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>JOINED DATE</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                    {shop.created_at ? new Date(shop.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Verified Partner'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Mode (Create or Edit) */}
      {showForm && (
        <div className="card card-body" style={{ maxWidth: '640px' }}>
          <div className="flex-between mb-20" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>
                {creating ? 'Set Up Your Storefront' : 'Edit Shop Details'}
              </h3>
            </div>
            {!creating && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setEditing(false)}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Shop Name <span style={{ color: 'var(--rose-600)' }}>*</span>
              </label>
              <input
                type="text"
                name="shop_name"
                className="form-input"
                value={form.shop_name}
                onChange={handleChange}
                placeholder="e.g. Mathura Handicrafts & Decor"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Storefront Bio & Story
              </label>
              <textarea
                name="description"
                className="form-input form-textarea"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Share your craft tradition, production process, and local story..."
              />
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  City <span style={{ color: 'var(--rose-600)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Mathura"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Address / Locality
                </label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. Civil Lines, Mathura"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                Store Visibility Status
              </label>
              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE — Store is live and discoverable in the local catalog</option>
                <option value="DRAFT">DRAFT — Hidden from customers while updating products</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : creating ? 'Create Shop' : 'Save Changes'}
              </button>
              {!creating && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
