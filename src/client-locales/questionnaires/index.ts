/**
 * 问卷翻译模块导出
 *
 * 此文件导出问卷专用的翻译管理器和类型定义
 */

export { QuestionnaireTranslationManager, questionnaireTranslationManager } from './QuestionnaireTranslationManager';
export { QuestionnaireTranslationValidator, questionnaireValidator } from './validation';
export type {
  QuestionnaireTranslations,
  QuestionnaireTranslationKey,
  SupportedLocale
} from './types';
export type { ValidationResult } from './validation';
