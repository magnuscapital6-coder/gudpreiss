const { Client } = require('pg');
const { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_BLOG_POSTS, DEFAULT_STORE_SETTINGS } = require('../src/lib/db/initial-data');

const connectionString = process.env.POSTGRES_URL || "postgresql://postgres:magnuscapital6-coder's Org@db.xfsaznnrhqmlbllsfxzr.supabase.co:5432/postgres";

async function seedDatabase() {
  console.log('Seeding PostgreSQL Supabase database with initial data...');

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL.');

    // 1. Categories
    console.log('Seeding categories...');
    for (const cat of INITIAL_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, image, product_count)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, image = EXCLUDED.image`,
        [cat.id, cat.name, cat.slug, cat.description || '', cat.image_url, cat.product_count || 0]
      );
    }

    // 2. Brands
    console.log('Seeding brands...');
    for (const b of INITIAL_BRANDS) {
      await client.query(
        `INSERT INTO brands (id, name, slug, logo, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [b.id, b.name, b.slug, b.logo_url || '', b.description || '']
      );
    }

    // 3. Products
    console.log('Seeding products...');
    for (const p of INITIAL_PRODUCTS) {
      await client.query(
        `INSERT INTO products (id, name, slug, description, short_description, price, compare_at_price, images, category_id, category_name, brand_id, brand_name, sku, stock, featured, best_seller, new_arrival, on_sale, rating, reviews_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, short_description = EXCLUDED.short_description, price = EXCLUDED.price, stock = EXCLUDED.stock, category_name = EXCLUDED.category_name`,
        [
          p.id, p.name, p.slug, p.description || '', p.short_description || '', p.price, p.compare_at_price || null,
          JSON.stringify(p.images || []), p.category_id || null, p.category_name || '', p.brand_id || null, p.brand_name || '',
          p.sku || p.id, p.stock || 50, p.featured || false, p.best_seller || false, p.new_arrival || false, p.on_sale || false,
          p.rating || 5.0, p.reviews_count || 0
        ]
      );
    }

    console.log('Database seeding complete! All categories, brands, and products are stored in PostgreSQL Supabase.');

  } catch (err) {
    console.error('Seeding error:', err.message || err);
  } finally {
    await client.end();
  }
}

seedDatabase();
