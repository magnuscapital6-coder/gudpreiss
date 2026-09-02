import { Notification } from '@/types';

/**
 * In-memory notification store for admin notifications.
 * Persists across requests in the same serverless instance.
 */
const memoryNotifications: Notification[] = [];

/**
 * Create a new admin notification.
 */
export async function createNotification(
  notification: Omit<Notification, 'id' | 'read' | 'created_at'>
): Promise<Notification> {
  const newNotification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    created_at: new Date().toISOString(),
    ...notification,
  };

  memoryNotifications.unshift(newNotification);

  // Keep only last 100 notifications in memory
  if (memoryNotifications.length > 100) {
    memoryNotifications.pop();
  }

  return newNotification;
}

/**
 * Get all admin notifications, newest first.
 */
export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  if (unreadOnly) {
    return memoryNotifications.filter((n) => !n.read);
  }
  return [...memoryNotifications];
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(): Promise<number> {
  return memoryNotifications.filter((n) => !n.read).length;
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  const notif = memoryNotifications.find((n) => n.id === notificationId);
  if (notif) {
    notif.read = true;
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(): Promise<void> {
  memoryNotifications.forEach((n) => {
    n.read = true;
  });
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const index = memoryNotifications.findIndex((n) => n.id === notificationId);
  if (index > -1) {
    memoryNotifications.splice(index, 1);
    return true;
  }
  return false;
}
