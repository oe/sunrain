import { Quote, QuoteQualityMetrics } from '../fetchers/quote-fetcher.js';
import { Logger } from '@sunrain/shared';

/**
 * 语录质量评估系统
 */
export interface QuoteQualityAssessor {
  assessQuote(quote: Quote): Promise<QuoteQualityMetrics>;
  batchAssessQuotes(quotes: Quote[]): Promise<Map<string, QuoteQualityMetrics>>;
  validateQuoteContent(quote: Quote): Promise<boolean>;
  detectPositiveSentiment(text: string): Promise<number>;
  assessMentalHealthRelevance(text: string): Promise<number>;
  checkCulturalSensitivity(text: string): Promise<number>;
}

/**
 * 情感分析结果
 */
export interface SentimentAnalysisResult {
  score: number; // -1 到 1，-1最负面，1最正面
  confidence: number; // 0 到 1，置信度
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

/**
 * 心理健康相关性分析结果
 */
export interface MentalHealthRelevanceResult {
  score: number; // 0 到 1
  categories: {
    therapy: number;
    selfHelp: number;
    mindfulness: number;
    resilience: number;
    healing: number;
  };
  keywords: string[];
  therapeuticValue: number;
}

/**
 * 文化敏感性分析结果
 */
export interface CulturalSensitivityResult {
  score: number; // 0 到 1
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  recommendations: string[];
}

/**
 * 语录质量评估器实现
 */
export class QuoteQualityAssessmentSystem implements QuoteQualityAssessor {
  private logger: Logger;
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private mentalHealthKeywords: Set<string>;
  private culturalSensitivityRules: CulturalRule[];

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeWordSets();
    this.initializeCulturalRules();
  }

  /**
   * 评估单个语录质量
   */
  async assessQuote(quote: Quote): Promise<QuoteQualityMetrics> {
    this.logger.debug(`评估语录质量: ${quote.id}`);

    const [
      positiveScore,
      mentalHealthRelevance,
      culturalSensitivity
    ] = await Promise.all([
      this.detectPositiveSentiment(quote.text),
      this.assessMentalHealthRelevance(quote.text),
      this.checkCulturalSensitivity(quote.text)
    ]);

    const appropriateLength = this.checkLength(quote.text);

    // 计算综合质量分数
    const overallScore = this.calculateOverallScore({
      positiveScore,
      mentalHealthRelevance,
      appropriateLength,
      culturalSensitivity
    });

    const metrics: QuoteQualityMetrics = {
      positiveScore,
      mentalHealthRelevance,
      appropriateLength,
      culturalSensitivity,
      overallScore
    };

    this.logger.debug(`语录 ${quote.id} 质量评估完成，总分: ${overallScore.toFixed(2)}`);
    return metrics;
  }

  /**
   * 批量评估语录质量
   */
  async batchAssessQuotes(quotes: Quote[]): Promise<Map<string, QuoteQualityMetrics>> {
    this.logger.info(`开始批量评估 ${quotes.length} 条语录的质量`);

    const results = new Map<string, QuoteQualityMetrics>();
    const batchSize = 10; // 批处理大小

    for (let i = 0; i < quotes.length; i += batchSize) {
      const batch = quotes.slice(i, i + batchSize);
      const batchPromises = batch.map(async (quote) => {
        const metrics = await this.assessQuote(quote);
        return { id: quote.id, metrics };
      });

      const batchResults = await Promise.all(batchPromises);

      for (const { id, metrics } of batchResults) {
        results.set(id, metrics);
      }

      // 避免过度请求
      if (i + batchSize < quotes.length) {
        await this.delay(100);
      }
    }

    this.logger.info(`批量质量评估完成，处理了 ${results.size} 条语录`);
    return results;
  }

  /**
   * 验证语录内容
   */
  async validateQuoteContent(quote: Quote): Promise<boolean> {
    // 基本验证
    if (!quote.text || quote.text.trim().length === 0) {
      return false;
    }

    // 长度验证
    if (!this.checkLength(quote.text)) {
      return false;
    }

    // 内容质量验证
    const metrics = await this.assessQuote(quote);

    // 设定最低质量标准
    const minQualityThreshold = 0.6;
    const minPositiveScore = 0.4;
    const minCulturalSensitivity = 0.7;

    return (
      metrics.overallScore >= minQualityThreshold &&
      metrics.positiveScore >= minPositiveScore &&
      metrics.culturalSensitivity >= minCulturalSensitivity
    );
  }

