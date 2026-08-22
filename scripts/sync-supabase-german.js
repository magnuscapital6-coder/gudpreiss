const { createClient } = require('@supabase/supabase-js');
const { INITIAL_PRODUCTS, INITIAL_CATEGORIES } = require('../src/lib/db/initial-data');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xfsaznnrhqmlbllsfxzr.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncGermanData() {
  console.log('Starting Supabase German Data Sync...');

  // 1. Sync Categories
  console.log(`Syncing ${INITIAL_CATEGORIES.length} categories...`);
  for (const cat of INITIAL_CATEGORIES) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image_url,
      product_count: cat.product_count || 0
    }, { onConflict: 'id' });
    if (error) {
      console.error(`Category error for ${cat.name}:`, error.message);
    }
  }

  // 2. Sync Products
  console.log(`Syncing ${INITIAL_PRODUCTS.length} products to Supabase...`);
  let count = 0;
  for (const p of INITIAL_PRODUCTS) {
    const productPayload = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      short_description: p.short_description || '',
      price: p.price,
      compare_at_price: p.compare_at_price || null,
      images: p.images || [],
      category_id: p.category_id || null,
      category_name: p.category_name || '',
      brand_id: p.brand_id || null,
      brand_name: p.brand_name || '',
      sku: p.sku || p.id,
      stock: p.stock || 50,
      featured: p.featured || false,
      best_seller: p.best_seller || false,
      new_arrival: p.new_arrival || false,
      on_sale: p.on_sale || false,
      rating: p.rating || 5.0,
      reviews_count: p.reviews_count || 0
    };

    const { error } = await supabase.from('products').upsert(productPayload, { onConflict: 'id' });
    if (error) {
      console.error(`Product error for ${p.name}:`, error.message);
    } else {
      count++;
    }
  }

  console.log(`Successfully synced ${count} products with German titles & descriptions to Supabase!`);
}

syncGermanData().catch(console.error);
