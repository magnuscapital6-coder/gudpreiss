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
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/context/language-context';

const navItems = [
  { href: '/admin', labelKey: 'admin.dashboard', icon: LayoutDashboard },
  { href: '/admin/seo', labelKey: 'admin.seo', icon: Globe },
  { href: '/admin/Produkte', labelKey: 'admin.Produkte', icon: Package },
  { href: '/admin/Kategorien', labelKey: 'admin.Kategorien', icon: FolderTree },
  { href: '/admin/Bestellungen', labelKey: 'admin.Bestellungen', icon: ShoppingBag },
  { href: '/admin/Lagerbestand', labelKey: 'admin.Lagerbestand', icon: Boxes },
  { href: '/admin/Marketing', labelKey: 'admin.Marketing', icon: Tag },
  { href: '/admin/Bewertungen', labelKey: 'admin.Bewertungen', icon: Star },
  { href: '/admin/Kunden', labelKey: 'admin.Kunden', icon: Users },
  { href: '/admin/Medien', labelKey: 'admin.Medien', icon: ImageIcon },
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h2 className="text-lg font-black text-white">Zugriff Verweigert / Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sie müssen als Administrator angemeldet sein, um auf das Admin-Dashboard zuzugreifen.
          </p>
          <a
            href="/login"
            className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition"
          >
            ZUM LOGIN FORMULAR / SE CONNECTER
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden bg-slate-900 text-white h-14 px-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle Admin Sidebar"
            className="p-1.5 text-slate-300 hover:text-white rounded-lg touch-target"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-extrabold text-lg tracking-tight">
            Tech<span className="text-blue-500">nova</span> Admin
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs bg-slate-800 px-2.5 py-1.5 rounded-lg text-blue-400 font-semibold"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Boutique</span>
        </Link>
      </header>

      {/* Admin Sidebar Drawer (Desktop permanent, Mobile overlay drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                TN
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                Tech<span className="text-blue-500">nova</span>
              </span>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{t(item.labelKey)}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Administrateur'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@gudpreiss.store'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Shop anzeigen</span>
            </Link>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Admin Content Wrapper */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
