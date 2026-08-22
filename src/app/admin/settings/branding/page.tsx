'use client';

import React, { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '@/lib/db/db-provider';
import { StoreSettings } from '@/types';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Sparkles, Save, RotateCcw, Image as ImageIcon, ShieldCheck, Check, Globe } from 'lucide-react';
import Image from 'next/image';

export default function BrandingSettingsPage() {
  const [Einstellungen, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [storeName, setStoreName] = useState('GudPreiss');
  const [logoUrl, setLogoUrl] = useState<string[]>([]);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string[]>([]);
  const [logoMobileUrl, setLogoMobileUrl] = useState<string[]>([]);
  const [faviconUrl, setFaviconUrl] = useState<string[]>([]);
  const [appleTouchIconUrl, setAppleTouchIconUrl] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#065f46');
  const [secondaryColor, setSecondaryColor] = useState('#0284c7');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const s = await getStoreSettings();
        setSettings(s);
        setStoreName(s.store_name || 'GudPreiss');
        if (s.logo_url) setLogoUrl([s.logo_url]);
        if (s.logo_dark_url) setLogoDarkUrl([s.logo_dark_url]);
        if (s.logo_mobile_url) setLogoMobileUrl([s.logo_mobile_url]);
        if (s.favicon_url) setFaviconUrl([s.favicon_url]);
        if (s.apple_touch_icon_url) setAppleTouchIconUrl([s.apple_touch_icon_url]);
        if (s.primary_color) setPrimaryColor(s.primary_color);
        if (s.secondary_color) setSecondaryColor(s.secondary_color);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateStoreSettings({
        store_name: storeName,
        logo_url: logoUrl[0] || '/logo.png',
        logo_dark_url: logoDarkUrl[0] || logoUrl[0] || '/logo-dark.png',
        logo_mobile_url: logoMobileUrl[0] || logoUrl[0] || '/logo-mobile.png',
        favicon_url: faviconUrl[0] || '/favicon.ico',
        apple_touch_icon_url: appleTouchIconUrl[0] || faviconUrl[0] || '/apple-touch-icon.png',
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Fehler beim Speichern der Branding-settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Möchten Sie das Erscheinungsbild auf die Standardwerte zurücksetzen?')) return;

    setStoreName('GudPreiss');
    setLogoUrl(['/logo.png']);
    setLogoDarkUrl(['/logo-dark.png']);
    setLogoMobileUrl(['/logo-mobile.png']);
    setFaviconUrl(['/favicon.ico']);
    setAppleTouchIconUrl(['/apple-touch-icon.png']);
    setPrimaryColor('#065f46');
    setSecondaryColor('#0284c7');

    await updateStoreSettings({
      store_name: 'GudPreiss',
      logo_url: '/logo.png',
      logo_dark_url: '/logo-dark.png',
      logo_mobile_url: '/logo-mobile.png',
      favicon_url: '/favicon.ico',
      apple_touch_icon_url: '/apple-touch-icon.png',
      primary_color: '#065f46',
      secondary_color: '#0284c7',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-bold">
        Branding-Einstellungen werden geladen...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>VISUELLE IDENTITÄT &amp; BRANDING</span>
          </div>
          <h1 className="text-2xl font-black text-white">Erscheinungsbild / Branding</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verwalten Sie Logos, Favicons, Farbschemata und Metadaten ohne Neustart der Anwendung.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Zurücksetzen</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg">
          <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Erscheinungsbild erfolgreich gespeichert! Die Änderungen wurden auf allen Seiten revalidiert.</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Plattform General Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            1. Plattform Name &amp; Farben
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Plattform Name *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Hauptfarbe (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Zweitfarbe (Secondary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop & Mobile Logos */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            2. Logos (Light, Dark &amp; Mobile)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Logo Helles Thema (Light Mode)
              </label>
              <ImageUploader images={logoUrl} onChange={setLogoUrl} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Logo Dunkles Thema (Dark Mode)
              </label>
              <ImageUploader images={logoDarkUrl} onChange={setLogoDarkUrl} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Logo Mobile Header
              </label>
              <ImageUploader images={logoMobileUrl} onChange={setLogoMobileUrl} />
            </div>
          </div>
        </div>

        {/* Favicon & Apple Touch Icon */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            3. Favicon &amp; App Icons
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Favicon Browser-Tab (.ico / .png / .svg)
              </label>
              <ImageUploader images={faviconUrl} onChange={setFaviconUrl} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                Apple Touch Icon (iOS App Home Screen)
              </label>
              <ImageUploader images={appleTouchIconUrl} onChange={setAppleTouchIconUrl} />
            </div>
          </div>
        </div>

        {/* Live Preview Cards */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Echtzeit-Vorschau der Plattform-Header
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Light Mode Preview */}
            <div className="bg-white text-slate-900 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Header Light Mode</span>
              <div className="flex items-center gap-2">
                {logoUrl[0] ? (
                  <Image src={logoUrl[0]} alt="Light Logo" width={140} height={28} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="font-black text-lg text-emerald-800 tracking-tight">{storeName}</span>
                )}
              </div>
            </div>

            {/* Dark Mode Preview */}
            <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">Header Dark Mode</span>
              <div className="flex items-center gap-2">
                {logoDarkUrl[0] || logoUrl[0] ? (
                  <Image src={logoDarkUrl[0] || logoUrl[0]} alt="Dark Logo" width={140} height={28} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="font-black text-lg text-emerald-700 dark:text-emerald-400 tracking-tight">{storeName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>BRANDING SPEICHERN &amp; ÜBERALL AKTUALISIEREN</span>
        </button>
      </form>
    </div>
  );
}
