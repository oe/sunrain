export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  
  // 书籍特有字段
  author?: string;
  year?: number;
  genre?: string;
  pages?: number;
  themes?: string[];
  benefits?: string[];
  isbn?: string;
  amazonUrl?: string;
  goodreadsUrl?: string;
  
  // 电影特有字段
  director?: string;
  duration?: string;
  rating?: string;
  streamingUrl?: string;
  trailerUrl?: string;
  
  // 音乐特有字段
  artist?: string;
  type?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  
  // 通用字段
  image?: string;
}

export interface ResourceCollection {
  title: string;
  description: string;
  items: ResourceItem[];
}

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
}

export interface ContentFetcher {
  fetchBooks(): Promise<ResourceItem[]>;
  fetchMovies(): Promise<ResourceItem[]>;
  fetchMusic(): Promise<ResourceItem[]>;
  validateContent(content: ResourceItem): boolean;
  updateResourceFiles(resources: { books?: ResourceItem[]; movies?: ResourceItem[]; music?: ResourceItem[] }): Promise<void>;
}

export interface FetchResult {
  success: boolean;
  data?: ResourceItem[];
  error?: string;
  timestamp: Date;
}

export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}