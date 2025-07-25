/** @format */

import fetch from 'node-fetch';
import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from '@sunrain/shared';
import { logger } from '../logger.js';
import { APIError } from '../errors.js';
import { URLGenerator, MonetizationConfig } from '../utils/url-generator.js';

export class BooksFetcher extends BaseContentFetcher {
  private urlGenerator: URLGenerator;

  constructor(config: ContentFetcherConfig) {
    super(config);
    // Extract monetization config from the full config
    const monetizationConfig: MonetizationConfig = {
      amazon: config.monetization?.amazon,
      spotify: config.monetization?.spotify,
      appleMusic: config.monetization?.appleMusic
    };
    this.urlGenerator = new URLGenerator(monetizationConfig);
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    logger.info('Starting books fetch from Google Books API');

    try {
      const books = await this.fetchMentalHealthBooks();
      logger.info(`Fetched ${books.length} books from API`);
      return books;
    } catch (error) {
      logger.error('Failed to fetch books', { error });
      throw error;
    }
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    return [];
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    return [];
  }

  private async fetchMentalHealthBooks(): Promise<ResourceItem[]> {
    // 使用多个搜索查询来获取更全面的结果
    const searchQueries = [
      'mental health psychology',
      'anxiety depression therapy',
      'mindfulness meditation wellness',
      'cognitive behavioral therapy',
      'trauma recovery healing',
      'self-help emotional wellness'
    ];

    const allBooks: ResourceItem[] = [];

    for (const query of searchQueries) {
      try {
        const books = await this.fetchFromGoogleBooksAPI(query);
        allBooks.push(...books);

        // 添加延迟以避免API限制
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        logger.warn(`Failed to fetch books for query "${query}"`, { error });
      }
    }

    // 去重并限制数量
    const uniqueBooks = this.deduplicateBooks(allBooks);
    return uniqueBooks.slice(0, 20); // 限制为20本书
  }

  private async fetchFromGoogleBooksAPI(
    query: string
  ): Promise<ResourceItem[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Books API key not configured');
    }

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&key=${apiKey}&maxResults=10&langRestrict=en`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new APIError(
          `Google Books API request failed: ${response.statusText}`,
          response.status,
          'google-books'
        );
      }

      const data = (await response.json()) as any;
      const books: ResourceItem[] = [];

      for (const item of data.items || []) {
        const volumeInfo = item.volumeInfo;

        // 过滤掉没有描述或描述太短的书籍
        if (!volumeInfo.description || volumeInfo.description.length < 100) {
          continue;
        }

        // 检查是否与心理健康相关
        if (
          !this.isMentalHealthRelated(volumeInfo.title, volumeInfo.description)
        ) {
          continue;
        }

        const isbn = this.extractISBN(volumeInfo.industryIdentifiers);

        const book: ResourceItem = {
          id: item.id,
          title: volumeInfo.title || 'Unknown Title',
          description: this.cleanDescription(volumeInfo.description),
          author: volumeInfo.authors?.join(', ') || 'Unknown Author',
          year: volumeInfo.publishedDate
            ? new Date(volumeInfo.publishedDate).getFullYear()
            : undefined,
          genre: volumeInfo.categories?.join(', ') || 'Psychology',
          pages: volumeInfo.pageCount,
          themes: this.extractThemes(volumeInfo.description || ''),
          benefits: this.extractBenefits(volumeInfo.description || ''),
          isbn: isbn,
          amazonUrl: isbn
            ? this.urlGenerator.generateAmazonUrlFromISBN(isbn)
            : undefined,
          goodreadsUrl: this.urlGenerator.generateGoodreadsUrl(
            volumeInfo.title,
            volumeInfo.authors?.join(', ')
          ),
          image:
            volumeInfo.imageLinks?.thumbnail ||
            volumeInfo.imageLinks?.smallThumbnail
        };

        books.push(book);
      }

      return books;
    } catch (error) {
      logger.error('Failed to fetch from Google Books API', { error, query });
      throw error;
    }
  }

  private extractISBN(identifiers: any[]): string | undefined {
    if (!identifiers) return undefined;

    // 优先选择ISBN-13，然后是ISBN-10
    const isbn13 = identifiers.find((id) => id.type === 'ISBN_13');
    if (isbn13) return isbn13.identifier;

    const isbn10 = identifiers.find((id) => id.type === 'ISBN_10');
    if (isbn10) return isbn10.identifier;

    return undefined;
  }

  private cleanDescription(description: string): string {
    // 移除HTML标签
    return description.replace(/<[^>]*>/g, '').trim();
  }

  private isMentalHealthRelated(title: string, description: string): boolean {
    const keywords = this.config.contentValidation.mentalHealthKeywords;
    const searchText = `${title} ${description}`.toLowerCase();

    return keywords.some((keyword) =>
      searchText.includes(keyword.toLowerCase())
    );
  }

  private extractThemes(description: string): string[] {
    const themes: string[] = [];
    const keywords = this.config.contentValidation.mentalHealthKeywords;

    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        themes.push(keyword);
      }
    }

    return [...new Set(themes)];
  }

  private extractBenefits(description: string): string[] {
    const benefitKeywords = [
      'stress reduction',
      'anxiety relief',
      'mood improvement',
      'emotional regulation',
      'coping strategies',
      'healing',
      'recovery',
      'wellness',
      'self-care',
      'mindfulness practice',
      'therapy techniques',
      'personal growth'
    ];

    const benefits: string[] = [];
    for (const benefit of benefitKeywords) {
      if (description.toLowerCase().includes(benefit.toLowerCase())) {
        benefits.push(benefit);
      }
    }

    return [...new Set(benefits)];
  }

  private deduplicateBooks(books: ResourceItem[]): ResourceItem[] {
    const seen = new Set<string>();
    return books.filter((book) => {
      const key = `${book.title.toLowerCase()}-${book.author?.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
