#!/usr/bin/env node

import { QuoteFetcher } from './fetchers/quote-fetcher.js';
import { DailyQuoteRecommendationSystem } from './services/daily-quote-recommender.js';
import { QuoteQualityAssessmentSystem } from './quality/quote-quality-assessor.js';
import { QuoteCategorizationSystemImpl } from './services/quote-categorization-system.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

async function testQuoteFetcher() {
  console.log('🧪 测试心理语录抓取系统...\n');

  try {
    const config = loadConfig();

    // 1. 测试语录抓取器基本功能
    console.log('1️⃣ 测试语录抓取器基本功能');
    const quoteFetcher = new QuoteFetcher(config, logger);

    // 测试创建语录对象
    const testQuoteData = {
      text: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      source: 'Test Source',
      category: 'motivation' as const,
      sourceUrl: 'https://example.com'
    };

    const quote = (quoteFetcher as any).createQuoteObject(testQuoteData);
    console.log('✅ 语录对象创建成功');
    console.log(`   ID: ${quote.id}`);
    console.log(`   文本: "${quote.text}"`);
    console.log(`   作者: ${quote.author}`);
    console.log(`   分类: ${quote.category}`);
    console.log(`   情绪: ${quote.mood}`);
    console.log(`   标签: ${quote.tags.join(', ')}`);

    // 测试长度验证
    const validLength = (quoteFetcher as any).isValidQuoteLength('This is a valid quote with appropriate length.');
    const invalidLength = (quoteFetcher as any).isValidQuoteLength('Short');
    console.log(`✅ 长度验证: 有效=${validLength}, 无效=${invalidLength}`);

    // 测试分类映射
    const category1 = (quoteFetcher as any).mapTopicToCategory('psychology');
    const category2 = (quoteFetcher as any).mapTopicToCategory('mental-health');
    console.log(`✅ 分类映射: psychology→${category1}, mental-health→${category2}`);

    console.log('\n2️⃣ 测试每日语录推荐系统');

    // 创建测试语录数据
    const mockQuotes = [
      {
        id: 'quote1',
        title: 'Motivation Quote',
        description: 'You can achieve anything you set your mind to.',
        text: 'You can achieve anything you set your mind to.',
        author: 'Test Author',
        type: 'article' as const,
        language: 'en',
        category: 'motivation' as const,
        mood: 'motivation' as const,
        tags: ['motivation', 'achievement'],
        categories: ['quotes'],
        therapeuticBenefit: ['增强动力'],
        targetAudience: ['general'],
        moodCategories: ['motivation' as const],
        sourceUrl: 'https://example.com',
        availability: { free: true, regions: ['global'], platforms: ['web'] },
        qualityScore: 0.8,
        shareCount: 0,
        viewCount: 0,
        publishDate: new Date(),
        difficultyLevel: 'beginner' as const
      },
      {
        id: 'quote2',
        title: 'Healing Quote',
        description: 'Time heals all wounds.',
        text: 'Time heals all wounds.',
        type: 'article' as const,
        language: 'en',
        category: 'healing' as const,
        mood: 'healing' as const,
        tags: ['healing', 'time'],
        categories: ['quotes'],
        therapeuticBenefit: ['情感治愈'],
        targetAudience: ['general'],
        moodCategories: ['healing' as const],
        sourceUrl: 'https://example.com',
        availability: { free: true, regions: ['global'], platforms: ['web'] },
        qualityScore: 0.9,
        shareCount: 0,
        viewCount: 0,
        publishDate: new Date(),
        difficultyLevel: 'beginner' as const
      },
      {
        id: 'quote3',
        title: 'Mindfulness Quote',
        description: 'Be present in the moment.',
        text: 'Be present in the moment.',
        type: 'article' as const,
        language: 'en',
        category: 'mindfulness' as const,
        mood: 'focus' as const,
        tags: ['mindfulness', 'present'],
        categories: ['quotes'],
        therapeuticBenefit: ['正念练习'],
        targetAudience: ['general'],
        moodCategories: ['focus' as const],
        sourceUrl: 'https://example.com',
        availability: { free: true, regions: ['global'], platforms: ['web'] },
        qualityScore: 0.85,
        shareCount: 0,
        viewCount: 0,
        publishDate: new Date(),
        difficultyLevel: 'beginner' as const
      }
    ];

    const recommender = new DailyQuoteRecommendationSystem(mockQuotes, logger);

    // 测试每日语录
    const dailyQuote = await recommender.getDailyQuote();
    console.log('✅ 每日语录获取成功');
    console.log(`   语录: "${dailyQuote.text}"`);
    console.log(`   分类: ${dailyQuote.category}`);

    // 测试按情绪获取
    const motivationQuote = await recommender.getQuoteByMood('motivation');
    console.log('✅ 按情绪获取语录成功');
    console.log(`   动力语录: "${motivationQuote.text}"`);

    // 测试一周语录
    const weeklyQuotes = await recommender.getWeeklyQuotes();
    console.log('✅ 一周语录获取成功');
    console.log(`   一周语录数量: ${weeklyQuotes.length}`);

    // 测试统计信息
    const stats = recommender.getRecommendationStats();
    console.log('✅ 推荐统计信息');
    console.log(`   总语录数: ${stats.totalQuotes}`);
    console.log(`   分类统计: ${JSON.stringify(stats.categoryCounts)}`);

    console.log('\n3️⃣ 测试语录质量评估系统');

    const qualityAssessor = new QuoteQualityAssessmentSystem(logger);

    // 测试质量评估
    const testQuote = mockQuotes[0];
    const qualityMetrics = await qualityAssessor.assessQuote(testQuote);
    console.log('✅ 语录质量评估成功');
    console.log(`   正面情感分数: ${qualityMetrics.positiveScore.toFixed(2)}`);
    console.log(`   心理健康相关性: ${qualityMetrics.mentalHealthRelevance.toFixed(2)}`);
    console.log(`   长度合适: ${qualityMetrics.appropriateLength}`);
    console.log(`   文化敏感性: ${qualityMetrics.culturalSensitivity.toFixed(2)}`);
    console.log(`   总体质量分数: ${qualityMetrics.overallScore.toFixed(2)}`);

    // 测试内容验证
    const isValid = await qualityAssessor.validateQuoteContent(testQuote);
    console.log(`✅ 内容验证: ${isValid ? '通过' : '未通过'}`);

    // 测试情感检测
    const positiveText = 'I am happy and grateful for this wonderful day.';
    const positiveScore = await qualityAssessor.detectPositiveSentiment(positiveText);
    console.log(`✅ 正面情感检测: ${positiveScore.toFixed(2)} (正面文本)`);

    const negativeText = 'I feel sad and hopeless.';
    const negativeScore = await qualityAssessor.detectPositiveSentiment(negativeText);
    console.log(`✅ 负面情感检测: ${negativeScore.toFixed(2)} (负面文本)`);

    console.log('\n4️⃣ 测试语录分类系统');

    const categorizer = new QuoteCategorizationSystemImpl(logger);

    // 测试分类
    const motivationTestQuote = {
      ...testQuote,
      text: 'You can achieve anything with motivation and determination.',
      category: 'wisdom' as const // 初始分类
    };

    const detectedCategory = await categorizer.categorizeQuote(motivationTestQuote);
    console.log('✅ 语录分类成功');
    console.log(`   原分类: ${motivationTestQuote.category}`);
    console.log(`   检测分类: ${detectedCategory}`);

    // 测试情绪检测
    const detectedMood = await categorizer.detectMood(motivationTestQuote);
    console.log(`✅ 情绪检测: ${detectedMood}`);

    // 测试情感标签
    const emotionalTags = await categorizer.addEmotionalTags(motivationTestQuote);
    console.log(`✅ 情感标签: ${emotionalTags.join(', ')}`);

    // 测试批量分类
    const categorizedQuotes = await categorizer.batchCategorize([motivationTestQuote]);
    console.log('✅ 批量分类成功');
    console.log(`   处理语录数: ${categorizedQuotes.length}`);
    console.log(`   最终分类: ${categorizedQuotes[0].category}`);
    console.log(`   最终标签: ${categorizedQuotes[0].tags.join(', ')}`);

    console.log('\n🎉 所有测试完成！心理语录抓取系统运行正常。');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuoteFetcher();
}
