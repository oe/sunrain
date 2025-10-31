/**
 * 新的问卷库管理器
 * 基于文件系统的问卷数据管理
 */

import { getQuestionnaireManager } from '@/lib/questionnaire/QuestionnaireFactory';
import type { Language } from '@/types/questionnaire';
import type { AssessmentType, AssessmentCategory } from '@/types/assessment';

export class NewQuestionBankManager {
  private static instance: NewQuestionBankManager | null = null;
  private questionnaireManager: any = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): NewQuestionBankManager {
    if (!NewQuestionBankManager.instance) {
      NewQuestionBankManager.instance = new NewQuestionBankManager();
    }
    return NewQuestionBankManager.instance;
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    this.questionnaireManager = await getQuestionnaireManager();
  }

  /**
   * 获取所有问卷类型
   */
  async getAssessmentTypes(): Promise<AssessmentType[]> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }
    
    // 确保 questionnaireManager 完全初始化
    if (!this.questionnaireManager) {
      console.error('🔍 NewQuestionBankManager: Questionnaire manager still not initialized after initialize()');
      return [];
    }

    const questionnaires = await this.questionnaireManager.getAllLocalizedQuestionnaires('en');
    
    if (!questionnaires || questionnaires.length === 0) {
      return [];
    }
    
    const assessmentTypes = questionnaires.map(this.convertToAssessmentType);
    
    return assessmentTypes;
  }

  /**
   * 根据ID获取问卷类型
   */
  async getAssessmentType(id: string): Promise<AssessmentType | undefined> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }

    const questionnaire = await this.questionnaireManager.getLocalizedQuestionnaire(id, 'en');
    return questionnaire ? this.convertToAssessmentType(questionnaire) : undefined;
  }

  /**
   * 根据类别获取问卷类型
   */
  async getAssessmentTypesByCategory(category: AssessmentCategory): Promise<AssessmentType[]> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }

    const questionnaires = await this.questionnaireManager.getAllLocalizedQuestionnaires('en');
    return questionnaires
      .filter((q: any) => this.mapCategoryId(q.metadata.categoryId) === category)
      .map(this.convertToAssessmentType);
  }

  /**
   * 获取本地化的问卷类型
   */
  async getLocalizedAssessmentType(id: string, language: Language): Promise<AssessmentType | undefined> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }

    const questionnaire = await this.questionnaireManager.getLocalizedQuestionnaire(id, language);
    return questionnaire ? this.convertToAssessmentType(questionnaire) : undefined;
  }

  /**
   * 获取所有本地化的问卷类型
   */
  async getAllLocalizedAssessmentTypes(language: Language): Promise<AssessmentType[]> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }

    const questionnaires = await this.questionnaireManager.getAllLocalizedQuestionnaires(language);
    return questionnaires.map(this.convertToAssessmentType);
  }

  /**
   * 搜索问卷
   */
  async searchAssessmentTypes(query: string): Promise<AssessmentType[]> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }

    const results = await this.questionnaireManager.searchQuestionnaires(query);
    return results.map((result: any) => this.convertToAssessmentType(result.questionnaire));
  }

  /**
   * 获取问卷统计信息
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    featured: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
  }> {
    if (!this.questionnaireManager) {
      await this.initialize();
    }

    return this.questionnaireManager.getQuestionnaireStats();
  }

  // 私有方法

  /**
   * 将问卷数据转换为AssessmentType
   */
  private convertToAssessmentType = (questionnaire: any): AssessmentType => {
    return {
      id: questionnaire.metadata.id,
      name: questionnaire.metadata.titleKey,
      description: questionnaire.metadata.descriptionKey,
      category: this.mapCategoryId(questionnaire.metadata.categoryId),
      duration: questionnaire.metadata.estimatedMinutes,
      questions: questionnaire.questions.map(this.convertQuestion),
      scoringRules: questionnaire.scoringRules.map(this.convertScoringRule),
      instructions: questionnaire.metadata.instructions,
      disclaimer: questionnaire.metadata.disclaimer,
      version: questionnaire.metadata.version,
      createdAt: new Date(questionnaire.metadata.createdAt),
      updatedAt: new Date(questionnaire.metadata.updatedAt),
      translations: this.extractTranslations(questionnaire)
    };
  }

  /**
   * 转换问题数据
   */
  private convertQuestion = (question: any): any => {
    return {
      id: question.id,
      text: question.text,
      type: question.type,
      required: question.required,
      options: question.options?.map((option: any) => ({
        id: option.id,
        text: option.text,
        value: option.value
      })),
      scaleMin: question.scaleMin,
      scaleMax: question.scaleMax,
      scaleStep: question.scaleStep,
      scaleLabels: question.scaleLabels,
      conditionalLogic: question.conditionalLogic,
      validation: question.validation,
      translations: this.extractQuestionTranslations(question)
    };
  }

  /**
   * 转换评分规则
   */
  private convertScoringRule = (rule: any): any => {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      calculation: rule.calculation,
      questionIds: rule.questionIds,
      weights: rule.weights,
      customFormula: rule.customFormula,
      ranges: rule.ranges.map((range: any) => ({
        min: range.min,
        max: range.max,
        label: range.label,
        description: range.description,
        riskLevel: range.riskLevel
      }))
    };
  }

  /**
   * 映射类别ID
   */
  private mapCategoryId(categoryId: string): AssessmentCategory {
    const categoryMap: Record<string, AssessmentCategory> = {
      'depression': 'mental_health',
      'anxiety': 'mental_health',
      'stress': 'stress',
      'personality': 'personality',
      'self-esteem': 'mood',
      'relationships': 'personality'
    };
    return categoryMap[categoryId] || 'mental_health';
  }

  /**
   * 提取翻译数据
   */
  private extractTranslations(_questionnaire: any): Record<string, any> {
    // 这里需要根据实际的翻译数据结构来提取
    // 暂时返回空对象，后续可以根据需要完善
    return {};
  }

  /**
   * 提取问题翻译数据
   */
  private extractQuestionTranslations(_question: any): Record<string, any> {
    // 这里需要根据实际的翻译数据结构来提取
    // 暂时返回空对象，后续可以根据需要完善
    return {};
  }
}

// 导出单例实例
export const newQuestionBankManager = NewQuestionBankManager.getInstance();
