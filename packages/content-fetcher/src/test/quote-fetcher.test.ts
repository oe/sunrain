import { describe, it, expect, beforeEach } from 'vitest';
import { QuoteFetcher, Quote } from '../fetchers/quote-fetcher.js';
import { DailyQuoteRecommendationSystem } from '../services/daily-quote-recommender.js';
import { QuoteQualityAssessmentSystem } from '../quality/quote-quality-assessor.js';
import { QuoteCategorizationSystemImpl } from '../services/quote-categorization-system.js';
import { loadConfig } from '../config.js';
import { logger } from '../logger.js';

describe('QuoteFetcher', () => {
  let quoteFetcher: QuoteFetcher;
  let config: any;

  beforeEach(() => {
    config = loadConfig();
    quoteFetcher = new QuoteFetcher(config, logger);
  });

  it('should create quote objects with required properties', () => {
    const mockQuoteData = {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      source: 'Test Source',
      category: 'motivation' as const,
      sourceUrl: 'https://example.com'
    };

    // Test the private method through reflection (for testing purposes)
    const quote = (quoteFetcher as any).createQuoteObject(mockQuoteData);

    expect(quote).toHaveProperty('id');
    expect(quote).toHaveProperty('text', mockQuoteData.text);
    expect(quote).toHaveProperty('author', mockQuoteData.author);
    expect(quote).toHaveProperty('category', mockQuoteData.category);
    expect(quote).toHaveProperty('mood');
    expect(quote).toHaveProperty('tags');
    expect(quote).toHaveProperty('therapeuticBenefit');
    expect(quote).toHaveProperty('qualityScore');
    expect(quote.type).toBe('article');
  });

  it('should validate quote length correctly', () => {
    const validQuote = 'This is a valid quote with appropriate length.';
    const tooShort = 'Short';
    const tooLong = 'A'.repeat(300);

    expect((quoteFetcher as any).isValidQuoteLength(validQuote)).toBe(true);
    expect((quoteFetcher as any).isValidQuoteLength(tooShort)).toBe(false);
    expect((quoteFetcher as any).isValidQuoteLength(tooLong)).toBe(false);
  });

  it('should map topics to categories correctly', () => {
    expect((quoteFetcher as any).mapTopicToCategory('psychology')).toBe('wisdom');
    expect((quoteFetcher as any).mapTopicToCategory('mental-health')).toBe('healing');
    expect((quoteFetcher as any).mapTopicToCategory('mindfulness')).toBe('mindfulness');
    expect((quoteFetcher as any).mapTopicToCategory('unknown')).toBe('wisdom');
  });

  it('should infer mood from category correctly', () => {
    expect((quoteFetcher as any).inferMoodFromCategory('motivation')).toBe('motivation');
    expect((quoteFetcher as any).inferMoodFromCategory('healing')).toBe('healing');
    expect((quoteFetcher as any).inferMoodFromCategory('mindfulness')).toBe('focus');
    expect((quoteFetcher as any).inferMoodFromCategory('gratitude')).toBe('relaxation');
  });

  it('should get therapeutic benefits for categories', () => {
    const motivationBenefits = (quoteFetcher as any).getTherapeuticBenefits('motivation');
    expect(motivationBenefits).toContain('增强动力');
    expect(motivationBenefits).toContain('提升自信');

    const healingBenefits = (quoteFetcher as any).getTherapeuticBenefits('healing');
    expect(healingBenefits).toContain('情感治愈');
    expect(healingBenefits).toContain('心理康复');
  });
});

