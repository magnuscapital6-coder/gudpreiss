'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { DEFAULT_STORE_SETTINGS } from '@/lib/db/initial-data';
import { getStoreSettings, updateStoreSettings as updateDBSettings } from '@/lib/db/db-provider';

interface StoreSettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  isLoading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: DEFAULT_STORE_SETTINGS,
  updateSettings: async () => {},
  isLoading: true,
});

export const SETTINGS_STORAGE_KEY = 'gudpreiss_store_settings';
export const SETTINGS_UPDATED_EVENT = 'store-settings-changed';

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initSettings() {
      // 1. Check client localStorage
      let local: Partial<StoreSettings> = {};
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) local = JSON.parse(saved);
      } catch {}

      // 2. Fetch server/db settings
      try {
        const dbSettings = await getStoreSettings();
        const merged = { ...DEFAULT_STORE_SETTINGS, ...dbSettings, ...local };
        setSettings(merged);
      } catch {
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...local });
      } finally {
        setIsLoading(false);
      }
    }

    initSettings();

    // Listen for custom settings updated events across components/tabs
    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        setSettings((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener(SETTINGS_UPDATED_EVENT, handleCustomEvent);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleCustomEvent);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    // Save to localStorage for instant client persistence
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Dispatch global event for instant re-render across all open components
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: newSettings })
    );

    // Persist in DB
    try {
      await updateDBSettings(newSettings);
    } catch (err) {
      console.error('Error updating DB store settings:', err);
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
