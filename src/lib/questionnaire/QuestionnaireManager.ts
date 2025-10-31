/**
 * 问卷管理器
 * 提供问卷数据的高级操作和业务逻辑
 */

import type {
  Questionnaire,
  QuestionnaireTranslation,
  QuestionnaireCategory,
  Language,
  QuestionnaireSearchResult,
  QuestionnaireFilter
} from '@/types/questionnaire';
import type { IQuestionnaireLoader } from './IQuestionnaireLoader';

export class QuestionnaireManager {
  private loader: IQuestionnaireLoader;
  private questionnaires: Map<string, Questionnaire> = new Map();
  private translations: Map<string, Map<Language, QuestionnaireTranslation>> = new Map();

  constructor(loader: IQuestionnaireLoader) {
    this.loader = loader;
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    const questionnaires = await this.loader.loadAllQuestionnaires();
    
    for (const questionnaire of questionnaires) {
      this.questionnaires.set(questionnaire.metadata.id, questionnaire);
    }
  }

  /**
   * 获取所有问卷
   */
  getQuestionnaires(): Questionnaire[] {
    return Array.from(this.questionnaires.values());
  }

  /**
   * 根据ID获取问卷
   */
  getQuestionnaire(id: string): Questionnaire | undefined {
    return this.questionnaires.get(id);
  }

  /**
   * 获取问卷翻译
   */
  async getQuestionnaireTranslation(id: string, language: Language): Promise<QuestionnaireTranslation | undefined> {
    // 检查内存缓存
    const questionnaireTranslations = this.translations.get(id);
    if (questionnaireTranslations?.has(language)) {
      return questionnaireTranslations.get(language);
    }

    try {
      // 从文件系统加载
      const translation = await this.loader.loadQuestionnaireTranslation(id, language);
      
      // 缓存到内存
      if (!questionnaireTranslations) {
        this.translations.set(id, new Map());
      }
      this.translations.get(id)!.set(language, translation);
      
      return translation;
    } catch (error) {
      console.warn(`Failed to load translation for questionnaire ${id} in language ${language}:`, error);
      return undefined;
    }
  }

  /**
   * 获取本地化的问卷
   */
  async getLocalizedQuestionnaire(id: string, language: Language): Promise<Questionnaire | undefined> {
    const questionnaire = this.getQuestionnaire(id);
    if (!questionnaire) {
      return undefined;
    }

    const translation = await this.getQuestionnaireTranslation(id, language);
    if (!translation) {
      return questionnaire; // 返回原始问卷
    }

    // 创建本地化的问卷副本
    return this.createLocalizedQuestionnaire(questionnaire, translation);
  }

  /**
   * 获取所有本地化的问卷
   */
  async getAllLocalizedQuestionnaires(language: Language): Promise<Questionnaire[]> {
    // 确保管理器已初始化
    if (this.questionnaires.size === 0) {
      console.log('🔍 QuestionnaireManager: No questionnaires loaded, initializing...');
      await this.initialize();
    }
    
    const questionnaires = this.getQuestionnaires();
    console.log('🔍 QuestionnaireManager: Found questionnaires:', questionnaires.length);
    
    const localizedQuestionnaires: Questionnaire[] = [];

    for (const questionnaire of questionnaires) {
      const localized = await this.getLocalizedQuestionnaire(questionnaire.metadata.id, language);
      if (localized) {
        localizedQuestionnaires.push(localized);
      }
    }

    return localizedQuestionnaires;
  }

  /**
   * 根据类别获取问卷
   */
  getQuestionnairesByCategory(categoryId: string): Questionnaire[] {
    return this.getQuestionnaires().filter(
      q => q.metadata.categoryId === categoryId && q.metadata.isActive
    );
  }

  /**
   * 获取特色问卷
   */
  getFeaturedQuestionnaires(): Questionnaire[] {
    return this.getQuestionnaires().filter(q => q.metadata.isFeatured && q.metadata.isActive);
  }

  /**
   * 搜索问卷
   */
  async searchQuestionnaires(query: string, filter?: QuestionnaireFilter): Promise<QuestionnaireSearchResult[]> {
    return this.loader.searchQuestionnaires(query, filter);
  }

  /**
   * 获取问卷类别
   */
  async getCategories(): Promise<QuestionnaireCategory[]> {
    return this.loader.loadCategories();
  }

  /**
   * 获取问卷统计信息
   */
  getQuestionnaireStats(): {
    total: number;
    active: number;
    featured: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
  } {
    const questionnaires = this.getQuestionnaires();
    const stats = {
      total: questionnaires.length,
      active: 0,
      featured: 0,
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>
    };

    for (const questionnaire of questionnaires) {
      if (questionnaire.metadata.isActive) {
        stats.active++;
      }

      if (questionnaire.metadata.isFeatured) {
        stats.featured++;
      }

      // 按类别统计
      const categoryId = questionnaire.metadata.categoryId;
      stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1;

      // 按难度统计
      const difficulty = questionnaire.metadata.difficulty;
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
    }

    return stats;
  }

