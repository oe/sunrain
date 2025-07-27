import { Quote, QuoteCategory, MoodCategory } from '../fetchers/quote-fetcher.js';
import { Logger } from '@sunrain/shared';

/**
 * 语录分类和情感标签系统
 */
export interface QuoteCategorizationSystem {
  categorizeQuote(quote: Quote): Promise<QuoteCategory>;
  detectMood(quote: Quote): Promise<MoodCategory>;
  addEmotionalTags(quote: Quote): Promise<string[]>;
  batchCategorize(quotes: Quote[]): Promise<Quote[]>;
  validateCategorization(quote: Quote): boolean;
  suggestRecategorization(quote: Quote): Promise<QuoteCategory[]>;
}

/**
 * 分类规则接口
 */
export interface CategoryRule {
  category: QuoteCategory;
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  requiredScore: number;
}

/**
 * 情感标签规则接口
 */
export interface EmotionalTagRule {
  tag: string;
  keywords: string[];
  patterns: RegExp[];
  emotionalWeight: number;
  contextRequired?: string[];
}

/**
 * 分类结果接口
 */
export interface CategorizationResult {
  category: QuoteCategory;
  confidence: number;
  alternativeCategories: Array<{
    category: QuoteCategory;
    score: number;
  }>;
  reasoning: string[];
}

/**
 * 情感分析结果接口
 */
export interface EmotionalAnalysisResult {
  primaryEmotion: string;
  emotionalIntensity: number;
  emotionalTags: string[];
  moodCategory: MoodCategory;
  therapeuticValue: number;
}

/**
 * 语录分类和情感标签系统实现
 */
