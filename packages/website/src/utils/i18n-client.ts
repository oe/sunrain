import type { Language } from '@sunrain/shared';

export class ClientI18n {
  private static instance: ClientI18n;
  private currentLanguage: Language = 'zh';
  private translationCache = new Map<string, any>();

  static getInstance(): ClientI18n {
    if (!ClientI18n.instance) {
      ClientI18n.instance = new ClientI18n();
    }
    return ClientI18n.instance;
  }

  private constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    if (typeof window === 'undefined') return;

    // 优先级：URL > localStorage > navigator > 默认
    const urlLang = this.getLanguageFromURL();
    const storedLang = localStorage.getItem('preferred-language') as Language;
    const browserLang = navigator.language.split('-')[0] as Language;

    this.currentLanguage = urlLang || storedLang || browserLang || 'zh';
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  async loadTranslations(namespace: string): Promise<any> {
    const cacheKey = `${this.currentLanguage}:${namespace}`;

    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    try {
      let translations;

      // 动态导入翻译文件
      switch (namespace) {
        case 'assessment':
          const assessmentModule = await import(`@/locales/assessment/${this.currentLanguage}.ts`);
          translations = assessmentModule.default || assessmentModule;
          break;
        default:
          throw new Error(`Unknown namespace: ${namespace}`);
      }

      this.translationCache.set(cacheKey, translations);
      return translations;

    } catch (error) {
      console.error(`Failed to load translations for ${cacheKey}`, error);

      // 回退到中文
      if (this.currentLanguage !== 'zh') {
        const fallbackKey = `zh:${namespace}`;
        if (!this.translationCache.has(fallbackKey)) {
          try {
            const fallbackModule = await import(`@/locales/assessment/zh.ts`);
            const fallbackTranslations = fallbackModule.default || fallbackModule;
            this.translationCache.set(fallbackKey, fallbackTranslations);
            return fallbackTranslations;
          } catch (fallbackError) {
            console.error('Failed to load fallback translations', fallbackError);
          }
        }
        return this.translationCache.get(fallbackKey) || {};
      }

      return {};
    }
  }

  setLanguage(language: Language) {
    this.currentLanguage = language;
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
    }

    // 清除缓存以强制重新加载
    this.translationCache.clear();
  }

  private getLanguageFromURL(): Language | null {
    if (typeof window === 'undefined') return null;

    const path = window.location.pathname;
    const langMatch = path.match(/^\/([a-z]{2})\//);
    return langMatch ? langMatch[1] as Language : null;
  }

  // 格式化翻译文本
  formatMessage(template: string, params: Record<string, any> = {}): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  // 获取本地化的日期格式
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Intl.DateTimeFormat(this.getLocaleCode(), options).format(date);
  }

  // 获取本地化的数字格式
  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.getLocaleCode()).format(number);
  }

  private getLocaleCode(): string {
    const localeMap: Record<Language, string> = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'ar': 'ar-SA',
      'hi': 'hi-IN'
    };

    return localeMap[this.currentLanguage] || 'zh-CN';
  }
}

// 导出单例实例
export const clientI18n = ClientI18n.getInstance();