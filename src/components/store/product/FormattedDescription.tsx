'use client';

import React from 'react';

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
    <div className="space-y-3 my-2">
      {paragraphs.map((para, idx) => {
        return (
          <p
            key={idx}
            className="text-xs sm:text-sm leading-[1.8] font-medium text-slate-700 dark:text-slate-200"
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}
