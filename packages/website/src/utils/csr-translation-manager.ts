/**
 * CSR (Client-Side Rendering) 翻译管理器
 *
 * 此管理器专门处理客户端组件的翻译加载、缓存和状态管理
 * 与SSG翻译系统分离，提供独立的客户端翻译解决方案
 */

import type { Language } from "@sunrain/shared";
import type {
  CSRTranslations,
  CSRTranslationConfig,
  TranslationLoadState,
} from "@/client-locales/shared/types";

/**
 * 翻译缓存条目接口
 */
interface CacheEntry {
  /** 翻译内容 */
  translations: CSRTranslations;
  /** 缓存时间戳 */
  timestamp: number;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: number;
}

/**
 * 加载Promise缓存
 */
interface LoadingPromise {
  /** 加载Promise */
  promise: Promise<CSRTranslations>;
  /** 开始时间 */
  startTime: number;
}

/**
 * CSR翻译管理器类
 */
export class CSRTranslationManager {
  private static instance: CSRTranslationManager;
  private translationCache = new Map<string, CacheEntry>();
  private loadingPromises = new Map<string, LoadingPromise>();
  private config: CSRTranslationConfig;
  private currentLanguage: Language = "en";
  private loadStates = new Map<string, TranslationLoadState>();

  /**
   * 私有构造函数，实现单例模式
   */
  private constructor(config?: Partial<CSRTranslationConfig>) {
    this.config = {
      supportedLanguages: ["en", "zh", "es", "ja", "ko", "hi", "ar"],
      defaultLanguage: "en",
      translationPath: "/client-locales",
      cache: {
        enabled: true,
        ttl: 30 * 60 * 1000, // 30分钟
        maxEntries: 50,
      },
      preload: {
        enabled: false, // 默认禁用自动预加载，改为按需预加载
        namespaces: ["assessment", "shared"],
        languages: ["en"], // 只预加载英文作为默认
      },
      ...config,
    };

    // 设置缓存清理定时器
    if (this.config.cache.enabled) {
      this.setupCacheCleanup();
    }

    // 不再自动初始化预加载，改为按需调用
  }

  /**
   * 获取单例实例
   */
  static getInstance(
    config?: Partial<CSRTranslationConfig>
  ): CSRTranslationManager {
    if (!CSRTranslationManager.instance) {
      CSRTranslationManager.instance = new CSRTranslationManager(config);
    }
    return CSRTranslationManager.instance;
  }

  /**
   * 设置当前语言
   */
  setCurrentLanguage(language: Language): void {
    if (this.config.supportedLanguages.includes(language)) {
      const previousLanguage = this.currentLanguage;
      this.currentLanguage = language;

      // 记录语言使用历史
      this.recordLanguageUsage(language);

      // 当语言改变时，清除其他语言的预加载缓存，避免混乱
      if (previousLanguage !== language) {
        this.clearOtherLanguageCaches(language);
      }
    } else {
      console.warn(
        `Unsupported language: ${language}, falling back to ${this.config.defaultLanguage}`
      );
      this.currentLanguage = this.config.defaultLanguage;
    }
  }

