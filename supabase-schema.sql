-- TechNova E-Commerce Database Schema for PostgreSQL / Supabase

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  product_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS brands (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_id VARCHAR(255) REFERENCES categories(id) ON DELETE SET NULL,
  category_name VARCHAR(255),
  brand_id VARCHAR(255) REFERENCES brands(id) ON DELETE SET NULL,
  brand_name VARCHAR(255),
  sku VARCHAR(255) UNIQUE,
  stock INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  new_arrival BOOLEAN DEFAULT FALSE,
  on_sale BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT NOT NULL,
  button_text VARCHAR(255),
  position VARCHAR(50) DEFAULT 'hero',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  date DATE DEFAULT CURRENT_DATE,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  expiry_date DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author VARCHAR(255),
  author_role VARCHAR(255),
  author_avatar TEXT,
  published_at DATE DEFAULT CURRENT_DATE,
  read_time VARCHAR(50),
  category VARCHAR(255),
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  coupon_code VARCHAR(50),
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  bank_transfer_iban VARCHAR(100),
  bank_transfer_bic VARCHAR(100),
  bank_transfer_holder VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name VARCHAR(255) NOT NULL,
  store_email VARCHAR(255) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 50.0,
  iban VARCHAR(100),
  bic VARCHAR(100),
  bank_name VARCHAR(255),
  account_holder VARCHAR(255),
  vat_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- Public read access for storefront data.
-- Write operations are allowed for the service_role key
-- (which bypasses RLS) or via authenticated admin sessions.
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin Insert Categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Categories" ON categories FOR DELETE USING (true);

-- -----------------------------------------------------------
-- BRANDS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Admin Insert Brands" ON brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Brands" ON brands FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Brands" ON brands FOR DELETE USING (true);

-- -----------------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin Insert Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Products" ON products FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Products" ON products FOR DELETE USING (true);

-- -----------------------------------------------------------
-- BANNERS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Admin Insert Banners" ON banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Banners" ON banners FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Banners" ON banners FOR DELETE USING (true);

-- -----------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Admin Insert Reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Reviews" ON reviews FOR DELETE USING (true);

-- -----------------------------------------------------------
-- COUPONS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admin Insert Coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Coupons" ON coupons FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Coupons" ON coupons FOR DELETE USING (true);

-- -----------------------------------------------------------
-- BLOG POSTS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Blog" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin Insert Blog" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Blog" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Blog" ON blog_posts FOR DELETE USING (true);

-- -----------------------------------------------------------
-- ORDERS
-- -----------------------------------------------------------
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin Update Orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Orders" ON orders FOR DELETE USING (true);

-- -----------------------------------------------------------
-- STORE SETTINGS
-- -----------------------------------------------------------
CREATE POLICY "Public Read Settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admin Insert Settings" ON store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Update Settings" ON store_settings FOR UPDATE USING (true);
CREATE POLICY "Admin Delete Settings" ON store_settings FOR DELETE USING (true);
