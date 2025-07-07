import { ui } from './ui';
import { defaultLang, type Language } from './config';

export function useTranslations(lang: Language) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function getRelativeLocaleUrl(locale: Language, path: string = ''): string {
  if (locale === defaultLang) {
    return path || '/';
  }
  return `/${locale}${path}`;
}

export function getStaticPaths() {
  return Object.keys(ui).map((lang) => ({
    params: { lang }
  }));
}
