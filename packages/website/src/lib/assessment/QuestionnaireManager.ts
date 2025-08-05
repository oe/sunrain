/**
 * 问卷管理器
 *
 * 负责问卷的分类管理、过滤、排序等功能
 */

import type {
  Questionnaire,
  QuestionnaireCategory,
  QuestionnaireFilter,
  QuestionnaireSortOption,
  QuestionnaireListItem,
  QuestionnaireTag
} from '@/types/questionnaire';
import { QUESTIONNAIRE_CATEGORIES, QUESTIONNAIRE_TAGS } from '@/types/questionnaire';

export class QuestionnaireManager {
  private questionnaires: Map<string, Questionnaire> = new Map();
  private categories: Map<string, QuestionnaireCategory> = new Map();
  private tags: Map<string, QuestionnaireTag> = new Map();

  constructor() {
    this.initializeCategories();
    this.initializeTags();
  }

  /**
   * 初始化分类
   */
  private initializeCategories() {
    QUESTIONNAIRE_CATEGORIES.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  /**
   * 初始化标签
   */
  private initializeTags() {
    QUESTIONNAIRE_TAGS.forEach(tag => {
      this.tags.set(tag.id, tag);
    });
  }

  /**
   * 注册问卷
   */
  registerQuestionnaire(questionnaire: Questionnaire) {
    this.questionnaires.set(questionnaire.id, questionnaire);
  }

  /**
   * 获取问卷
   */
  getQuestionnaire(id: string): Questionnaire | undefined {
    return this.questionnaires.get(id);
  }

  /**
   * 获取所有分类
   */
  getCategories(): QuestionnaireCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * 获取分类
   */
  getCategory(id: string): QuestionnaireCategory | undefined {
    return this.categories.get(id);
  }

  /**
   * 获取所有标签
   */
  getTags(): QuestionnaireTag[] {
    return Array.from(this.tags.values());
  }

  /**
   * 过滤问卷
   */
  filterQuestionnaires(
    filter: QuestionnaireFilter = {},
    sort: QuestionnaireSortOption = { field: 'title', direction: 'asc' }
  ): QuestionnaireListItem[] {
    let questionnaires = Array.from(this.questionnaires.values())
      .filter(q => q.isActive); // 只显示启用的问卷

    // 分类过滤
    if (filter.categoryId) {
      questionnaires = questionnaires.filter(q => q.category.id === filter.categoryId);
    }

    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      questionnaires = questionnaires.filter(q =>
        filter.tags!.some(tagId => q.tags.some(tag => tag.id === tagId))
      );
    }

    // 难度过滤
    if (filter.difficulty) {
      questionnaires = questionnaires.filter(q => q.difficulty === filter.difficulty);
    }

    // 时间过滤
    if (filter.estimatedTime) {
      questionnaires = questionnaires.filter(q => {
        const time = q.estimatedMinutes;
        const min = filter.estimatedTime!.min;
        const max = filter.estimatedTime!.max;
        return (!min || time >= min) && (!max || time <= max);
      });
    }

    // 验证过滤
    if (filter.validatedOnly) {
      questionnaires = questionnaires.filter(q => q.validatedScoring);
    }

    // 推荐过滤
    if (filter.featuredOnly) {
      questionnaires = questionnaires.filter(q => q.isFeatured);
    }

    // 搜索过滤
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      questionnaires = questionnaires.filter(q =>
        q.titleKey.toLowerCase().includes(query) ||
        q.descriptionKey.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }

    // 排序
    questionnaires.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case 'title':
          aValue = a.titleKey;
          bValue = b.titleKey;
          break;
        case 'estimatedMinutes':
          aValue = a.estimatedMinutes;
          bValue = b.estimatedMinutes;
          break;
        case 'completionCount':
          aValue = a.completionCount || 0;
          bValue = b.completionCount || 0;
          break;
        case 'averageRating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // 转换为列表项
    return questionnaires.map(q => this.toListItem(q));
  }

  /**
   * 获取分类下的问卷数量
   */
  getCategoryCount(categoryId: string): number {
    return Array.from(this.questionnaires.values())
      .filter(q => q.isActive && q.category.id === categoryId)
      .length;
  }

