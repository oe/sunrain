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
    },
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY || '',
      baseUrl: 'https://www.googleapis.com/youtube/v3'
    },
    newsApi: {
      apiKey: process.env.NEWS_API_KEY || '',
      baseUrl: 'https://newsapi.org/v2'
    },
    googleBooks: {
      apiKey: process.env.GOOGLE_BOOKS_API_KEY || '',
      baseUrl: 'https://www.googleapis.com/books/v1'
    },
    rssFeeds: {
      sources: [
        'https://www.psychologytoday.com/us/rss/blog/all',
        'https://feeds.feedburner.com/apa-monitor',
        'https://www.mayoclinic.org/rss/diseases-conditions',
        'https://www.nimh.nih.gov/rss/all-news.xml'
      ]
    }
  },
  updateFrequency: {
    books: '0 0 * * 1', // 每周一午夜
    music: '0 0 * * 3', // 每周三午夜
    movies: '0 0 * * 5', // 每周五午夜
    videos: '0 2 * * *', // 每日凌晨2点
    articles: '0 4 * * *', // 每日凌晨4点
    podcasts: '0 0 * * 2' // 每周二午夜
  },
  contentValidation: {
    minDescriptionLength: 50,
    requiredFields: ['title', 'description', 'type'],
    qualityThreshold: 0.6,
    languageSupport: ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'],
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
      'therapeutic',
      'counseling',
      'psychiatry',
      'psychotherapy',
      'wellbeing',
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
      '应对',
      '心理咨询',
      '精神科',
      '心理治疗'
    ]
  },
  qualityAssessment: {
    enabled: true,
    factors: {
      relevanceWeight: 0.4,
      authorityWeight: 0.3,
      freshnessWeight: 0.2,
      engagementWeight: 0.1
    },
    mentalHealthRelevanceKeywords: [
      'mental health',
      'psychology',
      'therapy',
      'mindfulness',
      'meditation',
      'anxiety',
      'depression',
      'stress',
      'wellness',
      'therapeutic',
      'counseling',
      'psychiatry',
      'psychotherapy',
      'wellbeing',
      'emotional regulation',
      'coping strategies',
      'resilience',
      'self-care'
    ],
    trustedSources: [
      'mayoclinic.org',
      'psychologytoday.com',
      'apa.org',
      'nimh.nih.gov',
      'who.int',
      'harvard.edu',
      'stanford.edu',
      'yale.edu',
      'webmd.com',
      'healthline.com'
    ]
  },
  output: {
    booksPath: '../website/src/content/resources/books.json',
    musicPath: '../website/src/content/resources/music.json',
    moviesPath: '../website/src/content/resources/movies.json',
    videosPath: '../website/src/content/resources/videos.json',
    articlesPath: '../website/src/content/resources/articles.json',
    podcastsPath: '../website/src/content/resources/podcasts.json'
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
    },
    youtube: {
      partnerCode: process.env.YOUTUBE_PARTNER_CODE || '', // YouTube合作伙伴代码
    }
  }
};

export function loadConfig(): ContentFetcherConfig {
  // 在实际环境中，这里可以从配置文件或环境变量加载配置
  return defaultConfig;
}
