import fetch from 'node-fetch';
import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from '@sunrain/shared';
import { logger } from '../logger.js';
import { APIError } from '../errors.js';
import { URLGenerator, MonetizationConfig } from '../utils/url-generator.js';
import { AppleMusicJWTService } from '../services/apple-music-jwt.js';
import { AppleMusicClient, AppleMusicPlaylist, AppleMusicAlbum } from '../services/apple-music-client.js';

export class MusicFetcher extends BaseContentFetcher {
  private spotifyAccessToken: string | null = null;
  private appleMusicJWTService: AppleMusicJWTService | null = null;
  private appleMusicClient: AppleMusicClient | null = null;
  private urlGenerator: URLGenerator | null = null;

  constructor(config: ContentFetcherConfig) {
    super(config);
    // 初始化URL生成器
    if (config.monetization) {
      const monetizationConfig: MonetizationConfig = {
        amazon: config.monetization.amazon,
        spotify: config.monetization.spotify,
        appleMusic: config.monetization.appleMusic
      };
      this.urlGenerator = new URLGenerator(monetizationConfig);
    }

    // 初始化Apple Music服务
    this.initializeAppleMusicServices();
  }

  private initializeAppleMusicServices(): void {
    const config = this.config.apis.appleMusic;
    if (config?.apiKey && config?.teamId && config?.keyId) {
      try {
        this.appleMusicJWTService = new AppleMusicJWTService({
          teamId: config.teamId,
          keyId: config.keyId,
          privateKey: config.apiKey // The private key is stored in apiKey field
        });

        this.appleMusicClient = new AppleMusicClient(
          this.appleMusicJWTService,
          config.baseUrl
        );

        logger.debug('Apple Music services initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize Apple Music services', { error });
        this.appleMusicJWTService = null;
        this.appleMusicClient = null;
      }
    }
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    return [];
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    return [];
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    logger.info('Starting music fetch from multiple sources');

    try {
      // Fetch from Spotify
      const spotifyMusic = await this.fetchFromSpotify();
      logger.info(`Fetched ${spotifyMusic.length} items from Spotify`);

      // Fetch from Apple Music
      const appleMusicItems = await this.fetchFromAppleMusic();
      logger.info(`Fetched ${appleMusicItems.length} items from Apple Music`);

      // Remove duplicates between platforms
      const uniqueMusic = this.removeDuplicateContent(spotifyMusic, appleMusicItems);
      logger.info(`After deduplication: ${uniqueMusic.length} unique music items`);

      // Final validation and quality scoring
      const validatedMusic = uniqueMusic.filter(item => this.validateMentalHealthContent(item));
      logger.info(`After validation: ${validatedMusic.length} validated music items`);

      return validatedMusic;
    } catch (error) {
      logger.error('Failed to fetch music', { error });
      throw error;
    }
  }

  private async fetchFromSpotify(): Promise<ResourceItem[]> {
    const config = this.config.apis.spotify;
    if (!config?.clientId || !config?.clientSecret) {
      logger.warn('Spotify API credentials not configured, skipping Spotify');
      return [];
    }

    try {
      await this.getSpotifyAccessToken();
      return await this.fetchSpotifyPlaylists();
    } catch (error) {
      logger.error('Failed to fetch from Spotify', { error });
      return [];
    }
  }

  private async fetchFromAppleMusic(): Promise<ResourceItem[]> {
    if (!this.appleMusicClient) {
      logger.warn('Apple Music client not initialized, skipping Apple Music');
      return [];
    }

    try {
      // Test authentication first
      const isAuthenticated = await this.appleMusicClient.isAuthenticated();
      if (!isAuthenticated) {
        logger.error('Apple Music authentication failed');
        return [];
      }

      return await this.fetchAppleMusicContent();
    } catch (error) {
      logger.error('Failed to fetch from Apple Music', { error });
      return [];
    }
  }

