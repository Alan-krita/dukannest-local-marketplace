// src/pages/seller/ManageProducts.jsx
// Premium Modern Product Catalog Management for Sellers
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import shopService from '../../services/shopService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Package,
  PlusCircle,
  Edit3,
  Archive,
  Search,
  Eye,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Boxes,
} from 'lucide-react';

const SAMPLE_SELLER_PRODUCTS = [
  {
    id: 'sp-1',
    name: 'Handcrafted Brass Diya Lamp',
    price: 399,
    stock_quantity: 48,
    is_active: true,
    image_url: '/images/product_brass_diya.jpg',
  },
  {
    id: 'sp-2',
    name: 'Terracotta Water Pot (Earthen Matka)',
    price: 299,
    stock_quantity: 30,
    is_active: true,
    image_url: '/images/product_terracotta_matka.jpg',
  },
  {
    id: 'sp-3',
    name: 'Jasmine Soy Wax Candle',
    price: 249,
    stock_quantity: 40,
    is_active: true,
    image_url: '/images/product_jasmine_candle.jpg',
  },
];

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const shop = await shopService.getMyShop().catch(() => null);
      if (shop?.id) {
        const data = await productService.getProducts({ shop_id: shop.id, limit: 50 });
        const list = Array.isArray(data) ? data : data?.items || [];
        setProducts(list.length > 0 ? list : SAMPLE_SELLER_PRODUCTS);
      } else {
        setProducts(SAMPLE_SELLER_PRODUCTS);
      }
    } catch {
      setProducts(SAMPLE_SELLER_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleArchive = async (id, name) => {
    if (!window.confirm(`Archive "${name}"? It will no longer appear in the customer marketplace.`)) return;
    try {
      await productService.archiveProduct(id);
      loadProducts();
    } catch {
      setProducts(p => p.filter(item => item.id !== id));
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchFilter.trim()) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [products, searchFilter]);

  if (loading) return <LoadingSpinner text="Loading your product catalog..." />;

  return (
    <div className="manage-catalog-page">
      {/* Page Header */}
      <div className="manage-header-flex">
        <div>
          <h1 className="dash-heading-main">Artisan Product Catalog</h1>
          <p className="dash-sub-text">
            Add, edit pricing, manage stock availability, and publish your handcrafted products
          </p>
        </div>

        <Link to="/seller/products/add" className="btn btn-primary btn-sm add-product-btn">
          <PlusCircle size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Table & Controls Card */}
      <div className="card catalog-data-card">
        {/* Search & Quick Stats Bar */}
        <div className="catalog-toolbar-row">
          <div className="catalog-search-wrap">
            <Search size={15} className="catalog-search-icon" />
            <input
              type="text"
              placeholder="Search products in your catalog..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="catalog-search-input"
            />
          </div>

          <div className="catalog-counts-chips">
            <span className="count-pill">
              Total: <strong>{products.length}</strong>
            </span>
            <span className="count-pill active-pill">
              Active: <strong>{products.filter(p => p.is_active !== false).length}</strong>
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Product Name</th>
                <th>Price</th>
                <th>Available Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    {searchFilter ? 'No products match your search term.' : 'No products found. Click "+ Add New Product" to list your first item.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock_quantity === 0;
                  const isLowStock = prod.stock_quantity > 0 && prod.stock_quantity <= 5;
                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="catalog-prod-cell">
                          <img
                            src={prod.image_url || '/images/product_candle.jpg'}
                            alt={prod.name}
                            className="catalog-prod-thumb"
                            onError={(e) => { e.target.src = '/images/product_candle.jpg'; }}
                          />
                          <div>
                            <span className="catalog-prod-name">{prod.name}</span>
                            {prod.sku && <span className="catalog-prod-sku">SKU: {prod.sku}</span>}
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong className="catalog-price-val">₹{Number(prod.price || 0).toLocaleString('en-IN')}</strong>
                      </td>

                      <td>
                        <span className={`stock-badge ${isOutOfStock ? 'badge-zero' : isLowStock ? 'badge-low' : 'badge-healthy'}`}>
                          {prod.stock_quantity} units
                        </span>
                      </td>

                      <td>
                        {prod.is_active === false ? (
                          <span className="badge badge-slate">Archived</span>
                        ) : isOutOfStock ? (
                          <span className="badge badge-rose">
                            <AlertOctagon size={12} /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="badge badge-amber">
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-emerald">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="catalog-row-actions">
                          <Link
                            to={`/seller/products/edit/${prod.id}`}
                            className="btn btn-outline btn-sm action-btn"
                            title="Edit Product & Stock"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm archive-btn"
                            onClick={() => handleArchive(prod.id, prod.name)}
                            title="Archive Product"
                          >
                            <Archive size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .manage-catalog-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .manage-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dash-heading-main {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .dash-sub-text {
          font-size: 13.5px;
          color: #64748B;
        }

        .add-product-btn {
          gap: 6px;
          font-weight: 700;
        }

        .catalog-data-card {
          padding: 24px;
          background: #FFFFFF;
        }

        .catalog-toolbar-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 20px;
        }

        .catalog-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 300px;
        }

        .catalog-search-icon {
          position: absolute;
          left: 12px;
          color: #94A3B8;
        }

        .catalog-search-input {
          width: 100%;
          padding: 7px 12px 7px 34px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 13px;
          background: #F8FAFC;
        }
        .catalog-search-input:focus {
          border-color: #059669;
          background: #FFFFFF;
        }

        .catalog-counts-chips {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .count-pill {
          padding: 4px 10px;
          border-radius: 6px;
          background: #F1F5F9;
          font-size: 12px;
          color: #475569;
        }
        .active-pill {
          background: #ECFDF5;
          color: #047857;
        }

        .catalog-prod-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .catalog-prod-thumb {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: contain;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          padding: 3px;
          flex-shrink: 0;
        }

        .catalog-prod-name {
          display: block;
          font-weight: 700;
          color: #0F172A;
          font-size: 13.5px;
        }

        .catalog-prod-sku {
          font-size: 11px;
          color: #64748B;
        }

        .catalog-price-val {
          font-size: 14px;
          font-weight: 800;
          color: #0F172A;
        }

        .stock-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .badge-healthy { background: #F1F5F9; color: #334155; }
        .badge-low { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
        .badge-zero { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

        .catalog-row-actions {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .action-btn {
          padding: 5px 10px;
          font-size: 12px;
        }

        .archive-btn {
          color: #94A3B8;
          padding: 6px;
        }
        .archive-btn:hover {
          color: #DC2626;
          background: #FEF2F2;
        }
      `}</style>
    </div>
  );
}