  /**
   * 记录语言使用历史
   */
  private recordLanguageUsage(language: Language): void {
    if (typeof window === "undefined") return;

    try {
      const storage = window.localStorage;
      const key = "previous-languages";
      const existing = storage?.getItem(key);

      let languages: Language[] = [];
      if (existing) {
        languages = JSON.parse(existing);
      }

      // 将当前语言移到最前面
      languages = languages.filter((lang) => lang !== language);
      languages.unshift(language);

      // 只保留最近的3种语言
      languages = languages.slice(0, 3);

      storage?.setItem(key, JSON.stringify(languages));
    } catch (error) {
      // 忽略存储错误
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 加载翻译内容
   */
  async loadTranslations(
    namespace: string,
    language?: Language
  ): Promise<CSRTranslations> {
    const targetLanguage = language || this.currentLanguage;
    const cacheKey = `${namespace}:${targetLanguage}`;

    // 更新加载状态
    this.updateLoadState(cacheKey, { loading: true, loaded: false });

    try {
      // 检查缓存
      if (this.config.cache.enabled) {
        const cached = this.getCachedTranslation(cacheKey);
        if (cached) {
          this.updateLoadState(cacheKey, { loading: false, loaded: true });
          return cached;
        }
      }

      // 检查是否正在加载
      const existingPromise = this.loadingPromises.get(cacheKey);
      if (existingPromise) {
        // 检查是否超时
        const elapsed = Date.now() - existingPromise.startTime;
        if (elapsed < 10000) {
          // 10秒超时
          return await existingPromise.promise;
        } else {
          // 清除超时的Promise
          this.loadingPromises.delete(cacheKey);
        }
      }

      // 创建新的加载Promise
      const loadingPromise = this.performLoad(namespace, targetLanguage);
      this.loadingPromises.set(cacheKey, {
        promise: loadingPromise,
        startTime: Date.now(),
      });

      try {
        const result = await loadingPromise;
        this.updateLoadState(cacheKey, { loading: false, loaded: true });
        return result;
      } finally {
        this.loadingPromises.delete(cacheKey);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.updateLoadState(cacheKey, {
        loading: false,
        loaded: false,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 执行实际的翻译加载
   */
  private async performLoad(
    namespace: string,
    language: Language
  ): Promise<CSRTranslations> {
    const cacheKey = `${namespace}:${language}`;

    try {
      // 使用显式的动态导入映射，让构建工具能够分析依赖
      const moduleMap: Record<string, () => Promise<any>> = {
        "assessment:en": () => import("../client-locales/assessment/en"),
        "assessment:zh": () => import("../client-locales/assessment/zh"),
        "assessment:es": () => import("../client-locales/assessment/es"),
        "assessment:ja": () => import("../client-locales/assessment/ja"),
        "assessment:ko": () => import("../client-locales/assessment/ko"),
        "assessment:hi": () => import("../client-locales/assessment/hi"),
        "assessment:ar": () => import("../client-locales/assessment/ar"),
        "shared:en": () => import("../client-locales/shared/en"),
        "shared:zh": () => import("../client-locales/shared/zh"),
        "shared:es": () => import("../client-locales/shared/es"),
        "shared:ja": () => import("../client-locales/shared/ja"),
        "shared:ko": () => import("../client-locales/shared/ko"),
        "shared:hi": () => import("../client-locales/shared/hi"),
        "shared:ar": () => import("../client-locales/shared/ar"),
      };

      const moduleKey = `${namespace}:${language}`;
      const moduleLoader = moduleMap[moduleKey];

      if (!moduleLoader) {
        throw new Error(`No module loader found for: ${moduleKey}`);
      }

      const module = await moduleLoader();
      if (process.env.NODE_ENV === "development") {
        console.log(`Loading CSR translations for ${moduleKey}:`, module);
        console.log(`Available exports:`, Object.keys(module));
      }

      // 尝试多种导出方式
      let translations = module.default;

      if (!translations) {
        // 尝试命名导出
        const namedExportKey = `${namespace}${
          language.charAt(0).toUpperCase() + language.slice(1)
        }`;
        translations = module[namedExportKey];
        if (process.env.NODE_ENV === "development") {
          console.log(`Trying named export: ${namedExportKey}`, !!translations);
        }
      }

      if (!translations) {
        // 尝试其他可能的导出名称
        const possibleKeys = Object.keys(module).filter(
          (key) => key !== "default" && typeof module[key] === "object"
        );

        if (possibleKeys.length > 0) {
          translations = module[possibleKeys[0]];
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Using fallback export: ${possibleKeys[0]}`,
              !!translations
            );
          }
        }
      }

      if (!translations) {
        console.error(
          `Translation not found for ${moduleKey}. Available exports:`,
          Object.keys(module)
        );
        console.error(
          `Tried: default, ${namespace}${
            language.charAt(0).toUpperCase() + language.slice(1)
          }`
        );
        throw new Error(`Translation not found: ${namespace}:${language}`);
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          `Successfully loaded CSR translations for ${moduleKey}:`,
          Object.keys(translations)
        );
      }

      // 验证翻译结构（仅警告，不阻止加载）
      try {
        this.validateTranslations(translations, namespace, language);
      } catch (validationError) {
        console.warn(
          `Translation validation failed for ${moduleKey}:`,
          validationError
        );
        // 继续加载，不抛出错误
      }

      // 缓存翻译
      if (this.config.cache.enabled) {
        this.cacheTranslation(cacheKey, translations);
      }

      return translations;
    } catch (error) {
      console.error(`Failed to load CSR translations for ${cacheKey}:`, error);

      // 优雅降级：尝试加载默认语言
      if (language !== this.config.defaultLanguage) {
        console.warn(
          `Falling back to default language ${this.config.defaultLanguage} for ${namespace}`
        );
        try {
          return await this.performLoad(namespace, this.config.defaultLanguage);
        } catch (fallbackError) {
          console.error(
            `Failed to load fallback translations for ${namespace}:${this.config.defaultLanguage}`,
            fallbackError
          );
        }
      }

      throw error;
    }
  }

  /**
   * 验证翻译结构
   */
  private validateTranslations(
    translations: any,
    namespace: string,
    language: Language
  ): void {
    if (!translations || typeof translations !== "object") {
      throw new Error(
        `Invalid translation structure for ${namespace}:${language}`
      );
    }

    // 检查必需的客户端翻译结构
    if (!translations.client || typeof translations.client !== "object") {
      console.warn(`Missing client translations for ${namespace}:${language}`);
    }

    // 检查基本的翻译结构
    const requiredKeys = [
      "continue",
      "list",
      "progress",
      "validation",
      "execution",
    ];
    for (const key of requiredKeys) {
      if (!translations[key]) {
        console.warn(
          `Missing ${key} translations for ${namespace}:${language}`
        );
      }
    }
  }

  /**
   * 获取缓存的翻译
   */
  private getCachedTranslation(cacheKey: string): CSRTranslations | null {
    const entry = this.translationCache.get(cacheKey);
    if (!entry) return null;

    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > this.config.cache.ttl) {
      this.translationCache.delete(cacheKey);
      return null;
    }

    // 更新访问信息
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.translations;
  }

  /**
   * 缓存翻译
   */
  private cacheTranslation(
    cacheKey: string,
    translations: CSRTranslations
  ): void {
    // 检查缓存大小限制
    if (this.translationCache.size >= this.config.cache.maxEntries) {
      this.evictLeastRecentlyUsed();
    }

    const now = Date.now();
    this.translationCache.set(cacheKey, {
      translations,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    });
  }

  /**
   * 清除最少使用的缓存条目
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.translationCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.translationCache.delete(oldestKey);
    }
  }

  /**
   * 更新加载状态
   */
  private updateLoadState(
    cacheKey: string,
    state: Partial<TranslationLoadState>
  ): void {
    const currentState = this.loadStates.get(cacheKey) || {
      loading: false,
      loaded: false,
    };

    this.loadStates.set(cacheKey, { ...currentState, ...state });
  }

  /**
   * 获取加载状态
   */
  getLoadState(namespace: string, language?: Language): TranslationLoadState {
    const targetLanguage = language || this.currentLanguage;
    const cacheKey = `${namespace}:${targetLanguage}`;
    return (
      this.loadStates.get(cacheKey) || {
        loading: false,
        loaded: false,
      }
    );
  }

  /**
   * 智能预加载翻译 - 基于用户行为和偏好
   */
  async preloadTranslations(
    namespaces?: string[],
    languages?: Language[]
  ): Promise<void> {
    const targetNamespaces = namespaces || this.config.preload.namespaces;

    // 智能确定要预加载的语言
    const targetLanguages = languages || this.getSmartPreloadLanguages();

    const promises: Promise<void>[] = [];

    for (const namespace of targetNamespaces) {
      for (const language of targetLanguages) {
        // 避免重复加载已缓存的翻译
        const cacheKey = `${namespace}:${language}`;
        if (!this.translationCache.has(cacheKey)) {
          promises.push(
            this.loadTranslations(namespace, language)
              .then(() => {
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `Preloaded CSR translation: ${namespace}:${language}`
                  );
                }
              })
              .catch((error) => {
                console.warn(
                  `Failed to preload CSR translation ${namespace}:${language}`,
                  error
                );
              })
          );
        }
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * 获取智能预加载语言列表
   */
  private getSmartPreloadLanguages(): Language[] {
    const currentLang = this.getCurrentLanguage();
    const languages: Language[] = [currentLang];

    // 只在用户明确表示需要其他语言时才预加载
    // 例如：用户之前使用过其他语言，或者浏览器语言与当前语言不同
    if (typeof window !== "undefined") {
      const storage = window.localStorage;
      const previousLanguages = storage?.getItem("previous-languages");

      if (previousLanguages) {
        try {
          const prevLangs = JSON.parse(previousLanguages) as Language[];
          // 只预加载最近使用的1个其他语言
          const otherLang = prevLangs.find((lang) => lang !== currentLang);
          if (otherLang && this.config.supportedLanguages.includes(otherLang)) {
            languages.push(otherLang);
          }
        } catch (error) {
          // 忽略解析错误
        }
      }

      // 如果浏览器语言与当前语言不同，也预加载浏览器语言
      const browserLang = navigator.language.split("-")[0] as Language;
      if (
        browserLang !== currentLang &&
        this.config.supportedLanguages.includes(browserLang) &&
        !languages.includes(browserLang)
      ) {
        languages.push(browserLang);
      }
    }

    return languages.slice(0, 2); // 最多预加载2种语言
  }

  /**
   * 初始化预加载 - 只预加载当前语言，避免不必要的预加载
   */
  private async initializePreload(): Promise<void> {
    try {
      // 只预加载当前语言，避免显示其他语言的预加载信息
      const currentLang = this.getCurrentLanguage();
      await this.preloadTranslations(this.config.preload.namespaces, [
        currentLang,
      ]);

      if (process.env.NODE_ENV === "development") {
        console.log(`CSR translations preloaded for language: ${currentLang}`);
      }
    } catch (error) {
      console.warn("Failed to preload CSR translations:", error);
    }
  }

  /**
   * 格式化消息
   */
  formatMessage(template: string, params: Record<string, any> = {}): string {
    if (!template || typeof template !== "string") {
      return template || "";
    }

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取嵌套翻译值
   */
  getNestedValue<T extends CSRTranslations>(
    translations: T,
    keyPath: string
  ): string | undefined {
    const keys = keyPath.split(".");
    let current: any = translations;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return typeof current === "string" ? current : undefined;
  }

  /**
   * 获取翻译文本
   */
  async getText(
    namespace: string,
    keyPath: string,
    params?: Record<string, any>,
    language?: Language
  ): Promise<string> {
    try {
      const translations = await this.loadTranslations(namespace, language);
      const template = this.getNestedValue(translations, keyPath);

      if (!template) {
        console.warn(`Translation key not found: ${namespace}.${keyPath}`);
        return keyPath;
      }

      return this.formatMessage(template, params);
    } catch (error) {
      console.error(
        `Failed to get translation text: ${namespace}.${keyPath}`,
        error
      );
      return keyPath;
    }
  }

  /**
   * 清除其他语言的缓存，只保留当前语言
   */
  private clearOtherLanguageCaches(currentLanguage: Language): void {
    const keysToDelete: string[] = [];

    for (const key of this.translationCache.keys()) {
      if (!key.endsWith(`:${currentLanguage}`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.translationCache.delete(key);
      this.loadStates.delete(key);
    }

    if (process.env.NODE_ENV === "development" && keysToDelete.length > 0) {
      console.log(
        `Cleared ${keysToDelete.length} cached translations for other languages`
      );
    }
  }

  /**
   * 清除缓存
   */
  clearCache(namespace?: string, language?: Language): void {
    if (namespace && language) {
      // 清除特定翻译的缓存
      const cacheKey = `${namespace}:${language}`;
      this.translationCache.delete(cacheKey);
      this.loadStates.delete(cacheKey);
    } else if (namespace) {
      // 清除特定命名空间的所有缓存
      for (const key of this.translationCache.keys()) {
        if (key.startsWith(`${namespace}:`)) {
          this.translationCache.delete(key);
          this.loadStates.delete(key);
        }
      }
    } else {
      // 清除所有缓存
      this.translationCache.clear();
      this.loadStates.clear();
    }
  }

  /**
   * 设置缓存清理定时器
   */
  private setupCacheCleanup(): void {
    // 每10分钟清理一次过期缓存
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.translationCache.entries()) {
        if (now - entry.timestamp > this.config.cache.ttl) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        this.translationCache.delete(key);
        this.loadStates.delete(key);
      }

      if (expiredKeys.length > 0 && process.env.NODE_ENV === "development") {
        console.log(
          `Cleaned up ${expiredKeys.length} expired CSR translation cache entries`
        );
      }
    }, 10 * 60 * 1000); // 10分钟
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      timestamp: number;
      accessCount: number;
      lastAccessed: number;
    }>;
  } {
    const entries = Array.from(this.translationCache.entries()).map(
      ([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
      })
    );

    const totalAccess = entries.reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    const hitRate =
      totalAccess > 0 ? (totalAccess - entries.length) / totalAccess : 0;

    return {
      size: this.translationCache.size,
      maxSize: this.config.cache.maxEntries,
      hitRate: Math.round(hitRate * 100) / 100,
      entries,
    };
  }

  /**
   * 销毁管理器实例
   */
  destroy(): void {
    this.clearCache();
    this.loadingPromises.clear();
    CSRTranslationManager.instance = null as any;
  }
}

/**
 * 创建CSR翻译管理器实例的便捷函数
 */
export function createCSRTranslationManager(
  config?: Partial<CSRTranslationConfig>
): CSRTranslationManager {
  return CSRTranslationManager.getInstance(config);
}

/**
 * 获取默认的CSR翻译管理器实例
 */
export function getCSRTranslationManager(): CSRTranslationManager {
  return CSRTranslationManager.getInstance();
}
