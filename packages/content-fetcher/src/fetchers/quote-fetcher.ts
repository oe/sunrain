import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, Logger, ContentFetcherConfig } from '@sunrain/shared';
import { logger } from '../logger.js';

/**
 * Quote-specific interfaces
 */
export interface Quote extends ResourceItem {
  text: string;
  author?: string;
  source?: string;
  category: QuoteCategory;
  mood: MoodCategory;
  therapeuticBenefit: string[];
  targetAudience: string[];
  shareCount: number;
  viewCount: number;
  backgroundImage?: string;
  audioUrl?: string;
}

export type QuoteCategory = 'motivation' | 'healing' | 'mindfulness' | 'self-love' | 'resilience' | 'hope' | 'wisdom' | 'gratitude';

export type MoodCategory = 'anxiety' | 'depression' | 'stress' | 'relaxation' | 'motivation' | 'sleep' | 'focus' | 'healing';

export interface QuoteSource {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit: number;
  categories: QuoteCategory[];
}

export interface QuoteQualityMetrics {
  positiveScore: number;
  mentalHealthRelevance: number;
  appropriateLength: boolean;
  culturalSensitivity: number;
  overallScore: number;
}

/**
 * QuoteFetcher - 专门抓取心理健康相关语录的系统
 */
export class QuoteFetcher extends BaseContentFetcher {
  private quoteSources: QuoteSource[];
  private readonly MIN_QUALITY_SCORE = 0.7;
  private readonly MAX_QUOTE_LENGTH = 280;
  private readonly MIN_QUOTE_LENGTH = 10;

  constructor(config: ContentFetcherConfig, logger: Logger) {
    super(config, logger);
    this.quoteSources = this.initializeQuoteSources();
  }

  /**
   * 初始化语录源配置
   */
  private initializeQuoteSources(): QuoteSource[] {
    return [
      {
        name: 'goodreads',
        baseUrl: 'https://www.goodreads.com/quotes',
        rateLimit: 100,
        categories: ['wisdom', 'motivation', 'healing']
      },
      {
        name: 'brainyquote',
        baseUrl: 'https://www.brainyquote.com',
        rateLimit: 50,
        categories: ['motivation', 'hope', 'resilience']
      },
      {
        name: 'quotegarden',
        baseUrl: 'https://www.quotegarden.com',
        rateLimit: 30,
        categories: ['healing', 'mindfulness', 'self-love']
      },
      {
        name: 'zenquotes',
        baseUrl: 'https://zenquotes.io/api',
        apiKey: process.env.ZENQUOTES_API_KEY,
        rateLimit: 100,
        categories: ['mindfulness', 'wisdom', 'gratitude']
      }
    ];
  }

  /**
   * 主要的语录抓取方法
   */
  async fetchQuotes(): Promise<Quote[]> {
    this.logger.info('开始抓取心理健康语录...');

    const allQuotes: Quote[] = [];

    for (const source of this.quoteSources) {
      try {
        this.logger.info(`从 ${source.name} 抓取语录...`);
        const quotes = await this.fetchFromSource(source);
        allQuotes.push(...quotes);

        // 遵守速率限制
        await this.delay(1000 / source.rateLimit * 1000);
      } catch (error) {
        this.logger.error(`从 ${source.name} 抓取语录失败:`, error);
      }
    }

    // 处理和过滤语录
    const processedQuotes = await this.processQuotes(allQuotes);

    this.logger.info(`成功抓取并处理了 ${processedQuotes.length} 条语录`);
    return processedQuotes;
  }

  /**
   * 从特定源抓取语录
   */
  private async fetchFromSource(source: QuoteSource): Promise<Quote[]> {
    const quotes: Quote[] = [];

    switch (source.name) {
      case 'goodreads':
        quotes.push(...await this.fetchFromGoodreads(source));
        break;
      case 'brainyquote':
        quotes.push(...await this.fetchFromBrainyQuote(source));
        break;
      case 'quotegarden':
        quotes.push(...await this.fetchFromQuoteGarden(source));
        break;
      case 'zenquotes':
        quotes.push(...await this.fetchFromZenQuotes(source));
        break;
    }

    return quotes;
  }

