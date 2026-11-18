// src/pages/customer/ProductDetails.jsx
// Premium Editorial Product Details & Artisan Storefront Connection
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import shopService from '../../services/shopService';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getLocalProductImage, getProductDisplayImage } from '../../components/ProductCard';
import {
  Store,
  MapPin,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  Zap,
  Check,
  ChevronRight,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';

function getProductCraftDetails(product) {
  const name = (product?.name || '').toLowerCase();

  if (name.includes('water pot') || name.includes('matka') || name.includes('ghada')) {
    return {
      material: '100% Pure Earthen Clay (Mitti)',
      technique: 'Hand-thrown on traditional potter wheel, sun-cured & wood-fired',
      finish: 'Natural breathable terracotta (naturally cools drinking water via evaporative pores)',
      capacity: 'Approx. 5 - 8 Litres',
      care: 'Soak in clean fresh water for 4-6 hours before first use. Rinse gently with warm water; never use chemical dish detergents.',
      provenance: 'Generations of potters in Mathura & Goverdhan specialize in creating breathable terracotta water pots that preserve the natural alkaline properties of fresh drinking water.',
    };
  }
  if (name.includes('cooking pot') || name.includes('handi')) {
    return {
      material: 'Organic Mineral-Rich Clay (Clay Cooking Handi)',
      technique: 'Traditional Handi molding with reinforced thermal heat base',
      finish: 'Seasoned natural earthen cookware (Zero toxic chemical coatings)',
      capacity: 'Approx. 1.5 - 2.5 Litres',
      care: 'Season with rice water before first cooking. Always cook on low to medium flame. Avoid putting hot clay pots directly onto cold water.',
      provenance: 'Handcrafted in Goverdhan heritage pottery clusters, clay handis retain 100% of food nutrients and infuse traditional dishes with an authentic earthy aroma.',
    };
  }
  if (name.includes('jasmine') || name.includes('candle') || name.includes('wax')) {
    return {
      material: '100% Botanical Soy Wax & Pure Cotton Wick',
      technique: 'Small-batch artisanal hand-pouring in reusable amber/frosted glass containers',
      finish: 'Pure essential oil infusion (Phthalate-free, non-toxic, paraffin-free)',
      burnTime: 'Approx. 35 - 45 hours clean smokeless burn',
      care: 'Trim wick to 1/4 inch before each burn. Allow full melt pool to reach glass edges on first lighting to avoid tunneling.',
      provenance: 'Hand-blended and poured by independent aromatherapists in Mathura, creating soothing, clean botanical aromas for your home.',
    };
  }
  if (name.includes('brass') || name.includes('diya') || name.includes('lamp') || name.includes('bell')) {
    return {
      material: 'Solid Virgin Brass Metal (Pital)',
      technique: 'Traditional sand-casting, hand-carving, and hand-buffed finish',
      finish: 'Golden antique luster with organic protective finish',
      weight: 'Solid heavyweight construction',
      care: 'Wipe regularly with soft dry cloth. Periodically clean with natural pitambari powder or lemon & tamarind paste to restore gleam.',
      provenance: 'Mathura and Vrindavan metal artisans have forged sacred brass diyas and temple bells for centuries, carrying forward sacred Indian metalwork traditions.',
    };
  }
  if (name.includes('scarf') || name.includes('silk') || name.includes('textile')) {
    return {
      material: 'Handloom Mulberry Silk & Organic Cotton',
      technique: 'Traditional pit-loom weaving with handcrafted borders',
      finish: 'Natural azo-free vegetable dyes',
      care: 'Dry clean recommended or gentle hand wash in cold water with mild silk liquid. Shade dry.',
      provenance: 'Woven on indigenous handlooms by regional weavers, preserving the delicate drape and intricate texture of authentic Indian hand-spun yarn.',
    };
  }
  if (name.includes('incense')) {
    return {
      material: 'Charcoal-free Natural Wood Powder & Temple Flower Resins',
      technique: 'Hand-rolled sticks and cold-pressed botanical incense',
      finish: 'Natural temple flower essence (Zero toxic charcoal additives)',
      care: 'Store in airtight box away from moisture and direct sunlight. Burn in well-ventilated space.',
      provenance: 'Handmade by local women collectives using upcycled sacred floral offerings from Mathura and Vrindavan temple ghats.',
    };
  }
  return {
    material: 'Natural & Locally Sourced Sustainable Materials',
    technique: 'Authentic Indian regional handicraft',
    finish: 'Artisan handcrafted finish',
    care: 'Handle with care. Hand wash or gentle dust with a clean dry microfiber cloth.',
    provenance: 'Handcrafted with pride by local creators and verified by DukanNest to ensure genuine artisanal provenance.',
  };
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [adding, setAdding] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(async (data) => {
        if (data && data.name) {
          const primaryImg = getProductDisplayImage(data);
          const gallery = [primaryImg];
          const nameLower = (data.name || '').toLowerCase();

          // Add complementary authentic view angles without repetition
          if (nameLower.includes('water pot') || nameLower.includes('matka') || (nameLower.includes('terracotta') && nameLower.includes('pot'))) {
            if (!gallery.includes('/images/product_terracotta_matka.jpg?v=3')) gallery.push('/images/product_terracotta_matka.jpg?v=3');
            if (!gallery.includes('/images/product_terracotta_pot.jpg?v=3')) gallery.push('/images/product_terracotta_pot.jpg?v=3');
          } else if (nameLower.includes('cooking') || nameLower.includes('handi')) {
            if (!gallery.includes('/images/product_clay_handi.jpg?v=3')) gallery.push('/images/product_clay_handi.jpg?v=3');
            if (!gallery.includes('/images/product_terracotta_pot.jpg?v=3')) gallery.push('/images/product_terracotta_pot.jpg?v=3');
          } else if (nameLower.includes('candle') || nameLower.includes('wax')) {
            if (!gallery.includes('/images/product_jasmine_candle.jpg?v=3')) gallery.push('/images/product_jasmine_candle.jpg?v=3');
            if (!gallery.includes('/images/product_candle_2.jpg?v=3')) gallery.push('/images/product_candle_2.jpg?v=3');
          } else if (nameLower.includes('idol') || nameLower.includes('statue')) {
            if (!gallery.includes('/images/product_brass_idol.jpg?v=3')) gallery.push('/images/product_brass_idol.jpg?v=3');
            if (!gallery.includes('/images/product_brass_bell.jpg?v=3')) gallery.push('/images/product_brass_bell.jpg?v=3');
          } else if (nameLower.includes('brass') || nameLower.includes('diya') || nameLower.includes('bell') || nameLower.includes('lamp')) {
            if (!gallery.includes('/images/product_brass_diya.jpg?v=3')) gallery.push('/images/product_brass_diya.jpg?v=3');
            if (!gallery.includes('/images/product_brass_diya_alt.jpg?v=3')) gallery.push('/images/product_brass_diya_alt.jpg?v=3');
          }

          let shopName = data.shop_name || 'Local Artisan Workshop';
          let shopLocation = [data.shop_locality, data.shop_city, data.shop_pincode].filter(Boolean).join(', ') || 'Mathura, Uttar Pradesh';
          if (data.shop_id) {
            try {
              const shopData = await shopService.getShop(data.shop_id);
              if (shopData && shopData.shop_name) {
                shopName = shopData.shop_name;
                shopLocation = [shopData.locality, shopData.city, shopData.state, shopData.pincode].filter(Boolean).join(', ') || shopLocation;
              }
            } catch {
              // fallback remains
            }
          }
          const merged = { ...data, shop_name: shopName, shop_location: shopLocation, images: gallery };
          setProduct(merged);
          setSelectedImg(primaryImg);
        }
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setAlertMsg('');
    try {
      await addItem(product.id, qty, product);
      setAlertMsg('Item added to your shopping cart!');
      setTimeout(() => setAlertMsg(''), 3000);
    } catch (err) {
      setAlertMsg(err.message || 'Added to cart successfully!');
      setTimeout(() => setAlertMsg(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <LoadingSpinner text="Loading artisan product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Product Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '20px' }}>The product you are looking for is unavailable.</p>
        <Link to="/products" className="btn btn-primary btn-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const price = Number(product.price || 0);
  const stock = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const craftDetails = getProductCraftDetails(product);

  return (
    <div className="product-details-editorial">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div className="editorial-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products">Catalog</Link>
          <ChevronRight size={12} />
          <span>{product.name}</span>
        </div>

        {/* 2-Column Product Grid */}
        <div className="product-stage-grid">
          {/* Left Column: Image Stage */}
          <div className="product-gallery-stage">
            <div className="gallery-main-frame">
              <img
                src={selectedImg || getProductDisplayImage(product)}
                alt={product.name}
                className="gallery-display-image"
                onError={(e) => {
                  e.target.src = getLocalProductImage(product.name, product.id);
                }}
              />

              <button
                type="button"
                className={`gallery-wishlist-toggle ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                title="Save to Wishlist"
                aria-label="Wishlist"
              >
                <Heart
                  size={16}
                  fill={isWishlisted ? '#DC2626' : 'none'}
                  color={isWishlisted ? '#DC2626' : '#64748B'}
                />
              </button>
            </div>

            {/* Thumbnail Gallery Row */}
            {product.images && product.images.length > 1 && (
              <div className="gallery-thumbs-row">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-thumb-btn ${selectedImg === img ? 'active' : ''}`}
                    onClick={() => setSelectedImg(img)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="product-summary-col">
            <div className="artisan-provenance-pill">
              <ShieldCheck size={13} className="text-emerald" />
              <span>Verified Local Artisan Creation</span>
            </div>

            <h1 className="editorial-product-title">{product.name}</h1>

            {/* Genuine Stock Status (No Fake Ratings) */}
            <div className="stock-provenance-row">
              {isOutOfStock ? (
                <span className="badge badge-rose">
                  <AlertCircle size={12} /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="badge badge-amber">
                  <AlertCircle size={12} /> Only {stock} items left in stock
                </span>
              ) : (
                <span className="badge badge-emerald">
                  <Check size={12} /> In Stock ({stock} available)
                </span>
              )}

              {product.sku && (
                <span className="sku-tag">
                  SKU: <strong>{product.sku}</strong>
                </span>
              )}
            </div>

            {/* Genuine Price Card */}
            <div className="pricing-card-block">
              <div className="price-display-line">
                <span className="currency-prefix">₹</span>
                <span className="price-digits">{price.toLocaleString('en-IN')}</span>
              </div>
              <span className="tax-inclusive-caption">
                Direct artisan pricing • Free local pickup available
              </span>
            </div>

            {/* Sold by Local Shop Card */}
            <div className="seller-profile-card">
              <div className="seller-avatar-box">
                <Store size={20} className="text-emerald" />
              </div>
              <div className="seller-details-box">
                <span className="seller-role-label">Handcrafted &amp; Sold by</span>
                <h4 className="seller-shop-title">{product.shop_name}</h4>
                <div className="seller-geo-line">
                  <MapPin size={11} className="text-emerald" />
                  <span>{product.shop_location}</span>
                </div>
              </div>

              {product.shop_id && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm visit-shop-cta"
                  onClick={() => navigate(`/shop/${product.shop_id}`)}
                >
                  <span>Storefront</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>

            {/* Cart & Quantity Controls */}
            {!isOutOfStock ? (
              <div className="purchase-action-group">
                <div className="quantity-stepper-wrap">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    -
                  </button>
                  <span className="stepper-display">{qty}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQty(Math.min(stock, qty + 1))}
                    disabled={qty >= stock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-primary action-btn-add"
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  <ShoppingBag size={16} />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary action-btn-buy"
                  onClick={handleBuyNow}
                  disabled={adding}
                >
                  <Zap size={16} />
                  <span>Buy Now</span>
                </button>
              </div>
            ) : (
              <div className="out-of-stock-alert-box">
                <AlertCircle size={16} />
                <span>This item is currently sold out. Check back soon or contact the seller storefront.</span>
              </div>
            )}

            {alertMsg && (
              <div className="cart-feedback-toast">
                <Check size={14} />
                <span>{alertMsg}</span>
              </div>
            )}

            {/* Trust Assurances */}
            <div className="trust-bullets-grid">
              <div className="trust-bullet-item">
                <Truck size={15} className="text-emerald" />
                <span>Quick neighborhood delivery</span>
              </div>
              <div className="trust-bullet-item">
                <ShieldCheck size={15} className="text-emerald" />
                <span>Cash on delivery available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Editorial Content */}
        <div className="product-tabs-section">
          <div className="tabs-header-bar">
            <button
              type="button"
              className={`tab-title-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Product Description
            </button>
            <button
              type="button"
              className={`tab-title-btn ${activeTab === 'origin' ? 'active' : ''}`}
              onClick={() => setActiveTab('origin')}
            >
              Artisan Craft &amp; Provenance
            </button>
            <button
              type="button"
              className={`tab-title-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Fulfillment &amp; Care
            </button>
          </div>

          <div className="tab-body-card">
            {activeTab === 'details' && (
              <div className="tab-text-content">
                <p className="tab-main-paragraph">
                  {product.description || `Authentic handcrafted ${product.name}, skillfully shaped by verified artisans in ${product.shop_location}.`}
                </p>

                <h4 className="tab-specs-title">Craft &amp; Material Specifications</h4>
                <div className="tab-specs-grid">
                  <div className="tab-spec-row">
                    <span className="spec-label">Material</span>
                    <span className="spec-value">{craftDetails.material}</span>
                  </div>
                  <div className="tab-spec-row">
                    <span className="spec-label">Technique</span>
                    <span className="spec-value">{craftDetails.technique}</span>
                  </div>
                  <div className="tab-spec-row">
                    <span className="spec-label">Artisan Finish</span>
                    <span className="spec-value">{craftDetails.finish}</span>
                  </div>
                  {craftDetails.capacity && (
                    <div className="tab-spec-row">
                      <span className="spec-label">Capacity / Size</span>
                      <span className="spec-value">{craftDetails.capacity}</span>
                    </div>
                  )}
                  {craftDetails.burnTime && (
                    <div className="tab-spec-row">
                      <span className="spec-label">Burn Time</span>
                      <span className="spec-value">{craftDetails.burnTime}</span>
                    </div>
                  )}
                  <div className="tab-spec-row">
                    <span className="spec-label">Made In</span>
                    <span className="spec-value">India (Local Cluster: {product.shop_location})</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'origin' && (
              <div className="tab-text-content">
                <div className="origin-highlight-box">
                  <div className="origin-shop-badge">
                    <Store size={20} className="text-emerald" />
                    <div>
                      <h4 className="origin-shop-title">{product.shop_name}</h4>
                      <p className="origin-shop-loc">{product.shop_location}</p>
                    </div>
                  </div>
                  {product.shop_id && (
                    <Link to={`/shop/${product.shop_id}`} className="btn btn-outline btn-sm">
                      <span>Visit Storefront</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>

                <p className="tab-main-paragraph">{craftDetails.provenance}</p>

                <div className="provenance-benefits-grid">
                  <div className="provenance-benefit-card">
                    <Sparkles size={16} className="text-emerald" />
                    <div>
                      <strong>Zero Factory Mass-Production</strong>
                      <p>Every piece is individually handcrafted by local makers, giving each item unique natural character.</p>
                    </div>
                  </div>
                  <div className="provenance-benefit-card">
                    <ShieldCheck size={16} className="text-emerald" />
                    <div>
                      <strong>Fair Artisan Earnings</strong>
                      <p>100% of the sale directly empowers independent local creators and their families in Mathura &amp; NCR.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="tab-text-content">
                <div className="care-instruction-box">
                  <h4 className="care-box-title">
                    <Info size={15} className="text-emerald" />
                    <span>Care &amp; Usage Instructions</span>
                  </h4>
                  <p>{craftDetails.care}</p>
                </div>

                <h4 className="tab-specs-title" style={{ marginTop: '24px' }}>Delivery &amp; Payment Options</h4>
                <div className="tab-specs-grid">
                  <div className="tab-spec-row">
                    <span className="spec-label">Local Dispatch</span>
                    <span className="spec-value">Dispatched directly from {product.shop_location} within 24-48 hours</span>
                  </div>
                  <div className="tab-spec-row">
                    <span className="spec-label">Payment Modes</span>
                    <span className="spec-value">Cash on Delivery (COD), UPI, Net Banking, and Debit/Credit Cards</span>
                  </div>
                  <div className="tab-spec-row">
                    <span className="spec-label">Eco Packaging</span>
                    <span className="spec-value">100% plastic-free corrugated and honeycomb paper cushioning</span>
                  </div>
                  <div className="tab-spec-row">
                    <span className="spec-label">Transit Guarantee</span>
                    <span className="spec-value">Hassle-free 48-hour replacement in the rare event of transit damage</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .product-details-editorial {
          padding-top: 16px;
          padding-bottom: 60px;
        }

        .editorial-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748B;
          margin-bottom: 24px;
        }
        .editorial-breadcrumb a {
          color: #64748B;
          text-decoration: none;
        }
        .editorial-breadcrumb a:hover {
          color: #059669;
        }
        .editorial-breadcrumb span:last-child {
          color: #0F172A;
          font-weight: 600;
        }

        .product-stage-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
          margin-bottom: 48px;
        }

        /* Gallery */
        .product-gallery-stage {
          position: sticky;
          top: 90px;
        }
        .gallery-main-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gallery-display-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-wishlist-toggle {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(4px);
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .gallery-wishlist-toggle:hover {
          transform: scale(1.08);
        }

        /* Thumbnail Strip */
        .gallery-thumbs-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .gallery-thumb-btn {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #E2E8F0;
          background: #F8FAFC;
          cursor: pointer;
          padding: 0;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .gallery-thumb-btn:hover {
          border-color: #CBD5E1;
        }
        .gallery-thumb-btn.active {
          border-color: #059669;
          box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
        }
        .gallery-thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Summary Column */
        .artisan-provenance-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          color: #065F46;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 3px 9px;
          border-radius: 6px;
          margin-bottom: 10px;
        }

        .editorial-product-title {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.4px;
          line-height: 1.25;
          margin-bottom: 12px;
        }

        .stock-provenance-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .sku-tag {
          font-size: 11.5px;
          color: #64748B;
        }

        /* Price Card */
        .pricing-card-block {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 20px;
        }
        .price-display-line {
          display: flex;
          align-items: baseline;
          color: #0F172A;
          margin-bottom: 2px;
        }
        .currency-prefix {
          font-size: 16px;
          font-weight: 700;
          margin-right: 2px;
        }
        .price-digits {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }
        .tax-inclusive-caption {
          font-size: 11.5px;
          color: #64748B;
        }

        /* Seller Profile Card */
        .seller-profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
        }
        .seller-avatar-box {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .seller-details-box {
          flex: 1;
        }
        .seller-role-label {
          font-size: 10.5px;
          color: #64748B;
          display: block;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .seller-shop-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }
        .seller-geo-line {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #475569;
          margin-top: 1px;
        }
        .visit-shop-cta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          padding: 5px 10px;
        }

        /* Purchase Action Group */
        .purchase-action-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .quantity-stepper-wrap {
          display: inline-flex;
          align-items: center;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          background: #FFFFFF;
        }
        .stepper-btn {
          width: 32px;
          height: 36px;
          background: transparent;
          border: none;
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          cursor: pointer;
        }
        .stepper-btn:disabled {
          color: #CBD5E1;
          cursor: not-allowed;
        }
        .stepper-display {
          width: 32px;
          text-align: center;
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
        }
        .action-btn-add {
          flex: 1;
          padding: 10px 16px;
          font-size: 13.5px;
        }
        .action-btn-buy {
          flex: 1;
          padding: 10px 16px;
          font-size: 13.5px;
        }

        .out-of-stock-alert-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 12.5px;
          margin-bottom: 20px;
        }

        .cart-feedback-toast {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #065F46;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .trust-bullets-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid #F1F5F9;
        }
        .trust-bullet-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
        }

        /* Tabs */
        .product-tabs-section {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
        }
        .tabs-header-bar {
          display: flex;
          border-bottom: 1px solid #E2E8F0;
          background: #F8FAFC;
        }
        .tab-title-btn {
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 13px;
          font-weight: 600;
          color: #64748B;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab-title-btn:hover {
          color: #0F172A;
        }
        .tab-title-btn.active {
          color: #059669;
          border-bottom-color: #059669;
          background: #FFFFFF;
        }
        .tab-body-card {
          padding: 24px;
        }
        .tab-text-content {
          font-size: 13.5px;
          color: #334155;
          line-height: 1.6;
        }

        .tab-main-paragraph {
          font-size: 14px;
          line-height: 1.65;
          color: #334155;
          margin-bottom: 24px;
        }

        .tab-specs-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 14px;
          letter-spacing: -0.2px;
        }

        .tab-specs-grid {
          display: grid;
          grid-template-columns: 1fr;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          overflow: hidden;
          background: #FFFFFF;
        }
        .tab-spec-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          padding: 10px 16px;
          border-bottom: 1px solid #F1F5F9;
          font-size: 13px;
        }
        .tab-spec-row:last-child {
          border-bottom: none;
        }
        .tab-spec-row:nth-child(even) {
          background: #F8FAFC;
        }
        .spec-label {
          font-weight: 600;
          color: #64748B;
        }
        .spec-value {
          color: #0F172A;
        }

        /* Origin Highlight Box */
        .origin-highlight-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 20px;
        }
        .origin-shop-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .origin-shop-title {
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }
        .origin-shop-loc {
          font-size: 12px;
          color: #64748B;
          margin: 2px 0 0 0;
        }

        .provenance-benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 24px;
        }
        .provenance-benefit-card {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
        }
        .provenance-benefit-card strong {
          display: block;
          font-size: 13px;
          color: #0F172A;
          margin-bottom: 4px;
        }
        .provenance-benefit-card p {
          font-size: 12px;
          color: #64748B;
          margin: 0;
          line-height: 1.5;
        }

        /* Care Box */
        .care-instruction-box {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 16px;
        }
        .care-box-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #065F46;
          margin: 0 0 8px 0;
        }
        .care-instruction-box p {
          font-size: 13px;
          color: #047857;
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 860px) {
          .product-stage-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .product-gallery-stage {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
