#!/usr/bin/env node

import { QuoteFetcher } from './fetchers/quote-fetcher.js';
import { DailyQuoteRecommendationSystem } from './services/daily-quote-recommender.js';
import { QuoteQualityAssessmentSystem } from './quality/quote-quality-assessor.js';
import { QuoteCategorizationSystemImpl } from './services/quote-categorization-system.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';
import fs from 'fs/promises';

async function demoQuoteSystem() {
  console.log('🌟 心理语录抓取系统演示\n');

  try {
    const config = loadConfig();

    // 创建一些示例语录数据（模拟抓取结果）
    console.log('📝 创建示例语录数据...');
    const quoteFetcher = new QuoteFetcher(config, logger);

    const sampleQuoteData = [
      {
        text: '你比你想象的更勇敢，比你看起来的更强大，比你认为的更聪明。',
        author: 'A.A. Milne',
        source: 'Winnie the Pooh',
        category: 'motivation' as const,
        sourceUrl: 'https://example.com/quote1'
      },
      {
        text: '治愈不是忘记痛苦，而是学会与它和平共处。',
        author: '未知',
        source: 'Wisdom Collection',
        category: 'healing' as const,
        sourceUrl: 'https://example.com/quote2'
      },
      {
        text: '正念就是有意识地、不带评判地关注当下时刻。',
        author: 'Jon Kabat-Zinn',
        source: 'Mindfulness Practice',
        category: 'mindfulness' as const,
        sourceUrl: 'https://example.com/quote3'
      },
      {
        text: '爱自己不是自私，而是必需。你无法从空杯中倒出水来。',
        author: '未知',
        source: 'Self-Care Wisdom',
        category: 'self-love' as const,
        sourceUrl: 'https://example.com/quote4'
      },
      {
        text: '韧性不是避免跌倒，而是学会如何重新站起来。',
        author: '未知',
        source: 'Resilience Guide',
        category: 'resilience' as const,
        sourceUrl: 'https://example.com/quote5'
      },
      {
        text: '希望是黑暗中的一盏明灯，指引我们走向更美好的明天。',
        author: '未知',
        source: 'Hope Collection',
        category: 'hope' as const,
        sourceUrl: 'https://example.com/quote6'
      },
      {
        text: '智慧不在于知道所有答案，而在于问对问题。',
        author: '未知',
        source: 'Wisdom Quotes',
        category: 'wisdom' as const,
        sourceUrl: 'https://example.com/quote7'
      },
      {
        text: '感恩是一种选择，它能将平凡的日子变成感恩节，将例行工作变成快乐，将普通机会变成祝福。',
        author: 'William Arthur Ward',
        source: 'Gratitude Wisdom',
        category: 'gratitude' as const,
        sourceUrl: 'https://example.com/quote8'
      }
    ];

    // 创建语录对象
    const quotes = sampleQuoteData.map(data =>
      (quoteFetcher as any).createQuoteObject(data)
    );

    console.log(`✅ 创建了 ${quotes.length} 条示例语录\n`);

    // 1. 质量评估演示
    console.log('🔍 1. 语录质量评估演示');
    console.log('=' .repeat(50));

    const qualityAssessor = new QuoteQualityAssessmentSystem(logger);

    for (let i = 0; i < Math.min(3, quotes.length); i++) {
      const quote = quotes[i];
      const metrics = await qualityAssessor.assessQuote(quote);

      console.log(`\n语录 ${i + 1}: "${quote.text}"`);
      console.log(`作者: ${quote.author || '未知'}`);
      console.log(`质量评估:`);
      console.log(`  正面情感: ${(metrics.positiveScore * 100).toFixed(1)}%`);
      console.log(`  心理健康相关性: ${(metrics.mentalHealthRelevance * 100).toFixed(1)}%`);
      console.log(`  长度合适: ${metrics.appropriateLength ? '✅' : '❌'}`);
      console.log(`  文化敏感性: ${(metrics.culturalSensitivity * 100).toFixed(1)}%`);
      console.log(`  总体质量: ${(metrics.overallScore * 100).toFixed(1)}%`);
    }

    // 2. 分类和标签演示
    console.log('\n\n🏷️  2. 语录分类和情感标签演示');
    console.log('=' .repeat(50));

    const categorizer = new QuoteCategorizationSystemImpl(logger);
    const categorizedQuotes = await categorizer.batchCategorize(quotes);

    // 按分类统计
    const categoryStats = categorizedQuotes.reduce((stats, quote) => {
      stats[quote.category] = (stats[quote.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    console.log('\n分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      const categoryNames: Record<string, string> = {
        'motivation': '动力激励',
        'healing': '治愈康复',
        'mindfulness': '正念冥想',
        'self-love': '自我关爱',
        'resilience': '韧性坚强',
        'hope': '希望光明',
        'wisdom': '智慧启发',
        'gratitude': '感恩珍惜'
      };
      console.log(`  ${categoryNames[category] || category}: ${count} 条`);
    });

    // 显示每个分类的示例
    console.log('\n分类示例:');
    const categoryExamples = Object.keys(categoryStats);
    for (const category of categoryExamples.slice(0, 4)) {
      const example = categorizedQuotes.find(q => q.category === category);
      if (example) {
        console.log(`\n📌 ${category.toUpperCase()}`);
        console.log(`   "${example.text}"`);
        console.log(`   标签: ${example.tags.slice(0, 5).join(', ')}`);
      }
    }

    // 3. 每日推荐演示
    console.log('\n\n📅 3. 每日语录推荐演示');
    console.log('=' .repeat(50));

    const recommender = new DailyQuoteRecommendationSystem(categorizedQuotes, logger);

    // 今日语录
    const todayQuote = await recommender.getDailyQuote();
    console.log('\n🌅 今日语录:');
    console.log(`"${todayQuote.text}"`);
    console.log(`— ${todayQuote.author || '未知'}`);
    console.log(`分类: ${todayQuote.category} | 情绪: ${todayQuote.mood}`);

    // 按情绪推荐
    console.log('\n😊 按情绪推荐:');
    const moods = ['motivation', 'healing', 'relaxation', 'focus'];
    for (const mood of moods) {
      try {
        const moodQuote = await recommender.getQuoteByMood(mood as any);
        const moodNames: Record<string, string> = {
          'motivation': '动力',
          'healing': '治愈',
          'relaxation': '放松',
          'focus': '专注'
        };
        console.log(`  ${moodNames[mood]}: "${moodQuote.text.substring(0, 30)}..."`);
      } catch (error) {
        console.log(`  ${mood}: 暂无相关语录`);
      }
    }

    // 一周语录预览
    console.log('\n📆 本周语录预览:');
    const weeklyQuotes = await recommender.getWeeklyQuotes();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    weeklyQuotes.slice(0, 3).forEach((quote, index) => {
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      console.log(`  ${weekdays[date.getDay()]}: "${quote.text.substring(0, 40)}..."`);
    });

    // 4. 个性化推荐演示
    console.log('\n\n🎯 4. 个性化推荐演示');
    console.log('=' .repeat(50));

    const userPreferences = [
      {
        name: '焦虑用户',
        preferences: {
          favoriteCategories: ['healing', 'mindfulness'],
          preferredMoods: ['relaxation', 'healing'],
          language: 'zh',
          timeOfDay: 'evening' as const,
          currentChallenges: ['anxiety']
        }
      },
      {
        name: '动力寻求者',
        preferences: {
          favoriteCategories: ['motivation', 'resilience'],
          preferredMoods: ['motivation'],
          language: 'zh',
          timeOfDay: 'morning' as const,
          currentChallenges: ['confidence']
        }
      },
      {
        name: '正念练习者',
        preferences: {
          favoriteCategories: ['mindfulness', 'wisdom'],
          preferredMoods: ['focus', 'relaxation'],
          language: 'zh',
          timeOfDay: 'afternoon' as const,
          personalityType: 'introvert' as const
        }
      }
    ];

    for (const user of userPreferences) {
      try {
        const personalizedQuote = await recommender.getPersonalizedQuote(user.preferences);
        console.log(`\n👤 ${user.name}:`);
        console.log(`   "${personalizedQuote.text}"`);
        console.log(`   分类: ${personalizedQuote.category} | 情绪: ${personalizedQuote.mood}`);
      } catch (error) {
        console.log(`\n👤 ${user.name}: 暂无合适的个性化推荐`);
      }
    }

    // 5. 统计信息
    console.log('\n\n📊 5. 系统统计信息');
    console.log('=' .repeat(50));

    const stats = recommender.getRecommendationStats();
    console.log(`\n总语录数: ${stats.totalQuotes}`);

    console.log('\n分类分布:');
    Object.entries(stats.categoryCounts).forEach(([category, count]) => {
      const percentage = (count / stats.totalQuotes * 100).toFixed(1);
      console.log(`  ${category}: ${count} (${percentage}%)`);
    });

    console.log('\n情绪分布:');
    Object.entries(stats.moodCounts).forEach(([mood, count]) => {
      const percentage = (count / stats.totalQuotes * 100).toFixed(1);
      console.log(`  ${mood}: ${count} (${percentage}%)`);
    });

    // 6. 保存演示数据
    console.log('\n\n💾 6. 保存演示数据');
    console.log('=' .repeat(50));

    const outputData = {
      title: '心理健康语录集合 - 演示版',
      description: '经过质量评估和分类的心理健康语录演示数据',
      generatedAt: new Date().toISOString(),
      totalQuotes: categorizedQuotes.length,
      statistics: stats,
      quotes: categorizedQuotes
    };

    const outputPath = './demo-quotes.json';
    await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`✅ 演示数据已保存到: ${outputPath}`);

    console.log('\n🎉 心理语录抓取系统演示完成！');
    console.log('\n💡 系统特点:');
    console.log('   ✅ 多源语录抓取和整合');
    console.log('   ✅ 智能质量评估和过滤');
    console.log('   ✅ 自动分类和情感标签');
    console.log('   ✅ 每日语录推荐机制');
    console.log('   ✅ 个性化推荐算法');
    console.log('   ✅ 情感分析和文化敏感性检查');

  } catch (error) {
    console.error('❌ 演示失败:', error);
    process.exit(1);
  }
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  demoQuoteSystem();
}
