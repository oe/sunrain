import { ResourceItem } from '@sunrain/shared';
import { logger } from '../logger.js';

export interface TranslationConfig {
  supportedLanguages: string[];
  defaultLanguage: string;
  translationService?: 'google' | 'deepl' | 'manual';
  apiKey?: string;
}

export interface MultiLanguageResource {
  [languageCode: string]: {
    title: string;
    description: string;
    items: ResourceItem[];
  };
}

export class ContentTranslator {
  constructor(private config: TranslationConfig) {}

  async translateResourceCollection(
    resources: ResourceItem[],
    collectionTitle: string,
    collectionDescription: string
  ): Promise<MultiLanguageResource> {
    logger.info('Starting multi-language content translation...');

    const multiLangResource: MultiLanguageResource = {};

    for (const lang of this.config.supportedLanguages) {
      logger.info(`Processing language: ${lang}`);

      if (lang === this.config.defaultLanguage) {
        // 默认语言直接使用原始内容
        multiLangResource[lang] = {
          title: collectionTitle,
          description: collectionDescription,
          items: resources
        };
      } else {
        // 其他语言需要翻译
        multiLangResource[lang] = await this.translateToLanguage(
          resources,
          collectionTitle,
          collectionDescription,
          lang
        );
      }
    }

    logger.info(`Multi-language translation completed for ${this.config.supportedLanguages.length} languages`);
    return multiLangResource;
  }

  private async translateToLanguage(
    resources: ResourceItem[],
    collectionTitle: string,
    collectionDescription: string,
    targetLang: string
  ): Promise<{ title: string; description: string; items: ResourceItem[] }> {
    // 翻译集合标题和描述
    const translatedTitle = await this.translateText(collectionTitle, targetLang);
    const translatedDescription = await this.translateText(collectionDescription, targetLang);

    // 翻译每个资源项
    const translatedItems: ResourceItem[] = [];

    for (const item of resources) {
      const translatedItem = await this.translateResourceItem(item, targetLang);
      translatedItems.push(translatedItem);
    }

    return {
      title: translatedTitle,
      description: translatedDescription,
      items: translatedItems
    };
  }

  private async translateResourceItem(item: ResourceItem, targetLang: string): Promise<ResourceItem> {
    const translatedItem: ResourceItem = { ...item };

    // 翻译主要字段
    translatedItem.title = await this.translateText(item.title, targetLang);
    translatedItem.description = await this.translateText(item.description, targetLang);

    // 翻译数组字段
    if (item.themes) {
      translatedItem.themes = await Promise.all(
        item.themes.map(theme => this.translateText(theme, targetLang))
      );
    }

    if (item.benefits) {
      translatedItem.benefits = await Promise.all(
        item.benefits.map(benefit => this.translateText(benefit, targetLang))
      );
    }

    // 某些字段可能需要特殊处理
    if (item.genre) {
      translatedItem.genre = await this.translateText(item.genre, targetLang);
    }

    return translatedItem;
  }

  private async translateText(text: string, targetLang: string): Promise<string> {
    // 如果是默认语言或文本为空，直接返回
    if (targetLang === this.config.defaultLanguage || !text || !text.trim()) {
      return text || '';
    }

    try {
      switch (this.config.translationService) {
        case 'google':
          return await this.translateWithGoogle(text, targetLang);
        case 'deepl':
          return await this.translateWithDeepL(text, targetLang);
        case 'manual':
        default:
          return await this.translateManually(text, targetLang);
      }
    } catch (error) {
      logger.warn(`Translation failed for "${text}" to ${targetLang}`, { error });
      return text; // 翻译失败时返回原文
    }
  }

  private async translateWithGoogle(text: string, targetLang: string): Promise<string> {
    // Google Translate API 集成
    // 这里需要实际的API调用
    logger.debug(`Google Translate: "${text}" -> ${targetLang}`);
    
    // 模拟翻译延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 返回模拟翻译结果
    return this.getMockTranslation(text, targetLang);
  }

  private async translateWithDeepL(text: string, targetLang: string): Promise<string> {
    // DeepL API 集成
    logger.debug(`DeepL Translate: "${text}" -> ${targetLang}`);
    
    // 模拟翻译延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 返回模拟翻译结果
    return this.getMockTranslation(text, targetLang);
  }

  private async translateManually(text: string, targetLang: string): Promise<string> {
    // 手动翻译映射
    const translations = this.getManualTranslations();
    
    const key = `${text.toLowerCase()}_${targetLang}`;
    const translation = translations[key];
    
    if (translation) {
      logger.debug(`Manual translation found: "${text}" -> "${translation}"`);
      return translation;
    }

    // 如果没有手动翻译，返回原文
    logger.debug(`No manual translation found for: "${text}" (${targetLang})`);
    return text;
  }

