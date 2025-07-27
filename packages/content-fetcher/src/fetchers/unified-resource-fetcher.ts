import { BaseContentFetcher } from '../base-fetcher';
import type {
  ResourceItem,
  ContentFetcherConfig,
  QualityAssessment,
  ContentProcessingResult,
  YouTubeVideoMetadata,
  RSSFeedItem
} from '../types';
import { logger } from '../logger';
import { handleError } from '../errors';

/**
 * Unified resource fetcher that extends the base fetcher to support
 * comprehensive therapeutic resource collection including videos and articles
 */
export class UnifiedResourceFetcher extends BaseContentFetcher {
  private qualityAssessmentCache = new Map<string, QualityAssessment>();
  private duplicateDetectionCache = new Set<string>();

  constructor(config: ContentFetcherConfig) {
    super(config);
  }

  /**
   * Fetch books from Google Books API with mental health focus
   */
  async fetchBooks(): Promise<ResourceItem[]> {
    try {
      this.validateApiConfig('googleBooks', this.config.apis.googleBooks);

      const books: ResourceItem[] = [];
      const mentalHealthQueries = [
        'mental health psychology',
        'anxiety depression therapy',
        'mindfulness meditation',
        'stress management wellness',
        'emotional healing recovery',
        'self-help psychology'
      ];

      for (const query of mentalHealthQueries) {
        const queryBooks = await this.fetchGoogleBooks(query);
        books.push(...queryBooks);
      }

      return this.processAndFilterContent(books);
    } catch (error) {
      logger.error('Failed to fetch books', { error: error instanceof Error ? error.message : String(error) });
      throw handleError(error, logger);
    }
  }

  /**
   * Fetch movies from TMDB API with mental health themes
   */
  async fetchMovies(): Promise<ResourceItem[]> {
    try {
      this.validateApiConfig('tmdb', this.config.apis.tmdb);

      const movies: ResourceItem[] = [];
      const mentalHealthQueries = [
        'mental health',
        'psychology',
        'therapy',
        'depression',
        'anxiety',
        'healing'
      ];

      for (const query of mentalHealthQueries) {
        const queryMovies = await this.fetchTMDBMovies(query);
        movies.push(...queryMovies);
      }

      return this.processAndFilterContent(movies);
    } catch (error) {
      logger.error('Failed to fetch movies', { error: error instanceof Error ? error.message : String(error) });
      throw handleError(error, logger);
    }
  }

  /**
   * Fetch music from Spotify API with therapeutic focus
   */
  async fetchMusic(): Promise<ResourceItem[]> {
    try {
      this.validateApiConfig('spotify', this.config.apis.spotify);

      const music: ResourceItem[] = [];
      const mentalHealthQueries = [
        'meditation music',
        'relaxation sounds',
        'anxiety relief',
        'sleep music',
        'healing frequencies',
        'mindfulness audio'
      ];

      for (const query of mentalHealthQueries) {
        const queryMusic = await this.fetchSpotifyMusic(query);
        music.push(...queryMusic);
      }

      return this.processAndFilterContent(music);
    } catch (error) {
      logger.error('Failed to fetch music', { error: error instanceof Error ? error.message : String(error) });
      throw handleError(error, logger);
    }
  }

  /**
   * Fetch videos from YouTube API with mental health focus
   */
  async fetchVideos(): Promise<ResourceItem[]> {
    try {
      this.validateApiConfig('youtube', this.config.apis.youtube);

      const videos: ResourceItem[] = [];
      const mentalHealthQueries = [
        'meditation guided',
        'anxiety relief',
        'depression help',
        'stress management',
        'mindfulness practice',
        'mental health therapy',
        'breathing exercises',
        'sleep meditation'
      ];

      for (const query of mentalHealthQueries) {
        const queryVideos = await this.fetchYouTubeVideos(query);
        videos.push(...queryVideos);
      }

      return this.processAndFilterContent(videos);
    } catch (error) {
      logger.error('Failed to fetch videos', { error: error instanceof Error ? error.message : String(error) });
      throw handleError(error, logger);
    }
  }

