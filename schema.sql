-- Local Seller Marketplace MVP schema. Run in intended Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text unique,
  password_hash text not null,
  role text not null check (role in ('CUSTOMER','SELLER')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references public.users(id) on delete restrict,
  shop_name text not null,
  description text,
  category text,
  locality text,
  city text,
  state text,
  pincode text,
  address text,
  logo_url text,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null unique references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references public.users(id) on delete restrict,
  order_number text not null unique,
  status text not null default 'PLACED' check (status in ('PLACED','ACCEPTED','PACKED','SHIPPED','DELIVERED','CANCELLED')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  delivery_state text not null,
  delivery_pincode text not null,
  payment_method text not null check (payment_method in ('COD','SIMULATED')),
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING','PAID','FAILED','REFUNDED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  seller_shop_id uuid not null references public.shops(id) on delete restrict,
  product_name_snapshot text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity >= 1),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create index if not exists idx_products_shop_id on public.products(shop_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_shops_city on public.shops(city);
create index if not exists idx_orders_customer_user_id on public.orders(customer_user_id);
create index if not exists idx_order_items_seller_shop_id on public.order_items(seller_shop_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);

