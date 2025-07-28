import type {
  AssessmentSession,
  AssessmentResult,
  AssessmentReport,
  AssessmentType,
  ScoringRule,
  RiskLevel,
  Recommendation
} from '../../types/assessment';
import { questionBankManager } from './QuestionBankManager';

/**
 * Results Analyzer
 * Handles multi-dimensional scoring, personalized interpretation, and risk assessment
 */
export class ResultsAnalyzer {
  private results: Map<string, AssessmentResult> = new Map();
  private interpretationTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeInterpretationTemplates();
    this.loadResultsFromStorage();
  }

  /**
   * Analyze assessment session and generate results
   */
  analyzeSession(session: AssessmentSession): AssessmentResult | null {
    if (session.status !== 'completed') {
      console.error('Cannot analyze incomplete session');
      return null;
    }

    const assessmentType = questionBankManager.getAssessmentType(session.assessmentTypeId);
    if (!assessmentType) {
      console.error(`Assessment type ${session.assessmentTypeId} not found`);
      return null;
    }

    // Calculate scores using scoring rules
    const scores = this.calculateScores(session, assessmentType);

    // Generate interpretation
    const interpretation = this.generateInterpretation(scores, assessmentType, session.language);

    // Generate recommendations
    const recommendations = this.generateRecommendations(scores, assessmentType);

    // Assess overall risk level
    const riskLevel = this.assessRiskLevel(scores);

    const result: AssessmentResult = {
      id: this.generateResultId(),
      sessionId: session.id,
      assessmentTypeId: session.assessmentTypeId,
      completedAt: new Date(),
      scores,
      interpretation,
      recommendations,
      riskLevel,
      language: session.language,
      culturalContext: session.culturalContext,
      totalTimeSpent: session.timeSpent,
      answers: [...session.answers]
    };

    this.results.set(result.id, result);
    this.saveResultsToStorage();

    return result;
  }

  /**
   * Calculate scores based on scoring rules
   */
  private calculateScores(session: AssessmentSession, assessmentType: AssessmentType): Record<string, any> {
    const scores: Record<string, any> = {};

    for (const rule of assessmentType.scoringRules) {
      const score = this.calculateScore(session, rule);
      const range = this.findScoreRange(score, rule);

      scores[rule.id] = {
        value: score,
        label: range?.label || 'Unknown',
        description: range?.description || 'No description available',
        riskLevel: range?.riskLevel
      };
    }

    return scores;
  }

  /**
   * Calculate individual score based on scoring rule
   */
  private calculateScore(session: AssessmentSession, rule: ScoringRule): number {
    const relevantAnswers = session.answers.filter(answer =>
      rule.questionIds.includes(answer.questionId)
    );

    switch (rule.calculation) {
      case 'sum':
        return relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === 'number' ? answer.value : 0;
          return sum + value;
        }, 0);

      case 'average':
        if (relevantAnswers.length === 0) return 0;
        const sum = relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === 'number' ? answer.value : 0;
          return sum + value;
        }, 0);
        return sum / relevantAnswers.length;

      case 'weighted_sum':
        return relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === 'number' ? answer.value : 0;
          const weight = rule.weights?.[answer.questionId] || 1;
          return sum + (value * weight);
        }, 0);

      case 'custom':
        // For custom formulas, we'd need a more sophisticated parser
        // For now, fall back to sum
        return relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === 'number' ? answer.value : 0;
          return sum + value;
        }, 0);

      default:
        return 0;
    }
  }

  /**
   * Find the appropriate score range for a given score
   */
  private findScoreRange(score: number, rule: ScoringRule) {
    return rule.ranges.find(range => score >= range.min && score <= range.max);
  }

  /**
   * Generate personalized interpretation
   */
  private generateInterpretation(scores: Record<string, any>, assessmentType: AssessmentType, language: string): string {
    const template = this.interpretationTemplates.get(assessmentType.id);
    if (!template) {
      return this.generateDefaultInterpretation(scores, assessmentType);
    }

    let interpretation = template[language] || template['en'] || template['default'];

    // Replace placeholders with actual scores
    for (const [scoreId, scoreData] of Object.entries(scores)) {
      interpretation = interpretation.replace(
        new RegExp(`{{${scoreId}}}`, 'g'),
        scoreData.label
      );
      interpretation = interpretation.replace(
        new RegExp(`{{${scoreId}_value}}`, 'g'),
        scoreData.value.toString()
      );
      interpretation = interpretation.replace(
        new RegExp(`{{${scoreId}_description}}`, 'g'),
        scoreData.description
      );
    }

    return interpretation;
  }

  /**
   * Generate default interpretation when no template is available
   */
  private generateDefaultInterpretation(scores: Record<string, any>, assessmentType: AssessmentType): string {
    const scoreDescriptions = Object.entries(scores)
      .map(([scoreId, scoreData]) => `${scoreId}: ${scoreData.label} (${scoreData.value})`)
      .join(', ');

    return `Based on your responses to the ${assessmentType.name}, your results show: ${scoreDescriptions}. ${assessmentType.disclaimer || ''}`;
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(scores: Record<string, any>, assessmentType: AssessmentType): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on risk levels and scores
    for (const [scoreId, scoreData] of Object.entries(scores)) {
      const riskLevel = scoreData.riskLevel;

      if (riskLevel === 'high') {
        recommendations.push(
          'Consider seeking professional help from a mental health provider.',
          'Reach out to a trusted friend, family member, or counselor for support.',
          'If you are in crisis, contact a mental health hotline immediately.'
        );
      } else if (riskLevel === 'medium') {
        recommendations.push(
          'Consider implementing stress management techniques in your daily routine.',
          'Regular exercise and adequate sleep can help improve your mental well-being.',
          'Consider speaking with a counselor or therapist for additional support.'
        );
      } else if (riskLevel === 'low') {
        recommendations.push(
          'Continue maintaining healthy habits that support your mental well-being.',
          'Consider mindfulness or meditation practices to maintain your positive state.',
          'Stay connected with supportive friends and family members.'
        );
      }
    }

    // Remove duplicates and limit to most relevant recommendations
    const uniqueRecommendations = [...new Set(recommendations)];
    return uniqueRecommendations.slice(0, 5);
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(scores: Record<string, any>): RiskLevel {
    const riskLevels = Object.values(scores)
      .map(scoreData => scoreData.riskLevel)
      .filter(level => level !== undefined);

    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Generate comprehensive assessment report
   */
  generateReport(resultId: string): AssessmentReport | null {
    const result = this.results.get(resultId);
    if (!result) return null;

    const assessmentType = questionBankManager.getAssessmentType(result.assessmentTypeId);
    if (!assessmentType) return null;

    // Generate visualizations
    const visualizations = this.generateVisualizations(result);

    // Get historical results for comparison
    const historicalResults = this.getHistoricalResults(result.assessmentTypeId);
    const comparisons = historicalResults.length > 1 ?
      this.generateComparisons(result, historicalResults) : undefined;

    // Generate resource recommendations
    const resourceRecommendations = this.generateResourceRecommendations(result);

    return {
      result,
      visualizations,
      comparisons,
      resourceRecommendations
    };
  }

  /**
   * Generate visualizations for the report
   */
  private generateVisualizations(result: AssessmentResult) {
    const visualizations = [];

    // Bar chart for scores
    const scoreData = Object.entries(result.scores).map(([key, data]) => ({
      label: data.label,
      value: data.value
    }));

    visualizations.push({
      type: 'bar' as const,
      data: scoreData,
      title: 'Assessment Scores',
      description: 'Your scores across different dimensions'
    });

    // Risk level pie chart
    const riskCounts = { low: 0, medium: 0, high: 0 };
    Object.values(result.scores).forEach(scoreData => {
      if (scoreData.riskLevel) {
        riskCounts[scoreData.riskLevel]++;
      }
    });

    visualizations.push({
      type: 'pie' as const,
      data: Object.entries(riskCounts).map(([level, count]) => ({
        label: level,
        value: count
      })),
      title: 'Risk Level Distribution',
      description: 'Distribution of risk levels across assessment dimensions'
    });

    return visualizations;
  }

  /**
   * Generate comparisons with historical results
   */
  private generateComparisons(currentResult: AssessmentResult, historicalResults: AssessmentResult[]) {
    const previousResults = historicalResults
      .filter(r => r.id !== currentResult.id)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 5);

    const trends = {
      improving: [] as string[],
      declining: [] as string[],
      stable: [] as string[]
    };

    if (previousResults.length > 0) {
      const previousResult = previousResults[0];

      for (const [scoreId, currentScore] of Object.entries(currentResult.scores)) {
        const previousScore = previousResult.scores[scoreId];
        if (previousScore) {
          const difference = currentScore.value - previousScore.value;
          const threshold = 0.1; // 10% change threshold

          if (Math.abs(difference) < threshold) {
            trends.stable.push(scoreId);
          } else if (difference > 0) {
            // For mental health assessments, higher scores often indicate worse conditions
            trends.declining.push(scoreId);
          } else {
            trends.improving.push(scoreId);
          }
        }
      }
    }

    return {
      previousResults,
      trends
    };
  }

  /**
   * Generate resource recommendations based on results
   */
  private generateResourceRecommendations(result: AssessmentResult) {
    const recommendations = [];

    // Generate recommendations based on risk level and scores
    if (result.riskLevel === 'high') {
      recommendations.push(
        {
          type: 'resource' as const,
          id: 'crisis-hotline',
          title: 'Crisis Support Hotline',
          description: 'Immediate support for mental health crises',
          relevanceScore: 1.0
        },
        {
          type: 'article' as const,
          id: 'professional-help',
          title: 'When to Seek Professional Help',
          description: 'Guide to finding and accessing mental health services',
          relevanceScore: 0.9
        }
      );
    } else if (result.riskLevel === 'medium') {
      recommendations.push(
        {
          type: 'exercise' as const,
          id: 'stress-management',
          title: 'Stress Management Techniques',
          description: 'Practical exercises to manage stress and anxiety',
          relevanceScore: 0.8
        },
        {
          type: 'article' as const,
          id: 'self-care',
          title: 'Self-Care Strategies',
          description: 'Building healthy habits for mental wellness',
          relevanceScore: 0.7
        }
      );
    } else {
      recommendations.push(
        {
          type: 'exercise' as const,
          id: 'mindfulness',
          title: 'Mindfulness and Meditation',
          description: 'Practices to maintain and enhance mental well-being',
          relevanceScore: 0.6
        },
        {
          type: 'article' as const,
          id: 'wellness-tips',
          title: 'Mental Wellness Tips',
          description: 'Daily practices for optimal mental health',
          relevanceScore: 0.5
        }
      );
    }

    return recommendations;
  }

  /**
   * Get historical results for trend analysis
   */
  private getHistoricalResults(assessmentTypeId: string): AssessmentResult[] {
    return Array.from(this.results.values())
      .filter(result => result.assessmentTypeId === assessmentTypeId)
      .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  }

  /**
   * Get result by ID
   */
  getResult(resultId: string): AssessmentResult | undefined {
    return this.results.get(resultId);
  }

  /**
   * Get all results
   */
  getAllResults(): AssessmentResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Get results by assessment type
   */
  getResultsByAssessmentType(assessmentTypeId: string): AssessmentResult[] {
    return Array.from(this.results.values())
      .filter(result => result.assessmentTypeId === assessmentTypeId);
  }

  /**
   * Delete a result
   */
  deleteResult(resultId: string): boolean {
    const deleted = this.results.delete(resultId);
    if (deleted) {
      this.saveResultsToStorage();
    }
    return deleted;
  }

  /**
   * Initialize interpretation templates
   */
  private initializeInterpretationTemplates(): void {
    // PHQ-9 interpretation template
    this.interpretationTemplates.set('phq-9', {
      en: `Based on your PHQ-9 assessment, your depression severity level is {{phq9-total}}. {{phq9-total_description}}. This assessment is a screening tool and should not replace professional medical advice.`,
      zh: `根据您的PHQ-9评估，您的抑郁严重程度为{{phq9-total}}。{{phq9-total_description}}。此评估是筛查工具，不应替代专业医疗建议。`
    });

    // GAD-7 interpretation template
    this.interpretationTemplates.set('gad-7', {
      en: `Your GAD-7 assessment indicates {{gad7-total}} anxiety symptoms. {{gad7-total_description}}. Consider discussing these results with a healthcare provider.`,
      zh: `您的GAD-7评估显示{{gad7-total}}焦虑症状。{{gad7-total_description}}。建议与医疗保健提供者讨论这些结果。`
    });

    // Stress scale interpretation template
    this.interpretationTemplates.set('stress-scale', {
      en: `Your perceived stress level is {{stress-total}}. {{stress-total_description}}. Consider implementing stress management techniques in your daily routine.`,
      zh: `您的感知压力水平为{{stress-total}}。{{stress-total_description}}。建议在日常生活中实施压力管理技巧。`
    });
  }

  /**
   * Generate unique result ID
   */
  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save results to localStorage
   */
  private saveResultsToStorage(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const resultsData = Array.from(this.results.entries()).map(([id, result]) => ({
        id,
        ...result,
        completedAt: result.completedAt.toISOString(),
        answers: result.answers.map(answer => ({
          ...answer,
          answeredAt: answer.answeredAt.toISOString()
        }))
      }));

      localStorage.setItem('assessment_results', JSON.stringify(resultsData));
    } catch (error) {
      console.error('Failed to save results to storage:', error);
    }
  }

  /**
   * Load results from localStorage
   */
  private loadResultsFromStorage(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('assessment_results');
      if (!stored) return;

      const resultsData = JSON.parse(stored);
      for (const resultData of resultsData) {
        const result: AssessmentResult = {
          ...resultData,
          completedAt: new Date(resultData.completedAt),
          answers: resultData.answers.map((answer: any) => ({
            ...answer,
            answeredAt: new Date(answer.answeredAt)
          }))
        };

        this.results.set(result.id, result);
      }
    } catch (error) {
      console.error('Failed to load results from storage:', error);
    }
  }

  /**
   * Clear all results (for testing or reset)
   */
  clearAllResults(): void {
    this.results.clear();

    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('assessment_results');
      } catch (error) {
        console.error('Failed to clear results from storage:', error);
      }
    }
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    const results = Array.from(this.results.values());
    return JSON.stringify(results, null, 2);
  }

  /**
   * Import results from JSON
   */
  importResults(jsonData: string): { success: boolean; errors: string[] } {
    try {
      const results: AssessmentResult[] = JSON.parse(jsonData);
      const errors: string[] = [];

      for (const result of results) {
        try {
          // Validate result structure
          if (!result.id || !result.sessionId || !result.assessmentTypeId) {
            errors.push(`Invalid result structure: ${result.id || 'unknown'}`);
            continue;
          }

          // Convert date strings back to Date objects
          const processedResult: AssessmentResult = {
            ...result,
            completedAt: new Date(result.completedAt),
            answers: result.answers.map(answer => ({
              ...answer,
              answeredAt: new Date(answer.answeredAt)
            }))
          };

          this.results.set(processedResult.id, processedResult);
        } catch (error) {
          errors.push(`Failed to import result ${result.id}: ${error}`);
        }
      }

      if (errors.length === 0) {
        this.saveResultsToStorage();
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Invalid JSON format']
      };
    }
  }

  /**
   * Get assessment statistics
   */
  getAssessmentStatistics(): {
    totalResults: number;
    resultsByType: Record<string, number>;
    riskLevelDistribution: Record<RiskLevel, number>;
    averageCompletionTime: number;
    recentActivity: { date: string; count: number }[];
  } {
    const results = Array.from(this.results.values());

    const resultsByType: Record<string, number> = {};
    const riskLevelDistribution: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0 };

    let totalCompletionTime = 0;
    const recentActivity: Record<string, number> = {};

    for (const result of results) {
      // Count by type
      resultsByType[result.assessmentTypeId] = (resultsByType[result.assessmentTypeId] || 0) + 1;

      // Count by risk level
      if (result.riskLevel) {
        riskLevelDistribution[result.riskLevel]++;
      }

      // Sum completion time
      totalCompletionTime += result.totalTimeSpent;

      // Count recent activity (last 30 days)
      const dateKey = result.completedAt.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (result.completedAt >= thirtyDaysAgo) {
        recentActivity[dateKey] = (recentActivity[dateKey] || 0) + 1;
      }
    }

    const averageCompletionTime = results.length > 0 ? totalCompletionTime / results.length / 1000 : 0;

    const recentActivityArray = Object.entries(recentActivity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalResults: results.length,
      resultsByType,
      riskLevelDistribution,
      averageCompletionTime: Math.round(averageCompletionTime),
      recentActivity: recentActivityArray
    };
  }
}

// Singleton instance
export const resultsAnalyzer = new ResultsAnalyzer();
