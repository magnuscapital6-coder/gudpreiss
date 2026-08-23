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

    const newTicket: HandoffTicket = {
      id: ticketId,
      clientName: clientName || 'Kunde',
      clientEmail: clientEmail || 'kontakt@gudpreiss.de',
      subject: subject || `Neue Kundensupport-Anfrage [${ticketId}]`,
      summary,
      initialRequest,
      actionsTaken: ['KI-Erstberatung', 'Manuelle Ticket-Übermittlung'],
      actionNeeded: 'Rückmeldung an den Kunden durch das Support-Team.',
      status: 'new',
      createdAt: new Date().toISOString(),
      conversationHistory: conversationHistory || [],
    };

    addHandoffTicket(newTicket);

    // Formatted email log representation
    const emailSubject = `Neue Kundensupport-Anfrage — ${subject || 'Allgemeine Anfrage'}`;
    const emailBodyHTML = `
      <h2>Neue Kundensupport-Übertragung von Gupreiss AI</h2>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p><strong>Kundenname:</strong> ${clientName || 'Unbekannt'}</p>
      <p><strong>Kunden-E-Mail:</strong> ${clientEmail || 'Nicht angegeben'}</p>
      <p><strong>Empfänger:</strong> kontakt@gudpreiss.de</p>
      <hr />
      <h3>Zusammenfassung der Anfrage</h3>
      <p>${summary}</p>
      <h3>Erstnachricht des Kunden</h3>
      <blockquote style="background: #f4f4f5; padding: 10px; border-left: 4px solid #10b981;">
        ${initialRequest}
      </blockquote>
      <hr />
      <p><em>Diese E-Mail wurde automatisch vom autonomen KI-Assistenten Gupreiss auf gudpreiss.de generiert.</em></p>
    `;

    console.log(`[Gupreiss Email Dispatcher] Sent email to kontakt@gudpreiss.de with subject "${emailSubject}"`);

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Demande transmise avec succès à kontakt@gudpreiss.de',
      confirmationClientText: 'Votre demande a bien été transmise à notre équipe sous l\'adresse kontakt@gudpreiss.de. Elle contient toutes les informations que vous nous avez fournies afin de faciliter son traitement.',
    });
  } catch (error) {
    console.error('[Gupreiss Send Email API Error]:', error);
    return NextResponse.json(
      { error: 'Fehler beim Versenden der E-Mail an kontakt@gudpreiss.de' },
      { status: 500 }
    );
  }
}
