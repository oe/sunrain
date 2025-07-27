import type {
  ResourceItem,
  ContentFetcherConfig,
  QualityAssessment,
  ContentProcessingResult
} from '../types';
import { logger } from '../logger';

/**
 * Content quality review workflow states
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

/**
 * Content review record
 */
export interface ContentReview {
  id: string;
  contentId: string;
  reviewerId: string;
  status: ReviewStatus;
  score: number;
  feedback: string[];
  recommendations: string[];
  reviewDate: Date;
  category: 'medical' | 'therapeutic' | 'general';
}

/**
 * Content expiration tracking
 */
export interface ContentExpiration {
  contentId: string;
  contentType: string;
  publishDate: Date;
  lastUpdated: Date;
  expirationDate: Date;
  isExpired: boolean;
  urgency: 'low' | 'medium' | 'high';
}

/**
 * User feedback for content quality
 */
export interface UserFeedback {
  id: string;
  contentId: string;
  userId?: string; // Anonymous if not provided
  rating: number; // 1-5
  feedbackType: 'helpful' | 'inaccurate' | 'outdated' | 'inappropriate' | 'other';
  comment?: string;
  submittedAt: Date;
  verified: boolean;
}

/**
 * Comprehensive content quality assurance system
 * Implements multi-dimensional quality scoring, professional review workflows,
 * content expiration detection, and user feedback processing
 */
export class ContentQualitySystem {
  private config: ContentFetcherConfig;
  private reviews: Map<string, ContentReview[]> = new Map();
  private expirationTracking: Map<string, ContentExpiration> = new Map();
  private userFeedback: Map<string, UserFeedback[]> = new Map();

  constructor(config: ContentFetcherConfig) {
    this.config = config;
  }

  /**
   * Perform comprehensive quality assessment on content
   */
  async assessContentQuality(content: ResourceItem): Promise<QualityAssessment> {
    const factors = this.config.qualityAssessment.factors;

    // Calculate individual quality factors
    const relevance = this.calculateRelevanceScore(content);
    const authority = this.calculateAuthorityScore(content);
    const freshness = this.calculateFreshnessScore(content);
    const engagement = this.calculateEngagementScore(content);

    // Calculate weighted overall score
    const score = (
      relevance * factors.relevanceWeight +
      authority * factors.authorityWeight +
      freshness * factors.freshnessWeight +
      engagement * factors.engagementWeight
    ) / (factors.relevanceWeight + factors.authorityWeight + factors.freshnessWeight + factors.engagementWeight);

    const mentalHealthRelevance = this.checkMentalHealthRelevance(content);
    const recommendations = this.generateQualityRecommendations(content, score);

    const assessment: QualityAssessment = {
      score: Math.round(score * 100) / 100,
      factors: {
        relevance,
        authority,
        freshness,
        engagement
      },
      mentalHealthRelevance,
      recommendations
    };

    // Log quality assessment for monitoring
    logger.debug('Content quality assessed', {
      contentId: content.id,
      score: assessment.score,
      factors: assessment.factors
    });

    return assessment;
  }

  /**
   * Submit content for professional review
   */
  async submitForReview(content: ResourceItem, category: 'medical' | 'therapeutic' | 'general'): Promise<string> {
    const reviewId = `review-${content.id}-${Date.now()}`;

    const review: ContentReview = {
      id: reviewId,
      contentId: content.id,
      reviewerId: 'system', // Would be assigned to actual reviewer
      status: 'pending',
      score: 0,
      feedback: [],
      recommendations: [],
      reviewDate: new Date(),
      category
    };

    // Add to review queue
    if (!this.reviews.has(content.id)) {
      this.reviews.set(content.id, []);
    }
    this.reviews.get(content.id)!.push(review);

    logger.info('Content submitted for review', {
      contentId: content.id,
      reviewId,
      category
    });

    return reviewId;
  }

  /**
   * Complete professional review
   */
  async completeReview(
    reviewId: string,
    reviewerId: string,
    status: ReviewStatus,
    score: number,
    feedback: string[],
    recommendations: string[]
  ): Promise<void> {
    // Find and update the review
    for (const [contentId, contentReviews] of this.reviews) {
      const review = contentReviews.find(r => r.id === reviewId);
      if (review) {
        review.reviewerId = reviewerId;
        review.status = status;
        review.score = score;
        review.feedback = feedback;
        review.recommendations = recommendations;
        review.reviewDate = new Date();

        logger.info('Review completed', {
          reviewId,
          contentId,
          status,
          score
        });
        return;
      }
    }

    throw new Error(`Review not found: ${reviewId}`);
  }

