#!/usr/bin/env node

import { MusicFetcher } from './fetchers/music-fetcher.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

async function testMusicFetcher() {
  try {
    logger.info('Testing Music Fetcher...');
    
    const config = loadConfig();
    const musicFetcher = new MusicFetcher(config);
    
    // 测试获取音乐
    const music = await musicFetcher.fetchMusic();
    
    logger.info(`Successfully fetched ${music.length} music items`);
    
    // 显示前3个音乐项目的详细信息
    music.slice(0, 3).forEach((item, index) => {
      logger.info(`Music ${index + 1}:`, {
        title: item.title,
        artist: item.artist,
        type: item.type,
        themes: item.themes,
        benefits: item.benefits,
        descriptionLength: item.description.length
      });
    });
    
    // 测试内容验证
    const validMusic = music.filter(item => musicFetcher.validateContent(item));
    logger.info(`Validation results: ${validMusic.length}/${music.length} music items passed validation`);
    
    // 测试更新资源文件
    logger.info('Testing resource file update...');
    await musicFetcher.updateResourceFiles({ music: validMusic });
    
    logger.info('Music fetcher test completed successfully!');
    
  } catch (error) {
    logger.error('Music fetcher test failed:', error);
    process.exit(1);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testMusicFetcher();
}