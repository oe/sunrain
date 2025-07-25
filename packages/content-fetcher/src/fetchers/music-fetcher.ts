import fetch from 'node-fetch';
import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from '@sunrain/shared';
import { logger } from '../logger.js';
import { APIError } from '../errors.js';
import { URLGenerator, MonetizationConfig } from '../utils/url-generator.js';

export class MusicFetcher extends BaseContentFetcher {
  private spotifyAccessToken: string | null = null;
  private appleMusicToken: string | null = null;
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
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    return [];
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    return [];
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    logger.info('Starting music fetch from multiple sources');
    
    const allMusic: ResourceItem[] = [];
    
    try {
      // 从Spotify获取音乐
      const spotifyMusic = await this.fetchFromSpotify();
      allMusic.push(...spotifyMusic);
      
      // 从Apple Music获取音乐
      const appleMusicItems = await this.fetchFromAppleMusic();
      allMusic.push(...appleMusicItems);
      
      logger.info(`Fetched ${allMusic.length} music items from all sources`);
      return allMusic;
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
    const config = this.config.apis.appleMusic;
    if (!config?.apiKey || !config?.teamId || !config?.keyId) {
      logger.warn('Apple Music API credentials not configured, skipping Apple Music');
      return [];
    }

    try {
      await this.getAppleMusicToken();
      return await this.fetchAppleMusicPlaylists();
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

  private async getAppleMusicToken(): Promise<void> {
    // Apple Music使用JWT token，这里需要实现JWT生成
    // 由于复杂性，暂时跳过实际实现
    logger.warn('Apple Music JWT token generation not implemented yet');
    this.appleMusicToken = null;
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

  private async fetchAppleMusicPlaylists(): Promise<ResourceItem[]> {
    if (!this.appleMusicToken) {
      return [];
    }

    // Apple Music API实现
    // 由于需要复杂的JWT认证，这里暂时返回空数组
    logger.info('Apple Music integration not fully implemented yet');
    return [];
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
    
    return [...new Set(benefits)];
  }
}