export class QuoteCategorizationSystemImpl implements QuoteCategorizationSystem {
  private logger: Logger;
  private categoryRules: CategoryRule[];
  private emotionalTagRules: EmotionalTagRule[];
  private moodMappings: Map<string, MoodCategory>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeCategoryRules();
    this.initializeEmotionalTagRules();
    this.initializeMoodMappings();
  }

  /**
   * 对语录进行分类
   */
  async categorizeQuote(quote: Quote): Promise<QuoteCategory> {
    const result = await this.analyzeCategorizationWithConfidence(quote);

    this.logger.debug(`语录 "${quote.text.substring(0, 50)}..." 分类为: ${result.category} (置信度: ${result.confidence.toFixed(2)})`);

    return result.category;
  }

  /**
   * 检测语录情绪
   */
  async detectMood(quote: Quote): Promise<MoodCategory> {
    const emotionalAnalysis = await this.analyzeEmotionalContent(quote);

    this.logger.debug(`语录情绪检测: ${emotionalAnalysis.moodCategory} (强度: ${emotionalAnalysis.emotionalIntensity.toFixed(2)})`);

    return emotionalAnalysis.moodCategory;
  }

  /**
   * 添加情感标签
   */
  async addEmotionalTags(quote: Quote): Promise<string[]> {
    const emotionalAnalysis = await this.analyzeEmotionalContent(quote);
    const contextualTags = await this.generateContextualTags(quote);
    const therapeuticTags = await this.generateTherapeuticTags(quote);

    // 合并所有标签并去重
    const allTags = [
      ...emotionalAnalysis.emotionalTags,
      ...contextualTags,
      ...therapeuticTags
    ];

    const uniqueTags = [...new Set(allTags)];

    this.logger.debug(`为语录添加了 ${uniqueTags.length} 个情感标签: ${uniqueTags.join(', ')}`);

    return uniqueTags;
  }

  /**
   * 批量分类处理
   */
  async batchCategorize(quotes: Quote[]): Promise<Quote[]> {
    this.logger.info(`开始批量分类 ${quotes.length} 条语录`);

    const processedQuotes: Quote[] = [];
    const batchSize = 20;

    for (let i = 0; i < quotes.length; i += batchSize) {
      const batch = quotes.slice(i, i + batchSize);

      const batchPromises = batch.map(async (quote) => {
        const [category, mood, emotionalTags] = await Promise.all([
          this.categorizeQuote(quote),
          this.detectMood(quote),
          this.addEmotionalTags(quote)
        ]);

        return {
          ...quote,
          category,
          mood,
          tags: [...new Set([...quote.tags, ...emotionalTags])]
        };
      });

      const processedBatch = await Promise.all(batchPromises);
      processedQuotes.push(...processedBatch);

      // 进度日志
      this.logger.info(`已处理 ${Math.min(i + batchSize, quotes.length)}/${quotes.length} 条语录`);

      // 避免过度处理
      if (i + batchSize < quotes.length) {
        await this.delay(50);
      }
    }

    this.logger.info(`批量分类完成，共处理 ${processedQuotes.length} 条语录`);
    return processedQuotes;
  }

  /**
   * 验证分类结果
   */
  validateCategorization(quote: Quote): boolean {
    // 检查分类是否与内容匹配
    const categoryKeywords = this.getCategoryKeywords(quote.category);
    const text = quote.text.toLowerCase();

    let matchCount = 0;
    for (const keyword of categoryKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // 至少要有一个关键词匹配
    const isValid = matchCount > 0;

    if (!isValid) {
      this.logger.warn(`语录分类验证失败: "${quote.text.substring(0, 50)}..." 分类为 ${quote.category} 但缺少相关关键词`);
    }

    return isValid;
  }

  /**
   * 建议重新分类
   */
  async suggestRecategorization(quote: Quote): Promise<QuoteCategory[]> {
    const result = await this.analyzeCategorizationWithConfidence(quote);

    // 返回置信度较高的替代分类
    return result.alternativeCategories
      .filter(alt => alt.score > 0.3)
      .map(alt => alt.category);
  }

  /**
   * 分析分类并返回置信度
   */
  private async analyzeCategorizationWithConfidence(quote: Quote): Promise<CategorizationResult> {
    const text = quote.text.toLowerCase();
    const categoryScores = new Map<QuoteCategory, number>();
    const reasoning: string[] = [];

    // 计算每个分类的得分
    for (const rule of this.categoryRules) {
      let score = 0;
      const matchedKeywords: string[] = [];

      // 关键词匹配
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += rule.weight;
          matchedKeywords.push(keyword);
        }
      }

      // 模式匹配
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          score += rule.weight * 1.5; // 模式匹配权重更高
          matchedKeywords.push(`pattern:${pattern.source}`);
        }
      }

      if (score > 0) {
        categoryScores.set(rule.category, score);
        reasoning.push(`${rule.category}: ${score.toFixed(2)} (匹配: ${matchedKeywords.join(', ')})`);
      }
    }

    // 排序并选择最佳分类
    const sortedCategories = Array.from(categoryScores.entries())
      .sort(([, a], [, b]) => b - a);

    if (sortedCategories.length === 0) {
      // 默认分类
      return {
        category: 'wisdom',
        confidence: 0.3,
        alternativeCategories: [],
        reasoning: ['使用默认分类: wisdom']
      };
    }

    const [bestCategory, bestScore] = sortedCategories[0];
    const totalScore = Array.from(categoryScores.values()).reduce((sum, score) => sum + score, 0);
    const confidence = bestScore / Math.max(totalScore, 1);

    const alternativeCategories = sortedCategories.slice(1, 4).map(([category, score]) => ({
      category,
      score: score / Math.max(totalScore, 1)
    }));

    return {
      category: bestCategory,
      confidence,
      alternativeCategories,
      reasoning
    };
  }

  /**
   * 分析情感内容
   */
  private async analyzeEmotionalContent(quote: Quote): Promise<EmotionalAnalysisResult> {
    const text = quote.text.toLowerCase();
    const emotionalScores = new Map<string, number>();
    const matchedTags: string[] = [];

    // 应用情感标签规则
    for (const rule of this.emotionalTagRules) {
      let score = 0;

      // 关键词匹配
      for (const keyword of rule.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += rule.emotionalWeight;
        }
      }

      // 模式匹配
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          score += rule.emotionalWeight * 1.2;
        }
      }

      // 上下文检查
      if (rule.contextRequired) {
        const hasContext = rule.contextRequired.some(context =>
          text.includes(context.toLowerCase())
        );
        if (!hasContext) {
          score *= 0.5; // 降低分数
        }
      }

      if (score > 0) {
        emotionalScores.set(rule.tag, score);
        matchedTags.push(rule.tag);
      }
    }

    // 确定主要情感
    const sortedEmotions = Array.from(emotionalScores.entries())
      .sort(([, a], [, b]) => b - a);

    const primaryEmotion = sortedEmotions.length > 0 ? sortedEmotions[0][0] : 'neutral';
    const emotionalIntensity = sortedEmotions.length > 0 ?
      Math.min(1, sortedEmotions[0][1] / 3) : 0.5;

    // 映射到情绪分类
    const moodCategory = this.mapEmotionToMood(primaryEmotion);

    // 计算治疗价值
    const therapeuticValue = this.calculateTherapeuticValue(matchedTags, emotionalIntensity);

    return {
      primaryEmotion,
      emotionalIntensity,
      emotionalTags: matchedTags,
      moodCategory,
      therapeuticValue
    };
  }

  /**
   * 生成上下文标签
   */
  private async generateContextualTags(quote: Quote): Promise<string[]> {
    const text = quote.text.toLowerCase();
    const contextualTags: string[] = [];

    // 时间相关标签
    const timePatterns = {
      'morning': /\b(morning|dawn|sunrise|早晨|黎明|日出)\b/i,
      'evening': /\b(evening|sunset|dusk|傍晚|日落|黄昏)\b/i,
      'night': /\b(night|midnight|夜晚|午夜)\b/i,
      'future': /\b(future|tomorrow|ahead|未来|明天|前方)\b/i,
      'past': /\b(past|yesterday|before|过去|昨天|以前)\b/i,
      'present': /\b(now|today|present|现在|今天|当下)\b/i
    };

    for (const [tag, pattern] of Object.entries(timePatterns)) {
      if (pattern.test(text)) {
        contextualTags.push(tag);
      }
    }

    // 关系相关标签
    const relationshipPatterns = {
      'family': /\b(family|parent|child|mother|father|家庭|父母|孩子|母亲|父亲)\b/i,
      'friendship': /\b(friend|friendship|companion|朋友|友谊|伙伴)\b/i,
      'love': /\b(love|relationship|partner|爱|关系|伴侣)\b/i,
      'community': /\b(community|society|together|社区|社会|一起)\b/i
    };

    for (const [tag, pattern] of Object.entries(relationshipPatterns)) {
      if (pattern.test(text)) {
        contextualTags.push(tag);
      }
    }

    // 活动相关标签
    const activityPatterns = {
      'work': /\b(work|job|career|career|工作|职业|事业)\b/i,
      'learning': /\b(learn|study|education|学习|研究|教育)\b/i,
      'creativity': /\b(create|art|creative|创造|艺术|创意)\b/i,
      'exercise': /\b(exercise|fitness|health|运动|健身|健康)\b/i
    };

    for (const [tag, pattern] of Object.entries(activityPatterns)) {
      if (pattern.test(text)) {
        contextualTags.push(tag);
      }
    }

    return contextualTags;
  }

  /**
   * 生成治疗性标签
   */
  private async generateTherapeuticTags(quote: Quote): Promise<string[]> {
    const text = quote.text.toLowerCase();
    const therapeuticTags: string[] = [];

    // 治疗技术相关标签
    const therapeuticPatterns = {
      'cognitive-reframing': /\b(perspective|viewpoint|think differently|看法|观点|换个角度)\b/i,
      'mindfulness': /\b(mindful|aware|present|正念|觉察|当下)\b/i,
      'self-compassion': /\b(self-compassion|kind to yourself|自我同情|善待自己)\b/i,
      'acceptance': /\b(accept|acceptance|embrace|接受|拥抱)\b/i,
      'gratitude': /\b(grateful|thankful|appreciate|感恩|感谢|珍惜)\b/i,
      'resilience-building': /\b(resilient|bounce back|overcome|韧性|反弹|克服)\b/i,
      'stress-relief': /\b(relax|calm|peace|放松|平静|和平)\b/i,
      'motivation': /\b(motivate|inspire|encourage|激励|鼓舞|鼓励)\b/i
    };

    for (const [tag, pattern] of Object.entries(therapeuticPatterns)) {
      if (pattern.test(text)) {
        therapeuticTags.push(tag);
      }
    }

    // 心理健康状态标签
    const mentalHealthPatterns = {
      'anxiety-support': /\b(anxiety|worry|calm|焦虑|担心|平静)\b/i,
      'depression-support': /\b(depression|hope|light|抑郁|希望|光明)\b/i,
      'stress-management': /\b(stress|pressure|manage|压力|管理)\b/i,
      'self-esteem': /\b(worth|value|deserve|价值|值得)\b/i,
      'emotional-regulation': /\b(emotion|feeling|control|情绪|感受|控制)\b/i
    };

    for (const [tag, pattern] of Object.entries(mentalHealthPatterns)) {
      if (pattern.test(text)) {
        therapeuticTags.push(tag);
      }
    }

    return therapeuticTags;
  }

  /**
   * 映射情感到情绪分类
   */
  private mapEmotionToMood(emotion: string): MoodCategory {
    return this.moodMappings.get(emotion) || 'healing';
  }

  /**
   * 计算治疗价值
   */
  private calculateTherapeuticValue(tags: string[], intensity: number): number {
    const therapeuticTags = [
      'cognitive-reframing', 'mindfulness', 'self-compassion', 'acceptance',
      'gratitude', 'resilience-building', 'stress-relief', 'motivation',
      'anxiety-support', 'depression-support', 'stress-management',
      'self-esteem', 'emotional-regulation'
    ];

    const therapeuticCount = tags.filter(tag => therapeuticTags.includes(tag)).length;
    const baseValue = Math.min(1, therapeuticCount / 3);

    return baseValue * intensity;
  }

  /**
   * 获取分类关键词
   */
  private getCategoryKeywords(category: QuoteCategory): string[] {
    const rule = this.categoryRules.find(r => r.category === category);
    return rule ? rule.keywords : [];
  }

  /**
   * 初始化分类规则
   */
  private initializeCategoryRules(): void {
    this.categoryRules = [
      {
        category: 'motivation',
        keywords: [
          'motivate', 'inspire', 'achieve', 'success', 'goal', 'dream', 'ambition',
          'determination', 'perseverance', 'drive', 'passion', 'purpose',
          '激励', '鼓舞', '实现', '成功', '目标', '梦想', '雄心',
          '决心', '毅力', '驱动', '激情', '目的'
        ],
        patterns: [
          /\b(you can|believe in yourself|never give up|你可以|相信自己|永不放弃)\b/i,
          /\b(achieve your dreams|实现梦想)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'healing',
        keywords: [
          'heal', 'healing', 'recovery', 'restore', 'mend', 'cure', 'therapy',
          'treatment', 'medicine', 'wellness', 'health',
          '治愈', '康复', '恢复', '修复', '治疗', '医学', '健康'
        ],
        patterns: [
          /\b(time heals|healing process|road to recovery|时间治愈|康复过程)\b/i,
          /\b(overcome trauma|克服创伤)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'mindfulness',
        keywords: [
          'mindful', 'mindfulness', 'present', 'awareness', 'meditation',
          'conscious', 'attention', 'focus', 'breathe', 'moment',
          '正念', '当下', '觉察', '冥想', '意识', '注意', '专注', '呼吸', '时刻'
        ],
        patterns: [
          /\b(be present|live in the moment|stay mindful|活在当下|保持正念)\b/i,
          /\b(mindful breathing|正念呼吸)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'self-love',
        keywords: [
          'self-love', 'self-care', 'self-worth', 'self-respect', 'self-acceptance',
          'love yourself', 'care for yourself', 'value yourself',
          '自爱', '自我关怀', '自我价值', '自尊', '自我接纳',
          '爱自己', '关心自己', '珍视自己'
        ],
        patterns: [
          /\b(be kind to yourself|treat yourself well|善待自己)\b/i,
          /\b(you are enough|你已经足够好)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'resilience',
        keywords: [
          'resilience', 'resilient', 'strength', 'strong', 'endure', 'persevere',
          'overcome', 'survive', 'tough', 'courage', 'brave', 'fight',
          '韧性', '坚强', '力量', '坚持', '克服', '生存', '勇气', '勇敢', '战斗'
        ],
        patterns: [
          /\b(bounce back|rise again|stand strong|重新振作|再次崛起|坚强站立)\b/i,
          /\b(weather the storm|度过风暴)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'hope',
        keywords: [
          'hope', 'hopeful', 'optimism', 'optimistic', 'future', 'tomorrow',
          'possibility', 'potential', 'bright', 'light', 'dawn', 'sunrise',
          '希望', '乐观', '未来', '明天', '可能性', '潜力', '光明', '光', '黎明', '日出'
        ],
        patterns: [
          /\b(there is hope|brighter days|light at the end|有希望|更美好的日子|隧道尽头的光)\b/i,
          /\b(never lose hope|永不失去希望)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'wisdom',
        keywords: [
          'wisdom', 'wise', 'learn', 'learning', 'knowledge', 'understand',
          'insight', 'experience', 'lesson', 'truth', 'reality', 'perspective',
          '智慧', '明智', '学习', '知识', '理解', '洞察', '经验', '教训', '真理', '现实', '观点'
        ],
        patterns: [
          /\b(life teaches|learn from|wisdom comes|生活教会|从中学习|智慧来自)\b/i,
          /\b(understand yourself|了解自己)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      },
      {
        category: 'gratitude',
        keywords: [
          'grateful', 'gratitude', 'thankful', 'appreciate', 'blessing',
          'blessed', 'cherish', 'treasure', 'value', 'gift',
          '感恩', '感谢', '感激', '珍惜', '祝福', '珍视', '宝藏', '价值', '礼物'
        ],
        patterns: [
          /\b(be grateful|count your blessings|appreciate what you have|要感恩|数算祝福|珍惜拥有)\b/i,
          /\b(thankful for|感谢)\b/i
        ],
        weight: 1.0,
        requiredScore: 0.5
      }
    ];
  }

  /**
   * 初始化情感标签规则
   */
  private initializeEmotionalTagRules(): void {
    this.emotionalTagRules = [
      {
        tag: 'calming',
        keywords: ['calm', 'peace', 'serene', 'tranquil', 'quiet', 'still', '平静', '宁静', '安详'],
        patterns: [/\b(find peace|inner calm|寻找平静|内心平静)\b/i],
        emotionalWeight: 1.0
      },
      {
        tag: 'uplifting',
        keywords: ['uplift', 'elevate', 'inspire', 'boost', 'raise', '提升', '激励', '鼓舞'],
        patterns: [/\b(lift your spirits|raise your mood|提升精神|改善心情)\b/i],
        emotionalWeight: 1.0
      },
      {
        tag: 'comforting',
        keywords: ['comfort', 'soothe', 'reassure', 'support', 'embrace', '安慰', '抚慰', '支持'],
        patterns: [/\b(you are not alone|everything will be okay|你并不孤单|一切都会好的)\b/i],
        emotionalWeight: 1.0
      },
      {
        tag: 'empowering',
        keywords: ['empower', 'strength', 'confident', 'capable', 'strong', '赋权', '力量', '自信', '能力'],
        patterns: [/\b(you have the power|believe in yourself|你有力量|相信自己)\b/i],
        emotionalWeight: 1.0
      },
      {
        tag: 'reflective',
        keywords: ['reflect', 'contemplate', 'ponder', 'think', 'consider', '反思', '思考', '考虑'],
        patterns: [/\b(look within|self-reflection|内省|自我反思)\b/i],
        emotionalWeight: 0.8
      },
      {
        tag: 'energizing',
        keywords: ['energy', 'energize', 'vitality', 'vigor', 'dynamic', '能量', '活力', '精力'],
        patterns: [/\b(full of energy|burst of life|充满活力|生命力爆发)\b/i],
        emotionalWeight: 1.0
      },
      {
        tag: 'grounding',
        keywords: ['ground', 'center', 'stable', 'foundation', 'root', '扎根', '中心', '稳定', '基础'],
        patterns: [/\b(stay grounded|find your center|保持扎根|找到中心)\b/i],
        emotionalWeight: 0.9
      },
      {
        tag: 'transformative',
        keywords: ['transform', 'change', 'evolve', 'grow', 'become', '转变', '改变', '进化', '成长'],
        patterns: [/\b(personal transformation|life-changing|个人转变|改变生活)\b/i],
        emotionalWeight: 1.0
      }
    ];
  }

  /**
   * 初始化情绪映射
   */
  private initializeMoodMappings(): void {
    this.moodMappings = new Map([
      ['calming', 'relaxation'],
      ['uplifting', 'motivation'],
      ['comforting', 'healing'],
      ['empowering', 'motivation'],
      ['reflective', 'focus'],
      ['energizing', 'motivation'],
      ['grounding', 'focus'],
      ['transformative', 'healing'],
      ['peaceful', 'relaxation'],
      ['joyful', 'motivation'],
      ['hopeful', 'motivation'],
      ['sad', 'healing'],
      ['anxious', 'anxiety'],
      ['stressed', 'stress'],
      ['depressed', 'depression'],
      ['sleepy', 'sleep'],
      ['focused', 'focus'],
      ['neutral', 'healing']
    ]);
  }

  /**
   * 延迟函数
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
