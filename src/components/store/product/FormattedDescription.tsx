'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface FormattedDescriptionProps {
  description: string;
}

export function FormattedDescription({ description }: FormattedDescriptionProps) {
  if (!description) return null;

  // Clean raw HTML attributes & entities
  let cleanText = description
    .replace(/\s*data-\w+(?:-\w+)*="[^"]*"/g, '')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split text by sentences (after . ! ?)
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  let currentSentences: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).filter(Boolean).length;
    currentSentences.push(sentence);
    currentWordCount += wordCount;

    // Trigger paragraph break every 2 sentences or 40+ words
    if (currentSentences.length >= 2 || currentWordCount >= 40) {
      paragraphs.push(currentSentences.join(' '));
      currentSentences = [];
      currentWordCount = 0;
    }
  }

  if (currentSentences.length > 0) {
    paragraphs.push(currentSentences.join(' '));
  }

  if (paragraphs.length === 0) {
    paragraphs.push(cleanText);
  }

  return (
    <div className="space-y-4 my-2">
      {paragraphs.map((para, idx) => {
        const wordCount = para.split(/\s+/).filter(Boolean).length;

        return (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
              idx === 0
                ? 'bg-slate-50 dark:bg-slate-950/70 border-emerald-800/30 dark:border-emerald-500/30 shadow-2xs'
                : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 shadow-2xs'
            }`}
          >
            {idx === 0 && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-3">
                <Award className="w-3.5 h-3.5" />
                <span>ÜBERSICHT & DETAILBESCHREIBUNGEN</span>
              </div>
            )}

            <p className="text-xs sm:text-sm leading-[1.8] font-medium text-slate-700 dark:text-slate-200">
              {para}
            </p>

            <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="uppercase tracking-wider">
                Abschnitt {idx + 1}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                {wordCount} Wörter
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
