/**
 * 问题数据缓存管理器
 * 专门用于缓存评测问题、问卷类型和相关数据
 */

import { cacheManager, CacheManager } from './CacheManager';
import type { Question, AssessmentType } from '@/types/assessment';

interface QuestionCacheConfig {
  questionTTL: number; // 问题缓存时间
  assessmentTypeTTL: number; // 评测类型缓存时间
  preloadEnabled: boolean; // 是否启用预加载
}

export class QuestionCache {
  private readonly config: QuestionCacheConfig = {
    questionTTL: 60 * 60 * 1000, // 1小时
    assessmentTypeTTL: 24 * 60 * 60 * 1000, // 24小时
    preloadEnabled: true
  };

  private static instance: QuestionCache;
  private cache: CacheManager;

  private constructor() {
    this.cache = cacheManager;
    this.initializePreloading();
  }

  public static getInstance(): QuestionCache {
    if (!QuestionCache.instance) {
      QuestionCache.instance = new QuestionCache();
    }
    return QuestionCache.instance;
  }

  /**
   * 缓存单个问题
   */
  public cacheQuestion(question: Question, language: string = 'zh'): void {
    const key = this.getQuestionKey(question.id, language);
    this.cache.set(key, question, this.config.questionTTL, '1.0');
  }

  /**
   * 获取缓存的问题
   */
  public getQuestion(questionId: string, language: string = 'zh'): Question | null {
    const key = this.getQuestionKey(questionId, language);
    return this.cache.get<Question>(key);
  }

  /**
   * 批量缓存问题
   */
  public cacheQuestions(questions: Question[], language: string = 'zh'): void {
    questions.forEach(question => {
      this.cacheQuestion(question, language);
    });
  }

  /**
   * 获取多个问题
   */
  public getQuestions(questionIds: string[], language: string = 'zh'): (Question | null)[] {
    return questionIds.map(id => this.getQuestion(id, language));
  }

  /**
   * 缓存评测类型
   */
  public cacheAssessmentType(assessmentType: AssessmentType, language: string = 'zh'): void {
    const key = this.getAssessmentTypeKey(assessmentType.id, language);
    this.cache.set(key, assessmentType, this.config.assessmentTypeTTL, assessmentType.version || '1.0');
  }

  /**
   * 获取缓存的评测类型
   */
  public getAssessmentType(assessmentTypeId: string, language: string = 'zh'): AssessmentType | null {
    const key = this.getAssessmentTypeKey(assessmentTypeId, language);
    return this.cache.get<AssessmentType>(key);
  }



