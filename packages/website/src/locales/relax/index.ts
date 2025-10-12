/**
 * Relax功能翻译模块
 * 导出所有语言的relax翻译内容
 */

import { relaxEn } from './en';
import { relaxZh } from './zh';
import type { IRelaxTranslations } from './types';
import type { Language } from '@sunrain/shared';

// 翻译映射
const relaxTranslations: Record<Language, IRelaxTranslations> = {
  en: relaxEn,
  zh: relaxZh,
  es: relaxEn, // 暂时使用英文
  ar: relaxEn, // 暂时使用英文
  hi: relaxEn, // 暂时使用英文
  ja: relaxEn, // 暂时使用英文
  ko: relaxEn, // 暂时使用英文
};

/**
 * 获取指定语言的relax翻译
 * @param lang 语言代码
 * @returns relax翻译对象
 */
export function getRelaxTranslations(lang: Language): IRelaxTranslations {
  return relaxTranslations[lang] || relaxTranslations.en;
}

export default relaxTranslations;
