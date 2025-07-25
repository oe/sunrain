import fetch from 'node-fetch';
import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from '../types.js';
import { logger } from '../logger.js';
import { APIError } from '../errors.js';

export class MoviesFetcher extends BaseContentFetcher {
  constructor(config: ContentFetcherConfig) {
    super(config);
    // 由于TMDB API密钥可能未配置，我们不强制验证
    // this.validateApiConfig('tmdb', config.apis.tmdb);
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    // 此方法在books-fetcher中实现
    return [];
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    // 此方法在music-fetcher中实现
    return [];
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    logger.info('Starting movies fetch from TMDB API');
    
    try {
      // 获取治疗性电影
      const movies = await this.fetchTherapeuticMovies();
      
      logger.info(`Fetched ${movies.length} movies from API`);
      return movies;
    } catch (error) {
      logger.error('Failed to fetch movies', { error });
      throw error;
    }
  }

  private async fetchTherapeuticMovies(): Promise<ResourceItem[]> {
    const apiKey = this.config.apis.tmdb?.apiKey;
    
    if (!apiKey) {
      logger.warn('TMDB API key not configured, using mock data');
      return this.getMockTherapeuticMovies();
    }

    try {
      // 搜索心理健康相关电影
      const movies = await this.searchMentalHealthMovies(apiKey);
      return movies;
    } catch (error) {
      logger.error('Failed to fetch from TMDB API, using mock data', { error });
      return this.getMockTherapeuticMovies();
    }
  }

  private async searchMentalHealthMovies(apiKey: string): Promise<ResourceItem[]> {
    const searchQueries = [
      'mental health',
      'depression',
      'anxiety',
      'therapy',
      'psychology',
      'healing',
      'mindfulness',
      'emotional wellness'
    ];

    const allMovies: any[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`
        );

        if (!response.ok) {
          throw new APIError(
            `TMDB search failed: ${response.statusText}`,
            response.status,
            'tmdb'
          );
        }

        const data = await response.json() as any;
        allMovies.push(...(data.results || []));
      } catch (error) {
        logger.warn(`Failed to search for "${query}"`, { error });
      }
    }

    // 去重并转换格式
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );

    const movieItems: ResourceItem[] = [];

    for (const movie of uniqueMovies.slice(0, 10)) {
      try {
        // 获取详细信息
        const details = await this.getMovieDetails(movie.id, apiKey);
        
        const movieItem: ResourceItem = {
          id: `movie-${movie.id}`,
          title: movie.title,
          description: movie.overview || 'No description available',
          director: details.director || 'Unknown Director',
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
          duration: details.runtime ? `${details.runtime} minutes` : undefined,
          rating: this.getRatingFromTMDB(details.vote_average),
          image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
          trailerUrl: details.trailerUrl,
          themes: this.extractMovieThemes(movie.title, movie.overview || ''),
          benefits: this.extractMovieBenefits(movie.title, movie.overview || '')
        };

        movieItems.push(movieItem);
      } catch (error) {
        logger.warn(`Failed to get details for movie ${movie.id}`, { error });
      }
    }

    return movieItems;
  }

  private async getMovieDetails(movieId: number, apiKey: string): Promise<any> {
    try {
      // 获取电影详情
      const detailsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos`
      );

      if (!detailsResponse.ok) {
        throw new APIError(
          `Failed to get movie details: ${detailsResponse.statusText}`,
          detailsResponse.status,
          'tmdb'
        );
      }

      const details = await detailsResponse.json() as any;
      
      // 提取导演信息
      const director = details.credits?.crew?.find((person: any) => person.job === 'Director')?.name;
      
      // 提取预告片链接
      const trailer = details.videos?.results?.find((video: any) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;

      return {
        ...details,
        director,
        trailerUrl
      };
    } catch (error) {
      logger.warn(`Failed to get details for movie ${movieId}`, { error });
      return {};
    }
  }

  private getRatingFromTMDB(voteAverage: number): string {
    if (voteAverage >= 8) return 'Excellent';
    if (voteAverage >= 7) return 'Very Good';
    if (voteAverage >= 6) return 'Good';
    if (voteAverage >= 5) return 'Average';
    return 'Below Average';
  }