  /**
   * 从Goodreads抓取语录
   */
  private async fetchFromGoodreads(source: QuoteSource): Promise<Quote[]> {
    const quotes: Quote[] = [];
    const mentalHealthTopics = [
      'psychology', 'mental-health', 'mindfulness', 'meditation',
      'anxiety', 'depression', 'healing', 'therapy'
    ];

    for (const topic of mentalHealthTopics) {
      try {
        const url = `${source.baseUrl}/tag/${topic}`;
        const response = await this.makeRequest(url);
        const parsedQuotes = await this.parseGoodreadsQuotes(response, topic);
        quotes.push(...parsedQuotes);
      } catch (error) {
        this.logger.warn(`从Goodreads抓取主题 ${topic} 失败:`, error);
      }
    }

    return quotes;
  }

  /**
   * 从BrainyQuote抓取语录
   */
  private async fetchFromBrainyQuote(source: QuoteSource): Promise<Quote[]> {
    const quotes: Quote[] = [];
    const topics = ['motivational', 'inspirational', 'positive', 'healing'];

    for (const topic of topics) {
      try {
        const url = `${source.baseUrl}/topics/${topic}-quotes`;
        const response = await this.makeRequest(url);
        const parsedQuotes = await this.parseBrainyQuotes(response, topic);
        quotes.push(...parsedQuotes);
      } catch (error) {
        this.logger.warn(`从BrainyQuote抓取主题 ${topic} 失败:`, error);
      }
    }

    return quotes;
  }

  /**
   * 从QuoteGarden抓取语录
   */
  private async fetchFromQuoteGarden(source: QuoteSource): Promise<Quote[]> {
    const quotes: Quote[] = [];
    const categories = ['healing', 'mindfulness', 'self-love', 'hope'];

    for (const category of categories) {
      try {
        const url = `${source.baseUrl}/quotes/${category}`;
        const response = await this.makeRequest(url);
        const parsedQuotes = await this.parseQuoteGardenQuotes(response, category);
        quotes.push(...parsedQuotes);
      } catch (error) {
        this.logger.warn(`从QuoteGarden抓取分类 ${category} 失败:`, error);
      }
    }

    return quotes;
  }

  /**
   * 从ZenQuotes API抓取语录
   */
  private async fetchFromZenQuotes(source: QuoteSource): Promise<Quote[]> {
    const quotes: Quote[] = [];

    try {
      // ZenQuotes API endpoints
      const endpoints = [
        '/quotes',
        '/quotes/inspirational',
        '/quotes/motivational'
      ];

      for (const endpoint of endpoints) {
        const url = `${source.baseUrl}${endpoint}`;
        const response = await this.makeRequest(url, {
          headers: source.apiKey ? { 'X-API-Key': source.apiKey } : {}
        });

        const data = JSON.parse(response);
        const parsedQuotes = this.parseZenQuotes(data);
        quotes.push(...parsedQuotes);
      }
    } catch (error) {
      this.logger.warn('从ZenQuotes API抓取失败:', error);
    }

    return quotes;
  }

