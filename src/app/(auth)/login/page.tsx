'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Mail,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { loginSchema } from '@/lib/validation';

function LoginForm() {
  const { user, isAdmin, login, isLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [retryAfter, setRetryAfter] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Forgot password state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  const isLocked = retryAfter > 0;

  // Auto-redirect AFTER successful login (not on mount)
  // Track if we just logged in via handleSubmit
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (!justLoggedIn || !user) return;
    const targetUrl = (redirectTo && redirectTo.startsWith('/'))
      ? redirectTo
      : (isAdmin ? '/admin' : '/account');

    window.location.href = targetUrl;
  }, [justLoggedIn, user, isAdmin, redirectTo]);

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

  // ── Render Toast / Redirection Card for Logged-In Users ──
  // Only show if user just logged in (justLoggedIn flag)
  if (user && justLoggedIn) {
    const targetUrl = (redirectTo && redirectTo.startsWith('/'))
      ? redirectTo
      : (isAdmin ? '/admin' : '/account');

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/30 p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-black text-emerald-700 dark:text-emerald-300 mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>DÉJÀ CONNECTÉ / BEREITS ANGEMELDET</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Vous êtes déjà connecté !
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Connecté en tant que <strong className="text-slate-900 dark:text-slate-200 font-bold">{user.full_name || user.email}</strong>{' '}
            <span className="inline-block px-2 py-0.5 ml-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-extrabold uppercase text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {user.role === 'admin' || isAdmin ? 'Administrateur' : 'Client'}
            </span>
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-bold">Connexion réussie !</span>
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>

        <button
          onClick={() => { window.location.href = targetUrl; }}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
        >
          <span>Accéder au tableau de bord maintenant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

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
      toast.warning('Bitte überprüfen Sie die rot markierten Felder.', 'Angaben unvollständig');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success('Erfolgreich angemeldet. Willkommen zurück!', 'Anmeldung erfolgreich');
      setJustLoggedIn(true);
    } else {
      const msg = res.error || 'Ungültige Anmeldeinformationen.';
      setErrorMsg(msg);
      toast.error(msg, 'Anmeldung fehlgeschlagen');
      if (res.retryAfter) {
        setRetryAfter(res.retryAfter);
      }
      if (res.remaining !== undefined && res.remaining !== null) {
        setRemainingAttempts(res.remaining);
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg('');
    setForgotSuccessMsg('');

    if (!forgotEmail || !forgotEmail.includes('@')) {
      const err = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      setForgotErrorMsg(err);
      toast.warning(err, 'E-Mail erforderlich');
      return;
    }

    setIsForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccessMsg(data.message);
        toast.success(
          'Anweisungen zum Zurücksetzen wurden an Ihre E-Mail-Adresse gesendet!',
          'E-Mail gesendet ✉️'
        );
      } else {
        const err = data.error || 'Fehler beim Senden der Anfrage.';
        setForgotErrorMsg(err);
        toast.error(err, 'Fehler');
      }
    } catch {
      const err = 'Ein unerwarteter Netzwerkfehler ist aufgetreten.';
      setForgotErrorMsg(err);
      toast.error(err, 'Netzwerkfehler');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // ── Forgot Password View ──
  if (isForgotMode) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Passwort vergessen?
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Geben Sie Ihre Admin- oder Kunden-E-Mail ein. Wir senden Ihnen einen sicheren Link und Bestätigungscode zum Ändern Ihres Passworts.
          </p>
        </div>

        {forgotErrorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{forgotErrorMsg}</span>
          </div>
        )}

        {forgotSuccessMsg ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">E-Mail wurde gesendet</p>
                <p className="mt-1 leading-relaxed">{forgotSuccessMsg}</p>
                <p className="mt-2 text-[11px] opacity-80">
                  Überprüfen Sie auch Ihren Spam-Ordner. Der Link ist 30 Minuten gültig.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setForgotSuccessMsg('');
              }}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Zurück zur Anmeldung
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                E-Mail-Adresse *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@gudpreiss.de / kontakt@..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isForgotLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isForgotLoading ? (
                <span>LINK WIRD GESENDET...</span>
              ) : (
                <>
                  <span>RESET-LINK SENDEN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setForgotErrorMsg('');
              }}
              className="w-full py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              Abbrechen und zurück zum Login
            </button>
          </form>
        )}
      </div>
    );
  }

  // ── Standard Login View ──
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Anmelden bei GudPreiss</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zugang zum Kundenkonto und Admin-Dashboard</p>
      </div>

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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Passwort *</label>
            <button
              type="button"
              onClick={() => {
                setIsForgotMode(true);
                setForgotEmail(email);
              }}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Passwort vergessen?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked}
              className="w-full px-4 py-3 pr-10 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
        <Link href="/register" className="font-bold text-emerald-600 dark:text-emerald-500 hover:underline">
          Konto erstellen
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 w-full py-16">
        <Suspense fallback={<div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl h-96 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