  /**
   * 检测正面情感
   */
  async detectPositiveSentiment(text: string): Promise<number> {
    const analysis = await this.analyzeSentiment(text);

    // 转换为0-1分数
    const normalizedScore = (analysis.score + 1) / 2;

    // 考虑置信度
    return normalizedScore * analysis.confidence;
  }

  /**
   * 评估心理健康相关性
   */
  async assessMentalHealthRelevance(text: string): Promise<number> {
    const analysis = await this.analyzeMentalHealthRelevance(text);
    return analysis.score;
  }

  /**
   * 检查文化敏感性
   */
  async checkCulturalSensitivity(text: string): Promise<number> {
    const analysis = await this.analyzeCulturalSensitivity(text);
    return analysis.score;
  }

  /**
   * 情感分析
   */
  private async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    const words = this.tokenizeText(text);
    let positiveCount = 0;
    let negativeCount = 0;
    const positiveKeywords: string[] = [];
    const negativeKeywords: string[] = [];
    const neutralKeywords: string[] = [];

    for (const word of words) {
      const lowerWord = word.toLowerCase();

      if (this.positiveWords.has(lowerWord)) {
        positiveCount++;
        positiveKeywords.push(word);
      } else if (this.negativeWords.has(lowerWord)) {
        negativeCount++;
        negativeKeywords.push(word);
      } else {
        neutralKeywords.push(word);
      }
    }

    const totalEmotionalWords = positiveCount + negativeCount;
    let score = 0;
    let confidence = 0;

    if (totalEmotionalWords > 0) {
      score = (positiveCount - negativeCount) / totalEmotionalWords;
      confidence = Math.min(1, totalEmotionalWords / words.length * 2);
    } else {
      score = 0; // 中性
      confidence = 0.5;
    }

    // 简化的情感分类
    const emotions = {
      joy: positiveCount > 0 ? positiveCount / words.length : 0,
      sadness: negativeCount > 0 ? negativeCount / words.length * 0.3 : 0,
      anger: this.countWordsContaining(words, ['anger', 'hate', 'fury', '愤怒', '仇恨']) / words.length,
      fear: this.countWordsContaining(words, ['fear', 'afraid', 'scary', '恐惧', '害怕']) / words.length,
      surprise: this.countWordsContaining(words, ['surprise', 'amazing', 'wow', '惊讶', '惊奇']) / words.length,
      disgust: this.countWordsContaining(words, ['disgust', 'gross', 'awful', '厌恶', '恶心']) / words.length
    };

