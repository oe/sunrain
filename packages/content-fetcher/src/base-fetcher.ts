import fs from 'fs/promises';
import path from 'path';
import type { ContentFetcher, ResourceItem, ContentFetcherConfig, FetchResult } from './types';
import { ContentValidator } from './validator.js';
import { logger } from './logger.js';
import { handleError, ConfigurationError } from './errors.js';

export abstract class BaseContentFetcher implements ContentFetcher {
  protected validator: ContentValidator;

  constructor(protected config: ContentFetcherConfig) {
    this.validator = new ContentValidator(config);
  }

  abstract fetchBooks(): Promise<ResourceItem[]>;
  abstract fetchMovies(): Promise<ResourceItem[]>;
  abstract fetchMusic(): Promise<ResourceItem[]>;
  abstract fetchVideos(): Promise<ResourceItem[]>;
  abstract fetchArticles(): Promise<ResourceItem[]>;
  abstract fetchPodcasts(): Promise<ResourceItem[]>;

  validateContent(content: ResourceItem): boolean {
    return this.validator.validateContent(content);
  }

  assessContentQuality(content: ResourceItem): number {
    // Default implementation - should be overridden by subclasses
    return 0.5;
  }

  filterMentalHealthRelevant(content: ResourceItem[]): ResourceItem[] {
    const keywords = this.config.contentValidation.mentalHealthKeywords;

    return content.filter(item => {
      const textToCheck = `${item.title} ${item.description} ${item.tags?.join(' ') || ''} ${item.categories?.join(' ') || ''}`.toLowerCase();

      return keywords.some(keyword =>
        textToCheck.includes(keyword.toLowerCase())
      );
    });
  }

  async updateResourceFiles(resources: {
    books?: ResourceItem[];
    movies?: ResourceItem[];
    music?: ResourceItem[];
    videos?: ResourceItem[];
    articles?: ResourceItem[];
    podcasts?: ResourceItem[];
  }): Promise<void> {
    try {
      const updatePromises: Promise<void>[] = [];

      if (resources.books) {
        updatePromises.push(this.updateResourceFile(
          this.config.output.booksPath,
          resources.books,
          'books'
        ));
      }

      if (resources.movies) {
        updatePromises.push(this.updateResourceFile(
          this.config.output.moviesPath,
          resources.movies,
          'movies'
        ));
      }

      if (resources.music) {
        updatePromises.push(this.updateResourceFile(
          this.config.output.musicPath,
          resources.music,
          'music'
        ));
      }

      if (resources.videos) {
        updatePromises.push(this.updateResourceFile(
          this.config.output.videosPath,
          resources.videos,
          'videos'
        ));
      }

      if (resources.articles) {
        updatePromises.push(this.updateResourceFile(
          this.config.output.articlesPath,
          resources.articles,
          'articles'
        ));
      }

      if (resources.podcasts) {
        updatePromises.push(this.updateResourceFile(
          this.config.output.podcastsPath,
          resources.podcasts,
          'podcasts'
        ));
      }

      await Promise.all(updatePromises);
      logger.info('All resource files updated successfully');
    } catch (error) {
      const handledError = handleError(error, logger);
      throw handledError;
    }
  }

  private async updateResourceFile(
    filePath: string,
    resources: ResourceItem[],
    resourceType: string
  ): Promise<void> {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      // 验证内容
      const validResources = this.validator.validateBatch(resources);

      // 创建资源集合对象 - 符合Astro内容集合的格式
      const resourceCollection = {
        en: {
          title: this.getResourceTitle(resourceType),
          description: this.getResourceDescription(resourceType),
          items: validResources
        }
      };

      // 写入文件
      const jsonContent = JSON.stringify(resourceCollection, null, 2);
      await fs.writeFile(filePath, jsonContent, 'utf-8');

      logger.info(`Updated ${resourceType} resource file`, {
        path: filePath,
        count: validResources.length
      });
    } catch (error) {
      logger.error(`Failed to update ${resourceType} resource file`, {
        path: filePath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private getResourceTitle(resourceType: string): string {
    const titles = {
      books: 'Mental Health Books',
      movies: 'Therapeutic Movies',
      music: 'Healing Music',
      videos: 'Therapeutic Videos',
      articles: 'Mental Health Articles',
      podcasts: 'Mental Health Podcasts'
    };
    return titles[resourceType as keyof typeof titles] || 'Resources';
  }

  private getResourceDescription(resourceType: string): string {
    const descriptions = {
      books: 'A curated collection of books focused on mental health, psychology, and personal wellness.',
      movies: 'Movies that explore mental health themes and can provide therapeutic value.',
      music: 'Music playlists and tracks designed for relaxation, meditation, and emotional healing.',
      videos: 'Educational and therapeutic videos covering mental health topics, guided meditations, and wellness practices.',
      articles: 'Informative articles from trusted sources about mental health, psychology, and wellness strategies.',
      podcasts: 'Audio content featuring mental health discussions, expert interviews, and therapeutic guidance.'
    };
    return descriptions[resourceType as keyof typeof descriptions] || 'A collection of mental health resources.';
  }

  protected async fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fetchFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break;
        }

        logger.warn(`Fetch attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: lastError.message,
          attempt,
          maxRetries
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // 指数退避
      }
    }

    throw lastError!;
  }

  protected validateApiConfig(apiName: string, config: any): void {
    if (!config) {
      throw new ConfigurationError(
        `${apiName} API configuration is missing`,
        `apis.${apiName}`
      );
    }

    const requiredFields = this.getRequiredConfigFields(apiName);
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new ConfigurationError(
          `${apiName} API ${field} is missing`,
          `apis.${apiName}.${field}`
        );
      }
    }
  }

  private getRequiredConfigFields(apiName: string): string[] {
    const requiredFields = {
      goodreads: ['apiKey'],
      spotify: ['clientId', 'clientSecret'],
      tmdb: ['apiKey'],
      youtube: ['apiKey'],
      newsApi: ['apiKey'],
      googleBooks: ['apiKey'],
      appleMusic: ['apiKey', 'teamId', 'keyId']
    };
    return requiredFields[apiName as keyof typeof requiredFields] || [];
  }
}
