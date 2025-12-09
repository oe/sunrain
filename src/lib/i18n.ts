/**
 * Simple i18n utilities
 * Unified translation system for the entire app
 */

export const SUPPORTED_LANGUAGES = ['en', 'zh-hans', 'zh-hant', 'es', 'ja', 'ko', 'hi', 'ar'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  'zh-hans': '简体中文',
  'zh-hant': '繁體中文',
  es: 'Español',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ar: 'العربية',
};

// Import all translation files
import en from '@/i18n/en.json';
import zhHans from '@/i18n/zh-hans.json';
import zhHant from '@/i18n/zh-hant.json';
import es from '@/i18n/es.json';
import ja from '@/i18n/ja.json';
import ko from '@/i18n/ko.json';
import hi from '@/i18n/hi.json';
import ar from '@/i18n/ar.json';

const translations: Record<Language, typeof en> = { 
  en, 
  'zh-hans': zhHans, 
  'zh-hant': zhHant, 
  es, 
  ja, 
  ko, 
  hi, 
  ar 
};

/**
 * Get translation value by dot-notation key
 * Supports placeholder replacement with params: t('key', lang, { year: 2025 })
 */
export function t(
  key: string, 
  lang: Language = DEFAULT_LANGUAGE, 
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: any = translations[lang] || translations[DEFAULT_LANGUAGE];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations[DEFAULT_LANGUAGE];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }
  
  let result = typeof value === 'string' ? value : key;
  
  // Replace placeholders like {year} with actual values
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }
  
  return result;
}

/**
 * Create a translation function for a specific language
 */
export function createTranslator(lang: Language) {
  return (key: string, params?: Record<string, string | number>) => t(key, lang, params);
}

/**
 * Get language from URL path
 */
export function getLanguageFromPath(pathname: string): Language {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Check for zh-hans/zh-hant first (hyphenated locales)
  if (firstSegment === 'zh-hans' || firstSegment === 'zh-hant') {
    return firstSegment as Language;
  }
  
  if (firstSegment && SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language;
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Get localized URL path
 */
export function getLocalizedPath(pathname: string, lang: Language): string {
  // Remove existing language prefix (handles both simple and compound locales)
  const cleanPath = pathname.replace(/^\/[a-z]{2}(-[a-z]+)?(?=\/|$)/, '') || '/';
  
  if (lang === DEFAULT_LANGUAGE) {
    return cleanPath;
  }
  
  return `/${lang}${cleanPath}`;
}

/**
 * Check if language is RTL
 */
export function isRTL(lang: Language): boolean {
  return lang === 'ar';
}

