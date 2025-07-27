/**
 * Resource types supported by the platform
 */
export type ResourceType = 'book' | 'music' | 'video' | 'article' | 'podcast';

/**
 * Mood categories for therapeutic resources
 */
export type MoodCategory = 'anxiety' | 'depression' | 'stress' | 'relaxation' | 'motivation' | 'sleep' | 'focus' | 'healing';

/**
 * Common resource item interface used across the application
 */
export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  language: string;

  // Metadata
  author?: string;
  creator?: string;
  publishDate?: Date;
  duration?: number; // in seconds for audio/video
  tags: string[];
  categories: string[];

  // Therapeutic properties
  therapeuticBenefits: string[];
  moodCategories: MoodCategory[];
  targetAudience: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';

  // Access information
  sourceUrl: string;
  affiliateLinks?: Record<string, string>;
  availability: {
    free: boolean;
    regions: string[];
    platforms: string[];
  };

  // Media
  imageUrl?: string;
  thumbnailUrl?: string;
  previewUrl?: string;

  // Quality metrics
  qualityScore: number;
  userRating?: number;
  reviewCount?: number;

  // Legacy fields for backward compatibility
  // Book-specific
  year?: number;
  genre?: string;
  pages?: number;
  themes?: string[];
  benefits?: string[];
  isbn?: string;
  amazonUrl?: string;
  goodreadsUrl?: string;

  // Movie-specific
  director?: string;
  rating?: string;
  streamingUrl?: string;
  trailerUrl?: string;

  // Music-specific
  artist?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;

  // Common legacy
  image?: string;
}

/**
 * Resource collection interface
 */
export interface ResourceCollection {
  title: string;
  description: string;
  items: ResourceItem[];
}

/**
 * Content fetcher configuration interface
 */
export interface ContentFetcherConfig {
  apis: {
    // Existing APIs
    goodreads?: {
      apiKey: string;
      baseUrl: string;
    };
    spotify?: {
      clientId: string;
      clientSecret: string;
      baseUrl: string;
    };
    tmdb?: {
      apiKey: string;
      baseUrl: string;
    };
    appleMusic?: {
      apiKey: string;
      teamId: string;
      keyId: string;
      baseUrl: string;
    };
    // New APIs for comprehensive content
    youtube?: {
      apiKey: string;
      baseUrl: string;
    };
    newsApi?: {
      apiKey: string;
      baseUrl: string;
    };
    rssFeeds?: {
      sources: string[];
    };
    googleBooks?: {
      apiKey: string;
      baseUrl: string;
    };
  };
  updateFrequency: {
    books: string; // cron expression
    music: string;
    movies: string;
    videos: string;
    articles: string;
    podcasts: string;
    quotes: string;
  };
  contentValidation: {
    minDescriptionLength: number;
    requiredFields: string[];
    mentalHealthKeywords: string[];
    qualityThreshold: number;
    languageSupport: string[];
  };
  qualityAssessment: {
    enabled: boolean;
    factors: {
      relevanceWeight: number;
      authorityWeight: number;
      freshnessWeight: number;
      engagementWeight: number;
    };
    mentalHealthRelevanceKeywords: string[];
    trustedSources: string[];
  };
  output: {
    booksPath: string;
    musicPath: string;
    moviesPath: string;
    videosPath: string;
    articlesPath: string;
    podcastsPath: string;
    quotesPath: string;
  };
  monetization?: {
    amazon?: {
      affiliateTag: string | Record<string, string>;
      regions: Record<string, string>;
      apiKey?: string;
      apiSecret?: string;
    };
    spotify?: {
      partnerCode: string;
    };
    appleMusic?: {
      affiliateToken: string;
    };
    youtube?: {
      partnerCode: string;
    };
  };
}

/**
 * Content fetcher interface
 */
export interface ContentFetcher {
  // Core fetching methods
  fetchBooks(): Promise<ResourceItem[]>;
  fetchMovies(): Promise<ResourceItem[]>;
  fetchMusic(): Promise<ResourceItem[]>;
  fetchVideos(): Promise<ResourceItem[]>;
  fetchArticles(): Promise<ResourceItem[]>;
  fetchPodcasts(): Promise<ResourceItem[]>;
  fetchQuotes(): Promise<ResourceItem[]>;

  // Content validation and quality assessment
  validateContent(content: ResourceItem): boolean;
  assessContentQuality(content: ResourceItem): number;
  filterMentalHealthRelevant(content: ResourceItem[]): ResourceItem[];

  // File management
  updateResourceFiles(resources: {
    books?: ResourceItem[];
    movies?: ResourceItem[];
    music?: ResourceItem[];
    videos?: ResourceItem[];
    articles?: ResourceItem[];
    podcasts?: ResourceItem[];
    quotes?: ResourceItem[];
  }): Promise<void>;
}

/**
 * Fetch result interface
 */
export interface FetchResult {
  success: boolean;
  data?: ResourceItem[];
  error?: string;
  timestamp: Date;
}

/**
 * Quality assessment result interface
 */
export interface QualityAssessment {
  score: number;
  factors: {
    relevance: number;
    authority: number;
    freshness: number;
    engagement: number;
  };
  mentalHealthRelevance: boolean;
  recommendations: string[];
}

/**
 * Content processing result interface
 */
export interface ContentProcessingResult {
  processed: ResourceItem[];
  filtered: ResourceItem[];
  duplicates: ResourceItem[];
  errors: Array<{
    item: Partial<ResourceItem>;
    error: string;
  }>;
  statistics: {
    totalProcessed: number;
    validItems: number;
    duplicatesRemoved: number;
    qualityFiltered: number;
  };
}

/**
 * RSS feed item interface
 */
export interface RSSFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  author?: string;
  categories: string[];
  content?: string;
}

/**
 * YouTube video metadata interface
 */
export interface YouTubeVideoMetadata {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: Date;
  duration: string;
  viewCount: number;
  likeCount: number;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  tags: string[];
  categoryId: string;
}

/**
 * Logger interface
 */
export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}
