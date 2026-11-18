// src/pages/customer/Home.jsx
// Premium Editorial Homepage for DukanNest - Where Local Shops Feel at Home
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import heroArtisanImg from '../../assets/hero_dukan_artisan.jpg';
import {
  Utensils,
  Palette,
  Armchair,
  Shirt,
  Sparkles,
  Heart,
  Search,
  MapPin,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const FALLBACK_SHOP_IMG = '/images/shop_candle.jpg';

const HOME_CATEGORIES = [
  { name: 'Handmade Crafts', icon: Palette, slug: 'handmade', subtitle: 'Pottery & Woodwork' },
  { name: 'Home & Living', icon: Armchair, slug: 'home-decor', subtitle: 'Candles & Decor' },
  { name: 'Food & Gourmet', icon: Utensils, slug: 'food', subtitle: 'Artisanal Pantry' },
  { name: 'Fashion & Apparel', icon: Shirt, slug: 'clothing', subtitle: 'Handspun Textiles' },
  { name: 'Natural Wellness', icon: Heart, slug: 'wellness', subtitle: 'Herbal Care' },
  { name: 'Decor & Artifacts', icon: Sparkles, slug: 'decor', subtitle: 'Brass & Heritage' },
];

const LOCAL_SHOPS = [
  {
    id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
    name: 'The Candle Co.',
    category: 'Handmade Aromatherapy',
    locality: 'Civil Lines',
    city: 'Mathura',
    image: '/images/shop_candle.jpg',
  },
  {
    id: '8342d568-06b5-400b-b628-fa160e30ed4c',
    name: 'Vrindavan Artifacts',
    category: 'Brass & Heritage Decor',
    locality: 'Raman Reti',
    city: 'Mathura',
    image: '/images/shop_green_basket.jpg',
  },
  {
    id: 'ba0d5772-ec62-4625-a72e-0269a7203958',
    name: 'Aura Crafts',
    category: 'Handcrafted Textiles',
    locality: 'Green Park',
    city: 'Mathura',
    image: '/images/shop_craft_corner.jpg',
  },
  {
    id: 'ca456513-cc46-479e-9fa7-3a8dd98b7dbc',
    name: 'Artisan Kitchen & Pantry',
    category: 'Local Honey & Delicacies',
    locality: 'Holi Gate',
    city: 'Mathura',
    image: '/images/shop_kitchen.jpg',
  },
];

const SAMPLE_LOCAL_PRODUCTS = [
  {
    id: 'art-1',
    name: 'Handmade Scented Candle',
    price: 199,
    stock_quantity: 40,
    image_url: '/images/product_candle.jpg',
    shop_locality: 'Civil Lines',
    shop_city: 'Mathura',
    shop_id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
  },
  {
    id: 'art-2',
    name: 'Cotton Canvas Tote Bag',
    price: 249,
    stock_quantity: 25,
    image_url: '/images/product_tote.jpg',
    shop_locality: 'Green Park',
    shop_city: 'Mathura',
  },
  {
    id: 'art-3',
    name: 'Handcrafted Wooden Coaster Set',
    price: 299,
    stock_quantity: 15,
    image_url: '/images/product_coasters.jpg',
    shop_locality: 'Raman Reti',
    shop_city: 'Mathura',
  },
  {
    id: 'art-4',
    name: 'Herbal Botanical Face Wash',
    price: 149,
    stock_quantity: 50,
    image_url: '/images/product_facewash.jpg',
    shop_locality: 'Goverdhan',
    shop_city: 'Mathura',
  },
  {
    id: 'art-5',
    name: 'Bohemian Macrame Wall Hanging',
    price: 399,
    stock_quantity: 12,
    image_url: '/images/product_macrame.jpg',
    shop_locality: 'Civil Lines',
    shop_city: 'Mathura',
  },
  {
    id: 'art-6',
    name: 'Raw Organic Forest Honey (500g)',
    price: 399,
    stock_quantity: 30,
    image_url: '/images/product_honey.jpg',
    shop_locality: 'Mathura Cantt',
    shop_city: 'Mathura',
  },
  {
    id: 'art-7',
    name: 'Terracotta Hand-Poured Planter Pot',
    price: 349,
    stock_quantity: 18,
    image_url: '/images/product_planter.jpg',
    shop_locality: 'Goverdhan',
    shop_city: 'Mathura',
  },
  {
    id: 'art-8',
    name: 'Pure Brass Diyas & Temple Lamp',
    price: 599,
    stock_quantity: 8,
    image_url: '/images/shop_craft_corner.jpg',
    shop_locality: 'Holi Gate',
    shop_city: 'Mathura',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        setProducts(items.length > 0 ? items : SAMPLE_LOCAL_PRODUCTS);
      })
      .catch(() => {
        setProducts(SAMPLE_LOCAL_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  // Curate a balanced, highly diverse selection of products across distinct craft categories
  // Prevents multiple repeating clay pots or candles in a row on the homepage
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const seenCategories = new Set();
    const diverseList = [];

    // Pass 1: One product per unique product family/craft
    for (const p of products) {
      const name = (p.name || '').toLowerCase();
      let family = 'general';
      if (name.includes('scarf') || name.includes('silk') || name.includes('textile')) family = 'textile';
      else if (name.includes('bell')) family = 'bell';
      else if (name.includes('idol')) family = 'idol';
      else if (name.includes('diya') || name.includes('brass')) family = 'brass_diya';
      else if (name.includes('incense') || name.includes('aroma')) family = 'incense';
      else if (name.includes('toy') || name.includes('figurine')) family = 'clay_toy';
      else if (name.includes('cooking') || name.includes('handi')) family = 'handi';
      else if (name.includes('water pot') || name.includes('matka')) family = 'matka';
      else if (name.includes('terracotta') || name.includes('pot')) family = 'pot';
      else if (name.includes('jasmine') || (name.includes('candle') && name.includes('jasmine'))) family = 'jasmine_candle';
      else if (name.includes('lavender') || (name.includes('candle') && name.includes('lavender'))) family = 'lavender_candle';
      else if (name.includes('candle')) family = 'candle';
      else if (name.includes('honey')) family = 'honey';
      else if (name.includes('tote') || name.includes('bag')) family = 'tote';
      else if (name.includes('coaster')) family = 'coaster';
      else if (name.includes('facewash') || name.includes('wash')) family = 'skincare';
      else if (name.includes('macrame')) family = 'macrame';

      if (!seenCategories.has(family)) {
        seenCategories.add(family);
        diverseList.push(p);
      }
    }

    // Pass 2: If we have fewer than 8, fill with remaining products
    for (const p of products) {
      if (diverseList.length >= 8) break;
      if (!diverseList.some(d => d.id === p.id)) {
        diverseList.push(p);
      }
    }

    return diverseList.slice(0, 8);
  }, [products]);

  return (
    <div className="home-editorial-page">
      <div className="container">
        {/* ===== HERO SECTION ===== */}
        <section className="hero-editorial-section">
          <div className="hero-grid-container">
            {/* Left Text Column */}
            <div className="hero-content-col">
              <div className="hero-kicker-tag">
                <span className="kicker-dot" />
                <span>Verified Independent Indian Creators</span>
              </div>

              <h1 className="hero-main-headline">
                Support Local.<br />
                <span className="headline-accent">Shop Neighborhood.</span>
              </h1>

              <p className="hero-description-text">
                Connect with local potters, weavers, and independent makers in your community. Every purchase directly empowers authentic local livelihoods.
              </p>

              {/* In-Hero Search Input */}
              <form onSubmit={handleHeroSearch} className="hero-search-form">
                <Search size={16} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search terracotta pottery, soy candles, honey..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="hero-search-input"
                />
                <button type="submit" className="hero-search-btn">
                  Explore
                </button>
              </form>

              {/* Visually Consistent Trending Suggestions */}
              <div className="hero-trending-row">
                <span className="trending-title">Popular searches:</span>
                <div className="trending-chips-wrap">
                  {['Soy Candles', 'Terracotta', 'Raw Honey', 'Tote Bags', 'Macrame'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="trending-chip-item"
                      onClick={() => navigate(`/products?search=${encodeURIComponent(tag.toLowerCase())}`)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Photo Column: Authentic Indian Handcrafted Products Visual */}
            <div className="hero-visual-col">
              <div className="hero-image-frame">
                <img
                  src={heroArtisanImg}
                  alt="Authentic Indian Handcrafted Pottery & Artisan Workshop - DukanNest"
                  className="hero-artisan-photo"
                  onError={(e) => {
                    e.target.src = '/images/hero_indian_pottery.jpg';
                  }}
                />
                <div className="hero-photo-caption">
                  <Store size={14} className="text-emerald" />
                  <span>Handcrafted with local pride in Mathura &amp; NCR</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CURATED CATEGORIES SECTION ===== */}
        <section className="home-content-section">
          <div className="section-title-row">
            <div>
              <h2 className="section-heading-text">Browse by Craft &amp; Category</h2>
              <p className="section-subheading-text">Discover collections handcrafted with care by local makers</p>
            </div>
            <Link to="/products" className="section-link-more">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="category-cards-grid">
            {HOME_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  className="category-artisan-card"
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                >
                  <div className="category-icon-stage">
                    <IconComp size={20} className="category-svg-icon" />
                  </div>
                  <div className="category-text-block">
                    <span className="category-title-text">{cat.name}</span>
                    <span className="category-subtitle-text">{cat.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ===== NEIGHBORHOOD DISCOVERY STRIP ===== */}
        <section className="neighborhood-discovery-block">
          <div className="neighborhood-inner-flex">
            <div className="neighborhood-label-group">
              <MapPin size={16} className="text-emerald" />
              <span className="neighborhood-title">Neighborhood Discovery:</span>
            </div>
            <div className="neighborhood-pills-row">
              {[
                { name: 'All Neighborhoods', url: '/products' },
                { name: 'Civil Lines', url: '/products?locality=Civil%20Lines' },
                { name: 'Green Park', url: '/products?locality=Green%20Park' },
                { name: 'Raman Reti', url: '/products?locality=Raman%20Reti' },
                { name: 'Goverdhan', url: '/products?locality=Goverdhan' },
                { name: 'Holi Gate', url: '/products?locality=Holi%20Gate' },
                { name: 'Mathura Cantt', url: '/products?city=Mathura%20Cantt' },
              ].map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  className={`neighborhood-pill-btn ${i === 0 ? 'selected' : ''}`}
                  onClick={() => navigate(loc.url)}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== POPULAR LOCAL SHOPS (NO FAKE RATINGS) ===== */}
        <section className="home-content-section">
          <div className="section-title-row">
            <div>
              <h2 className="section-heading-text">Neighborhood Artisan Shops</h2>
              <p className="section-subheading-text">Visit verified local merchant storefronts in your area</p>
            </div>
            <Link to="/products" className="section-link-more">
              <span>Explore All Shops</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="shops-editorial-grid">
            {LOCAL_SHOPS.map((shop) => (
              <div
                key={shop.id}
                className="shop-editorial-card"
                onClick={() => navigate(`/shop/${shop.id}`)}
              >
                <div className="shop-cover-stage">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="shop-cover-image"
                    onError={(e) => { e.target.src = FALLBACK_SHOP_IMG; }}
                  />
                  <div className="shop-locality-chip">
                    <MapPin size={10} />
                    <span>{shop.locality || shop.city}</span>
                  </div>
                </div>

                <div className="shop-info-stage">
                  <h3 className="shop-name-title">{shop.name}</h3>
                  <span className="shop-specialty-text">{shop.category}</span>

                  <div className="shop-footer-meta">
                    <span className="shop-verified-tag">
                      <CheckCircle2 size={12} className="text-emerald" />
                      <span>Verified Local Shop</span>
                    </span>
                    <span className="shop-visit-link">
                      Visit Storefront →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FEATURED ARTISAN PRODUCTS GRID ===== */}
        <section className="home-content-section" style={{ marginBottom: '60px' }}>
          <div className="section-title-row">
            <div>
              <h2 className="section-heading-text">Featured Local Creations</h2>
              <p className="section-subheading-text">Genuine handmade and curated goods ready for local fulfillment</p>
            </div>
            <Link to="/products" className="section-link-more">
              <span>View Entire Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <LoadingSpinner text="Fetching local artisan catalog..." />
            </div>
          ) : (
            <div className="products-artisan-grid">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .home-editorial-page {
          padding-top: 20px;
        }

        /* ===== HERO SECTION ===== */
        .hero-editorial-section {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 40px;
          margin-bottom: 36px;
        }
        .hero-grid-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }

        .hero-kicker-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: #065F46;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          padding: 3px 10px;
          border-radius: 6px;
          margin-bottom: 16px;
        }
        .kicker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #059669;
        }

        .hero-main-headline {
          font-size: 38px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.6px;
          color: #0F172A;
          margin-bottom: 14px;
        }
        .headline-accent {
          color: #059669;
        }

        .hero-description-text {
          font-size: 14.5px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 480px;
        }

        /* In-Hero Search */
        .hero-search-form {
          display: flex;
          align-items: center;
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          padding: 3px 3px 3px 12px;
          max-width: 460px;
          margin-bottom: 18px;
          transition: all 0.15s ease;
        }
        .hero-search-form:focus-within {
          background: #FFFFFF;
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }
        .hero-search-icon {
          color: #94A3B8;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .hero-search-input {
          border: none;
          background: transparent;
          font-size: 13.5px;
          color: #0F172A;
          width: 100%;
          outline: none;
        }
        .hero-search-btn {
          background: #059669;
          color: #FFFFFF;
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .hero-search-btn:hover {
          background: #047857;
        }

        /* Trending */
        .hero-trending-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          flex-wrap: wrap;
        }
        .trending-title {
          color: #64748B;
          font-weight: 500;
        }
        .trending-chips-wrap {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .trending-chip-item {
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          color: #334155;
          font-size: 11.5px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .trending-chip-item:hover {
          background: #ECFDF5;
          border-color: #A7F3D0;
          color: #059669;
        }

        /* Hero Photo Stage */
        .hero-image-frame {
          position: relative;
          width: 100%;
          height: 340px;
          border-radius: 10px;
          overflow: hidden;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }
        .hero-artisan-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-photo-caption {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 6px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #0F172A;
        }

        /* ===== SECTION COMMON ===== */
        .home-content-section {
          margin-bottom: 40px;
        }
        .section-title-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .section-heading-text {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.3px;
          margin-bottom: 3px;
        }
        .section-subheading-text {
          font-size: 13px;
          color: #64748B;
        }
        .section-link-more {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #059669;
          text-decoration: none;
        }
        .section-link-more:hover {
          text-decoration: underline;
        }

        /* ===== CATEGORIES GRID ===== */
        .category-cards-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .category-artisan-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .category-artisan-card:hover {
          border-color: #059669;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }
        .category-icon-stage {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #F4F7F5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          color: #059669;
          transition: background 0.15s ease;
        }
        .category-artisan-card:hover .category-icon-stage {
          background: #ECFDF5;
        }
        .category-title-text {
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
          display: block;
          line-height: 1.25;
        }
        .category-subtitle-text {
          font-size: 10.5px;
          color: #64748B;
          display: block;
          margin-top: 2px;
        }

        /* ===== NEIGHBORHOOD DISCOVERY BLOCK ===== */
        .neighborhood-discovery-block {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 12px 18px;
          margin-bottom: 40px;
        }
        .neighborhood-inner-flex {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .neighborhood-label-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .neighborhood-title {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
        }
        .neighborhood-pills-row {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .neighborhood-pills-row::-webkit-scrollbar {
          display: none;
        }
        .neighborhood-pill-btn {
          white-space: nowrap;
          padding: 5px 12px;
          border-radius: 6px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          color: #334155;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .neighborhood-pill-btn:hover {
          border-color: #059669;
          color: #059669;
        }
        .neighborhood-pill-btn.selected {
          background: #ECFDF5;
          border-color: #059669;
          color: #065F46;
          font-weight: 700;
        }

        /* ===== SHOPS GRID ===== */
        .shops-editorial-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .shop-editorial-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all 0.15s ease;
        }
        .shop-editorial-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 8px 18px -4px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }
        .shop-cover-stage {
          position: relative;
          height: 130px;
          background: #F1F5F9;
          overflow: hidden;
        }
        .shop-cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shop-locality-chip {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .shop-info-stage {
          padding: 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .shop-name-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 2px;
        }
        .shop-specialty-text {
          font-size: 12px;
          color: #64748B;
          margin-bottom: 12px;
        }
        .shop-footer-meta {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #F1F5F9;
        }
        .shop-verified-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #059669;
        }
        .shop-visit-link {
          font-size: 11.5px;
          font-weight: 600;
          color: #059669;
        }

        /* ===== PRODUCTS GRID ===== */
        .products-artisan-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .category-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .shops-editorial-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .products-artisan-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .hero-grid-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .hero-image-frame {
            height: 220px;
          }
          .hero-main-headline {
            font-size: 28px;
          }
          .products-artisan-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .neighborhood-inner-flex {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        @media (max-width: 520px) {
          .category-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .shops-editorial-grid {
            grid-template-columns: 1fr;
          }
          .products-artisan-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
