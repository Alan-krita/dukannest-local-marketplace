# DukanNest — Where Local Shops Feel at Home

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-316192?style=flat&logo=postgresql&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

> **DukanNest** is a full-stack hyper-local commerce marketplace connecting independent Indian artisans, potters, brass metalworkers, and neighborhood shops directly with community shoppers.

---

## 📸 Overview & Design Philosophy

DukanNest is designed with a **"Premium Modern Commerce"** editorial visual identity:
* **Primary Brand Accent**: Emerald Green (`#059669`) symbolizing growth, trust, and Indian handicraft vitality.
* **Typography & Surfaces**: Deep Navy (`#0F172A`) typography on warm, clean neutral backgrounds (`#FFFFFF` & `#F8FAFC`).
* **Zero Artificial Placeholders**: Every product card, gallery thumbnail, and storefront is backed by authentic, high-resolution imagery and genuine database values.

---

## 🗂 Project Directory Structure

```text
Datum_project/
├── .gitignore                     # Global root gitignore for node_modules, venv, and secrets
├── package.json                   # Root workspace scripts (run dev, build, preview)
├── README.md                      # Comprehensive project documentation & run guide
├── API_INTEGRATION_GUIDE.md       # Full API contracts and frontend integration specs
├── schema.sql                     # Supabase PostgreSQL relational schema definition
│
├── Backend/                       # FastAPI REST API Backend
│   ├── .env                       # Environment configuration (DATABASE_URL, JWT secret)
│   ├── .env.example               # Template environment variables
│   ├── requirements.txt           # Python dependency specifications
│   ├── app/
│   │   ├── main.py                # FastAPI entry point & CORS configuration
│   │   ├── core/                  # Security, JWT tokens, password hashing, dependencies
│   │   ├── db/                    # SQLAlchemy database session & base model
│   │   ├── models/                # SQLAlchemy models (User, Shop, Product, Category, Cart, Order)
│   │   ├── routes/                # Modular API route controllers (products, shops, cart, orders)
│   │   ├── schemas/               # Pydantic v2 validation models & request/response schemas
│   │   └── services/              # Business logic (inventory tracking, discovery, orders)
│   ├── tests/                     # Unit and integration test suites
│   └── venv/                      # Python virtual environment (ignored in git)
│
└── Frontend/                      # Modern React + Vite Single-Page Application
    ├── index.html                 # App shell with DukanNest branding and Google Fonts
    ├── package.json               # Frontend dependencies (Lucide icons, React Router)
    ├── vite.config.js             # Vite development server and bundling settings
    ├── public/
    │   └── images/                # High-res authentic product and artisan photography
    │       ├── hero_dukan_artisan.jpg   # Editorial homepage artisan workshop visual
    │       ├── product_silk_scarf.jpg   # Handloom mulberry silk scarf
    │       ├── product_brass_idol.jpg   # Handcrafted antique brass idol
    │       ├── product_terracotta_matka.jpg # Traditional earthen water matka
    │       ├── product_brass_diya.jpg   # Traditional glowing brass diya lamp
    │       ├── product_clay_handi.jpg   # Earthen clay cooking handi
    │       ├── product_incense.jpg      # Temple flower incense & holder
    │       └── ...
    └── src/
        ├── App.jsx                # Application routing, layout wrappers, and role guards
        ├── main.jsx               # React DOM entry point
        ├── index.css              # Global design tokens and typography
        ├── components/            # Reusable UI components
        │   ├── Navbar.jsx         # Sticky header with search, location, cart counter, auth
        │   ├── Footer.jsx         # Clean editorial footer with DukanNest values
        │   ├── ProductCard.jsx    # Distinct product card with stock badges & auto-mapping
        │   ├── LoadingSpinner.jsx # Smooth branded loading state indicator
        │   └── CustomerSidebar.jsx# Mobile off-canvas navigation drawer
        ├── context/               # React State Contexts (AuthContext, CartContext)
        ├── services/              # Axios API service clients (auth, products, shops, orders)
        └── pages/
            ├── customer/          # Shopper experience
            │   ├── Home.jsx       # Editorial homepage with hero search & curated creations
            │   ├── Products.jsx   # Catalog with search, locality filters & price tiers
            │   ├── ProductDetails.jsx # Image gallery, craft specs, provenance, fulfillment
            │   ├── ShopProfile.jsx# Individual seller public storefront
            │   ├── Cart.jsx       # Multi-item cart with quantity adjustments
            │   ├── Checkout.jsx   # Express checkout with address form & COD/UPI options
            │   └── MyOrders.jsx   # Order history & delivery tracking timeline
            └── seller/            # Merchant experience
                ├── SellerDashboard.jsx # Analytics cards, low-stock alerts & recent sales
                ├── MyShop.jsx     # Seller store profile editor (bio, locality, city)
                ├── ManageProducts.jsx  # Inventory list with soft-archive & stock counters
                ├── AddEditProduct.jsx  # Product form with real-time media preview
                ├── SellerOrders.jsx    # Fulfillment pipeline with status transitions
                └── SellerOnboarding.jsx# Step-by-step merchant store registration
```