  /**
   * 预加载常用问卷数据
   */
  public async preloadCommonAssessments(assessmentTypeIds: string[], language: string = 'zh'): Promise<void> {
    if (!this.config.preloadEnabled) return;

    const preloadPromises = assessmentTypeIds.map(async (typeId) => {
      try {
        // 检查是否已缓存
        if (this.getAssessmentType(typeId, language)) {
          return;
        }

        // 这里应该调用实际的数据加载逻辑
        // 由于这是缓存层，我们假设有一个数据加载器
        console.log(`Preloading assessment type: ${typeId} for language: ${language}`);

        // 模拟异步加载
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.warn(`Failed to preload assessment ${typeId}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * 智能预加载 - 基于用户行为预测
   */
  public async smartPreload(currentAssessmentId: string, language: string = 'zh'): Promise<void> {
    // 获取相关的评测类型
    const relatedAssessments = this.getRelatedAssessments(currentAssessmentId);

    // 预加载相关评测的前几个问题
    const preloadPromises = relatedAssessments.slice(0, 3).map(async (assessmentId) => {
      try {
        const assessmentType = this.getAssessmentType(assessmentId, language);
        if (!assessmentType && this.shouldPreload(assessmentId)) {
          console.log(`Smart preloading: ${assessmentId}`);
          // 这里调用实际的加载逻辑
        }
      } catch (error) {
        console.warn(`Smart preload failed for ${assessmentId}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * 缓存问题的答案选项（如果有动态内容）
   */
  public cacheQuestionOptions(questionId: string, options: any[], language: string = 'zh'): void {
    const key = this.getQuestionOptionsKey(questionId, language);
    this.cache.set(key, options, this.config.questionTTL);
  }

  /**
   * 获取缓存的问题选项
   */
  public getQuestionOptions(questionId: string, language: string = 'zh'): any[] | null {
    const key = this.getQuestionOptionsKey(questionId, language);
    return this.cache.get<any[]>(key);
  }

  /**
   * 清理特定评测类型的缓存
   */
  public clearAssessmentCache(assessmentTypeId: string, language?: string): void {
    const languages = language ? [language] : ['zh', 'en', 'es', 'ar', 'hi', 'ja', 'ko'];

    languages.forEach(lang => {
      // 清理评测类型缓存
      const assessmentTypeKey = this.getAssessmentTypeKey(assessmentTypeId, lang);
      this.cache.delete(assessmentTypeKey);

      // 清理相关问题缓存（这里需要维护一个问题ID列表）
      // 实际实现中可能需要更复杂的索引机制
    });
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): {
    questionCount: number;
    assessmentTypeCount: number;
    totalSize: number;
  } {
    const stats = this.cache.getStats();

    // 这里可以添加更详细的统计逻辑
    // 计算不同类型缓存的数量

    return {
      questionCount: 0, // 实际实现中需要计算
      assessmentTypeCount: 0,
      totalSize: stats.totalSize
    };
  }

  /**
   * 初始化预加载
   */
  private initializePreloading(): void {
    if (!this.config.preloadEnabled) return;

    // 只在客户端环境中执行预加载
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // 页面加载完成后预加载常用数据
    if (document.readyState === 'complete') {
      this.performInitialPreload();
    } else {
      window.addEventListener('load', () => {
        this.performInitialPreload();
      });
    }
  }

  /**
   * 执行初始预加载
   */
  private async performInitialPreload(): Promise<void> {
    try {
      // 预加载最常用的评测类型
      const commonAssessments = ['anxiety', 'depression', 'stress', 'wellbeing'];
      await this.preloadCommonAssessments(commonAssessments);
    } catch (error) {
      console.warn('Initial preload failed:', error);
    }
  }

  /**
   * 获取相关的评测类型
   */
  private getRelatedAssessments(assessmentId: string): string[] {
    // 这里应该基于实际的关联逻辑
    const relatedMap: Record<string, string[]> = {
      'anxiety': ['depression', 'stress'],
      'depression': ['anxiety', 'wellbeing'],
      'stress': ['anxiety', 'burnout'],
      'wellbeing': ['depression', 'life-satisfaction']
    };

    return relatedMap[assessmentId] || [];
  }

  /**
   * 判断是否应该预加载某个评测
   */
  private shouldPreload(assessmentId: string): boolean {
    // 基于用户历史、时间、网络状况等因素决定
    const networkInfo = (navigator as any).connection;

    // 如果网络较慢，减少预加载
    if (networkInfo && networkInfo.effectiveType === 'slow-2g') {
      return false;
    }

    // 检查用户历史偏好（从 localStorage 读取）
    try {
      const userPrefs = JSON.parse(localStorage.getItem('user_assessment_prefs') || '{}');
      return userPrefs.frequentAssessments?.includes(assessmentId) || false;
    } catch {
      return true; // 默认预加载
    }
  }

  /**
   * 生成问题缓存键
   */
  private getQuestionKey(questionId: string, language: string): string {
    return CacheManager.getCacheKey('question', questionId, undefined, language);
  }

  /**
   * 生成评测类型缓存键
   */
  private getAssessmentTypeKey(assessmentTypeId: string, language: string): string {
    return CacheManager.getCacheKey('assessment_type', assessmentTypeId, undefined, language);
  }

  /**
   * 生成问题选项缓存键
   */
  private getQuestionOptionsKey(questionId: string, language: string): string {
    return CacheManager.getCacheKey('question_options', questionId, undefined, language);
  }
}

// 导出单例实例
export const questionCache = QuestionCache.getInstance();
