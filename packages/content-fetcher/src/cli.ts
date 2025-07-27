#!/usr/bin/env node

import { loadConfig } from './config';
import { logger } from './logger';
import { UnifiedResourceFetcher } from './fetchers/unified-resource-fetcher';
import { HotlineFetcher } from './fetchers/hotline-fetcher';
import { QuoteFetcher } from './fetchers/quote-fetcher';
import { handleError } from './errors';
import { URLGenerator, MonetizationConfig } from './utils/url-generator';
import { ResourceItem } from '@sunrain/shared';
import fs from 'fs/promises';
import path from 'path';

interface CLIOptions {
  type: 'books' | 'movies' | 'music' | 'videos' | 'articles' | 'podcasts' | 'hotlines' | 'quotes' | 'all';
  dryRun?: boolean;
  verbose?: boolean;
  validateLinks?: boolean;
  repairLinks?: boolean;
  testAffiliate?: boolean;
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
        if (['books', 'movies', 'music', 'videos', 'articles', 'podcasts', 'hotlines', 'quotes', 'all'].includes(type)) {
          options.type = type as CLIOptions['type'];
        } else {
          console.error(`Invalid type: ${type}. Must be one of: books, movies, music, videos, articles, podcasts, hotlines, quotes, all`);
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
      case '--validate-links':
        options.validateLinks = true;
        break;
      case '--repair-links':
        options.repairLinks = true;
        break;
      case '--test-affiliate':
        options.testAffiliate = true;
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
  -t, --type <type>     Type of content to fetch (books|movies|music|videos|articles|podcasts|hotlines|quotes|all) [default: all]
  -d, --dry-run         Run without updating files
  -v, --verbose         Enable verbose logging
  --validate-links      Validate existing Amazon links
  --repair-links        Repair broken Amazon links
  --test-affiliate      Test affiliate link generation
  -h, --help            Show this help message

Examples:
  tsx cli.ts --type books
  tsx cli.ts --type all --dry-run
  tsx cli.ts --verbose
  tsx cli.ts --validate-links --type books
  tsx cli.ts --repair-links --type books
  tsx cli.ts --test-affiliate --type books
`);
}

async function validateAmazonLinks(config: any): Promise<void> {
  logger.info('Starting Amazon link validation');

  const monetizationConfig: MonetizationConfig = {
    amazon: config.monetization?.amazon,
    spotify: config.monetization?.spotify,
    appleMusic: config.monetization?.appleMusic
  };

  const urlGenerator = new URLGenerator(monetizationConfig);

  // Load existing books data
  const booksPath = path.resolve(config.output.booksPath);

  try {
    const booksData = await fs.readFile(booksPath, 'utf-8');
    const books: ResourceItem[] = JSON.parse(booksData);

    logger.info(`Found ${books.length} books to validate`);

    // Extract Amazon URLs
    const amazonUrls = books
      .filter(book => book.amazonUrl && urlGenerator.isAmazonUrl(book.amazonUrl))
      .map(book => book.amazonUrl!);

    if (amazonUrls.length === 0) {
      logger.info('No Amazon URLs found to validate');
      return;
    }

    logger.info(`Validating ${amazonUrls.length} Amazon URLs`);

    // Batch validate URLs
    const validationResults = await urlGenerator.batchValidateAmazonUrls(amazonUrls);

    // Report results
    const validUrls = validationResults.filter(result => result.isValid);
    const invalidUrls = validationResults.filter(result => !result.isValid);

    logger.info(`Validation complete: ${validUrls.length} valid, ${invalidUrls.length} invalid`);

    if (invalidUrls.length > 0) {
      logger.warn('Invalid URLs found:');
      invalidUrls.forEach(result => {
        logger.warn(`- ${result.url}: ${result.error || 'Unknown error'}`);
        if (result.suggestedFix) {
          logger.info(`  Suggested fix: ${result.suggestedFix}`);
        }
      });
    }

  } catch (error) {
    logger.error('Failed to validate Amazon links', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

async function testAffiliateLinks(config: any): Promise<void> {
  logger.info('Testing Amazon affiliate link generation');

  const monetizationConfig: MonetizationConfig = {
    amazon: config.monetization?.amazon,
    spotify: config.monetization?.spotify,
    appleMusic: config.monetization?.appleMusic
  };

  const urlGenerator = new URLGenerator(monetizationConfig);

  // Test ISBNs
  const testIsbns = [
    '0306406152',      // Valid ISBN-10
    '9780306406157',   // Valid ISBN-13
    'B08N5WRWNW'       // Amazon ASIN
  ];

  const testRegions = ['us', 'uk', 'de'];

  logger.info('Testing affiliate link generation for different regions and ISBNs');

  for (const region of testRegions) {
    logger.info(`\nTesting region: ${region}`);

    for (const isbn of testIsbns) {
      try {
        const url = urlGenerator.generateAmazonUrl(isbn, region);
        const enhancedUrl = urlGenerator.generateAmazonUrlFromISBN(isbn, region);

        logger.info(`ISBN/ASIN: ${isbn}`);
        logger.info(`  Standard URL: ${url}`);
        logger.info(`  Enhanced URL: ${enhancedUrl}`);

        // Test validation if URL contains affiliate tag
        if (url.includes('tag=')) {
          const isValid = await urlGenerator.validateAffiliateLink(url);
          logger.info(`  Affiliate link valid: ${isValid}`);
        }

      } catch (error) {
        logger.error(`Failed to generate URL for ${isbn} in ${region}`, { error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  logger.info('\nAffiliate link testing completed');
}

async function repairAmazonLinks(config: any): Promise<void> {
  logger.info('Starting Amazon link repair');

  const monetizationConfig: MonetizationConfig = {
    amazon: config.monetization?.amazon,
    spotify: config.monetization?.spotify,
    appleMusic: config.monetization?.appleMusic
  };

  const urlGenerator = new URLGenerator(monetizationConfig);

  // Load existing books data
  const booksPath = path.resolve(config.output.booksPath);

  try {
    const booksData = await fs.readFile(booksPath, 'utf-8');
    const books: ResourceItem[] = JSON.parse(booksData);

    logger.info(`Found ${books.length} books to check for repair`);

    let repairedCount = 0;

    // Process each book
    for (const book of books) {
      if (book.amazonUrl && urlGenerator.isAmazonUrl(book.amazonUrl)) {
        try {
          const repairedUrl = await urlGenerator.repairAmazonUrl(book.amazonUrl);

          if (repairedUrl !== book.amazonUrl) {
            logger.info(`Repaired URL for "${book.title}"`);
            logger.info(`  Old: ${book.amazonUrl}`);
            logger.info(`  New: ${repairedUrl}`);

            book.amazonUrl = repairedUrl;
            repairedCount++;
          }
        } catch (error) {
          logger.warn(`Failed to repair URL for "${book.title}": ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    if (repairedCount > 0) {
      // Save the updated data
      await fs.writeFile(booksPath, JSON.stringify(books, null, 2));
      logger.info(`Successfully repaired ${repairedCount} Amazon URLs`);
    } else {
      logger.info('No URLs needed repair');
    }

  } catch (error) {
    logger.error('Failed to repair Amazon links', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
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

    const fetcher = new UnifiedResourceFetcher(config);
    const hotlineFetcher = new HotlineFetcher(config);
    const quoteFetcher = new QuoteFetcher(config, logger);

    // Handle link validation/repair operations
    if (options.validateLinks) {
      await validateAmazonLinks(config);
      return;
    }

    if (options.repairLinks) {
      if (options.dryRun) {
        logger.info('Dry-run mode: would repair Amazon links but no files will be modified');
        await validateAmazonLinks(config);
        return;
      }
      await repairAmazonLinks(config);
      return;
    }

    if (options.testAffiliate) {
      await testAffiliateLinks(config);
      return;
    }

    if (options.dryRun) {
      logger.info('Running in dry-run mode - no files will be modified');

      // 执行健康检查
      logger.info('Health check results', {
        apis: {
          goodreads: !!config.apis.goodreads?.apiKey,
          spotify: !!config.apis.spotify?.clientId,
          tmdb: !!config.apis.tmdb?.apiKey,
          youtube: !!config.apis.youtube?.apiKey,
          newsApi: !!config.apis.newsApi?.apiKey,
          googleBooks: !!config.apis.googleBooks?.apiKey
        }
      });

      logger.info('Dry run completed - no files were modified');
      return;
    }

    // 根据类型执行相应的更新
    switch (options.type) {
      case 'books':
        const books = await fetcher.fetchBooks();
        if (!options.dryRun) {
          await fetcher.updateResourceFiles({ books });
        }
        logger.info(`Fetched ${books.length} books`);
        break;
      case 'music':
        const music = await fetcher.fetchMusic();
        if (!options.dryRun) {
          await fetcher.updateResourceFiles({ music });
        }
        logger.info(`Fetched ${music.length} music items`);
        break;
      case 'movies':
        const movies = await fetcher.fetchMovies();
        if (!options.dryRun) {
          await fetcher.updateResourceFiles({ movies });
        }
        logger.info(`Fetched ${movies.length} movies`);
        break;
      case 'videos':
        const videos = await fetcher.fetchVideos();
        if (!options.dryRun) {
          await fetcher.updateResourceFiles({ videos });
        }
        logger.info(`Fetched ${videos.length} videos`);
        break;
      case 'articles':
        const articles = await fetcher.fetchArticles();
        if (!options.dryRun) {
          await fetcher.updateResourceFiles({ articles });
        }
        logger.info(`Fetched ${articles.length} articles`);
        break;
      case 'podcasts':
        const podcasts = await fetcher.fetchPodcasts();
        if (!options.dryRun) {
          await fetcher.updateResourceFiles({ podcasts });
        }
        logger.info(`Fetched ${podcasts.length} podcasts`);
        break;
      case 'hotlines':
        if (!options.dryRun) {
          await hotlineFetcher.updateHotlineFiles();
        }
        const hotlineStats = await hotlineFetcher.getHotlineStatistics();
        logger.info(`Updated ${hotlineStats.total} hotlines across ${Object.keys(hotlineStats.byCountry).length} countries`);
        break;
      case 'quotes':
        const quotes = await quoteFetcher.fetchQuotes();
        if (!options.dryRun) {
          // Save quotes to the configured output path
          const quotesPath = path.resolve(config.output.quotesPath);
          await fs.writeFile(quotesPath, JSON.stringify({
            title: '心理健康语录集合',
            description: '经过质量评估和分类的心理健康语录',
            generatedAt: new Date().toISOString(),
            totalQuotes: quotes.length,
            quotes: quotes
          }, null, 2));
        }
        logger.info(`Fetched ${quotes.length} quotes`);
        break;
      case 'all':
        const allBooks = await fetcher.fetchBooks();
        const allMusic = await fetcher.fetchMusic();
        const allMovies = await fetcher.fetchMovies();
        const allVideos = await fetcher.fetchVideos();
        const allArticles = await fetcher.fetchArticles();
        const allPodcasts = await fetcher.fetchPodcasts();
        const allQuotes = await quoteFetcher.fetchQuotes();

        if (!options.dryRun) {
          await fetcher.updateResourceFiles({
            books: allBooks,
            music: allMusic,
            movies: allMovies,
            videos: allVideos,
            articles: allArticles,
            podcasts: allPodcasts
          });

          await hotlineFetcher.updateHotlineFiles();

          // Save quotes
          const quotesPath = path.resolve(config.output.quotesPath);
          await fs.writeFile(quotesPath, JSON.stringify({
            title: '心理健康语录集合',
            description: '经过质量评估和分类的心理健康语录',
            generatedAt: new Date().toISOString(),
            totalQuotes: allQuotes.length,
            quotes: allQuotes
          }, null, 2));
        }

        const allHotlineStats = await hotlineFetcher.getHotlineStatistics();
        logger.info(`Fetched all resources: ${allBooks.length} books, ${allMusic.length} music, ${allMovies.length} movies, ${allVideos.length} videos, ${allArticles.length} articles, ${allPodcasts.length} podcasts, ${allQuotes.length} quotes, ${allHotlineStats.total} hotlines`);
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
