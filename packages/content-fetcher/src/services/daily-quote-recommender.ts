import { Quote, QuoteCategory, MoodCategory } from '../fetchers/quote-fetcher.js';
import { Logger } from '@sunrain/shared';

/**
 * 每日语录推荐系统
 */
export interface DailyQuoteRecommender {
  getDailyQuote(date?: Date): Promise<Quote>;
  getQuoteByMood(mood: MoodCategory): Promise<Quote>;
  getQuoteByCategory(category: QuoteCategory): Promise<Quote>;
  getPersonalizedQuote(preferences: UserPreferences): Promise<Quote>;
  getWeeklyQuotes(): Promise<Quote[]>;
  getMotivationalSequence(days: number): Promise<Quote[]>;
}

export interface UserPreferences {
  favoriteCategories: QuoteCategory[];
  preferredMoods: MoodCategory[];
  language: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  personalityType?: 'introvert' | 'extrovert' | 'ambivert';
  currentChallenges?: string[];
}

export interface QuoteRecommendationContext {
  date: Date;
  dayOfWeek: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isWeekend: boolean;
  isHoliday: boolean;
}

/**
 * 每日语录推荐机制实现
 */
export class DailyQuoteRecommendationSystem implements DailyQuoteRecommender {
  private quotes: Quote[] = [];
  private logger: Logger;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时
  private dailyQuoteCache = new Map<string, Quote>();

  constructor(quotes: Quote[], logger: Logger) {
    this.quotes = quotes;
    this.logger = logger;
  }

  /**
   * 获取每日语录
   */
  async getDailyQuote(date: Date = new Date()): Promise<Quote> {
    const dateKey = this.getDateKey(date);

    // 检查缓存
    if (this.dailyQuoteCache.has(dateKey)) {
      return this.dailyQuoteCache.get(dateKey)!;
    }

    const context = this.buildRecommendationContext(date);
    const quote = await this.selectDailyQuote(context);

    // 缓存结果
    this.dailyQuoteCache.set(dateKey, quote);

    this.logger.info(`为 ${dateKey} 选择每日语录: "${quote.text.substring(0, 50)}..."`);
    return quote;
  }

  /**
   * 根据心情获取语录
   */
  async getQuoteByMood(mood: MoodCategory): Promise<Quote> {
    const moodQuotes = this.quotes.filter(q => q.mood === mood);

    if (moodQuotes.length === 0) {
      // 如果没有完全匹配的，找相关的
      const relatedQuotes = this.findRelatedMoodQuotes(mood);
      return this.selectRandomQuote(relatedQuotes);
    }

    return this.selectRandomQuote(moodQuotes);
  }

  /**
   * 根据分类获取语录
   */
  async getQuoteByCategory(category: QuoteCategory): Promise<Quote> {
    const categoryQuotes = this.quotes.filter(q => q.category === category);

    if (categoryQuotes.length === 0) {
      this.logger.warn(`没有找到分类 ${category} 的语录`);
      return this.selectRandomQuote(this.quotes);
    }

    return this.selectRandomQuote(categoryQuotes);
  }

  /**
   * 获取个性化语录
   */
  async getPersonalizedQuote(preferences: UserPreferences): Promise<Quote> {
    let candidateQuotes = [...this.quotes];

    // 根据偏好过滤
    if (preferences.favoriteCategories.length > 0) {
      candidateQuotes = candidateQuotes.filter(q =>
        preferences.favoriteCategories.includes(q.category)
      );
    }

    if (preferences.preferredMoods.length > 0) {
      candidateQuotes = candidateQuotes.filter(q =>
        preferences.preferredMoods.includes(q.mood)
      );
    }

    // 根据语言过滤
    if (preferences.language) {
      candidateQuotes = candidateQuotes.filter(q => q.language === preferences.language);
    }

    // 根据时间段调整
    candidateQuotes = this.adjustForTimeOfDay(candidateQuotes, preferences.timeOfDay);

    // 根据个性类型调整
    if (preferences.personalityType) {
      candidateQuotes = this.adjustForPersonalityType(candidateQuotes, preferences.personalityType);
    }

    // 根据当前挑战调整
    if (preferences.currentChallenges && preferences.currentChallenges.length > 0) {
      candidateQuotes = this.adjustForChallenges(candidateQuotes, preferences.currentChallenges);
    }

    if (candidateQuotes.length === 0) {
      this.logger.warn('个性化过滤后没有合适的语录，返回随机语录');
      return this.selectRandomQuote(this.quotes);
    }

    return this.selectRandomQuote(candidateQuotes);
  }

