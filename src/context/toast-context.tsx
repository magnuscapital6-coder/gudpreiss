'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms
  action?: ToastAction;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (options: Omit<Toast, 'id'>) => string;
  success: (message: string, title?: string, duration?: number, action?: ToastAction) => string;
  error: (message: string, title?: string, duration?: number, action?: ToastAction) => string;
  warning: (message: string, title?: string, duration?: number, action?: ToastAction) => string;
  info: (message: string, title?: string, duration?: number, action?: ToastAction) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500, action }: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: Toast = { id, type, title, message, duration, action };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts on screen
      return id;
    },
    []
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number, action?: ToastAction) =>
      showToast({ type: 'success', message, title, duration, action }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number, action?: ToastAction) =>
      showToast({ type: 'error', message, title, duration, action }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number, action?: ToastAction) =>
      showToast({ type: 'warning', message, title, duration, action }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number, action?: ToastAction) =>
      showToast({ type: 'info', message, title, duration, action }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        dismissToast,
        clearToasts,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
