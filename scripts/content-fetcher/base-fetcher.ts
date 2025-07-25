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

  validateContent(content: ResourceItem): boolean {
    return this.validator.validateContent(content);
  }

  async updateResourceFiles(resources: { 
    books?: ResourceItem[]; 
    movies?: ResourceItem[]; 
    music?: ResourceItem[] 
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
      music: 'Healing Music'
    };
    return titles[resourceType as keyof typeof titles] || 'Resources';
  }

  private getResourceDescription(resourceType: string): string {
    const descriptions = {
      books: 'A curated collection of books focused on mental health, psychology, and personal wellness.',
      movies: 'Movies that explore mental health themes and can provide therapeutic value.',
      music: 'Music playlists and tracks designed for relaxation, meditation, and emotional healing.'
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
      tmdb: ['apiKey']
    };
    return requiredFields[apiName as keyof typeof requiredFields] || [];
  }
}