    return {
      score,
      confidence,
      emotions,
      keywords: {
        positive: positiveKeywords,
        negative: negativeKeywords,
        neutral: neutralKeywords
      }
    };
  }

  /**
   * 心理健康相关性分析
   */
  private async analyzeMentalHealthRelevance(text: string): Promise<MentalHealthRelevanceResult> {
    const words = this.tokenizeText(text);
    const lowerText = text.toLowerCase();

    let relevanceScore = 0;
    const foundKeywords: string[] = [];

    // 检查心理健康关键词
    for (const keyword of this.mentalHealthKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        relevanceScore += 0.1;
        foundKeywords.push(keyword);
      }
    }

    // 分类评分
    const categories = {
      therapy: this.calculateCategoryScore(lowerText, [
        'therapy', 'therapist', 'counseling', 'treatment', 'healing',
        '治疗', '心理医生', '咨询', '康复'
      ]),
      selfHelp: this.calculateCategoryScore(lowerText, [
        'self-help', 'self-care', 'personal growth', 'improvement',
        '自助', '自我关怀', '个人成长', '改善'
      ]),
      mindfulness: this.calculateCategoryScore(lowerText, [
        'mindfulness', 'meditation', 'awareness', 'present',
        '正念', '冥想', '觉察', '当下'
      ]),
      resilience: this.calculateCategoryScore(lowerText, [
        'resilience', 'strength', 'overcome', 'endure',
        '韧性', '坚强', '克服', '坚持'
      ]),
      healing: this.calculateCategoryScore(lowerText, [
        'healing', 'recovery', 'restore', 'mend',
        '治愈', '康复', '恢复', '修复'
      ])
    };

    // 计算治疗价值
    const therapeuticValue = Math.min(1, (
      categories.therapy * 0.3 +
      categories.selfHelp * 0.2 +
      categories.mindfulness * 0.2 +
      categories.resilience * 0.15 +
      categories.healing * 0.15
    ));

    // 综合评分
    const finalScore = Math.min(1, relevanceScore + therapeuticValue * 0.5);

    return {
      score: finalScore,
      categories,
      keywords: foundKeywords,
      therapeuticValue
    };
  }

  /**
   * 文化敏感性分析
   */
  private async analyzeCulturalSensitivity(text: string): Promise<CulturalSensitivityResult> {
    const lowerText = text.toLowerCase();
    const issues: CulturalSensitivityResult['issues'] = [];
    const recommendations: string[] = [];

    // 应用文化敏感性规则
    for (const rule of this.culturalSensitivityRules) {
      if (rule.pattern.test(lowerText)) {
        issues.push({
          type: rule.type,
          severity: rule.severity,
          description: rule.description
        });

        if (rule.recommendation) {
          recommendations.push(rule.recommendation);
        }
      }
    }

    // 计算分数（问题越多分数越低）
    let score = 1.0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'high':
          score -= 0.4;
          break;
        case 'medium':
          score -= 0.2;
          break;
        case 'low':
          score -= 0.1;
          break;
      }
    }

    score = Math.max(0, score);

    return {
      score,
      issues,
      recommendations
    };
  }

  /**
   * 计算综合质量分数
   */
  private calculateOverallScore(metrics: {
    positiveScore: number;
    mentalHealthRelevance: number;
    appropriateLength: boolean;
    culturalSensitivity: number;
  }): number {
    const weights = {
      positive: 0.3,
      relevance: 0.3,
      length: 0.2,
      cultural: 0.2
    };

    return (
      metrics.positiveScore * weights.positive +
      metrics.mentalHealthRelevance * weights.relevance +
      (metrics.appropriateLength ? 1 : 0) * weights.length +
      metrics.culturalSensitivity * weights.cultural
    );
  }

  /**
   * 检查长度是否合适
   */
  private checkLength(text: string): boolean {
    const length = text.trim().length;
    return length >= 10 && length <= 280;
  }

  /**
   * 计算分类分数
   */
  private calculateCategoryScore(text: string, keywords: string[]): number {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 0.2;
      }
    }
    return Math.min(1, score);
  }

  /**
   * 统计包含特定词汇的数量
   */
  private countWordsContaining(words: string[], patterns: string[]): number {
    let count = 0;
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      for (const pattern of patterns) {
        if (lowerWord.includes(pattern.toLowerCase())) {
          count++;
          break;
        }
      }
    }
    return count;
  }

  /**
   * 文本分词
   */
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * 初始化词汇集合
   */
  private initializeWordSets(): void {
    this.positiveWords = new Set([
      // 英文正面词汇
      'love', 'hope', 'joy', 'peace', 'happy', 'blessed', 'grateful', 'strong',
      'courage', 'brave', 'confident', 'positive', 'optimistic', 'inspire',
      'motivate', 'empower', 'heal', 'growth', 'success', 'achieve', 'overcome',
      'resilient', 'beautiful', 'wonderful', 'amazing', 'excellent', 'great',
      'good', 'better', 'best', 'perfect', 'brilliant', 'fantastic', 'awesome',
      'calm', 'serene', 'peaceful', 'tranquil', 'gentle', 'kind', 'caring',
      'compassionate', 'understanding', 'supportive', 'encouraging', 'uplifting',

      // 中文正面词汇
      '爱', '希望', '快乐', '和平', '幸福', '感恩', '坚强', '勇气',
      '勇敢', '自信', '积极', '乐观', '激励', '鼓舞', '赋权', '治愈',
      '成长', '成功', '实现', '克服', '韧性', '美丽', '美好', '惊人',
      '优秀', '伟大', '好', '更好', '最好', '完美', '杰出', '奇妙',
      '平静', '宁静', '和平', '安详', '温和', '善良', '关怀',
      '同情', '理解', '支持', '鼓励', '提升'
    ]);

    this.negativeWords = new Set([
      // 英文负面词汇
      'hate', 'anger', 'sad', 'depressed', 'anxious', 'fear', 'afraid',
      'worried', 'stressed', 'overwhelmed', 'hopeless', 'worthless', 'failure',
      'defeat', 'give up', 'quit', 'impossible', 'never', 'can\'t', 'won\'t',
      'terrible', 'awful', 'horrible', 'disgusting', 'ugly', 'stupid', 'dumb',
      'useless', 'pathetic', 'weak', 'coward', 'loser', 'victim', 'suffer',
      'pain', 'hurt', 'damage', 'destroy', 'ruin', 'break', 'shatter',

      // 中文负面词汇
      '仇恨', '愤怒', '悲伤', '抑郁', '焦虑', '恐惧', '害怕',
      '担心', '压力', '不知所措', '绝望', '无价值', '失败',
      '失败', '放弃', '退出', '不可能', '从不', '不能', '不会',
      '可怕', '糟糕', '恐怖', '恶心', '丑陋', '愚蠢', '笨',
      '无用', '可悲', '软弱', '懦夫', '失败者', '受害者', '痛苦',
      '疼痛', '伤害', '损害', '破坏', '毁灭', '打破', '粉碎'
    ]);

    this.mentalHealthKeywords = new Set([
      // 英文心理健康关键词
      'mental health', 'psychology', 'therapy', 'counseling', 'mindfulness',
      'meditation', 'anxiety', 'depression', 'stress', 'wellness', 'self-care',
      'emotional', 'healing', 'recovery', 'resilience', 'coping', 'therapeutic',
      'psychiatry', 'psychotherapy', 'wellbeing', 'self-help', 'personal growth',
      'emotional regulation', 'trauma', 'ptsd', 'bipolar', 'ocd', 'adhd',
      'panic', 'phobia', 'addiction', 'substance abuse', 'eating disorder',

      // 中文心理健康关键词
      '心理健康', '心理学', '治疗', '心理咨询', '正念',
      '冥想', '焦虑', '抑郁', '压力', '健康', '自我关怀',
      '情绪', '治愈', '康复', '韧性', '应对', '治疗性',
      '精神科', '心理治疗', '幸福感', '自助', '个人成长',
      '情绪调节', '创伤', '创伤后应激障碍', '双相情感障碍', '强迫症', '注意缺陷多动障碍',
      '恐慌', '恐惧症', '成瘾', '物质滥用', '饮食障碍'
    ]);
  }

  /**
   * 初始化文化敏感性规则
   */
  private initializeCulturalRules(): void {
    this.culturalSensitivityRules = [
      {
        type: 'suicide_reference',
        pattern: /\b(suicide|kill myself|end it all|自杀|结束生命)\b/i,
        severity: 'high',
        description: '包含自杀相关内容',
        recommendation: '避免直接提及自杀，改为提供希望和支持资源'
      },
      {
        type: 'self_harm',
        pattern: /\b(self.harm|cut myself|hurt myself|自残|伤害自己)\b/i,
        severity: 'high',
        description: '包含自残相关内容',
        recommendation: '避免描述自残行为，专注于健康的应对方式'
      },
      {
        type: 'discrimination',
        pattern: /\b(racist|sexist|homophobic|种族歧视|性别歧视|同性恋恐惧)\b/i,
        severity: 'high',
        description: '包含歧视性内容',
        recommendation: '确保内容包容和尊重所有群体'
      },
      {
        type: 'religious_insensitivity',
        pattern: /\b(god is fake|religion is stupid|宗教是愚蠢的)\b/i,
        severity: 'medium',
        description: '可能对宗教不敏感',
        recommendation: '尊重不同的宗教信仰和价值观'
      },
      {
        type: 'cultural_stereotype',
        pattern: /\b(all .* are|所有.*都是)\b/i,
        severity: 'medium',
        description: '可能包含文化刻板印象',
        recommendation: '避免概括性陈述，尊重个体差异'
      },
      {
        type: 'toxic_positivity',
        pattern: /\b(just think positive|just be happy|只要积极思考|只要开心就好)\b/i,
        severity: 'low',
        description: '可能包含有毒的积极性',
        recommendation: '承认负面情绪的合理性，提供实际的支持'
      }
    ];
  }

  /**
   * 延迟函数
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 文化敏感性规则接口
 */
interface CulturalRule {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation?: string;
}