  private getMockTherapeuticMovies(): ResourceItem[] {
    return [
      {
        id: 'movie-1',
        title: 'Inside Out',
        description: 'A beautifully animated exploration of emotions and how they shape our experiences and memories. The film follows Riley, a young girl whose emotions - Joy, Sadness, Anger, Fear, and Disgust - guide her through a difficult transition in her life. This movie provides valuable insights into emotional intelligence and mental health.',
        director: 'Pete Docter, Ronnie Del Carmen',
        year: 2015,
        duration: '95 minutes',
        rating: 'PG',
        streamingUrl: 'https://www.disneyplus.com/movies/inside-out',
        trailerUrl: 'https://www.youtube.com/watch?v=yRUAzGQ3nSY',
        image: 'https://example.com/movie1.jpg',
        themes: ['emotional intelligence', 'mental health', 'psychology', 'emotions', 'growing up'],
        benefits: ['emotional understanding', 'mental health awareness', 'emotional processing', 'family communication']
      },
      {
        id: 'movie-2',
        title: 'Good Will Hunting',
        description: 'A powerful drama about a young man with extraordinary mathematical abilities who struggles with emotional trauma and trust issues. Through therapy sessions with a compassionate psychologist, he learns to confront his past and open himself to meaningful relationships. The film beautifully portrays the therapeutic process and healing.',
        director: 'Gus Van Sant',
        year: 1997,
        duration: '126 minutes',
        rating: 'R',
        streamingUrl: 'https://www.netflix.com/title/good-will-hunting',
        trailerUrl: 'https://www.youtube.com/watch?v=PaZVjZEFkRs',
        image: 'https://example.com/movie2.jpg',
        themes: ['therapy', 'trauma healing', 'psychology', 'emotional growth', 'trust'],
        benefits: ['therapy understanding', 'trauma processing', 'emotional healing', 'relationship building']
      },
      {
        id: 'movie-3',
        title: 'A Beautiful Mind',
        description: 'The biographical drama tells the story of John Nash, a brilliant mathematician who struggles with schizophrenia. The film provides insight into mental illness, the importance of support systems, and the possibility of living a fulfilling life despite mental health challenges. It reduces stigma and promotes understanding.',
        director: 'Ron Howard',
        year: 2001,
        duration: '135 minutes',
        rating: 'PG-13',
        streamingUrl: 'https://www.amazon.com/beautiful-mind',
        trailerUrl: 'https://www.youtube.com/watch?v=YjmkXvGaQQs',
        image: 'https://example.com/movie3.jpg',
        themes: ['mental illness', 'schizophrenia', 'support systems', 'resilience', 'stigma reduction'],
        benefits: ['mental health awareness', 'stigma reduction', 'hope and resilience', 'support understanding']
      },
      {
        id: 'movie-4',
        title: 'The Pursuit of Happyness',
        description: 'An inspiring true story about a father and son facing homelessness while pursuing a better life. The film explores themes of perseverance, hope, and resilience in the face of overwhelming challenges. It demonstrates the importance of mental strength and determination in overcoming adversity.',
        director: 'Gabriele Muccino',
        year: 2006,
        duration: '117 minutes',
        rating: 'PG-13',
        streamingUrl: 'https://www.netflix.com/title/pursuit-happyness',
        trailerUrl: 'https://www.youtube.com/watch?v=89Kq8SDyvfg',
        image: 'https://example.com/movie4.jpg',
        themes: ['resilience', 'perseverance', 'hope', 'mental strength', 'overcoming adversity'],
        benefits: ['inspiration', 'resilience building', 'hope cultivation', 'mental strength']
      },
      {
        id: 'movie-5',
        title: 'Silver Linings Playbook',
        description: 'A romantic comedy-drama that sensitively portrays bipolar disorder and depression. The story follows two people with mental health challenges who find healing and hope through their relationship. The film promotes understanding of mental illness while showing that people with mental health conditions can lead fulfilling lives.',
        director: 'David O. Russell',
        year: 2012,
        duration: '122 minutes',
        rating: 'R',
        streamingUrl: 'https://www.hulu.com/movie/silver-linings-playbook',
        trailerUrl: 'https://www.youtube.com/watch?v=Lj5_FhLaaQQ',
        image: 'https://example.com/movie5.jpg',
        themes: ['bipolar disorder', 'depression', 'mental health', 'healing', 'relationships'],
        benefits: ['mental health understanding', 'stigma reduction', 'hope and healing', 'relationship insights']
      }
    ];
  }

  private extractMovieThemes(title: string, description: string): string[] {
    const movieThemes = [
      'mental health', 'therapy', 'psychology', 'depression', 'anxiety',
      'trauma', 'healing', 'resilience', 'emotional intelligence', 'mindfulness',
      'bipolar disorder', 'schizophrenia', 'PTSD', 'addiction recovery', 'grief',
      '心理健康', '治疗', '心理学', '抑郁', '焦虑',
      '创伤', '治愈', '韧性', '情商', '正念'
    ];
    
    const searchText = `${title} ${description}`.toLowerCase();
    const themes: string[] = [];
    
    for (const theme of movieThemes) {
      if (searchText.includes(theme.toLowerCase())) {
        themes.push(theme);
      }
    }
    
    return [...new Set(themes)];
  }

  private extractMovieBenefits(title: string, description: string): string[] {
    const movieBenefits = [
      'emotional understanding', 'mental health awareness', 'therapy insights',
      'stigma reduction', 'hope and healing', 'resilience building',
      'emotional processing', 'trauma understanding', 'relationship insights',
      'inspiration', 'coping strategies', 'self-acceptance',
      '情感理解', '心理健康意识', '治疗洞察',
      '污名化减少', '希望与治愈', '韧性建设'
    ];
    
    const searchText = `${title} ${description}`.toLowerCase();
    const benefits: string[] = [];
    
    for (const benefit of movieBenefits) {
      if (searchText.includes(benefit.toLowerCase())) {
        benefits.push(benefit);
      }
    }
    
    return [...new Set(benefits)];
  }
}