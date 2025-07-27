import { ContentFetcherConfig } from '../types';
import { UnifiedResourceFetcher } from '../fetchers/unified-resource-fetcher';
import { WikiContentFetcher } from '../fetchers/wiki-content-fetcher';
import { logger } from '../logger';
import { handleError } from '../errors';

/**
 * Content update scheduler that manages different update frequencies
 * for various types of content based on the configuration
 */
export class ContentUpdateScheduler {
  private config: ContentFetcherConfig;
  private resourceFetcher: UnifiedResourceFetcher;
  private wikiFetcher: WikiContentFetcher;
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: ContentFetcherConfig) {
    this.config = config;
    this.resourceFetcher = new UnifiedResourceFetcher(config);
    this.wikiFetcher = new WikiContentFetcher(config);
  }

  /**
   * Start the content update scheduler
   */
  start(): void {
    logger.info('Starting content update scheduler');

    // Schedule high-frequency updates (daily)
    this.scheduleHighFrequencyUpdates();

    // Schedule medium-frequency updates (weekly)
    this.scheduleMediumFrequencyUpdates();

    // Schedule low-frequency updates (manual/on-demand)
    this.scheduleLowFrequencyUpdates();

    logger.info('Content update scheduler started successfully');
  }

  /**
   * Stop the content update scheduler
   */
  stop(): void {
    logger.info('Stopping content update scheduler');

    // Clear all intervals
    for (const [contentType, interval] of this.updateIntervals) {
      clearInterval(interval);
      logger.info(`Stopped scheduler for ${contentType}`);
    }

    this.updateIntervals.clear();
    logger.info('Content update scheduler stopped');
  }

  /**
   * Schedule high-frequency updates (daily)
   * - Therapeutic resources (books, music, videos, articles)
   * - Support hotlines
   */
  private scheduleHighFrequencyUpdates(): void {
    // Videos - every day at 2 AM
    this.scheduleUpdate('videos', this.config.updateFrequency.videos, async () => {
      await this.updateVideos();
    });

    // Articles - every day at 4 AM
    this.scheduleUpdate('articles', this.config.updateFrequency.articles, async () => {
      await this.updateArticles();
    });

    // Support hotlines would be scheduled here when implemented
    logger.info('High-frequency updates scheduled');
  }

  /**
   * Schedule medium-frequency updates (weekly)
   * - Books
   * - Music
   * - Movies
   * - Mental health wiki content
   */
  private scheduleMediumFrequencyUpdates(): void {
    // Books - weekly on Monday
    this.scheduleUpdate('books', this.config.updateFrequency.books, async () => {
      await this.updateBooks();
    });

    // Music - weekly on Wednesday
    this.scheduleUpdate('music', this.config.updateFrequency.music, async () => {
      await this.updateMusic();
    });

    // Movies - weekly on Friday
    this.scheduleUpdate('movies', this.config.updateFrequency.movies, async () => {
      await this.updateMovies();
    });

    // Wiki content - weekly update
    this.scheduleUpdate('wiki', '0 3 * * 1', async () => { // Monday at 3 AM
      await this.updateWikiContent();
    });

    logger.info('Medium-frequency updates scheduled');
  }

  /**
   * Schedule low-frequency updates (manual/on-demand)
   * - Assessment questions
   * - Practice content
   * - Relaxation content
   */
  private scheduleLowFrequencyUpdates(): void {
    // Podcasts - weekly on Tuesday
    this.scheduleUpdate('podcasts', this.config.updateFrequency.podcasts, async () => {
      await this.updatePodcasts();
    });

    logger.info('Low-frequency updates scheduled');
  }

  /**
   * Schedule a content update using cron expression
   */
  private scheduleUpdate(contentType: string, cronExpression: string, updateFunction: () => Promise<void>): void {
    try {
      // Convert cron expression to interval (simplified implementation)
      const intervalMs = this.cronToInterval(cronExpression);

      if (intervalMs > 0) {
        const interval = setInterval(async () => {
          try {
            logger.info(`Starting scheduled update for ${contentType}`);
            await updateFunction();
            logger.info(`Completed scheduled update for ${contentType}`);
          } catch (error) {
            logger.error(`Failed scheduled update for ${contentType}`, {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }, intervalMs);

        this.updateIntervals.set(contentType, interval);
        logger.info(`Scheduled ${contentType} updates with interval ${intervalMs}ms`);
      } else {
        logger.warn(`Invalid cron expression for ${contentType}: ${cronExpression}`);
      }
    } catch (error) {
      logger.error(`Failed to schedule ${contentType} updates`, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Convert cron expression to milliseconds interval (simplified)
   * Note: This is a basic implementation. In production, use a proper cron library
   */
  private cronToInterval(cronExpression: string): number {
    // Basic cron patterns
    const patterns = {
      '0 0 * * *': 24 * 60 * 60 * 1000,     // Daily at midnight
      '0 2 * * *': 24 * 60 * 60 * 1000,     // Daily at 2 AM
      '0 4 * * *': 24 * 60 * 60 * 1000,     // Daily at 4 AM
      '0 0 * * 1': 7 * 24 * 60 * 60 * 1000, // Weekly on Monday
      '0 0 * * 2': 7 * 24 * 60 * 60 * 1000, // Weekly on Tuesday
      '0 0 * * 3': 7 * 24 * 60 * 60 * 1000, // Weekly on Wednesday
      '0 0 * * 5': 7 * 24 * 60 * 60 * 1000, // Weekly on Friday
      '0 3 * * 1': 7 * 24 * 60 * 60 * 1000  // Weekly on Monday at 3 AM
    };

    return patterns[cronExpression as keyof typeof patterns] || 0;
  }

  /**
   * Update videos content
   */
  private async updateVideos(): Promise<void> {
    try {
      const videos = await this.resourceFetcher.fetchVideos();
      await this.resourceFetcher.updateResourceFiles({ videos });
      logger.info(`Updated ${videos.length} videos`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Update articles content
   */
  private async updateArticles(): Promise<void> {
    try {
      const articles = await this.resourceFetcher.fetchArticles();
      await this.resourceFetcher.updateResourceFiles({ articles });
      logger.info(`Updated ${articles.length} articles`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Update books content
   */
  private async updateBooks(): Promise<void> {
    try {
      const books = await this.resourceFetcher.fetchBooks();
      await this.resourceFetcher.updateResourceFiles({ books });
      logger.info(`Updated ${books.length} books`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Update music content
   */
  private async updateMusic(): Promise<void> {
    try {
      const music = await this.resourceFetcher.fetchMusic();
      await this.resourceFetcher.updateResourceFiles({ music });
      logger.info(`Updated ${music.length} music items`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Update movies content
   */
  private async updateMovies(): Promise<void> {
    try {
      const movies = await this.resourceFetcher.fetchMovies();
      await this.resourceFetcher.updateResourceFiles({ movies });
      logger.info(`Updated ${movies.length} movies`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Update podcasts content
   */
  private async updatePodcasts(): Promise<void> {
    try {
      const podcasts = await this.resourceFetcher.fetchPodcasts();
      await this.resourceFetcher.updateResourceFiles({ podcasts });
      logger.info(`Updated ${podcasts.length} podcasts`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Update wiki content
   */
  private async updateWikiContent(): Promise<void> {
    try {
      const wikiArticles = await this.wikiFetcher.fetchArticles();

      // Save wiki articles to a separate file
      await this.wikiFetcher.updateResourceFiles({
        articles: wikiArticles
      });

      logger.info(`Updated ${wikiArticles.length} wiki articles`);
    } catch (error) {
      throw handleError(error, logger);
    }
  }

  /**
   * Manually trigger update for specific content type
   */
  async triggerUpdate(contentType: string): Promise<void> {
    logger.info(`Manually triggering update for ${contentType}`);

    try {
      switch (contentType) {
        case 'videos':
          await this.updateVideos();
          break;
        case 'articles':
          await this.updateArticles();
          break;
        case 'books':
          await this.updateBooks();
          break;
        case 'music':
          await this.updateMusic();
          break;
        case 'movies':
          await this.updateMovies();
          break;
        case 'podcasts':
          await this.updatePodcasts();
          break;
        case 'wiki':
          await this.updateWikiContent();
          break;
        case 'all':
          await this.updateAll();
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      logger.info(`Manual update completed for ${contentType}`);
    } catch (error) {
      logger.error(`Manual update failed for ${contentType}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Update all content types
   */
  private async updateAll(): Promise<void> {
    const contentTypes = ['books', 'music', 'movies', 'videos', 'articles', 'podcasts', 'wiki'];

    for (const contentType of contentTypes) {
      try {
        await this.triggerUpdate(contentType);
      } catch (error) {
        logger.error(`Failed to update ${contentType} during full update`, {
          error: error instanceof Error ? error.message : String(error)
        });
        // Continue with other content types even if one fails
      }
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { contentType: string; scheduled: boolean; nextUpdate?: Date }[] {
    const status = [];

    for (const [contentType] of this.updateIntervals) {
      status.push({
        contentType,
        scheduled: true,
        // In a real implementation, you would calculate the next update time
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Placeholder: 24 hours from now
      });
    }

    return status;
  }
}