  /**
   * 验证问卷数据
   */
  validateQuestionnaire(questionnaire: Questionnaire): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证元数据
    if (!questionnaire.metadata.id) {
      errors.push('Questionnaire ID is required');
    }

    if (!questionnaire.metadata.titleKey) {
      errors.push('Questionnaire title key is required');
    }

    if (!questionnaire.metadata.descriptionKey) {
      errors.push('Questionnaire description key is required');
    }

    if (questionnaire.metadata.estimatedMinutes <= 0) {
      errors.push('Estimated minutes must be greater than 0');
    }

    if (questionnaire.metadata.questionCount !== questionnaire.questions.length) {
      errors.push('Question count does not match actual questions');
    }

    // 验证问题
    for (let i = 0; i < questionnaire.questions.length; i++) {
      const question = questionnaire.questions[i];
      const questionPrefix = `Question ${i + 1}`;

      if (!question.id) {
        errors.push(`${questionPrefix}: ID is required`);
      }

      if (!question.text) {
        errors.push(`${questionPrefix}: Text is required`);
      }

      if (!question.type) {
        errors.push(`${questionPrefix}: Type is required`);
      }

      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        if (!question.options || question.options.length === 0) {
          errors.push(`${questionPrefix}: Options are required for choice questions`);
        }
      }

      if (question.type === 'scale') {
        if (question.scaleMin === undefined || question.scaleMax === undefined) {
          errors.push(`${questionPrefix}: Scale min and max are required for scale questions`);
        }
      }
    }

    // 验证评分规则
    for (let i = 0; i < questionnaire.scoringRules.length; i++) {
      const rule = questionnaire.scoringRules[i];
      const rulePrefix = `Scoring rule ${i + 1}`;

      if (!rule.id) {
        errors.push(`${rulePrefix}: ID is required`);
      }

      if (!rule.calculation) {
        errors.push(`${rulePrefix}: Calculation method is required`);
      }

      if (!rule.questionIds || rule.questionIds.length === 0) {
        errors.push(`${rulePrefix}: Question IDs are required`);
      }

      if (!rule.ranges || rule.ranges.length === 0) {
        errors.push(`${rulePrefix}: Score ranges are required`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 重新加载问卷
   */
  async reloadQuestionnaire(id: string): Promise<void> {
    this.loader.clearCacheForQuestionnaire(id);
    this.questionnaires.delete(id);
    this.translations.delete(id);

    try {
      const questionnaire = await this.loader.loadQuestionnaire(id);
      this.questionnaires.set(id, questionnaire);
    } catch (error) {
      console.error(`Failed to reload questionnaire ${id}:`, error);
    }
  }

  /**
   * 重新加载所有问卷
   */
  async reloadAll(): Promise<void> {
    this.loader.clearCache();
    this.questionnaires.clear();
    this.translations.clear();
    await this.initialize();
  }

  // 私有方法

  private createLocalizedQuestionnaire(
    questionnaire: Questionnaire,
    translation: QuestionnaireTranslation
  ): Questionnaire {
    // 创建深拷贝
    const localized = JSON.parse(JSON.stringify(questionnaire)) as Questionnaire;

    // 更新元数据
    localized.metadata.titleKey = translation.title;
    localized.metadata.descriptionKey = translation.description;
    localized.metadata.introductionKey = translation.introduction;
    localized.metadata.purposeKey = translation.purpose;
    localized.metadata.instructions = translation.instructions;
    localized.metadata.disclaimer = translation.disclaimer;

    // 更新问题
    for (const question of localized.questions) {
      const questionTranslation = translation.questions[question.id];
      if (questionTranslation) {
        question.text = questionTranslation.text;
        if (questionTranslation.description) {
          question.description = questionTranslation.description;
        }

        // 更新选项
        if (question.options && questionTranslation.options) {
          for (const option of question.options) {
            if (questionTranslation.options[option.id]) {
              option.text = questionTranslation.options[option.id];
            }
          }
        }

        // 更新量表标签
        if (question.scaleLabels && questionTranslation.scaleLabels) {
          question.scaleLabels = questionTranslation.scaleLabels;
        }
      }
    }

    // 更新评分规则
    for (const rule of localized.scoringRules) {
      const ruleTranslation = translation.scoringRules[rule.id];
      if (ruleTranslation) {
        rule.name = ruleTranslation.name;
        rule.description = ruleTranslation.description;

        // 更新范围
        for (let i = 0; i < rule.ranges.length; i++) {
          const rangeTranslation = ruleTranslation.ranges[i];
          if (rangeTranslation) {
            rule.ranges[i].label = rangeTranslation.label;
            rule.ranges[i].description = rangeTranslation.description;
            if (rangeTranslation.recommendations) {
              rule.ranges[i].recommendations = rangeTranslation.recommendations;
            }
          }
        }
      }
    }

    return localized;
  }
}
