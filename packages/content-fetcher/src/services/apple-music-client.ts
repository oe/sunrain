import fetch from "node-fetch";
import { AppleMusicJWTService } from "./apple-music-jwt.js";
import { logger } from "../logger.js";
import { APIError } from "../errors.js";

export interface AppleMusicPlaylist {
  id: string;
  type: "playlists";
  attributes: {
    name: string;
    description?: {
      standard: string;
    };
    curatorName: string;
    artwork?: {
      width: number;
      height: number;
      url: string;
    };
    url: string;
    trackCount: number;
    playParams?: {
      id: string;
      kind: string;
    };
  };
  relationships?: {
    tracks?: {
      data: AppleMusicTrack[];
    };
  };
}

export interface AppleMusicAlbum {
  id: string;
  type: "albums";
  attributes: {
    name: string;
    artistName: string;
    artwork?: {
      width: number;
      height: number;
      url: string;
    };
    url: string;
    trackCount: number;
    releaseDate?: string;
    genreNames: string[];
    playParams?: {
      id: string;
      kind: string;
    };
  };
}

export interface AppleMusicTrack {
  id: string;
  type: "songs";
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    playParams?: {
      id: string;
      kind: string;
    };
  };
}

export interface AppleMusicSearchResponse {
  results: {
    playlists?: {
      data: AppleMusicPlaylist[];
    };
    albums?: {
      data: AppleMusicAlbum[];
    };
    songs?: {
      data: AppleMusicTrack[];
    };
  };
}

export class AppleMusicClient {
  private jwtService: AppleMusicJWTService;
  private baseUrl: string;
  private readonly RATE_LIMIT_DELAY = 100; // 100ms between requests to respect rate limits

  constructor(
    jwtService: AppleMusicJWTService,
    baseUrl: string = "https://api.music.apple.com/v1"
  ) {
    this.jwtService = jwtService;
    this.baseUrl = baseUrl;
  }

  /**
   * Search for therapeutic playlists
   */
  async searchPlaylists(
    query: string,
    limit: number = 10
  ): Promise<AppleMusicPlaylist[]> {
    try {
      const searchResponse = await this.search(query, ["playlists"], limit);
      return searchResponse.results.playlists?.data || [];
    } catch (error) {
      logger.error("Failed to search Apple Music playlists", { query, error });
      throw error;
    }
  }

  /**
   * Search for therapeutic albums
   */
  async searchAlbums(
    query: string,
    limit: number = 10
  ): Promise<AppleMusicAlbum[]> {
    try {
      const searchResponse = await this.search(query, ["albums"], limit);
      return searchResponse.results.albums?.data || [];
    } catch (error) {
      logger.error("Failed to search Apple Music albums", { query, error });
      throw error;
    }
  }

  /**
   * Get detailed information about a playlist including tracks
   */
  async getPlaylistDetails(
    playlistId: string
  ): Promise<AppleMusicPlaylist | null> {
    try {
      const token = await this.jwtService.getValidToken();
      const url = `${this.baseUrl}/catalog/us/playlists/${playlistId}?include=tracks`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Music-User-Token": "", // Optional: for user-specific content
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new APIError(
            "Apple Music authentication failed",
            response.status,
            "apple-music"
          );
        }
        if (response.status === 404) {
          logger.warn(`Apple Music playlist not found: ${playlistId}`);
          return null;
        }
        throw new APIError(
          `Apple Music playlist fetch failed: ${response.statusText}`,
          response.status,
          "apple-music"
        );
      }

