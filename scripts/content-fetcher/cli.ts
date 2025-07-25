#!/usr/bin/env node

import { loadConfig } from './config.js';
import { logger } from './logger.js';
import { handleError } from './errors.js';
import { UnifiedContentFetcher } from './unified-fetcher.js';

interface CLIOptions {
  type: 'books' | 'movies' | 'music' | 'all';
  dryRun?: boolean;
  verbose?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    type: 'all'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--type':
      case '-t':
        const type = args[++i];
        if (['books', 'movies', 'music', 'all'].includes(type)) {
          options.type = type as CLIOptions['type'];
        } else {
          console.error(`Invalid type: ${type}. Must be one of: books, movies, music, all`);
          process.exit(1);
        }
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Mental Health Content Fetcher CLI

Usage: tsx cli.ts [options]

Options:
  -t, --type <type>     Type of content to fetch (books|movies|music|all) [default: all]
  -d, --dry-run         Run without updating files
  -v, --verbose         Enable verbose logging
  -h, --help            Show this help message

Examples:
  tsx cli.ts --type books
  tsx cli.ts --type all --dry-run
  tsx cli.ts --verbose
`);
}

async function main(): Promise<void> {
  try {
    const options = parseArgs();
    
    if (options.verbose) {
      process.env.DEBUG = 'true';
    }

    logger.info('Starting content fetcher CLI', options);

    const config = loadConfig();
    
    // 验证配置
    if (!config.apis.goodreads?.apiKey && options.type === 'books') {
      logger.warn('Goodreads API key not configured, skipping books');
    }
    
    if (!config.apis.spotify?.clientId && options.type === 'music') {
      logger.warn('Spotify API credentials not configured, skipping music');
    }
    
    if (!config.apis.tmdb?.apiKey && options.type === 'movies') {
      logger.warn('TMDB API key not configured, skipping movies');
    }

    const fetcher = new UnifiedContentFetcher(config);

    if (options.dryRun) {
      logger.info('Running in dry-run mode - no files will be modified');
      
      // 执行健康检查
      const healthCheck = await fetcher.healthCheck();
      logger.info('Health check results', healthCheck);
      
      logger.info('Dry run completed - no files were modified');
      return;
    }

    // 根据类型执行相应的更新
    switch (options.type) {
      case 'books':
        await fetcher.updateSpecificResource('books');
        break;
      case 'music':
        await fetcher.updateSpecificResource('music');
        break;
      case 'movies':
        await fetcher.updateSpecificResource('movies');
        break;
      case 'all':
        await fetcher.updateAllResources();
        break;
    }

    logger.info('Content fetcher execution completed successfully');

  } catch (error) {
    const handledError = handleError(error, logger);
    logger.error('CLI execution failed', { error: handledError.message });
    process.exit(1);
  }
}

// 只有直接运行此文件时才执行main函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}