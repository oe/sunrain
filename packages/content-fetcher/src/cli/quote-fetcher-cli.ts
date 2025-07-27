#!/usr/bin/env node

import { Command } from 'commander';
import { QuoteFetcher } from '../fetchers/quote-fetcher.js';
import { DailyQuoteRecommendationSystem } from '../services/daily-quote-recommender.js';
import { QuoteQualityAssessmentSystem } from '../quality/quote-quality-assessor.js';
import { QuoteCategorizationSystemImpl } from '../services/quote-categorization-system.js';
import { loadConfig } from '../config.js';
import { logger } from '../logger.js';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();

program
  .name('quote-fetcher')
  .description('心理健康语录抓取和管理工具')
  .version('1.0.0');

program
  .command('fetch')
  .description('抓取心理健康语录')
  .option('-o, --output <path>', '输出文件路径', './quotes.json')
  .option('--limit <number>', '限制抓取数量', '100')
  .option('--quality-threshold <number>', '质量阈值 (0-1)', '0.7')
  .action(async (options) => {
    try {
      logger.info('开始抓取心理健康语录...');

      const config = loadConfig();
      const quoteFetcher = new QuoteFetcher(config, logger);

      // 抓取语录
      const quotes = await quoteFetcher.fetchQuotes();
      logger.info(`成功抓取 ${quotes.length} 条语录`);

      // 限制数量
      const limitedQuotes = quotes.slice(0, parseInt(options.limit));

      // 质量过滤
      const qualityAssessor = new QuoteQualityAssessmentSystem(logger);
      const qualityResults = await qualityAssessor.batchAssessQuotes(limitedQuotes);

      const qualityThreshold = parseFloat(options.qualityThreshold);
      const highQualityQuotes = limitedQuotes.filter(quote => {
        const metrics = qualityResults.get(quote.id);
        return metrics && metrics.overallScore >= qualityThreshold;
      });

      logger.info(`质量过滤后剩余 ${highQualityQuotes.length} 条语录`);

      // 分类和标签
      const categorizer = new QuoteCategorizationSystemImpl(logger);
      const categorizedQuotes = await categorizer.batchCategorize(highQualityQuotes);

      // 保存结果
      const outputPath = path.resolve(options.output);
      await fs.writeFile(outputPath, JSON.stringify({
        title: '心理健康语录集合',
        description: '经过质量评估和分类的心理健康语录',
        generatedAt: new Date().toISOString(),
        totalQuotes: categorizedQuotes.length,
        qualityThreshold,
        quotes: categorizedQuotes
      }, null, 2));

      logger.info(`语录已保存到: ${outputPath}`);

      // 统计信息
      const categoryStats = categorizedQuotes.reduce((stats, quote) => {
        stats[quote.category] = (stats[quote.category] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      const moodStats = categorizedQuotes.reduce((stats, quote) => {
        stats[quote.mood] = (stats[quote.mood] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      console.log('\n=== 统计信息 ===');
      console.log(`总语录数: ${categorizedQuotes.length}`);
      console.log('\n分类统计:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
      console.log('\n情绪统计:');
      Object.entries(moodStats).forEach(([mood, count]) => {
        console.log(`  ${mood}: ${count}`);
      });

    } catch (error) {
      logger.error('抓取语录失败:', error);
      process.exit(1);
    }
  });

program
  .command('daily')
  .description('获取每日推荐语录')
  .option('-d, --date <date>', '指定日期 (YYYY-MM-DD)', new Date().toISOString().split('T')[0])
  .option('-i, --input <path>', '语录数据文件路径', './quotes.json')
  .action(async (options) => {
    try {
      const inputPath = path.resolve(options.input);
      const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
      const quotes = data.quotes || [];

      if (quotes.length === 0) {
        logger.error('没有找到语录数据');
        process.exit(1);
      }

      const recommender = new DailyQuoteRecommendationSystem(quotes, logger);
      const date = new Date(options.date);

      const dailyQuote = await recommender.getDailyQuote(date);

      console.log('\n=== 每日语录 ===');
      console.log(`日期: ${options.date}`);
      console.log(`分类: ${dailyQuote.category}`);
      console.log(`情绪: ${dailyQuote.mood}`);
      console.log(`语录: "${dailyQuote.text}"`);
      if (dailyQuote.author) {
        console.log(`作者: ${dailyQuote.author}`);
      }
      console.log(`标签: ${dailyQuote.tags.join(', ')}`);

    } catch (error) {
      logger.error('获取每日语录失败:', error);
      process.exit(1);
    }
  });

program
  .command('weekly')
  .description('获取一周语录推荐')
  .option('-i, --input <path>', '语录数据文件路径', './quotes.json')
  .action(async (options) => {
    try {
      const inputPath = path.resolve(options.input);
      const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
      const quotes = data.quotes || [];

      if (quotes.length === 0) {
        logger.error('没有找到语录数据');
        process.exit(1);
      }

      const recommender = new DailyQuoteRecommendationSystem(quotes, logger);
      const weeklyQuotes = await recommender.getWeeklyQuotes();

      console.log('\n=== 一周语录推荐 ===');
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

      weeklyQuotes.forEach((quote, index) => {
        const today = new Date();
        const date = new Date(today);
        date.setDate(today.getDate() + index);

        console.log(`\n${weekdays[date.getDay()]} (${date.toISOString().split('T')[0]}):`);
        console.log(`  分类: ${quote.category}`);
        console.log(`  语录: "${quote.text}"`);
        if (quote.author) {
          console.log(`  作者: ${quote.author}`);
        }
      });

    } catch (error) {
      logger.error('获取一周语录失败:', error);
      process.exit(1);
    }
  });

program
  .command('quality')
  .description('评估语录质量')
  .option('-i, --input <path>', '语录数据文件路径', './quotes.json')
  .option('--threshold <number>', '质量阈值 (0-1)', '0.7')
  .action(async (options) => {
    try {
      const inputPath = path.resolve(options.input);
      const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
      const quotes = data.quotes || [];

      if (quotes.length === 0) {
        logger.error('没有找到语录数据');
        process.exit(1);
      }

      const qualityAssessor = new QuoteQualityAssessmentSystem(logger);
      const qualityResults = await qualityAssessor.batchAssessQuotes(quotes);

      const threshold = parseFloat(options.threshold);
      let passCount = 0;
      let totalScore = 0;

      console.log('\n=== 质量评估结果 ===');
      console.log(`评估语录数: ${quotes.length}`);
      console.log(`质量阈值: ${threshold}`);

      const sortedResults = Array.from(qualityResults.entries())
        .sort(([, a], [, b]) => b.overallScore - a.overallScore);

      console.log('\n前10名高质量语录:');
      sortedResults.slice(0, 10).forEach(([quoteId, metrics], index) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
          console.log(`${index + 1}. [${metrics.overallScore.toFixed(2)}] "${quote.text.substring(0, 60)}..."`);
        }
      });

      console.log('\n后10名低质量语录:');
      sortedResults.slice(-10).forEach(([quoteId, metrics], index) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
          console.log(`${index + 1}. [${metrics.overallScore.toFixed(2)}] "${quote.text.substring(0, 60)}..."`);
        }
      });

      // 统计
      qualityResults.forEach((metrics) => {
        totalScore += metrics.overallScore;
        if (metrics.overallScore >= threshold) {
          passCount++;
        }
      });

      const averageScore = totalScore / qualityResults.size;
      const passRate = (passCount / qualityResults.size) * 100;

      console.log('\n=== 统计信息 ===');
      console.log(`平均质量分数: ${averageScore.toFixed(2)}`);
      console.log(`通过率: ${passRate.toFixed(1)}% (${passCount}/${qualityResults.size})`);

    } catch (error) {
      logger.error('质量评估失败:', error);
      process.exit(1);
    }
  });

program
  .command('categorize')
  .description('重新分类语录')
  .option('-i, --input <path>', '语录数据文件路径', './quotes.json')
  .option('-o, --output <path>', '输出文件路径', './quotes_categorized.json')
  .action(async (options) => {
    try {
      const inputPath = path.resolve(options.input);
      const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
      const quotes = data.quotes || [];

      if (quotes.length === 0) {
        logger.error('没有找到语录数据');
        process.exit(1);
      }

      const categorizer = new QuoteCategorizationSystemImpl(logger);
      const categorizedQuotes = await categorizer.batchCategorize(quotes);

      // 保存结果
      const outputPath = path.resolve(options.output);
      await fs.writeFile(outputPath, JSON.stringify({
        ...data,
        quotes: categorizedQuotes,
        recategorizedAt: new Date().toISOString()
      }, null, 2));

      logger.info(`重新分类的语录已保存到: ${outputPath}`);

      // 统计信息
      const categoryStats = categorizedQuotes.reduce((stats, quote) => {
        stats[quote.category] = (stats[quote.category] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      console.log('\n=== 分类统计 ===');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`${category}: ${count}`);
      });

    } catch (error) {
      logger.error('重新分类失败:', error);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('显示语录统计信息')
  .option('-i, --input <path>', '语录数据文件路径', './quotes.json')
  .action(async (options) => {
    try {
      const inputPath = path.resolve(options.input);
      const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
      const quotes = data.quotes || [];

      if (quotes.length === 0) {
        logger.error('没有找到语录数据');
        process.exit(1);
      }

      // 基本统计
      const totalQuotes = quotes.length;
      const averageLength = quotes.reduce((sum, q) => sum + q.text.length, 0) / totalQuotes;
      const withAuthor = quotes.filter(q => q.author).length;

      // 分类统计
      const categoryStats = quotes.reduce((stats, quote) => {
        stats[quote.category] = (stats[quote.category] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      // 情绪统计
      const moodStats = quotes.reduce((stats, quote) => {
        stats[quote.mood] = (stats[quote.mood] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      // 语言统计
      const languageStats = quotes.reduce((stats, quote) => {
        stats[quote.language] = (stats[quote.language] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      // 质量分数统计
      const qualityScores = quotes.map(q => q.qualityScore).filter(s => s !== undefined);
      const averageQuality = qualityScores.length > 0 ?
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length : 0;

      console.log('\n=== 语录统计信息 ===');
      console.log(`总语录数: ${totalQuotes}`);
      console.log(`平均长度: ${averageLength.toFixed(1)} 字符`);
      console.log(`有作者的语录: ${withAuthor} (${(withAuthor/totalQuotes*100).toFixed(1)}%)`);
      console.log(`平均质量分数: ${averageQuality.toFixed(2)}`);

      console.log('\n=== 分类分布 ===');
      Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, count]) => {
          const percentage = (count / totalQuotes * 100).toFixed(1);
          console.log(`${category}: ${count} (${percentage}%)`);
        });

      console.log('\n=== 情绪分布 ===');
      Object.entries(moodStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([mood, count]) => {
          const percentage = (count / totalQuotes * 100).toFixed(1);
          console.log(`${mood}: ${count} (${percentage}%)`);
        });

      console.log('\n=== 语言分布 ===');
      Object.entries(languageStats)
        .sort(([, a], [, b]) => b - a)
        .forEach(([language, count]) => {
          const percentage = (count / totalQuotes * 100).toFixed(1);
          console.log(`${language}: ${count} (${percentage}%)`);
        });

    } catch (error) {
      logger.error('获取统计信息失败:', error);
      process.exit(1);
    }
  });

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { program as quoteCliProgram };
