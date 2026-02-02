'use client';

import { useState } from 'react';
import { useTranslation, SUPPORTED_LOCALES, LOCALE_NAMES, Locale } from '@/lib/i18n';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from './Dialog';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { t, locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const currentLocale = LOCALE_NAMES[locale];

  return (
    <>
      {/* 언어 선택 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
          'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50',
          'text-sm text-slate-300 hover:text-white',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          className
        )}
        aria-label="Select language"
      >
        <span className="text-base">{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.nativeName}</span>
      </button>

      {/* 언어 선택 다이얼로그 */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-center">{t.settings.language}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="grid grid-cols-1 gap-2">
            {SUPPORTED_LOCALES.map((loc) => {
              const localeInfo = LOCALE_NAMES[loc];
              const isSelected = loc === locale;

              return (
                <button
                  key={loc}
                  onClick={() => handleSelect(loc)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-xl',
                    'text-left transition-all duration-150',
                    isSelected
                      ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#0066ff]/20 border-2 border-[#00d4ff]'
                      : 'bg-[#1a1f35]/50 border-2 border-transparent hover:bg-[#252b45] hover:border-white/10'
                  )}
                >
                  <span className="text-2xl">{localeInfo.flag}</span>
                  <div className="flex-1">
                    <div className={cn(
                      'font-semibold',
                      isSelected ? 'text-[#00d4ff]' : 'text-white'
                    )}>
                      {localeInfo.nativeName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {localeInfo.name}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#00d4ff] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
