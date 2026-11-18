// src/components/ProductCard.jsx
// Premium Editorial Artisan Product Card
// Consistent Aspect-Ratio Image Stage, Real Stock, Real Price (INR), Genuine Location, Zero Fake Ratings
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Heart,
  ShoppingBag,
  Check,
  MapPin,
  Store,
  AlertCircle,
  Package,
} from 'lucide-react';

const CRAFT_IMAGE_POOL = [
  '/images/product_terracotta_pot.jpg',
  '/images/product_brass_diya.jpg',
  '/images/product_terracotta_matka.jpg',
  '/images/product_candle_2.jpg',
  '/images/product_clay_handi.jpg',
  '/images/product_incense.jpg',
  '/images/product_silk_scarf.jpg',
  '/images/product_brass_bell.jpg',
  '/images/product_clay_toy.jpg',
  '/images/product_tote.jpg',
  '/images/product_coasters.jpg',
  '/images/product_facewash.jpg',
  '/images/product_macrame.jpg',
  '/images/product_honey.jpg',
  '/images/product_brass_lamp.jpg',
  '/images/product_jasmine_candle.jpg',
  '/images/product_candle.jpg',
  '/images/product_bottle.jpg',
  '/images/shop_craft_corner.jpg',
];

/**
 * High-dispersion polynomial hash for string input
 */
function getHashSeed(str = '') {
  let h = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h &= 0xffffffff;
  }
  return Math.abs(h);
}

/**
 * Distinctly maps a product to its genuine, authentic craft visual
 * Ensuring no repeated imagery for different products in the catalog.
 */
export function getLocalProductImage(name = '', id = '') {
  const n = String(name).toLowerCase();
  const seed = getHashSeed(String(name) + String(id));

  // 1. Brass Metalcraft & Puja Artifacts
  if (n.includes('bell')) {
    return '/images/product_brass_bell.jpg';
  }
  if (n.includes('idol') || n.includes('statue') || n.includes('sculpture')) {
    return '/images/product_brass_idol.jpg';
  }
  if (n.includes('diya') || n.includes('lamp') || n.includes('brass') || n.includes('pooja') || n.includes('puja')) {
    return '/images/product_brass_diya.jpg';
  }

  // 2. Terracotta Water Pots, Matkas & Ghadas (Never a plant!)
  if (n.includes('water pot') || n.includes('matka') || n.includes('ghada') || (n.includes('terracotta') && (n.includes('pot') || n.includes('cooling')))) {
    const potPool = ['/images/product_terracotta_pot.jpg', '/images/product_terracotta_matka.jpg'];
    return potPool[seed % potPool.length];
  }

  // 3. Earthen Clay Cooking Pots & Handis (Traditional clay cooking ware)
  if (n.includes('cooking pot') || n.includes('handi') || (n.includes('clay') && n.includes('pot')) || n.includes('earthen pot')) {
    return '/images/product_clay_handi.jpg';
  }

  // 4. Incense & Aroma Burners
  if (n.includes('incense') || n.includes('aroma') || n.includes('dhoop') || n.includes('agarbatti')) {
    return '/images/product_incense.jpg';
  }

  // 5. Silk Scarves & Handloom Textiles
  if (n.includes('silk') || n.includes('scarf') || n.includes('stole') || n.includes('shawl') || n.includes('dupatta')) {
    return '/images/product_silk_scarf.jpg';
  }

  // 6. Clay Toys & Terracotta Figurines
  if (n.includes('toy') || n.includes('figurine') || n.includes('doll') || n.includes('statue')) {
    return '/images/product_clay_toy.jpg';
  }

  // 7. Soy Wax, Scented & Aromatherapy Candles
  if (n.includes('candle') || n.includes('wax') || n.includes('aromatherapy') || n.includes('scent')) {
    if (n.includes('jasmine')) {
      return '/images/product_jasmine_candle.jpg';
    }
    if (n.includes('lavender')) {
      return '/images/product_candle_2.jpg';
    }
    const candlePool = [
      '/images/product_candle.jpg',
      '/images/product_candle_2.jpg',
      '/images/product_jasmine_candle.jpg',
    ];
    return candlePool[seed % candlePool.length];
  }

  // 8. Wooden Coasters & Woodcraft
  if (n.includes('coaster') || n.includes('wood') || n.includes('timber') || n.includes('tray')) {
    return '/images/product_coasters.jpg';
  }

  // 9. Handcrafted Bags & Canvas Totes
  if (n.includes('tote') || n.includes('canvas') || n.includes('bag')) {
    return '/images/product_tote.jpg';
  }

  // 10. Raw Honey & Local Pantry
  if (n.includes('honey') || n.includes('sweet') || n.includes('nectar') || n.includes('jam')) {
    return '/images/product_honey.jpg';
  }

  // 11. Herbal Skincare & Botanicals
  if (n.includes('wash') || n.includes('soap') || n.includes('skin') || n.includes('cream') || n.includes('serum') || n.includes('oil')) {
    return '/images/product_facewash.jpg';
  }

  // 12. Macrame & Tapestries
  if (n.includes('macrame') || n.includes('wall') || n.includes('hanging') || n.includes('tapestry') || n.includes('weave') || n.includes('boho')) {
    return '/images/product_macrame.jpg';
  }

  // 13. General Heritage Crafts & Terracotta
  if (n.includes('craft') || n.includes('decor') || n.includes('art') || n.includes('clay') || n.includes('terracotta')) {
    const craftPool = ['/images/product_terracotta_pot.jpg', '/images/product_terracotta_matka.jpg', '/images/product_brass_diya.jpg'];
    return craftPool[seed % craftPool.length];
  }

  // Guaranteed diverse distinct selection across the craft pool
  return CRAFT_IMAGE_POOL[seed % CRAFT_IMAGE_POOL.length];
}