  /**
   * 获取推荐问卷
   */
  getFeaturedQuestionnaires(limit: number = 6): QuestionnaireListItem[] {
    return this.filterQuestionnaires(
      { featuredOnly: true },
      { field: 'averageRating', direction: 'desc' }
    ).slice(0, limit);
  }

  /**
   * 获取最新问卷
   */
  getLatestQuestionnaires(limit: number = 6): QuestionnaireListItem[] {
    return this.filterQuestionnaires(
      {},
      { field: 'createdAt', direction: 'desc' }
    ).slice(0, limit);
  }

  /**
   * 获取热门问卷
   */
  getPopularQuestionnaires(limit: number = 6): QuestionnaireListItem[] {
    return this.filterQuestionnaires(
      {},
      { field: 'completionCount', direction: 'desc' }
    ).slice(0, limit);
  }

  /**
   * 搜索问卷
   */
  searchQuestionnaires(query: string, limit: number = 10): QuestionnaireListItem[] {
    return this.filterQuestionnaires(
      { searchQuery: query },
      { field: 'averageRating', direction: 'desc' }
    ).slice(0, limit);
  }

  /**
   * 获取相关问卷
   */
  getRelatedQuestionnaires(
    questionnaireId: string,
    limit: number = 4
  ): QuestionnaireListItem[] {
    const questionnaire = this.getQuestionnaire(questionnaireId);
    if (!questionnaire) return [];

    // 基于分类和标签找相关问卷
    const related = Array.from(this.questionnaires.values())
      .filter(q =>
        q.id !== questionnaireId &&
        q.isActive &&
        (q.category.id === questionnaire.category.id ||
         q.tags.some(tag => questionnaire.tags.some(t => t.id === tag.id)))
      )
      .sort((a, b) => {
        // 计算相关性分数
        let scoreA = 0, scoreB = 0;

        // 同分类加分
        if (a.category.id === questionnaire.category.id) scoreA += 3;
        if (b.category.id === questionnaire.category.id) scoreB += 3;

        // 共同标签加分
        scoreA += a.tags.filter(tag =>
          questionnaire.tags.some(t => t.id === tag.id)
        ).length;
        scoreB += b.tags.filter(tag =>
          questionnaire.tags.some(t => t.id === tag.id)
        ).length;

        return scoreB - scoreA;
      })
      .slice(0, limit);

    return related.map(q => this.toListItem(q));
  }

  /**
   * 转换为列表项
   */
  private toListItem(questionnaire: Questionnaire): QuestionnaireListItem {
    return {
      id: questionnaire.id,
      titleKey: questionnaire.titleKey,
      descriptionKey: questionnaire.descriptionKey,
      category: questionnaire.category,
      tags: questionnaire.tags,
      estimatedMinutes: questionnaire.estimatedMinutes,
      questionCount: questionnaire.questionCount,
      difficulty: questionnaire.difficulty,
      isFeatured: questionnaire.isFeatured,
      completionCount: questionnaire.completionCount || 0,
      averageRating: questionnaire.averageRating || 0,
      hasHistory: false, // 这个需要从用户数据中获取
      lastCompletedAt: undefined // 这个需要从用户数据中获取
    };
  }

  /**
   * 添加新分类
   */
  addCategory(category: QuestionnaireCategory) {
    this.categories.set(category.id, category);
  }

  /**
   * 添加新标签
   */
  addTag(tag: QuestionnaireTag) {
    this.tags.set(tag.id, tag);
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const questionnaires = Array.from(this.questionnaires.values())
      .filter(q => q.isActive);

    return {
      totalQuestionnaires: questionnaires.length,
      totalCategories: this.categories.size,
      totalTags: this.tags.size,
      averageEstimatedTime: questionnaires.reduce((sum, q) => sum + q.estimatedMinutes, 0) / questionnaires.length,
      validatedCount: questionnaires.filter(q => q.validatedScoring).length,
      featuredCount: questionnaires.filter(q => q.isFeatured).length,
      categoryDistribution: this.getCategories().map(cat => ({
        category: cat,
        count: this.getCategoryCount(cat.id)
      }))
    };
  }
}

// 导出单例实例
export const questionnaireManager = new QuestionnaireManager();
