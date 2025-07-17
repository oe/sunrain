/**
 * 指南页翻译内容索引文件
 */
import type { Language } from '../../i18n/config';
import type { IGuideTranslations } from './types';

// 导入所有语言的翻译
import guideEn from './en';
import guideZh from './zh';

/**
 * 指南页翻译内容映射
 */
export const guideTranslations = {
  en: guideEn,
  zh: guideZh,
} as const;

/**
 * 获取指定语言的指南页翻译内容
 */
export function getGuideTranslations(lang: Language): IGuideTranslations {
  return guideTranslations[lang] || guideTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IGuideTranslations } from './types';
export { guideEn, guideZh };
export default guideTranslations;