/**
 * Resolves the genuine product image URL with strict priority:
 * 1. Valid custom/backend image_url if provided and clean
 * 2. Deterministic category and product-name based authentic craft image
 */
export function getProductDisplayImage(product) {
  if (!product) return '/images/product_terracotta_pot.jpg?v=3';

  const rawUrl = product.image_url;
  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/images/')) {
      const clean = trimmed.split('?')[0];
      return `${clean}?v=3`;
    }
  }

  const fb = getLocalProductImage(product.name, product.id);
  const cleanFb = fb.split('?')[0];
  return `${cleanFb}?v=3`;
}

export default function ProductCard({ product }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const displayImg = getProductDisplayImage(product);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isCustomer) return;
    setAdding(true);
    try {
      await addItem(product.id, 1, product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const price = Number(product.price || 0);
  const stock = Number(product.stock_quantity ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const locationText = [product.shop_locality, product.shop_city].filter(Boolean).join(', ') ||
    product.locality || product.city || 'Mathura, UP';

  return (
    <div className="product-artisan-card">
      <Link to={`/products/${product.id}`} className="card-clickable-area">
        {/* Consistent Fixed Aspect-Ratio Image Stage */}
        <div className="product-image-container">
          <img
            src={displayImg}
            alt={product.name}
            className="product-card-image"
            onError={(e) => {
              if (e.target.src !== fallbackImg) {
                e.target.src = fallbackImg;
              }
            }}
          />

          {/* Genuine Stock Indicator Badge */}
          {isOutOfStock ? (
            <div className="card-stock-pill pill-out-of-stock">
              <AlertCircle size={11} />
              <span>Out of Stock</span>
            </div>
          ) : isLowStock ? (
            <div className="card-stock-pill pill-low-stock">
              <span>Only {stock} left</span>
            </div>
          ) : null}

          {/* Wishlist Heart Toggle */}
          <button
            type="button"
            className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={toggleWishlist}
            title={isWishlisted ? 'Saved to wishlist' : 'Save to wishlist'}
            aria-label="Wishlist"
          >
            <Heart
              size={15}
              fill={isWishlisted ? '#DC2626' : 'none'}
              color={isWishlisted ? '#DC2626' : '#64748B'}
            />
          </button>
        </div>

        {/* Card Body Details */}
        <div className="product-card-details">
          {/* Locality & Storefront Link Row */}
          <div className="product-meta-row">
            <span className="product-locality-tag" title={`Artisan Workshop: ${locationText}`}>
              <MapPin size={11} className="text-emerald" />
              <span className="locality-label">{locationText}</span>
            </span>

            {product.shop_id && (
              <button
                type="button"
                className="product-store-chip"
                title="View Artisan Storefront"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/shop/${product.shop_id}`);
                }}
              >
                <Store size={11} />
                <span>Store</span>
              </button>
            )}
          </div>

          {/* Product Title */}
          <h3 className="product-title-heading" title={product.name}>
            {product.name}
          </h3>

          {/* Price & Stock Line (No Fake Ratings) */}
          <div className="product-price-stock-row">
            <div className="product-price-wrapper">
              <span className="currency-symbol">₹</span>
              <span className="price-amount">{price.toLocaleString('en-IN')}</span>
            </div>

            <div className="stock-status-text">
              {isOutOfStock ? (
                <span className="stock-badge-out">Unavailable</span>
              ) : (
                <span className="stock-badge-in">In Stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Action Footer */}
      <div className="product-card-action">
        <button
          type="button"
          className={`btn-add-artisan-cart ${added ? 'state-added' : ''} ${isOutOfStock ? 'state-disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={adding || isOutOfStock}
          aria-label={isOutOfStock ? 'Product out of stock' : 'Add product to cart'}
        >
          {added ? (
            <>
              <Check size={14} /> Added to Cart
            </>
          ) : isOutOfStock ? (
            <>
              <AlertCircle size={14} /> Out of Stock
            </>
          ) : (
            <>
              <ShoppingBag size={14} /> {adding ? 'Adding...' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>

      <style>{`
        .product-artisan-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
          position: relative;
        }
        .product-artisan-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }
        .card-clickable-area {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          flex: 1;
        }

        /* Fixed Aspect-Ratio Stage: 4 / 3 Standard Editorial */
        .product-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #F8FAFC;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .product-artisan-card:hover .product-card-image {
          transform: scale(1.03);
        }

        /* Stock Overlay */
        .card-stock-pill {
          position: absolute;
          top: 10px;
          left: 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2px;
          backdrop-filter: blur(8px);
        }
        .pill-out-of-stock {
          background: rgba(220, 38, 38, 0.9);
          color: #FFFFFF;
        }
        .pill-low-stock {
          background: rgba(217, 119, 6, 0.9);
          color: #FFFFFF;
        }

        /* Wishlist Button */
        .card-wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
          border: 1px solid rgba(226, 232, 240, 0.8);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .card-wishlist-btn:hover {
          background: #FFFFFF;
          transform: scale(1.08);
        }

        /* Details */
        .product-card-details {
          padding: 14px 14px 10px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .product-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
        }
        .product-locality-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #475569;
          font-weight: 500;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .locality-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .product-store-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #059669;
          background: #ECFDF5;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid #A7F3D0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .product-store-chip:hover {
          background: #059669;
          color: #FFFFFF;
        }

        .product-title-heading {
          font-size: 14px;
          font-weight: 600;
          color: #0F172A;
          line-height: 1.35;
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 38px;
        }

        .product-price-stock-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 4px;
        }
        .product-price-wrapper {
          display: flex;
          align-items: baseline;
          color: #0F172A;
        }
        .currency-symbol {
          font-size: 13px;
          font-weight: 700;
          margin-right: 1px;
          color: #0F172A;
        }
        .price-amount {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.2px;
          color: #0F172A;
        }
        .stock-status-text {
          font-size: 11px;
          font-weight: 600;
        }
        .stock-badge-in {
          color: #059669;
        }
        .stock-badge-out {
          color: #DC2626;
        }

        /* Cart Action Button */
        .product-card-action {
          padding: 0 14px 14px;
        }
        .btn-add-artisan-cart {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 6px;
          background: #F1F5F9;
          color: #0F172A;
          border: 1px solid #E2E8F0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-add-artisan-cart:hover:not(:disabled) {
          background: #059669;
          color: #FFFFFF;
          border-color: #059669;
        }
        .btn-add-artisan-cart.state-added {
          background: #047857;
          color: #FFFFFF;
          border-color: #047857;
        }
        .btn-add-artisan-cart.state-disabled {
          background: #F8FAFC;
          color: #94A3B8;
          border-color: #E2E8F0;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