      const data = (await response.json()) as { data: AppleMusicPlaylist[] };
      return data.data[0] || null;
    } catch (error) {
      logger.error("Failed to get Apple Music playlist details", {
        playlistId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get detailed information about an album
   */
  async getAlbumDetails(albumId: string): Promise<AppleMusicAlbum | null> {
    try {
      const token = await this.jwtService.getValidToken();
      const url = `${this.baseUrl}/catalog/us/albums/${albumId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new APIError(
            "Apple Music authentication failed",
            response.status,
            "apple-music"
          );
        }
        if (response.status === 404) {
          logger.warn(`Apple Music album not found: ${albumId}`);
          return null;
        }
        throw new APIError(
          `Apple Music album fetch failed: ${response.statusText}`,
          response.status,
          "apple-music"
        );
      }

      const data = (await response.json()) as { data: AppleMusicAlbum[] };
      return data.data[0] || null;
    } catch (error) {
      logger.error("Failed to get Apple Music album details", {
        albumId,
        error,
      });
      throw error;
    }
  }

  /**
   * Search for therapeutic content with mental health keywords
   */
  async searchTherapeuticContent(limit: number = 20): Promise<{
    playlists: AppleMusicPlaylist[];
    albums: AppleMusicAlbum[];
  }> {
    const therapeuticQueries = [
      // Core mental health terms
      "meditation music",
      "mindfulness meditation",
      "anxiety relief music",
      "stress relief music",
      "depression support music",
      "sleep therapy music",
      "healing music",
      "therapeutic sounds",
      "mental wellness music",
      "emotional healing",

      // Relaxation and calm
      "relaxation playlist",
      "calming music",
      "peaceful music",
      "tranquil sounds",
      "serenity music",
      "zen meditation",

      // Sleep and rest
      "sleep music",
      "bedtime music",
      "insomnia relief",
      "deep sleep sounds",
      "night time relaxation",

      // Focus and concentration
      "focus music",
      "concentration music",
      "study music",
      "brain waves",
      "cognitive enhancement",

      // Specialized therapeutic sounds
      "ambient meditation",
      "nature sounds",
      "binaural beats",
      "white noise",
      "pink noise",
      "brown noise",
      "rain sounds",
      "ocean waves",
      "forest sounds",

      // Activity-based
      "yoga music",
      "tai chi music",
      "breathing exercises",
      "progressive relaxation",
      "body scan meditation",

      // Emotional support
      "grief support music",
      "trauma healing music",
      "self-compassion music",
      "confidence building music",
      "positive affirmations music",
    ];

    const allPlaylists: AppleMusicPlaylist[] = [];
    const allAlbums: AppleMusicAlbum[] = [];

    for (const query of therapeuticQueries) {
      try {
        // Add delay to respect rate limits
        await this.delay(this.RATE_LIMIT_DELAY);

        const searchResponse = await this.search(
          query,
          ["playlists", "albums"],
          3
        );

        if (searchResponse.results.playlists?.data) {
          // Filter playlists for therapeutic relevance
          const filteredPlaylists = this.filterTherapeuticContent(
            searchResponse.results.playlists.data
          );
          allPlaylists.push(...filteredPlaylists);
        }

        if (searchResponse.results.albums?.data) {
          // Filter albums for therapeutic relevance
          const filteredAlbums = this.filterTherapeuticAlbums(
            searchResponse.results.albums.data
          );
          allAlbums.push(...filteredAlbums);
        }
      } catch (error) {
        logger.warn(`Failed to search for "${query}" on Apple Music`, {
          error,
        });
        // Continue with other queries even if one fails
      }
    }

    // Remove duplicates and apply quality scoring
    const uniquePlaylists = this.removeDuplicatePlaylists(allPlaylists);
    const uniqueAlbums = this.removeDuplicateAlbums(allAlbums);

    // Score and sort by therapeutic relevance
    const scoredPlaylists = this.scoreTherapeuticRelevance(uniquePlaylists);
    const scoredAlbums = this.scoreAlbumTherapeuticRelevance(uniqueAlbums);

    // Return top results based on scores
    return {
      playlists: scoredPlaylists.slice(0, Math.floor(limit * 0.7)), // 70% playlists
      albums: scoredAlbums.slice(0, Math.floor(limit * 0.3)), // 30% albums
    };
  }

  /**
   * Perform a search request to Apple Music API
   */
  private async search(
    query: string,
    types: string[],
    limit: number = 10
  ): Promise<AppleMusicSearchResponse> {
    try {
      const token = await this.jwtService.getValidToken();
      const typesParam = types.join(",");
      const url = `${this.baseUrl}/catalog/us/search?term=${encodeURIComponent(
        query
      )}&types=${typesParam}&limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token and retry once
          await this.jwtService.refreshToken();
          const newToken = await this.jwtService.getValidToken();

          const retryResponse = await fetch(url, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (!retryResponse.ok) {
            throw new APIError(
              "Apple Music authentication failed after token refresh",
              retryResponse.status,
              "apple-music"
            );
          }

          const retryData =
            (await retryResponse.json()) as AppleMusicSearchResponse;
          return retryData;
        }

        throw new APIError(
          `Apple Music search failed: ${response.statusText}`,
          response.status,
          "apple-music"
        );
      }

      const data = (await response.json()) as AppleMusicSearchResponse;
      return data;
    } catch (error) {
      logger.error("Apple Music search request failed", {
        query,
        types,
        error,
      });
      throw error;
    }
  }

  /**
   * Remove duplicate playlists based on ID
   */
  private removeDuplicatePlaylists(
    playlists: AppleMusicPlaylist[]
  ): AppleMusicPlaylist[] {
    const seen = new Set<string>();
    return playlists.filter((playlist) => {
      if (seen.has(playlist.id)) {
        return false;
      }
      seen.add(playlist.id);
      return true;
    });
  }

  /**
   * Remove duplicate albums based on ID
   */
  private removeDuplicateAlbums(albums: AppleMusicAlbum[]): AppleMusicAlbum[] {
    const seen = new Set<string>();
    return albums.filter((album) => {
      if (seen.has(album.id)) {
        return false;
      }
      seen.add(album.id);
      return true;
    });
  }

  /**
   * Add delay for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if the client is properly authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.jwtService.getValidToken();
      return !!token && this.jwtService.validateToken(token);
    } catch (error) {
      logger.error("Failed to check Apple Music authentication", { error });
      return false;
    }
  }

  /**
   * Filter playlists for therapeutic content relevance
   */
  private filterTherapeuticContent(
    playlists: AppleMusicPlaylist[]
  ): AppleMusicPlaylist[] {
    const therapeuticKeywords = [
      "meditation",
      "mindfulness",
      "relaxation",
      "calm",
      "peace",
      "zen",
      "tranquil",
      "sleep",
      "rest",
      "bedtime",
      "insomnia",
      "deep sleep",
      "anxiety",
      "stress",
      "depression",
      "healing",
      "therapy",
      "therapeutic",
      "focus",
      "concentration",
      "study",
      "brain",
      "cognitive",
      "ambient",
      "nature",
      "binaural",
      "white noise",
      "pink noise",
      "brown noise",
      "rain",
      "ocean",
      "forest",
      "birds",
      "water",
      "yoga",
      "tai chi",
      "breathing",
      "progressive",
      "body scan",
      "grief",
      "trauma",
      "compassion",
      "confidence",
      "affirmation",
      "wellness",
      "mental health",
      "emotional",
      "spiritual",
      "mindful",
    ];

    const excludeKeywords = [
      "party",
      "club",
      "dance",
      "workout",
      "gym",
      "running",
      "cardio",
      "rock",
      "metal",
      "punk",
      "rap",
      "hip hop",
      "aggressive",
      "loud",
      "energetic",
      "upbeat",
      "fast",
      "intense",
    ];

    return playlists.filter((playlist) => {
      const searchText = `${playlist.attributes.name} ${
        playlist.attributes.description?.standard || ""
      }`.toLowerCase();

      // Must contain at least one therapeutic keyword
      const hasTherapeuticKeyword = therapeuticKeywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase())
      );

      // Must not contain exclude keywords
      const hasExcludeKeyword = excludeKeywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase())
      );

      return hasTherapeuticKeyword && !hasExcludeKeyword;
    });
  }

  /**
   * Filter albums for therapeutic content relevance
   */
  private filterTherapeuticAlbums(
    albums: AppleMusicAlbum[]
  ): AppleMusicAlbum[] {
    const therapeuticGenres = [
      "ambient",
      "new age",
      "meditation",
      "relaxation",
      "classical",
      "instrumental",
      "world",
      "nature",
      "healing",
      "wellness",
    ];

    const therapeuticKeywords = [
      "meditation",
      "mindfulness",
      "relaxation",
      "calm",
      "peace",
      "zen",
      "sleep",
      "healing",
      "therapy",
      "therapeutic",
      "ambient",
      "nature",
      "wellness",
      "mental health",
      "emotional",
      "spiritual",
    ];

    return albums.filter((album) => {
      const searchText =
        `${album.attributes.name} ${album.attributes.artistName}`.toLowerCase();
      const genres = album.attributes.genreNames.map((g) => g.toLowerCase());

      // Check if album has therapeutic genres
      const hasTherapeuticGenre = genres.some((genre) =>
        therapeuticGenres.some((tGenre) => genre.includes(tGenre))
      );

      // Check if album name/artist contains therapeutic keywords
      const hasTherapeuticKeyword = therapeuticKeywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase())
      );

      return hasTherapeuticGenre || hasTherapeuticKeyword;
    });
  }

  /**
   * Score playlists based on therapeutic relevance
   */
  private scoreTherapeuticRelevance(
    playlists: AppleMusicPlaylist[]
  ): AppleMusicPlaylist[] {
    const highValueKeywords = [
      "meditation",
      "mindfulness",
      "anxiety relief",
      "stress relief",
      "sleep",
      "healing",
      "therapy",
      "therapeutic",
      "mental health",
      "wellness",
    ];

    const mediumValueKeywords = [
      "relaxation",
      "calm",
      "peace",
      "tranquil",
      "focus",
      "concentration",
      "ambient",
      "nature sounds",
      "binaural beats",
    ];

    return playlists
      .map((playlist) => {
        const searchText = `${playlist.attributes.name} ${
          playlist.attributes.description?.standard || ""
        }`.toLowerCase();
        let score = 0;

        // High value keywords (3 points each)
        highValueKeywords.forEach((keyword) => {
          if (searchText.includes(keyword.toLowerCase())) {
            score += 3;
          }
        });

        // Medium value keywords (2 points each)
        mediumValueKeywords.forEach((keyword) => {
          if (searchText.includes(keyword.toLowerCase())) {
            score += 2;
          }
        });

        // Bonus for track count (more tracks = more comprehensive)
        if (playlist.attributes.trackCount > 20) {
          score += 2;
        } else if (playlist.attributes.trackCount > 10) {
          score += 1;
        }

        // Bonus for having description
        if (playlist.attributes.description?.standard) {
          score += 1;
        }

        return { ...playlist, therapeuticScore: score };
      })
      .sort((a, b) => (b as any).therapeuticScore - (a as any).therapeuticScore)
      .map(({ therapeuticScore, ...playlist }) => playlist);
  }

  /**
   * Score albums based on therapeutic relevance
   */
  private scoreAlbumTherapeuticRelevance(
    albums: AppleMusicAlbum[]
  ): AppleMusicAlbum[] {
    const therapeuticGenres = [
      "ambient",
      "new age",
      "meditation",
      "relaxation",
      "classical",
      "instrumental",
      "world",
      "nature",
      "healing",
      "wellness",
    ];

    return albums
      .map((album) => {
        const searchText =
          `${album.attributes.name} ${album.attributes.artistName}`.toLowerCase();
        const genres = album.attributes.genreNames.map((g) => g.toLowerCase());
        let score = 0;

        // Genre scoring
        genres.forEach((genre) => {
          if (therapeuticGenres.some((tGenre) => genre.includes(tGenre))) {
            score += 3;
          }
        });

        // Keyword scoring
        if (
          searchText.includes("meditation") ||
          searchText.includes("healing")
        ) {
          score += 4;
        }
        if (searchText.includes("relaxation") || searchText.includes("calm")) {
          score += 3;
        }
        if (searchText.includes("ambient") || searchText.includes("nature")) {
          score += 2;
        }

        // Track count bonus
        if (album.attributes.trackCount > 10) {
          score += 1;
        }

        return { ...album, therapeuticScore: score };
      })
      .sort((a, b) => (b as any).therapeuticScore - (a as any).therapeuticScore)
      .map(({ therapeuticScore, ...album }) => album);
  }

  /**
   * Validate content relevance for mental health themes
   */
  validateContentRelevance(playlist: AppleMusicPlaylist): {
    isRelevant: boolean;
    score: number;
    reasons: string[];
  } {
    const searchText = `${playlist.attributes.name} ${
      playlist.attributes.description?.standard || ""
    }`.toLowerCase();
    const reasons: string[] = [];
    let score = 0;

    // Mental health keyword scoring
    const mentalHealthKeywords = [
      { keyword: "meditation", score: 5 },
      { keyword: "mindfulness", score: 5 },
      { keyword: "anxiety relief", score: 5 },
      { keyword: "stress relief", score: 5 },
      { keyword: "sleep", score: 4 },
      { keyword: "healing", score: 4 },
      { keyword: "therapy", score: 4 },
      { keyword: "relaxation", score: 3 },
      { keyword: "calm", score: 3 },
      { keyword: "peace", score: 3 },
      { keyword: "focus", score: 3 },
      { keyword: "ambient", score: 2 },
      { keyword: "nature", score: 2 },
    ];

    mentalHealthKeywords.forEach(({ keyword, score: keywordScore }) => {
      if (searchText.includes(keyword)) {
        score += keywordScore;
        reasons.push(`Contains mental health keyword: ${keyword}`);
      }
    });

    // Track count consideration
    if (playlist.attributes.trackCount >= 20) {
      score += 2;
      reasons.push("Comprehensive playlist with 20+ tracks");
    } else if (playlist.attributes.trackCount >= 10) {
      score += 1;
      reasons.push("Good playlist length with 10+ tracks");
    }

    // Description quality
    if (
      playlist.attributes.description?.standard &&
      playlist.attributes.description.standard.length > 50
    ) {
      score += 2;
      reasons.push("Has detailed description");
    }

    // Curator quality (Apple Music curated content is typically higher quality)
    if (
      playlist.attributes.curatorName &&
      playlist.attributes.curatorName.toLowerCase().includes("apple")
    ) {
      score += 3;
      reasons.push("Apple-curated content");
    }

    const isRelevant = score >= 5; // Minimum threshold for relevance

    return {
      isRelevant,
      score,
      reasons,
    };
  }

  /**
   * Validate album content relevance for mental health themes
   */
  validateAlbumRelevance(album: AppleMusicAlbum): {
    isRelevant: boolean;
    score: number;
    reasons: string[];
  } {
    const searchText =
      `${album.attributes.name} ${album.attributes.artistName}`.toLowerCase();
    const genres = album.attributes.genreNames.map((g) => g.toLowerCase());
    const reasons: string[] = [];
    let score = 0;

    // Genre scoring
    const therapeuticGenres = [
      { genre: "ambient", score: 4 },
      { genre: "new age", score: 4 },
      { genre: "meditation", score: 5 },
      { genre: "relaxation", score: 4 },
      { genre: "classical", score: 3 },
      { genre: "instrumental", score: 3 },
      { genre: "world", score: 2 },
      { genre: "nature", score: 4 },
      { genre: "healing", score: 5 },
    ];

    therapeuticGenres.forEach(({ genre, score: genreScore }) => {
      if (genres.some((g) => g.includes(genre))) {
        score += genreScore;
        reasons.push(`Therapeutic genre: ${genre}`);
      }
    });

    // Title and artist keyword scoring
    const mentalHealthKeywords = [
      "meditation",
      "mindfulness",
      "healing",
      "therapy",
      "relaxation",
      "calm",
      "peace",
      "sleep",
      "ambient",
      "nature",
      "wellness",
    ];

    mentalHealthKeywords.forEach((keyword) => {
      if (searchText.includes(keyword)) {
        score += 3;
        reasons.push(`Contains keyword: ${keyword}`);
      }
    });

    // Track count consideration
    if (album.attributes.trackCount >= 8) {
      score += 1;
      reasons.push("Substantial album with 8+ tracks");
    }

    const isRelevant = score >= 4; // Minimum threshold for album relevance

    return {
      isRelevant,
      score,
      reasons,
    };
  }

  /**
   * Detect duplicate content between different items
   */
  detectDuplicates(items: (AppleMusicPlaylist | AppleMusicAlbum)[]): {
    duplicates: Array<{
      original: AppleMusicPlaylist | AppleMusicAlbum;
      duplicate: AppleMusicPlaylist | AppleMusicAlbum;
      similarity: number;
    }>;
    unique: (AppleMusicPlaylist | AppleMusicAlbum)[];
  } {
    const duplicates: Array<{
      original: AppleMusicPlaylist | AppleMusicAlbum;
      duplicate: AppleMusicPlaylist | AppleMusicAlbum;
      similarity: number;
    }> = [];
    const unique: (AppleMusicPlaylist | AppleMusicAlbum)[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < items.length; i++) {
      const item1 = items[i];
      if (processed.has(item1.id)) continue;

      let isDuplicate = false;

      for (let j = i + 1; j < items.length; j++) {
        const item2 = items[j];
        if (processed.has(item2.id)) continue;

        const similarity = this.calculateContentSimilarity(item1, item2);

        if (similarity > 0.8) {
          // 80% similarity threshold
          duplicates.push({
            original: item1,
            duplicate: item2,
            similarity,
          });
          processed.add(item2.id);
          isDuplicate = true;
        }
      }

      if (!isDuplicate) {
        unique.push(item1);
      }
      processed.add(item1.id);
    }

    return { duplicates, unique };
  }

  /**
   * Calculate similarity between two content items
   */
  private calculateContentSimilarity(
    item1: AppleMusicPlaylist | AppleMusicAlbum,
    item2: AppleMusicPlaylist | AppleMusicAlbum
  ): number {
    const name1 = item1.attributes.name.toLowerCase();
    const name2 = item2.attributes.name.toLowerCase();

    // Simple similarity calculation based on title
    const words1 = name1.split(/\s+/);
    const words2 = name2.split(/\s+/);

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    const wordSimilarity = commonWords.length / totalWords;

    // Check for exact substring matches
    const substringMatch =
      name1.includes(name2) || name2.includes(name1) ? 0.3 : 0;

    // Artist similarity for albums
    let artistSimilarity = 0;
    if (item1.type === "albums" && item2.type === "albums") {
      const album1 = item1 as AppleMusicAlbum;
      const album2 = item2 as AppleMusicAlbum;
      artistSimilarity =
        album1.attributes.artistName.toLowerCase() ===
        album2.attributes.artistName.toLowerCase()
          ? 0.2
          : 0;
    }

    return Math.min(wordSimilarity + substringMatch + artistSimilarity, 1.0);
  }

  /**
   * Score content quality based on metadata and description
   */
  scoreContentQuality(item: AppleMusicPlaylist | AppleMusicAlbum): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    if (item.type === "playlists") {
      const playlist = item as AppleMusicPlaylist;

      // Track count scoring
      if (playlist.attributes.trackCount > 30) {
        score += 3;
        factors.push("Extensive playlist (30+ tracks)");
      } else if (playlist.attributes.trackCount > 15) {
        score += 2;
        factors.push("Good playlist length (15+ tracks)");
      } else if (playlist.attributes.trackCount > 5) {
        score += 1;
        factors.push("Adequate playlist length (5+ tracks)");
      }

      // Description quality
      const description = playlist.attributes.description?.standard;
      if (description) {
        if (description.length > 100) {
          score += 3;
          factors.push("Detailed description");
        } else if (description.length > 50) {
          score += 2;
          factors.push("Good description");
        } else {
          score += 1;
          factors.push("Basic description");
        }
      }

      // Curator quality
      if (playlist.attributes.curatorName) {
        score += 1;
        factors.push("Has curator information");
      }
    } else if (item.type === "albums") {
      const album = item as AppleMusicAlbum;

      // Track count scoring
      if (album.attributes.trackCount > 12) {
        score += 2;
        factors.push("Full album (12+ tracks)");
      } else if (album.attributes.trackCount > 6) {
        score += 1;
        factors.push("EP or mini album (6+ tracks)");
      }

      // Genre information
      if (album.attributes.genreNames.length > 0) {
        score += 1;
        factors.push("Has genre classification");
      }

      // Release date (prefer recent releases for relevance)
      if (album.attributes.releaseDate) {
        const releaseYear = new Date(
          album.attributes.releaseDate
        ).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - releaseYear <= 5) {
          score += 1;
          factors.push("Recent release (within 5 years)");
        }
      }
    }

    // Artwork quality
    if (item.attributes.artwork) {
      score += 1;
      factors.push("Has artwork");
    }

    return { score, factors };
  }

  /**
   * Test the connection to Apple Music API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try a simple search to test the connection
      await this.search("meditation", ["playlists"], 1);
      return true;
    } catch (error) {
      logger.error("Apple Music connection test failed", { error });
      return false;
    }
  }
}
