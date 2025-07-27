import { BaseContentFetcher } from '../base-fetcher';
import type {
  ResourceItem,
  ContentFetcherConfig,
  QualityAssessment,
  RSSFeedItem
} from '../types';
import { logger } from '../logger';
import { handleError } from '../errors';

/**
 * Wiki content fetcher specialized for mental health knowledge articles
 * Integrates with medical journals and professional websites
 */
export class WikiContentFetcher extends BaseContentFetcher {
  private readonly TRUSTED_MEDICAL_SOURCES = [
    'mayoclinic.org',
    'webmd.com',
    'healthline.com',
    'medicalnewstoday.com',
    'psychologytoday.com',
    'apa.org',
    'nimh.nih.gov',
    'who.int',
    'nami.org',
    'mentalhealth.gov'
  ];

  private readonly MENTAL_HEALTH_TOPICS = [
    'anxiety disorders',
    'depression',
    'bipolar disorder',
    'schizophrenia',
    'PTSD',
    'OCD',
    'eating disorders',
    'ADHD',
    'autism spectrum',
    'personality disorders',
    'substance abuse',
    'suicide prevention',
    'stress management',
    'mindfulness',
    'therapy types',
    'medication guide',
    'coping strategies',
    'mental health stigma',
    'workplace mental health',
    'child psychology'
  ];

  constructor(config: ContentFetcherConfig) {
    super(config);
  }

  // Implement abstract methods from BaseContentFetcher
  async fetchBooks(): Promise<ResourceItem[]> {
    return []; // Not used in wiki fetcher
  }

  async fetchMovies(): Promise<ResourceItem[]> {
    return []; // Not used in wiki fetcher
  }

  async fetchMusic(): Promise<ResourceItem[]> {
    return []; // Not used in wiki fetcher
  }

  async fetchVideos(): Promise<ResourceItem[]> {
    return []; // Not used in wiki fetcher
  }

  async fetchPodcasts(): Promise<ResourceItem[]> {
    return []; // Not used in wiki fetcher
  }

