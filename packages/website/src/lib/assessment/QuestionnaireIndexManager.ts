/**
 * 问卷索引管理系统
 * 
 * 负责问卷的索引管理、搜索和分类
 */

import type { 
  QuestionnaireListItem, 
  QuestionnaireFilter, 
  QuestionnaireSortOption,
  QuestionnaireCategory 
} from '@/types/questionnaire';
import { questionnaireContentLoader } from './QuestionnaireContentLoader';

export interface SearchIndex {
  id: string;
  titleKey: string;
  descriptionKey: string;
  categoryId: string;
  tags: string[];
  searchableText: string; // 用于全文搜索的文本
}

export class QuestionnaireIndexManager {
  private searchIndex: SearchIndex[] = [];
  private categories: Map<string, QuestionnaireCategory> = new Map();
  private initialized = false;

  /**
   * 初始化索引
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 加载分类数据
      const categoriesData = await questionnaireContentLoader.loadCategories();
      categoriesData.categories.forEach(category => {
        this.categories.set(category.id, category);
      });

      // 加载问卷索引
      const indexData = await questionnaireContentLoader.loadQuestionnaireIndex();
      
      // 构建搜索索引
      this.searchIndex = indexData.questionnaires
        .filter(q => q.isActive)
        .map(q => ({
          id: q.id,
          titleKey: q.titleKey,
          descriptionKey: q.descriptionKey,
          categoryId: q.categoryId,
          tags: q.tags,
          searchableText: this.buildSearchableText(q)
        }));

      this.initialized = true;
      console.log(`✅ Questionnaire index initialized with ${this.searchIndex.length} questionnaires`);
    } catch (error) {
      console.error('Failed to initialize questionnaire index:', error);
      throw error;
    }
  }

  /**
   * 搜索问卷
   */
  async searchQuestionnaires(
    query: string, 
    filter: QuestionnaireFilter = {},
    sort: QuestionnaireSortOption = { field: 'title', direction: 'asc' },
    limit?: number
  ): Promise<QuestionnaireListItem[]> {
    await this.ensureInitialized();

    let results = [...this.searchIndex];

    // 文本搜索
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      results = results.filter(item => 
        searchTerms.every(term => 
          item.searchableText.toLowerCase().includes(term)
        )
      );
    }

    // 应用过滤器
    results = this.applyFilters(results, filter);

    // 排序
    results = this.sortResults(results, sort);

    // 限制结果数量
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    // 转换为列表项
    return this.convertToListItems(results);
  }

  /**
   * 获取分类下的问卷
   */
  async getQuestionnairesByCategory(
    categoryId: string,
    sort: QuestionnaireSortOption = { field: 'title', direction: 'asc' }
  ): Promise<QuestionnaireListItem[]> {
    return this.searchQuestionnaires('', { categoryId }, sort);
  }

  /**
   * 获取推荐问卷
   */
  async getFeaturedQuestionnaires(limit: number = 6): Promise<QuestionnaireListItem[]> {
    return this.searchQuestionnaires('', { featuredOnly: true }, { field: 'title', direction: 'asc' }, limit);
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<QuestionnaireCategory[]> {
    await this.ensureInitialized();
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * 获取分类信息
   */
  async getCategory(categoryId: string): Promise<QuestionnaireCategory | undefined> {
    await this.ensureInitialized();
    return this.categories.get(categoryId);
  }

  /**
   * 获取分类下的问卷数量
   */
  async getCategoryCount(categoryId: string): Promise<number> {
    await this.ensureInitialized();
    return this.searchIndex.filter(item => item.categoryId === categoryId).length;
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    await this.ensureInitialized();

    if (!query.trim()) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // 从标题和标签中提取建议
    this.searchIndex.forEach(item => {
      // 标题建议
      if (item.titleKey.toLowerCase().includes(queryLower)) {
        suggestions.add(item.titleKey);
      }

      // 标签建议
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<{
    totalQuestionnaires: number;
    totalCategories: number;
    categoryDistribution: { category: QuestionnaireCategory; count: number }[];
  }> {
    await this.ensureInitialized();

    const categories = await this.getCategories();
    const categoryDistribution = await Promise.all(
      categories.map(async category => ({
        category,
        count: await this.getCategoryCount(category.id)
      }))
    );

    return {
      totalQuestionnaires: this.searchIndex.length,
      totalCategories: this.categories.size,
      categoryDistribution
    };
  }

  /**
   * 刷新索引
   */
  async refreshIndex(): Promise<void> {
    this.initialized = false;
    this.searchIndex = [];
    this.categories.clear();
    questionnaireContentLoader.clearCache();
    await this.initialize();
  }

  // 私有方法

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private buildSearchableText(questionnaire: any): string {
    return [
      questionnaire.titleKey,
      questionnaire.descriptionKey,
      questionnaire.categoryId,
      ...questionnaire.tags,
      questionnaire.difficulty
    ].join(' ');
  }

  private applyFilters(results: SearchIndex[], filter: QuestionnaireFilter): SearchIndex[] {
    let filtered = results;

    if (filter.categoryId) {
      filtered = filtered.filter(item => item.categoryId === filter.categoryId);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(item => 
        filter.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // 其他过滤器需要加载完整数据，这里暂时跳过
    // 在实际应用中，可以考虑在索引中包含更多字段

    return filtered;
  }

  private sortResults(results: SearchIndex[], sort: QuestionnaireSortOption): SearchIndex[] {
    return results.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case 'title':
          aValue = a.titleKey;
          bValue = b.titleKey;
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
  }

  private async convertToListItems(searchResults: SearchIndex[]): Promise<QuestionnaireListItem[]> {
    // 这里需要加载更多数据来构建完整的列表项
    // 为了简化，我们返回基本信息
    return searchResults.map(item => ({
      id: item.id,
      titleKey: item.titleKey,
      descriptionKey: item.descriptionKey,
      category: this.categories.get(item.categoryId)!,
      tags: item.tags.map(tagId => ({ id: tagId, name: tagId })),
      estimatedMinutes: 0, // 需要从完整数据加载
      questionCount: 0, // 需要从完整数据加载
      difficulty: 'beginner' as const, // 需要从完整数据加载
      isFeatured: false, // 需要从完整数据加载
      completionCount: 0,
      averageRating: 0,
      hasHistory: false,
      lastCompletedAt: undefined
    }));
  }
}

// 导出单例实例
export const questionnaireIndexManager = new QuestionnaireIndexManager();