  /**
   * 获取一周语录
   */
  async getWeeklyQuotes(): Promise<Quote[]> {
    const weeklyQuotes: Quote[] = [];
    const today = new Date();

    // 为一周的每一天选择不同主题的语录
    const weeklyThemes: QuoteCategory[] = [
      'motivation',    // 周一 - 动力
      'mindfulness',   // 周二 - 正念
      'resilience',    // 周三 - 韧性
      'self-love',     // 周四 - 自爱
      'hope',          // 周五 - 希望
      'gratitude',     // 周六 - 感恩
      'wisdom'         // 周日 - 智慧
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const theme = weeklyThemes[dayOfWeek === 0 ? 6 : dayOfWeek - 1]; // 调整周日为6

      const themeQuotes = this.quotes.filter(q => q.category === theme);
      const selectedQuote = this.selectRandomQuote(themeQuotes.length > 0 ? themeQuotes : this.quotes);

      weeklyQuotes.push(selectedQuote);
    }

    return weeklyQuotes;
  }

  /**
   * 获取激励序列
   */
  async getMotivationalSequence(days: number): Promise<Quote[]> {
    const sequence: Quote[] = [];

    // 创建一个渐进式的激励序列
    const progressiveThemes: QuoteCategory[] = [
      'hope',          // 开始 - 希望
      'motivation',    // 建立动力
      'resilience',    // 培养韧性
      'self-love',     // 自我关怀
      'mindfulness',   // 正念练习
      'wisdom',        // 智慧积累
      'gratitude'      // 感恩总结
    ];

    for (let i = 0; i < days; i++) {
      const themeIndex = i % progressiveThemes.length;
      const theme = progressiveThemes[themeIndex];

      const themeQuotes = this.quotes.filter(q => q.category === theme);
      const selectedQuote = this.selectRandomQuote(themeQuotes.length > 0 ? themeQuotes : this.quotes);

      sequence.push(selectedQuote);
    }

    return sequence;
  }

