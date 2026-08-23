import { NextRequest, NextResponse } from 'next/server';
import { generateUserDataExport } from '@/lib/privacy/dsar-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required for data export.' }, { status: 400 });
    }

    const exportData = generateUserDataExport(email);

    return NextResponse.json(exportData, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="GudPreiss_DSGVO_Export_${email}.json"`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error handling privacy export API:', error);
    return NextResponse.json({ error: 'Internal server error processing data export' }, { status: 500 });
  }
}
