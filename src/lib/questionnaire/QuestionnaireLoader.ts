/**
 * 问卷数据加载器
 * 从文件系统加载问卷数据，支持多语言和缓存
 */

import fs from 'fs';
import path from 'path';
import type {
  Questionnaire,
  QuestionnaireTranslation,
  QuestionnaireIndex,
  QuestionnaireCategory,
  Language,
  QuestionnaireLoaderConfig,
  QuestionnaireSearchResult,
  QuestionnaireFilter
} from '@/types/questionnaire';
import type { IQuestionnaireLoader } from './IQuestionnaireLoader';

export class QuestionnaireLoader implements IQuestionnaireLoader {
  private config: QuestionnaireLoaderConfig;
  private cache: Map<string, any> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();

  constructor(config: QuestionnaireLoaderConfig) {
    this.config = config;
  }

  /**
   * 加载问卷索引
   */
  async loadIndex(): Promise<QuestionnaireIndex> {
    const cacheKey = 'index';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const indexPath = path.join(this.config.dataPath, 'index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    
    this.setCache(cacheKey, indexData);
    return indexData;
  }

  /**
   * 加载问卷类别
   */
  async loadCategories(): Promise<QuestionnaireCategory[]> {
    const cacheKey = 'categories';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const categoriesPath = path.join(this.config.dataPath, 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
    
    this.setCache(cacheKey, categoriesData.categories);
    return categoriesData.categories;
  }

  /**
   * 加载单个问卷
   */
  async loadQuestionnaire(id: string): Promise<Questionnaire> {
    const cacheKey = `questionnaire:${id}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const questionnairePath = path.join(this.config.dataPath, id);
    
    // 加载元数据
    const metadataPath = path.join(questionnairePath, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    // 加载问题
    const questionsPath = path.join(questionnairePath, 'questions.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

    // 加载评分规则
    const scoringPath = path.join(questionnairePath, 'scoring.json');
    const scoringData = JSON.parse(fs.readFileSync(scoringPath, 'utf-8'));

    // 加载解释
    const interpretationsPath = path.join(questionnairePath, 'interpretations.json');
    const interpretationsData = JSON.parse(fs.readFileSync(interpretationsPath, 'utf-8'));

    const questionnaire: Questionnaire = {
      metadata,
      questions: questionsData.questions,
      scoringRules: scoringData.scoringRules,
      interpretations: interpretationsData.interpretations
    };

    this.setCache(cacheKey, questionnaire);
    return questionnaire;
  }

  /**
   * 加载问卷翻译
   */
  async loadQuestionnaireTranslation(id: string, language: Language): Promise<QuestionnaireTranslation> {
    const cacheKey = `translation:${id}:${language}`;
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const translationPath = path.join(this.config.dataPath, id, 'translations', `${language}.json`);
    
    if (!fs.existsSync(translationPath)) {
      // 如果翻译不存在，返回默认语言
      if (language !== this.config.defaultLanguage) {
        return this.loadQuestionnaireTranslation(id, this.config.defaultLanguage);
      }
      throw new Error(`Translation not found for questionnaire ${id} in language ${language}`);
    }

    const translation = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
    this.setCache(cacheKey, translation);
    return translation;
  }

  /**
   * 加载所有问卷
   */
  async loadAllQuestionnaires(): Promise<Questionnaire[]> {
    const index = await this.loadIndex();
    const questionnaires: Questionnaire[] = [];

    for (const id of index.questionnaires) {
      try {
        const questionnaire = await this.loadQuestionnaire(id);
        questionnaires.push(questionnaire);
      } catch (error) {
        console.warn(`Failed to load questionnaire ${id}:`, error);
      }
    }

    return questionnaires;
  }

  /**
   * 搜索问卷
   */
  async searchQuestionnaires(query: string, filter?: QuestionnaireFilter): Promise<QuestionnaireSearchResult[]> {
    const questionnaires = await this.loadAllQuestionnaires();
    const results: QuestionnaireSearchResult[] = [];

    for (const questionnaire of questionnaires) {
      // 应用过滤器
      if (filter && !this.matchesFilter(questionnaire, filter)) {
        continue;
      }

      // 搜索匹配
      const score = this.calculateSearchScore(questionnaire, query);
      if (score > 0) {
        results.push({
          questionnaire,
          score,
          matchedFields: this.getMatchedFields(questionnaire, query)
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 获取问卷列表（分页）
   */
  async getQuestionnaires(
    page: number = 1,
    limit: number = 10,
    filter?: QuestionnaireFilter
  ): Promise<{ questionnaires: Questionnaire[]; total: number; page: number; limit: number }> {
    let questionnaires = await this.loadAllQuestionnaires();

    // 应用过滤器
    if (filter) {
      questionnaires = questionnaires.filter(q => this.matchesFilter(q, filter));
    }

    const total = questionnaires.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuestionnaires = questionnaires.slice(startIndex, endIndex);

    return {
      questionnaires: paginatedQuestionnaires,
      total,
      page,
      limit
    };
  }

  /**
   * 检查问卷是否存在
   */
  async questionnaireExists(id: string): Promise<boolean> {
    const questionnairePath = path.join(this.config.dataPath, id);
    return fs.existsSync(questionnairePath);
  }

  /**
   * 获取支持的翻译语言
   */
  async getSupportedLanguages(id: string): Promise<Language[]> {
    const translationDir = path.join(this.config.dataPath, id, 'translations');
    
    if (!fs.existsSync(translationDir)) {
      return [this.config.defaultLanguage];
    }

    const files = fs.readdirSync(translationDir);
    const languages: Language[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const language = file.replace('.json', '') as Language;
        if (this.config.supportedLanguages.includes(language)) {
          languages.push(language);
        }
      }
    }

    return languages.length > 0 ? languages : [this.config.defaultLanguage];
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * 清除特定缓存
   */
  clearCacheForQuestionnaire(id: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(`questionnaire:${id}`) || key.startsWith(`translation:${id}`)
    );
    
    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    }
  }

  // 私有方法

  private isCacheValid(key: string): boolean {
    if (!this.config.cacheEnabled) return false;
    
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    
    return Date.now() - timestamp < this.config.cacheTimeout;
  }

  private setCache(key: string, value: any): void {
    if (this.config.cacheEnabled) {
      this.cache.set(key, value);
      this.cacheTimestamps.set(key, Date.now());
    }
  }

  private matchesFilter(questionnaire: Questionnaire, filter: QuestionnaireFilter): boolean {
    if (filter.categoryId && questionnaire.metadata.categoryId !== filter.categoryId) {
      return false;
    }

    if (filter.difficulty && questionnaire.metadata.difficulty !== filter.difficulty) {
      return false;
    }

    if (filter.estimatedMinutes) {
      const minutes = questionnaire.metadata.estimatedMinutes;
      if (filter.estimatedMinutes.min && minutes < filter.estimatedMinutes.min) {
        return false;
      }
      if (filter.estimatedMinutes.max && minutes > filter.estimatedMinutes.max) {
        return false;
      }
    }

    if (filter.tags && !filter.tags.some(tag => questionnaire.metadata.tags.includes(tag))) {
      return false;
    }

    if (filter.isActive !== undefined && questionnaire.metadata.isActive !== filter.isActive) {
      return false;
    }

    if (filter.isFeatured !== undefined && questionnaire.metadata.isFeatured !== filter.isFeatured) {
      return false;
    }

    if (filter.requiresAuth !== undefined && questionnaire.metadata.requiresAuth !== filter.requiresAuth) {
      return false;
    }

    if (filter.validatedScoring !== undefined && questionnaire.metadata.validatedScoring !== filter.validatedScoring) {
      return false;
    }

    return true;
  }

  private calculateSearchScore(questionnaire: Questionnaire, query: string): number {
    const searchText = query.toLowerCase();
    let score = 0;

    // 搜索标题
    if (questionnaire.metadata.titleKey.toLowerCase().includes(searchText)) {
      score += 10;
    }

    // 搜索描述
    if (questionnaire.metadata.descriptionKey.toLowerCase().includes(searchText)) {
      score += 8;
    }

    // 搜索标签
    for (const tag of questionnaire.metadata.tags) {
      if (tag.toLowerCase().includes(searchText)) {
        score += 5;
      }
    }

    // 搜索问题文本
    for (const question of questionnaire.questions) {
      if (question.text.toLowerCase().includes(searchText)) {
        score += 3;
      }
    }

    return score;
  }

  private getMatchedFields(questionnaire: Questionnaire, query: string): string[] {
    const searchText = query.toLowerCase();
    const matchedFields: string[] = [];

    if (questionnaire.metadata.titleKey.toLowerCase().includes(searchText)) {
      matchedFields.push('title');
    }

    if (questionnaire.metadata.descriptionKey.toLowerCase().includes(searchText)) {
      matchedFields.push('description');
    }

    for (const tag of questionnaire.metadata.tags) {
      if (tag.toLowerCase().includes(searchText)) {
        matchedFields.push('tags');
        break;
      }
    }

    for (const question of questionnaire.questions) {
      if (question.text.toLowerCase().includes(searchText)) {
        matchedFields.push('questions');
        break;
      }
    }

    return matchedFields;
  }
}
