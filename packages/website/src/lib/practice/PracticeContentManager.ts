import type {
  PracticeType,
  PracticeContent,
  AudioTrack,
  MediaPlaylist,
  PracticeCategory,
  DifficultyLevel,
  PracticeRecommendation
} from '../../types/practice';

/**
 * Manages practice content including types, audio tracks, and playlists
 * Handles loading, filtering, and organization of practice content
 */
export class PracticeContentManager {
  private content: PracticeContent | null = null;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.loadContent();
  }

  /**
   * Load practice content from static files
   */
  private async loadContent(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.doLoadContent();
    return this.loadingPromise;
  }

  private async doLoadContent(): Promise<void> {
    try {
      const [practicesResponse, audioResponse, playlistsResponse, achievementsResponse] = await Promise.all([
        fetch('/content/practices/practices.json'),
        fetch('/content/practices/audio-tracks.json'),
        fetch('/content/practices/playlists.json'),
        fetch('/content/practices/achievements.json')
      ]);

      const [practices, audioTracks, playlists, achievements] = await Promise.all([
        practicesResponse.json(),
        audioResponse.json(),
        playlistsResponse.json(),
        achievementsResponse.json()
      ]);

      this.content = {
        practices: practices.practices || [],
        audioTracks: audioTracks.tracks || [],
        playlists: playlists.playlists || [],
        achievements: achievements.achievements || [],
        lastUpdated: new Date(practices.lastUpdated || Date.now()),
        version: practices.version || '1.0.0'
      };
    } catch (error) {
      console.error('Failed to load practice content:', error);
      // Initialize with empty content to prevent crashes
      this.content = {
        practices: [],
        audioTracks: [],
        playlists: [],
        achievements: [],
        lastUpdated: new Date(),
        version: '1.0.0'
      };
    }
  }

  /**
   * Ensure content is loaded before accessing
   */
  private async ensureLoaded(): Promise<void> {
    if (!this.content) {
      await this.loadContent();
    }
  }

  /**
   * Get all practice types
   */
  async getAllPractices(): Promise<PracticeType[]> {
    await this.ensureLoaded();
    return [...(this.content?.practices || [])];
  }

  /**
   * Get practice by ID
   */
  async getPracticeById(id: string): Promise<PracticeType | null> {
    await this.ensureLoaded();
    return this.content?.practices.find(p => p.id === id) || null;
  }

  /**
   * Get practices by category
   */
  async getPracticesByCategory(category: PracticeCategory): Promise<PracticeType[]> {
    await this.ensureLoaded();
    return this.content?.practices.filter(p => p.category === category) || [];
  }

  /**
   * Get practices by difficulty level
   */
  async getPracticesByDifficulty(difficulty: DifficultyLevel): Promise<PracticeType[]> {
    await this.ensureLoaded();
    return this.content?.practices.filter(p => p.difficulty === difficulty) || [];
  }

  /**
   * Get practices by duration range
   */
  async getPracticesByDuration(minMinutes: number, maxMinutes: number): Promise<PracticeType[]> {
    await this.ensureLoaded();
    return this.content?.practices.filter(p =>
      p.defaultDuration >= minMinutes && p.defaultDuration <= maxMinutes
    ) || [];
  }

  /**
   * Search practices by text
   */
  async searchPractices(query: string): Promise<PracticeType[]> {
    await this.ensureLoaded();
    const searchTerm = query.toLowerCase();

    return this.content?.practices.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      p.benefits.some(benefit => benefit.toLowerCase().includes(searchTerm))
    ) || [];
  }

  /**
   * Get recommended practices based on criteria
   */
  async getRecommendedPractices(criteria: {
    category?: PracticeCategory;
    difficulty?: DifficultyLevel;
    maxDuration?: number;
    tags?: string[];
    excludeIds?: string[];
  }): Promise<PracticeRecommendation[]> {
    await this.ensureLoaded();
    let practices = [...(this.content?.practices || [])];

    // Apply filters
    if (criteria.category) {
      practices = practices.filter(p => p.category === criteria.category);
    }

    if (criteria.difficulty) {
      practices = practices.filter(p => p.difficulty === criteria.difficulty);
    }

    if (criteria.maxDuration) {
      practices = practices.filter(p => p.defaultDuration <= criteria.maxDuration!);
    }

    if (criteria.tags?.length) {
      practices = practices.filter(p =>
        criteria.tags!.some(tag => p.tags.includes(tag))
      );
    }

    if (criteria.excludeIds?.length) {
      practices = practices.filter(p => !criteria.excludeIds!.includes(p.id));
    }

    // Convert to recommendations with relevance scoring
    return practices.map(practice => ({
      practiceTypeId: practice.id,
      reason: this.generateRecommendationReason(practice, criteria),
      relevanceScore: this.calculateRelevanceScore(practice, criteria),
      basedOn: 'history' as const
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get audio track by ID
   */
  async getAudioTrack(id: string): Promise<AudioTrack | null> {
    await this.ensureLoaded();
    return this.content?.audioTracks.find(track => track.id === id) || null;
  }

  /**
   * Get audio tracks by category
   */
  async getAudioTracksByCategory(category: string): Promise<AudioTrack[]> {
    await this.ensureLoaded();
    return this.content?.audioTracks.filter(track => track.category === category) || [];
  }

  /**
   * Get playlist by ID
   */
  async getPlaylist(id: string): Promise<MediaPlaylist | null> {
    await this.ensureLoaded();
    return this.content?.playlists.find(playlist => playlist.id === id) || null;
  }

  /**
   * Get all playlists
   */
  async getAllPlaylists(): Promise<MediaPlaylist[]> {
    await this.ensureLoaded();
    return [...(this.content?.playlists || [])];
  }

  /**
   * Get practices suitable for beginners
   */
  async getBeginnerPractices(): Promise<PracticeType[]> {
    return this.getPracticesByDifficulty('beginner');
  }

  /**
   * Get quick practices (under 10 minutes)
   */
  async getQuickPractices(): Promise<PracticeType[]> {
    return this.getPracticesByDuration(0, 10);
  }

  /**
   * Get practices by therapeutic benefit
   */
  async getPracticesByBenefit(benefit: string): Promise<PracticeType[]> {
    await this.ensureLoaded();
    return this.content?.practices.filter(p =>
      p.therapeuticBenefits.some(b => b.toLowerCase().includes(benefit.toLowerCase()))
    ) || [];
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(practice: PracticeType, criteria: any): string {
    const reasons = [];

    if (criteria.category && practice.category === criteria.category) {
      reasons.push(`Matches your preferred ${criteria.category} practice`);
    }

    if (criteria.difficulty && practice.difficulty === criteria.difficulty) {
      reasons.push(`Suitable for ${criteria.difficulty} level`);
    }

    if (criteria.maxDuration && practice.defaultDuration <= criteria.maxDuration) {
      reasons.push(`Fits your available time (${practice.defaultDuration} min)`);
    }

    if (practice.averageRating && practice.averageRating >= 4.5) {
      reasons.push('Highly rated by users');
    }

    return reasons.length > 0 ? reasons[0] : 'Recommended for you';
  }

  /**
   * Calculate relevance score for recommendations
   */
  private calculateRelevanceScore(practice: PracticeType, criteria: any): number {
    let score = 0;

    // Base score from rating
    if (practice.averageRating) {
      score += practice.averageRating * 20; // 0-100 scale
    } else {
      score += 60; // Default score for unrated practices
    }

    // Bonus for matching criteria
    if (criteria.category && practice.category === criteria.category) {
      score += 20;
    }

    if (criteria.difficulty && practice.difficulty === criteria.difficulty) {
      score += 15;
    }

    if (criteria.tags?.length) {
      const matchingTags = practice.tags.filter(tag => criteria.tags.includes(tag));
      score += matchingTags.length * 10;
    }

    // Bonus for completion rate
    if (practice.completionRate && practice.completionRate > 0.8) {
      score += 10;
    }

    // Penalty for very long practices if user prefers shorter ones
    if (criteria.maxDuration && practice.defaultDuration > criteria.maxDuration * 0.8) {
      score -= 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Refresh content from server
   */
  async refreshContent(): Promise<void> {
    this.content = null;
    this.loadingPromise = null;
    await this.loadContent();
  }

  /**
   * Get content metadata
   */
  async getContentInfo(): Promise<{ lastUpdated: Date; version: string; practiceCount: number }> {
    await this.ensureLoaded();
    return {
      lastUpdated: this.content?.lastUpdated || new Date(),
      version: this.content?.version || '1.0.0',
      practiceCount: this.content?.practices.length || 0
    };
  }
}

// Singleton instance
export const practiceContentManager = new PracticeContentManager();
