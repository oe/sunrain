import type { Language } from '@sunrain/shared';
import { defaultLang, supportedLangs } from '@sunrain/shared';

// Translation cache interface for better type safety
interface TranslationCache {
  data: Record<string, any>;
  timestamp: number;
  version: string;
}

// Supported namespaces
export type SupportedNamespace = 'assessment' | 'common' | 'errors';

// Cache configuration
const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
const CACHE_VERSION = '1.0.0';
const MAX_CACHE_SIZE = 50; // Maximum number of cached translation sets

// Performance monitoring
interface PerformanceMetrics {
  loadTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
}

export class ClientI18n {
  private static instance: ClientI18n;
  private currentLanguage: Language = defaultLang;
  private translationCache = new Map<string, TranslationCache>();
  private loadingPromises = new Map<string, Promise<any>>();
  private performanceMetrics: PerformanceMetrics = {
    loadTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0
  };
  private eventListeners = new Set<(language: Language) => void>();

  static getInstance(): ClientI18n {
    if (!ClientI18n.instance) {
      ClientI18n.instance = new ClientI18n();
    }
    return ClientI18n.instance;
  }

  private constructor() {
    this.initializeLanguage();
    this.setupStorageListener();
  }

  private initializeLanguage() {
    if (typeof window === 'undefined') return;

    try {
      // 优先级：URL > localStorage > navigator > 默认
      const urlLang = this.getLanguageFromURL();
      const storedLang = this.getStoredLanguage();
      const browserLang = this.getBrowserLanguage();

      const detectedLang = urlLang || storedLang || browserLang || defaultLang;

      if (this.isValidLanguage(detectedLang)) {
        this.currentLanguage = detectedLang;
      } else {
        console.warn(`Invalid language detected: ${detectedLang}, falling back to ${defaultLang}`);
        this.currentLanguage = defaultLang;
      }
    } catch (error) {
      console.error('Failed to initialize language:', error);
      this.currentLanguage = defaultLang;
    }
  }

