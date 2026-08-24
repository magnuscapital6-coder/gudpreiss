import { NextRequest, NextResponse } from 'next/server';
import { generateUserDataExport } from '@/lib/privacy/dsar-service';
import { getServerSession } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Require authenticated session
    const session = await getServerSession();
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich. Bitte melden Sie sich an.' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required for data export.' }, { status: 400 });
    }

    // Users can only export their own data (admins can export any)
    if (!session.isAdmin && session.email !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Sie können nur Ihre eigenen Daten exportieren.' },
        { status: 403 },
      );
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
