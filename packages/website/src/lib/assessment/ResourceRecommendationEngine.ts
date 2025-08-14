import type {
  AssessmentResult,
  RiskLevel,
  Recommendation
} from '../../types/assessment';

interface ResourceItem {
  id: string;
  type: 'article' | 'book' | 'video' | 'exercise' | 'hotline';
  title: string;
  description: string;
  url?: string;
  tags: string[];
  category: string;
  riskLevels: RiskLevel[];
  assessmentTypes: string[];
  language: string;
  priority: number;
}

/**
 * Resource Recommendation Engine
 * Links assessment results with relevant resources and recommendations
 */
export class ResourceRecommendationEngine {
  private resources: Map<string, ResourceItem> = new Map();

  constructor() {
    this.initializeDefaultResources();
  }

  /**
   * Initialize default resource recommendations
   */
  private initializeDefaultResources(): void {
    const defaultResources: ResourceItem[] = [
      // Crisis and High-Risk Resources
      {
        id: 'crisis-hotline-us',
        type: 'hotline',
        title: 'National Suicide Prevention Lifeline',
        description: '24/7 crisis support and suicide prevention',
        url: 'tel:988',
        tags: ['crisis', 'suicide', 'emergency', '24/7'],
        category: 'crisis_support',
        riskLevels: ['high'],
        assessmentTypes: ['phq-9', 'gad-7'],
        language: 'en',
        priority: 10
      },
      {
        id: 'crisis-hotline-china',
        type: 'hotline',
        title: '中国心理危机干预热线',
        description: '24小时心理危机干预和自杀预防',
        url: 'tel:400-161-9995',
        tags: ['危机', '自杀', '紧急', '24小时'],
        category: 'crisis_support',
        riskLevels: ['high'],
        assessmentTypes: ['phq-9', 'gad-7'],
        language: 'zh',
        priority: 10
      },
      {
        id: 'professional-help-guide',
        type: 'article',
        title: 'When and How to Seek Professional Help',
        description: 'A comprehensive guide to finding mental health professionals',
        url: '/resources/professional-help-guide',
        tags: ['therapy', 'counseling', 'professional', 'help'],
        category: 'professional_support',
        riskLevels: ['medium', 'high'],
        assessmentTypes: ['phq-9', 'gad-7', 'stress-scale'],
        language: 'en',
        priority: 9
      },

      // Depression-Specific Resources
      {
        id: 'depression-self-help',
        type: 'article',
        title: 'Self-Help Strategies for Depression',
        description: 'Evidence-based techniques for managing depression symptoms',
        url: '/resources/depression-self-help',
        tags: ['depression', 'self-help', 'coping', 'strategies'],
        category: 'self_help',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['phq-9'],
        language: 'en',
        priority: 8
      },
      {
        id: 'depression-exercise',
        type: 'exercise',
        title: 'Mood Lifting Exercises',
        description: 'Physical activities proven to improve mood and reduce depression',
        url: '/exercises/mood-lifting',
        tags: ['exercise', 'mood', 'physical', 'activity'],
        category: 'lifestyle',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['phq-9'],
        language: 'en',
        priority: 7
      },

      // Anxiety-Specific Resources
      {
        id: 'anxiety-breathing',
        type: 'exercise',
        title: 'Breathing Exercises for Anxiety',
        description: 'Simple breathing techniques to manage anxiety symptoms',
        url: '/exercises/breathing-anxiety',
        tags: ['anxiety', 'breathing', 'relaxation', 'techniques'],
        category: 'relaxation',
        riskLevels: ['low', 'medium', 'high'],
        assessmentTypes: ['gad-7'],
        language: 'en',
        priority: 8
      },
      {
        id: 'anxiety-cbt-techniques',
        type: 'article',
        title: 'Cognitive Behavioral Techniques for Anxiety',
        description: 'Learn CBT strategies to challenge anxious thoughts',
        url: '/resources/cbt-anxiety',
        tags: ['anxiety', 'cbt', 'cognitive', 'behavioral'],
        category: 'therapy_techniques',
        riskLevels: ['medium', 'high'],
        assessmentTypes: ['gad-7'],
        language: 'en',
        priority: 8
      },

      // Stress Management Resources
      {
        id: 'stress-management-guide',
        type: 'article',
        title: 'Comprehensive Stress Management Guide',
        description: 'Practical strategies for managing daily stress',
        url: '/resources/stress-management',
        tags: ['stress', 'management', 'coping', 'daily'],
        category: 'stress_management',
        riskLevels: ['low', 'medium', 'high'],
        assessmentTypes: ['stress-scale'],
        language: 'en',
        priority: 7
      },
      {
        id: 'mindfulness-meditation',
        type: 'exercise',
        title: 'Mindfulness Meditation for Stress',
        description: 'Guided mindfulness practices to reduce stress',
        url: '/exercises/mindfulness-stress',
        tags: ['mindfulness', 'meditation', 'stress', 'relaxation'],
        category: 'mindfulness',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['stress-scale', 'gad-7'],
        language: 'en',
        priority: 7
      },

      // General Wellness Resources
      {
        id: 'sleep-hygiene',
        type: 'article',
        title: 'Sleep Hygiene for Mental Health',
        description: 'How good sleep habits support mental wellness',
        url: '/resources/sleep-hygiene',
        tags: ['sleep', 'hygiene', 'wellness', 'habits'],
        category: 'lifestyle',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['phq-9', 'gad-7', 'stress-scale'],
        language: 'en',
        priority: 6
      },
      {
        id: 'social-support',
        type: 'article',
        title: 'Building and Maintaining Social Support',
        description: 'The importance of social connections for mental health',
        url: '/resources/social-support',
        tags: ['social', 'support', 'relationships', 'connection'],
        category: 'social_wellness',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['phq-9', 'gad-7'],
        language: 'en',
        priority: 6
      },

      // Chinese Language Resources
      {
        id: 'depression-help-zh',
        type: 'article',
        title: '抑郁症自助指南',
        description: '基于证据的抑郁症管理技巧',
        url: '/resources/depression-help-zh',
        tags: ['抑郁症', '自助', '应对', '策略'],
        category: 'self_help',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['phq-9'],
        language: 'zh',
        priority: 8
      },
      {
        id: 'anxiety-help-zh',
        type: 'article',
        title: '焦虑症管理技巧',
        description: '有效的焦虑症应对方法',
        url: '/resources/anxiety-help-zh',
        tags: ['焦虑症', '管理', '应对', '技巧'],
        category: 'self_help',
        riskLevels: ['low', 'medium'],
        assessmentTypes: ['gad-7'],
        language: 'zh',
        priority: 8
      }
    ];

    // Store resources
    for (const resource of defaultResources) {
      this.resources.set(resource.id, resource);
    }
  }

