import type {
  AssessmentSession,
  AssessmentResult,
  AssessmentReport,
  AssessmentType,
  ScoringRule,
  RiskLevel,
} from "../../types/assessment";
import { questionBankManager } from "./QuestionBankManager";
import { structuredStorage } from "@/lib/storage/StructuredStorage";

/**
 * Results Analyzer
 * Handles multi-dimensional scoring, personalized interpretation, and risk assessment
 */
export class ResultsAnalyzer {
  private results: Map<string, AssessmentResult> = new Map();
  private interpretationTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeInterpretationTemplates();
    if (typeof window !== "undefined") {
      this.loadResultsFromStorage();
    }
  }

  /**
   * Analyze assessment session and generate results
   */
  async analyzeSession(session: AssessmentSession): Promise<AssessmentResult | null> {
    console.log("🔬 Starting session analysis:", {
      sessionId: session.id,
      status: session.status,
      assessmentTypeId: session.assessmentTypeId,
      answersCount: session.answers.length,
    });

    if (session.status !== "completed") {
      console.error(
        "❌ Cannot analyze incomplete session - status:",
        session.status
      );
      return null;
    }

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (!assessmentType) {
      console.error(`❌ Assessment type ${session.assessmentTypeId} not found`);
      return null;
    }

    console.log("✅ Assessment type found:", {
      id: assessmentType.id,
      name: assessmentType.name,
      questionsCount: assessmentType.questions.length,
      scoringRulesCount: assessmentType.scoringRules.length,
    });

    // Calculate scores using scoring rules
    const scores = this.calculateScores(session, assessmentType);

    // Generate interpretation
    const interpretation = this.generateInterpretation(
      scores,
      assessmentType,
      session.language
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      scores,
      assessmentType
    );

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
      totalTimeSpent: session.timeSpent || 0,
      answers: [...session.answers],
    };

    // Store in memory
    this.results.set(result.id, result);

    // Save to localStorage and wait for completion
    await this.saveResultsToStorage();

    console.log("✅ Result analysis completed:", {
      id: result.id,
      sessionId: result.sessionId,
      assessmentTypeId: result.assessmentTypeId,
      scoresCount: Object.keys(result.scores).length,
      answersCount: result.answers.length,
      interpretation: result.interpretation.substring(0, 100) + "...",
      recommendationsCount: result.recommendations.length,
      riskLevel: result.riskLevel,
    });

    return result;
  }

  /**
   * Calculate scores based on scoring rules
   */
  private calculateScores(
    session: AssessmentSession,
    assessmentType: AssessmentType
  ): Record<string, any> {
    const scores: Record<string, any> = {};

    for (const rule of assessmentType.scoringRules) {
      const score = this.calculateScore(session, rule);
      const range = this.findScoreRange(score, rule);

      scores[rule.id] = {
        value: score,
        label: range?.label || "Unknown",
        description: range?.description || "No description available",
        riskLevel: range?.riskLevel,
      };
    }

    return scores;
  }

  /**
   * Calculate individual score based on scoring rule
   */
  private calculateScore(
    session: AssessmentSession,
    rule: ScoringRule
  ): number {
    const relevantAnswers = session.answers.filter((answer) =>
      rule.questionIds.includes(answer.questionId)
    );

    switch (rule.calculation) {
      case "sum":
        return relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === "number" ? answer.value : 0;
          return sum + value;
        }, 0);

      case "average":
        if (relevantAnswers.length === 0) return 0;
        const sum = relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === "number" ? answer.value : 0;
          return sum + value;
        }, 0);
        return sum / relevantAnswers.length;

      case "weighted_sum":
        return relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === "number" ? answer.value : 0;
          const weight = rule.weights?.[answer.questionId] || 1;
          return sum + value * weight;
        }, 0);

      case "custom":
        // For custom formulas, we'd need a more sophisticated parser
        // For now, fall back to sum
        return relevantAnswers.reduce((sum, answer) => {
          const value = typeof answer.value === "number" ? answer.value : 0;
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
    return rule.ranges.find(
      (range) => score >= range.min && score <= range.max
    );
  }

  /**
   * Generate personalized interpretation
   */
  private generateInterpretation(
    scores: Record<string, any>,
    assessmentType: AssessmentType,
    language: string
  ): string {
    const template = this.interpretationTemplates.get(assessmentType.id);
    if (!template) {
      return this.generateDefaultInterpretation(scores, assessmentType);
    }

    let interpretation =
      template[language] || template["en"] || template["default"];

    // Replace placeholders with actual scores
    for (const [scoreId, scoreData] of Object.entries(scores)) {
      interpretation = interpretation.replace(
        new RegExp(`{{${scoreId}}}`, "g"),
        scoreData.label
      );
      interpretation = interpretation.replace(
        new RegExp(`{{${scoreId}_value}}`, "g"),
        scoreData.value.toString()
      );
      interpretation = interpretation.replace(
        new RegExp(`{{${scoreId}_description}}`, "g"),
        scoreData.description
      );
    }

    return interpretation;
  }

  /**
   * Generate default interpretation when no template is available
   */
  private generateDefaultInterpretation(
    scores: Record<string, any>,
    assessmentType: AssessmentType
  ): string {
    const scoreDescriptions = Object.entries(scores)
      .map(
        ([scoreId, scoreData]) =>
          `${scoreId}: ${scoreData.label} (${scoreData.value})`
      )
      .join(", ");

    return `Based on your responses to the ${
      assessmentType.name
    }, your results show: ${scoreDescriptions}. ${
      assessmentType.disclaimer || ""
    }`;
  }

  /**
   * Generate comprehensive recommendations based on scores
   */
  private generateRecommendations(
    scores: Record<string, any>,
    assessmentType: AssessmentType
  ): string[] {
    const recommendations: string[] = [];
    const overallRiskLevel = this.assessRiskLevel(scores);

    // 基于整体风险级别的建议
    if (overallRiskLevel === "high") {
      recommendations.push(
        "🚨 建议立即寻求专业心理健康支持",
        "📞 联系心理健康专业人士或危机热线",
        "🏥 考虑预约心理健康专家进行详细评估",
        "👥 告知家人或朋友你的情况，寻求支持"
      );
    } else if (overallRiskLevel === "medium") {
      recommendations.push(
        "👨‍⚕️ 建议预约心理健康专业人士咨询",
        "🧘‍♀️ 学习并实践压力管理技巧",
        "📚 阅读心理健康相关书籍和资源",
        "🏃‍♂️ 保持规律的体育锻炼"
      );
    } else {
      recommendations.push(
        "📊 继续监测你的心理健康状况",
        "🌱 保持健康的生活方式习惯",
        "💪 培养积极的应对策略",
        "🎯 设定可实现的目标和期望"
      );
    }

    // 基于具体评测类型的个性化建议
    const typeSpecificRecommendations = this.getTypeSpecificRecommendations(
      assessmentType.id,
      scores
    );
    recommendations.push(...typeSpecificRecommendations);

    // 基于分数模式的建议
    const patternRecommendations = this.getPatternBasedRecommendations(scores);
    recommendations.push(...patternRecommendations);

    // 添加通用健康建议
    recommendations.push(
      "💤 确保充足的睡眠（7-9小时）",
      "🥗 保持均衡的饮食",
      "🚫 避免过度使用酒精和药物",
      "🤝 与朋友和家人保持联系"
    );

    // Remove duplicates and limit to most relevant recommendations
    const uniqueRecommendations = [...new Set(recommendations)];
    return uniqueRecommendations.slice(0, 8);
  }

  /**
   * 获取基于评测类型的个性化建议
   */
  private getTypeSpecificRecommendations(
    assessmentTypeId: string,
    scores: Record<string, any>
  ): string[] {
    const recommendations: string[] = [];

    switch (assessmentTypeId) {
      case "phq-9":
        const depressionScore = scores.depression?.value || 0;
        if (depressionScore >= 15) {
          recommendations.push(
            "💊 考虑与医生讨论抗抑郁药物治疗",
            "🧠 认知行为疗法可能对你有帮助",
            "📅 建立规律的日常作息"
          );
        } else if (depressionScore >= 10) {
          recommendations.push(
            "☀️ 增加户外活动和阳光照射",
            "🎨 尝试创意活动来提升情绪",
            "📖 学习正念冥想技巧"
          );
        }
        break;

      case "gad-7":
        const anxietyScore = scores.anxiety?.value || 0;
        if (anxietyScore >= 15) {
          recommendations.push(
            "🫁 学习深呼吸和放松技巧",
            "🧘‍♀️ 尝试渐进式肌肉放松",
            "📱 使用焦虑管理应用程序"
          );
        } else if (anxietyScore >= 10) {
          recommendations.push(
            "🏃‍♀️ 定期进行有氧运动",
            "☕ 减少咖啡因摄入",
            "📝 写日记来记录和整理思绪"
          );
        }
        break;

      case "stress-scale":
        const stressScore = scores.stress?.value || 0;
        if (stressScore >= 25) {
          recommendations.push(
            "⏰ 学习时间管理技巧",
            "🎯 设定现实的优先级",
            "🚫 学会说'不'来保护自己"
          );
        } else if (stressScore >= 15) {
          recommendations.push(
            "🌿 尝试自然疗法如香薰",
            "🎵 听舒缓的音乐",
            "🛁 定期进行放松活动"
          );
        }
        break;
    }

    return recommendations;
  }

  /**
   * 基于分数模式获取建议
   */
  private getPatternBasedRecommendations(scores: Record<string, any>): string[] {
    const recommendations: string[] = [];
    const scoreValues = Object.values(scores).map((s: any) => s.value || 0);
    const averageScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

    // 检查分数一致性
    const scoreVariance = this.calculateVariance(scoreValues);
    if (scoreVariance < 2) {
      recommendations.push("📈 你的分数相对稳定，继续保持当前状态");
    } else if (scoreVariance > 10) {
      recommendations.push("📊 你的分数变化较大，建议定期重新评估");
    }

    // 检查是否有极端分数
    const hasExtremeScores = scoreValues.some(score => score >= 20);
    if (hasExtremeScores) {
      recommendations.push("⚠️ 某些方面需要特别关注，建议寻求专业帮助");
    }

    // 基于平均分数的建议
    if (averageScore >= 15) {
      recommendations.push("🔍 建议进行更详细的心理健康评估");
    } else if (averageScore >= 10) {
      recommendations.push("👀 建议定期监测心理健康状况");
    }

    return recommendations;
  }

  /**
   * 计算方差
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(scores: Record<string, any>): RiskLevel {
    const riskLevels = Object.values(scores)
      .map((scoreData) => scoreData.riskLevel)
      .filter((level) => level !== undefined);

    if (riskLevels.includes("high")) return "high";
    if (riskLevels.includes("medium")) return "medium";
    return "low";
  }

  /**
   * Generate comprehensive assessment report
   */
  generateReport(resultId: string): AssessmentReport | null {
    const result = this.results.get(resultId);
    if (!result) return null;

    const assessmentType = questionBankManager.getAssessmentType(
      result.assessmentTypeId
    );
    if (!assessmentType) return null;

    // Generate visualizations
    const visualizations = this.generateVisualizations(result);

    // Get historical results for comparison
    const historicalResults = this.getHistoricalResults(
      result.assessmentTypeId
    );
    const comparisons =
      historicalResults.length > 1
        ? this.generateComparisons(result, historicalResults)
        : undefined;

    // Generate resource recommendations
    // const resourceRecommendations =
    //   this.generateResourceRecommendations(result);

    return {
      result,
      visualizations,
      comparisons,
      resourceRecommendations: this.generateResourceRecommendations(result),
    };
  }

  /**
   * Generate visualizations for the report
   */
  private generateVisualizations(result: AssessmentResult) {
    const visualizations = [];

    // Bar chart for scores
    const scoreData = Object.entries(result.scores).map(([, data]) => ({
      label: data.label,
      value: data.value,
    }));

    visualizations.push({
      type: "bar" as const,
      data: scoreData,
      title: "Assessment Scores",
      description: "Your scores across different dimensions",
    });

    // Risk level pie chart
    const riskCounts = { low: 0, medium: 0, high: 0 };
    Object.values(result.scores).forEach((scoreData) => {
      if (scoreData.riskLevel) {
        riskCounts[scoreData.riskLevel]++;
      }
    });

    visualizations.push({
      type: "pie" as const,
      data: Object.entries(riskCounts).map(([level, count]) => ({
        label: level,
        value: count,
      })),
      title: "Risk Level Distribution",
      description: "Distribution of risk levels across assessment dimensions",
    });

    return visualizations;
  }

  /**
   * Generate comparisons with historical results
   */
  private generateComparisons(
    currentResult: AssessmentResult,
    historicalResults: AssessmentResult[]
  ) {
    const previousResults = historicalResults
      .filter((r) => r.id !== currentResult.id)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 5);

    const trends = {
      improving: [] as string[],
      declining: [] as string[],
      stable: [] as string[],
    };

    if (previousResults.length > 0) {
      const previousResult = previousResults[0];

      for (const [scoreId, currentScore] of Object.entries(
        currentResult.scores
      )) {
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
      trends,
    };
  }


  /**
   * Get historical results for trend analysis
   */
  private getHistoricalResults(assessmentTypeId: string): AssessmentResult[] {
    return Array.from(this.results.values())
      .filter((result) => result.assessmentTypeId === assessmentTypeId)
      .sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  }

  /**
   * Get result by ID
   */
  getResult(resultId: string): AssessmentResult | undefined {
    // First check in-memory cache
    let result = this.results.get(resultId);

    // If not found in memory, try to load from localStorage
    if (!result && typeof window !== "undefined") {
      try {
        // Force reload from storage
        this.loadResultsFromStorage();
        result = this.results.get(resultId);
      } catch (error) {
        console.error("Failed to load result from storage:", error);
      }
    }

    return result;
  }

  /**
   * Save result using StructuredStorage
   */
  async saveResult(result: AssessmentResult): Promise<boolean> {
    try {
      // Save to in-memory cache
      this.results.set(result.id, result);

      // Save to localStorage
      await this.saveResultsToStorage();

      return true;
    } catch (error) {
      console.error("Failed to save result:", error);
      return false;
    }
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
    return Array.from(this.results.values()).filter(
      (result) => result.assessmentTypeId === assessmentTypeId
    );
  }

  /**
   * Delete a result
   */
  async deleteResult(resultId: string): Promise<boolean> {
    const deleted = this.results.delete(resultId);
    if (deleted) {
      await this.saveResultsToStorage();
    }
    return deleted;
  }

  /**
   * Initialize interpretation templates
   */
  private initializeInterpretationTemplates(): void {
    // PHQ-9 interpretation template
    this.interpretationTemplates.set("phq-9", {
      en: `Based on your PHQ-9 assessment, your depression severity level is {{phq9-total}}. {{phq9-total_description}}. This assessment is a screening tool and should not replace professional medical advice.`,
      zh: `根据您的PHQ-9评估，您的抑郁严重程度为{{phq9-total}}。{{phq9-total_description}}。此评估是筛查工具，不应替代专业医疗建议。`,
    });

    // GAD-7 interpretation template
    this.interpretationTemplates.set("gad-7", {
      en: `Your GAD-7 assessment indicates {{gad7-total}} anxiety symptoms. {{gad7-total_description}}. Consider discussing these results with a healthcare provider.`,
      zh: `您的GAD-7评估显示{{gad7-total}}焦虑症状。{{gad7-total_description}}。建议与医疗保健提供者讨论这些结果。`,
    });

    // Stress scale interpretation template
    this.interpretationTemplates.set("stress-scale", {
      en: `Your perceived stress level is {{stress-total}}. {{stress-total_description}}. Consider implementing stress management techniques in your daily routine.`,
      zh: `您的感知压力水平为{{stress-total}}。{{stress-total_description}}。建议在日常生活中实施压力管理技巧。`,
    });
  }

  /**
   * Generate unique result ID
   */
  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  }

  /**
   * Save results to storage using StructuredStorage
   */
  private async saveResultsToStorage(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return;
    }

    try {
      // 使用新的 StructuredStorage 保存每个结果
      for (const result of this.results.values()) {
        await structuredStorage.save('assessment_result', result, result.id);
      }
    } catch (error) {
      console.error("Failed to save results to storage:", error);
    }
  }

  /**
   * Force reload results from localStorage (public method)
   */
  async reloadResultsFromStorage(): Promise<void> {
    await this.loadResultsFromStorage();
  }

  /**
   * Load results from storage using StructuredStorage
   */
  private async loadResultsFromStorage(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return;
    }

    try {
      const results = await structuredStorage.getByType<AssessmentResult>('assessment_result');

      // 清空现有结果并加载新的
      this.results.clear();
      for (const result of results) {
        this.results.set(result.id, result);
      }
    } catch (error) {
      console.error("Failed to load results from storage:", error);
      // Clear corrupted data
      try {
        localStorage.removeItem("assessment_results");
      } catch (clearError) {
        console.error("Failed to clear corrupted data:", clearError);
      }
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
    const riskLevelDistribution: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
    };

    let totalCompletionTime = 0;
    const recentActivity: Record<string, number> = {};

    for (const result of results) {
      // Count by type
      resultsByType[result.assessmentTypeId] =
        (resultsByType[result.assessmentTypeId] || 0) + 1;

      // Count by risk level
      if (result.riskLevel) {
        riskLevelDistribution[result.riskLevel]++;
      }

      // Sum completion time
      totalCompletionTime += result.totalTimeSpent;

      // Count recent activity (last 30 days)
      const dateKey = result.completedAt.toISOString().split("T")[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (result.completedAt >= thirtyDaysAgo) {
        recentActivity[dateKey] = (recentActivity[dateKey] || 0) + 1;
      }
    }

    const averageCompletionTime =
      results.length > 0 ? totalCompletionTime / results.length / 1000 : 0;

    const recentActivityArray = Object.entries(recentActivity)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalResults: results.length,
      resultsByType,
      riskLevelDistribution,
      averageCompletionTime: Math.round(averageCompletionTime),
      recentActivity: recentActivityArray,
    };
  }
  /**
   * Export all results as JSON string
   */
  exportResults(): string {
    const results = Array.from(this.results.values());
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalResults: results.length,
      results: results,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 生成详细的结果报告
   */
  public generateDetailedReport(sessionId: string): AssessmentReport | null {
    const result = this.results.get(sessionId);
    if (!result) return null;

    const report: AssessmentReport = {
      result: result,
      visualizations: [],
      resourceRecommendations: this.generateResourceRecommendations(result),
    };

    return report;
  }

  /**
   * 生成结果摘要
   */
  private generateSummary(result: AssessmentResult): string {
    const riskLevel = result.riskLevel;
    const totalScore = Object.values(result.scores).reduce((sum, score: any) => sum + (score.value || 0), 0);
    const averageScore = totalScore / Object.keys(result.scores).length;

    let summary = `根据你的评测结果，你的心理健康状况总体处于${this.getRiskLevelDescription(riskLevel)}水平。`;
    
    if (averageScore >= 15) {
      summary += "建议你尽快寻求专业心理健康支持。";
    } else if (averageScore >= 10) {
      summary += "建议你关注自己的心理健康状况，考虑寻求专业咨询。";
    } else {
      summary += "继续保持良好的心理健康习惯。";
    }

    return summary;
  }

  /**
   * 生成详细分析
   */
  private generateDetailedAnalysis(result: AssessmentResult): Record<string, any> {
    const analysis: Record<string, any> = {};

    for (const [key, score] of Object.entries(result.scores)) {
      analysis[key] = {
        score: score.value,
        level: score.riskLevel,
        description: this.getScoreDescription(key, score.value),
        interpretation: this.getScoreInterpretation(key, score.value),
        factors: this.getContributingFactors(key, score.value)
      };
    }

    return analysis;
  }

  /**
   * 生成趋势分析
   */
  private generateTrendAnalysis(_result: AssessmentResult): Record<string, any> {
    return {
      currentTrend: "stable",
      recommendation: "继续监测你的心理健康状况",
      timeframe: "过去30天",
      confidence: "medium"
    };
  }

  /**
   * 生成个性化建议
   */
  private generatePersonalizedRecommendations(result: AssessmentResult): string[] {
    const recommendations: string[] = [];
    const riskLevel = result.riskLevel;

    if (riskLevel === "high") {
      recommendations.push("立即联系心理健康专业人士");
      recommendations.push("告知家人或朋友你的情况");
      recommendations.push("避免独处，寻求陪伴");
    } else if (riskLevel === "medium") {
      recommendations.push("预约心理健康咨询");
      recommendations.push("学习压力管理技巧");
      recommendations.push("保持规律的作息");
    } else {
      recommendations.push("继续监测心理健康状况");
      recommendations.push("保持健康的生活习惯");
      recommendations.push("定期进行自我评估");
    }

    return recommendations;
  }

  /**
   * 生成风险评估
   */
  private generateRiskAssessment(result: AssessmentResult): Record<string, any> {
    return {
      overallRisk: result.riskLevel,
      riskFactors: this.identifyRiskFactors(result),
      protectiveFactors: this.identifyProtectiveFactors(result),
      recommendations: this.getRiskBasedRecommendations(result.riskLevel)
    };
  }

  /**
   * 生成后续行动建议
   */
  private generateNextSteps(result: AssessmentResult): string[] {
    const nextSteps: string[] = [];
    const riskLevel = result.riskLevel;

    if (riskLevel === "high") {
      nextSteps.push("立即寻求专业帮助");
      nextSteps.push("联系危机热线");
      nextSteps.push("告知信任的人");
    } else if (riskLevel === "medium") {
      nextSteps.push("预约心理健康咨询");
      nextSteps.push("开始实施建议的策略");
      nextSteps.push("定期重新评估");
    } else {
      nextSteps.push("继续当前的健康习惯");
      nextSteps.push("定期进行自我评估");
      nextSteps.push("考虑预防性措施");
    }

    return nextSteps;
  }

  /**
   * 生成资源推荐
   */
  private generateResourceRecommendations(_result: AssessmentResult): {
    type: 'article' | 'exercise' | 'resource';
    id: string;
    title: string;
    description: string;
    relevanceScore: number;
  }[] {
    return [
      {
        type: 'resource',
        id: 'mental-health-professional',
        title: '心理健康专家',
        description: '寻求专业心理健康支持',
        relevanceScore: 0.9
      },
      {
        type: 'article',
        id: 'self-help-guide',
        title: '自助指南',
        description: '学习心理健康自我管理技巧',
        relevanceScore: 0.7
      },
      {
        type: 'exercise',
        id: 'mindfulness-practice',
        title: '正念练习',
        description: '通过正念练习改善心理健康',
        relevanceScore: 0.6
      }
    ];
  }

  /**
   * 获取风险级别描述
   */
  private getRiskLevelDescription(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case "high": return "高风险";
      case "medium": return "中等风险";
      case "low": return "低风险";
      default: return "未知";
    }
  }

  /**
   * 获取分数描述
   */
  private getScoreDescription(_key: string, value: number): string {
    if (value >= 15) return "需要立即关注";
    if (value >= 10) return "需要关注";
    if (value >= 5) return "轻度关注";
    return "正常范围";
  }

  /**
   * 获取分数解释
   */
  private getScoreInterpretation(key: string, value: number): string {
    return `你的${key}得分为${value}，${this.getScoreDescription(key, value)}。`;
  }

  /**
   * 获取影响因素
   */
  private getContributingFactors(_key: string, value: number): string[] {
    const factors: string[] = [];
    
    if (value >= 10) {
      factors.push("生活压力");
      factors.push("睡眠质量");
      factors.push("社交关系");
    }
    
    return factors;
  }

  /**
   * 识别风险因素
   */
  private identifyRiskFactors(result: AssessmentResult): string[] {
    const riskFactors: string[] = [];
    
    for (const [key, score] of Object.entries(result.scores)) {
      if (score.value >= 15) {
        riskFactors.push(`${key}得分过高`);
      }
    }
    
    return riskFactors;
  }

  /**
   * 识别保护因素
   */
  private identifyProtectiveFactors(result: AssessmentResult): string[] {
    const protectiveFactors: string[] = [];
    
    for (const [key, score] of Object.entries(result.scores)) {
      if (score.value < 5) {
        protectiveFactors.push(`${key}得分正常`);
      }
    }
    
    return protectiveFactors;
  }

  /**
   * 获取基于风险的建议
   */
  private getRiskBasedRecommendations(riskLevel: RiskLevel): string[] {
    switch (riskLevel) {
      case "high":
        return ["立即寻求专业帮助", "联系危机热线", "告知信任的人"];
      case "medium":
        return ["预约心理健康咨询", "学习压力管理技巧", "保持规律作息"];
      case "low":
        return ["继续健康习惯", "定期自我评估", "考虑预防措施"];
      default:
        return ["建议咨询专业人士"];
    }
  }

  /**
   * 计算置信度分数
   */
  private calculateConfidenceScore(result: AssessmentResult): number {
    const totalQuestions = result.answers.length;
    const answeredQuestions = result.answers.filter(a => a.value !== undefined).length;
    const completeness = answeredQuestions / totalQuestions;
    
    const scores = Object.values(result.scores).map((s: any) => s.value || 0);
    const variance = this.calculateVariance(scores);
    const consistency = Math.max(0, 1 - variance / 100);
    
    return Math.round((completeness * 0.7 + consistency * 0.3) * 100);
  }
}

// Singleton instance
export const resultsAnalyzer = new ResultsAnalyzer();
