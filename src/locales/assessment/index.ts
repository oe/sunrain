/**
 * 评测系统翻译内容索引文件
 */
import type { Language } from "@/shared";
import type { IAssessmentTranslations } from "./types";

// 导入所有语言的翻译
import assessmentEn from "./en";
import assessmentZh from "./zh";
import assessmentEs from "./es";
import assessmentJa from "./ja";
import assessmentKo from "./ko";
import assessmentHi from "./hi";
import assessmentAr from "./ar";

/**
 * 评测系统翻译内容映射
 */
export const assessmentTranslations = {
  en: assessmentEn,
  zh: assessmentZh,
  es: assessmentEs,
  ja: assessmentJa,
  ko: assessmentKo,
  hi: assessmentHi,
  ar: assessmentAr,
} as const;

/**
 * 获取指定语言的评测系统翻译内容
 */
export function getAssessmentTranslations(
  lang: Language
): IAssessmentTranslations {
  return assessmentTranslations[lang] || assessmentTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IAssessmentTranslations } from "./types";
export { assessmentEn, assessmentZh, assessmentEs, assessmentJa, assessmentKo, assessmentHi, assessmentAr };
export default assessmentTranslations;
