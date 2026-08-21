'use client';

import React, { useState } from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 w-full py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Get in Touch with TechNova</h1>
          <p className="text-xs text-slate-500 mt-2">Have a question regarding products, shipping or bulk orders? We are here to help 24/7.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold">Contact Details</h3>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>100 Tech Nova Way, Silicon Valley, CA 94025</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+1 (800) 555-TECH</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>support@technova.store</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-500">Our customer support team will get back to you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Your Name</label>
                    <input type="text" required className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
                    <input type="email" required className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Subject</label>
                  <input type="text" required className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Message</label>
                  <textarea rows={4} required className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                  Send Message
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
