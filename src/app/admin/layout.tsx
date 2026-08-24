'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Boxes,
  Tag,
  Star,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Store,
  Globe,
  UserCheck,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

const navItems = [
  { href: '/admin', labelKey: 'admin.dashboard', icon: LayoutDashboard },
  { href: '/admin/ai', labelKey: 'GudPreiss Berater', icon: UserCheck },
  { href: '/admin/seo', labelKey: 'admin.seo', icon: Globe },
  { href: '/admin/products', labelKey: 'admin.products', icon: Package },
  { href: '/admin/categories', labelKey: 'admin.categories', icon: FolderTree },
  { href: '/admin/orders', labelKey: 'admin.orders', icon: ShoppingBag },
  { href: '/admin/inventory', labelKey: 'admin.inventory', icon: Boxes },
  { href: '/admin/marketing', labelKey: 'admin.marketing', icon: Tag },
  { href: '/admin/reviews', labelKey: 'admin.reviews', icon: Star },
  { href: '/admin/customers', labelKey: 'admin.customers', icon: Users },
  { href: '/admin/media', labelKey: 'admin.media', icon: ImageIcon },
  { href: '/admin/settings', labelKey: 'admin.settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Require Admin Role Protection
  if (!isLoading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h2 className="text-lg font-black text-slate-900">Zugriff verweigert</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sie müssen als Administrator angemeldet sein, um auf das Admin-Dashboard zuzugreifen.
          </p>
          <a
            href="/login"
            className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/10 transition"
          >
            ZUM LOGIN
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden bg-white text-slate-900 border-b border-slate-200 h-14 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle Admin Sidebar"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg touch-target"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Gud<span className="text-emerald-600">Preiss</span> Admin
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg text-emerald-700 font-semibold transition"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop</span>
        </Link>
      </header>

      {/* Admin Sidebar Drawer (Desktop permanent, Mobile overlay drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white text-slate-700 flex flex-col justify-between border-r border-slate-200/80 shadow-xs transition-transform duration-200 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-black text-xl text-slate-900 tracking-tight">
                Gud<span className="text-emerald-600">Preiss</span>
              </span>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const labelText = item.labelKey.startsWith('admin.') ? t(item.labelKey) : item.labelKey;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/15'
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{labelText}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs border border-emerald-500/30 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@gudpreiss.store'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Shop anzeigen</span>
            </Link>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              aria-label="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Admin Content Wrapper */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden min-w-0 bg-slate-50 text-slate-900">
        {children}
      </main>
    </div>
  );
}
