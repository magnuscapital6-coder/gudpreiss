/**
 * Email Service (Unified Mailer Proxy for Backward Compatibility)
 * Delegates all operations to mailer-service.ts which supports both SMTP & Resend API.
 */

export {
  sendOrderConfirmationEmail,
  sendOrderAdminNotificationEmail,
  sendPasswordResetEmail,
  sendEmail,
  testEmailConfiguration,
  getMailerConfig,
} from './mailer-service';
