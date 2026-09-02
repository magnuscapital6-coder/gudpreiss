'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Package, AlertCircle, Info } from 'lucide-react';
import { Notification } from '@/types';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.set('unreadOnly', 'true');
      const res = await fetch(`/api/admin/notifications?${params}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (id: string) => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read' }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-emerald-600" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl space-y-6 text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black">Benachrichtigungen</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Systembenachrichtigungen und Bestellbenachrichtigungen
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Alle gelesen
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Alle ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            filter === 'unread'
              ? 'bg-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          Ungelesen ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">Keine Benachrichtigungen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition ${
                notif.read
                  ? 'border-slate-200/80 dark:border-slate-800'
                  : 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                    {new Date(notif.created_at).toLocaleString('de-DE')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="Als gelesen markieren"
                    >
                      <Check className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              {notif.data && notif.type === 'order' && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-4 text-[11px]">
                  <a
                    href={`/admin/orders?search=${(notif.data as Record<string, unknown>).orderNumber}`}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Bestellung ansehen →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