  /**
   * 解析Goodreads语录
   */
  private async parseGoodreadsQuotes(html: string, topic: string): Promise<Quote[]> {
    // 这里需要实现HTML解析逻辑
    // 由于实际的HTML结构可能变化，这里提供一个基本框架
    const quotes: Quote[] = [];

    // 使用正则表达式或HTML解析器提取语录
    // 这是一个简化的示例
    const quoteRegex = /"([^"]+)"\s*―\s*([^,\n]+)/g;
    let match;

    while ((match = quoteRegex.exec(html)) !== null) {
      const [, text, author] = match;

      if (this.isValidQuoteLength(text)) {
        quotes.push(this.createQuoteObject({
          text: text.trim(),
          author: author.trim(),
          source: 'Goodreads',
          category: this.mapTopicToCategory(topic),
          sourceUrl: `https://www.goodreads.com/quotes/tag/${topic}`
        }));
      }
    }

    return quotes;
  }

  /**
   * 解析BrainyQuote语录
   */
  private async parseBrainyQuotes(html: string, topic: string): Promise<Quote[]> {
    const quotes: Quote[] = [];

    // BrainyQuote的HTML结构解析
    const quoteRegex = /<a[^>]*title="view quote"[^>]*>([^<]+)<\/a>[\s\S]*?<a[^>]*title="view author"[^>]*>([^<]+)<\/a>/g;
    let match;

    while ((match = quoteRegex.exec(html)) !== null) {
      const [, text, author] = match;

      if (this.isValidQuoteLength(text)) {
        quotes.push(this.createQuoteObject({
          text: text.trim(),
          author: author.trim(),
          source: 'BrainyQuote',
          category: this.mapTopicToCategory(topic),
          sourceUrl: `https://www.brainyquote.com/topics/${topic}-quotes`
        }));
      }
    }

    return quotes;
  }

  /**
   * 解析QuoteGarden语录
   */
  private async parseQuoteGardenQuotes(html: string, category: string): Promise<Quote[]> {
    const quotes: Quote[] = [];

    // QuoteGarden的HTML结构解析
    const quoteRegex = /<p[^>]*class="[^"]*quote[^"]*"[^>]*>([^<]+)<\/p>[\s\S]*?<p[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/p>/g;
    let match;

    while ((match = quoteRegex.exec(html)) !== null) {
      const [, text, author] = match;

      if (this.isValidQuoteLength(text)) {
        quotes.push(this.createQuoteObject({
          text: text.trim(),
          author: author.trim(),
          source: 'QuoteGarden',
          category: category as QuoteCategory,
          sourceUrl: `https://www.quotegarden.com/quotes/${category}`
        }));
      }
    }

    return quotes;
  }

  /**
   * 解析ZenQuotes API响应
   */
  private parseZenQuotes(data: any[]): Quote[] {
    const quotes: Quote[] = [];

    for (const item of data) {
      if (item.q && item.a && this.isValidQuoteLength(item.q)) {
        quotes.push(this.createQuoteObject({
          text: item.q.trim(),
          author: item.a.trim(),
          source: 'ZenQuotes',
          category: 'wisdom',
          sourceUrl: 'https://zenquotes.io'
        }));
      }
    }

    return quotes;
  }

  /**
   * 创建语录对象
   */
  private createQuoteObject(data: {
    text: string;
    author?: string;
    source: string;
    category: QuoteCategory;
    sourceUrl: string;
  }): Quote {
    const id = this.generateId();
    const now = new Date();

    return {
      id,
      title: data.text.substring(0, 50) + (data.text.length > 50 ? '...' : ''),
      description: data.text,
      text: data.text,
      author: data.author,
      source: data.source,
      type: 'article', // 语录作为文章类型
      language: 'zh', // 默认中文，后续可以添加语言检测
      category: data.category,
      mood: this.inferMoodFromCategory(data.category),
      tags: [data.category, 'quote', 'mental-health'],
      categories: ['quotes', 'mental-health'],
      therapeuticBenefit: this.getTherapeuticBenefits(data.category),
      targetAudience: ['general', 'mental-health-seekers'],
      moodCategories: [this.inferMoodFromCategory(data.category)],
      sourceUrl: data.sourceUrl,
      availability: {
        free: true,
        regions: ['global'],
        platforms: ['web']
      },
      qualityScore: 0.8, // 初始分数，后续通过质量评估更新
      shareCount: 0,
      viewCount: 0,
      publishDate: now,
      difficultyLevel: 'beginner'
    };
  }

  /**
   * 处理和过滤语录
   */
  private async processQuotes(quotes: Quote[]): Promise<Quote[]> {
    this.logger.info(`开始处理 ${quotes.length} 条语录...`);

    // 1. 去重
    const uniqueQuotes = this.removeDuplicateQuotes(quotes);
    this.logger.info(`去重后剩余 ${uniqueQuotes.length} 条语录`);

    // 2. 质量评估
    const qualityFilteredQuotes = await this.filterByQuality(uniqueQuotes);
    this.logger.info(`质量过滤后剩余 ${qualityFilteredQuotes.length} 条语录`);

    // 3. 情感分析和分类
    const categorizedQuotes = await this.categorizeQuotes(qualityFilteredQuotes);
    this.logger.info(`分类完成，共 ${categorizedQuotes.length} 条语录`);

    // 4. 添加情感标签
    const taggedQuotes = await this.addEmotionalTags(categorizedQuotes);
    this.logger.info(`情感标签添加完成`);

    return taggedQuotes;
  }

  /**
   * 去除重复语录
   */
  private removeDuplicateQuotes(quotes: Quote[]): Quote[] {
    const seen = new Set<string>();
    const unique: Quote[] = [];

    for (const quote of quotes) {
      // 使用文本内容和作者作为唯一标识
      const key = `${quote.text.toLowerCase().trim()}-${quote.author?.toLowerCase().trim() || 'unknown'}`;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(quote);
      }
    }

    return unique;
  }

  /**
   * 质量过滤
   */
  private async filterByQuality(quotes: Quote[]): Promise<Quote[]> {
    const filtered: Quote[] = [];

    for (const quote of quotes) {
      const qualityMetrics = await this.assessQuoteQuality(quote);

      if (qualityMetrics.overallScore >= this.MIN_QUALITY_SCORE) {
        quote.qualityScore = qualityMetrics.overallScore;
        filtered.push(quote);
      }
    }

    return filtered;
  }

  /**
   * 评估语录质量
   */
  private async assessQuoteQuality(quote: Quote): Promise<QuoteQualityMetrics> {
    const metrics: QuoteQualityMetrics = {
      positiveScore: 0,
      mentalHealthRelevance: 0,
      appropriateLength: false,
      culturalSensitivity: 0,
      overallScore: 0
    };

    // 1. 长度检查
    metrics.appropriateLength = this.isValidQuoteLength(quote.text);

    // 2. 正面情感检测
    metrics.positiveScore = await this.detectPositiveSentiment(quote.text);

    // 3. 心理健康相关性
    metrics.mentalHealthRelevance = this.calculateMentalHealthRelevance(quote.text);

    // 4. 文化敏感性
    metrics.culturalSensitivity = await this.assessCulturalSensitivity(quote.text);

    // 5. 计算总分
    metrics.overallScore = (
      (metrics.appropriateLength ? 0.2 : 0) +
      metrics.positiveScore * 0.4 +
      metrics.mentalHealthRelevance * 0.3 +
      metrics.culturalSensitivity * 0.1
    );

    return metrics;
  }

  /**
   * 检测正面情感
   */
  private async detectPositiveSentiment(text: string): Promise<number> {
    // 简单的正面词汇检测
    const positiveWords = [
      'hope', 'healing', 'strength', 'courage', 'peace', 'love', 'joy',
      'growth', 'resilience', 'overcome', 'inspire', 'motivate', 'empower',
      'positive', 'optimistic', 'confident', 'grateful', 'blessed',
      '希望', '治愈', '力量', '勇气', '平静', '爱', '快乐',
      '成长', '韧性', '克服', '激励', '积极', '乐观', '自信', '感恩'
    ];

    const negativeWords = [
      'hate', 'anger', 'despair', 'hopeless', 'worthless', 'failure',
      '仇恨', '愤怒', '绝望', '无望', '无价值', '失败'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (positiveWords.some(pw => word.includes(pw))) {
        positiveCount++;
      }
      if (negativeWords.some(nw => word.includes(nw))) {
        negativeCount++;
      }
    }

    // 计算正面情感分数 (0-1)
    const totalEmotionalWords = positiveCount + negativeCount;
    if (totalEmotionalWords === 0) return 0.5; // 中性

    return Math.min(1, Math.max(0, positiveCount / totalEmotionalWords));
  }

  /**
   * 计算心理健康相关性
   */
  private calculateMentalHealthRelevance(text: string): number {
    const mentalHealthKeywords = this.config.contentValidation.mentalHealthKeywords;
    const words = text.toLowerCase().split(/\s+/);
    let relevanceScore = 0;

    for (const keyword of mentalHealthKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        relevanceScore += 0.1;
      }
    }

    return Math.min(1, relevanceScore);
  }

  /**
   * 评估文化敏感性
   */
  private async assessCulturalSensitivity(text: string): Promise<number> {
    // 检查是否包含可能不当的内容
    const sensitiveTopics = [
      'suicide', 'self-harm', 'violence', 'discrimination',
      '自杀', '自残', '暴力', '歧视'
    ];

    const lowerText = text.toLowerCase();
    for (const topic of sensitiveTopics) {
      if (lowerText.includes(topic.toLowerCase())) {
        return 0.3; // 降低分数但不完全排除
      }
    }

    return 0.9; // 默认高分
  }

  /**
   * 语录分类
   */
  private async categorizeQuotes(quotes: Quote[]): Promise<Quote[]> {
    for (const quote of quotes) {
      // 基于内容重新分类
      const detectedCategory = this.detectQuoteCategory(quote.text);
      if (detectedCategory) {
        quote.category = detectedCategory;
        quote.mood = this.inferMoodFromCategory(detectedCategory);
      }
    }

    return quotes;
  }

  /**
   * 检测语录分类
   */
  private detectQuoteCategory(text: string): QuoteCategory | null {
    const categoryKeywords: Record<QuoteCategory, string[]> = {
      motivation: ['motivate', 'inspire', 'achieve', 'success', 'goal', '激励', '成功', '目标'],
      healing: ['heal', 'recovery', 'overcome', 'therapy', '治愈', '康复', '克服'],
      mindfulness: ['mindful', 'present', 'awareness', 'meditation', '正念', '当下', '觉察'],
      'self-love': ['self-love', 'self-care', 'worth', 'value', '自爱', '自我关怀', '价值'],
      resilience: ['resilience', 'strength', 'endure', 'persevere', '韧性', '坚强', '坚持'],
      hope: ['hope', 'future', 'tomorrow', 'possibility', '希望', '未来', '可能'],
      wisdom: ['wisdom', 'learn', 'understand', 'knowledge', '智慧', '学习', '理解'],
      gratitude: ['grateful', 'thankful', 'appreciate', 'blessing', '感恩', '感谢', '珍惜']
    };

    const lowerText = text.toLowerCase();
    let bestMatch: QuoteCategory | null = null;
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score++;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = category as QuoteCategory;
      }
    }

    return bestMatch;
  }

  /**
   * 添加情感标签
   */
  private async addEmotionalTags(quotes: Quote[]): Promise<Quote[]> {
    for (const quote of quotes) {
      const emotionalTags = this.extractEmotionalTags(quote.text);
      quote.tags = [...new Set([...quote.tags, ...emotionalTags])];
    }

    return quotes;
  }

  /**
   * 提取情感标签
   */
  private extractEmotionalTags(text: string): string[] {
    const emotionKeywords: Record<string, string[]> = {
      'calming': ['calm', 'peace', 'serene', 'tranquil', '平静', '宁静'],
      'uplifting': ['uplift', 'inspire', 'elevate', 'boost', '提升', '激励'],
      'comforting': ['comfort', 'soothe', 'reassure', 'support', '安慰', '支持'],
      'empowering': ['empower', 'strength', 'confident', 'capable', '赋权', '力量'],
      'reflective': ['reflect', 'contemplate', 'ponder', 'think', '反思', '思考']
    };

    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          tags.push(emotion);
          break;
        }
      }
    }

    return tags;
  }

  /**
   * 辅助方法
   */
  private isValidQuoteLength(text: string): boolean {
    const length = text.trim().length;
    return length >= this.MIN_QUOTE_LENGTH && length <= this.MAX_QUOTE_LENGTH;
  }

  private mapTopicToCategory(topic: string): QuoteCategory {
    const mapping: Record<string, QuoteCategory> = {
      'psychology': 'wisdom',
      'mental-health': 'healing',
      'mindfulness': 'mindfulness',
      'meditation': 'mindfulness',
      'anxiety': 'healing',
      'depression': 'healing',
      'healing': 'healing',
      'therapy': 'healing',
      'motivational': 'motivation',
      'inspirational': 'motivation',
      'positive': 'hope',
      'self-love': 'self-love',
      'hope': 'hope'
    };

    return mapping[topic] || 'wisdom';
  }

  private inferMoodFromCategory(category: QuoteCategory): MoodCategory {
    const mapping: Record<QuoteCategory, MoodCategory> = {
      'motivation': 'motivation',
      'healing': 'healing',
      'mindfulness': 'focus',
      'self-love': 'healing',
      'resilience': 'motivation',
      'hope': 'motivation',
      'wisdom': 'focus',
      'gratitude': 'relaxation'
    };

    return mapping[category] || 'healing';
  }

  private getTherapeuticBenefits(category: QuoteCategory): string[] {
    const benefits: Record<QuoteCategory, string[]> = {
      'motivation': ['增强动力', '提升自信', '目标导向'],
      'healing': ['情感治愈', '心理康复', '创伤修复'],
      'mindfulness': ['正念练习', '当下觉察', '专注力提升'],
      'self-love': ['自我接纳', '自尊建立', '自我关怀'],
      'resilience': ['韧性培养', '抗压能力', '适应性增强'],
      'hope': ['希望重建', '未来导向', '乐观态度'],
      'wisdom': ['智慧启发', '认知重构', '洞察力提升'],
      'gratitude': ['感恩练习', '积极情绪', '生活满意度']
    };

    return benefits[category] || ['心理健康支持'];
  }

  private generateId(): string {
    return `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<string> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MentalHealthBot/1.0)',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  }
}
