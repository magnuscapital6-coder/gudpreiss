const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xfsaznnrhqmlbllsfxzr.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function createTables() {
  console.log('Creating tables via Supabase API...\n');

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-schema.sql'), 'utf8');

  // Split SQL into individual statements
  const statements = sql.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10 && !s.startsWith('--'));

  console.log(`Executing ${statements.length} SQL statements...\n`);

  let success = 0;
  let errors = 0;

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
      if (error) {
        // Try direct query via REST
        const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: stmt + ';' }),
        });
        if (res.ok) success++;
        else {
          errors++;
          const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
          console.log(`  ⚠ ${preview}...`);
        }
      } else {
        success++;
      }
    } catch (err) {
      errors++;
    }
  }

  console.log(`\n✓ ${success} statements succeeded, ✗ ${errors} errors`);

  // Verify tables exist
  console.log('\nVerifying tables...');
  const tables = ['categories', 'brands', 'products', 'reviews', 'coupons', 'blog_posts', 'orders', 'store_settings', 'banners'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    console.log(`  ${error ? '✗' : '✓'} ${t}: ${error ? 'NOT FOUND' : 'exists'}`);
  }
}

createTables().catch(console.error);
