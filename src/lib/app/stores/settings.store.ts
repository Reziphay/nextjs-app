'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLanguage = 'az' | 'en' | 'ru' | 'tr';

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  az: 'Azərbaycan',
  en: 'English',
  ru: 'Русский',
  tr: 'Türkçe',
};

type SettingsState = {
  themeMode: ThemeMode;
  language: AppLanguage;
  reminderEnabled: boolean;
  reminderMinutes: number;

  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: AppLanguage) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderMinutes: (minutes: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      language: 'az',
      reminderEnabled: true,
      reminderMinutes: 30,

      setThemeMode: (themeMode) => set({ themeMode }),
      setLanguage: (language) => set({ language }),
      setReminderEnabled: (reminderEnabled) => set({ reminderEnabled }),
      setReminderMinutes: (reminderMinutes) => set({ reminderMinutes }),
    }),
    {
      name: 'rzp_settings',
      partialize: (s) => ({
        themeMode: s.themeMode,
        language: s.language,
        reminderEnabled: s.reminderEnabled,
        reminderMinutes: s.reminderMinutes,
      }),
    },
  ),
);
