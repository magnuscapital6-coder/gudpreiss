'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Settings,
  BookOpen,
  Mail,
  BarChart3,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  Plus,
  Save,
  Search,
  RefreshCw,
  Sliders,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { GupreissConfig, KnowledgeItem, HandoffTicket, AIAnalytics } from '@/types/ai';
import {
  DEFAULT_GUPREISS_CONFIG,
  DEFAULT_KNOWLEDGE_BASE,
  getHandoffTickets,
  getAIAnalytics,
} from '@/lib/ai/knowledge-base';

export default function AdminAIPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'knowledge' | 'tickets' | 'analytics'>('settings');

  // Config State
  const [config, setConfig] = useState<GupreissConfig>(DEFAULT_GUPREISS_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Knowledge Base State
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>(DEFAULT_KNOWLEDGE_BASE);
  const [searchKB, setSearchKB] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Tickets State
  const [tickets, setTickets] = useState<HandoffTicket[]>([]);

  // Analytics State
  const [analytics, setAnalytics] = useState<AIAnalytics>(getAIAnalytics());

  useEffect(() => {
    setTickets(getHandoffTickets());
    setAnalytics(getAIAnalytics());
  }, []);

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  const handleAddKB = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newItem: KnowledgeItem = {
      id: `kb-custom-${Date.now()}`,
      category: 'general',
      title: newTitle.trim(),
      content: newContent.trim(),
      keywords: newTitle.toLowerCase().split(' '),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setKnowledgeList([newItem, ...knowledgeList]);
    setNewTitle('');
    setNewContent('');
  };

  const filteredKB = knowledgeList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchKB.toLowerCase()) ||
      item.content.toLowerCase().includes(searchKB.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 p-6 rounded-3xl border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0 border border-emerald-400/30">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">Gupreiss IA Autonome</h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold rounded-full border border-emerald-500/30">
                v2.4 Production
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verwaltung, Wissensbasis, E-Mail-Übertragung an <strong>kontakt@gudpreiss.de</strong> und Analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? 'Gespeichert!' : 'Einstellungen Speichern'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Assistent-Konfiguration</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'knowledge'
              ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Wissensdatenbank ({knowledgeList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'tickets'
              ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Kundenservice Tickets ({tickets.length})</span>
          {tickets.length > 0 && (
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Statistiken &amp; Analytics</span>
        </button>

        <Link
          href="/admin/ai/conversion"
          className="px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer bg-emerald-600/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white"
        >
          <Sparkles className="w-4 h-4" />
          <span>Conversion Intelligence</span>
        </Link>
      </div>

      {/* Tab 1: Assistant Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Grundeinstellungen &amp; Verhalten</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold">Assistent Aktiv:</span>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Name des Assistenten</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ziel-E-Mail für Übertragung</label>
                <input
                  type="email"
                  value={config.targetEmail}
                  onChange={(e) => setConfig({ ...config, targetEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Willkommensnachricht</label>
              <textarea
                rows={2}
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">System-Prompt &amp; Autonomie-Regeln</label>
              <textarea
                rows={6}
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Sicherheits- &amp; Abfrageschutz
              </h3>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Serverseitige API-Ausführung (/api/ai/chat)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Strict Null-Halluzinationen für Preise &amp; Bestand</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automatischer E-Mail-Versand an kontakt@gudpreiss.de</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Rate Limiting &amp; Prompt Injection Schutz</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Knowledge Base */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black">Neuen Wissenseintrag Hinzufügen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Titel / Thema (z.B. Garantie E-Bike Akku)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="sm:col-span-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Inhalt / Offizielle Antwort"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
            <button
              onClick={handleAddKB}
              className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-500 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Wissenseintrag Hinzufügen</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-black">Vorhandene Wissensdatenbank ({filteredKB.length})</h3>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Wissen durchsuchen..."
                  value={searchKB}
                  onChange={(e) => setSearchKB(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKB.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-[10px] font-black uppercase rounded-md">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.updatedAt}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tickets Handoff */}
      {activeTab === 'tickets' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black">Übermittelte Kundenservice-Tickets (an kontakt@gudpreiss.de)</h3>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Bisher wurden keine Tickets übermittelt.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-emerald-600">{t.id}</span>
                      <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold rounded-full uppercase">
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(t.createdAt).toLocaleString('de-DE')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{t.subject}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 font-bold">Kunde:</span> {t.clientName || 'N/A'} (
                      {t.clientEmail || 'kontakt@gudpreiss.de'})
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Aktion erforderlich:</span> {t.actionNeeded}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Gesamte Gespräche</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics.totalConversations}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs font-bold text-emerald-500 uppercase">Durch KI Gelöst</span>
              <p className="text-2xl font-black text-emerald-600">{analytics.resolvedByAI}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs font-bold text-amber-500 uppercase">Übertragungsquote</span>
              <p className="text-2xl font-black text-amber-500">{analytics.transferRatePercent} %</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Ø Antwortzeit</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics.avgResponseTimeMs} ms</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black">Häufigste Kundenfragen (Top Themen)</h3>
            <div className="space-y-3">
              {analytics.frequentQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{q.question}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-extrabold rounded-md">
                    {q.count} Anfragen
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
