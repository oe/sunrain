import fetch from 'node-fetch';
import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from '../types.js';
import { logger } from '../logger.js';
import { APIError } from '../errors.js';

export class BooksFetcher extends BaseContentFetcher {
  constructor(config: ContentFetcherConfig) {
    super(config);
    // 由于Goodreads API已停用，我们不强制要求API密钥
    // this.validateApiConfig('goodreads', config.apis.goodreads);
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    logger.info('Starting books fetch from Goodreads API');
    
    try {
      // 由于Goodreads API已经停止公开访问，我们使用模拟数据
      // 在实际实现中，可以使用其他书籍API如Google Books API
      const books = await this.fetchMentalHealthBooks();
      
      logger.info(`Fetched ${books.length} books from API`);
      return books;
    } catch (error) {
      logger.error('Failed to fetch books', { error });
      throw error;
    }
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    // 此方法在movies-fetcher中实现
    return [];
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    // 此方法在music-fetcher中实现
    return [];
  }

  private async fetchMentalHealthBooks(): Promise<ResourceItem[]> {
    // 模拟心理健康相关书籍数据
    // 在实际实现中，这里会调用真实的API
    const mentalHealthBooks: ResourceItem[] = [
      {
        id: 'book-1',
        title: 'The Anxiety and Worry Workbook',
        description: 'A comprehensive guide to managing anxiety and worry through cognitive behavioral therapy techniques. This workbook provides practical exercises, worksheets, and strategies to help readers understand and overcome anxiety disorders. It includes evidence-based approaches for dealing with generalized anxiety, panic attacks, and worry patterns.',
        author: 'David A. Clark',
        year: 2018,
        genre: 'Self-Help',
        pages: 320,
        themes: ['anxiety', 'CBT', 'mental health', 'worry', 'therapy'],
        benefits: ['stress reduction', 'coping strategies', 'anxiety management', 'emotional regulation'],
        isbn: '978-1462533091',
        amazonUrl: 'https://amazon.com/anxiety-worry-workbook',
        goodreadsUrl: 'https://goodreads.com/book/anxiety-worry-workbook',
        image: 'https://example.com/book1.jpg'
      },
      {
        id: 'book-2',
        title: 'Feeling Good: The New Mood Therapy',
        description: 'A groundbreaking book that introduces cognitive behavioral therapy techniques for treating depression and anxiety. Dr. Burns presents practical methods for changing negative thought patterns and improving mood through scientifically proven approaches. This book has helped millions of people overcome depression and develop healthier thinking patterns.',
        author: 'David D. Burns',
        year: 1980,
        genre: 'Psychology',
        pages: 736,
        themes: ['depression', 'CBT', 'mood therapy', 'cognitive therapy', 'mental health'],
        benefits: ['mood improvement', 'depression recovery', 'cognitive restructuring', 'emotional wellness'],
        isbn: '978-0380810338',
        amazonUrl: 'https://amazon.com/feeling-good-mood-therapy',
        goodreadsUrl: 'https://goodreads.com/book/feeling-good',
        image: 'https://example.com/book2.jpg'
      },
      {
        id: 'book-3',
        title: 'The Mindful Way Through Depression',
        description: 'This book combines mindfulness meditation with cognitive therapy to provide a revolutionary approach to treating depression. The authors present mindfulness-based cognitive therapy (MBCT) techniques that help prevent depression relapse and promote emotional well-being. Includes guided meditations and practical exercises for daily life.',
        author: 'Mark Williams, John Teasdale, Zindel Segal, Jon Kabat-Zinn',
        year: 2007,
        genre: 'Mindfulness',
        pages: 273,
        themes: ['mindfulness', 'depression', 'meditation', 'MBCT', 'cognitive therapy'],
        benefits: ['depression prevention', 'mindfulness practice', 'emotional awareness', 'stress reduction'],
        isbn: '978-1593851286',
        amazonUrl: 'https://amazon.com/mindful-way-through-depression',
        goodreadsUrl: 'https://goodreads.com/book/mindful-depression',
        image: 'https://example.com/book3.jpg'
      },
      {
        id: 'book-4',
        title: 'The Body Keeps the Score',
        description: 'A revolutionary understanding of trauma and its effects on the body and mind. Dr. van der Kolk explores how trauma affects the brain and body, and presents innovative treatments for trauma recovery. This book provides insights into PTSD, childhood trauma, and various therapeutic approaches including EMDR, yoga, and neurofeedback.',
        author: 'Bessel van der Kolk',
        year: 2014,
        genre: 'Trauma Psychology',
        pages: 464,
        themes: ['trauma', 'PTSD', 'neuroscience', 'therapy', 'recovery'],
        benefits: ['trauma understanding', 'healing approaches', 'body awareness', 'recovery strategies'],
        isbn: '978-0143127741',
        amazonUrl: 'https://amazon.com/body-keeps-score',
        goodreadsUrl: 'https://goodreads.com/book/body-keeps-score',
        image: 'https://example.com/book4.jpg'
      },
      {
        id: 'book-5',
        title: 'Atomic Habits',
        description: 'A practical guide to building good habits and breaking bad ones through small, incremental changes. James Clear presents a comprehensive system for habit formation based on scientific research and real-world applications. This book is particularly valuable for mental health as it helps readers develop consistent self-care practices and positive behavioral patterns.',
        author: 'James Clear',
        year: 2018,
        genre: 'Self-Improvement',
        pages: 320,
        themes: ['habits', 'behavior change', 'self-improvement', 'psychology', 'productivity'],
        benefits: ['habit formation', 'behavioral change', 'self-discipline', 'personal growth'],
        isbn: '978-0735211292',
        amazonUrl: 'https://amazon.com/atomic-habits',
        goodreadsUrl: 'https://goodreads.com/book/atomic-habits',
        image: 'https://example.com/book5.jpg'
      }
    ];

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mentalHealthBooks;
  }