  private getMockTranslation(text: string, targetLang: string): string {
    // 简单的模拟翻译逻辑
    const mockTranslations: { [key: string]: { [lang: string]: string } } = {
      'mental health books': {
        'zh': '心理健康书籍',
        'es': 'Libros de Salud Mental',
        'fr': 'Livres de Santé Mentale'
      },
      'healing music': {
        'zh': '治愈音乐',
        'es': 'Música Curativa',
        'fr': 'Musique de Guérison'
      },
      'therapeutic movies': {
        'zh': '治疗电影',
        'es': 'Películas Terapéuticas',
        'fr': 'Films Thérapeutiques'
      },
      'anxiety': {
        'zh': '焦虑',
        'es': 'ansiedad',
        'fr': 'anxiété'
      },
      'depression': {
        'zh': '抑郁',
        'es': 'depresión',
        'fr': 'dépression'
      },
      'meditation': {
        'zh': '冥想',
        'es': 'meditación',
        'fr': 'méditation'
      },
      'therapy': {
        'zh': '治疗',
        'es': 'terapia',
        'fr': 'thérapie'
      },
      'stress reduction': {
        'zh': '压力缓解',
        'es': 'reducción del estrés',
        'fr': 'réduction du stress'
      },
      'emotional healing': {
        'zh': '情感治愈',
        'es': 'sanación emocional',
        'fr': 'guérison émotionnelle'
      }
    };

    const lowerText = text.toLowerCase();
    if (mockTranslations[lowerText] && mockTranslations[lowerText][targetLang]) {
      return mockTranslations[lowerText][targetLang];
    }

    // 如果没有找到翻译，返回原文加语言标识
    return `${text} [${targetLang}]`;
  }

  private getManualTranslations(): { [key: string]: string } {
    // 手动翻译映射表
    return {
      // 中文翻译
      'mental health books_zh': '心理健康书籍',
      'healing music_zh': '治愈音乐',
      'therapeutic movies_zh': '治疗电影',
      'a curated collection of books focused on mental health, psychology, and personal wellness._zh': '精心挑选的心理健康、心理学和个人健康书籍合集。',
      'music playlists and tracks designed for relaxation, meditation, and emotional healing._zh': '专为放松、冥想和情感治愈设计的音乐播放列表和曲目。',
      'movies that explore mental health themes and can provide therapeutic value._zh': '探索心理健康主题并具有治疗价值的电影。',
      
      // 西班牙语翻译
      'mental health books_es': 'Libros de Salud Mental',
      'healing music_es': 'Música Curativa',
      'therapeutic movies_es': 'Películas Terapéuticas',
      
      // 法语翻译
      'mental health books_fr': 'Livres de Santé Mentale',
      'healing music_fr': 'Musique de Guérison',
      'therapeutic movies_fr': 'Films Thérapeutiques'
    };
  }

  // 检查翻译完整性
  async validateTranslations(multiLangResource: MultiLanguageResource): Promise<{
    isComplete: boolean;
    missingTranslations: string[];
    report: { [lang: string]: { translated: number; total: number } };
  }> {
    logger.info('Validating translation completeness...');

    const missingTranslations: string[] = [];
    const report: { [lang: string]: { translated: number; total: number } } = {};

    const defaultLang = this.config.defaultLanguage;
    const defaultResource = multiLangResource[defaultLang];

    if (!defaultResource) {
      throw new Error(`Default language resource not found: ${defaultLang}`);
    }

    for (const lang of this.config.supportedLanguages) {
      if (lang === defaultLang) continue;

      const langResource = multiLangResource[lang];
      if (!langResource) {
        missingTranslations.push(`Missing entire language resource: ${lang}`);
        continue;
      }

      let translated = 0;
      let total = 0;

      // 检查集合标题和描述
      total += 2;
      if (langResource.title !== defaultResource.title) translated++;
      if (langResource.description !== defaultResource.description) translated++;

      // 检查每个资源项
      for (let i = 0; i < defaultResource.items.length; i++) {
        const defaultItem = defaultResource.items[i];
        const langItem = langResource.items[i];

        if (!langItem) {
          missingTranslations.push(`Missing item ${defaultItem.id} in ${lang}`);
          continue;
        }

        // 检查主要字段
        total += 2;
        if (langItem.title !== defaultItem.title) translated++;
        if (langItem.description !== defaultItem.description) translated++;

        // 检查数组字段
        if (defaultItem.themes) {
          total += defaultItem.themes.length;
          if (langItem.themes) {
            translated += langItem.themes.filter((theme, idx) => 
              theme !== defaultItem.themes![idx]
            ).length;
          }
        }

        if (defaultItem.benefits) {
          total += defaultItem.benefits.length;
          if (langItem.benefits) {
            translated += langItem.benefits.filter((benefit, idx) => 
              benefit !== defaultItem.benefits![idx]
            ).length;
          }
        }
      }

      report[lang] = { translated, total };
    }

    const isComplete = missingTranslations.length === 0;

    logger.info('Translation validation completed', {
      isComplete,
      missingCount: missingTranslations.length,
      languages: Object.keys(report).length
    });

    return {
      isComplete,
      missingTranslations,
      report
    };
  }
}