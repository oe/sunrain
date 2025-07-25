/**
 * 首页翻译内容索引文件
 */
import type { Language } from '@sunrain/shared';
import type { IHomeTranslations } from './types';

// 导入所有语言的翻译
import homeEn from './en';
import homeZh from './zh';
import homeEs from './es';
import homeJa from './ja';
import homeKo from './ko';
import homeHi from './hi';
import homeAr from './ar';

/**
 * 首页翻译内容映射
 */
export const homeTranslations = {
  en: homeEn,
  zh: homeZh,
  es: homeEs,
  ja: homeJa,
  ko: homeKo,
  hi: homeHi,
  ar: homeAr,
} as const;

/**
 * 获取指定语言的首页翻译内容
 */
export function getHomeTranslations(lang: Language): IHomeTranslations {
  return homeTranslations[lang] || homeTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IHomeTranslations } from './types';
export { homeEn, homeZh, homeEs, homeJa, homeKo, homeHi, homeAr };
export default homeTranslations;