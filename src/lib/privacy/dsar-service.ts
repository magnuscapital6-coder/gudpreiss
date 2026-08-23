import { DSARRequest, DSARType, DSARStatus } from '@/types/privacy';

let IN_MEMORY_DSAR_REQUESTS: DSARRequest[] = [
  {
    id: 'dsar-101',
    ticket_number: 'DSAR-2026-8812',
    email: 'maximilian.m@example.de',
    full_name: 'Maximilian Müller',
    type: 'auskunft',
    details: 'Anforderung einer vollständigen Kopie aller personenbezogenen Daten gemäß Art. 15 DSGVO.',
    status: 'in_review',
    deadline_date: new Date(Date.now() + 20 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    assigned_to: 'Datenschutz-Team',
  },
  {
    id: 'dsar-102',
    ticket_number: 'DSAR-2026-9041',
    email: 'sophia.b@example.de',
    full_name: 'Sophia Becker',
    type: 'widerspruch',
    details: 'Widerspruch gegen verhaltensbasiertes Profiling und Marketing-Nachrichten gem. Art. 21 DSGVO.',
    status: 'completed',
    deadline_date: new Date(Date.now() + 25 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    assigned_to: 'DPO',
    resolution_notes: 'Profiling umgehend deaktiviert. Bestätigungs-E-Mail versendet.',
  },
];

export function getDsarRequests(): DSARRequest[] {
  return IN_MEMORY_DSAR_REQUESTS;
}

export function createDsarRequest(payload: {
  email: string;
  full_name: string;
  type: DSARType;
  details?: string;
  user_id?: string;
}): DSARRequest {
  const ticketNumber = `DSAR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const deadline = new Date(now.getTime() + 30 * 86400000); // 30 statutory days

  const newRequest: DSARRequest = {
    id: `dsar-${Date.now()}`,
    ticket_number: ticketNumber,
    user_id: payload.user_id,
    email: payload.email,
    full_name: payload.full_name,
    type: payload.type,
    details: payload.details || '',
    status: 'pending',
    deadline_date: deadline.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    assigned_to: 'Datenschutz-Team',
  };

  IN_MEMORY_DSAR_REQUESTS.unshift(newRequest);
  return newRequest;
}

export function updateDsarStatus(id: string, status: DSARStatus, resolutionNotes?: string): DSARRequest | null {
  const req = IN_MEMORY_DSAR_REQUESTS.find(r => r.id === id);
  if (!req) return null;

  req.status = status;
  req.updated_at = new Date().toISOString();
  if (resolutionNotes) {
    req.resolution_notes = resolutionNotes;
  }

  return req;
}

export function generateUserDataExport(email: string) {
  return {
    export_metadata: {
      generated_at: new Date().toISOString(),
      platform: 'GudPreiss E-Commerce Platform (gudpreiss.de)',
      subject_email: email,
      legal_compliance: 'Art. 20 DSGVO (Recht auf Datenübertragbarkeit)',
    },
    user_profile: {
      email,
      account_status: 'Active',
      registered_date: new Date(Date.now() - 180 * 86400000).toISOString(),
    },
    consent_history: [
      {
        timestamp: new Date().toISOString(),
        policy_version: '2026.1-DSGVO',
        accepted_categories: ['necessary'],
        status: 'Active',
      }
    ],
    orders_history: [],
    saved_addresses: [],
  };
}
