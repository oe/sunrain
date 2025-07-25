/**
 * Common resource item interface used across the application
 */
export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  
  // Book-specific fields
  author?: string;
  year?: number;
  genre?: string;
  pages?: number;
  themes?: string[];
  benefits?: string[];
  isbn?: string;
  amazonUrl?: string;
  goodreadsUrl?: string;
  
  // Movie-specific fields
  director?: string;
  duration?: string;
  rating?: string;
  streamingUrl?: string;
  trailerUrl?: string;
  
  // Music-specific fields
  artist?: string;
  type?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  
  // Common fields
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
  };
  updateFrequency: {
    books: string; // cron expression
    music: string;
    movies: string;
  };
  contentValidation: {
    minDescriptionLength: number;
    requiredFields: string[];
    mentalHealthKeywords: string[];
  };
  output: {
    booksPath: string;
    musicPath: string;
    moviesPath: string;
  };
  monetization?: {
    amazon?: {
      affiliateTag: string;
      regions: Record<string, string>;
    };
    spotify?: {
      partnerCode: string;
    };
    appleMusic?: {
      affiliateToken: string;
    };
  };
}

/**
 * Content fetcher interface
 */
export interface ContentFetcher {
  fetchBooks(): Promise<ResourceItem[]>;
  fetchMovies(): Promise<ResourceItem[]>;
  fetchMusic(): Promise<ResourceItem[]>;
  validateContent(content: ResourceItem): boolean;
  updateResourceFiles(resources: { books?: ResourceItem[]; movies?: ResourceItem[]; music?: ResourceItem[] }): Promise<void>;
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
 * Logger interface
 */
export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}