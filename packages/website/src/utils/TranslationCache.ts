/**
 * 翻译文件缓存管理器
 * 专门用于缓存多语言翻译文件和优化国际化性能
 */

import { cacheManager, CacheManager } from '@/lib/assessment/CacheManager';
import { isClientSide, safeLocalStorage, getUserPreferredLanguages } from '@/utils/environment';

interface TranslationCacheConfig {
  translationTTL: number; // 翻译文件缓存时间
  maxLanguages: number; // 最大缓存语言数量
  preloadEnabled: boolean; // 是否启用预加载
  compressionEnabled: boolean; // 是否启用压缩
}

interface TranslationModule {
  [key: string]: any;
}

interface LanguageMetadata {
  version: string;
  lastModified: number;
  size: number;
  loadCount: number;
}

export class TranslationCache {
  private readonly config: TranslationCacheConfig = {
    translationTTL: 24 * 60 * 60 * 1000, // 24小时
    maxLanguages: 10, // 最多缓存10种语言
    preloadEnabled: true,
    compressionEnabled: true
  };

  private static instance: TranslationCache;
  private cache: CacheManager;
  private languageMetadata = new Map<string, LanguageMetadata>();
  private loadingPromises = new Map<string, Promise<any>>();
  private constructor() {
    this.cache = cacheManager;

    if (isClientSide()) {
      this.initializeCache();
    }
  }

  public static getInstance(): TranslationCache {
    if (!TranslationCache.instance) {
      TranslationCache.instance = new TranslationCache();
    }
    return TranslationCache.instance;
  }

  /**
   * 获取翻译模块
   */
  public async getTranslations(namespace: string, language: string): Promise<TranslationModule | null> {
    const cacheKey = this.getTranslationKey(namespace, language);

    // 先尝试从缓存获取
    const cached = this.cache.get<TranslationModule>(cacheKey);
    if (cached) {
      this.updateLanguageMetadata(language, 'hit');
      return cached;
    }

    // 检查是否正在加载
    const loadingKey = `${namespace}:${language}`;
    if (this.loadingPromises.has(loadingKey)) {
      return await this.loadingPromises.get(loadingKey)!;
    }

    // 异步加载翻译文件
    const loadingPromise = this.loadTranslationModule(namespace, language);
    this.loadingPromises.set(loadingKey, loadingPromise);

    try {
      const translations = await loadingPromise;

      if (translations) {
        // 缓存翻译数据
        this.cache.set(cacheKey, translations, this.config.translationTTL);
        this.updateLanguageMetadata(language, 'loaded', translations);
      }

      return translations;
    } finally {
      this.loadingPromises.delete(loadingKey);
    }
  }