  private async fetchFromGoogleBooksAPI(query: string): Promise<ResourceItem[]> {
    // 这是一个使用Google Books API的示例实现
    // 可以替代已停用的Goodreads API
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (!apiKey) {
      logger.warn('Google Books API key not configured, using mock data');
      return [];
    }

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=20`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new APIError(
          `Google Books API request failed: ${response.statusText}`,
          response.status,
          'google-books'
        );
      }

      const data = await response.json() as any;
      const books: ResourceItem[] = [];

      for (const item of data.items || []) {
        const volumeInfo = item.volumeInfo;
        
        const book: ResourceItem = {
          id: item.id,
          title: volumeInfo.title || 'Unknown Title',
          description: volumeInfo.description || 'No description available',
          author: volumeInfo.authors?.join(', ') || 'Unknown Author',
          year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : undefined,
          genre: volumeInfo.categories?.join(', ') || 'Unknown',
          pages: volumeInfo.pageCount,
          themes: this.extractThemes(volumeInfo.description || ''),
          benefits: this.extractBenefits(volumeInfo.description || ''),
          isbn: volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier,
          image: volumeInfo.imageLinks?.thumbnail
        };

        books.push(book);
      }

      return books;
    } catch (error) {
      logger.error('Failed to fetch from Google Books API', { error, query });
      throw error;
    }
  }

  private extractThemes(description: string): string[] {
    const themes: string[] = [];
    const keywords = this.config.contentValidation.mentalHealthKeywords;
    
    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        themes.push(keyword);
      }
    }
    
    return [...new Set(themes)]; // 去重
  }

  private extractBenefits(description: string): string[] {
    const benefitKeywords = [
      'stress reduction', 'anxiety relief', 'mood improvement', 'emotional regulation',
      'coping strategies', 'healing', 'recovery', 'wellness', 'self-care',
      '压力缓解', '焦虑缓解', '情绪改善', '情绪调节', '应对策略', '治愈', '康复', '健康', '自我关怀'
    ];
    
    const benefits: string[] = [];
    for (const benefit of benefitKeywords) {
      if (description.toLowerCase().includes(benefit.toLowerCase())) {
        benefits.push(benefit);
      }
    }
    
    return [...new Set(benefits)];
  }
}