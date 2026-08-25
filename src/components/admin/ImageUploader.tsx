'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  label?: string;
  showPrimaryBadge?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxFiles,
  label = 'Bild',
  showPrimaryBadge = true,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
  };

  const processFiles = (files: File[]) => {
    const newImages: string[] = [];
    let processedCount = 0;

    const filesToProcess = maxFiles === 1 ? [files[0]] : files;

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        processedCount++;
        if (processedCount === filesToProcess.length) {
          if (maxFiles === 1) {
            onChange(newImages);
          } else {
            onChange([...images, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const cleanUrl = urlInput.trim();
    if (maxFiles === 1) {
      onChange([cleanUrl]);
    } else {
      onChange([...images, cleanUrl]);
    }
    setUrlInput('');
    setShowUrlField(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/x-icon"
          multiple={maxFiles !== 1}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
          <Upload className="w-5 h-5" />
        </div>

        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">
          Klicken zum Hochladen oder Datei hierher ziehen
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Formats: PNG, JPG, WEBP, SVG, GIF, ICO
        </p>
      </div>

      {/* Alternative URL Input Toggle */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlField ? 'Abbrechen' : 'Bild über URL einfügen'}</span>
        </button>
      </div>

      {showUrlField && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shrink-0"
          >
            Hinzufügen
          </button>
        </form>
      )}

      {/* Image Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-24 p-2 flex items-center justify-center shadow-sm"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {img.startsWith('data:image') || img.startsWith('http') || img.startsWith('/') ? (
                  <Image
                    src={img}
                    alt={`${label} ${idx + 1}`}
                    fill
                    className="object-contain"
                    unoptimized={img.startsWith('data:')}
                  />
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 truncate">{img}</span>
                )}
              </div>

              {showPrimaryBadge && idx === 0 && maxFiles !== 1 && (
                <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Hauptbild
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-90 group-hover:opacity-100 transition shadow-md cursor-pointer"
                title="Löschen"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
