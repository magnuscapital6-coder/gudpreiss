/**
 * Apply the corrected catalog prices to Supabase.
 *
 * The Refurbed import copied one "ab X €" category price onto every product of
 * that category (all iPhones at 117 €, all MacBooks at 129 €, ...). This script
 * writes the per-model prices collected by refresh-refurbed-prices.js, and
 * deactivates the category landing pages that were imported as products.
 *
 * Usage:
 *   node scripts/apply-price-fixes.js --dry-run   (default: shows what would change)
 *   node scripts/apply-price-fixes.js --apply
 */

const fs = require('fs');
const path = require('path');
const APPLY = process.argv.includes('--apply');
const ROOT = path.join(__dirname, '..');

const env = {};
for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

// Plain PostgREST calls: this script must run without node_modules installed.
const BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const HEADERS = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function selectProducts() {
  const res = await fetch(`${BASE}/products?select=id,sku,name,price,status&limit=2000`, { headers: HEADERS });
  if (!res.ok) return { error: { message: `HTTP ${res.status} ${await res.text()}` } };
  return { data: await res.json() };
}

async function patchProduct(id, payload) {
  const res = await fetch(`${BASE}/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { error: { message: `HTTP ${res.status} ${await res.text()}` } };
  return {};
}

const fixes = JSON.parse(fs.readFileSync(path.join(__dirname, 'price-fixes.json'), 'utf8'));
const CATEGORY_PAGE_RE = /– günstiger als neu, besser als gebraucht/;

(async () => {
  const { data: products, error } = await selectProducts();
  if (error) throw new Error('lecture products: ' + error.message);

  const backupFile = path.join(__dirname, `price-backup-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.json`);
  if (APPLY) {
    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
    console.log(`Sauvegarde: ${path.relative(ROOT, backupFile)} (${products.length} produits)\n`);
  }

  const bySku = new Map(products.map((p) => [p.sku, p]));
  let updated = 0;
  let skipped = 0;

  for (const fix of fixes) {
    const product = bySku.get(fix.sku);
    if (!product) {
      console.warn(`introuvable: ${fix.sku} (${fix.name})`);
      skipped += 1;
      continue;
    }
    if (Number(product.price) === Number(fix.neuf)) {
      skipped += 1;
      continue;
    }

    console.log(`${product.name.slice(0, 44).padEnd(45)} ${String(product.price).padStart(8)} -> ${String(fix.neuf).padStart(9)}`);
    if (APPLY) {
      const { error: updErr } = await patchProduct(product.id, { price: fix.neuf, updated_at: new Date().toISOString() });
      if (updErr) {
        console.error(`  echec: ${updErr.message}`);
        continue;
      }
    }
    updated += 1;
  }

  const landingPages = products.filter((p) => CATEGORY_PAGE_RE.test(p.name) && p.status !== 'archived');
  for (const page of landingPages) {
    console.log(`desactivation: ${page.name.slice(0, 60)}`);
    if (APPLY) {
      const { error: updErr } = await patchProduct(page.id, { status: 'archived', updated_at: new Date().toISOString() });
      if (updErr) console.error(`  echec: ${updErr.message}`);
    }
  }

  console.log(`\n${APPLY ? 'Applique' : 'Simulation'}: ${updated} prix, ${landingPages.length} fiches desactivees, ${skipped} ignores.`);
  if (!APPLY) console.log('Relancer avec --apply pour ecrire en base.');
})();
