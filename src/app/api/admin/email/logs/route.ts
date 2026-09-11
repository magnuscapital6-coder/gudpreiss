import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server';
import { getRecentEmailLogs } from '@/lib/email/email-log-service';

export async function GET() {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs = await getRecentEmailLogs(50);
  return NextResponse.json({ success: true, logs });
}
