'use client';

import React from 'react';
import { Header } from '@/components/store/layout/Header';
import { Footer } from '@/components/store/layout/Footer';
import { useAuth } from '@/context/auth-context';
import { User, Package, Heart, MapPin, ShieldCheck, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CustomerAccountPage() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account profile, addresses, and order history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{user?.full_name || 'TechNova Customer'}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Admin User
                  </span>
                )}
              </div>
            </div>

            <nav className="space-y-1.5 text-xs font-bold text-slate-700">
              <Link href="/account" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User className="w-4 h-4" />
                <span>Account Overview</span>
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition">
                <Package className="w-4 h-4 text-slate-400" />
                <span>My Orders</span>
              </Link>
              <Link href="/wishlist" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition">
                <Heart className="w-4 h-4 text-slate-400" />
                <span>Saved Wishlist</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Go to Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition pt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Overview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs text-slate-500">Total Orders</div>
                <div className="text-2xl font-black text-slate-900 mt-1">2</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs text-slate-500">Active Shipments</div>
                <div className="text-2xl font-black text-blue-600 mt-1">1</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs text-slate-500">Saved Wishlist Items</div>
                <div className="text-2xl font-black text-slate-900 mt-1">0</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-base mb-4">Personal Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-bold text-slate-900">{user?.full_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-bold text-slate-900">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Phone Number</span>
                  <span className="font-bold text-slate-900">{user?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
