'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useLocaleStore } from '@/stores/localeStore';
import { en, ko, es, fr, it, ja, zh, TranslationKeys } from './translations';
import { Locale } from './config';

// 번역 데이터 맵
const translations: Record<Locale, TranslationKeys> = {
  en,
  ko,
  es,
  fr,
  it,
  ja,
  zh,
};

// 중첩된 키로 값 가져오기
function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // 키를 찾지 못하면 경로 반환
    }
  }

  return typeof result === 'string' ? result : path;
}

// 플레이스홀더 치환
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? `{${key}}`;
  });
}

export function useTranslation() {
  const { locale, initLocale, setLocale } = useLocaleStore();

  // 컴포넌트 마운트 시 locale 초기화
  useEffect(() => {
    initLocale();
  }, [initLocale]);

  // 현재 locale의 번역 데이터
  const t = useMemo(() => translations[locale], [locale]);

  // 키 경로로 번역 가져오기 (예: 'common.appName')
  const translate = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const text = getNestedValue(t, path);
      return interpolate(text, params);
    },
    [t]
  );

  return {
    t,
    locale,
    setLocale,
    translate,
  };
}

// 서버 컴포넌트용 번역 가져오기 (기본 영어)
export function getTranslations(locale: Locale = 'en'): TranslationKeys {
  return translations[locale];
}
