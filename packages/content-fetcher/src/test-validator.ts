#!/usr/bin/env node

import { ContentValidator } from './validator.js';
import { loadConfig } from './config.js';
import { ResourceItem } from './types.js';
import { logger } from './logger.js';

// 测试内容验证器
async function testValidator() {
  const config = loadConfig();
  const validator = new ContentValidator(config);

  // 测试数据
  const validBook: ResourceItem = {
    id: 'test-book-1',
    title: 'The Anxiety and Worry Workbook',
    description: 'A comprehensive guide to managing anxiety and worry through cognitive behavioral therapy techniques. This book provides practical exercises and strategies for mental health improvement.',
    author: 'David A. Clark',
    year: 2018,
    genre: 'Self-Help',
    themes: ['anxiety', 'CBT', 'mental health'],
    benefits: ['stress reduction', 'coping strategies']
  };

  const invalidBook: ResourceItem = {
    id: 'test-book-2',
    title: 'Cooking Recipes',
    description: 'Basic cooking recipes', // 太短且不相关
    author: 'Unknown'
  };

  const validMovie: ResourceItem = {
    id: 'test-movie-1',
    title: 'Inside Out',
    description: 'An animated film that explores emotions and mental health through the story of a young girl dealing with major life changes. The movie provides insights into emotional processing and psychological well-being.',
    director: 'Pete Docter',
    duration: '95 min',
    rating: 'PG'
  };

  logger.info('Testing content validator...');

  // 测试单个内容验证
  logger.info('Testing valid book:', { valid: validator.validateContent(validBook) });
  logger.info('Testing invalid book:', { valid: validator.validateContent(invalidBook) });
  logger.info('Testing valid movie:', { valid: validator.validateContent(validMovie) });

  // 测试批量验证
  const testItems = [validBook, invalidBook, validMovie];
  const validItems = validator.validateBatch(testItems);
  
  logger.info('Batch validation results:', {
    total: testItems.length,
    valid: validItems.length,
    validIds: validItems.map(item => item.id)
  });
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testValidator().catch(error => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
}