  /**
   * Main method to fetch mental health wiki articles
   */
  async fetchArticles(): Promise<ResourceItem[]> {
    try {
      const articles: ResourceItem[] = [];

      // Fetch from RSS feeds of trusted medical sources
      if (this.config.apis.rssFeeds?.sources) {
        const rssArticles = await this.fetchFromMedicalRSSFeeds();
        articles.push(...rssArticles);
      }

      // Fetch from News API with medical focus
      if (this.config.apis.newsApi) {
        const newsArticles = await this.fetchMedicalNewsArticles();
        articles.push(...newsArticles);
      }

      // Process and filter for quality and relevance
      const processedArticles = await this.processWikiContent(articles);

      return this.categorizeByMentalHealthTopics(processedArticles);
    } catch (error) {
      logger.error('Failed to fetch wiki articles', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw handleError(error, logger);
    }
  }

  /**
   * Fetch articles from medical RSS feeds
   */
  private async fetchFromMedicalRSSFeeds(): Promise<ResourceItem[]> {
    const articles: ResourceItem[] = [];

    // Filter RSS sources to only include trusted medical sources
    const medicalFeeds = this.config.apis.rssFeeds!.sources.filter(feedUrl =>
      this.TRUSTED_MEDICAL_SOURCES.some(domain => feedUrl.includes(domain))
    );

    for (const feedUrl of medicalFeeds) {
      try {
        const feedArticles = await this.fetchAndParseRSSFeed(feedUrl);
        articles.push(...feedArticles);
      } catch (error) {
        logger.warn('Failed to fetch medical RSS feed', {
          feedUrl,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return articles;
  }

  /**
   * Fetch medical news articles from News API
   */
  private async fetchMedicalNewsArticles(): Promise<ResourceItem[]> {
    const { apiKey, baseUrl } = this.config.apis.newsApi!;

    const articles: ResourceItem[] = [];

    // Search for each mental health topic
    for (const topic of this.MENTAL_HEALTH_TOPICS.slice(0, 5)) { // Limit to avoid API rate limits
      try {
        const query = `"${topic}" AND (mental health OR psychology OR therapy)`;
        const url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=10&apiKey=${apiKey}`;

        const topicArticles = await this.fetchNewsAPIArticles(url, topic);
        articles.push(...topicArticles);

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.warn('Failed to fetch articles for topic', {
          topic,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return articles;
  }

  /**
   * Fetch and parse RSS feed
   */
  private async fetchAndParseRSSFeed(feedUrl: string): Promise<ResourceItem[]> {
    // Note: In a real implementation, you would use an RSS parser library like 'rss-parser'
    // For now, this is a placeholder implementation
    logger.info('RSS feed parsing would be implemented here', { feedUrl });

    // Placeholder return - in real implementation, this would parse the RSS feed
    return [];
  }

  /**
   * Fetch articles from News API
   */
  private async fetchNewsAPIArticles(url: string, topic: string): Promise<ResourceItem[]> {
    return this.fetchWithRetry(async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`News API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const articles: ResourceItem[] = [];

      for (const article of data.articles || []) {
        try {
          // Filter by trusted sources
          const domain = this.extractDomain(article.url);
          if (!this.TRUSTED_MEDICAL_SOURCES.includes(domain)) {
            continue;
          }

          const resourceItem = this.convertNewsToWikiArticle(article, topic);
          articles.push(resourceItem);
        } catch (error) {
          logger.warn('Failed to process news article', {
            title: article.title,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return articles;
    });
  }

  /**
   * Convert news article to wiki-style ResourceItem
   */
  private convertNewsToWikiArticle(article: any, topic: string): ResourceItem {
    return {
      id: `wiki-${Buffer.from(article.url).toString('base64').substring(0, 16)}`,
      title: article.title,
      description: article.description || '',
      type: 'article',
      language: 'en',
      author: article.author,
      publishDate: new Date(article.publishedAt),
      tags: [topic, 'mental health', 'medical'],
      categories: ['wiki', 'medical', 'mental-health'],
      therapeuticBenefits: this.extractTherapeuticBenefits(article.title, article.description),
      moodCategories: this.extractMoodCategories(article.title, article.description),
      targetAudience: ['general', 'patients', 'caregivers'],
      sourceUrl: article.url,
      availability: {
        free: true,
        regions: ['global'],
        platforms: ['web']
      },
      imageUrl: article.urlToImage,
      thumbnailUrl: article.urlToImage,
      qualityScore: 0 // Will be calculated by assessContentQuality
    };
  }

  /**
   * Process wiki content with enhanced quality checks
   */
  private async processWikiContent(articles: ResourceItem[]): Promise<ResourceItem[]> {
    const processedArticles: ResourceItem[] = [];

    for (const article of articles) {
      try {
        // Enhanced validation for medical content
        if (!this.validateMedicalContent(article)) {
          continue;
        }

        // Assess quality with medical-specific criteria
        const qualityScore = this.assessMedicalContentQuality(article);
        if (qualityScore < 0.7) { // Higher threshold for medical content
          continue;
        }

        article.qualityScore = qualityScore;
        processedArticles.push(article);
      } catch (error) {
        logger.warn('Failed to process wiki article', {
          articleId: article.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return processedArticles;
  }

  /**
   * Validate medical content for accuracy and completeness
   */
  private validateMedicalContent(article: ResourceItem): boolean {
    // Check for minimum content length
    if (article.description.length < 200) {
      return false;
    }

    // Check for medical disclaimers or professional language
    const text = `${article.title} ${article.description}`.toLowerCase();
    const medicalIndicators = [
      'medical',
      'health',
      'treatment',
      'diagnosis',
      'symptoms',
      'therapy',
      'clinical',
      'research',
      'study'
    ];

    const hasmedicalContent = medicalIndicators.some(indicator =>
      text.includes(indicator)
    );

    if (!hasmedicalContent) {
      return false;
    }

    // Check source trustworthiness
    const domain = this.extractDomain(article.sourceUrl);
    return this.TRUSTED_MEDICAL_SOURCES.includes(domain);
  }

  /**
   * Assess medical content quality with specialized criteria
   */
  private assessMedicalContentQuality(article: ResourceItem): number {
    let score = 0;
    const factors = {
      sourceAuthority: 0.4,
      contentDepth: 0.3,
      recency: 0.2,
      professionalLanguage: 0.1
    };

    // Source authority (40%)
    const domain = this.extractDomain(article.sourceUrl);
    const authorityScore = this.calculateMedicalAuthorityScore(domain);
    score += authorityScore * factors.sourceAuthority;

    // Content depth (30%)
    const depthScore = this.calculateContentDepthScore(article);
    score += depthScore * factors.contentDepth;

    // Recency (20%)
    const recencyScore = this.calculateRecencyScore(article);
    score += recencyScore * factors.recency;

    // Professional language (10%)
    const professionalScore = this.calculateProfessionalLanguageScore(article);
    score += professionalScore * factors.professionalLanguage;

    return Math.round(score * 100) / 100;
  }

  /**
   * Calculate medical authority score based on source
   */
  private calculateMedicalAuthorityScore(domain: string): number {
    const authorityLevels = {
      'mayoclinic.org': 1.0,
      'apa.org': 1.0,
      'nimh.nih.gov': 1.0,
      'who.int': 1.0,
      'webmd.com': 0.9,
      'healthline.com': 0.9,
      'medicalnewstoday.com': 0.8,
      'psychologytoday.com': 0.8,
      'nami.org': 0.9,
      'mentalhealth.gov': 1.0
    };

    return authorityLevels[domain] || 0.5;
  }

  /**
   * Calculate content depth score
   */
  private calculateContentDepthScore(article: ResourceItem): number {
    const text = `${article.title} ${article.description}`;

    // Check for comprehensive coverage indicators
    const depthIndicators = [
      'symptoms',
      'causes',
      'treatment',
      'diagnosis',
      'prevention',
      'research',
      'statistics',
      'risk factors'
    ];

    const indicatorCount = depthIndicators.filter(indicator =>
      text.toLowerCase().includes(indicator)
    ).length;

    return Math.min(indicatorCount / depthIndicators.length * 2, 1);
  }

  /**
   * Calculate recency score for medical content
   */
  private calculateRecencyScore(article: ResourceItem): number {
    if (!article.publishDate) {
      return 0.3; // Lower default for unknown dates in medical content
    }

    const now = new Date();
    const ageInDays = (now.getTime() - article.publishDate.getTime()) / (1000 * 60 * 60 * 24);

    // Medical content has different freshness requirements
    if (ageInDays <= 90) return 1.0;   // Very recent
    if (ageInDays <= 365) return 0.8;  // Within a year
    if (ageInDays <= 730) return 0.6;  // Within two years
    if (ageInDays <= 1095) return 0.4; // Within three years
    return 0.2; // Older content
  }

  /**
   * Calculate professional language score
   */
  private calculateProfessionalLanguageScore(article: ResourceItem): number {
    const text = `${article.title} ${article.description}`.toLowerCase();

    const professionalTerms = [
      'clinical',
      'therapeutic',
      'diagnosis',
      'prognosis',
      'etiology',
      'pathophysiology',
      'intervention',
      'evidence-based',
      'peer-reviewed',
      'randomized controlled trial'
    ];

    const termCount = professionalTerms.filter(term =>
      text.includes(term)
    ).length;

    return Math.min(termCount / 5, 1); // Normalize to max 1.0
  }

  /**
   * Categorize articles by mental health topics
   */
  private categorizeByMentalHealthTopics(articles: ResourceItem[]): ResourceItem[] {
    return articles.map(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      const matchedTopics: string[] = [];

      for (const topic of this.MENTAL_HEALTH_TOPICS) {
        if (text.includes(topic.toLowerCase())) {
          matchedTopics.push(topic);
        }
      }

      // Add matched topics to categories and tags
      article.categories = [...article.categories, ...matchedTopics.map(t => t.replace(/\s+/g, '-'))];
      article.tags = [...article.tags, ...matchedTopics];

      return article;
    });
  }

  /**
   * Extract therapeutic benefits from medical content
   */
  private extractTherapeuticBenefits(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const benefits: string[] = [];

    const medicalBenefits = {
      'symptom management': ['symptom', 'manage', 'control', 'reduce'],
      'treatment efficacy': ['treatment', 'therapy', 'effective', 'improve'],
      'prevention strategies': ['prevent', 'avoid', 'reduce risk', 'protective'],
      'coping mechanisms': ['cope', 'coping', 'strategy', 'technique'],
      'recovery support': ['recovery', 'healing', 'rehabilitation', 'support'],
      'quality of life': ['quality of life', 'wellbeing', 'functioning', 'daily life']
    };

    for (const [benefit, keywords] of Object.entries(medicalBenefits)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        benefits.push(benefit);
      }
    }

    return benefits;
  }

  /**
   * Extract mood categories from medical content
   */
  private extractMoodCategories(title: string, description: string): any[] {
    const text = `${title} ${description}`.toLowerCase();
    const categories: any[] = [];

    const medicalMoodCategories = {
      anxiety: ['anxiety', 'anxious', 'panic', 'worry', 'fear', 'phobia'],
      depression: ['depression', 'depressive', 'sad', 'melancholy', 'dysthymia'],
      stress: ['stress', 'stressed', 'pressure', 'overwhelm', 'burnout'],
      healing: ['healing', 'recovery', 'treatment', 'therapy', 'rehabilitation'],
      focus: ['attention', 'concentration', 'focus', 'ADHD', 'cognitive']
    };

    for (const [category, keywords] of Object.entries(medicalMoodCategories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    }

    return categories;
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  }
}
