/**
 * Email Log Service
 * Handles email dispatch tracking, status (pending, sent, failed), error logging,
 * and anti-duplication (idempotency) to prevent repeated sends on page refreshes or retries.
 */

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

// In-memory fallback for logs when DB is unavailable
const memoryEmailLogs: EmailLogEntry[] = [];

/**
 * Check if an email of a specific type has already been sent successfully for an order.
 * Prevents duplicates on page refresh, webhook retry, or repeated clicks.
 */
export async function hasEmailBeenSent(orderNumber: string, emailType: EmailType): Promise<boolean> {
  if (!orderNumber) return false;

  // Check memory store
  const inMemorySent = memoryEmailLogs.some(
    (log) => log.order_number === orderNumber && log.email_type === emailType && log.status === 'sent'
  );
  if (inMemorySent) return true;

  return false;
}

/**
 * Create a new email log entry with 'pending' status.
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
}

/**
 * Retrieve recent email logs for debugging and admin dashboard.
 */
export async function getRecentEmailLogs(limit: number = 50): Promise<EmailLogEntry[]> {
  return [...memoryEmailLogs].slice(0, limit);
}
