import React from 'react';
import { ShieldCheck, FileText, Lock, Eye, Bot, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Datenschutzerklärung | GudPreiss Compliance (DSGVO / BDSG / TDDDG)',
  description: 'Vollständige Datenschutzerklärung von GudPreiss nach DSGVO, BDSG und TDDDG. Transparenz über Cookies, KI-Assistent GudPreiss, Profiling und Ihre Betroffenenrechte.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Stand: 2026.1-DSGVO / TDDDG Konformität
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Datenschutzerklärung (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Wir freuen uns über Ihr Interesse an unserer E-Commerce-Plattform <strong>GudPreiss</strong>. Der Schutz Ihrer personenbezogenen Daten ist für uns ein wichtiges Anliegen. Nachfolgend informieren wir Sie ausführlich über den Umgang mit Ihren Daten gemäß DSGVO, BDSG und TDDDG.
          </p>
        </div>

        {/* Quick Link to Datenschutz-Center */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Möchten Sie Ihre Betroffenenrechte ausüben?
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Auskunft, Löschung („Meine Daten löschen“), Datenübertragbarkeit oder Widerspruch gegen Profiling.
              </div>
            </div>
          </div>
          <Link
            href="/datenschutz-center"
            className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition flex-shrink-0 flex items-center gap-1.5"
          >
            Zum Datenschutz-Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Section 1: Verantwortlicher */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. Name und Kontaktdaten des Verantwortlichen
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-1 font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
            <div><strong>GudPreiss E-Commerce GmbH</strong></div>
            <div>Musterstraße 42, 10117 Berlin, Deutschland</div>
            <div>E-Mail: datenschutz@gudpreiss.de | Telefon: +49 (0) 30 12345678</div>
            <div>Geschäftsführung: Brice Magnus | Handelsregister: HRB 123456 B, AG Berlin-Charlottenburg</div>
          </div>
        </section>

        {/* Section 2: Legal Bases */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Rechtsgrundlagen der Verarbeitung
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung der betroffenen Person einholen, dient <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> sowie <strong>§ 25 Abs. 1 TDDDG</strong> als Rechtsgrundlage. Bei der Verarbeitung zur Erfüllung eines Vertrages dient <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> als Rechtsgrundlage.
          </p>
        </section>

        {/* Section 3: AI Assistant GudPreiss */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-500" />
            3. GudPreiss KI-Assistent, Profiling & Art. 22 DSGVO
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Sie chatten auf unserer Plattform mit <strong>GudPreiss</strong>, unserem automatisierten KI-Assistenten. 
          </p>
          <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li><strong>Keine automatisierte Einzelfallentscheidung:</strong> Der KI-Assistent trifft keine Entscheidungen, die rechtliche Wirkungen entfalten (Art. 22 DSGVO). Preisanpassungen oder Dienstleistungsbeschränkungen finden nicht statt.</li>
            <li><strong>Verbot sensibler Daten (Art. 9 DSGVO):</strong> Es werden zu keinem Zeitpunkt Gesundheitsdaten, politische Überzeugungen oder biometrische Merkmale verarbeitet.</li>
            <li><strong>Widerspruchsrecht:</strong> Sie können verhaltensbasiertem Profiling jederzeit im Datenschutz-Center oder über unsere CMP widersprechen.</li>
          </ul>
        </section>

        {/* Section 4: Betroffenenrechte */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Ihre Rechte als betroffene Person (Art. 15–22 DSGVO)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white">Art. 15 DSGVO - Auskunftsrecht:</strong> Sie haben das Recht auf eine kostenlose Kopie Ihrer personenbezogenen Daten.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white">Art. 17 DSGVO - Recht auf Löschung:</strong> Sie können die unverzügliche Löschung („Recht auf Vergessenwerden“) verlangen.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white">Art. 20 DSGVO - Datenübertragbarkeit:</strong> Sie haben das Recht, Ihre Daten in einem strukturierten JSON/CSV-Format zu erhalten.
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-white">Art. 21 DSGVO - Widerspruchsrecht:</strong> Sie können der Verarbeitung sowie dem Profiling jederzeit widersprechen.
            </div>
          </div>
        </section>

        {/* Section 5: Complaint */}
        <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            5. Beschwerderecht bei der Aufsichtsbehörde
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Sie haben unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen Rechtsbehelfs das Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde (z.B. Berliner Beauftragte für Datenschutz und Informationsfreiheit oder BfDI).
          </p>
        </section>

      </div>
    </div>
  );
}
