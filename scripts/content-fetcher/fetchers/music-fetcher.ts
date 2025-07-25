import fetch from 'node-fetch';
import { BaseContentFetcher } from '../base-fetcher.js';
import { ResourceItem, ContentFetcherConfig } from '../types.js';
import { logger } from '../logger.js';
import { APIError } from '../errors.js';

export class MusicFetcher extends BaseContentFetcher {
  private accessToken: string | null = null;

  constructor(config: ContentFetcherConfig) {
    super(config);
    // 由于需要OAuth流程，我们不在构造函数中验证配置
    // this.validateApiConfig('spotify', config.apis.spotify);
  }

  async fetchBooks(): Promise<ResourceItem[]> {
    // 此方法在books-fetcher中实现
    return [];
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    // 此方法在movies-fetcher中实现
    return [];
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    logger.info('Starting music fetch from Spotify API');
    
    try {
      // 获取访问令牌
      await this.getAccessToken();
      
      // 获取治疗性音乐播放列表
      const music = await this.fetchTherapeuticMusic();
      
      logger.info(`Fetched ${music.length} music items from API`);
      return music;
    } catch (error) {
      logger.error('Failed to fetch music', { error });
      throw error;
    }
  }

  private async getAccessToken(): Promise<void> {
    const config = this.config.apis.spotify;
    if (!config?.clientId || !config?.clientSecret) {
      logger.warn('Spotify API credentials not configured, using mock data');
      return;
    }

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
      this.accessToken = data.access_token;
      
      logger.debug('Successfully obtained Spotify access token');
    } catch (error) {
      logger.error('Failed to get Spotify access token', { error });
      throw error;
    }
  }

  private async fetchTherapeuticMusic(): Promise<ResourceItem[]> {
    // 如果没有访问令牌，使用模拟数据
    if (!this.accessToken) {
      return this.getMockTherapeuticMusic();
    }

    try {
      // 搜索治疗性音乐播放列表
      const playlists = await this.searchTherapeuticPlaylists();
      const musicItems: ResourceItem[] = [];

      for (const playlist of playlists) {
        const tracks = await this.getPlaylistTracks(playlist.id);
        
        const musicItem: ResourceItem = {
          id: playlist.id,
          title: playlist.name,
          description: playlist.description || 'A therapeutic music playlist for mental wellness',
          artist: 'Various Artists',
          type: 'Playlist',
          spotifyUrl: playlist.external_urls?.spotify,
          image: playlist.images?.[0]?.url,
          themes: this.extractMusicThemes(playlist.name, playlist.description || ''),
          benefits: this.extractMusicBenefits(playlist.name, playlist.description || '')
        };

        musicItems.push(musicItem);
      }

      return musicItems;
    } catch (error) {
      logger.error('Failed to fetch from Spotify API, using mock data', { error });
      return this.getMockTherapeuticMusic();
    }
  }

  private async searchTherapeuticPlaylists(): Promise<any[]> {
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
              'Authorization': `Bearer ${this.accessToken}`
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
        logger.warn(`Failed to search for "${query}"`, { error });
      }
    }

    // 去重并过滤
    const uniquePlaylists = allPlaylists.filter((playlist, index, self) => 
      index === self.findIndex(p => p.id === playlist.id)
    );

    return uniquePlaylists.slice(0, 10); // 限制数量
  }

  private async getPlaylistTracks(playlistId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new APIError(
          `Failed to get playlist tracks: ${response.statusText}`,
          response.status,
          'spotify'
        );
      }

      const data = await response.json() as any;
      return data.items || [];
    } catch (error) {
      logger.warn(`Failed to get tracks for playlist ${playlistId}`, { error });
      return [];
    }
  }

  private getMockTherapeuticMusic(): ResourceItem[] {
    return [
      {
        id: 'music-1',
        title: 'Deep Sleep Meditation Music',
        description: 'Calming instrumental music designed to promote deep, restful sleep. Features gentle piano melodies, soft nature sounds, and ambient textures that help quiet the mind and prepare the body for sleep. Perfect for bedtime routines and overcoming insomnia.',
        artist: 'Sleep Music Collective',
        type: 'Playlist',
        spotifyUrl: 'https://open.spotify.com/playlist/deep-sleep-meditation',
        youtubeUrl: 'https://youtube.com/playlist/deep-sleep-music',
        image: 'https://example.com/music1.jpg',
        themes: ['sleep', 'meditation', 'relaxation', 'ambient', 'instrumental'],
        benefits: ['better sleep quality', 'stress reduction', 'mind quieting', 'relaxation']
      },
      {
        id: 'music-2',
        title: 'Anxiety Relief & Calm',
        description: 'Specially curated music collection for anxiety relief and emotional regulation. Combines binaural beats, soft classical music, and nature sounds to help reduce anxiety symptoms and promote a sense of calm. Based on music therapy research for anxiety management.',
        artist: 'Therapeutic Sounds',
        type: 'Album',
        spotifyUrl: 'https://open.spotify.com/album/anxiety-relief-calm',
        youtubeUrl: 'https://youtube.com/playlist/anxiety-relief',
        image: 'https://example.com/music2.jpg',
        themes: ['anxiety relief', 'calm', 'binaural beats', 'classical', 'nature sounds'],
        benefits: ['anxiety reduction', 'emotional regulation', 'stress relief', 'mental clarity']
      },
      {
        id: 'music-3',
        title: 'Mindfulness Meditation Sounds',
        description: 'A comprehensive collection of sounds for mindfulness meditation practice. Includes guided meditation music, Tibetan singing bowls, rain sounds, and forest ambience. Designed to support various meditation techniques and mindfulness exercises.',
        artist: 'Mindful Music Studio',
        type: 'Playlist',
        spotifyUrl: 'https://open.spotify.com/playlist/mindfulness-meditation',
        youtubeUrl: 'https://youtube.com/playlist/mindfulness-sounds',
        image: 'https://example.com/music3.jpg',
        themes: ['mindfulness', 'meditation', 'singing bowls', 'nature', 'ambient'],
        benefits: ['mindfulness practice', 'meditation support', 'present moment awareness', 'inner peace']
      },
      {
        id: 'music-4',
        title: 'Focus & Concentration Boost',
        description: 'Instrumental music specifically designed to enhance focus and concentration during work or study. Features lo-fi beats, ambient electronic music, and minimalist compositions that help maintain attention without being distracting. Ideal for productivity and mental clarity.',
        artist: 'Focus Flow',
        type: 'Playlist',
        spotifyUrl: 'https://open.spotify.com/playlist/focus-concentration',
        youtubeUrl: 'https://youtube.com/playlist/focus-music',
        image: 'https://example.com/music4.jpg',
        themes: ['focus', 'concentration', 'lo-fi', 'ambient electronic', 'productivity'],
        benefits: ['improved focus', 'enhanced concentration', 'productivity boost', 'mental clarity']
      },
      {
        id: 'music-5',
        title: 'Emotional Healing Journey',
        description: 'A carefully crafted musical journey for emotional healing and processing. Combines therapeutic frequencies, gentle melodies, and healing sounds to support emotional release and recovery. Suitable for therapy sessions, self-reflection, and emotional wellness practices.',
        artist: 'Healing Harmonies',
        type: 'Album',
        spotifyUrl: 'https://open.spotify.com/album/emotional-healing-journey',
        youtubeUrl: 'https://youtube.com/playlist/emotional-healing',
        image: 'https://example.com/music5.jpg',
        themes: ['emotional healing', 'therapeutic frequencies', 'recovery', 'self-reflection', 'wellness'],
        benefits: ['emotional processing', 'healing support', 'emotional release', 'inner peace']
      }
    ];
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