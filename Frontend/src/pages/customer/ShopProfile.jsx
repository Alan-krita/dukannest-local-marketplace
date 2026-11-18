// src/pages/customer/ShopProfile.jsx
// Premium Modern Individual Seller Storefront
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import shopService from '../../services/shopService';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  Package,
  ShieldCheck,
  Compass,
  ArrowLeft,
  Mail,
  Building,
  Tag,
} from 'lucide-react';

const KNOWN_DEFAULT_SHOP = '463f9983-3d0d-4e15-9e14-0ecaf69b6365';

const FALLBACK_SHOP = {
  id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
  shop_name: 'The Candle Co.',
  description: 'Handcrafted soy wax candles and aromatherapy home decor, hand-poured with love in Mathura.',
  category: 'Handmade & Decor',
  locality: 'Civil Lines',
  city: 'Mathura',
  state: 'Uttar Pradesh',
  pincode: '281001',
  address: '123 Craft Lane, Near City Center',
  status: 'ACTIVE',
  created_at: '2025-01-15T10:00:00Z',
  logo_url: '/images/shop_candle.jpg',
};

const FALLBACK_PRODUCTS = [
  {
    id: 'c81fc26b-a678-4f34-b25c-28150d84d359',
    name: 'Handmade Scented Candle',
    price: 199,
    stock_quantity: 40,
    image_url: '/images/product_candle.jpg',
    shop_id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
    shop_locality: 'Civil Lines',
    shop_city: 'Mathura',
  },
  {
    id: 'prod-candle-2',
    name: 'Lavender Aromatherapy Candle',
    price: 249,
    stock_quantity: 25,
    image_url: '/images/product_candle_2.jpg',
    shop_id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
    shop_locality: 'Civil Lines',
    shop_city: 'Mathura',
  },
  {
    id: 'prod-candle-3',
    name: 'Decorative Pillar Candle Set',
    price: 399,
    stock_quantity: 15,
    image_url: '/images/product_candle_3.jpg',
    shop_id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
    shop_locality: 'Civil Lines',
    shop_city: 'Mathura',
  },
];

