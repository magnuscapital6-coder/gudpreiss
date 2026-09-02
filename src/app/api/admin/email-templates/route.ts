import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/db/db-provider';
import {
  DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
  DEFAULT_ADMIN_EMAIL_TEMPLATE,
  DEFAULT_CUSTOMER_SUBJECT,
  DEFAULT_ADMIN_SUBJECT,
} from '@/lib/email/templates';

export async function GET() {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getStoreSettings();

  return NextResponse.json({
    templates: {
      customer_template: settings?.email_template_order_customer || DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
      admin_template: settings?.email_template_order_admin || DEFAULT_ADMIN_EMAIL_TEMPLATE,
      customer_subject: settings?.email_subject_order_customer || DEFAULT_CUSTOMER_SUBJECT,
      admin_subject: settings?.email_subject_order_admin || DEFAULT_ADMIN_SUBJECT,
    },
    defaults: {
      customer_template: DEFAULT_CUSTOMER_EMAIL_TEMPLATE,
      admin_template: DEFAULT_ADMIN_EMAIL_TEMPLATE,
      customer_subject: DEFAULT_CUSTOMER_SUBJECT,
      admin_subject: DEFAULT_ADMIN_SUBJECT,
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  await updateStoreSettings({
    email_template_order_customer: body.customer_template,
    email_template_order_admin: body.admin_template,
    email_subject_order_customer: body.customer_subject,
    email_subject_order_admin: body.admin_subject,
  });

  return NextResponse.json({ success: true });
}
