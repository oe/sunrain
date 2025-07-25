#!/usr/bin/env node

import { MoviesFetcher } from './fetchers/movies-fetcher.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

async function testMoviesFetcher() {
  try {
    logger.info('Testing Movies Fetcher...');
    
    const config = loadConfig();
    const moviesFetcher = new MoviesFetcher(config);
    
    // 测试获取电影
    const movies = await moviesFetcher.fetchMovies();
    
    logger.info(`Successfully fetched ${movies.length} movies`);
    
    // 显示前3部电影的详细信息
    movies.slice(0, 3).forEach((movie, index) => {
      logger.info(`Movie ${index + 1}:`, {
        title: movie.title,
        director: movie.director,
        year: movie.year,
        duration: movie.duration,
        rating: movie.rating,
        themes: movie.themes,
        benefits: movie.benefits,
        descriptionLength: movie.description.length
      });
    });
    
    // 测试内容验证
    const validMovies = movies.filter(movie => moviesFetcher.validateContent(movie));
    logger.info(`Validation results: ${validMovies.length}/${movies.length} movies passed validation`);
    
    // 测试更新资源文件
    logger.info('Testing resource file update...');
    await moviesFetcher.updateResourceFiles({ movies: validMovies });
    
    logger.info('Movies fetcher test completed successfully!');
    
  } catch (error) {
    logger.error('Movies fetcher test failed:', error);
    process.exit(1);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testMoviesFetcher();
}