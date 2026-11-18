// src/pages/seller/AddEditProduct.jsx
// Premium Modern Product Editor with 2-Column Layout & Real-time Media Preview
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import productService from '../../services/productService';
import shopService from '../../services/shopService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getLocalProductImage } from '../../components/ProductCard';
import {
  ArrowLeft,
  Save,
  Package,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function AddEditProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    sku: '',
    image_url: '',
    category_id: '',
  });

  useEffect(() => {
    shopService.getCategories().then(setCategories).catch(console.error);

    if (isEdit) {
      productService
        .getProduct(id)
        .then((p) =>
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price ?? '',
            stock_quantity: p.stock_quantity ?? '',
            sku: p.sku || '',
            image_url: p.image_url || '',
            category_id: p.category_id || '',
          })
        )
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity, 10),
      sku: form.sku.trim() || null,
      image_url: form.image_url.trim() || null,
      category_id: form.category_id || null, // preserve UUID string or null
    };

    try {
      if (isEdit) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }
      navigate('/seller/products');
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <LoadingSpinner text="Loading product details..." />
      </div>
    );
  }

  const stockNum = parseInt(form.stock_quantity, 10);
  const stockStatus =
    isNaN(stockNum) || stockNum <= 0
      ? { label: 'Out of Stock', cls: 'badge-rose' }
      : stockNum <= 5
      ? { label: 'Low Stock Alert', cls: 'badge-amber' }
      : { label: 'Well Stocked', cls: 'badge-emerald' };

  return (
    <div className="add-edit-product-page">
      {/* Top Header */}
      <div className="flex-between mb-24">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link to="/seller/products" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <ArrowLeft size={16} /> Back to Catalog
            </Link>
          </div>
          <h1 className="dash-title" style={{ fontSize: '24px', fontWeight: 800 }}>
            {isEdit ? 'Edit Product Details' : 'Add New Product'}
          </h1>
          <p className="text-muted" style={{ fontSize: '13.5px', marginTop: '2px' }}>
            {isEdit
              ? 'Update specifications, pricing, inventory stock, and public visibility.'
              : 'Create a new item in your store catalog to reach local neighborhood shoppers.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/seller/products')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-editor-form"
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-box mb-20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Responsive Editor Form */}
      <form id="product-editor-form" onSubmit={handleSubmit}>
        <div className="product-form-layout">
          {/* Left Column: General Information */}
          <div className="form-col-main">
            <div className="card card-body mb-20">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Package size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>General Information</h3>
              </div>

              <div className="form-group mb-16">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Product Title <span style={{ color: 'var(--rose-600)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Organic Handcrafted Soy Candle"
                  required
                />
              </div>

              <div className="form-group mb-16">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Product Description
                </label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your craft, materials used, scent notes, care instructions, and dimensions..."
                />
              </div>

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={13} className="text-muted" /> Category
                  </label>
                  <select
                    name="category_id"
                    className="form-select"
                    value={form.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Hash size={13} className="text-muted" /> SKU / Barcode <span className="text-muted">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    className="form-input"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. CND-MATH-01"
                  />
                </div>
              </div>
            </div>

            {/* Quality & Tips Card */}
            <div className="card card-body" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>Artisan Listing Tip</h4>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    Customers love authentic local craftsmanship. Add clear details about handcrafted materials, sustainability, and origin in Mathura.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Inventory & Media */}
          <div className="form-col-side">
            {/* Pricing & Inventory */}
            <div className="card card-body mb-20">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Layers size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Pricing & Stock</h3>
              </div>

              <div className="form-group mb-16">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Selling Price (₹) <span style={{ color: 'var(--rose-600)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 700 }}>
                    ₹
                  </div>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    style={{ paddingLeft: '28px', fontWeight: 700, fontSize: '15px' }}
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', margin: 0 }}>
                    Stock Quantity <span style={{ color: 'var(--rose-600)' }}>*</span>
                  </label>
                  {form.stock_quantity !== '' && (
                    <span className={`badge ${stockStatus.cls}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {stockStatus.label}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  name="stock_quantity"
                  className="form-input"
                  value={form.stock_quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
                <p style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px', margin: 0 }}>
                  Items with 5 or fewer units trigger low-stock alerts on your seller dashboard.
                </p>
              </div>
            </div>

            {/* Media & Image Card */}
            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ImageIcon size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Product Image</h3>
              </div>

              <div className="form-group mb-14">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>
                  Image URL <span className="text-muted">(Direct Link)</span>
                </label>
                <input
                  type="url"
                  name="image_url"
                  className="form-input"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              {/* Live Preview Box */}
              <div
                style={{
                  borderRadius: '10px',
                  border: '1.5px dashed #CBD5E1',
                  background: '#F8FAFC',
                  height: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {form.image_url || form.name ? (
                  <img
                    src={form.image_url || getLocalProductImage(form.name, '')}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94A3B8', padding: '16px' }}>
                    <ImageIcon size={32} style={{ margin: '0 auto 6px auto', display: 'block' }} />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Auto-matched artisan image preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .product-form-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .product-form-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
