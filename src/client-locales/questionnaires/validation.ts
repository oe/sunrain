/**
 * 问卷翻译验证工具
 *
 * 用于验证翻译内容的完整性和一致性
 */

import type { QuestionnaireTranslations, SupportedLocale } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class QuestionnaireTranslationValidator {
  /**
   * 验证翻译内容的完整性
   */
  validateTranslations(
    questionnaireId: string,
    translations: QuestionnaireTranslations,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证必需字段
    this.validateRequiredFields(translations, errors);

    // 验证问题结构
    this.validateQuestions(translations.questions, errors, warnings);

    // 验证解读结构
    this.validateInterpretations(translations.interpretations, errors, warnings);

    // 验证翻译键命名规范
    this.validateNamingConventions(questionnaireId, translations, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 比较两个语言版本的结构一致性
   */
  compareTranslationStructure(
    baseTranslations: QuestionnaireTranslations,
    targetTranslations: QuestionnaireTranslations,
    targetLocale: SupportedLocale
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 比较问题数量
    const baseQuestions = Object.keys(baseTranslations.questions);
    const targetQuestions = Object.keys(targetTranslations.questions);

    if (baseQuestions.length !== targetQuestions.length) {
      errors.push(`Question count mismatch: base has ${baseQuestions.length}, ${targetLocale} has ${targetQuestions.length}`);
    }

    // 检查缺失的问题
    for (const questionId of baseQuestions) {
      if (!targetTranslations.questions[questionId]) {
        errors.push(`Missing question in ${targetLocale}: ${questionId}`);
      }
    }

    // 检查多余的问题
    for (const questionId of targetQuestions) {
      if (!baseTranslations.questions[questionId]) {
        warnings.push(`Extra question in ${targetLocale}: ${questionId}`);
      }
    }

    // 比较解读范围
    const baseInterpretations = Object.keys(baseTranslations.interpretations);

    for (const range of baseInterpretations) {
      if (!targetTranslations.interpretations[range]) {
        errors.push(`Missing interpretation range in ${targetLocale}: ${range}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateRequiredFields(translations: QuestionnaireTranslations, errors: string[]) {
    const requiredFields = ['title', 'description', 'introduction', 'purpose'];

    for (const field of requiredFields) {
      if (!translations[field as keyof QuestionnaireTranslations] ||
          typeof translations[field as keyof QuestionnaireTranslations] !== 'string') {
        errors.push(`Missing or invalid required field: ${field}`);
      }
    }

    if (!translations.questions || typeof translations.questions !== 'object') {
      errors.push('Missing or invalid questions object');
    }

    if (!translations.interpretations || typeof translations.interpretations !== 'object') {
      errors.push('Missing or invalid interpretations object');
    }

    if (!translations.category || typeof translations.category !== 'object') {
      errors.push('Missing or invalid category object');
    }
  }

  private validateQuestions(questions: any, errors: string[], warnings: string[]) {
    if (!questions) return;

    for (const [questionId, question] of Object.entries(questions)) {
      if (!question || typeof question !== 'object') {
        errors.push(`Invalid question object: ${questionId}`);
        continue;
      }

      const q = question as any;

      if (!q.text || typeof q.text !== 'string') {
        errors.push(`Missing or invalid text for question: ${questionId}`);
      }

      if (q.options && !Array.isArray(q.options)) {
        errors.push(`Invalid options array for question: ${questionId}`);
      }

      // 验证问题ID命名规范
      if (!/^q\d+$/.test(questionId)) {
        warnings.push(`Question ID should follow pattern 'q{number}': ${questionId}`);
      }
    }
  }

  private validateInterpretations(interpretations: any, errors: string[], warnings: string[]) {
    if (!interpretations) return;

    for (const [range, interpretation] of Object.entries(interpretations)) {
      if (!interpretation || typeof interpretation !== 'object') {
        errors.push(`Invalid interpretation object: ${range}`);
        continue;
      }

      const interp = interpretation as any;

      const requiredFields = ['level', 'interpretation', 'recommendations'];
      for (const field of requiredFields) {
        if (!interp[field] || typeof interp[field] !== 'string') {
          errors.push(`Missing or invalid ${field} for interpretation: ${range}`);
        }
      }

      // 验证分数范围格式
      if (!/^\d+-\d+$/.test(range)) {
        warnings.push(`Score range should follow pattern 'min-max': ${range}`);
      }
    }
  }

  private validateNamingConventions(
    questionnaireId: string,
    translations: QuestionnaireTranslations,
    warnings: string[]
  ) {
    // 验证问卷ID命名规范（kebab-case）
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(questionnaireId)) {
      warnings.push(`Questionnaire ID should use kebab-case: ${questionnaireId}`);
    }

    // 验证分类名称
    if (translations.category?.name && translations.category.name.length > 50) {
      warnings.push('Category name should be concise (under 50 characters)');
    }
  }
}

// 导出单例实例
export const questionnaireValidator = new QuestionnaireTranslationValidator();
