// src/pages/customer/Products.jsx
// Premium Editorial Product Catalog & Locality Discovery
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  SlidersHorizontal,
  MapPin,
  RotateCcw,
  Search,
  ArrowUpDown,
  Check,
  Compass,
  X,
  Package,
} from 'lucide-react';

const CATALOG_CATEGORIES = [
  'All',
  'Fashion',
  'Home & Living',
  'Handmade',
  'Food & Beverages',
  'Beauty & Personal Care',
  'Heritage Decor',
];

const PRICE_TIERS = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: 'Above ₹2,000', min: 2000, max: 999999 },
];

const LOCAL_SAMPLE_ITEMS = [
  {
    id: 'prod-candle-1',
    name: 'Handmade Scented Candle',
    category: 'Handmade',
    price: 199,
    stock_quantity: 40,
    image_url: '/images/product_candle.jpg',
    shop_name: 'The Candle Co.',
    shop_locality: 'Green Park',
    shop_city: 'Mathura',
    shop_pincode: '281001',
    shop_id: '463f9983-3d0d-4e15-9e14-0ecaf69b6365',
  },
  {
    id: 'prod-tote-2',
    name: 'Cotton Canvas Tote Bag',
    category: 'Fashion',
    price: 249,
    stock_quantity: 30,
    image_url: '/images/product_tote.jpg',
    shop_name: 'Aura Crafts',
    shop_locality: 'Civil Lines',
    shop_city: 'Mathura',
    shop_pincode: '281001',
  },
  {
    id: 'prod-coaster-3',
    name: 'Handcrafted Wooden Coaster Set',
    category: 'Home & Living',
    price: 299,
    stock_quantity: 20,
    image_url: '/images/product_coasters.jpg',
    shop_name: 'Vrindavan Artifacts',
    shop_locality: 'Raman Reti',
    shop_city: 'Mathura',
    shop_pincode: '281502',
  },
  {
    id: 'prod-facewash-4',
    name: 'Herbal Botanical Face Wash',
    category: 'Beauty & Personal Care',
    price: 149,
    stock_quantity: 50,
    image_url: '/images/product_facewash.jpg',
    shop_name: 'Green Basket',
    shop_locality: 'Krishna Nagar',
    shop_city: 'Mathura',
    shop_pincode: '281004',
  },
  {
    id: 'prod-macrame-5',
    name: 'Bohemian Macrame Wall Hanging',
    category: 'Home & Living',
    price: 399,
    stock_quantity: 15,
    image_url: '/images/product_macrame.jpg',
    shop_name: 'Craft Corner',
    shop_locality: 'Goverdhan',
    shop_city: 'Mathura',
    shop_pincode: '281502',
  },
  {
    id: 'prod-honey-6',
    name: 'Raw Organic Forest Honey (500g)',
    category: 'Food & Beverages',
    price: 399,
    stock_quantity: 35,
    image_url: '/images/product_honey.jpg',
    shop_name: "Aarav's Kitchen",
    shop_locality: 'Vrindavan Road',
    shop_city: 'Mathura',
    shop_pincode: '281003',
  },
  {
    id: 'prod-brass-7',
    name: 'Handcrafted Brass Diya Lamp',
    category: 'Heritage Decor',
    price: 399,
    stock_quantity: 45,
    image_url: '/images/product_brass_diya.jpg',
    shop_name: 'Vrindavan Artifacts',
    shop_locality: 'Raman Reti',
    shop_city: 'Mathura',
    shop_pincode: '281502',
  },
  {
    id: 'prod-matka-8',
    name: 'Terracotta Water Pot (Earthen Matka)',
    category: 'Handmade',
    price: 299,
    stock_quantity: 28,
    image_url: '/images/product_terracotta_matka.jpg',
    shop_name: 'Kusum Terracotta',
    shop_locality: 'Goverdhan',
    shop_city: 'Mathura',
    shop_pincode: '281502',
  },
  {
    id: 'prod-handi-9',
    name: 'Clay Cooking Pot (Handi)',
    category: 'Home & Living',
    price: 349,
    stock_quantity: 25,
    image_url: '/images/product_clay_handi.jpg',
    shop_name: 'Goverdhan Heritage Pottery',
    shop_locality: 'Goverdhan',
    shop_city: 'Mathura',
    shop_pincode: '281502',
  },
  {
    id: 'prod-jasmine-10',
    name: 'Jasmine Soy Candle',
    category: 'Handmade',
    price: 249,
    stock_quantity: 40,
    image_url: '/images/product_jasmine_candle.jpg',
    shop_name: 'GreenPark Natural Scents',
    shop_locality: 'Green Park',
    shop_city: 'Mathura',
    shop_pincode: '281001',
  },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';
  const localityParam = searchParams.get('locality') || '';
  const pincodeParam = searchParams.get('pincode') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [selectedCity, setSelectedCity] = useState(cityParam || 'All');
  const [selectedLocality, setSelectedLocality] = useState(localityParam || 'All');
  const [selectedPincode, setSelectedPincode] = useState(pincodeParam || '');
  const [selectedPriceTier, setSelectedPriceTier] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (cityParam) setSelectedCity(cityParam);
    if (localityParam) setSelectedLocality(localityParam);
    if (pincodeParam) setSelectedPincode(pincodeParam);
  }, [categoryParam, cityParam, localityParam, pincodeParam]);

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then((res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        setProducts(items.length > 0 ? items : LOCAL_SAMPLE_ITEMS);
      })
      .catch(() => {
        setProducts(LOCAL_SAMPLE_ITEMS);
      })
      .finally(() => setLoading(false));
  }, []);

  const availableCities = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const c = p.shop_city || p.city;
      if (c) set.add(c.trim());
    });
    if (selectedCity && selectedCity !== 'All') set.add(selectedCity);
    return ['All', ...Array.from(set).sort()];
  }, [products, selectedCity]);

  const availableLocalities = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const loc = p.shop_locality || p.locality;
      if (loc) set.add(loc.trim());
    });
    if (selectedLocality && selectedLocality !== 'All') set.add(selectedLocality);
    return ['All', ...Array.from(set).sort()];
  }, [products, selectedLocality]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedCity('All');
    setSelectedLocality('All');
    setSelectedPincode('');
    setSelectedPriceTier(null);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const handleClearLocationFilters = () => {
    setSelectedCity('All');
    setSelectedLocality('All');
    setSelectedPincode('');
    const next = new URLSearchParams(searchParams);
    next.delete('locality');
    next.delete('city');
    next.delete('pincode');
    setSearchParams(next);
  };

  const handleLocalityChange = (val) => {
    setSelectedLocality(val);
    const next = new URLSearchParams(searchParams);
    if (val === 'All') next.delete('locality');
    else next.set('locality', val);
    setSearchParams(next);
  };

  const handleCityChange = (val) => {
    setSelectedCity(val);
    const next = new URLSearchParams(searchParams);
    if (val === 'All') next.delete('city');
    else next.set('city', val);
    setSearchParams(next);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search text
      if (searchParam && !p.name.toLowerCase().includes(searchParam.toLowerCase())) {
        return false;
      }
      // Category
      if (selectedCategory && selectedCategory !== 'All') {
        const match =
          (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (p.category_name && p.category_name.toLowerCase().includes(selectedCategory.toLowerCase()));
        if (!match) return false;
      }
      // City Filter
      if (selectedCity && selectedCity !== 'All') {
        const pCity = (p.shop_city || p.city || '').toLowerCase();
        if (!pCity.includes(selectedCity.toLowerCase())) return false;
      }
      // Locality Filter
      if (selectedLocality && selectedLocality !== 'All') {
        const pLoc = (p.shop_locality || p.locality || '').toLowerCase();
        if (!pLoc.includes(selectedLocality.toLowerCase())) return false;
      }
      // Pincode Filter
      if (selectedPincode && selectedPincode.trim()) {
        const pPin = (p.shop_pincode || p.pincode || '').toString().trim();
        if (!pPin.includes(selectedPincode.trim())) return false;
      }
      // Price
      if (selectedPriceTier) {
        const price = Number(p.price || 0);
        if (price < selectedPriceTier.min || price > selectedPriceTier.max) {
          return false;
        }
      }
      // In Stock Only
      if (inStockOnly && Number(p.stock_quantity ?? 0) <= 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // default featured
    });
  }, [products, searchParam, selectedCategory, selectedCity, selectedLocality, selectedPincode, selectedPriceTier, inStockOnly, sortBy]);

  const hasLocationFilter = selectedCity !== 'All' || selectedLocality !== 'All' || Boolean(selectedPincode.trim());

  return (
    <div className="catalog-master-page">
      <div className="container">
        {/* Page Top Heading & Mobile Filter Button */}
        <div className="catalog-header-banner">
          <div>
            <div className="catalog-breadcrumb">
              <span>Marketplace</span> • <span>Artisan Catalog</span>
              {selectedCategory !== 'All' && <span> • <strong>{selectedCategory}</strong></span>}
            </div>
            <h1 className="catalog-heading">
              {searchParam ? `Search results for "${searchParam}"` : 'Browse Local Products'}
            </h1>
            <p className="catalog-subheading">
              Showing {filteredProducts.length} unique products from independent neighborhood artisans
            </p>
          </div>

          <button
            type="button"
            className="mobile-filter-trigger hide-desktop"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={15} />
            <span>Filters ({hasLocationFilter ? 'Active' : 'All'})</span>
          </button>
        </div>

        {/* Hyperlocal Discovery Filter Bar */}
        <div className="locality-filter-panel card">
          <div className="locality-filter-header">
            <div className="filter-title-group">
              <MapPin size={16} className="text-emerald" />
              <div>
                <strong className="locality-heading-text">Neighborhood &amp; Locality Discovery</strong>
                <span className="locality-caption-text">Filter products by local seller location</span>
              </div>
            </div>
            {hasLocationFilter && (
              <button
                type="button"
                className="clear-location-btn"
                onClick={handleClearLocationFilters}
              >
                <RotateCcw size={12} />
                <span>Reset Location</span>
              </button>
            )}
          </div>

          <div className="locality-controls-grid">
            <div className="locality-select-wrap">
              <label className="filter-field-label">Locality / Area</label>
              <select
                value={selectedLocality}
                onChange={(e) => handleLocalityChange(e.target.value)}
                className="filter-select-element"
              >
                {availableLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'All' ? 'All Localities' : loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="locality-select-wrap">
              <label className="filter-field-label">City / Region</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="filter-select-element"
              >
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'All' ? 'All Cities' : city}
                  </option>
                ))}
              </select>
            </div>

            <div className="locality-select-wrap">
              <label className="filter-field-label">Pincode / Postal Area</label>
              <input
                type="text"
                placeholder="e.g. 281001"
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                className="filter-input-element"
              />
            </div>
          </div>
        </div>

        {/* Main 2-Column Catalog Grid */}
        <div className="catalog-body-grid">
          {/* Left Column: Filter Sidebar */}
          <aside className={`catalog-sidebar-pane ${mobileFilterOpen ? 'mobile-drawer-open' : ''}`}>
            <div className="sidebar-card card">
              <div className="sidebar-pane-header">
                <div className="sidebar-title-flex">
                  <SlidersHorizontal size={15} className="text-emerald" />
                  <h3 className="sidebar-pane-title">Filter Catalog</h3>
                </div>
                <div className="sidebar-actions-flex">
                  <button type="button" className="sidebar-reset-btn" onClick={handleClearFilters}>
                    Clear All
                  </button>
                  <button
                    type="button"
                    className="mobile-close-drawer-btn hide-desktop"
                    onClick={() => setMobileFilterOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="filter-section-group">
                <h4 className="filter-group-title">Category</h4>
                <div className="filter-options-stack">
                  {CATALOG_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`filter-category-pill ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span>{cat}</span>
                      {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                        <Check size={13} className="check-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-divider" />

              {/* Price Range */}
              <div className="filter-section-group">
                <h4 className="filter-group-title">Price Range</h4>
                <div className="filter-options-stack">
                  {PRICE_TIERS.map((tier, i) => {
                    const isSelected = selectedPriceTier?.label === tier.label;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`filter-tier-row ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedPriceTier(isSelected ? null : tier)}
                      >
                        <div className={`filter-radio-box ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <span className="radio-inner-dot" />}
                        </div>
                        <span className="filter-tier-text">{tier.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sidebar-divider" />

              {/* Availability Filter */}
              <div className="filter-section-group">
                <h4 className="filter-group-title">Stock Availability</h4>
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="filter-checkbox-input"
                  />
                  <span className="filter-checkbox-text">In Stock Items Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Column: Products Display */}
          <main className="catalog-content-pane">
            {/* Sort & Count Bar */}
            <div className="catalog-toolbar-bar card">
              <span className="showing-count-text">
                Showing <strong>{filteredProducts.length}</strong> items
              </span>

              <div className="sort-control-group">
                <ArrowUpDown size={13} className="text-muted" />
                <label className="sort-label">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-dropdown-element"
                >
                  <option value="featured">Featured / Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Product Name (A-Z)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <LoadingSpinner text="Loading marketplace products..." />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-catalog-state card">
                <div className="empty-icon-wrap">
                  <Compass size={24} />
                </div>
                <h3>No Matching Products Found</h3>
                <p>
                  No items currently match your chosen locality, category, or price filters. Try resetting your search or exploring all locations.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleClearFilters}
                >
                  <RotateCcw size={13} /> Clear All Filters
                </button>
              </div>
            ) : (
              <div className="catalog-products-grid">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .catalog-master-page {
          padding-top: 20px;
          padding-bottom: 60px;
        }

        .catalog-header-banner {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .catalog-breadcrumb {
          font-size: 12px;
          color: #64748B;
          margin-bottom: 4px;
        }
        .catalog-heading {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.4px;
          margin-bottom: 3px;
        }
        .catalog-subheading {
          font-size: 13px;
          color: #64748B;
        }

        .mobile-filter-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: #0F172A;
          cursor: pointer;
        }

        /* Locality Panel */
        .locality-filter-panel {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .locality-filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .filter-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .locality-heading-text {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          display: block;
        }
        .locality-caption-text {
          font-size: 11.5px;
          color: #64748B;
          display: block;
        }
        .clear-location-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #0F172A;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .clear-location-btn:hover {
          background: #ECFDF5;
          color: #059669;
          border-color: #A7F3D0;
        }

        .locality-controls-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .locality-select-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-field-label {
          font-size: 11.5px;
          font-weight: 600;
          color: #475569;
        }
        .filter-select-element, .filter-input-element {
          width: 100%;
          padding: 7px 10px;
          font-size: 13px;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background: #F8FAFC;
          color: #0F172A;
          outline: none;
        }
        .filter-select-element:focus, .filter-input-element:focus {
          border-color: #059669;
          background: #FFFFFF;
        }

        /* 2-Column Grid */
        .catalog-body-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
          align-items: start;
        }

        /* Sidebar */
        .sidebar-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 18px;
        }
        .sidebar-pane-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .sidebar-title-flex {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sidebar-pane-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }
        .sidebar-reset-btn {
          font-size: 11.5px;
          font-weight: 600;
          color: #059669;
          background: none;
          border: none;
          cursor: pointer;
        }
        .sidebar-reset-btn:hover {
          text-decoration: underline;
        }

        .filter-section-group {
          margin-bottom: 16px;
        }
        .filter-group-title {
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 10px;
        }
        .filter-options-stack {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .filter-category-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12.5px;
          font-weight: 500;
          color: #334155;
          background: transparent;
          border: 1px solid transparent;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-category-pill:hover {
          background: #F1F5F9;
        }
        .filter-category-pill.active {
          background: #ECFDF5;
          color: #065F46;
          border-color: #A7F3D0;
          font-weight: 700;
        }
        .check-icon {
          color: #059669;
        }

        .sidebar-divider {
          height: 1px;
          background: #F1F5F9;
          margin: 14px 0;
        }

        .filter-tier-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 8px;
          border-radius: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 12.5px;
          color: #334155;
          text-align: left;
          transition: all 0.15s ease;
        }
        .filter-tier-row:hover {
          background: #F8FAFC;
        }
        .filter-radio-box {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1.5px solid #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .filter-radio-box.checked {
          border-color: #059669;
        }
        .radio-inner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #059669;
        }

        .filter-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .filter-checkbox-input {
          accent-color: #059669;
          width: 14px;
          height: 14px;
        }
        .filter-checkbox-text {
          font-size: 12.5px;
          color: #334155;
        }

        /* Toolbar */
        .catalog-toolbar-bar {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .showing-count-text {
          font-size: 13px;
          color: #475569;
        }
        .sort-control-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sort-label {
          font-size: 12px;
          color: #64748B;
        }
        .sort-dropdown-element {
          padding: 4px 8px;
          font-size: 12.5px;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          background: #F8FAFC;
          color: #0F172A;
          outline: none;
        }

        /* Products Grid */
        .catalog-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* Empty State */
        .empty-catalog-state {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 48px 24px;
          text-align: center;
          max-width: 500px;
          margin: 20px auto;
        }
        .empty-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #F1F5F9;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px auto;
        }
        .empty-catalog-state h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #0F172A;
        }
        .empty-catalog-state p {
          font-size: 13px;
          color: #64748B;
          margin-bottom: 18px;
          line-height: 1.5;
        }

        @media (max-width: 1024px) {
          .catalog-products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .catalog-body-grid {
            grid-template-columns: 1fr;
          }
          .catalog-sidebar-pane {
            display: none;
          }
          .catalog-sidebar-pane.mobile-drawer-open {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.5);
            z-index: 1000;
            padding: 20px;
            overflow-y: auto;
          }
          .mobile-filter-trigger {
            display: inline-flex;
          }
          .locality-controls-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 520px) {
          .catalog-products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