export default function ShopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    setLoading(true);
    setError('');

    const targetId = id === 'shop-1' || id === 'default' ? KNOWN_DEFAULT_SHOP : id;

    Promise.all([
      shopService.getShop(targetId),
      productService.getProducts({ shop_id: targetId }),
    ])
      .then(([shopData, prodsData]) => {
        if (!shopData || !shopData.id) {
          throw new Error('Shop not found');
        }
        setShop(shopData);
        const list = prodsData?.items || (Array.isArray(prodsData) ? prodsData : []);
        setProducts(list.length > 0 ? list : FALLBACK_PRODUCTS);
      })
      .catch((err) => {
        if (
          err.message?.includes('offline') ||
          err.message?.includes('unreachable') ||
          err.message?.includes('demo mode') ||
          targetId === KNOWN_DEFAULT_SHOP
        ) {
          setShop(FALLBACK_SHOP);
          setProducts(FALLBACK_PRODUCTS);
        } else {
          setError(err.message || 'Storefront not found or unavailable');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner text="Loading seller storefront..." />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container" style={{ padding: '80px 20px', maxWidth: '580px', textAlign: 'center' }}>
        <div className="card card-body">
          <div className="empty-icon-wrap" style={{ margin: '0 auto 16px auto' }}>
            <Store size={28} className="text-muted" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Storefront Not Found</h2>
          <p style={{ color: '#64748B', marginBottom: '24px', lineHeight: 1.6, fontSize: '14px' }}>
            {error || 'The requested seller storefront could not be located. It may have been closed or the address is incorrect.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary btn-sm">
              <Compass size={14} /> Browse Catalog
            </Link>
            <Link to="/" className="btn btn-outline btn-sm">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locationText = [shop.locality, shop.city, shop.state].filter(Boolean).join(', ') || 'Mathura, UP';
  const avatarImg = shop.logo_url || '/images/shop_candle.jpg';
  const bannerImg = '/images/hero_shopkeeper.jpg';

  return (
    <div className="storefront-master-view">
      {/* Hero Banner Cover with Gradient Overlay */}
      <div className="storefront-hero-cover">
        <img src={bannerImg} alt="Shop Banner" className="storefront-cover-photo" />
        <div className="cover-dark-gradient" />
      </div>

      <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        {/* Storefront Header Card */}
        <div className="storefront-header-card card">
          <div className="storefront-avatar-stage">
            <img
              src={avatarImg}
              alt={shop.shop_name}
              className="storefront-avatar-img"
              onError={(e) => { e.target.src = '/images/shop_candle.jpg'; }}
            />
          </div>

          <div className="storefront-header-info">
            <div className="storefront-title-row">
              <h1 className="storefront-name">{shop.shop_name}</h1>
              <span className={`badge ${shop.status === 'ACTIVE' ? 'badge-emerald' : 'badge-amber'}`}>
                <ShieldCheck size={13} />
                {shop.status === 'ACTIVE' ? 'Verified Local Shop' : 'Draft Mode'}
              </span>
            </div>

            <p className="storefront-category-tag">
              {shop.category ? `${shop.category} • ` : ''}Independent Local Artisan Seller
            </p>

            <div className="storefront-meta-chips-row">
              <span className="storefront-meta-chip">
                <MapPin size={13} className="text-emerald" />
                <span>{locationText}</span>
              </span>

              {shop.address && (
                <span className="storefront-meta-chip hide-mobile">
                  <Building size={13} className="text-emerald" />
                  <span>{shop.address}</span>
                </span>
              )}

              <span className="storefront-meta-chip">
                <Calendar size={13} className="text-emerald" />
                <span>
                  Member since {new Date(shop.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="storefront-tabs-bar">
          <button
            type="button"
            className={`storefront-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} />
            <span>Active Products ({products.length})</span>
          </button>
          <button
            type="button"
            className={`storefront-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Store size={16} />
            <span>Shop Profile &amp; Location</span>
          </button>
        </div>

        {/* Tab Content: Products */}
        {activeTab === 'products' ? (
          <div style={{ marginBottom: '60px' }}>
            {products.length === 0 ? (
              <div className="card card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div className="empty-icon-wrap" style={{ margin: '0 auto 12px auto' }}>
                  <Package size={26} className="text-muted" />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
                  No Active Products Currently Listed
                </h3>
                <p style={{ color: '#64748B', fontSize: '13.5px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                  This seller does not have any active products for sale at the moment. Please explore products from other local artisans.
                </p>
                <Link to="/products" className="btn btn-outline btn-sm">
                  ← Explore Marketplace Catalog
                </Link>
              </div>
            ) : (
              <div className="storefront-products-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab Content: About */
          <div className="storefront-about-card card" style={{ marginBottom: '60px' }}>
            <h3 className="about-block-title">About {shop.shop_name}</h3>
            <p className="about-bio-text">
              {shop.description || 'Welcome to our neighborhood shop! We handcraft and curate quality goods locally for our community.'}
            </p>

            <div className="about-divider" />

            <h4 className="about-block-subtitle">Store &amp; Location Information</h4>
            <div className="about-details-table">
              <div className="about-detail-row">
                <span className="detail-row-label">
                  <MapPin size={14} className="text-emerald" /> Street Address
                </span>
                <span className="detail-row-val">{shop.address || 'Market Center'}</span>
              </div>
              <div className="about-detail-row">
                <span className="detail-row-label">
                  <Building size={14} className="text-emerald" /> Locality &amp; City
                </span>
                <span className="detail-row-val">
                  {shop.locality ? `${shop.locality}, ` : ''}{shop.city || 'Mathura'}
                </span>
              </div>
              {shop.state && (
                <div className="about-detail-row">
                  <span className="detail-row-label">State / Region</span>
                  <span className="detail-row-val">{shop.state}</span>
                </div>
              )}
              {shop.pincode && (
                <div className="about-detail-row">
                  <span className="detail-row-label">Postal Pincode</span>
                  <span className="detail-row-val">{shop.pincode}</span>
                </div>
              )}
              {shop.category && (
                <div className="about-detail-row">
                  <span className="detail-row-label">
                    <Tag size={14} className="text-emerald" /> Craft Category
                  </span>
                  <span className="detail-row-val">{shop.category}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .storefront-master-view {
          padding-bottom: 40px;
        }

        .storefront-hero-cover {
          position: relative;
          height: 240px;
          background: #0F172A;
          overflow: hidden;
        }

        .storefront-cover-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.65;
        }

        .cover-dark-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.7) 100%);
        }

        /* Header Card */
        .storefront-header-card {
          padding: 28px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
        }

        .storefront-avatar-stage {
          width: 90px;
          height: 90px;
          border-radius: 18px;
          overflow: hidden;
          border: 3px solid #FFFFFF;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
          flex-shrink: 0;
        }

        .storefront-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .storefront-header-info {
          flex: 1;
        }

        .storefront-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .storefront-name {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .storefront-category-tag {
          font-size: 13.5px;
          color: #64748B;
          margin-bottom: 12px;
        }

        .storefront-meta-chips-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .storefront-meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: #334155;
          font-weight: 600;
        }

        /* Tabs */
        .storefront-tabs-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }

        .storefront-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 24px;
          font-size: 13.5px;
          font-weight: 700;
          color: #64748B;
          background: #FFFFFF;
          border: 1px solid var(--border-color);
          transition: var(--transition);
        }
        .storefront-tab-btn:hover {
          color: #059669;
          border-color: #A7F3D0;
        }
        .storefront-tab-btn.active {
          background: #059669;
          color: #FFFFFF;
          border-color: #059669;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .storefront-products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        /* About Card */
        .storefront-about-card {
          padding: 32px;
          background: #FFFFFF;
        }

        .about-block-title {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 10px;
        }

        .about-bio-text {
          font-size: 15px;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 24px;
        }

        .about-divider {
          height: 1px;
          background: var(--border-color);
          margin: 20px 0;
        }

        .about-block-subtitle {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 16px;
        }

        .about-details-table {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 600px;
        }

        .about-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #F1F5F9;
          font-size: 13.5px;
        }

        .detail-row-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748B;
          font-weight: 600;
        }

        .detail-row-val {
          font-weight: 700;
          color: #0F172A;
        }

        @media (max-width: 900px) {
          .storefront-products-grid { grid-template-columns: repeat(2, 1fr); }
          .storefront-header-card { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 560px) {
          .storefront-products-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
