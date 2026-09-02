import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/supabase/server';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/lib/notifications/service';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'unread-count') {
    const count = await getUnreadCount();
    return NextResponse.json({ count });
  }

  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
  const notifications = await getNotifications(unreadOnly);
  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === 'mark-all-read') {
    await markAllAsRead();
    return NextResponse.json({ success: true });
  }

  if (body.notificationId) {
    await markAsRead(body.notificationId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const notificationId = url.searchParams.get('id');

  if (notificationId) {
    await deleteNotification(notificationId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Missing notification id' }, { status: 400 });
}
