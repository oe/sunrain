import { BaseContentFetcher } from './base-fetcher.js';
import { BooksFetcher } from './fetchers/books-fetcher.js';
import { MusicFetcher } from './fetchers/music-fetcher.js';
import { MoviesFetcher } from './fetchers/movies-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from './types.js';
import { logger } from './logger.js';
import { handleError } from './errors.js';

export class UnifiedContentFetcher extends BaseContentFetcher {
  private booksFetcher: BooksFetcher;
  private musicFetcher: MusicFetcher;
  private moviesFetcher: MoviesFetcher;

  constructor(config: ContentFetcherConfig) {
    super(config);
    this.booksFetcher = new BooksFetcher(config);
    this.musicFetcher = new MusicFetcher(config);
    this.moviesFetcher = new MoviesFetcher(config);
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    try {
      logger.info('Fetching books using BooksFetcher...');
      return await this.booksFetcher.fetchBooks();
    } catch (error) {
      const handledError = handleError(error, logger);
      logger.error('Failed to fetch books', { error: handledError.message });
      throw handledError;
    }
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    try {
      logger.info('Fetching music using MusicFetcher...');
      return await this.musicFetcher.fetchMusic();
    } catch (error) {
      const handledError = handleError(error, logger);
      logger.error('Failed to fetch music', { error: handledError.message });
      throw handledError;
    }
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    try {
      logger.info('Fetching movies using MoviesFetcher...');
      return await this.moviesFetcher.fetchMovies();
    } catch (error) {
      const handledError = handleError(error, logger);
      logger.error('Failed to fetch movies', { error: handledError.message });
      throw handledError;
    }
  }

  async fetchAll(): Promise<{
    books: ResourceItem[];
    music: ResourceItem[];
    movies: ResourceItem[];
  }> {
    logger.info('Starting comprehensive content fetch...');
    
    const results = {
      books: [] as ResourceItem[],
      music: [] as ResourceItem[],
      movies: [] as ResourceItem[]
    };

    const errors: string[] = [];

    // 并行获取所有内容类型
    const fetchPromises = [
      this.fetchBooks().then(books => {
        results.books = books;
        logger.info(`Successfully fetched ${books.length} books`);
      }).catch(error => {
        errors.push(`Books: ${error.message}`);
        logger.warn('Books fetch failed, continuing with other content types');
      }),

      this.fetchMusic().then(music => {
        results.music = music;
        logger.info(`Successfully fetched ${music.length} music items`);
      }).catch(error => {
        errors.push(`Music: ${error.message}`);
        logger.warn('Music fetch failed, continuing with other content types');
      }),

      this.fetchMovies().then(movies => {
        results.movies = movies;
        logger.info(`Successfully fetched ${movies.length} movies`);
      }).catch(error => {
        errors.push(`Movies: ${error.message}`);
        logger.warn('Movies fetch failed, continuing with other content types');
      })
    ];

    await Promise.allSettled(fetchPromises);

    // 记录结果摘要
    const totalItems = results.books.length + results.music.length + results.movies.length;
    logger.info('Content fetch completed', {
      books: results.books.length,
      music: results.music.length,
      movies: results.movies.length,
      total: totalItems,
      errors: errors.length
    });

    if (errors.length > 0) {
      logger.warn('Some content types failed to fetch', { errors });
    }

    return results;
  }

  async updateAllResources(): Promise<void> {
    try {
      logger.info('Starting comprehensive resource update...');
      
      const content = await this.fetchAll();
      
      // 验证所有内容
      const validatedContent = {
        books: this.validator.validateBatch(content.books),
        music: this.validator.validateBatch(content.music),
        movies: this.validator.validateBatch(content.movies)
      };

      // 更新资源文件
      await this.updateResourceFiles(validatedContent);
      
      const totalValid = validatedContent.books.length + 
                        validatedContent.music.length + 
                        validatedContent.movies.length;
      
      logger.info('All resources updated successfully', {
        validBooks: validatedContent.books.length,
        validMusic: validatedContent.music.length,
        validMovies: validatedContent.movies.length,
        totalValid
      });
      
    } catch (error) {
      const handledError = handleError(error, logger);
      logger.error('Failed to update all resources', { error: handledError.message });
      throw handledError;
    }
  }

  async updateSpecificResource(type: 'books' | 'music' | 'movies'): Promise<void> {
    try {
      logger.info(`Starting ${type} resource update...`);
      
      let content: ResourceItem[];
      
      switch (type) {
        case 'books':
          content = await this.fetchBooks();
          break;
        case 'music':
          content = await this.fetchMusic();
          break;
        case 'movies':
          content = await this.fetchMovies();
          break;
        default:
          throw new Error(`Unknown content type: ${type}`);
      }

      // 验证内容
      const validatedContent = this.validator.validateBatch(content);
      
      // 更新对应的资源文件
      const updateData: any = {};
      updateData[type] = validatedContent;
      
      await this.updateResourceFiles(updateData);
      
      logger.info(`${type} resource updated successfully`, {
        fetched: content.length,
        valid: validatedContent.length
      });
      
    } catch (error) {
      const handledError = handleError(error, logger);
      logger.error(`Failed to update ${type} resource`, { error: handledError.message });
      throw handledError;
    }
  }

  // 健康检查方法
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      books: boolean;
      music: boolean;
      movies: boolean;
    };
    details: string[];
  }> {
    logger.info('Performing health check...');
    
    const services = {
      books: false,
      music: false,
      movies: false
    };
    
    const details: string[] = [];
    
    // 检查书籍服务
    try {
      const books = await this.fetchBooks();
      services.books = books.length > 0;
      details.push(`Books: ${books.length} items available`);
    } catch (error) {
      details.push(`Books: Service unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // 检查音乐服务
    try {
      const music = await this.fetchMusic();
      services.music = music.length > 0;
      details.push(`Music: ${music.length} items available`);
    } catch (error) {
      details.push(`Music: Service unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // 检查电影服务
    try {
      const movies = await this.fetchMovies();
      services.movies = movies.length > 0;
      details.push(`Movies: ${movies.length} items available`);
    } catch (error) {
      details.push(`Movies: Service unavailable - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // 确定整体状态
    const healthyServices = Object.values(services).filter(Boolean).length;
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (healthyServices === 3) {
      status = 'healthy';
    } else if (healthyServices >= 1) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    logger.info('Health check completed', {
      status,
      healthyServices: `${healthyServices}/3`,
      services
    });
    
    return {
      status,
      services,
      details
    };
  }
}