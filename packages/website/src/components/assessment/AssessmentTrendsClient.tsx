import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import { TrendingUp, TrendingDown, BarChart3, Download, AlertCircle } from 'lucide-react';
import type { TrendData, CategoryPerformance, RiskTrends } from '@/types/assessment';

const AssessmentTrendsClient = memo(function AssessmentTrendsClient() {
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();
  const [currentRange, setCurrentRange] = useState<number | null>(365);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = useCallback(async () => {
    try {
      setIsLoading(true);
      const allResults = resultsAnalyzer.getAllResults();
      setResults(allResults);
      setError(null);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load trends:', err);
      }
      setError('Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRangeChange = useCallback((range: number | null) => {
    setCurrentRange(range);
  }, []);

  const getFilteredResults = useMemo(() => {
    if (!currentRange) return results;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentRange);

    return results.filter(result =>
      new Date(result.completedAt) >= cutoffDate
    );
  }, [results, currentRange]);

  const getTrendData = useMemo((): TrendData[] => {
    const filteredResults = getFilteredResults;
    const monthlyData = groupResultsByMonth(filteredResults);

    return Object.entries(monthlyData).map(([month, monthResults]) => ({
      month,
      avgScore: calculateAverageScore(monthResults as any[]),
      count: (monthResults as any[]).length
    }));
  }, [getFilteredResults]);

  const getCategoryPerformanceData = useMemo((): CategoryPerformance => {
    const filteredResults = getFilteredResults;
    const performance: { [key: string]: number[] } = {};

    filteredResults.forEach((result: any) => {
      const assessmentType = questionBankManager.getAssessmentType(result.assessmentTypeId);
      if (assessmentType) {
        const category = assessmentType.category;
        if (!performance[category]) performance[category] = [];

        const scores = Object.values(result.scores);
        const avgScore = (scores as any[]).reduce((sum: number, score: any) => sum + score.value, 0) / scores.length;
        performance[category].push(avgScore);
      }
    });

    // Calculate averages
    const result: CategoryPerformance = {};
    Object.keys(performance).forEach(category => {
      const scores = performance[category];
      result[category] = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    });

    return result;
  }, [getFilteredResults]);

  const getRiskTrendsData = useMemo((): RiskTrends => {
    const filteredResults = getFilteredResults;
    const riskCounts = { low: 0, medium: 0, high: 0 };

    filteredResults.forEach(result => {
      if (result.riskLevel) {
        riskCounts[result.riskLevel]++;
      }
    });

    const total = filteredResults.length;
    return {
      low: total > 0 ? (riskCounts.low / total) * 100 : 0,
      medium: total > 0 ? (riskCounts.medium / total) * 100 : 0,
      high: total > 0 ? (riskCounts.high / total) * 100 : 0
    };
  }, [getFilteredResults]);

  const getInsights = useMemo(() => {
    const filteredResults = getFilteredResults;
    const insights = [];

    if (filteredResults.length >= 3) {
      const recent = filteredResults.slice(-3);
      const older = filteredResults.slice(0, -3);

      const recentAvg = calculateAverageScore(recent);
      const olderAvg = calculateAverageScore(older);

      if (recentAvg > olderAvg * 1.1) {
        insights.push({
          type: 'positive' as const,
          title: t('trends.insights.positive'),
          message: t('trends.insights.improvementMessage')
        });
      } else if (recentAvg < olderAvg * 0.9) {
        insights.push({
          type: 'warning' as const,
          title: t('trends.insights.warning'),
          message: t('trends.insights.warningMessage')
        });
      } else {
        insights.push({
          type: 'info' as const,
          title: t('trends.insights.info'),
          message: t('trends.insights.stableMessage')
        });
      }
    }

    return insights;
  }, [getFilteredResults, t]);

  // Helper methods for data processing
  const groupResultsByMonth = (results: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    results.forEach((result: any) => {
      const date = new Date(result.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(result);
    });
    return grouped;
  };

  const calculateAverageScore = (results: any[]) => {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((sum: number, result: any) => {
      const scores = Object.values(result.scores);
      const avgScore = (scores as any[]).reduce((s: number, score: any) => s + score.value, 0) / scores.length;
      return sum + avgScore;
    }, 0);
    return totalScore / results.length;
  };

  const exportTrendsReport = useCallback(() => {
    try {
      const filteredResults = getFilteredResults;
      const report = {
        generatedAt: new Date().toISOString(),
        timeRange: currentRange ? `${currentRange} ${t('common.timeUnits.days')}` : t('trends.timeRange.allTime'),
        totalAssessments: filteredResults.length,
        trends: {
          overall: calculateAverageScore(filteredResults),
          categoryPerformance: getCategoryPerformanceData,
          riskTrends: getRiskTrendsData,
          insights: getInsights
        },
        rawData: filteredResults
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `mental-health-trends-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Export failed:', error);
      }
    }
  }, [getFilteredResults, currentRange, t, getCategoryPerformanceData, getRiskTrendsData, getInsights]);

  if (translationsLoading || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="w-6 h-6" />
        <span>{error}</span>
        <button className="btn btn-sm" onClick={loadTrends}>
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (results.length < 2) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('trends.noData.title')}</h2>
        <p className="text-gray-600">{t('trends.noData.message')}</p>
      </div>
    );
  }

  const trendData = getTrendData;
  const categoryPerformance = getCategoryPerformanceData;
  const riskTrends = getRiskTrendsData;
  const insights = getInsights;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`btn btn-sm ${currentRange === 30 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleRangeChange(30)}
        >
          {t('trends.timeRange.month')}
        </button>
        <button
          className={`btn btn-sm ${currentRange === 90 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleRangeChange(90)}
        >
          {t('trends.timeRange.quarter')}
        </button>
        <button
          className={`btn btn-sm ${currentRange === 365 ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleRangeChange(365)}
        >
          {t('trends.timeRange.year')}
        </button>
        <button
          className={`btn btn-sm ${currentRange === null ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleRangeChange(null)}
        >
          {t('trends.timeRange.allTime')}
        </button>
        <button className="btn btn-sm btn-outline ml-auto" onClick={exportTrendsReport}>
          <Download className="w-4 h-4 mr-2" />
          {t('common.export')}
        </button>
      </div>

      {/* Overall Trend */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t('trends.overall.title')}</h2>
          <div className="space-y-3">
            {trendData.map((data) => (
              <div key={data.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{data.month}</span>
                  <span className="font-medium">{data.avgScore.toFixed(1)}</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={Math.min(data.avgScore * 10, 100)}
                  max="100"
                ></progress>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t('trends.categories.title')}</h2>
          <div className="space-y-3">
            {Object.entries(categoryPerformance).map(([category, score]) => {
              const categoryName = category === 'mental_health' ? t('list.categories.mental_health') :
                                 category === 'personality' ? t('list.categories.personality') :
                                 category === 'stress' ? t('list.categories.stress') :
                                 category === 'mood' ? t('list.categories.mood') : category;

              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{categoryName}</span>
                    <span className="font-medium">{score.toFixed(1)}</span>
                  </div>
                  <progress
                    className="progress progress-secondary w-full"
                    value={Math.min(score * 10, 100)}
                    max="100"
                  ></progress>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Trends */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{t('trends.risk.title')}</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('common.riskLevels.low')}</span>
                <span className="font-medium">{riskTrends.low.toFixed(1)}%</span>
              </div>
              <progress className="progress progress-success w-full" value={riskTrends.low} max="100"></progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('common.riskLevels.medium')}</span>
                <span className="font-medium">{riskTrends.medium.toFixed(1)}%</span>
              </div>
              <progress className="progress progress-warning w-full" value={riskTrends.medium} max="100"></progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{t('common.riskLevels.high')}</span>
                <span className="font-medium">{riskTrends.high.toFixed(1)}%</span>
              </div>
              <progress className="progress progress-error w-full" value={riskTrends.high} max="100"></progress>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{t('trends.insights.title')}</h2>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`alert ${
                    insight.type === 'positive' ? 'alert-success' :
                    insight.type === 'warning' ? 'alert-warning' :
                    'alert-info'
                  }`}
                >
                  {insight.type === 'positive' ? <TrendingUp className="w-6 h-6" /> :
                   insight.type === 'warning' ? <TrendingDown className="w-6 h-6" /> :
                   <BarChart3 className="w-6 h-6" />}
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AssessmentTrendsClient;
