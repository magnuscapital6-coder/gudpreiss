import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db/db-provider';

export async function GET() {
  try {
    const products = await getProducts();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gudpreiss.de';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GudPreiss Deutschland Product Feed</title>
    <link>${siteUrl}</link>
    <description>Offizieller Google Merchant Center Produkte-Feed für Deutschland</description>
`;

    products.forEach((p) => {
      const productUrl = `${siteUrl}/shop/${p.slug || p.id}`;
      const imageUrl = p.images && p.images.length > 0 ? p.images[0] : `${siteUrl}/placeholder.jpg`;
      const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';
      const cleanDesc = (p.description || p.short_description || p.name)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      const cleanName = p.name
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${cleanName}</g:title>
      <g:description>${cleanDesc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price.toFixed(2)} EUR</g:price>
      <g:brand>${p.brand_name || 'GudPreiss'}</g:brand>
      <g:condition>${p.condition || 'new'}</g:condition>
      <g:gtin>${p.gtin || p.sku || p.id}</g:gtin>
      <g:mpn>${p.mpn || p.sku || p.id}</g:mpn>
      <g:google_product_category>${(p.google_product_category || 'Electronics > Tech').replace(/&/g, '&amp;')}</g:google_product_category>
      <g:shipping>
        <g:country>DE</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
    </item>
`;
    });

    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating Merchant Feed' }, { status: 500 });
  }
}
