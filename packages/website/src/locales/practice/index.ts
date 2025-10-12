/**
 * Practice功能翻译索引
 */
import type { IPracticeTranslations } from './types';
import { practiceEn } from './en';
import { practiceZh } from './zh';
import { practiceEs } from './es';
import { practiceAr } from './ar';
import { practiceHi } from './hi';
import { practiceJa } from './ja';
import { practiceKo } from './ko';

export const practiceTranslations: Record<string, IPracticeTranslations> = {
  en: practiceEn,
  zh: practiceZh,
  es: practiceEs,
  ar: practiceAr,
  hi: practiceHi,
  ja: practiceJa,
  ko: practiceKo,
};

export {
  type IPracticeTranslations,
  practiceEn,
  practiceZh,
  practiceEs,
  practiceAr,
  practiceHi,
  practiceJa,
  practiceKo,
};

// 获取指定语言的翻译
export function getPracticeTranslations(lang: string): IPracticeTranslations {
  return practiceTranslations[lang] || practiceTranslations.en;
}

export default practiceTranslations;
