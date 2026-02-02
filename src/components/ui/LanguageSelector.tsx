'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation, SUPPORTED_LOCALES, LOCALE_NAMES, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const currentLocale = LOCALE_NAMES[locale];

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* 현재 언어 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
          'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50',
          'text-sm text-slate-300 hover:text-white',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50'
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base">{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.nativeName}</span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 py-1 z-50',
            'bg-slate-800 border border-slate-700 rounded-lg shadow-xl',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
          role="listbox"
          aria-label="Language options"
        >
          {SUPPORTED_LOCALES.map((loc) => {
            const localeInfo = LOCALE_NAMES[loc];
            const isSelected = loc === locale;

            return (
              <button
                key={loc}
                onClick={() => handleSelect(loc)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5',
                  'text-left text-sm transition-colors duration-150',
                  isSelected
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <span className="text-lg">{localeInfo.flag}</span>
                <span className="flex-1">{localeInfo.nativeName}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
