-- ============================================================
-- MIGRATION COMPLETE: Recréer les tables avec les bons types
-- Executer dans: https://supabase.com/dashboard/project/xfsaznnrhqmlbllsfxzr/sql
-- ============================================================

-- Supprimer les tables existantes (elles sont vides)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. PROFILES
CREATE TABLE profiles (
    id VARCHAR(255) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE categories (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    image_url TEXT,
    icon TEXT,
    parent_id VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BRANDS
CREATE TABLE brands (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    sku TEXT UNIQUE NOT NULL,
    brand_id VARCHAR(255),
    brand_name TEXT,
    category_id VARCHAR(255),
    category_name TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    best_seller BOOLEAN DEFAULT FALSE,
    new_arrival BOOLEAN DEFAULT FALSE,
    on_sale BOOLEAN DEFAULT FALSE,
    weight_kg DECIMAL(6, 2) DEFAULT 0.5,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    gtin TEXT,
    mpn TEXT,
    google_product_category TEXT,
    condition TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id VARCHAR(255),
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT,
    shipping_address_json JSONB NOT NULL,
    shipping_address JSONB,
    billing_address_json JSONB NOT NULL,
    billing_address JSONB,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'card',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    tracking_number TEXT,
    coupon_code TEXT,
    bank_transfer_iban TEXT,
    bank_transfer_bic TEXT,
    bank_transfer_holder TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDER ITEMS
CREATE TABLE order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255),
    variant_id VARCHAR(255),
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS
CREATE TABLE reviews (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    user_name TEXT NOT NULL,
    rating INT NOT NULL,
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COUPONS
CREATE TABLE coupons (
    id VARCHAR(255) PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    usage_limit INT,
    times_used INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BANNERS
CREATE TABLE banners (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    price_text TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'SHOP NOW',
    cta_link TEXT DEFAULT '/shop',
    position TEXT DEFAULT 'hero',
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BLOG POSTS
CREATE TABLE blog_posts (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    author TEXT,
    author_name TEXT DEFAULT 'GudPreiss Editorial',
    category TEXT DEFAULT 'Tech News',
    tags JSONB DEFAULT '[]'::jsonb,
    read_time TEXT,
    status TEXT DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SETTINGS (key-value)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CARTS
CREATE TABLE carts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
    id VARCHAR(255) PRIMARY KEY,
    cart_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    variant_id VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. WISHLISTS
CREATE TABLE wishlists (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ADDRESSES
CREATE TABLE addresses (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title TEXT DEFAULT 'Home',
    full_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'DE',
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Approved reviews visible" ON reviews FOR SELECT USING (status = 'approved');

-- Insert policies (service role bypasses RLS anyway)
CREATE POLICY "Service insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert brands" ON brands FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update settings" ON settings FOR UPDATE USING (true);
CREATE POLICY "Service insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Service insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Service insert blog_posts" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update blog_posts" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Service insert coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update coupons" ON coupons FOR UPDATE USING (true);

-- Admin full access
CREATE POLICY "Admin full products" ON products FOR ALL USING (true);
CREATE POLICY "Admin full categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admin full brands" ON brands FOR ALL USING (true);
CREATE POLICY "Admin full orders" ON orders FOR ALL USING (true);
CREATE POLICY "Admin full order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Admin full reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Admin full coupons" ON coupons FOR ALL USING (true);
CREATE POLICY "Admin full blog_posts" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Admin full banners" ON banners FOR ALL USING (true);
CREATE POLICY "Admin full settings" ON settings FOR ALL USING (true);
CREATE POLICY "Admin full profiles" ON profiles FOR ALL USING (true);