  /**
   * Track content expiration and detect outdated content
   */
  async trackContentExpiration(content: ResourceItem): Promise<ContentExpiration> {
    const now = new Date();
    const publishDate = content.publishDate || now;
    const lastUpdated = now; // Would track actual last update

    // Calculate expiration based on content type and category
    const expirationMonths = this.getExpirationPeriod(content);
    const expirationDate = new Date(publishDate);
    expirationDate.setMonth(expirationDate.getMonth() + expirationMonths);

    const isExpired = now > expirationDate;
    const urgency = this.calculateExpirationUrgency(expirationDate, now);

    const expiration: ContentExpiration = {
      contentId: content.id,
      contentType: content.type,
      publishDate,
      lastUpdated,
      expirationDate,
      isExpired,
      urgency
    };

    this.expirationTracking.set(content.id, expiration);

    if (isExpired || urgency === 'high') {
      logger.warn('Content expiration detected', {
        contentId: content.id,
        expirationDate,
        urgency
      });
    }

    return expiration;
  }

  /**
   * Process user feedback for content quality
   */
  async processUserFeedback(feedback: Omit<UserFeedback, 'id' | 'submittedAt' | 'verified'>): Promise<string> {
    const feedbackId = `feedback-${feedback.contentId}-${Date.now()}`;

    const userFeedback: UserFeedback = {
      ...feedback,
      id: feedbackId,
      submittedAt: new Date(),
      verified: false // Would be verified through moderation
    };

    // Add to feedback collection
    if (!this.userFeedback.has(feedback.contentId)) {
      this.userFeedback.set(feedback.contentId, []);
    }
    this.userFeedback.get(feedback.contentId)!.push(userFeedback);

    // Analyze feedback for quality issues
    await this.analyzeFeedbackForQualityIssues(userFeedback);

    logger.info('User feedback processed', {
      feedbackId,
      contentId: feedback.contentId,
      rating: feedback.rating,
      type: feedback.feedbackType
    });

    return feedbackId;
  }

  /**
   * Get content quality report
   */
  async getContentQualityReport(contentId: string): Promise<{
    content: ResourceItem | null;
    qualityAssessment: QualityAssessment | null;
    reviews: ContentReview[];
    expiration: ContentExpiration | null;
    userFeedback: UserFeedback[];
    overallScore: number;
    recommendations: string[];
  }> {
    // This would typically fetch from a database
    const reviews = this.reviews.get(contentId) || [];
    const expiration = this.expirationTracking.get(contentId) || null;
    const feedback = this.userFeedback.get(contentId) || [];

    // Calculate overall score from multiple sources
    const overallScore = this.calculateOverallQualityScore(reviews, feedback);
    const recommendations = this.generateOverallRecommendations(reviews, expiration, feedback);

    return {
      content: null, // Would fetch actual content
      qualityAssessment: null, // Would fetch stored assessment
      reviews,
      expiration,
      userFeedback: feedback,
      overallScore,
      recommendations
    };
  }

  /**
   * Get expired content that needs updating
   */
  async getExpiredContent(): Promise<ContentExpiration[]> {
    const expired = Array.from(this.expirationTracking.values())
      .filter(exp => exp.isExpired || exp.urgency === 'high')
      .sort((a, b) => {
        // Sort by urgency, then by expiration date
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return a.expirationDate.getTime() - b.expirationDate.getTime();
      });

    logger.info('Retrieved expired content', { count: expired.length });
    return expired;
  }

  /**
   * Get content pending review
   */
  async getPendingReviews(category?: 'medical' | 'therapeutic' | 'general'): Promise<ContentReview[]> {
    const pending: ContentReview[] = [];

    for (const reviews of this.reviews.values()) {
      for (const review of reviews) {
        if (review.status === 'pending') {
          if (!category || review.category === category) {
            pending.push(review);
          }
        }
      }
    }

    return pending.sort((a, b) => a.reviewDate.getTime() - b.reviewDate.getTime());
  }

