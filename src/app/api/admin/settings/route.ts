import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings, stripSecretSettings } from '@/lib/db/db-provider';
import { getServerSession } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Public: the storefront needs branding and bank details. Mailer credentials
// are stripped (admins manage them via /api/admin/email-templates).
export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings: stripSecretSettings(settings) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid settings payload' },
        { status: 400 }
      );
    }

    const updated = await updateStoreSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully',
      settings: stripSecretSettings(updated),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
