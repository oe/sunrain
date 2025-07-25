/**
 * 共享翻译内容索引文件
 */
import type { Language } from '@sunrain/shared';
import type { ISharedTranslations } from './types';

// 导入所有语言的翻译
import sharedEn from './en';
import sharedZh from './zh';
import sharedEs from './es';
import sharedJa from './ja';
import sharedKo from './ko';
import sharedHi from './hi';
import sharedAr from './ar';

/**
 * 共享翻译内容映射
 */
export const sharedTranslations = {
  en: sharedEn,
  zh: sharedZh,
  es: sharedEs,
  ja: sharedJa,
  ko: sharedKo,
  hi: sharedHi,
  ar: sharedAr,
} as const;

/**
 * 获取指定语言的共享翻译内容
 */
export function getSharedTranslations(lang: Language): ISharedTranslations {
  return sharedTranslations[lang] || sharedTranslations.en;
}

// 导出类型和所有语言的翻译
export type { ISharedTranslations } from './types';
export { sharedEn, sharedZh, sharedEs, sharedJa, sharedKo, sharedHi, sharedAr };
export default sharedTranslations;