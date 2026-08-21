'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { de } from '@/locales/de';
import { en } from '@/locales/en';
import { fr } from '@/locales/fr';
import { pt } from '@/locales/pt';
import { es } from '@/locales/es';

export type LanguageCode = 'de' | 'en' | 'fr' | 'pt' | 'es';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const translations: Record<LanguageCode, any> = {
  de,
  en,
  fr,
  pt,
  es,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('de');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('technova_language') as LanguageCode;
      if (saved && translations[saved]) {
        setLanguageState(saved);
      }
    } catch {
      // Default to 'de'
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('technova_language', lang);
      document.cookie = `technova_language=${lang}; path=/; max-age=31536000`;
    } catch {
      // Ignore
    }
  };

  const t = (keyPath: string): string => {
    const dict = translations[language] || translations['de'];
    const keys = keyPath.split('.');

    let current = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary if key missing in target language
        let fallback = translations['en'];
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }

    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
