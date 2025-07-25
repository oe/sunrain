/**
 * 指南页翻译内容索引文件
 */
import type { Language } from '@sunrain/shared';
import type { IGuideTranslations } from './types';

// 导入所有语言的翻译
import guideEn from './en';
import guideZh from './zh';
import guideEs from './es';
import guideJa from './ja';
import guideKo from './ko';
import guideHi from './hi';
import guideAr from './ar';

/**
 * 指南页翻译内容映射
 */
export const guideTranslations = {
  en: guideEn,
  zh: guideZh,
  es: guideEs,
  ja: guideJa,
  ko: guideKo,
  hi: guideHi,
  ar: guideAr,
} as const;

/**
 * 获取指定语言的指南页翻译内容
 */
export function getGuideTranslations(lang: Language): IGuideTranslations {
  return guideTranslations[lang] || guideTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IGuideTranslations } from './types';
export { guideEn, guideZh, guideEs, guideJa, guideKo, guideHi, guideAr };
export default guideTranslations;