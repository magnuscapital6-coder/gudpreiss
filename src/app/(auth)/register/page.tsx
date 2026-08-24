'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { registerSchema } from '@/lib/validation';

function RegisterForm() {
  const { user, isAdmin, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (!user) return;
    const targetUrl = (redirectTo && redirectTo.startsWith('/'))
      ? redirectTo
      : (isAdmin ? '/admin' : '/account');

    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, isAdmin, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg('');

    const result = registerSchema.safeParse({ fullName, email, password });
    if (!result.success) {
      const errors: { fullName?: string; email?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field === 'fullName') errors.fullName = issue.message;
        if (field === 'email') errors.email = issue.message;
        if (field === 'password') errors.password = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(email, password, fullName);
      if (res.success) {
        const targetUrl = (redirectTo && redirectTo.startsWith('/'))
          ? redirectTo
          : (isAdmin ? '/admin' : '/account');
        window.location.href = targetUrl;
      } else {
        setErrorMsg(res.error || 'Fehler bei der Registrierung.');
      }
    } catch {
      setErrorMsg('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render Toast / Redirection Card for Logged-In Users ──
  const renderAuthContent = () => {
    if (user) {
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
            <span className="text-slate-600 dark:text-slate-400 font-bold">Redirection vers votre tableau de bord...</span>
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

    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Konto erstellen</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Treten Sie GudPreiss bei für schnelleres Checkout und exklusive Angebote
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Vollständiger Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {fieldErrors.fullName && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">E-Mail-Adresse *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {fieldErrors.password && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>REGISTRIERUNG LÄUFT...</span>
            ) : (
              <>
                <span>REGISTRIEREN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Bereits ein Konto?{' '}
          <Link href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="font-bold text-emerald-600 dark:text-emerald-500 hover:underline">
            Anmelden
          </Link>
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 w-full py-16">
        {renderAuthContent()}
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold">Laden...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
