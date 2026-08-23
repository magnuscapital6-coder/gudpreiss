import { NextRequest, NextResponse } from 'next/server';
import { createDsarRequest } from '@/lib/privacy/dsar-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, reason } = body;

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full_name are required.' }, { status: 400 });
    }

    const ticket = createDsarRequest({
      email,
      full_name,
      type: 'loeschung',
      details: reason || 'Kundenanfrage zur vollständigen Löschung / Anonymisierung gemäß Art. 17 DSGVO.',
    });

    return NextResponse.json({
      success: true,
      message: 'Löschanfrage registriert und zur Prüfung vorgelegt.',
      ticket_number: ticket.ticket_number,
      statutory_deadline: ticket.deadline_date,
      retained_data_notice: 'Gesetzlich aufbewahrungspflichtige Rechnungsdaten (§ 147 AO / § 257 HGB) verbleiben bis zum Ablauf der gesetzlichen 10-Jahres-Frist gesperrt im System.',
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing deletion request:', error);
    return NextResponse.json({ error: 'Internal server error processing deletion request' }, { status: 500 });
  }
}
