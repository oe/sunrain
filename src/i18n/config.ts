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

export type Language = keyof typeof languages;