  private setupStorageListener() {
    if (typeof window === 'undefined') return;

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'preferred-language' && event.newValue) {
        const newLang = event.newValue as Language;
        if (this.isValidLanguage(newLang) && newLang !== this.currentLanguage) {
          this.setLanguage(newLang, false); // Don't update storage again
        }
      }
    });
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  isValidLanguage(lang: string): lang is Language {
    return supportedLangs.includes(lang as Language);
  }

  async loadTranslations(namespace: SupportedNamespace): Promise<Record<string, any>> {
    const cacheKey = `${this.currentLanguage}:${namespace}`;
    const startTime = performance.now();

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Check cache first
    const cached = this.getCachedTranslations(cacheKey);
    if (cached) {
      this.performanceMetrics.cacheHits++;
      return cached;
    }

    this.performanceMetrics.cacheMisses++;

    // Create loading promise
    const loadingPromise = this.performTranslationLoad(namespace, cacheKey, startTime);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  private async performTranslationLoad(
    namespace: SupportedNamespace,
    cacheKey: string,
    startTime: number
  ): Promise<Record<string, any>> {
    try {
      let translations: Record<string, any>;

      // Dynamic import with better error handling
      switch (namespace) {
        case 'assessment':
          translations = await this.loadAssessmentTranslations(this.currentLanguage);
          break;
        case 'common':
          translations = await this.loadCommonTranslations(this.currentLanguage);
          break;
        case 'errors':
          translations = await this.loadErrorTranslations(this.currentLanguage);
          break;
        default:
          throw new Error(`Unknown namespace: ${namespace}`);
      }

      // Cache the successful result
      this.setCachedTranslations(cacheKey, translations);

      // Update performance metrics
      this.performanceMetrics.loadTime += performance.now() - startTime;

      return translations;

    } catch (error) {
      console.error(`Failed to load translations for ${cacheKey}`, error);
      this.performanceMetrics.errors++;

      // Try fallback language
      return this.loadFallbackTranslations(namespace, cacheKey);
    }
  }

  private async loadAssessmentTranslations(lang: Language): Promise<Record<string, any>> {
    try {
      const module = await import(`@/locales/assessment/${lang}`);
      return this.extractTranslations(module);
    } catch (error) {
      throw new Error(`Failed to load assessment translations for ${lang}: ${error}`);
    }
  }

  private async loadCommonTranslations(lang: Language): Promise<Record<string, any>> {
    // Placeholder for common translations
    // In a real implementation, you would load from actual files
    return {};
  }

  private async loadErrorTranslations(lang: Language): Promise<Record<string, any>> {
    // Placeholder for error translations
    // In a real implementation, you would load from actual files
    return {
      networkError: lang === 'zh' ? '网络错误' : 'Network Error',
      loadingError: lang === 'zh' ? '加载失败' : 'Loading Failed',
      validationError: lang === 'zh' ? '验证错误' : 'Validation Error'
    };
  }

  private extractTranslations(module: any): Record<string, any> {
    // Handle different export formats
    if (module.default) {
      return module.default;
    }

    // Look for known export patterns
    const possibleExports = ['assessment', 'assessmentZh', 'assessmentEn'];
    for (const exportName of possibleExports) {
      if (module[exportName]) {
        return module[exportName];
      }
    }

    return module;
  }

  private async loadFallbackTranslations(
    namespace: SupportedNamespace,
    originalCacheKey: string
  ): Promise<Record<string, any>> {
    if (this.currentLanguage === defaultLang) {
      // Already using default language, return empty object
      return {};
    }

    const fallbackKey = `${defaultLang}:${namespace}`;

    // Check if fallback is already cached
    const cached = this.getCachedTranslations(fallbackKey);
    if (cached) {
      return cached;
    }

    try {
      let fallbackTranslations: Record<string, any>;

      switch (namespace) {
        case 'assessment':
          fallbackTranslations = await this.loadAssessmentTranslations(defaultLang);
          break;
        case 'common':
          fallbackTranslations = await this.loadCommonTranslations(defaultLang);
          break;
        case 'errors':
          fallbackTranslations = await this.loadErrorTranslations(defaultLang);
          break;
        default:
          return {};
      }

      this.setCachedTranslations(fallbackKey, fallbackTranslations);
      return fallbackTranslations;

    } catch (fallbackError) {
      console.error('Failed to load fallback translations', fallbackError);
      return {};
    }
  }

  private getCachedTranslations(cacheKey: string): Record<string, any> | null {
    const cached = this.translationCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > CACHE_EXPIRY_TIME) {
      this.translationCache.delete(cacheKey);
      return null;
    }

    // Check version compatibility
    if (cached.version !== CACHE_VERSION) {
      this.translationCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCachedTranslations(cacheKey: string, data: Record<string, any>) {
    // Implement LRU cache behavior
    if (this.translationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = this.translationCache.keys().next().value;
      if (firstKey) {
        this.translationCache.delete(firstKey);
      }
    }

    this.translationCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    });
  }

  setLanguage(language: Language, updateStorage: boolean = true) {
    if (!this.isValidLanguage(language)) {
      console.warn(`Invalid language: ${language}`);
      return;
    }

    if (language === this.currentLanguage) {
      return; // No change needed
    }

    const previousLanguage = this.currentLanguage;
    this.currentLanguage = language;

    if (updateStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem('preferred-language', language);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }

    // Notify listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(language);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    });

    // Optionally clear cache for old language to save memory
    this.clearLanguageCache(previousLanguage);
  }

  private clearLanguageCache(language: Language) {
    const keysToDelete: string[] = [];

    for (const [key] of this.translationCache) {
      if (key.startsWith(`${language}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.translationCache.delete(key));
  }

  // Event listener management
  onLanguageChange(listener: (language: Language) => void): () => void {
    this.eventListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  private getLanguageFromURL(): Language | null {
    if (typeof window === 'undefined') return null;

    try {
      const path = window.location.pathname;
      const langMatch = path.match(/^\/([a-z]{2})\//);
      return langMatch ? langMatch[1] as Language : null;
    } catch (error) {
      console.error('Error parsing language from URL:', error);
      return null;
    }
  }

  private getStoredLanguage(): Language | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem('preferred-language');
      return stored as Language | null;
    } catch (error) {
      console.error('Error reading stored language:', error);
      return null;
    }
  }

  private getBrowserLanguage(): Language | null {
    if (typeof window === 'undefined') return null;

    try {
      const browserLang = navigator.language.split('-')[0];
      return browserLang as Language;
    } catch (error) {
      console.error('Error detecting browser language:', error);
      return null;
    }
  }

  // Enhanced formatting methods
  formatMessage(template: string, params: Record<string, any> = {}): string {
    if (!template) return '';

    try {
      return template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          return String(value);
        }
        return match;
      });
    } catch (error) {
      console.error('Error formatting message:', error);
      return template;
    }
  }

  // Enhanced date formatting with more options
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    const formatOptions = { ...defaultOptions, ...options };

    try {
      return new Intl.DateTimeFormat(this.getLocaleCode(), formatOptions).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toISOString();
    }
  }

  // Enhanced number formatting
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    if (typeof number !== 'number' || isNaN(number)) {
      return '';
    }

    try {
      return new Intl.NumberFormat(this.getLocaleCode(), options).format(number);
    } catch (error) {
      console.error('Error formatting number:', error);
      return String(number);
    }
  }

  // Currency formatting
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return this.formatNumber(amount, {
      style: 'currency',
      currency: currency
    });
  }

  // Percentage formatting
  formatPercentage(value: number, decimals: number = 1): string {
    return this.formatNumber(value / 100, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // Relative time formatting
  formatRelativeTime(date: Date): string {
    if (!date || !(date instanceof Date)) {
      return '';
    }

    try {
      const rtf = new Intl.RelativeTimeFormat(this.getLocaleCode(), { numeric: 'auto' });
      const now = new Date();
      const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(diffInSeconds, 'second');
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return this.formatDate(date);
    }
  }

  private getLocaleCode(): string {
    const localeMap: Record<Language, string> = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'es': 'es-ES',
      'ar': 'ar-SA',
      'hi': 'hi-IN'
    };

    return localeMap[this.currentLanguage] || 'en-US';
  }

  // Cache management methods
  clearCache(): void {
    this.translationCache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    return this.translationCache.size;
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      loadTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };
  }

  // Debug methods
  getCacheKeys(): string[] {
    return Array.from(this.translationCache.keys());
  }

  getCacheInfo(): Array<{ key: string; timestamp: number; version: string }> {
    return Array.from(this.translationCache.entries()).map(([key, cache]) => ({
      key,
      timestamp: cache.timestamp,
      version: cache.version
    }));
  }
}

// Export singleton instance
export const clientI18n = ClientI18n.getInstance();

// Export utility functions for convenience
export const formatMessage = (template: string, params?: Record<string, any>) =>
  clientI18n.formatMessage(template, params);

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) =>
  clientI18n.formatDate(date, options);

export const formatNumber = (number: number, options?: Intl.NumberFormatOptions) =>
  clientI18n.formatNumber(number, options);

export const formatCurrency = (amount: number, currency?: string) =>
  clientI18n.formatCurrency(amount, currency);

export const formatPercentage = (value: number, decimals?: number) =>
  clientI18n.formatPercentage(value, decimals);

export const formatRelativeTime = (date: Date) =>
  clientI18n.formatRelativeTime(date);