describe('DailyQuoteRecommendationSystem', () => {
  let recommender: DailyQuoteRecommendationSystem;
  let mockQuotes: Quote[];

  beforeEach(() => {
    mockQuotes = [
      {
        id: 'quote1',
        title: 'Motivation Quote',
        description: 'You can achieve anything you set your mind to.',
        text: 'You can achieve anything you set your mind to.',
        author: 'Test Author',
        type: 'article',
        language: 'en',
        category: 'motivation',
        mood: 'motivation',
        tags: ['motivation', 'achievement'],
        categories: ['quotes'],
        therapeuticBenefit: ['增强动力'],
        targetAudience: ['general'],
        moodCategories: ['motivation'],
        sourceUrl: 'https://example.com',
        availability: { free: true, regions: ['global'], platforms: ['web'] },
        qualityScore: 0.8,
        shareCount: 0,
        viewCount: 0,
        publishDate: new Date(),
        difficultyLevel: 'beginner'
      },
      {
        id: 'quote2',
        title: 'Healing Quote',
        description: 'Time heals all wounds.',
        text: 'Time heals all wounds.',
        type: 'article',
        language: 'en',
        category: 'healing',
        mood: 'healing',
        tags: ['healing', 'time'],
        categories: ['quotes'],
        therapeuticBenefit: ['情感治愈'],
        targetAudience: ['general'],
        moodCategories: ['healing'],
        sourceUrl: 'https://example.com',
        availability: { free: true, regions: ['global'], platforms: ['web'] },
        qualityScore: 0.9,
        shareCount: 0,
        viewCount: 0,
        publishDate: new Date(),
        difficultyLevel: 'beginner'
      }
    ];

    recommender = new DailyQuoteRecommendationSystem(mockQuotes, logger);
  });

  it('should return a daily quote', async () => {
    const dailyQuote = await recommender.getDailyQuote();
    expect(dailyQuote).toBeDefined();
    expect(mockQuotes).toContain(dailyQuote);
  });

  it('should return the same quote for the same date', async () => {
    const date = new Date('2024-01-01');
    const quote1 = await recommender.getDailyQuote(date);
    const quote2 = await recommender.getDailyQuote(date);
    expect(quote1.id).toBe(quote2.id);
  });

  it('should return quotes by mood', async () => {
    const motivationQuote = await recommender.getQuoteByMood('motivation');
    expect(motivationQuote.mood).toBe('motivation');

    const healingQuote = await recommender.getQuoteByMood('healing');
    expect(healingQuote.mood).toBe('healing');
  });

  it('should return quotes by category', async () => {
    const motivationQuote = await recommender.getQuoteByCategory('motivation');
    expect(motivationQuote.category).toBe('motivation');

    const healingQuote = await recommender.getQuoteByCategory('healing');
    expect(healingQuote.category).toBe('healing');
  });

  it('should return weekly quotes', async () => {
    const weeklyQuotes = await recommender.getWeeklyQuotes();
    expect(weeklyQuotes).toHaveLength(7);
    weeklyQuotes.forEach(quote => {
      expect(mockQuotes).toContain(quote);
    });
  });

  it('should return motivational sequence', async () => {
    const sequence = await recommender.getMotivationalSequence(5);
    expect(sequence).toHaveLength(5);
    sequence.forEach(quote => {
      expect(mockQuotes).toContain(quote);
    });
  });

  it('should provide recommendation stats', () => {
    const stats = recommender.getRecommendationStats();
    expect(stats.totalQuotes).toBe(2);
    expect(stats.categoryCounts).toHaveProperty('motivation', 1);
    expect(stats.categoryCounts).toHaveProperty('healing', 1);
    expect(stats.moodCounts).toHaveProperty('motivation', 1);
    expect(stats.moodCounts).toHaveProperty('healing', 1);
  });
});

