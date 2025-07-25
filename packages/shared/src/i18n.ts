/**
 * Supported languages configuration
 */
export const languages = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ar: 'العربية'
} as const;

export const defaultLang = 'en';
export const supportedLangs = Object.keys(languages) as Array<keyof typeof languages>;

/**
 * Language type
 */
export type Language = keyof typeof languages;

/**
 * Page type enumeration
 */
export type PageType = 'home' | 'guide' | 'resources' | 'about';

/**
 * Get relative localized URL
 * @param locale Language code
 * @param path Path
 * @returns Localized URL
 */
export function getRelativeLocaleUrl(locale: Language, path: string = ''): string {
  if (locale === defaultLang) {
    return path || '/';
  }
  return `/${locale}${path}`;
}

/**
 * Get static paths for supported languages
 * @returns Array of path objects
 */
export function getStaticPaths() {
  return supportedLangs.map((lang) => ({
    params: { lang }
  }));
}