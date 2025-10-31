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
      // 只预加载所有评测类型（基础数据）
      console.log('🔍 QuestionBankAdapter: Starting initialization...');
      cachedAssessmentTypes = await newQuestionBankManager.getAssessmentTypes();
      console.log('🔍 QuestionBankAdapter: Loaded assessment types:', cachedAssessmentTypes?.length || 0);
      console.log('🔍 QuestionBankAdapter: Assessment type IDs:', cachedAssessmentTypes?.map(t => t.id) || []);
      
      // 不预加载翻译数据，采用按需加载策略
      // 翻译数据将在 getLocalizedAssessmentType 方法中按需加载
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
      console.warn('cachedAssessmentTypes is null, this means initialize() was not called or failed');
      return [];
    }
    return cachedAssessmentTypes;
  }

  /**
   * 根据ID获取评测类型（同步）
   */
  getAssessmentType(id: string): AssessmentType | undefined {
    const types = this.getAssessmentTypes();
    console.log('🔍 QuestionBankAdapter: Looking for assessment type:', id);
    console.log('🔍 QuestionBankAdapter: Available types:', types.map(t => t.id));
    console.log('🔍 QuestionBankAdapter: cachedAssessmentTypes is null?', cachedAssessmentTypes === null);
    console.log('🔍 QuestionBankAdapter: cachedAssessmentTypes length:', cachedAssessmentTypes?.length || 0);
    console.log('🔍 QuestionBankAdapter: Environment:', typeof window !== 'undefined' ? 'browser' : 'server');
    
    // 如果在客户端且数据为空，尝试重新初始化
    if (typeof window !== 'undefined' && (!cachedAssessmentTypes || cachedAssessmentTypes.length === 0)) {
      console.warn('🔍 QuestionBankAdapter: Client-side cache is empty, this might be the root cause!');
      console.warn('🔍 QuestionBankAdapter: Consider calling initialize() before getAssessmentType()');
    }
    
    const found = types.find(type => type.id === id);
    console.log('🔍 QuestionBankAdapter: Found type:', found ? found.id : 'undefined');
    return found;
  }

  /**
   * 根据类别获取评测类型（同步）
   */
  getAssessmentTypesByCategory(category: AssessmentCategory): AssessmentType[] {
    const types = this.getAssessmentTypes();
    return types.filter(type => type.category === category);
  }

  /**
   * 获取本地化的评测类型（异步，按需加载）
   */
  async getLocalizedAssessmentType(id: string, language: Language): Promise<AssessmentType | undefined> {
    // 检查是否已缓存该语言的翻译数据
    let localizedData = cachedLocalizedData.get(language);
    
    if (!localizedData) {
      try {
        // 按需加载该语言的翻译数据
        localizedData = await newQuestionBankManager.getAllLocalizedAssessmentTypes(language);
        cachedLocalizedData.set(language, localizedData);
      } catch (error) {
        console.warn(`Failed to load localized data for language ${language}:`, error);
        // 如果翻译加载失败，返回默认数据
        return this.getAssessmentType(id);
      }
    }
    
    return localizedData.find(type => type.id === id);
  }

  /**
   * 获取所有本地化的评测类型（异步，按需加载）
   */
  async getAllLocalizedAssessmentTypes(language: Language): Promise<AssessmentType[]> {
    // 检查是否已缓存该语言的翻译数据
    let localizedData = cachedLocalizedData.get(language);
    
    if (!localizedData) {
      try {
        // 按需加载该语言的翻译数据
        localizedData = await newQuestionBankManager.getAllLocalizedAssessmentTypes(language);
        cachedLocalizedData.set(language, localizedData);
      } catch (error) {
        console.warn(`Failed to load localized data for language ${language}:`, error);
        // 如果翻译加载失败，返回默认数据
        return this.getAssessmentTypes();
      }
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
