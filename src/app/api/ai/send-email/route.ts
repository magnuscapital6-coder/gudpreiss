import { NextRequest, NextResponse } from 'next/server';
import { addHandoffTicket } from '@/lib/ai/knowledge-base';
import { HandoffTicket } from '@/types/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientEmail, subject, summary, initialRequest, conversationHistory } = body;

    if (!summary || !initialRequest) {
      return NextResponse.json(
        { error: 'Fehlende erforderliche Informationen für die E-Mail-Übertragung' },
        { status: 400 }
      );
    }

    const ticketId = `TICKET-${Math.floor(1000 + Math.random() * 9000)}`;
    const recipientEmail = process.env.SUPPORT_EMAIL || 'kontakt@gudpreiss.de';

    const newTicket: HandoffTicket = {
      id: ticketId,
      clientName: clientName || 'Kunde',
      clientEmail: clientEmail || recipientEmail,
      subject: subject || `Neue Kundensupport-Anfrage [${ticketId}]`,
      summary,
      initialRequest,
      actionsTaken: ['KI-Erstberatung', 'Manuelle Ticket-Übermittlung'],
      actionNeeded: 'Rückmeldung an den Kunden durch das Support-Team.',
      status: 'new',
      createdAt: new Date().toISOString(),
      conversationHistory: conversationHistory || [],
    };

    // Save ticket locally / in DB
    addHandoffTicket(newTicket);

    const emailSubject = `Neue Kundensupport-Anfrage [${ticketId}] — ${subject || 'Allgemeine Anfrage'}`;
    const emailBodyHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #059669;">Neue Kundensupport-Übertragung von Gupreiss AI</h2>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Kundenname:</strong> ${clientName || 'Unbekannt'}</p>
        <p><strong>Kunden-E-Mail:</strong> ${clientEmail || 'Nicht angegeben'}</p>
        <p><strong>Zieladresse:</strong> ${recipientEmail}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <h3>Zusammenfassung der Anfrage</h3>
        <p>${summary}</p>
        <h3>Erstnachricht des Kunden</h3>
        <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #10b981; margin: 10px 0; border-radius: 4px;">
          ${initialRequest}
        </blockquote>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p style="font-size: 11px; color: #64748b;"><em>Diese E-Mail wurde automatisch vom KI-Assistenten Gupreiss auf gudpreiss.de versendet.</em></p>
      </div>
    `;

    // Send real email via Resend HTTP API if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    let isRealEmailSent = false;

    if (resendApiKey && !resendApiKey.includes('demo')) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'GudPreiss <bestaetigung@gudpreiss.de>',
            to: [recipientEmail],
            reply_to: clientEmail && clientEmail.includes('@') ? clientEmail : undefined,
            subject: emailSubject,
            html: emailBodyHTML,
          }),
        });

        if (resendResponse.ok) {
          isRealEmailSent = true;
          console.log(`[Resend API Success] Email ${ticketId} sent to ${recipientEmail}`);
        } else {
          const errData = await resendResponse.json();
          console.warn('[Resend API Error]:', errData);
        }
      } catch (resendErr) {
        console.error('[Resend Dispatch Error]:', resendErr);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId,
      isRealEmailSent,
      message: `Demande transmise avec succès à ${recipientEmail}`,
      confirmationClientText: `Votre demande a bien été transmise à notre équipe sous l'adresse ${recipientEmail}. Elle contient toutes les informations que vous nous avez fournies afin de faciliter son traitement.`,
    });
  } catch (error) {
    console.error('[Gupreiss Send Email API Error]:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden der E-Mail' },
      { status: 500 }
    );
  }
}
