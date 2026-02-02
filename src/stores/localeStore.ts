'use client';

import { create } from 'zustand';
import {
  Locale,
  DEFAULT_LOCALE,
  getSavedLocale,
  saveLocale,
  detectBrowserLocale,
} from '@/lib/i18n/config';

interface LocaleStore {
  locale: Locale;
  isInitialized: boolean;
  setLocale: (locale: Locale) => void;
  initLocale: () => void;
}

export const useLocaleStore = create<LocaleStore>((set, get) => ({
  locale: DEFAULT_LOCALE,
  isInitialized: false,

  setLocale: (locale: Locale) => {
    saveLocale(locale);
    set({ locale });
  },

  initLocale: () => {
    if (get().isInitialized) return;

    // 1. 저장된 언어 확인
    const savedLocale = getSavedLocale();
    if (savedLocale) {
      set({ locale: savedLocale, isInitialized: true });
      return;
    }

    // 2. 브라우저 언어 감지
    const browserLocale = detectBrowserLocale();
    set({ locale: browserLocale, isInitialized: true });
  },
}));
