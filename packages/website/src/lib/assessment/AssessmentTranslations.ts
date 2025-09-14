/**
 * Assessment Translation Helper
 * 处理assessment数据的多语言翻译
 */

import type { Language } from '@sunrain/shared';
import type { AssessmentType } from '@/types/assessment';

/**
 * 获取assessment的本地化名称
 */
export function getLocalizedAssessmentName(assessment: AssessmentType, language: Language): string {
  // 如果assessment有翻译数据，使用翻译
  if (assessment.translations && assessment.translations[language]) {
    return assessment.translations[language].name || assessment.name;
  }
  
  // 否则返回默认名称
  return assessment.name;
}

/**
 * 获取assessment的本地化描述
 */
export function getLocalizedAssessmentDescription(assessment: AssessmentType, language: Language): string {
  // 如果assessment有翻译数据，使用翻译
  if (assessment.translations && assessment.translations[language]) {
    return assessment.translations[language].description || assessment.description;
  }
  
  // 否则返回默认描述
  return assessment.description;
}

/**
 * 获取本地化的assessment数据
 */
export function getLocalizedAssessment(assessment: AssessmentType, language: Language): AssessmentType {
  return {
    ...assessment,
    name: getLocalizedAssessmentName(assessment, language),
    description: getLocalizedAssessmentDescription(assessment, language),
  };
}

/**
 * 获取所有本地化的assessment列表
 */
export function getLocalizedAssessments(assessments: AssessmentType[], language: Language): AssessmentType[] {
  return assessments.map(assessment => getLocalizedAssessment(assessment, language));
}
