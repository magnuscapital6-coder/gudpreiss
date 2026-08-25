'use client';

import React, { useState, useEffect } from 'react';
import { useStoreSettings } from '@/context/store-settings-context';
import { ImageUploader } from '@/components/admin/ImageUploader';
import {
  Sparkles,
  Save,
  RotateCcw,
  Image as ImageIcon,
  ShieldCheck,
  Check,
  Globe,
  Palette,
  Layout,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandingSettingsPage() {
  const { settings, updateSettings, isLoading: isContextLoading } = useStoreSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [storeName, setStoreName] = useState('GudPreiss');
  const [logoUrl, setLogoUrl] = useState<string[]>([]);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string[]>([]);
  const [logoMobileUrl, setLogoMobileUrl] = useState<string[]>([]);
  const [faviconUrl, setFaviconUrl] = useState<string[]>([]);
  const [appleTouchIconUrl, setAppleTouchIconUrl] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#065f46');
  const [secondaryColor, setSecondaryColor] = useState('#0284c7');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name || 'GudPreiss');
      if (settings.logo_url) setLogoUrl([settings.logo_url]);
      if (settings.logo_dark_url) setLogoDarkUrl([settings.logo_dark_url]);
      if (settings.logo_mobile_url) setLogoMobileUrl([settings.logo_mobile_url]);
      if (settings.favicon_url) setFaviconUrl([settings.favicon_url]);
      if (settings.apple_touch_icon_url) setAppleTouchIconUrl([settings.apple_touch_icon_url]);
      if (settings.primary_color) setPrimaryColor(settings.primary_color);
      if (settings.secondary_color) setSecondaryColor(settings.secondary_color);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    const payload = {
      store_name: storeName,
      logo_url: logoUrl[0] || '/logo.png',
      logo_dark_url: logoDarkUrl[0] || logoUrl[0] || '/logo-dark.png',
      logo_mobile_url: logoMobileUrl[0] || logoUrl[0] || '/logo-mobile.png',
      favicon_url: faviconUrl[0] || '/favicon.ico',
      apple_touch_icon_url: appleTouchIconUrl[0] || faviconUrl[0] || '/apple-touch-icon.png',
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    };

    try {
      // 1. Update global store settings context & local storage
      await updateSettings(payload);

      // 2. Persist in server database via API route
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Fehler beim Speichern auf dem Server');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Fehler beim Speichern der Branding-Einstellungen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Möchten Sie das Erscheinungsbild auf die Standardwerte zurücksetzen?')) return;

    const defaultPayload = {
      store_name: 'GudPreiss',
      logo_url: '/logo.png',
      logo_dark_url: '/logo-dark.png',
      logo_mobile_url: '/logo-mobile.png',
      favicon_url: '/favicon.ico',
      apple_touch_icon_url: '/apple-touch-icon.png',
      primary_color: '#065f46',
      secondary_color: '#0284c7',
    };

    setStoreName('GudPreiss');
    setLogoUrl(['/logo.png']);
    setLogoDarkUrl(['/logo-dark.png']);
    setLogoMobileUrl(['/logo-mobile.png']);
    setFaviconUrl(['/favicon.ico']);
    setAppleTouchIconUrl(['/apple-touch-icon.png']);
    setPrimaryColor('#065f46');
    setSecondaryColor('#0284c7');

    try {
      await updateSettings(defaultPayload);
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultPayload),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Fehler beim Zurücksetzen.');
    }
  };

  if (isContextLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 dark:text-slate-400 font-bold text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        <span>Branding-Einstellungen werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 text-slate-900 dark:text-white">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EINSTELLUNGEN</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
              Supabase DB Synchronisiert
            </span>
          </div>
          <h1 className="text-2xl font-black">🎨 Branding &amp; Visuelle Identität</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verwalten Sie Logos, Favicons, Farbschemata und Vorschauen mit sofortiger Persistenz in der Datenbank.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zurücksetzen</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Branding-Einstellungen wurden erfolgreich auf dem Server und in Supabase gespeichert!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Branding Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Name & Color Palette */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-extrabold tracking-wide uppercase">
              1. Shopname &amp; Farbschema
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold mb-1.5">Shop-Name (Marke) *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Hauptfarbe (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Zweitfarbe (Secondary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Desktop & Mobile Logos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-extrabold tracking-wide uppercase">
              2. Logos (Helles Thema, Dunkles Thema &amp; Mobile)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2">
                Logo Helles Thema (Light Mode)
              </label>
              <ImageUploader images={logoUrl} onChange={setLogoUrl} />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">
                Logo Dunkles Thema (Dark Mode)
              </label>
              <ImageUploader images={logoDarkUrl} onChange={setLogoDarkUrl} />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">
                Logo Mobile Header
              </label>
              <ImageUploader images={logoMobileUrl} onChange={setLogoMobileUrl} />
            </div>
          </div>
        </div>

        {/* Section 3: Favicon & App Icons */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-extrabold tracking-wide uppercase">
              3. Favicon &amp; App Icons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2">
                Favicon Browser-Tab (.ico / .png / .svg)
              </label>
              <ImageUploader images={faviconUrl} onChange={setFaviconUrl} />
            </div>

            <div>
              <label className="block text-xs font-bold mb-2">
                Apple Touch Icon (iOS Home Screen)
              </label>
              <ImageUploader images={appleTouchIconUrl} onChange={setAppleTouchIconUrl} />
            </div>
          </div>
        </div>

        {/* Section 4: Live Preview */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layout className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              4. Echtzeit-Vorschau des Shop-Headers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Light Mode Preview */}
            <div className="bg-white text-slate-900 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Header Light Mode</span>
              <div className="flex items-center gap-2 h-10">
                {logoUrl[0] ? (
                  <Image src={logoUrl[0]} alt="Light Logo" width={140} height={28} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="font-black text-lg text-emerald-800 tracking-tight">{storeName}</span>
                )}
              </div>
            </div>

            {/* Dark Mode Preview */}
            <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Header Dark Mode</span>
              <div className="flex items-center gap-2 h-10">
                {logoDarkUrl[0] || logoUrl[0] ? (
                  <Image src={logoDarkUrl[0] || logoUrl[0]} alt="Dark Logo" width={140} height={28} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="font-black text-lg text-emerald-400 tracking-tight">{storeName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : savedSuccess ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Save className="w-4 h-4 text-white" />
          )}
          <span>{isSaving ? 'WIRD GESPEICHERT...' : savedSuccess ? 'BRANDING GESPEICHERT!' : 'BRANDING SPEICHERN & ÜBERALL AKTUALISIEREN'}</span>
        </button>
      </form>
    </div>
  );
}