  private async getSpotifyAccessToken(): Promise<void> {
    const config = this.config.apis.spotify!;

    try {
      const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new APIError(
          `Spotify token request failed: ${response.statusText}`,
          response.status,
          'spotify'
        );
      }

      const data = await response.json() as any;
      this.spotifyAccessToken = data.access_token;

      logger.debug('Successfully obtained Spotify access token');
    } catch (error) {
      logger.error('Failed to get Spotify access token', { error });
      throw error;
    }
  }

  private async fetchAppleMusicContent(): Promise<ResourceItem[]> {
    if (!this.appleMusicClient) {
      return [];
    }

    try {
      // Search for therapeutic content with enhanced filtering
      const therapeuticContent = await this.appleMusicClient.searchTherapeuticContent(25);

      // Detect and remove duplicates within Apple Music content
      const playlistDuplicates = this.appleMusicClient.detectDuplicates(therapeuticContent.playlists);
      const albumDuplicates = this.appleMusicClient.detectDuplicates(therapeuticContent.albums);

      logger.info(`Removed ${playlistDuplicates.duplicates.length} duplicate playlists and ${albumDuplicates.duplicates.length} duplicate albums from Apple Music`);

      const musicItems: ResourceItem[] = [];

      // Process unique playlists with enhanced validation
      for (const playlist of playlistDuplicates.unique as AppleMusicPlaylist[]) {
        // Validate content relevance using Apple Music client
        const relevanceCheck = this.appleMusicClient.validateContentRelevance(playlist);

        if (relevanceCheck.isRelevant) {
          // Score content quality
          const qualityScore = this.appleMusicClient.scoreContentQuality(playlist);

          const musicItem = this.convertAppleMusicPlaylistToResourceItem(playlist);

          // Add quality metadata
          (musicItem as any).qualityScore = qualityScore.score;
          (musicItem as any).relevanceScore = relevanceCheck.score;

          // Final validation for mental health content
          if (this.validateMentalHealthContent(musicItem)) {
            musicItems.push(musicItem);
            logger.debug('Added Apple Music playlist', {
              title: musicItem.title,
              relevanceScore: relevanceCheck.score,
              qualityScore: qualityScore.score,
              reasons: relevanceCheck.reasons
            });
          }
        } else {
          logger.debug('Rejected Apple Music playlist for low relevance', {
            title: playlist.attributes.name,
            score: relevanceCheck.score,
            reasons: relevanceCheck.reasons
          });
        }
      }

      // Process unique albums with enhanced validation
      for (const album of albumDuplicates.unique as AppleMusicAlbum[]) {
        // Validate album relevance using Apple Music client
        const relevanceCheck = this.appleMusicClient.validateAlbumRelevance(album);

        if (relevanceCheck.isRelevant) {
          // Score content quality
          const qualityScore = this.appleMusicClient.scoreContentQuality(album);

          const musicItem = this.convertAppleMusicAlbumToResourceItem(album);

          // Add quality metadata
          (musicItem as any).qualityScore = qualityScore.score;
          (musicItem as any).relevanceScore = relevanceCheck.score;

          // Final validation for mental health content
          if (this.validateMentalHealthContent(musicItem)) {
            musicItems.push(musicItem);
            logger.debug('Added Apple Music album', {
              title: musicItem.title,
              artist: musicItem.artist,
              relevanceScore: relevanceCheck.score,
              qualityScore: qualityScore.score,
              reasons: relevanceCheck.reasons
            });
          }
        } else {
          logger.debug('Rejected Apple Music album for low relevance', {
            title: album.attributes.name,
            artist: album.attributes.artistName,
            score: relevanceCheck.score,
            reasons: relevanceCheck.reasons
          });
        }
      }

      logger.info(`Fetched and validated ${musicItems.length} items from Apple Music`);
      return musicItems;
    } catch (error) {
      logger.error('Failed to fetch Apple Music content', { error });
      return [];
    }
  }

  private async fetchSpotifyPlaylists(): Promise<ResourceItem[]> {
    if (!this.spotifyAccessToken) {
      return [];
    }

    const searchQueries = [
      'meditation music',
      'relaxation playlist',
      'anxiety relief music',
      'sleep music',
      'mindfulness meditation',
      'stress relief',
      'healing music',
      'therapeutic sounds'
    ];

    const allPlaylists: any[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`,
          {
            headers: {
              'Authorization': `Bearer ${this.spotifyAccessToken}`
            }
          }
        );

        if (!response.ok) {
          throw new APIError(
            `Spotify search failed: ${response.statusText}`,
            response.status,
            'spotify'
          );
        }

        const data = await response.json() as any;
        allPlaylists.push(...(data.playlists?.items || []));
      } catch (error) {
        logger.warn(`Failed to search for "${query}" on Spotify`, { error });
      }
    }

    // 去重并转换格式
    const uniquePlaylists = allPlaylists.filter((playlist, index, self) =>
      index === self.findIndex(p => p.id === playlist.id)
    );

    const musicItems: ResourceItem[] = [];

    for (const playlist of uniquePlaylists.slice(0, 10)) {
      const musicItem: ResourceItem = {
        id: `spotify-${playlist.id}`,
        title: playlist.name,
        description: playlist.description || 'A therapeutic music playlist for mental wellness',
        artist: playlist.owner?.display_name || 'Various Artists',
        type: 'Playlist',
        spotifyUrl: this.urlGenerator ?
          this.urlGenerator.generateSpotifyUrl(playlist.id, 'playlist') :
          playlist.external_urls?.spotify,
        image: playlist.images?.[0]?.url,
        themes: this.extractMusicThemes(playlist.name, playlist.description || ''),
        benefits: this.extractMusicBenefits(playlist.name, playlist.description || '')
      };

      musicItems.push(musicItem);
    }

    return musicItems;
  }

  private convertAppleMusicPlaylistToResourceItem(playlist: AppleMusicPlaylist): ResourceItem {
    // Generate Apple Music URL with affiliate token if available
    const appleMusicUrl = this.urlGenerator ?
      this.urlGenerator.generateAppleMusicUrl(playlist.id, 'playlist') :
      playlist.attributes.url;

    // Enhanced description with therapeutic context
    const description = playlist.attributes.description?.standard ||
      this.generateTherapeuticDescription(playlist.attributes.name, 'playlist', playlist.attributes.trackCount);

    return {
      id: `apple-music-playlist-${playlist.id}`,
      title: playlist.attributes.name,
      description,
      artist: playlist.attributes.curatorName || 'Various Artists',
      type: 'Playlist',
      appleMusicUrl,
      image: playlist.attributes.artwork?.url.replace('{w}', '300').replace('{h}', '300'),
      themes: this.extractMusicThemes(playlist.attributes.name, description),
      benefits: this.extractMusicBenefits(playlist.attributes.name, description)
    };
  }

  private convertAppleMusicAlbumToResourceItem(album: AppleMusicAlbum): ResourceItem {
    // Generate Apple Music URL with affiliate token if available
    const appleMusicUrl = this.urlGenerator ?
      this.urlGenerator.generateAppleMusicUrl(album.id, 'album') :
      album.attributes.url;

    // Enhanced description with therapeutic context
    const description = this.generateTherapeuticDescription(
      album.attributes.name,
      'album',
      album.attributes.trackCount,
      album.attributes.artistName
    );

    return {
      id: `apple-music-album-${album.id}`,
      title: album.attributes.name,
      description,
      artist: album.attributes.artistName,
      type: 'Album',
      appleMusicUrl,
      image: album.attributes.artwork?.url.replace('{w}', '300').replace('{h}', '300'),
      themes: this.extractMusicThemes(album.attributes.name, album.attributes.artistName),
      benefits: this.extractMusicBenefits(album.attributes.name, album.attributes.artistName)
    };
  }

  private extractMusicThemes(title: string, description: string): string[] {
    const musicThemes = [
      'meditation', 'relaxation', 'sleep', 'anxiety relief', 'stress relief',
      'mindfulness', 'focus', 'concentration', 'healing', 'therapy',
      'ambient', 'classical', 'instrumental', 'nature sounds', 'binaural beats',
      '冥想', '放松', '睡眠', '焦虑缓解', '压力缓解',
      '正念', '专注', '集中', '治愈', '治疗'
    ];

    const searchText = `${title} ${description}`.toLowerCase();
    const themes: string[] = [];

    for (const theme of musicThemes) {
      if (searchText.includes(theme.toLowerCase())) {
        themes.push(theme);
      }
    }

    return [...new Set(themes)];
  }

  private extractMusicBenefits(title: string, description: string): string[] {
    const musicBenefits = [
      'better sleep', 'stress reduction', 'anxiety relief', 'improved focus',
      'emotional regulation', 'relaxation', 'mind quieting', 'healing support',
      'meditation support', 'concentration boost', 'inner peace', 'mental clarity',
      'pain relief', 'trauma healing', 'grief support', 'confidence building',
      'self-compassion', 'mindfulness practice', 'breathing support', 'mood enhancement',
      '更好的睡眠', '压力减轻', '焦虑缓解', '专注力提升',
      '情绪调节', '放松', '心灵平静', '治愈支持'
    ];

    const searchText = `${title} ${description}`.toLowerCase();
    const benefits: string[] = [];

    for (const benefit of musicBenefits) {
      if (searchText.includes(benefit.toLowerCase())) {
        benefits.push(benefit);
      }
    }

    // Add inferred benefits based on themes
    if (searchText.includes('sleep') || searchText.includes('bedtime')) {
      benefits.push('better sleep', 'relaxation');
    }
    if (searchText.includes('meditation') || searchText.includes('mindfulness')) {
      benefits.push('meditation support', 'mindfulness practice', 'inner peace');
    }
    if (searchText.includes('anxiety') || searchText.includes('stress')) {
      benefits.push('anxiety relief', 'stress reduction', 'emotional regulation');
    }
    if (searchText.includes('focus') || searchText.includes('concentration')) {
      benefits.push('improved focus', 'concentration boost', 'mental clarity');
    }

    return [...new Set(benefits)];
  }

  /**
   * Validate content for mental health relevance and quality
   */
  private validateMentalHealthContent(item: ResourceItem): boolean {
    const mentalHealthKeywords = this.config.contentValidation.mentalHealthKeywords;
    const searchText = `${item.title} ${item.description} ${item.themes?.join(' ') || ''} ${item.benefits?.join(' ') || ''}`.toLowerCase();

    // Must contain at least one mental health keyword
    const hasMentalHealthKeyword = mentalHealthKeywords.some(keyword =>
      searchText.includes(keyword.toLowerCase())
    );

    // Must have minimum description length
    const hasValidDescription = item.description.length >= this.config.contentValidation.minDescriptionLength;

    // Must have at least one theme or benefit
    const hasThemesOrBenefits = (item.themes && item.themes.length > 0) || (item.benefits && item.benefits.length > 0);

    // Quality checks
    const qualityChecks = [
      hasMentalHealthKeyword,
      hasValidDescription,
      hasThemesOrBenefits,
      item.title.length > 5, // Reasonable title length
      !item.title.toLowerCase().includes('explicit'), // No explicit content
      !item.description.toLowerCase().includes('explicit')
    ];

    const passedChecks = qualityChecks.filter(check => check).length;
    const requiredChecks = 4; // Must pass at least 4 out of 6 checks

    const isValid = passedChecks >= requiredChecks;

    if (!isValid) {
      logger.debug('Content validation failed', {
        title: item.title,
        passedChecks,
        requiredChecks,
        hasMentalHealthKeyword,
        hasValidDescription,
        hasThemesOrBenefits
      });
    }

    return isValid;
  }

  /**
   * Generate therapeutic description for content without existing description
   */
  private generateTherapeuticDescription(
    title: string,
    type: 'playlist' | 'album',
    trackCount: number,
    artist?: string
  ): string {
    const baseDescription = type === 'playlist'
      ? `A curated ${type} featuring ${trackCount} tracks`
      : `A therapeutic music ${type} by ${artist} with ${trackCount} tracks`;

    // Infer therapeutic benefits from title
    const titleLower = title.toLowerCase();
    let therapeuticContext = '';

    if (titleLower.includes('sleep') || titleLower.includes('bedtime')) {
      therapeuticContext = ' designed to promote restful sleep and relaxation';
    } else if (titleLower.includes('meditation') || titleLower.includes('mindfulness')) {
      therapeuticContext = ' crafted to support meditation practice and mindfulness';
    } else if (titleLower.includes('anxiety') || titleLower.includes('stress')) {
      therapeuticContext = ' created to help reduce anxiety and manage stress';
    } else if (titleLower.includes('focus') || titleLower.includes('concentration')) {
      therapeuticContext = ' designed to enhance focus and mental clarity';
    } else if (titleLower.includes('healing') || titleLower.includes('therapy')) {
      therapeuticContext = ' intended to support emotional healing and therapeutic processes';
    } else if (titleLower.includes('calm') || titleLower.includes('peace')) {
      therapeuticContext = ' curated to promote inner peace and emotional calm';
    } else {
      therapeuticContext = ' selected for mental wellness and emotional support';
    }

    return `${baseDescription}${therapeuticContext}. Perfect for mental health support and emotional well-being.`;
  }

  /**
   * Remove duplicate content between Spotify and Apple Music with advanced similarity detection
   */
  private removeDuplicateContent(spotifyItems: ResourceItem[], appleMusicItems: ResourceItem[]): ResourceItem[] {
    const allItems = [...spotifyItems, ...appleMusicItems];
    const uniqueItems: ResourceItem[] = [];
    const processedItems = new Set<string>();

    for (let i = 0; i < allItems.length; i++) {
      const item1 = allItems[i];
      if (processedItems.has(item1.id)) continue;

      let isDuplicate = false;

      // Check against remaining items for duplicates
      for (let j = i + 1; j < allItems.length; j++) {
        const item2 = allItems[j];
        if (processedItems.has(item2.id)) continue;

        const similarity = this.calculateCrossPlatformSimilarity(item1, item2);

        if (similarity > 0.85) { // 85% similarity threshold for cross-platform duplicates
          // Prefer Apple Music items if they have affiliate links, otherwise prefer Spotify
          const preferredItem = this.selectPreferredItem(item1, item2);
          const rejectedItem = preferredItem === item1 ? item2 : item1;

          processedItems.add(rejectedItem.id);
          isDuplicate = rejectedItem === item1;

          logger.debug('Removed cross-platform duplicate', {
            kept: { title: preferredItem.title, platform: this.getPlatform(preferredItem) },
            removed: { title: rejectedItem.title, platform: this.getPlatform(rejectedItem) },
            similarity
          });

          if (isDuplicate) break;
        }
      }

      if (!isDuplicate) {
        uniqueItems.push(item1);
      }
      processedItems.add(item1.id);
    }

    return uniqueItems;
  }

  /**
   * Calculate similarity between items from different platforms
   */
  private calculateCrossPlatformSimilarity(item1: ResourceItem, item2: ResourceItem): number {
    // Normalize titles for comparison
    const title1 = this.normalizeTitle(item1.title);
    const title2 = this.normalizeTitle(item2.title);

    // Exact title match
    if (title1 === title2) {
      return 1.0;
    }

    // Word-based similarity
    const words1 = title1.split(/\s+/);
    const words2 = title2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word) && word.length > 2);
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    const wordSimilarity = commonWords.length / totalUniqueWords;

    // Artist similarity (if both have artists)
    let artistSimilarity = 0;
    if (item1.artist && item2.artist) {
      const artist1 = item1.artist.toLowerCase().trim();
      const artist2 = item2.artist.toLowerCase().trim();
      artistSimilarity = artist1 === artist2 ? 0.3 : 0;
    }

    // Type similarity bonus
    let typeSimilarity = 0;
    if (item1.type && item2.type && item1.type.toLowerCase() === item2.type.toLowerCase()) {
      typeSimilarity = 0.1;
    }

    // Theme overlap
    let themeOverlap = 0;
    if (item1.themes && item2.themes) {
      const commonThemes = item1.themes.filter(theme =>
        item2.themes!.some(t => t.toLowerCase() === theme.toLowerCase())
      );
      themeOverlap = commonThemes.length / Math.max(item1.themes.length, item2.themes.length) * 0.2;
    }

    return Math.min(wordSimilarity + artistSimilarity + typeSimilarity + themeOverlap, 1.0);
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\b(playlist|album|music|songs?|tracks?)\b/g, '') // Remove common music terms
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Select preferred item between duplicates
   */
  private selectPreferredItem(item1: ResourceItem, item2: ResourceItem): ResourceItem {
    // Prefer items with affiliate links (monetization)
    const item1HasAffiliate = !!(item1.appleMusicUrl && this.config.monetization?.appleMusic?.affiliateToken) ||
                             !!(item1.spotifyUrl && this.config.monetization?.spotify?.partnerCode);
    const item2HasAffiliate = !!(item2.appleMusicUrl && this.config.monetization?.appleMusic?.affiliateToken) ||
                             !!(item2.spotifyUrl && this.config.monetization?.spotify?.partnerCode);

    if (item1HasAffiliate && !item2HasAffiliate) return item1;
    if (item2HasAffiliate && !item1HasAffiliate) return item2;

    // Prefer items with higher quality/relevance scores
    const item1Score = ((item1 as any).qualityScore || 0) + ((item1 as any).relevanceScore || 0);
    const item2Score = ((item2 as any).qualityScore || 0) + ((item2 as any).relevanceScore || 0);

    if (item1Score > item2Score) return item1;
    if (item2Score > item1Score) return item2;

    // Prefer items with more themes/benefits
    const item1Features = (item1.themes?.length || 0) + (item1.benefits?.length || 0);
    const item2Features = (item2.themes?.length || 0) + (item2.benefits?.length || 0);

    if (item1Features > item2Features) return item1;
    if (item2Features > item1Features) return item2;

    // Prefer Apple Music (better for monetization)
    if (item1.appleMusicUrl && !item2.appleMusicUrl) return item1;
    if (item2.appleMusicUrl && !item1.appleMusicUrl) return item2;

    // Default to first item
    return item1;
  }

  /**
   * Get platform name from resource item
   */
  private getPlatform(item: ResourceItem): string {
    if (item.id.startsWith('apple-music-')) return 'Apple Music';
    if (item.id.startsWith('spotify-')) return 'Spotify';
    return 'Unknown';
  }
}