describe('QuoteQualityAssessmentSystem', () => {
  let qualityAssessor: QuoteQualityAssessmentSystem;
  let mockQuote: Quote;

  beforeEach(() => {
    qualityAssessor = new QuoteQualityAssessmentSystem(logger);
    mockQuote = {
      id: 'test-quote',
      title: 'Test Quote',
      description: 'This is a positive and healing quote about mental health.',
      text: 'This is a positive and healing quote about mental health.',
      type: 'article',
      language: 'en',
      category: 'healing',
      mood: 'healing',
      tags: ['healing', 'positive'],
      categories: ['quotes'],
      therapeuticBenefit: ['情感治愈'],
      targetAudience: ['general'],
      moodCategories: ['healing'],
      sourceUrl: 'https://example.com',
      availability: { free: true, regions: ['global'], platforms: ['web'] },
      qualityScore: 0.8,
      shareCount: 0,
      viewCount: 0,
      publishDate: new Date(),
      difficultyLevel: 'beginner'
    };
  });

  it('should assess quote quality', async () => {
    const metrics = await qualityAssessor.assessQuote(mockQuote);

    expect(metrics).toHaveProperty('positiveScore');
    expect(metrics).toHaveProperty('mentalHealthRelevance');
    expect(metrics).toHaveProperty('appropriateLength');
    expect(metrics).toHaveProperty('culturalSensitivity');
    expect(metrics).toHaveProperty('overallScore');

    expect(metrics.positiveScore).toBeGreaterThan(0);
    expect(metrics.mentalHealthRelevance).toBeGreaterThan(0);
    expect(metrics.appropriateLength).toBe(true);
    expect(metrics.culturalSensitivity).toBeGreaterThan(0);
    expect(metrics.overallScore).toBeGreaterThan(0);
  });

  it('should validate quote content', async () => {
    const isValid = await qualityAssessor.validateQuoteContent(mockQuote);
    expect(isValid).toBe(true);

    // Test invalid quote (too short)
    const invalidQuote = { ...mockQuote, text: 'Short' };
    const isInvalid = await qualityAssessor.validateQuoteContent(invalidQuote);
    expect(isInvalid).toBe(false);
  });

  it('should detect positive sentiment', async () => {
    const positiveText = 'I am happy and grateful for this wonderful day.';
    const positiveScore = await qualityAssessor.detectPositiveSentiment(positiveText);
    expect(positiveScore).toBeGreaterThan(0.5);

    const negativeText = 'I hate everything and feel terrible.';
    const negativeScore = await qualityAssessor.detectPositiveSentiment(negativeText);
    expect(negativeScore).toBeLessThan(0.5);
  });

  it('should assess mental health relevance', async () => {
    const relevantText = 'Mental health therapy and healing are important for wellness.';
    const relevanceScore = await qualityAssessor.assessMentalHealthRelevance(relevantText);
    expect(relevanceScore).toBeGreaterThan(0);

    const irrelevantText = 'The weather is nice today.';
    const irrelevanceScore = await qualityAssessor.assessMentalHealthRelevance(irrelevantText);
    expect(irrelevanceScore).toBeLessThanOrEqual(relevanceScore);
  });

  it('should check cultural sensitivity', async () => {
    const sensitiveText = 'Everyone deserves respect and understanding.';
    const sensitiveScore = await qualityAssessor.checkCulturalSensitivity(sensitiveText);
    expect(sensitiveScore).toBeGreaterThan(0.8);

    const insensitiveText = 'All people from that group are the same.';
    const insensitiveScore = await qualityAssessor.checkCulturalSensitivity(insensitiveText);
    expect(insensitiveScore).toBeLessThan(sensitiveScore);
  });
});

describe('QuoteCategorizationSystemImpl', () => {
  let categorizer: QuoteCategorizationSystemImpl;
  let mockQuote: Quote;

  beforeEach(() => {
    categorizer = new QuoteCategorizationSystemImpl(logger);
    mockQuote = {
      id: 'test-quote',
      title: 'Test Quote',
      description: 'You can achieve anything with motivation and determination.',
      text: 'You can achieve anything with motivation and determination.',
      type: 'article',
      language: 'en',
      category: 'wisdom', // Initial category
      mood: 'healing', // Initial mood
      tags: ['test'],
      categories: ['quotes'],
      therapeuticBenefit: ['心理健康支持'],
      targetAudience: ['general'],
      moodCategories: ['healing'],
      sourceUrl: 'https://example.com',
      availability: { free: true, regions: ['global'], platforms: ['web'] },
      qualityScore: 0.8,
      shareCount: 0,
      viewCount: 0,
      publishDate: new Date(),
      difficultyLevel: 'beginner'
    };
  });

  it('should categorize quote correctly', async () => {
    const category = await categorizer.categorizeQuote(mockQuote);
    expect(category).toBe('motivation'); // Should detect motivation from content
  });

  it('should detect mood correctly', async () => {
    const mood = await categorizer.detectMood(mockQuote);
    expect(['motivation', 'healing', 'focus']).toContain(mood);
  });

  it('should add emotional tags', async () => {
    const tags = await categorizer.addEmotionalTags(mockQuote);
    expect(tags).toBeInstanceOf(Array);
    expect(tags.length).toBeGreaterThan(0);
  });

  it('should validate categorization', () => {
    const validQuote = { ...mockQuote, category: 'motivation' as const };
    const isValid = categorizer.validateCategorization(validQuote);
    expect(isValid).toBe(true);
  });

  it('should suggest recategorization', async () => {
    const suggestions = await categorizer.suggestRecategorization(mockQuote);
    expect(suggestions).toBeInstanceOf(Array);
    expect(suggestions).toContain('motivation');
  });

  it('should batch categorize quotes', async () => {
    const quotes = [mockQuote];
    const categorized = await categorizer.batchCategorize(quotes);

    expect(categorized).toHaveLength(1);
    expect(categorized[0].category).toBe('motivation');
    expect(categorized[0].tags.length).toBeGreaterThan(mockQuote.tags.length);
  });
});