  /**
   * 预加载翻译文件
   */
  public async preloadTranslations(namespaces: string[], languages: string[]): Promise<void> {
    if (!this.config.preloadEnabled) return;

    const preloadTasks: Promise<void>[] = [];

    for (const namespace of namespaces) {
      for (const language of languages) {
        const cacheKey = this.getTranslationKey(namespace, language);

        // 只预加载未缓存的翻译
        if (!this.cache.has(cacheKey)) {
          preloadTasks.push(
            this.getTranslations(namespace, language).then(() => {
              console.log(`Preloaded translations: ${namespace}:${language}`);
            }).catch(error => {
              console.warn(`Failed to preload ${namespace}:${language}:`, error);
            })
          );
        }
      }
    }

    // 限制并发数量
    const batchSize = 3;
    for (let i = 0; i < preloadTasks.length; i += batchSize) {
      const batch = preloadTasks.slice(i, i + batchSize);
      await Promise.allSettled(batch);

      // 添加小延迟避免阻塞主线程
      if (i + batchSize < preloadTasks.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  /**
   * 智能预加载 - 基于用户语言偏好
   */
  public async smartPreload(): Promise<void> {
    try {
      // 获取用户偏好语言
      const userLanguages = this.getUserPreferredLanguages();

      // 获取常用命名空间
      const commonNamespaces = ['shared', 'assessment', 'home'];

      // 预加载用户可能需要的翻译
      await this.preloadTranslations(commonNamespaces, userLanguages.slice(0, 3));

    } catch (error) {
      console.warn('Smart preload failed:', error);
    }
  }

  /**
   * 缓存翻译片段（用于动态内容）
   */
  public cacheTranslationFragment(key: string, language: string, translation: string): void {
    const cacheKey = this.getFragmentKey(key, language);
    this.cache.set(cacheKey, translation, this.config.translationTTL);
  }

  /**
   * 获取翻译片段
   */
  public getTranslationFragment(key: string, language: string): string | null {
    const cacheKey = this.getFragmentKey(key, language);
    return this.cache.get<string>(cacheKey);
  }

  /**
   * 批量缓存翻译片段
   */
  public cacheTranslationFragments(fragments: Record<string, string>, language: string): void {
    Object.entries(fragments).forEach(([key, translation]) => {
      this.cacheTranslationFragment(key, language, translation);
    });
  }

  /**
   * 清理特定语言的缓存
   */
  public clearLanguageCache(language: string): void {
    // 这里需要遍历所有缓存键，找到匹配的语言缓存
    // 实际实现中可能需要维护一个语言到缓存键的映射
    console.log(`Clearing cache for language: ${language}`);

    // 清理语言元数据
    this.languageMetadata.delete(language);
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): {
    cachedLanguages: string[];
    totalTranslations: number;
    cacheHitRate: number;
    languageMetadata: Record<string, LanguageMetadata>;
  } {
    const stats = this.cache.getStats();

    return {
      cachedLanguages: Array.from(this.languageMetadata.keys()),
      totalTranslations: stats.entryCount,
      cacheHitRate: stats.hitRate,
      languageMetadata: Object.fromEntries(this.languageMetadata)
    };
  }

  /**
   * 优化缓存 - 清理不常用的语言
   */
  public optimizeCache(): void {
    const languages = Array.from(this.languageMetadata.entries())
      .sort(([, a], [, b]) => a.loadCount - b.loadCount);

    // 如果缓存的语言数量超过限制，清理最不常用的
    if (languages.length > this.config.maxLanguages) {
      const toRemove = languages.slice(0, languages.length - this.config.maxLanguages);

      toRemove.forEach(([language]) => {
        this.clearLanguageCache(language);
        console.log(`Removed unused language cache: ${language}`);
      });
    }
  }

  /**
   * 检查翻译文件是否需要更新
   */
  public async checkForUpdates(namespace: string, language: string): Promise<boolean> {
    try {
      const metadata = this.languageMetadata.get(language);
      if (!metadata) return true;

      // 这里可以实现版本检查逻辑
      // 例如检查远程文件的最后修改时间或版本号

      return false; // 暂时返回false，表示不需要更新
    } catch (error) {
      console.warn('Failed to check for updates:', error);
      return false;
    }
  }

  /**
   * 初始化缓存
   */
  private initializeCache(): void {
    // 恢复语言元数据
    try {
      const storage = safeLocalStorage();
      if (storage) {
        const savedMetadata = storage.getItem('translation_metadata');
        if (savedMetadata) {
          const metadata = JSON.parse(savedMetadata);
          this.languageMetadata = new Map(Object.entries(metadata));
        }
      }
    } catch (error) {
      console.warn('Failed to restore translation metadata:', error);
    }

    // 页面卸载时保存元数据
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveMetadata();
      });
    }

    // 定期优化缓存
    setInterval(() => {
      this.optimizeCache();
    }, 30 * 60 * 1000); // 每30分钟优化一次
  }

