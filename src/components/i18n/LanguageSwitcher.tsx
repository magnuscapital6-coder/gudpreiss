'use client';

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation, LANGUAGES, LanguageCode } from '@/context/language-context';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Sprache auswählen (${currentLang.code})`}
        className="flex items-center gap-1.5 hover:text-text-primary transition font-semibold text-[11px]"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="uppercase">{currentLang.code}</span>
        <ChevronDown className="w-3 h-3 text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white border border-border-soft rounded-md shadow-card p-1 z-50 animate-in fade-in duration-150">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-md transition ${
                language === lang.code
                  ? 'bg-primary-50 text-primary-600 font-bold'
                  : 'hover:bg-surface-soft text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-primary-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
