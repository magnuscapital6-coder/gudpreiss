'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useTranslation } from '@/context/language-context';
import { useStoreSettings } from '@/context/store-settings-context';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  const { settings } = useStoreSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: name,
          clientEmail: email,
          subject: subject || 'Kontaktanfrage über GudPreiss.de',
          summary: `Kontaktanfrage von ${name} (${email}) — Betreff: ${subject || 'Allgemeine Anfrage'}`,
          initialRequest: message,
          conversationHistory: [],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setErrorMessage(data.error || 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('Contact Form Submission Error:', err);
      setErrorMessage('Ein unerwarteter Netzwerkfehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 w-full py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>24/7 KUNDENSERVICE DEUTSCHLAND</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Kontaktieren Sie GudPreiss
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Haben Sie Fragen zu E-Bikes, PlayStation 5 Konsolen, Ihrer Bestellung oder dem Versand? Unser deutsches Support-Team hilft Ihnen gerne weiter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Cards Info */}
          <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">Kontaktdaten &amp; Zentrale</h2>
                <p className="text-xs text-slate-400 mt-1">Direkter Kundenservice für Deutschland &amp; Europa.</p>
              </div>

              <div className="space-y-4 text-xs font-medium text-slate-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs">Adresse</span>
                    <span className="text-slate-400 text-[11px]">Friedrichstraße 12, 10117 Berlin, Deutschland</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs">Telefon-Hotline</span>
                    <span className="text-slate-400 text-[11px]">+49 30 1234567 (Mo - Sa: 08:00 - 20:00 Uhr)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs">E-Mail Support</span>
                    <span className="text-slate-400 text-[11px]">kontakt@gudpreiss.de</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-emerald-400 block">Schnelle Bearbeitung</span>
              <p>Alle Anfragen werden in der Regel innerhalb von 2 Stunden bearbeitet.</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Nachricht erfolgreich gesendet!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Vielen Dank, {name}. Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet. Unser Support-Team bearbeitet Ihre Anfrage umgehend.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Neue Nachricht senden
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Ihr Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Klaus Weber"
                      className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">E-Mail-Adresse *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="klaus.weber@beispiel.de"
                      className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Betreff *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Frage zu Bestellung #TN-2026..."
                    className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Nachricht *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wie kann das GudPreiss Support-Team Ihnen helfen?"
                    className="w-full px-4 py-3 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>NACHRICHT WIRD GESENDET...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>NACHRICHT ABSENDEN</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
