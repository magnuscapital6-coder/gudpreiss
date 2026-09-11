'use client';

import React, { useEffect, useState } from 'react';
import { useToast, Toast, ToastType } from '@/context/toast-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const toastConfig: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    borderColor: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    defaultTitle: string;
    progressBar: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
    badgeText: 'ERFOLG',
    defaultTitle: 'Erfolgreich',
    progressBar: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    borderColor: 'border-rose-500/30 dark:border-rose-500/40',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100/80 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300',
    badgeText: 'FEHLER',
    defaultTitle: 'Fehler',
    progressBar: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500/30 dark:border-amber-500/40',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300',
    badgeText: 'HINWEIS',
    defaultTitle: 'Hinweis',
    progressBar: 'bg-amber-500',
  },
  info: {
    icon: Info,
    borderColor: 'border-sky-500/30 dark:border-sky-500/40',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-100/80 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300',
    badgeText: 'INFO',
    defaultTitle: 'Information',
    progressBar: 'bg-sky-500',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(toast.duration || 4500);
  const totalDuration = toast.duration || 4500;

  const config = toastConfig[toast.type] || toastConfig.info;
  const IconComponent = config.icon;

  useEffect(() => {
    if (totalDuration <= 0) return;

    let timer: NodeJS.Timeout;
    if (!isPaused && remainingTime > 0) {
      timer = setTimeout(() => {
        onDismiss(toast.id);
      }, remainingTime);
    }

    return () => clearTimeout(timer);
  }, [isPaused, remainingTime, totalDuration, onDismiss, toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      className={`relative pointer-events-auto w-full overflow-hidden rounded-2xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/10 dark:shadow-black/50 ${config.borderColor} transition-all`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconColor} shadow-inner`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${config.badgeBg}`}
            >
              {config.badgeText}
            </span>
            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
              {toast.title || config.defaultTitle}
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words font-medium">
            {toast.message}
          </p>

          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 -mr-1 -mt-1 p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Animated subtle progress bar */}
      {totalDuration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: isPaused ? '100%' : '0%' }}
          transition={{ duration: totalDuration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 opacity-60 ${config.progressBar}`}
        />
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[999999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-[calc(100vw-2rem)] sm:w-96"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
