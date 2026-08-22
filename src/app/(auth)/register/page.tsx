'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { registerSchema } from '@/lib/validation';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        router.push('/account');
      } else {
        setErrorMsg(res.error || 'Fehler bei der Registrierung.');
      }
    } catch {
      setErrorMsg('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-md mx-auto px-4 w-full py-16">
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
            <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-500 hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
