// i18n 모듈 exports
export { useTranslation, getTranslations } from './useTranslation';
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  getSavedLocale,
  saveLocale,
  type Locale,
} from './config';
export { type TranslationKeys } from './translations';