  /**
   * Fetch articles from RSS feeds and news APIs
   */
  async fetchArticles(): Promise<ResourceItem[]> {
    try {
      const articles: ResourceItem[] = [];

      // Fetch from RSS feeds
      if (this.config.apis.rssFeeds?.sources) {
        const rssArticles = await this.fetchFromRSSFeeds(this.config.apis.rssFeeds.sources);
        articles.push(...rssArticles);
      }

      // Fetch from News API
      if (this.config.apis.newsApi) {
        const newsArticles = await this.fetchFromNewsAPI();
        articles.push(...newsArticles);
      }

      return this.processAndFilterContent(articles);
    } catch (error) {
      logger.error('Failed to fetch articles', { error: error instanceof Error ? error.message : String(error) });
      throw handleError(error, logger);
    }
  }

  /**
   * Fetch podcasts (placeholder for future implementation)
   */
  async fetchPodcasts(): Promise<ResourceItem[]> {
    logger.info('Podcast fetching not yet implemented');
    return [];
  }

  /**
   * Assess content quality based on multiple factors
   */
  assessContentQuality(content: ResourceItem): number {
    const cacheKey = `${content.type}-${content.id}`;

    if (this.qualityAssessmentCache.has(cacheKey)) {
      return this.qualityAssessmentCache.get(cacheKey)!.score;
    }

    const assessment = this.performQualityAssessment(content);
    this.qualityAssessmentCache.set(cacheKey, assessment);

    return assessment.score;
  }

  /**
   * Filter content for mental health relevance
   */
  filterMentalHealthRelevant(content: ResourceItem[]): ResourceItem[] {
    const keywords = this.config.contentValidation.mentalHealthKeywords;

    return content.filter(item => {
      const textToCheck = `${item.title} ${item.description} ${item.tags.join(' ')} ${item.categories.join(' ')}`.toLowerCase();

      return keywords.some(keyword =>
        textToCheck.includes(keyword.toLowerCase())
      );
    });
  }

