'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
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
        {/* Header Title Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>24/7 DEUTSCHER KUNDENSERVICE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Kontaktieren Sie GudPreiss
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Haben Sie Fragen zu E-Bikes, PlayStation 5 Konsolen, Versand oder Ihrer Bestellung? Unser Kundendienst hilft Ihnen 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dark Contact Information Box */}
          <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Kontaktdaten</h2>
                <p className="text-xs text-slate-400 mt-1">GudPreiss Zentrale Deutschland</p>
              </div>

              <div className="space-y-5 text-xs text-slate-300">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <MapPin className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs">Firmensitz &amp; Adresse</span>
                    <span className="text-slate-300 text-xs block mt-0.5 font-medium">Prenzlauer Allee 116</span>
                    <span className="text-slate-400 text-[11px] block">04332 Leipzig, Freistaat Sachsen, Deutschland</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Mail className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs">E-Mail-Adresse</span>
                    <a href="mailto:kontakt@gudpreiss.de" className="text-emerald-400 font-bold text-xs hover:underline block mt-0.5">
                      kontakt@gudpreiss.de
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Phone className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs">Telefon-Hotline</span>
                    <span className="text-slate-300 text-xs block mt-0.5 font-medium">+49 (0) 341 98765432</span>
                    <span className="text-slate-400 text-[11px] block">Mo - Sa: 08:00 - 20:00 Uhr</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 mt-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Schnelle Antwortgarantie</span>
              </div>
              <p>Alle Anfragen werden in der Regel innerhalb von 2 Stunden beantwortet.</p>
            </div>
          </div>

          {/* Right Column: Clean White Form Box */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nachricht erfolgreich gesendet!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Vielen Dank, <strong className="text-slate-900 dark:text-white">{name}</strong>. Ihre Nachricht wurde an <span className="text-emerald-600 dark:text-emerald-400 font-semibold">kontakt@gudpreiss.de</span> gesendet. Unser Support-Team meldet sich in Kürze.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Weitere Nachricht senden
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
                      placeholder="Max Mustermann"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">E-Mail-Adresse *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="max.mustermann@beispiel.de"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
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
                    placeholder="Frage zu Bestellung oder Produkt..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Nachricht *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wie können wir Ihnen helfen?"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>NACHRICHT WIRD GESENDET...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>NACHRICHT SENDEN</span>
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
