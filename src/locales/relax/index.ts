/**
 * Relax功能翻译模块
 * 导出所有语言的relax翻译内容
 */

import { relaxEn } from './en';
import { relaxZh } from './zh';
import { relaxEs } from './es';
import { relaxAr } from './ar';
import { relaxHi } from './hi';
import { relaxJa } from './ja';
import { relaxKo } from './ko';
import type { IRelaxTranslations } from './types';
import type { Language } from '@/shared';

// 翻译映射
const relaxTranslations: Record<Language, IRelaxTranslations> = {
  en: relaxEn,
  zh: relaxZh,
  es: relaxEs,
  ar: relaxAr,
  hi: relaxHi,
  ja: relaxJa,
  ko: relaxKo,
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