---

## ⚡ Quick Start: How to Run the Project

You will need **two terminal windows**: one for the Backend, and one for the Frontend.

### 1. Terminal 1: Start FastAPI Backend

```powershell
# Navigate to the Backend directory
cd Backend

# Activate Python Virtual Environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Start the uvicorn development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* **API Base URL**: `http://127.0.0.1:8000/api/v1`
* **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`

---

### 2. Terminal 2: Start React Frontend

```powershell
# Navigate to the Frontend directory
cd Frontend

# Start the Vite development server
pnpm dev
# (or if using npm: npm run dev)
```
* **Customer Storefront URL**: `http://localhost:5173/`

---

## ✨ Implemented Core Features

### 1. Locality-Based Product Discovery
* Filter products by **Locality**, **City**, and **Pincode** (e.g. *Goverdhan*, *Civil Lines*, *Holi Gate*, *Mathura*).
* Seller locality is dynamically badged on every product card.
* Only active products from active shops are displayed to shoppers.

### 2. Smart Inventory Management & Low-Stock Alerts
* Real-time metrics for merchants: **Total Products**, **In Stock**, **Low Stock** (configurable threshold, default $\le 5$ units), and **Out of Stock**.
* Dedicated **Low Stock Alerts Table** with instant 1-click navigation to the product editor.
* Out-of-stock items are automatically badged with distinct red status tags.

### 3. Rich Editorial Product Details Page
* **Multi-Angle Gallery**: Primary image stage with clickable thumbnail strip.
* **Real Stock Badging**: Live stock counters (`In Stock`, `Only N left`, `Out of Stock`).
* **Direct Storefront Navigation**: Instant access to the merchant's dedicated storefront (`/shop/:id`).
* **Dynamic Tabbed Sections**:
  * **Product Description**: Product overview with structured **Craft & Material Specifications** (Material, Technique, Artisan Finish, Size/Burn Time, Origin).
  * **Artisan Craft & Provenance**: Background on the heritage cluster and regional Indian craftsmanship.
  * **Fulfillment & Care**: Custom care instructions (terracotta soaking, brass buffing, candle wick trimming) alongside local 24-48h dispatch timelines.

### 4. End-to-End Cart & Checkout
* Dual-mode cart supporting both guest sessions and backend-persisted database carts.
* Express checkout form supporting **Cash on Delivery (COD)**, **UPI**, and **Cards**.
* Customer order history with timeline tracking: *Order Placed* $\rightarrow$ *Confirmed* $\rightarrow$ *Shipped* $\rightarrow$ *Delivered*.

---

## 🔑 Demo Test Accounts

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Customer** | `customer@test.com` | `password123` | Browsing, locality filtering, cart, express checkout, order tracking |
| **Seller** | `seller@test.com` | `password123` | Storefront profile, product management, inventory alerts, order fulfillment |

---

## 🛠 Tech Stack Details

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide React, Context API |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2 |
| **Database** | PostgreSQL hosted on Supabase Cloud, Connection Pooling via Psycopg |
| **Security** | Passlib (bcrypt), PyJWT (HS256 Bearer tokens), Role-Based Access Control |
| **Styling** | Vanilla Modular CSS with CSS Custom Properties and Responsive Grid Systems |
