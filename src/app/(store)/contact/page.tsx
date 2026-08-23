'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, MessageSquare } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-1 relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>24/7 Deutscher Kundenservice</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Wie können wir Ihnen <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">helfen?</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Haben Sie Fragen zu E-Bikes, PlayStation 5 Konsolen, Zubehör, Versand oder Ihrer Bestellung? Wir stehen Ihnen jederzeit gerne zur Verfügung.
          </p>
        </div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Left Column: Official Contact Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-8">
              {/* Subtle Card Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>Kontaktdaten</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">GudPreiss Zentrale Deutschland</p>
              </div>

              <div className="space-y-6 text-xs text-slate-300">
                {/* Address */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 transition">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-white text-xs uppercase tracking-wider text-slate-400">Firmensitz &amp; Adresse</span>
                    <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                      Prenzlauer Allee 116
                    </span>
                    <span className="text-xs text-slate-400 block">
                      04332 Leipzig, Freistaat Sachsen, Deutschland
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs uppercase tracking-wider text-slate-400">E-Mail Support</span>
                    <a href="mailto:kontakt@gudpreiss.de" className="text-sm font-bold text-emerald-400 hover:underline block mt-0.5">
                      kontakt@gudpreiss.de
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 transition">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs uppercase tracking-wider text-slate-400">Kundenservice Hotline</span>
                    <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                      +49 (0) 341 98765432
                    </span>
                    <span className="text-[11px] text-slate-500 block">Montag bis Samstag: 08:00 – 20:00 Uhr</span>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 text-xs text-slate-400 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block text-xs">Kostenlose Kaufberatung</span>
                  <span className="text-[11px] text-slate-400">Antworten garantiert innerhalb von 2 Stunden.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
            {sent ? (
              <div className="text-center py-16 space-y-5">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-white">Vielen Dank für Ihre Nachricht!</h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  Hallo <strong className="text-white">{name}</strong>, Ihre Anfrage wurde an unser deutsches Support-Team per E-Mail an <span className="text-emerald-400 font-semibold">kontakt@gudpreiss.de</span> übermittelt.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="mt-4 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  Weitere Nachricht senden
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-white">Nachricht senden</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Füllen Sie das Formular aus, um unseren Support zu kontaktieren.</p>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Ihr Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="z. B. Max Mustermann"
                      className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      E-Mail-Adresse <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="max.mustermann@beispiel.de"
                      className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Betreff <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="z. B. Frage zu E-Bike CUBE Stereo Hybrid / Bestellung"
                    className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Ihre Nachricht <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Beschreiben Sie Ihre Anfrage so detailliert wie möglich..."
                    className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>NACHRICHT WIRD GESENDET...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>NACHRICHT JETZT ABSENDEN</span>
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