  /**
   * Process and filter content with deduplication and quality assessment
   */
  private async processAndFilterContent(content: ResourceItem[]): Promise<ResourceItem[]> {
    const result: ContentProcessingResult = {
      processed: [],
      filtered: [],
      duplicates: [],
      errors: [],
      statistics: {
        totalProcessed: content.length,
        validItems: 0,
        duplicatesRemoved: 0,
        qualityFiltered: 0
      }
    };

    for (const item of content) {
      try {
        // Check for duplicates
        const duplicateKey = this.generateDuplicateKey(item);
        if (this.duplicateDetectionCache.has(duplicateKey)) {
          result.duplicates.push(item);
          result.statistics.duplicatesRemoved++;
          continue;
        }

        // Validate content
        if (!this.validateContent(item)) {
          result.filtered.push(item);
          continue;
        }

        // Assess quality
        const qualityScore = this.assessContentQuality(item);
        if (qualityScore < this.config.contentValidation.qualityThreshold) {
          result.filtered.push(item);
          result.statistics.qualityFiltered++;
          continue;
        }

        // Update item with quality score
        item.qualityScore = qualityScore;

        // Add to processed items
        result.processed.push(item);
        this.duplicateDetectionCache.add(duplicateKey);
        result.statistics.validItems++;

      } catch (error) {
        result.errors.push({
          item,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.info('Content processing completed', result.statistics);
    return result.processed;
  }

  /**
   * Fetch videos from YouTube API
   */
  private async fetchYouTubeVideos(query: string): Promise<ResourceItem[]> {
    const { apiKey, baseUrl } = this.config.apis.youtube!;
    const maxResults = 25;

    const searchUrl = `${baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;

    return this.fetchWithRetry(async () => {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const videos: ResourceItem[] = [];

      for (const item of data.items || []) {
        try {
          // Get detailed video information
          const videoDetails = await this.getYouTubeVideoDetails(item.id.videoId);
          const resourceItem = this.convertYouTubeToResource(item, videoDetails);
          videos.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process YouTube video', {
            videoId: item.id.videoId,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return videos;
    });
  }

  /**
   * Get detailed YouTube video information
   */
  private async getYouTubeVideoDetails(videoId: string): Promise<YouTubeVideoMetadata> {
    const { apiKey, baseUrl } = this.config.apis.youtube!;
    const detailsUrl = `${baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const video = data.items[0];

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: new Date(video.snippet.publishedAt),
      duration: video.contentDetails.duration,
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      thumbnails: video.snippet.thumbnails,
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId
    };
  }

  /**
   * Convert YouTube video to ResourceItem
   */
  private convertYouTubeToResource(item: any, details: YouTubeVideoMetadata): ResourceItem {
    const duration = this.parseYouTubeDuration(details.duration);

    return {
      id: `youtube-${details.id}`,
      title: details.title,
      description: details.description.substring(0, 500) + (details.description.length > 500 ? '...' : ''),
      type: 'video',
      language: 'en', // Default to English, could be detected
      creator: details.channelTitle,
      publishDate: details.publishedAt,
      duration,
      tags: details.tags,
      categories: ['video', 'youtube'],
      therapeuticBenefits: this.extractTherapeuticBenefits(details.title, details.description),
      moodCategories: this.extractMoodCategories(details.title, details.description),
      targetAudience: ['general'],
      sourceUrl: `https://www.youtube.com/watch?v=${details.id}`,
      availability: {
        free: true,
        regions: ['global'],
        platforms: ['youtube']
      },
      imageUrl: details.thumbnails.high,
      thumbnailUrl: details.thumbnails.medium,
      previewUrl: `https://www.youtube.com/watch?v=${details.id}`,
      qualityScore: 0, // Will be calculated by assessContentQuality
      reviewCount: Math.floor(details.viewCount / 1000) // Approximate engagement
    };
  }

  /**
   * Fetch articles from RSS feeds
   */
  private async fetchFromRSSFeeds(feedUrls: string[]): Promise<ResourceItem[]> {
    const articles: ResourceItem[] = [];

    for (const feedUrl of feedUrls) {
      try {
        const feedArticles = await this.fetchRSSFeed(feedUrl);
        articles.push(...feedArticles);
      } catch (error) {
        logger.warn('Failed to fetch RSS feed', {
          feedUrl,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return articles;
  }

  /**
   * Fetch articles from a single RSS feed
   */
  private async fetchRSSFeed(feedUrl: string): Promise<ResourceItem[]> {
    // Note: In a real implementation, you would use an RSS parser library
    // For now, this is a placeholder that would need to be implemented
    logger.info('RSS feed parsing not yet implemented', { feedUrl });
    return [];
  }

  /**
   * Fetch articles from News API
   */
  private async fetchFromNewsAPI(): Promise<ResourceItem[]> {
    const { apiKey, baseUrl } = this.config.apis.newsApi!;
    const query = 'mental health OR psychology OR therapy OR mindfulness';
    const url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&apiKey=${apiKey}`;

    return this.fetchWithRetry(async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`News API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const articles: ResourceItem[] = [];

      for (const article of data.articles || []) {
        try {
          const resourceItem = this.convertNewsToResource(article);
          articles.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process news article', {
            title: article.title,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return articles;
    });
  }

  /**
   * Convert news article to ResourceItem
   */
  private convertNewsToResource(article: any): ResourceItem {
    return {
      id: `news-${Buffer.from(article.url).toString('base64').substring(0, 16)}`,
      title: article.title,
      description: article.description || '',
      type: 'article',
      language: 'en',
      author: article.author,
      publishDate: new Date(article.publishedAt),
      tags: [],
      categories: ['article', 'news'],
      therapeuticBenefits: this.extractTherapeuticBenefits(article.title, article.description),
      moodCategories: this.extractMoodCategories(article.title, article.description),
      targetAudience: ['general'],
      sourceUrl: article.url,
      availability: {
        free: true,
        regions: ['global'],
        platforms: ['web']
      },
      imageUrl: article.urlToImage,
      thumbnailUrl: article.urlToImage,
      qualityScore: 0 // Will be calculated by assessContentQuality
    };
  }

  /**
   * Perform quality assessment on content
   */
  private performQualityAssessment(content: ResourceItem): QualityAssessment {
    const factors = this.config.qualityAssessment.factors;

    // Calculate relevance score
    const relevance = this.calculateRelevanceScore(content);

    // Calculate authority score
    const authority = this.calculateAuthorityScore(content);

    // Calculate freshness score
    const freshness = this.calculateFreshnessScore(content);

    // Calculate engagement score
    const engagement = this.calculateEngagementScore(content);

    // Calculate weighted overall score
    const score = (
      relevance * factors.relevanceWeight +
      authority * factors.authorityWeight +
      freshness * factors.freshnessWeight +
      engagement * factors.engagementWeight
    ) / (factors.relevanceWeight + factors.authorityWeight + factors.freshnessWeight + factors.engagementWeight);

    const mentalHealthRelevance = this.checkMentalHealthRelevance(content);

    return {
      score: Math.round(score * 100) / 100,
      factors: {
        relevance,
        authority,
        freshness,
        engagement
      },
      mentalHealthRelevance,
      recommendations: this.generateQualityRecommendations(content, score)
    };
  }

  /**
   * Calculate relevance score based on mental health keywords
   */
  private calculateRelevanceScore(content: ResourceItem): number {
    const keywords = this.config.qualityAssessment.mentalHealthRelevanceKeywords;
    const text = `${content.title} ${content.description} ${content.tags.join(' ')}`.toLowerCase();

    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    return Math.min(matches / keywords.length * 2, 1); // Cap at 1.0
  }

  /**
   * Calculate authority score based on source trustworthiness
   */
  private calculateAuthorityScore(content: ResourceItem): number {
    const trustedSources = this.config.qualityAssessment.trustedSources;
    const domain = this.extractDomain(content.sourceUrl);

    if (trustedSources.includes(domain)) {
      return 1.0;
    }

    // Check for academic or medical domains
    if (domain.includes('.edu') || domain.includes('.gov') || domain.includes('mayo') || domain.includes('harvard')) {
      return 0.9;
    }

    // Check for established mental health organizations
    if (domain.includes('psychology') || domain.includes('therapy') || domain.includes('mental')) {
      return 0.7;
    }

    return 0.5; // Default score for unknown sources
  }

  /**
   * Calculate freshness score based on publication date
   */
  private calculateFreshnessScore(content: ResourceItem): number {
    if (!content.publishDate) {
      return 0.5; // Default for unknown dates
    }

    const now = new Date();
    const ageInDays = (now.getTime() - content.publishDate.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 30) return 1.0;
    if (ageInDays <= 90) return 0.8;
    if (ageInDays <= 365) return 0.6;
    if (ageInDays <= 730) return 0.4;
    return 0.2;
  }

  /**
   * Calculate engagement score based on available metrics
   */
  private calculateEngagementScore(content: ResourceItem): number {
    if (content.userRating && content.reviewCount) {
      const ratingScore = content.userRating / 5;
      const reviewScore = Math.min(content.reviewCount / 100, 1);
      return (ratingScore + reviewScore) / 2;
    }

    return 0.5; // Default for unknown engagement
  }

  /**
   * Check if content is relevant to mental health
   */
  private checkMentalHealthRelevance(content: ResourceItem): boolean {
    const keywords = this.config.qualityAssessment.mentalHealthRelevanceKeywords;
    const text = `${content.title} ${content.description} ${content.tags.join(' ')}`.toLowerCase();

    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateQualityRecommendations(content: ResourceItem, score: number): string[] {
    const recommendations: string[] = [];

    if (score < 0.6) {
      recommendations.push('Consider improving content relevance to mental health topics');
    }

    if (!content.publishDate) {
      recommendations.push('Add publication date for better freshness assessment');
    }

    if (!content.author && !content.creator) {
      recommendations.push('Add author/creator information for authority assessment');
    }

    if (content.tags.length < 3) {
      recommendations.push('Add more descriptive tags for better categorization');
    }

    return recommendations;
  }

  /**
   * Extract therapeutic benefits from text
   */
  private extractTherapeuticBenefits(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const benefits: string[] = [];

    const benefitKeywords = {
      'stress relief': ['stress', 'relief', 'relax'],
      'anxiety reduction': ['anxiety', 'worry', 'calm'],
      'mood improvement': ['mood', 'happiness', 'positive'],
      'sleep enhancement': ['sleep', 'insomnia', 'rest'],
      'focus improvement': ['focus', 'concentration', 'attention'],
      'emotional regulation': ['emotion', 'regulation', 'control']
    };

    for (const [benefit, keywords] of Object.entries(benefitKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        benefits.push(benefit);
      }
    }

    return benefits;
  }

  /**
   * Extract mood categories from text
   */
  private extractMoodCategories(title: string, description: string): any[] {
    const text = `${title} ${description}`.toLowerCase();
    const categories: any[] = [];

    const moodKeywords = {
      anxiety: ['anxiety', 'anxious', 'worry', 'panic'],
      depression: ['depression', 'sad', 'depressed', 'low mood'],
      stress: ['stress', 'stressed', 'pressure', 'overwhelm'],
      relaxation: ['relax', 'calm', 'peaceful', 'tranquil'],
      motivation: ['motivation', 'inspire', 'encourage', 'uplift'],
      sleep: ['sleep', 'insomnia', 'rest', 'bedtime'],
      focus: ['focus', 'concentration', 'attention', 'mindful'],
      healing: ['healing', 'recovery', 'therapy', 'treatment']
    };

    for (const [category, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    }

    return categories;
  }

  /**
   * Generate duplicate detection key
   */
  private generateDuplicateKey(item: ResourceItem): string {
    return `${item.type}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '')}-${item.author || item.creator || ''}`;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  /**
   * Fetch books from Google Books API
   */
  private async fetchGoogleBooks(query: string): Promise<ResourceItem[]> {
    const { apiKey, baseUrl } = this.config.apis.googleBooks!;
    const maxResults = 20;

    const searchUrl = `${baseUrl}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${apiKey}`;

    return this.fetchWithRetry(async () => {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const books: ResourceItem[] = [];

      for (const item of data.items || []) {
        try {
          const resourceItem = this.convertGoogleBookToResource(item);
          books.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process Google Books item', {
            bookId: item.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return books;
    });
  }

  /**
   * Fetch movies from TMDB API
   */
  private async fetchTMDBMovies(query: string): Promise<ResourceItem[]> {
    const { apiKey, baseUrl } = this.config.apis.tmdb!;

    const searchUrl = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    return this.fetchWithRetry(async () => {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const movies: ResourceItem[] = [];

      for (const item of data.results || []) {
        try {
          const resourceItem = this.convertTMDBToResource(item);
          movies.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process TMDB movie', {
            movieId: item.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return movies;
    });
  }

  /**
   * Fetch music from Spotify API
   */
  private async fetchSpotifyMusic(query: string): Promise<ResourceItem[]> {
    const { clientId, clientSecret, baseUrl } = this.config.apis.spotify!;

    // Get access token
    const token = await this.getSpotifyAccessToken(clientId, clientSecret);

    const searchUrl = `${baseUrl}/search?q=${encodeURIComponent(query)}&type=playlist,album&limit=20`;

    return this.fetchWithRetry(async () => {
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const music: ResourceItem[] = [];

      // Process playlists
      for (const playlist of data.playlists?.items || []) {
        try {
          const resourceItem = this.convertSpotifyToResource(playlist, 'playlist');
          music.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process Spotify playlist', {
            playlistId: playlist.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Process albums
      for (const album of data.albums?.items || []) {
        try {
          const resourceItem = this.convertSpotifyToResource(album, 'album');
          music.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process Spotify album', {
            albumId: album.id,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return music;
    });
  }

  /**
   * Get Spotify access token
   */
  private async getSpotifyAccessToken(clientId: string, clientSecret: string): Promise<string> {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify token error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Convert Google Books item to ResourceItem
   */
  private convertGoogleBookToResource(item: any): ResourceItem {
    const volumeInfo = item.volumeInfo;

    return {
      id: `googlebooks-${item.id}`,
      title: volumeInfo.title || 'Unknown Title',
      description: volumeInfo.description || '',
      type: 'book',
      language: volumeInfo.language || 'en',
      author: volumeInfo.authors?.join(', '),
      publishDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : undefined,
      tags: volumeInfo.categories || [],
      categories: ['book', 'google-books'],
      therapeuticBenefits: this.extractTherapeuticBenefits(volumeInfo.title, volumeInfo.description),
      moodCategories: this.extractMoodCategories(volumeInfo.title, volumeInfo.description),
      targetAudience: ['general'],
      sourceUrl: volumeInfo.infoLink || `https://books.google.com/books?id=${item.id}`,
      availability: {
        free: item.saleInfo?.saleability === 'FREE',
        regions: ['global'],
        platforms: ['google-books']
      },
      imageUrl: volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium,
      thumbnailUrl: volumeInfo.imageLinks?.thumbnail,
      qualityScore: 0, // Will be calculated by assessContentQuality

      // Legacy fields for backward compatibility
      year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : undefined,
      pages: volumeInfo.pageCount,
      isbn: volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier,
      image: volumeInfo.imageLinks?.thumbnail
    };
  }

  /**
   * Convert TMDB movie to ResourceItem
   */
  private convertTMDBToResource(item: any): ResourceItem {
    return {
      id: `tmdb-${item.id}`,
      title: item.title || item.original_title || 'Unknown Title',
      description: item.overview || '',
      type: 'video',
      language: item.original_language || 'en',
      publishDate: item.release_date ? new Date(item.release_date) : undefined,
      tags: [],
      categories: ['movie', 'tmdb'],
      therapeuticBenefits: this.extractTherapeuticBenefits(item.title, item.overview),
      moodCategories: this.extractMoodCategories(item.title, item.overview),
      targetAudience: ['general'],
      sourceUrl: `https://www.themoviedb.org/movie/${item.id}`,
      availability: {
        free: false,
        regions: ['global'],
        platforms: ['various']
      },
      imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
      thumbnailUrl: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : undefined,
      qualityScore: 0, // Will be calculated by assessContentQuality
      userRating: item.vote_average,
      reviewCount: item.vote_count,

      // Legacy fields for backward compatibility
      director: undefined, // Would need additional API call to get director
      rating: item.adult ? 'R' : 'PG',
      year: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
      image: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : undefined
    };
  }

  /**
   * Convert Spotify item to ResourceItem
   */
  private convertSpotifyToResource(item: any, type: 'playlist' | 'album'): ResourceItem {
    return {
      id: `spotify-${item.id}`,
      title: item.name || 'Unknown Title',
      description: item.description || '',
      type: 'music',
      language: 'en', // Default to English
      creator: type === 'playlist' ? item.owner?.display_name : item.artists?.[0]?.name,
      tags: [],
      categories: ['music', 'spotify', type],
      therapeuticBenefits: this.extractTherapeuticBenefits(item.name, item.description),
      moodCategories: this.extractMoodCategories(item.name, item.description),
      targetAudience: ['general'],
      sourceUrl: item.external_urls?.spotify || `https://open.spotify.com/${type}/${item.id}`,
      availability: {
        free: false, // Spotify requires subscription for full access
        regions: item.available_markets || ['global'],
        platforms: ['spotify']
      },
      imageUrl: item.images?.[0]?.url,
      thumbnailUrl: item.images?.[item.images.length - 1]?.url,
      qualityScore: 0, // Will be calculated by assessContentQuality

      // Legacy fields for backward compatibility
      artist: type === 'album' ? item.artists?.[0]?.name : item.owner?.display_name,
      spotifyUrl: item.external_urls?.spotify,
      image: item.images?.[item.images.length - 1]?.url
    };
  }

  /**
   * Parse YouTube duration format (PT4M13S) to seconds
   */
  private parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}
