import { NextResponse } from 'next/server';
import { generateGoogleMerchantFeed } from '@/lib/merchant/feed-generator';

export async function GET() {
  try {
    const xml = await generateGoogleMerchantFeed();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating Google Merchant Feed' }, { status: 500 });
  }
}
