#!/usr/bin/env node

import { BooksFetcher } from './fetchers/books-fetcher.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

async function testBooksFetcher() {
  try {
    logger.info('Testing Books Fetcher...');
    
    const config = loadConfig();
    const booksFetcher = new BooksFetcher(config);
    
    // 测试获取书籍
    const books = await booksFetcher.fetchBooks();
    
    logger.info(`Successfully fetched ${books.length} books`);
    
    // 显示前3本书的详细信息
    books.slice(0, 3).forEach((book, index) => {
      logger.info(`Book ${index + 1}:`, {
        title: book.title,
        author: book.author,
        year: book.year,
        themes: book.themes,
        benefits: book.benefits,
        descriptionLength: book.description.length
      });
    });
    
    // 测试内容验证
    const validBooks = books.filter(book => booksFetcher.validateContent(book));
    logger.info(`Validation results: ${validBooks.length}/${books.length} books passed validation`);
    
    // 测试更新资源文件（干运行）
    logger.info('Testing resource file update (dry run)...');
    
    // 创建测试目录
    await booksFetcher.updateResourceFiles({ books: validBooks });
    
    logger.info('Books fetcher test completed successfully!');
    
  } catch (error) {
    logger.error('Books fetcher test failed:', error);
    process.exit(1);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testBooksFetcher();
}