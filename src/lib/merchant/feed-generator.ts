import { getProducts } from '@/lib/db/db-provider';
import { getGoogleCategoryForProduct } from './taxonomy';

export async function generateGoogleMerchantFeed(): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';
  const products = await getProducts();
  const activeProducts = products.filter((p) => p.status !== 'draft' && p.status !== 'archived');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GudPreiss Google Shopping Feed</title>
    <link>${siteUrl}</link>
    <description>Offizieller Google Merchant Center Produkte-Feed für Brennholz und Holzpellets</description>
`;

  for (const p of activeProducts) {
    const productUrl = `${siteUrl}/shop/${p.slug || p.id}`;
    
    // Process Images
    const rawImages = p.images && p.images.length > 0 ? p.images : [`${siteUrl}/placeholder.jpg`];
    const mainImageUrl = rawImages[0].startsWith('http') ? rawImages[0] : `${siteUrl}${rawImages[0]}`;
    const additionalImageUrls = rawImages.slice(1).map((img) => (img.startsWith('http') ? img : `${siteUrl}${img}`));

    const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';

    // Clean XML strings
    const cleanDesc = (p.description || p.short_description || p.name)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const cleanName = p.name
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const googleCategory = (p.google_product_category || getGoogleCategoryForProduct(p.category_name, p.name))
      .replace(/&/g, '&amp;');

    const brand = (p.brand_name || 'GudPreiss')
      .replace(/&/g, '&amp;');

    // Shipping cost calculation: Free shipping >= 500 EUR, else 49.00 EUR
    const shippingPrice = p.price >= 500 ? '0.00 EUR' : '49.00 EUR';

    // GTIN verification - Only output g:gtin if real digit sequence
    const hasValidGtin = p.gtin && /^\d{8}|\d{12}|\d{13}|\d{14}$/.test(p.gtin.trim());
    const cleanGtin = hasValidGtin ? p.gtin!.trim() : null;

    xml += `    <item>
      <g:id>${p.sku || p.id}</g:id>
      <g:title>${cleanName}</g:title>
      <g:description>${cleanDesc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${mainImageUrl}</g:image_link>
`;

    additionalImageUrls.forEach((addImg) => {
      xml += `      <g:additional_image_link>${addImg}</g:additional_image_link>\n`;
    });

    xml += `      <g:availability>${availability}</g:availability>
      <g:price>${p.price.toFixed(2)} EUR</g:price>
      <g:brand>${brand}</g:brand>
      <g:condition>${p.condition || 'new'}</g:condition>
`;

    if (cleanGtin) {
      xml += `      <g:gtin>${cleanGtin}</g:gtin>\n`;
    } else {
      xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
    }

    if (p.mpn || p.sku) {
      xml += `      <g:mpn>${(p.mpn || p.sku).replace(/&/g, '&amp;')}</g:mpn>\n`;
    }

    xml += `      <g:google_product_category>${googleCategory}</g:google_product_category>\n`;

    if (p.product_type || p.category_name) {
      xml += `      <g:product_type>${(p.product_type || p.category_name!).replace(/&/g, '&amp;')}</g:product_type>\n`;
    }

    if (p.weight_kg && p.weight_kg > 0) {
      xml += `      <g:shipping_weight>${p.weight_kg} kg</g:shipping_weight>\n`;
    }

    // Shipping info for Germany (DE)
    xml += `      <g:shipping>
        <g:country>DE</g:country>
        <g:service>Spedition Palette</g:service>
        <g:price>${shippingPrice}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>FR</g:country>
        <g:service>Livraison Palette</g:service>
        <g:price>${shippingPrice}</g:price>
      </g:shipping>
    </item>
`;
  }

  xml += `  </channel>
</rss>`;

  return xml;
}
