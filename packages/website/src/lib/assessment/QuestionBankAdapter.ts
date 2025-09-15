/**
 * 问卷库适配器
 * 将新的异步数据管理器适配到现有的同步接口
 */

import { newQuestionBankManager } from './NewQuestionBankManager';
import type { AssessmentType, AssessmentCategory } from '@/types/assessment';
import type { Language } from '@/types/questionnaire';

// 缓存数据，避免重复加载
let cachedAssessmentTypes: AssessmentType[] | null = null;
let cachedLocalizedData: Map<string, AssessmentType[]> = new Map();

export class QuestionBankAdapter {
  private static instance: QuestionBankAdapter | null = null;

  private constructor() {}

  static getInstance(): QuestionBankAdapter {
    if (!QuestionBankAdapter.instance) {
      QuestionBankAdapter.instance = new QuestionBankAdapter();
    }
    return QuestionBankAdapter.instance;
  }

  /**
   * 初始化数据（在应用启动时调用）
   */
  async initialize(): Promise<void> {
    try {
      // 预加载所有评测类型
      cachedAssessmentTypes = await newQuestionBankManager.getAssessmentTypes();
      
      // 预加载所有语言的本地化数据
      const languages: Language[] = ['en', 'zh', 'es', 'ja', 'ko', 'hi', 'ar'];
      for (const lang of languages) {
        const localizedData = await newQuestionBankManager.getAllLocalizedAssessmentTypes(lang);
        cachedLocalizedData.set(lang, localizedData);
      }
    } catch (error) {
      console.error('Failed to initialize QuestionBankAdapter:', error);
      // 如果初始化失败，使用空数组作为后备
      cachedAssessmentTypes = [];
    }
  }

  /**
   * 获取所有评测类型（同步）
   */
  getAssessmentTypes(): AssessmentType[] {
    if (!cachedAssessmentTypes) {
      console.warn('QuestionBankAdapter not initialized, returning empty array');
      return [];
    }
    return cachedAssessmentTypes;
  }

  /**
   * 根据ID获取评测类型（同步）
   */
  getAssessmentType(id: string): AssessmentType | undefined {
    const types = this.getAssessmentTypes();
    return types.find(type => type.id === id);
  }

  /**
   * 根据类别获取评测类型（同步）
   */
  getAssessmentTypesByCategory(category: AssessmentCategory): AssessmentType[] {
    const types = this.getAssessmentTypes();
    return types.filter(type => type.category === category);
  }

  /**
   * 获取本地化的评测类型（同步）
   */
  getLocalizedAssessmentType(id: string, language: Language): AssessmentType | undefined {
    const localizedData = cachedLocalizedData.get(language);
    if (!localizedData) {
      console.warn(`No localized data for language ${language}, falling back to default`);
      return this.getAssessmentType(id);
    }
    return localizedData.find(type => type.id === id);
  }

  /**
   * 获取所有本地化的评测类型（同步）
   */
  getAllLocalizedAssessmentTypes(language: Language): AssessmentType[] {
    const localizedData = cachedLocalizedData.get(language);
    if (!localizedData) {
      console.warn(`No localized data for language ${language}, falling back to default`);
      return this.getAssessmentTypes();
    }
    return localizedData;
  }

  /**
   * 搜索评测类型（同步）
   */
  searchAssessmentTypes(query: string): AssessmentType[] {
    const types = this.getAssessmentTypes();
    const searchQuery = query.toLowerCase();
    
    return types.filter(type => 
      type.name.toLowerCase().includes(searchQuery) ||
      type.description.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    cachedAssessmentTypes = null;
    cachedLocalizedData.clear();
  }

  /**
   * 重新加载数据
   */
  async reload(): Promise<void> {
    this.clearCache();
    await this.initialize();
  }
}

// 导出单例实例
export const questionBankAdapter = QuestionBankAdapter.getInstance();
