// 지원 언어 목록
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'it', 'ja', 'zh', 'ko'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

// 언어 메타데이터
export const LOCALE_NAMES: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
};

// localStorage 키
export const LOCALE_STORAGE_KEY = 'holdamnit-locale';

// 브라우저 언어 감지
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return DEFAULT_LOCALE;
}

// 저장된 언어 불러오기
export function getSavedLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
    return saved as Locale;
  }
  return null;
}

// 언어 저장
export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
