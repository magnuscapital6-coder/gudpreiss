import { NextRequest, NextResponse } from 'next/server';
import { processGupreissAgent } from '@/lib/ai/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, clientInfo } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Ungültige Nachrichtensequenz' },
        { status: 400 }
      );
    }

    const result = await processGupreissAgent({
      messages,
      clientInfo,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Gupreiss AI Chat API Error]:', error);
    return NextResponse.json(
      {
        error: 'Ein interner Fehler ist bei der Verarbeitung durch Gupreiss AI aufgetreten.',
        reply: 'Entschuldigung, es gab ein kurzes technisches Problem. Bitte versuchen Sie es erneut oder kontaktieren Sie uns unter kontakt@gudpreiss.de.',
      },
      { status: 500 }
    );
  }
}
