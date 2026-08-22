'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { loginSchema } from '@/lib/validation';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [retryAfter, setRetryAfter] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Countdown timer for rate limit cooldown
  const isLocked = retryAfter > 0;
  useEffect(() => {
    if (!isLocked) return;
    const timer = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});
    setRemainingAttempts(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field === 'email') errors.email = issue.message;
        if (field === 'password') errors.password = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      if (redirectTo && redirectTo.startsWith('/')) {
        router.push(redirectTo);
      } else if (email.includes('admin')) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } else {
      setErrorMsg(res.error || 'Ungültige Anmeldeinformationen.');
      if (res.retryAfter) {
        setRetryAfter(res.retryAfter);
      }
      if (res.remaining !== undefined && res.remaining !== null) {
        setRemainingAttempts(res.remaining);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 w-full py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg shadow-emerald-600/20">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Anmelden bei GudPreiss</h1>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Zugang zum Kundenkonto und Admin-Dashboard</p>
          </div>

          {/* Rate limit lockout banner */}
          {isLocked && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-700" />
              <div>
                <p className="font-bold">Zu viele Anmeldeversuche</p>
                <p className="mt-0.5">
                  Bitte warten Sie <span className="font-mono font-bold">{formatTime(retryAfter)}</span> bevor Sie es erneut versuchen.
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && !isLocked && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div>
                <span>{errorMsg}</span>
                {remainingAttempts !== null && remainingAttempts >= 0 && (
                  <span className="block mt-0.5 text-[10px] text-red-400">
                    Verbleibende Versuche: {remainingAttempts}
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">E-Mail-Adresse *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked}
                className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {fieldErrors.email && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Passwort *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked}
                className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {fieldErrors.password && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLocked ? (
                <span>GESPERRT - {formatTime(retryAfter)}</span>
              ) : isLoading ? (
                <span>ANMELDUNG LÄUFT...</span>
              ) : (
                <>
                  <span>ANMELDEN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-500">
            Noch kein Konto?{' '}
            <Link href="/register" className="font-bold text-emerald-600 dark:text-emerald-700 hover:underline">
              Konto erstellen
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