  /**
   * Get resource recommendations based on assessment result
   */
  getRecommendations(result: AssessmentResult, maxRecommendations: number = 5): Recommendation[] {
    const relevantResources = this.findRelevantResources(result);
    const recommendations: Recommendation[] = [];

    for (const resource of relevantResources.slice(0, maxRecommendations)) {
      const recommendation: Recommendation = {
        id: resource.id,
        type: this.mapResourceTypeToRecommendationType(resource.type, result.riskLevel),
        priority: this.mapPriorityToRecommendationPriority(resource.priority),
        title: resource.title,
        description: resource.description,
        actionItems: this.generateActionItems(resource, result),
        resourceLinks: [{
          type: resource.url?.startsWith('http') ? 'external' : 'internal',
          url: resource.url || '#',
          title: resource.title
        }],
        estimatedTimeCommitment: this.estimateTimeCommitment(resource)
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * Find relevant resources based on assessment result
   */
  private findRelevantResources(result: AssessmentResult): ResourceItem[] {
    const resources = Array.from(this.resources.values());

    return resources
      .filter(resource => {
        // Filter by assessment type
        if (!resource.assessmentTypes.includes(result.assessmentTypeId)) {
          return false;
        }

        // Filter by risk level
        if (result.riskLevel && !resource.riskLevels.includes(result.riskLevel)) {
          return false;
        }

        // Filter by language (prefer matching language, but include English as fallback)
        if (resource.language !== result.language && resource.language !== 'en') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by priority (higher first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }

        // Prefer resources in the user's language
        if (a.language === result.language && b.language !== result.language) {
          return -1;
        }
        if (b.language === result.language && a.language !== result.language) {
          return 1;
        }

        return 0;
      });
  }

  /**
   * Map resource type to recommendation type
   */
  private mapResourceTypeToRecommendationType(
    resourceType: ResourceItem['type'],
    riskLevel?: RiskLevel
  ): Recommendation['type'] {
    if (riskLevel === 'high') {
      return 'immediate';
    }

    switch (resourceType) {
      case 'hotline':
        return 'immediate';
      case 'exercise':
        return 'short_term';
      case 'article':
      case 'book':
      case 'video':
      default:
        return 'long_term';
    }
  }

  /**
   * Map priority to recommendation priority
   */
  private mapPriorityToRecommendationPriority(priority: number): Recommendation['priority'] {
    if (priority >= 9) return 'high';
    if (priority >= 7) return 'medium';
    return 'low';
  }

  /**
   * Generate action items for a resource
   */
  private generateActionItems(resource: ResourceItem, _result: AssessmentResult): string[] {
    const actionItems: string[] = [];

    switch (resource.type) {
      case 'hotline':
        actionItems.push(
          'Save this number in your phone for easy access',
          'Call immediately if you are in crisis',
          'Have this number available when you feel overwhelmed'
        );
        break;

      case 'article':
        actionItems.push(
          'Read the article carefully',
          'Take notes on strategies that resonate with you',
          'Try implementing one technique this week'
        );
        break;

      case 'exercise':
        actionItems.push(
          'Practice this exercise daily for best results',
          'Start with short sessions and gradually increase',
          'Track your progress and how you feel after each session'
        );
        break;

      case 'book':
        actionItems.push(
          'Set aside time for regular reading',
          'Keep a journal of insights and reflections',
          'Discuss key concepts with a trusted friend or therapist'
        );
        break;

      case 'video':
        actionItems.push(
          'Watch in a quiet, comfortable environment',
          'Take breaks if the content feels overwhelming',
          'Practice any techniques demonstrated in the video'
        );
        break;

      default:
        actionItems.push(
          'Explore this resource when you have time',
          'Consider how it applies to your situation',
          'Share with others who might benefit'
        );
    }

    return actionItems;
  }

  /**
   * Estimate time commitment for a resource
   */
  private estimateTimeCommitment(resource: ResourceItem): string {
    switch (resource.type) {
      case 'hotline':
        return 'As needed';
      case 'article':
        return '10-15 minutes';
      case 'exercise':
        return '5-20 minutes daily';
      case 'book':
        return '2-4 weeks';
      case 'video':
        return '15-60 minutes';
      default:
        return 'Varies';
    }
  }

  /**
   * Add custom resource
   */
  addResource(resource: ResourceItem): void {
    this.resources.set(resource.id, resource);
  }

  /**
   * Remove resource
   */
  removeResource(resourceId: string): boolean {
    return this.resources.delete(resourceId);
  }

  /**
   * Update resource
   */
  updateResource(resourceId: string, updates: Partial<ResourceItem>): boolean {
    const existing = this.resources.get(resourceId);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    this.resources.set(resourceId, updated);
    return true;
  }

  /**
   * Get all resources
   */
  getAllResources(): ResourceItem[] {
    return Array.from(this.resources.values());
  }

  /**
   * Get resources by category
   */
  getResourcesByCategory(category: string): ResourceItem[] {
    return Array.from(this.resources.values())
      .filter(resource => resource.category === category);
  }

  /**
   * Get resources by type
   */
  getResourcesByType(type: ResourceItem['type']): ResourceItem[] {
    return Array.from(this.resources.values())
      .filter(resource => resource.type === type);
  }

  /**
   * Search resources
   */
  searchResources(query: string, language?: string): ResourceItem[] {
    const searchTerms = query.toLowerCase().split(' ');

    return Array.from(this.resources.values())
      .filter(resource => {
        // Language filter
        if (language && resource.language !== language && resource.language !== 'en') {
          return false;
        }

        // Search in title, description, and tags
        const searchText = [
          resource.title,
          resource.description,
          ...resource.tags
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchText.includes(term));
      })
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get emergency resources
   */
  getEmergencyResources(language?: string): ResourceItem[] {
    return Array.from(this.resources.values())
      .filter(resource => {
        return resource.riskLevels.includes('high') &&
               resource.type === 'hotline' &&
               (!language || resource.language === language || resource.language === 'en');
      })
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get resource statistics
   */
  getResourceStatistics(): {
    totalResources: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byLanguage: Record<string, number>;
    byRiskLevel: Record<string, number>;
  } {
    const resources = Array.from(this.resources.values());

    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};
    const byRiskLevel: Record<string, number> = {};

    for (const resource of resources) {
      // Count by type
      byType[resource.type] = (byType[resource.type] || 0) + 1;

      // Count by category
      byCategory[resource.category] = (byCategory[resource.category] || 0) + 1;

      // Count by language
      byLanguage[resource.language] = (byLanguage[resource.language] || 0) + 1;

      // Count by risk level
      for (const riskLevel of resource.riskLevels) {
        byRiskLevel[riskLevel] = (byRiskLevel[riskLevel] || 0) + 1;
      }
    }

    return {
      totalResources: resources.length,
      byType,
      byCategory,
      byLanguage,
      byRiskLevel
    };
  }


}

// Singleton instance
export const resourceRecommendationEngine = new ResourceRecommendationEngine();