  /**
   * 加载翻译模块
   */
  private async loadTranslationModule(namespace: string, language: string): Promise<TranslationModule | null> {
    try {
      // 使用显式的动态导入映射，让Vite能够分析依赖
      const moduleMap: Record<string, () => Promise<any>> = {
        'shared:en': () => import('@/locales/shared/en'),
        'shared:zh': () => import('@/locales/shared/zh'),
        'shared:es': () => import('@/locales/shared/es'),
        'shared:ar': () => import('@/locales/shared/ar'),
        'shared:hi': () => import('@/locales/shared/hi'),
        'shared:ja': () => import('@/locales/shared/ja'),
        'shared:ko': () => import('@/locales/shared/ko'),
        'assessment:en': () => import('@/locales/assessment/en'),
        'assessment:zh': () => import('@/locales/assessment/zh'),
        'assessment:es': () => import('@/locales/assessment/es'),
        'assessment:ar': () => import('@/locales/assessment/ar'),
        'assessment:hi': () => import('@/locales/assessment/hi'),
        'assessment:ja': () => import('@/locales/assessment/ja'),
        'assessment:ko': () => import('@/locales/assessment/ko'),
        'home:en': () => import('@/locales/home/en'),
        'home:zh': () => import('@/locales/home/zh'),
        'home:es': () => import('@/locales/home/es'),
        'home:ar': () => import('@/locales/home/ar'),
        'home:hi': () => import('@/locales/home/hi'),
        'home:ja': () => import('@/locales/home/ja'),
        'home:ko': () => import('@/locales/home/ko'),
        'resources:en': () => import('@/locales/resources/en'),
        'resources:zh': () => import('@/locales/resources/zh'),
        'resources:es': () => import('@/locales/resources/es'),
        'resources:ar': () => import('@/locales/resources/ar'),
        'resources:hi': () => import('@/locales/resources/hi'),
        'resources:ja': () => import('@/locales/resources/ja'),
        'resources:ko': () => import('@/locales/resources/ko'),
        'guide:en': () => import('@/locales/guide/en'),
        'guide:zh': () => import('@/locales/guide/zh'),
        'guide:es': () => import('@/locales/guide/es'),
        'guide:ar': () => import('@/locales/guide/ar'),
        'guide:hi': () => import('@/locales/guide/hi'),
        'guide:ja': () => import('@/locales/guide/ja'),
        'guide:ko': () => import('@/locales/guide/ko'),
      };

      const moduleKey = `${namespace}:${language}`;
      const moduleLoader = moduleMap[moduleKey];

      if (moduleLoader) {
        const module = await moduleLoader();
        return module.default || module;
      }

      // 如果没有找到对应的模块，尝试加载英文作为回退
      if (language !== 'en') {
        const fallbackKey = `${namespace}:en`;
        const fallbackLoader = moduleMap[fallbackKey];
        if (fallbackLoader) {
          const fallbackModule = await fallbackLoader();
          return fallbackModule.default || fallbackModule;
        }
      }

      throw new Error(`Translation module not found: ${moduleKey}`);
    } catch (error) {
      console.warn(`Failed to load translation module ${namespace}:${language}:`, error);
      return null;
    }
  }

  /**
   * 获取用户偏好语言列表
   */
  private getUserPreferredLanguages(): string[] {
    return getUserPreferredLanguages();
  }

  /**
   * 更新语言元数据
   */
  private updateLanguageMetadata(language: string, action: 'hit' | 'loaded', data?: any): void {
    const existing = this.languageMetadata.get(language) || {
      version: '1.0',
      lastModified: Date.now(),
      size: 0,
      loadCount: 0
    };

    if (action === 'hit') {
      existing.loadCount++;
    } else if (action === 'loaded' && data) {
      existing.lastModified = Date.now();
      existing.size = JSON.stringify(data).length;
      existing.loadCount++;
    }

    this.languageMetadata.set(language, existing);
  }

  /**
   * 保存元数据到 localStorage
   */
  private saveMetadata(): void {
    const storage = safeLocalStorage();
    if (!storage) {
      return;
    }

    try {
      const metadata = Object.fromEntries(this.languageMetadata);
      storage.setItem('translation_metadata', JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to save translation metadata:', error);
    }
  }

  /**
   * 生成翻译缓存键
   */
  private getTranslationKey(namespace: string, language: string): string {
    return CacheManager.getCacheKey('translation', namespace, undefined, language);
  }

  /**
   * 生成翻译片段缓存键
   */
  private getFragmentKey(key: string, language: string): string {
    return CacheManager.getCacheKey('translation_fragment', key, undefined, language);
  }
}

// 导出单例实例
export const translationCache = TranslationCache.getInstance();