  /**
   * 构建推荐上下文
   */
  private buildRecommendationContext(date: Date): QuoteRecommendationContext {
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const hour = date.getHours();

    // 确定季节
    let season: 'spring' | 'summer' | 'autumn' | 'winter';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';

    // 确定时间段
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      date,
      dayOfWeek,
      season,
      timeOfDay,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isHoliday: this.isHoliday(date)
    };
  }

  /**
   * 选择每日语录
   */
  private async selectDailyQuote(context: QuoteRecommendationContext): Promise<Quote> {
    let candidateQuotes = [...this.quotes];

    // 根据星期几选择主题
    const weeklyThemes: Record<number, QuoteCategory[]> = {
      1: ['motivation', 'hope'], // 周一 - 动力和希望
      2: ['mindfulness', 'wisdom'], // 周二 - 正念和智慧
      3: ['resilience', 'motivation'], // 周三 - 韧性和动力
      4: ['self-love', 'healing'], // 周四 - 自爱和治愈
      5: ['hope', 'gratitude'], // 周五 - 希望和感恩
      6: ['gratitude', 'relaxation'], // 周六 - 感恩和放松
      0: ['wisdom', 'mindfulness'] // 周日 - 智慧和正念
    };

    const preferredCategories = weeklyThemes[context.dayOfWeek] || ['wisdom'];
    candidateQuotes = candidateQuotes.filter(q =>
      preferredCategories.includes(q.category)
    );

    // 根据时间段调整
    candidateQuotes = this.adjustForTimeOfDay(candidateQuotes, context.timeOfDay);

    // 根据季节调整
    candidateQuotes = this.adjustForSeason(candidateQuotes, context.season);

    // 如果过滤后没有语录，使用所有语录
    if (candidateQuotes.length === 0) {
      candidateQuotes = this.quotes;
    }

    // 使用日期作为种子确保同一天返回相同的语录
    return this.selectDeterministicQuote(candidateQuotes, context.date);
  }

  /**
   * 根据时间段调整语录
   */
  private adjustForTimeOfDay(quotes: Quote[], timeOfDay: string): Quote[] {
    const timePreferences: Record<string, string[]> = {
      'morning': ['motivation', 'hope', 'energy', 'start', 'begin', '早晨', '开始', '动力'],
      'afternoon': ['focus', 'productivity', 'work', 'achievement', '专注', '工作', '成就'],
      'evening': ['reflection', 'gratitude', 'peace', 'calm', '反思', '感恩', '平静'],
      'night': ['rest', 'sleep', 'peace', 'tranquil', 'quiet', '休息', '睡眠', '宁静']
    };

    const keywords = timePreferences[timeOfDay] || [];
    if (keywords.length === 0) return quotes;

    const timeAppropriate = quotes.filter(quote => {
      const text = quote.text.toLowerCase();
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });

    return timeAppropriate.length > 0 ? timeAppropriate : quotes;
  }

  /**
   * 根据季节调整语录
   */
  private adjustForSeason(quotes: Quote[], season: string): Quote[] {
    const seasonKeywords: Record<string, string[]> = {
      'spring': ['growth', 'new', 'fresh', 'bloom', 'renewal', '成长', '新', '绽放'],
      'summer': ['energy', 'vibrant', 'active', 'bright', 'warm', '活力', '明亮', '温暖'],
      'autumn': ['harvest', 'reflection', 'change', 'wisdom', 'mature', '收获', '反思', '智慧'],
      'winter': ['rest', 'peace', 'quiet', 'contemplation', 'inner', '休息', '平静', '内在']
    };

    const keywords = seasonKeywords[season] || [];
    if (keywords.length === 0) return quotes;

    const seasonAppropriate = quotes.filter(quote => {
      const text = quote.text.toLowerCase();
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });

    return seasonAppropriate.length > 0 ? seasonAppropriate : quotes;
  }

  /**
   * 根据个性类型调整语录
   */
  private adjustForPersonalityType(quotes: Quote[], personalityType: string): Quote[] {
    const personalityKeywords: Record<string, string[]> = {
      'introvert': ['inner', 'quiet', 'reflection', 'solitude', 'deep', '内在', '安静', '反思'],
      'extrovert': ['social', 'energy', 'action', 'connect', 'share', '社交', '活力', '行动'],
      'ambivert': ['balance', 'adapt', 'flexible', 'harmony', 'both', '平衡', '适应', '和谐']
    };

    const keywords = personalityKeywords[personalityType] || [];
    if (keywords.length === 0) return quotes;

    const personalityAppropriate = quotes.filter(quote => {
      const text = quote.text.toLowerCase();
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });

    return personalityAppropriate.length > 0 ? personalityAppropriate : quotes;
  }

  /**
   * 根据当前挑战调整语录
   */
  private adjustForChallenges(quotes: Quote[], challenges: string[]): Quote[] {
    const challengeKeywords: Record<string, string[]> = {
      'anxiety': ['calm', 'peace', 'breathe', 'present', 'safe', '平静', '呼吸', '当下'],
      'depression': ['hope', 'light', 'tomorrow', 'better', 'heal', '希望', '光明', '治愈'],
      'stress': ['relax', 'release', 'let go', 'ease', 'rest', '放松', '释放', '休息'],
      'loneliness': ['connect', 'love', 'belong', 'together', 'support', '连接', '爱', '支持'],
      'confidence': ['strong', 'capable', 'worthy', 'believe', 'power', '强大', '能力', '相信']
    };

    let relevantQuotes = quotes;

    for (const challenge of challenges) {
      const keywords = challengeKeywords[challenge.toLowerCase()] || [];
      if (keywords.length > 0) {
        const challengeAppropriate = quotes.filter(quote => {
          const text = quote.text.toLowerCase();
          return keywords.some(keyword => text.includes(keyword.toLowerCase()));
        });

        if (challengeAppropriate.length > 0) {
          relevantQuotes = challengeAppropriate;
          break; // 使用第一个匹配的挑战
        }
      }
    }

    return relevantQuotes;
  }

  /**
   * 查找相关心情的语录
   */
  private findRelatedMoodQuotes(mood: MoodCategory): Quote[] {
    const moodRelations: Record<MoodCategory, MoodCategory[]> = {
      'anxiety': ['relaxation', 'healing', 'focus'],
      'depression': ['healing', 'motivation', 'hope'],
      'stress': ['relaxation', 'healing', 'focus'],
      'relaxation': ['healing', 'sleep', 'focus'],
      'motivation': ['focus', 'healing'],
      'sleep': ['relaxation', 'healing'],
      'focus': ['motivation', 'relaxation'],
      'healing': ['relaxation', 'motivation', 'focus']
    };

    const relatedMoods = moodRelations[mood] || [];
    return this.quotes.filter(q => relatedMoods.includes(q.mood));
  }

  /**
   * 随机选择语录
   */
  private selectRandomQuote(quotes: Quote[]): Quote {
    if (quotes.length === 0) {
      throw new Error('没有可用的语录');
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  /**
   * 确定性选择语录（基于日期种子）
   */
  private selectDeterministicQuote(quotes: Quote[], date: Date): Quote {
    if (quotes.length === 0) {
      throw new Error('没有可用的语录');
    }

    // 使用日期作为种子生成确定性的索引
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const index = seed % quotes.length;

    return quotes[index];
  }

  /**
   * 获取日期键
   */
  private getDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /**
   * 检查是否为节假日
   */
  private isHoliday(date: Date): boolean {
    // 简单的节假日检查，可以扩展
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 一些常见节假日
    const holidays = [
      { month: 1, day: 1 },   // 元旦
      { month: 2, day: 14 },  // 情人节
      { month: 5, day: 1 },   // 劳动节
      { month: 10, day: 1 },  // 国庆节
      { month: 12, day: 25 }  // 圣诞节
    ];

    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  }

  /**
   * 更新语录数据
   */
  updateQuotes(newQuotes: Quote[]): void {
    this.quotes = newQuotes;
    this.dailyQuoteCache.clear(); // 清除缓存
    this.logger.info(`更新了 ${newQuotes.length} 条语录`);
  }

  /**
   * 获取推荐统计
   */
  getRecommendationStats(): {
    totalQuotes: number;
    categoryCounts: Record<QuoteCategory, number>;
    moodCounts: Record<MoodCategory, number>;
    cacheSize: number;
  } {
    const categoryCounts: Record<QuoteCategory, number> = {} as any;
    const moodCounts: Record<MoodCategory, number> = {} as any;

    for (const quote of this.quotes) {
      categoryCounts[quote.category] = (categoryCounts[quote.category] || 0) + 1;
      moodCounts[quote.mood] = (moodCounts[quote.mood] || 0) + 1;
    }

    return {
      totalQuotes: this.quotes.length,
      categoryCounts,
      moodCounts,
      cacheSize: this.dailyQuoteCache.size
    };
  }
}
