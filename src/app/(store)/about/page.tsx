import React from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { Sparkles, ShieldCheck, Truck, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 w-full py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">About TechNova Store</h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Founded with a vision to connect technology enthusiasts with cutting-edge electronics, flagship smartphones, ultrabooks, and smart robotics.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">Our Mission</h3>
          <p>
            At TechNova, we believe that premium technology should be accessible, reliable, and backed by world-class customer service. Every smartphone, laptop, and audio device in our catalog undergoes rigorous authenticity verification and quality testing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <Award className="w-6 h-6 text-blue-600 mx-auto" />
              <h4 className="font-bold text-slate-900">100% Authentic</h4>
              <p className="text-[11px] text-slate-500">Official brand warranties</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <Truck className="w-6 h-6 text-blue-600 mx-auto" />
              <h4 className="font-bold text-slate-900">Express Delivery</h4>
              <p className="text-[11px] text-slate-500">Global air shipping</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto" />
              <h4 className="font-bold text-slate-900">Secure Payments</h4>
              <p className="text-[11px] text-slate-500">256-bit encrypted checkout</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
