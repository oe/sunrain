/**
 * 关于页翻译内容索引文件
 */
import type { Language } from '../../i18n/config';
import type { IAboutTranslations } from './types';

// 导入所有语言的翻译
import aboutEn from './en';
import aboutZh from './zh';
import aboutEs from './es';
import aboutJa from './ja';
import aboutKo from './ko';
import aboutHi from './hi';
import aboutAr from './ar';

/**
 * 关于页翻译内容映射
 */
export const aboutTranslations = {
  en: aboutEn,
  zh: aboutZh,
  es: aboutEs,
  ja: aboutJa,
  ko: aboutKo,
  hi: aboutHi,
  ar: aboutAr,
} as const;

/**
 * 获取指定语言的关于页翻译内容
 */
export function getAboutTranslations(lang: Language): IAboutTranslations {
  return aboutTranslations[lang] || aboutTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IAboutTranslations } from './types';
export { aboutEn, aboutZh, aboutEs, aboutJa, aboutKo, aboutHi, aboutAr };
export default aboutTranslations;