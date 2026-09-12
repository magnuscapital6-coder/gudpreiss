/**
 * Email Log Service
 * Handles email dispatch tracking, status (pending, sent, failed), error logging,
 * and anti-duplication (idempotency) to prevent repeated sends on page refreshes, retries,
 * or across serverless instances.
 *
 * Logs are persisted in the Supabase `email_logs` table (via the service-role client) so
 * traceability survives restarts and is shared across serverless instances. When the table
 * or Supabase is unavailable, an in-memory store is used as a non-blocking fallback: the
 * sending pipeline itself NEVER depends on logging succeeding.
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type EmailType =
  | 'order_confirmation_customer'
  | 'order_notification_admin'
  | 'test_email'
  | 'password_reset'
  | 'support_handoff';

export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface EmailLogEntry {
  id: string;
  order_id?: string;
  order_number?: string;
  email_type: EmailType;
  recipient: string;
  subject: string;
  transport_used: 'smtp' | 'resend' | 'none';
  status: EmailStatus;
  error_message?: string;
  message_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

type DbClient = ReturnType<typeof createAdminClient> | null;

let dbClient: DbClient = null;
let dbUnavailable = false;
let dbRetryAfter = 0;

/**
 * Lazy service-role Supabase client used to persist email logs.
 * Returns null when Supabase is not configured/available.
 */
function getDb(): DbClient {
  const now = Date.now();
  if (dbUnavailable && now < dbRetryAfter) return null;
  if (!dbClient) {
    try {
      dbClient = createAdminClient();
    } catch {
      dbUnavailable = true;
      dbRetryAfter = now + 60_000;
      return null;
    }
  }
  return dbClient;
}

/** True when a Supabase error is caused by a missing table (schema not migrated yet). */
function isMissingTable(error: { message?: string; code?: string } | null | undefined): boolean {
  if (!error) return false;
  const msg = `${error.code || ''} ${error.message || ''}`.toLowerCase();
  return (
    msg.includes('does not exist') ||
    msg.includes('relation') ||
    msg.includes('pgrst205') ||
    msg.includes('pgrst204') ||
    msg.includes('could not find') ||
    msg.includes('undefined_table') ||
    msg.includes('42p01')
  );
}

// In-memory fallback for logs when DB is unavailable
const memoryEmailLogs: EmailLogEntry[] = [];

/**
 * Check if an email of a specific type has already been sent successfully for an order.
 * Prevents duplicates on page refresh, webhook retry, or repeated clicks:
 * - DB-first so the guard holds across serverless instances and restarts.
 * - In-memory fallback for the current process.
 */
export async function hasEmailBeenSent(orderNumber: string, emailType: EmailType): Promise<boolean> {
  if (!orderNumber) return false;

  // 1. Persistent DB check
  try {
    const db = getDb();
    if (db) {
      const { data, error } = await db
        .from('email_logs')
        .select('id')
        .eq('order_number', orderNumber)
        .eq('email_type', emailType)
        .eq('status', 'sent')
        .maybeSingle();

      if (!error) {
        if (data) return true;
      } else if (isMissingTable(error)) {
        dbUnavailable = true;
        dbRetryAfter = Date.now() + 60_000;
      }
    }
  } catch {
    // DB unavailable — fall through to memory
  }

  // 2. In-memory check (same process)
  return memoryEmailLogs.some(
    (log) => log.order_number === orderNumber && log.email_type === emailType && log.status === 'sent'
  );
}

/**
 * Create a new email log entry with 'pending' status.
 * Returns the log entry id (also used to update the row afterwards).
 */
export async function recordEmailPending(params: {
  order_id?: string;
  order_number?: string;
  email_type: EmailType;
  recipient: string;
  subject: string;
  transport_used: 'smtp' | 'resend' | 'none';
  metadata?: Record<string, any>;
}): Promise<string> {
  const logId = `elog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const entry: EmailLogEntry = {
    id: logId,
    order_id: params.order_id,
    order_number: params.order_number,
    email_type: params.email_type,
    recipient: params.recipient,
    subject: params.subject,
    transport_used: params.transport_used,
    status: 'pending',
    metadata: params.metadata,
    created_at: now,
    updated_at: now,
  };

  memoryEmailLogs.unshift(entry);
  if (memoryEmailLogs.length > 200) memoryEmailLogs.pop();

  // Best-effort DB persistence (never throws into the sending pipeline)
  try {
    const db = getDb();
    if (db) {
      const { error } = await db.from('email_logs').insert({
        id: entry.id,
        order_id: entry.order_id || null,
        order_number: entry.order_number || null,
        email_type: entry.email_type,
        recipient: entry.recipient,
        subject: entry.subject,
        transport_used: entry.transport_used,
        status: 'pending',
        metadata: entry.metadata || {},
      });
      if (error) {
        if (isMissingTable(error)) {
          dbUnavailable = true;
          dbRetryAfter = Date.now() + 60_000;
        } else if (error.code === '23505') {
          // Duplicate log entry (concurrent retry already recorded) — non-fatal.
        } else {
          console.warn(`[EmailLog] Insert ignoré (${error.message || 'DB error'}) — fallback mémoire.`);
        }
      }
    }
  } catch {
    // non-blocking
  }

  return logId;
}

/**
 * Update an existing email log entry to 'sent' or 'failed'.
 */
export async function recordEmailResult(
  logId: string,
  result: {
    status: 'sent' | 'failed';
    message_id?: string;
    error_message?: string;
    transport_used?: 'smtp' | 'resend' | 'none';
  }
): Promise<void> {
  const now = new Date().toISOString();

  // Update in-memory
  const memIndex = memoryEmailLogs.findIndex((log) => log.id === logId);
  if (memIndex !== -1) {
    memoryEmailLogs[memIndex] = {
      ...memoryEmailLogs[memIndex],
      status: result.status,
      message_id: result.message_id || memoryEmailLogs[memIndex].message_id,
      error_message: result.error_message,
      transport_used: result.transport_used || memoryEmailLogs[memIndex].transport_used,
      updated_at: now,
    };
  }

  // Best-effort DB update
  try {
    const db = getDb();
    if (db) {
      const { error } = await db
        .from('email_logs')
        .update({
          status: result.status,
          message_id: result.message_id || null,
          error_message: result.error_message || null,
          transport_used: result.transport_used || undefined,
          updated_at: now,
        })
        .eq('id', logId);
      if (error && isMissingTable(error)) {
        dbUnavailable = true;
        dbRetryAfter = Date.now() + 60_000;
      }
    }
  } catch {
    // non-blocking
  }
}

/**
 * Retrieve recent email logs for debugging and admin dashboard.
 * Merges DB logs (durable) with current-process memory logs.
 */
export async function getRecentEmailLogs(limit: number = 50): Promise<EmailLogEntry[]> {
  const dbLogs: EmailLogEntry[] = [];

  try {
    const db = getDb();
    if (db) {
      const { data, error } = await db
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && Array.isArray(data)) {
        dbLogs.push(...(data as EmailLogEntry[]));
      } else if (error && isMissingTable(error)) {
        dbUnavailable = true;
        dbRetryAfter = Date.now() + 60_000;
      }
    }
  } catch {
    // non-blocking
  }

  // Merge: DB records first (durable, cross-instance), then memory records not yet persisted
  const seen = new Set(dbLogs.map((l) => l.id));
  const memoryOnly = memoryEmailLogs.filter((l) => !seen.has(l.id));
  const merged = [...dbLogs, ...memoryOnly].slice(0, limit);
  return merged;
}