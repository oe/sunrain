/**
 * 问卷数据验证工具
 * 验证问卷数据的完整性和正确性
 */

import fs from 'fs';
import path from 'path';
import type { Language } from '@/types/questionnaire';

export class QuestionnaireValidator {
  private dataPath: string;
  private supportedLanguages: Language[];

  constructor(dataPath: string, supportedLanguages: Language[]) {
    this.dataPath = dataPath;
    this.supportedLanguages = supportedLanguages;
  }

  /**
   * 验证所有问卷
   */
  async validateAllQuestionnaires(): Promise<{
    valid: string[];
    invalid: Array<{ id: string; errors: string[] }>;
    summary: {
      total: number;
      valid: number;
      invalid: number;
      errors: Record<string, number>;
    };
  }> {
    const valid: string[] = [];
    const invalid: Array<{ id: string; errors: string[] }> = [];
    const errorCounts: Record<string, number> = {};

    try {
      const indexPath = path.join(this.dataPath, 'index.json');
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

      for (const questionnaireId of index.questionnaires) {
        try {
          const errors = await this.validateQuestionnaire(questionnaireId);
          
          if (errors.length === 0) {
            valid.push(questionnaireId);
          } else {
            invalid.push({ id: questionnaireId, errors });
            
            // 统计错误类型
            for (const error of errors) {
              const errorType = error.split(':')[0];
              errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
            }
          }
        } catch (error) {
          invalid.push({ 
            id: questionnaireId, 
            errors: [`Load Error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
          });
          errorCounts['Load Error'] = (errorCounts['Load Error'] || 0) + 1;
        }
      }

      return {
        valid,
        invalid,
        summary: {
          total: index.questionnaires.length,
          valid: valid.length,
          invalid: invalid.length,
          errors: errorCounts
        }
      };
    } catch (error) {
      throw new Error(`Failed to validate questionnaires: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 验证单个问卷
   */
  async validateQuestionnaire(id: string): Promise<string[]> {
    const errors: string[] = [];

    try {
      // 验证问卷目录存在
      const questionnairePath = path.join(this.dataPath, id);
      if (!fs.existsSync(questionnairePath)) {
        errors.push(`Directory Error: Questionnaire directory not found: ${questionnairePath}`);
        return errors;
      }

      // 验证必需文件存在
      const requiredFiles = ['metadata.json', 'questions.json', 'scoring.json', 'interpretations.json'];
      for (const file of requiredFiles) {
        const filePath = path.join(questionnairePath, file);
        if (!fs.existsSync(filePath)) {
          errors.push(`File Error: Required file missing: ${file}`);
        }
      }

      // 验证元数据
      const metadataErrors = await this.validateMetadata(id);
      errors.push(...metadataErrors);

      // 验证问题
      const questionsErrors = await this.validateQuestions(id);
      errors.push(...questionsErrors);

      // 验证评分规则
      const scoringErrors = await this.validateScoring(id);
      errors.push(...scoringErrors);

      // 验证解释
      const interpretationsErrors = await this.validateInterpretations(id);
      errors.push(...interpretationsErrors);

      // 验证翻译
      const translationErrors = await this.validateTranslations(id);
      errors.push(...translationErrors);

    } catch (error) {
      errors.push(`Validation Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * 验证元数据
   */
  private async validateMetadata(id: string): Promise<string[]> {
    const errors: string[] = [];
    const metadataPath = path.join(this.dataPath, id, 'metadata.json');

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

      // 必需字段
      const requiredFields = ['id', 'titleKey', 'descriptionKey', 'categoryId', 'estimatedMinutes', 'questionCount'];
      for (const field of requiredFields) {
        if (!metadata[field]) {
          errors.push(`Metadata Error: Missing required field: ${field}`);
        }
      }

      // 验证ID匹配
      if (metadata.id !== id) {
        errors.push(`Metadata Error: ID mismatch: expected ${id}, got ${metadata.id}`);
      }

      // 验证数值字段
      if (metadata.estimatedMinutes && (typeof metadata.estimatedMinutes !== 'number' || metadata.estimatedMinutes <= 0)) {
        errors.push(`Metadata Error: Invalid estimatedMinutes: ${metadata.estimatedMinutes}`);
      }

      if (metadata.questionCount && (typeof metadata.questionCount !== 'number' || metadata.questionCount <= 0)) {
        errors.push(`Metadata Error: Invalid questionCount: ${metadata.questionCount}`);
      }

      // 验证版本号格式
      if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
        errors.push(`Metadata Error: Invalid version format: ${metadata.version}`);
      }

      // 验证日期格式
      if (metadata.createdAt && !this.isValidDate(metadata.createdAt)) {
        errors.push(`Metadata Error: Invalid createdAt date: ${metadata.createdAt}`);
      }

      if (metadata.updatedAt && !this.isValidDate(metadata.updatedAt)) {
        errors.push(`Metadata Error: Invalid updatedAt date: ${metadata.updatedAt}`);
      }

    } catch (error) {
      errors.push(`Metadata Error: Failed to parse metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * 验证问题
   */
  private async validateQuestions(id: string): Promise<string[]> {
    const errors: string[] = [];
    const questionsPath = path.join(this.dataPath, id, 'questions.json');

    try {
      const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
      const questions = questionsData.questions || [];

      if (!Array.isArray(questions)) {
        errors.push(`Questions Error: Questions must be an array`);
        return errors;
      }

      if (questions.length === 0) {
        errors.push(`Questions Error: No questions found`);
        return errors;
      }

      // 验证每个问题
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionPrefix = `Question ${i + 1}`;

        // 必需字段
        const requiredFields = ['id', 'text', 'type', 'required'];
        for (const field of requiredFields) {
          if (question[field] === undefined || question[field] === null) {
            errors.push(`${questionPrefix} Error: Missing required field: ${field}`);
          }
        }

        // 验证问题类型
        const validTypes = ['single_choice', 'multiple_choice', 'scale', 'text', 'rating', 'boolean'];
        if (question.type && !validTypes.includes(question.type)) {
          errors.push(`${questionPrefix} Error: Invalid question type: ${question.type}`);
        }

        // 验证选项（对于选择题）
        if (['single_choice', 'multiple_choice'].includes(question.type)) {
          if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
            errors.push(`${questionPrefix} Error: Options required for ${question.type} questions`);
          } else {
            // 验证选项
            for (let j = 0; j < question.options.length; j++) {
              const option = question.options[j];
              const optionPrefix = `${questionPrefix} Option ${j + 1}`;

              if (!option.id || !option.text || option.value === undefined) {
                errors.push(`${optionPrefix} Error: Missing required fields: id, text, or value`);
              }
            }
          }
        }

        // 验证量表（对于量表题）
        if (question.type === 'scale') {
          if (question.scaleMin === undefined || question.scaleMax === undefined) {
            errors.push(`${questionPrefix} Error: Scale min and max required for scale questions`);
          } else if (question.scaleMin >= question.scaleMax) {
            errors.push(`${questionPrefix} Error: Scale min must be less than max`);
          }
        }
      }

    } catch (error) {
      errors.push(`Questions Error: Failed to parse questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * 验证评分规则
   */
  private async validateScoring(id: string): Promise<string[]> {
    const errors: string[] = [];
    const scoringPath = path.join(this.dataPath, id, 'scoring.json');

    try {
      const scoringData = JSON.parse(fs.readFileSync(scoringPath, 'utf-8'));
      const scoringRules = scoringData.scoringRules || [];

      if (!Array.isArray(scoringRules)) {
        errors.push(`Scoring Error: Scoring rules must be an array`);
        return errors;
      }

      if (scoringRules.length === 0) {
        errors.push(`Scoring Error: No scoring rules found`);
        return errors;
      }

      // 验证每个评分规则
      for (let i = 0; i < scoringRules.length; i++) {
        const rule = scoringRules[i];
        const rulePrefix = `Scoring Rule ${i + 1}`;

        // 必需字段
        const requiredFields = ['id', 'name', 'description', 'calculation', 'questionIds', 'ranges'];
        for (const field of requiredFields) {
          if (!rule[field]) {
            errors.push(`${rulePrefix} Error: Missing required field: ${field}`);
          }
        }

        // 验证计算方法
        const validCalculations = ['sum', 'average', 'weighted_sum', 'custom'];
        if (rule.calculation && !validCalculations.includes(rule.calculation)) {
          errors.push(`${rulePrefix} Error: Invalid calculation method: ${rule.calculation}`);
        }

        // 验证问题ID数组
        if (rule.questionIds && !Array.isArray(rule.questionIds)) {
          errors.push(`${rulePrefix} Error: questionIds must be an array`);
        }

        // 验证分数范围
        if (rule.ranges && Array.isArray(rule.ranges)) {
          for (let j = 0; j < rule.ranges.length; j++) {
            const range = rule.ranges[j];
            const rangePrefix = `${rulePrefix} Range ${j + 1}`;

            if (range.min === undefined || range.max === undefined) {
              errors.push(`${rangePrefix} Error: Missing min or max value`);
            } else if (range.min > range.max) {
              errors.push(`${rangePrefix} Error: Min value must be less than or equal to max value`);
            }

            if (!range.label || !range.description) {
              errors.push(`${rangePrefix} Error: Missing label or description`);
            }
          }
        }
      }

    } catch (error) {
      errors.push(`Scoring Error: Failed to parse scoring rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * 验证解释
   */
  private async validateInterpretations(id: string): Promise<string[]> {
    const errors: string[] = [];
    const interpretationsPath = path.join(this.dataPath, id, 'interpretations.json');

    try {
      const interpretationsData = JSON.parse(fs.readFileSync(interpretationsPath, 'utf-8'));
      const interpretations = interpretationsData.interpretations || [];

      if (!Array.isArray(interpretations)) {
        errors.push(`Interpretations Error: Interpretations must be an array`);
        return errors;
      }

      if (interpretations.length === 0) {
        errors.push(`Interpretations Error: No interpretations found`);
        return errors;
      }

      // 验证每个解释
      for (let i = 0; i < interpretations.length; i++) {
        const interpretation = interpretations[i];
        const interpretationPrefix = `Interpretation ${i + 1}`;

        // 必需字段
        const requiredFields = ['scoreRange', 'levelKey', 'interpretationKey', 'recommendationsKey'];
        for (const field of requiredFields) {
          if (!interpretation[field]) {
            errors.push(`${interpretationPrefix} Error: Missing required field: ${field}`);
          }
        }

        // 验证分数范围
        if (interpretation.scoreRange) {
          if (interpretation.scoreRange.min === undefined || interpretation.scoreRange.max === undefined) {
            errors.push(`${interpretationPrefix} Error: Score range missing min or max`);
          } else if (interpretation.scoreRange.min > interpretation.scoreRange.max) {
            errors.push(`${interpretationPrefix} Error: Score range min must be less than or equal to max`);
          }
        }

        // 验证风险级别
        const validRiskLevels = ['low', 'medium', 'high', 'critical'];
        if (interpretation.riskLevel && !validRiskLevels.includes(interpretation.riskLevel)) {
          errors.push(`${interpretationPrefix} Error: Invalid risk level: ${interpretation.riskLevel}`);
        }
      }

    } catch (error) {
      errors.push(`Interpretations Error: Failed to parse interpretations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return errors;
  }

  /**
   * 验证翻译
   */
  private async validateTranslations(id: string): Promise<string[]> {
    const errors: string[] = [];
    const translationsPath = path.join(this.dataPath, id, 'translations');

    if (!fs.existsSync(translationsPath)) {
      errors.push(`Translations Error: Translations directory not found`);
      return errors;
    }

    const translationFiles = fs.readdirSync(translationsPath);
    const foundLanguages: Language[] = [];

    for (const file of translationFiles) {
      if (file.endsWith('.json')) {
        const language = file.replace('.json', '') as Language;
        foundLanguages.push(language);

        try {
          const translationPath = path.join(translationsPath, file);
          const translation = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));

          // 验证翻译结构
          const translationErrors = this.validateTranslationStructure(translation, language);
          errors.push(...translationErrors);

        } catch (error) {
          errors.push(`Translation Error: Failed to parse ${language} translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // 检查是否缺少默认语言
    if (!foundLanguages.includes('en')) {
      errors.push(`Translations Error: Default language (en) translation not found`);
    }

    // 检查是否有不支持的语言
    for (const language of foundLanguages) {
      if (!this.supportedLanguages.includes(language)) {
        errors.push(`Translations Error: Unsupported language: ${language}`);
      }
    }

    return errors;
  }

  /**
   * 验证翻译结构
   */
  private validateTranslationStructure(translation: any, language: Language): string[] {
    const errors: string[] = [];

    // 必需字段
    const requiredFields = ['title', 'description', 'instructions', 'disclaimer'];
    for (const field of requiredFields) {
      if (!translation[field]) {
        errors.push(`Translation Error (${language}): Missing required field: ${field}`);
      }
    }

    // 验证问题翻译
    if (translation.questions) {
      for (const [questionId, questionTranslation] of Object.entries(translation.questions)) {
        if (typeof questionTranslation === 'object' && questionTranslation !== null) {
          const q = questionTranslation as any;
          if (!q.text) {
            errors.push(`Translation Error (${language}): Question ${questionId} missing text`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * 验证日期格式
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
