/**
 * 问卷翻译管理器
 *
 * 负责问卷内容的多语言支持，包括按需加载和回退机制
 */

import type { QuestionnaireTranslations, SupportedLocale } from './types';

export class QuestionnaireTranslationManager {
  private translationCache = new Map<string, QuestionnaireTranslations>();
  private loadingPromises = new Map<string, Promise<QuestionnaireTranslations>>();

  /**
   * 加载指定问卷的翻译内容
   */
  async loadTranslations(
    questionnaireId: string,
    locale: SupportedLocale
  ): Promise<QuestionnaireTranslations> {
    const cacheKey = `${questionnaireId}-${locale}`;

    // 检查缓存
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // 开始加载
    const loadingPromise = this.loadTranslationFile(questionnaireId, locale);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const translations = await loadingPromise;
      this.translationCache.set(cacheKey, translations);
      return translations;
    } catch (error) {
      console.warn(`Failed to load translations for ${questionnaireId} in ${locale}:`, error);
      // 回退到英文
      return this.fallbackToEnglish(questionnaireId);
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * 获取翻译内容
   */
  getTranslatedContent(
    questionnaireId: string,
    key: string,
    locale: SupportedLocale
  ): string {
    const cacheKey = `${questionnaireId}-${locale}`;
    const translations = this.translationCache.get(cacheKey);

    if (!translations) {
      console.warn(`Translations not loaded for ${questionnaireId} in ${locale}`);
      return key; // 返回键名作为回退
    }

    // 支持嵌套键访问，如 "questions.q1.text"
    const value = this.getNestedValue(translations, key);
    return value || key;
  }

  /**
   * 回退到英文翻译
   */
  async fallbackToEnglish(questionnaireId: string): Promise<QuestionnaireTranslations> {
    const cacheKey = `${questionnaireId}-en`;

    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    try {
      const translations = await this.loadTranslationFile(questionnaireId, 'en');
      this.translationCache.set(cacheKey, translations);
      return translations;
    } catch (error) {
      console.error(`Failed to load English fallback for ${questionnaireId}:`, error);
      // 返回默认的空翻译对象
      return this.getDefaultTranslations(questionnaireId);
    }
  }

  /**
   * 预加载常用语言的翻译
   */
  async preloadTranslations(questionnaireId: string, locales: SupportedLocale[] = ['en', 'zh']) {
    const promises = locales.map(locale =>
      this.loadTranslations(questionnaireId, locale).catch(error => {
        console.warn(`Failed to preload ${questionnaireId} for ${locale}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * 清除缓存
   */
  clearCache(questionnaireId?: string) {
    if (questionnaireId) {
      // 清除特定问卷的缓存
      for (const key of this.translationCache.keys()) {
        if (key.startsWith(`${questionnaireId}-`)) {
          this.translationCache.delete(key);
        }
      }
    } else {
      // 清除所有缓存
      this.translationCache.clear();
    }
  }

  /**
   * 加载翻译文件
   */
  private async loadTranslationFile(
    questionnaireId: string,
    locale: SupportedLocale
  ): Promise<QuestionnaireTranslations> {
    try {
      // 动态导入翻译文件
      const module = await import(`./${questionnaireId}/${locale}.ts`);
      return module.default || module;
    } catch (error) {
      throw new Error(`Translation file not found: ${questionnaireId}/${locale}.ts`);
    }
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 获取默认翻译对象
   */
  private getDefaultTranslations(questionnaireId: string): QuestionnaireTranslations {
    return {
      title: questionnaireId,
      description: 'Description not available',
      introduction: 'Introduction not available',
      purpose: 'Purpose not available',
      questions: {},
      interpretations: {},
      category: {
        name: 'Uncategorized',
        description: 'No category description available'
      }
    };
  }
}

// 导出单例实例
export const questionnaireTranslationManager = new QuestionnaireTranslationManager();