  /**
   * Calculate relevance score based on mental health keywords
   */
  private calculateRelevanceScore(content: ResourceItem): number {
    const keywords = this.config.qualityAssessment.mentalHealthRelevanceKeywords;
    const text = `${content.title} ${content.description} ${content.tags.join(' ')}`.toLowerCase();

    let matches = 0;
    let weightedScore = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      if (text.includes(keywordLower)) {
        matches++;
        // Give higher weight to keywords in title
        if (content.title.toLowerCase().includes(keywordLower)) {
          weightedScore += 2;
        } else {
          weightedScore += 1;
        }
      }
    }

    // Normalize score
    const maxPossibleScore = keywords.length * 2;
    return Math.min(weightedScore / maxPossibleScore * 2, 1);
  }

  /**
   * Calculate authority score based on source trustworthiness
   */
  private calculateAuthorityScore(content: ResourceItem): number {
    const trustedSources = this.config.qualityAssessment.trustedSources;
    const domain = this.extractDomain(content.sourceUrl);

    if (trustedSources.includes(domain)) {
      return 1.0;
    }

    // Check for academic or medical domains
    if (domain.includes('.edu') || domain.includes('.gov') ||
        domain.includes('mayo') || domain.includes('harvard') ||
        domain.includes('stanford') || domain.includes('yale')) {
      return 0.95;
    }

    // Check for established mental health organizations
    if (domain.includes('psychology') || domain.includes('therapy') ||
        domain.includes('mental') || domain.includes('apa.org') ||
        domain.includes('nimh') || domain.includes('who.int')) {
      return 0.8;
    }

    // Check for professional medical sites
    if (domain.includes('webmd') || domain.includes('healthline') ||
        domain.includes('medicalnews')) {
      return 0.7;
    }

    return 0.5; // Default score for unknown sources
  }

  /**
   * Calculate freshness score based on publication date
   */
  private calculateFreshnessScore(content: ResourceItem): number {
    if (!content.publishDate) {
      return 0.5; // Default for unknown dates
    }

    const now = new Date();
    const ageInDays = (now.getTime() - content.publishDate.getTime()) / (1000 * 60 * 60 * 24);

    // Different freshness requirements for different content types
    if (content.type === 'article') {
      if (ageInDays <= 30) return 1.0;
      if (ageInDays <= 90) return 0.8;
      if (ageInDays <= 365) return 0.6;
      if (ageInDays <= 730) return 0.4;
      return 0.2;
    } else {
      // Books, videos, music can be older
      if (ageInDays <= 90) return 1.0;
      if (ageInDays <= 365) return 0.9;
      if (ageInDays <= 1095) return 0.7; // 3 years
      if (ageInDays <= 1825) return 0.5; // 5 years
      return 0.3;
    }
  }

  /**
   * Calculate engagement score based on available metrics
   */
  private calculateEngagementScore(content: ResourceItem): number {
    let score = 0.5; // Default score

    if (content.userRating && content.reviewCount) {
      const ratingScore = content.userRating / 5;
      const reviewScore = Math.min(content.reviewCount / 100, 1);
      score = (ratingScore * 0.7 + reviewScore * 0.3);
    }

    // Adjust based on user feedback if available
    const feedback = this.userFeedback.get(content.id);
    if (feedback && feedback.length > 0) {
      const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
      const feedbackScore = avgRating / 5;
      score = (score + feedbackScore) / 2;
    }

    return score;
  }

  /**
   * Check if content is relevant to mental health
   */
  private checkMentalHealthRelevance(content: ResourceItem): boolean {
    const keywords = this.config.qualityAssessment.mentalHealthRelevanceKeywords;
    const text = `${content.title} ${content.description} ${content.tags.join(' ')}`.toLowerCase();

    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateQualityRecommendations(content: ResourceItem, score: number): string[] {
    const recommendations: string[] = [];

    if (score < 0.6) {
      recommendations.push('Consider improving content relevance to mental health topics');
    }

    if (!content.publishDate) {
      recommendations.push('Add publication date for better freshness assessment');
    }

    if (!content.author && !content.creator) {
      recommendations.push('Add author/creator information for authority assessment');
    }

    if (content.tags.length < 3) {
      recommendations.push('Add more descriptive tags for better categorization');
    }

    if (content.description.length < 100) {
      recommendations.push('Expand description for better content understanding');
    }

    const domain = this.extractDomain(content.sourceUrl);
    if (!this.config.qualityAssessment.trustedSources.includes(domain)) {
      recommendations.push('Consider verifying source authority and trustworthiness');
    }

    return recommendations;
  }

  /**
   * Get expiration period in months based on content type
   */
  private getExpirationPeriod(content: ResourceItem): number {
    const expirationPeriods = {
      article: 12, // Articles expire after 1 year
      video: 24,  // Videos expire after 2 years
      book: 60,   // Books expire after 5 years
      music: 120, // Music rarely expires
      podcast: 18 // Podcasts expire after 1.5 years
    };

    // Medical content expires faster
    if (content.categories.includes('medical') || content.categories.includes('wiki')) {
      return Math.min(expirationPeriods[content.type] || 12, 12);
    }

    return expirationPeriods[content.type] || 24;
  }

  /**
   * Calculate expiration urgency
   */
  private calculateExpirationUrgency(expirationDate: Date, now: Date): 'low' | 'medium' | 'high' {
    const daysUntilExpiration = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiration < 0) return 'high'; // Already expired
    if (daysUntilExpiration < 30) return 'high'; // Expires within a month
    if (daysUntilExpiration < 90) return 'medium'; // Expires within 3 months
    return 'low';
  }

  /**
   * Analyze user feedback for quality issues
   */
  private async analyzeFeedbackForQualityIssues(feedback: UserFeedback): Promise<void> {
    // Flag content with consistently low ratings
    const contentFeedback = this.userFeedback.get(feedback.contentId) || [];

    if (contentFeedback.length >= 5) {
      const avgRating = contentFeedback.reduce((sum, f) => sum + f.rating, 0) / contentFeedback.length;

      if (avgRating < 2.5) {
        logger.warn('Content flagged for low user ratings', {
          contentId: feedback.contentId,
          averageRating: avgRating,
          feedbackCount: contentFeedback.length
        });

        // Auto-submit for review if ratings are consistently low
        // This would trigger a review workflow in a real system
      }
    }

    // Flag content with specific quality issues
    const qualityIssues = contentFeedback.filter(f =>
      f.feedbackType === 'inaccurate' || f.feedbackType === 'outdated'
    );

    if (qualityIssues.length >= 2) {
      logger.warn('Content flagged for quality issues', {
        contentId: feedback.contentId,
        issueTypes: qualityIssues.map(f => f.feedbackType),
        issueCount: qualityIssues.length
      });
    }
  }

  /**
   * Calculate overall quality score from multiple sources
   */
  private calculateOverallQualityScore(reviews: ContentReview[], feedback: UserFeedback[]): number {
    let totalScore = 0;
    let weightSum = 0;

    // Professional reviews (highest weight)
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    if (approvedReviews.length > 0) {
      const avgReviewScore = approvedReviews.reduce((sum, r) => sum + r.score, 0) / approvedReviews.length;
      totalScore += avgReviewScore * 0.6;
      weightSum += 0.6;
    }

    // User feedback (medium weight)
    if (feedback.length > 0) {
      const avgUserRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
      totalScore += (avgUserRating / 5) * 0.4;
      weightSum += 0.4;
    }

    return weightSum > 0 ? totalScore / weightSum : 0.5;
  }

  /**
   * Generate overall recommendations from all quality sources
   */
  private generateOverallRecommendations(
    reviews: ContentReview[],
    expiration: ContentExpiration | null,
    feedback: UserFeedback[]
  ): string[] {
    const recommendations: string[] = [];

    // From professional reviews
    const latestReview = reviews.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime())[0];
    if (latestReview && latestReview.recommendations.length > 0) {
      recommendations.push(...latestReview.recommendations);
    }

    // From expiration tracking
    if (expiration && (expiration.isExpired || expiration.urgency === 'high')) {
      recommendations.push('Content needs updating due to age');
    }

    // From user feedback
    const negativeFeeback = feedback.filter(f => f.rating <= 2);
    if (negativeFeeback.length > feedback.length * 0.3) {
      recommendations.push('Address user concerns about content quality');
    }

    return [...new Set(recommendations)]; // Remove duplicates
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
