/** @format */

import { ContentFetcherConfig } from '@sunrain/shared';

export const defaultConfig: ContentFetcherConfig = {
  apis: {
    goodreads: {
      apiKey: process.env.GOODREADS_API_KEY || '',
      baseUrl: 'https://www.goodreads.com/book'
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
      baseUrl: 'https://api.spotify.com/v1'
    },
    tmdb: {
      apiKey: process.env.TMDB_API_KEY || '',
      baseUrl: 'https://api.themoviedb.org/3'
    },
    appleMusic: {
      apiKey: process.env.APPLE_MUSIC_API_KEY || '',
      teamId: process.env.APPLE_MUSIC_TEAM_ID || '',
      keyId: process.env.APPLE_MUSIC_KEY_ID || '',
      baseUrl: 'https://api.music.apple.com/v1'
    }
  },
  updateFrequency: {
    books: '0 0 * * 1', // 每周一午夜
    music: '0 0 * * 3', // 每周三午夜
    movies: '0 0 * * 5' // 每周五午夜
  },
  contentValidation: {
    minDescriptionLength: 50,
    requiredFields: ['title', 'description'],
    mentalHealthKeywords: [
      'mental health',
      'psychology',
      'therapy',
      'mindfulness',
      'meditation',
      'anxiety',
      'depression',
      'stress',
      'wellness',
      'self-help',
      'emotional',
      'healing',
      'recovery',
      'resilience',
      'coping',
      '心理健康',
      '心理学',
      '治疗',
      '正念',
      '冥想',
      '焦虑',
      '抑郁',
      '压力',
      '健康',
      '自助',
      '情绪',
      '治愈',
      '康复',
      '韧性',
      '应对'
    ]
  },
  output: {
    booksPath: '../website/src/content/resources/books.json',
    musicPath: '../website/src/content/resources/music.json',
    moviesPath: '../website/src/content/resources/movies.json'
  },
  monetization: {
    amazon: {
      affiliateTag: process.env.AMAZON_AFFILIATE_TAG || 'sunrain-20', // 你的Amazon联盟标签
      regions: {
        us: 'amazon.com',
        uk: 'amazon.co.uk',
        de: 'amazon.de',
        jp: 'amazon.co.jp',
        ca: 'amazon.ca'
      }
    },
    spotify: {
      partnerCode: process.env.SPOTIFY_PARTNER_CODE || '', // Spotify合作伙伴代码
    },
    appleMusic: {
      affiliateToken: process.env.APPLE_MUSIC_AFFILIATE_TOKEN || '', // Apple Music联盟令牌
    }
  }
};

export function loadConfig(): ContentFetcherConfig {
  // 在实际环境中，这里可以从配置文件或环境变量加载配置
  return defaultConfig;
}
