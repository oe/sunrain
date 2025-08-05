/**
 * 问卷内容加载器
 *
 * 负责从文件系统动态加载问卷数据
 */

import type {
  Questionnaire,
  QuestionnaireCategory,
  ResultInterpretation
} from '@/types/questionnaire';
import type { Question, ScoringRule } from '@/types/assessment';

export interface QuestionnaireMetadata {
  id: string;
  titleKey: string;
  descriptionKey: string;
  introductionKey: string;
  purposeKey: string;
  categoryId: string;
  tags: string[];
  estimatedMinutes: number;
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  validatedScoring: boolean;
  professionalBacking: {
    source: string;
    reference: string;
    validationStudies: string[];
    reliability: number;
    validity: string;
  };
  instructions: string;
  disclaimer?: string;
  isFeatured: boolean;
  isActive: boolean;
  requiresAuth: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireIndex {
  questionnaires: {
    id: string;
    titleKey: string;
    descriptionKey: string;
    categoryId: string;
    tags: string[];
    estimatedMinutes: number;
    questionCount: number;
    difficulty: string;
    isFeatured: boolean;
    isActive: boolean;
    version: string;
    lastUpdated: string;
  }[];
}

export interface CategoriesData {
  categories: QuestionnaireCategory[];
}

export class QuestionnaireContentLoader {
  private baseUrl: string;
  private cache = new Map<string, any>();

  constructor(baseUrl: string = '/content/questionnaires') {
    this.baseUrl = baseUrl;
  }

  /**
   * 加载问卷索引
   */
  async loadQuestionnaireIndex(): Promise<QuestionnaireIndex> {
    const cacheKey = 'questionnaires-index';

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/questionnaires-index.json`);
      if (!response.ok) {
        throw new Error(`Failed to load questionnaire index: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error loading questionnaire index:', error);
      throw error;
    }
  }

  /**
   * 加载分类数据
   */
  async loadCategories(): Promise<CategoriesData> {
    const cacheKey = 'categories';

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/categories.json`);
      if (!response.ok) {
        throw new Error(`Failed to load categories: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error loading categories:', error);
      throw error;
    }
  }

  /**
   * 加载问卷元数据
   */
  async loadQuestionnaireMetadata(questionnaireId: string): Promise<QuestionnaireMetadata> {
    const cacheKey = `metadata-${questionnaireId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${questionnaireId}/metadata.json`);
      if (!response.ok) {
        throw new Error(`Failed to load metadata for ${questionnaireId}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading metadata for ${questionnaireId}:`, error);
      throw error;
    }
  }

  /**
   * 加载问卷问题
   */
  async loadQuestionnaireQuestions(questionnaireId: string): Promise<{ questions: Question[] }> {
    const cacheKey = `questions-${questionnaireId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${questionnaireId}/questions.json`);
      if (!response.ok) {
        throw new Error(`Failed to load questions for ${questionnaireId}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading questions for ${questionnaireId}:`, error);
      throw error;
    }
  }

  /**
   * 加载评分规则
   */
  async loadQuestionnaireScoringRules(questionnaireId: string): Promise<{ scoringRules: ScoringRule[] }> {
    const cacheKey = `scoring-${questionnaireId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${questionnaireId}/scoring.json`);
      if (!response.ok) {
        throw new Error(`Failed to load scoring rules for ${questionnaireId}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading scoring rules for ${questionnaireId}:`, error);
      throw error;
    }
  }

  /**
   * 加载结果解读
   */
  async loadQuestionnaireInterpretations(questionnaireId: string): Promise<{ interpretations: ResultInterpretation[] }> {
    const cacheKey = `interpretations-${questionnaireId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${questionnaireId}/interpretations.json`);
      if (!response.ok) {
        throw new Error(`Failed to load interpretations for ${questionnaireId}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading interpretations for ${questionnaireId}:`, error);
      throw error;
    }
  }

  /**
   * 加载完整的问卷数据
   */
  async loadCompleteQuestionnaire(questionnaireId: string): Promise<Questionnaire> {
    try {
      // 并行加载所有数据
      const [metadata, questions, scoringRules, interpretations, categories] = await Promise.all([
        this.loadQuestionnaireMetadata(questionnaireId),
        this.loadQuestionnaireQuestions(questionnaireId),
        this.loadQuestionnaireScoringRules(questionnaireId),
        this.loadQuestionnaireInterpretations(questionnaireId),
        this.loadCategories()
      ]);

      // 找到对应的分类
      const category = categories.categories.find(c => c.id === metadata.categoryId);
      if (!category) {
        throw new Error(`Category not found: ${metadata.categoryId}`);
      }

      // 构建完整的问卷对象
      const questionnaire: Questionnaire = {
        id: metadata.id,
        titleKey: metadata.titleKey,
        descriptionKey: metadata.descriptionKey,
        introductionKey: metadata.introductionKey,
        purposeKey: metadata.purposeKey,
        category,
        tags: metadata.tags.map(tagId => ({ id: tagId, name: tagId })), // 简化处理
        estimatedMinutes: metadata.estimatedMinutes,
        questionCount: metadata.questionCount,
        difficulty: metadata.difficulty as any,
        validatedScoring: metadata.validatedScoring,
        professionalBacking: metadata.professionalBacking,
        interpretations: interpretations.interpretations,
        isActive: metadata.isActive,
        isFeatured: metadata.isFeatured,
        completionCount: 0,
        averageRating: 0,
        requiresAuth: metadata.requiresAuth,

        // AssessmentType 字段
        duration: metadata.estimatedMinutes,
        questions: questions.questions,
        scoringRules: scoringRules.scoringRules,
        instructions: metadata.instructions,
        disclaimer: metadata.disclaimer,
        version: metadata.version,
        createdAt: new Date(metadata.createdAt),
        updatedAt: new Date(metadata.updatedAt)
      };

      return questionnaire;
    } catch (error) {
      console.error(`Error loading complete questionnaire ${questionnaireId}:`, error);
      throw error;
    }
  }

  /**
   * 预加载问卷数据
   */
  async preloadQuestionnaire(questionnaireId: string): Promise<void> {
    try {
      await this.loadCompleteQuestionnaire(questionnaireId);
      console.log(`✅ Preloaded questionnaire: ${questionnaireId}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload questionnaire ${questionnaireId}:`, error);
    }
  }

  /**
   * 批量预加载问卷
   */
  async preloadQuestionnaires(questionnaireIds: string[]): Promise<void> {
    const promises = questionnaireIds.map(id => this.preloadQuestionnaire(id));
    await Promise.allSettled(promises);
  }

  /**
   * 清除缓存
   */
  clearCache(questionnaireId?: string): void {
    if (questionnaireId) {
      // 清除特定问卷的缓存
      const keysToDelete = Array.from(this.cache.keys()).filter(key =>
        key.includes(questionnaireId)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // 清除所有缓存
      this.cache.clear();
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 导出单例实例
export const questionnaireContentLoader = new QuestionnaireContentLoader();
