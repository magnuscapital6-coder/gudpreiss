'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RecommendedProductRef } from '@/types/ai';
import { getStoredSignals } from '@/lib/ai/behavior-tracker';
import {
  Sparkles,
  X,
  Minus,
  Send,
  Bot,
  User,
  ExternalLink,
  MailCheck,
  Headphones,
  RotateCcw,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function GupreissChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Hallo! Ich bin **Gupreiss**, Ihr autonomer Einkaufs- und Service-Assistent. Wie kann ich Ihnen heute bei **E-Bikes** (SCOTT, CUBE, Haibike), **PlayStation 5 Hardware** oder Versand & Bestellung helfen?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        '🚲 Welches E-Bike passt zu mir?',
        '🎮 PS5 Pro 2TB Angebote anzeigen',
        '📦 Wie sind die Versandzeiten?',
        '✉️ Kundenservice kontaktieren',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: data.recommendedProducts,
        actionsPerformed: data.actionsPerformed,
        isEmailSent: data.isEmailSent,
        ticketId: data.ticketId,
        suggestedQuestions: data.suggestedQuestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Entschuldigung, es ist ein Netzwerkfehler aufgetreten. Bitte versuchen Sie es erneut.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const [proactivePrompt, setProactivePrompt] = useState<string | null>(null);

  // Behavioral tracking hook
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track initial page view
    const signals = getStoredSignals();

    // Check for proactive intervention decision
    fetch('/api/ai/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate',
        signals,
        currentUrl: window.location.pathname,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.intervention?.shouldIntervene && data.intervention?.promptMessage) {
          setProactivePrompt(data.intervention.promptMessage);
        }
      })
      .catch((err) => console.error('Conversion evaluation error:', err));
  }, []);

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  return (
    <>
      {/* Proactive Intervention Bubble (Non-Intrusive) */}
      {!isOpen && proactivePrompt && (
        <div className="fixed bottom-20 right-5 z-50 max-w-[320px] bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0">
                <Bot className="w-3.5 h-3.5 text-slate-950" />
              </div>
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                Gupreiss Kaufberater
              </span>
            </div>
            <button
              onClick={() => setProactivePrompt(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 mt-2 leading-relaxed font-medium">{proactivePrompt}</p>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              handleSendMessage(proactivePrompt);
              setProactivePrompt(null);
            }}
            className="mt-2.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Jetzt beraten lassen</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Gupreiss AI Assistent öffnen"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-4 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95 group border border-emerald-400/30"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-slate-950/40 flex items-center justify-center border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold leading-none">
              Autonomer AI Berater
            </span>
            <span className="text-[14px] font-black tracking-tight leading-tight">Gupreiss IA</span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-[68px]' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-emerald-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-2xl bg-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-md border border-emerald-400/30 shrink-0">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-white tracking-tight">Gupreiss AI</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase rounded-md border border-emerald-500/30">
                    Autonom
                  </span>
                </div>
                <p className="text-[11px] text-emerald-300/80 font-medium">Online &amp; Bereit zur Beratung</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label="Minimieren"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Schließen"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 dark:bg-slate-900/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="max-w-[84%] space-y-2">
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {/* Format Bolding and Newlines */}
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: msg.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                          }}
                        />

                        {/* Email Handoff Badge */}
                        {msg.isEmailSent && (
                          <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-2">
                            <MailCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Übermittelt an kontakt@gudpreiss.de ({msg.ticketId})</span>
                          </div>
                        )}

                        <span
                          className={`block text-[10px] mt-1 text-right ${
                            msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Recommended Products Cards */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3 text-emerald-500" />
                            Empfohlene Angebote ({msg.recommendedProducts.length}):
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.recommendedProducts.map((prod) => (
                              <Link
                                key={prod.id}
                                href={`/shop/${prod.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-xs group"
                              >
                                {prod.image && (
                                  <div className="relative w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                    <Image
                                      src={prod.image}
                                      alt={prod.name}
                                      fill
                                      className="object-cover group-hover:scale-105 transition"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[12px] font-extrabold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-500 transition">
                                    {prod.name}
                                  </h4>
                                  <p className="text-[11px] font-black text-emerald-600">
                                    {prod.price.toFixed(2)} €
                                  </p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0 mr-1" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Questions Pills */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickQuestion(q)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg shadow-2xs transition text-left cursor-pointer"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span className="font-extrabold text-[11px]">Gupreiss réfléchit...</span>
                      <div className="flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Frage zu E-Bikes, PS5 oder Support stellen..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl shadow-md transition shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-600 px-1">
                  <span>Autonomer AI Assistent • Gudpreiss GmbH</span>
                  <button
                    onClick={() => handleSendMessage('Ich möchte den Kundenservice kontaktieren')}
                    className="hover:underline flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-700 cursor-pointer"
                  >
                    <Headphones className="w-3 h-3" />
                    <span>Support kontaktieren</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
