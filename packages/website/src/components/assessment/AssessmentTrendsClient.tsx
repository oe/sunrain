import React, { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import type { Language } from '@sunrain/shared';

interface AssessmentTrendsClientProps {
  initialLang: Language;
}

export default function AssessmentTrendsClient({ initialLang }: AssessmentTrendsClientProps) {
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();
  const [currentRange, setCurrentRange] = useState<number | null>(365); // Default to 1 year
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeInterface();
  }, []);

  const initializeInterface = async () => {
    try {
      setIsLoading(true);
      // Load all results
      const allResults = resultsAnalyzer.getAllResults();
      setResults(allResults);
      setError(null);
    } catch (err) {
      console.error('Failed to load trends:', err);
      setError('Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Time range buttons
    document.querySelectorAll('.time-range-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        // Update active state
        document.querySelectorAll('.time-range-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');

        // Update range and re-render
        const range = target.dataset.range === 'all' ? null : parseInt(target.dataset.range || '365');
        setCurrentRange(range);
      });
    });

    // Export button
    const exportBtn = document.getElementById('export-trends-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportTrendsReport);
    }
  };

  const renderTrends = () => {
    const filteredResults = getFilteredResults();

    renderOverallTrend(filteredResults);
    renderFrequencyChart(filteredResults);
    renderRiskTrendChart(filteredResults);
    renderCategoryPerformance(filteredResults);
    generateInsights(filteredResults);
    updateStatistics(filteredResults);
  };

  const getFilteredResults = () => {
    if (!currentRange) return results;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentRange);

    return results.filter(result =>
      new Date(result.completedAt) >= cutoffDate
    );
  };

  const renderOverallTrend = (results: any[]) => {
    const container = document.getElementById('overall-trend-chart');
    if (!container) return;

    container.innerHTML = '';

    if (results.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 py-8">${t('common.loading')}</p>`;
      return;
    }

    // Group results by month
    const monthlyData = groupResultsByMonth(results);

    // Simple line chart representation
    const chartDiv = document.createElement('div');
    chartDiv.className = 'space-y-2';

    Object.entries(monthlyData).forEach(([month, monthResults]) => {
      const avgScore = calculateAverageScore(monthResults as any[]);
      const percentage = Math.min(avgScore * 10, 100); // Assuming max score of 10

      const barDiv = document.createElement('div');
      barDiv.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-600 dark:text-gray-300">${month}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">${avgScore.toFixed(1)}</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="h-2 rounded-full bg-blue-600" style="width: ${percentage}%"></div>
        </div>
      `;
      chartDiv.appendChild(barDiv);
    });

    container.appendChild(chartDiv);
  };

  const renderFrequencyChart = (results: any[]) => {
    const container = document.getElementById('frequency-chart');
    if (!container) return;

    container.innerHTML = '';

    const monthlyFrequency = getMonthlyFrequency(results);

    const chartDiv = document.createElement('div');
    chartDiv.className = 'space-y-2';

    Object.entries(monthlyFrequency).forEach(([month, count]) => {
      const maxCount = Math.max(...Object.values(monthlyFrequency) as number[]);
      const percentage = ((count as number) / maxCount) * 100;

      const barDiv = document.createElement('div');
      barDiv.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-600 dark:text-gray-300">${month}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">${count} ${initialLang === 'zh' ? '次' : 'times'}</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="h-2 rounded-full bg-green-600" style="width: ${percentage}%"></div>
        </div>
      `;
      chartDiv.appendChild(barDiv);
    });

    container.appendChild(chartDiv);
  };

  const renderRiskTrendChart = (results: any[]) => {
    const container = document.getElementById('risk-trend-chart');
    if (!container) return;

    container.innerHTML = '';

    const riskTrends = getRiskTrends(results);

    const chartDiv = document.createElement('div');
    chartDiv.className = 'space-y-4';

    ['low', 'medium', 'high'].forEach(riskLevel => {
      const data = riskTrends[riskLevel] || [];
      const avgPercentage = data.length > 0 ?
        data.reduce((sum: number, val: number) => sum + val, 0) / data.length : 0;

      const color = riskLevel === 'low' ? 'green' :
                   riskLevel === 'medium' ? 'yellow' : 'red';

      const riskLevelText = riskLevel === 'low' ? t('common.riskLevels.low') :
                           riskLevel === 'medium' ? t('common.riskLevels.medium') :
                           t('common.riskLevels.high');

      const barDiv = document.createElement('div');
      barDiv.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            ${riskLevelText}
          </span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">${avgPercentage.toFixed(1)}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="h-2 rounded-full bg-${color}-600" style="width: ${avgPercentage}%"></div>
        </div>
      `;
      chartDiv.appendChild(barDiv);
    });

    container.appendChild(chartDiv);
  };

  const renderCategoryPerformance = (results: any[]) => {
    const container = document.getElementById('category-performance-chart');
    if (!container) return;

    container.innerHTML = '';

    const categoryPerformance = getCategoryPerformance(results);

    const chartDiv = document.createElement('div');
    chartDiv.className = 'space-y-2';

    Object.entries(categoryPerformance).forEach(([category, avgScore]) => {
      const percentage = Math.min((avgScore as number) * 10, 100);
      const categoryName = category === 'mental_health' ? t('list.categories.mental_health') :
                          category === 'personality' ? t('list.categories.personality') :
                          category === 'stress' ? t('list.categories.stress') :
                          category === 'mood' ? t('list.categories.mood') : category;

      const barDiv = document.createElement('div');
      barDiv.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-600 dark:text-gray-300">${categoryName}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">${(avgScore as number).toFixed(1)}</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="h-2 rounded-full bg-purple-600" style="width: ${percentage}%"></div>
        </div>
      `;
      chartDiv.appendChild(barDiv);
    });

    container.appendChild(chartDiv);
  };

  const generateInsights = (results: any[]) => {
    const container = document.getElementById('insights-container');
    if (!container) return;

    container.innerHTML = '';

    const insights = analyzeInsights(results);

    insights.forEach(insight => {
      const insightDiv = document.createElement('div');
      insightDiv.className = `p-4 rounded-lg border ${insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                                    insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                                                    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`;

      insightDiv.innerHTML = `
        <div class="flex items-start">
          <svg class="w-5 h-5 ${insight.type === 'positive' ? 'text-green-600 dark:text-green-400' :
                               insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                               'text-blue-600 dark:text-blue-400'} mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <h4 class="font-medium ${insight.type === 'positive' ? 'text-green-800 dark:text-green-200' :
                                   insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                                   'text-blue-800 dark:text-blue-200'}">${insight.title}</h4>
            <p class="text-sm ${insight.type === 'positive' ? 'text-green-700 dark:text-green-300' :
                               insight.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                               'text-blue-700 dark:text-blue-300'} mt-1">${insight.message}</p>
          </div>
        </div>
      `;

      container.appendChild(insightDiv);
    });
  };

  const updateStatistics = (results: any[]) => {
    const trends = calculateTrendStatistics(results);

    const improvementElement = document.getElementById('improvement-trend');
    const stableElement = document.getElementById('stable-dimensions');
    const attentionElement = document.getElementById('attention-needed');

    if (improvementElement) improvementElement.textContent = trends.improvement;
    if (stableElement) stableElement.textContent = trends.stable;
    if (attentionElement) attentionElement.textContent = trends.attention;
  };

  // Helper methods for data processing
  const groupResultsByMonth = (results: any[]) => {
    const grouped = {};
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

  const getMonthlyFrequency = (results: any[]) => {
    const frequency = {};
    results.forEach((result: any) => {
      const date = new Date(result.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      frequency[monthKey] = (frequency[monthKey] || 0) + 1;
    });
    return frequency;
  };

  const getRiskTrends = (results: any[]) => {
    const trends = { low: [], medium: [], high: [] };
    const monthlyData = groupResultsByMonth(results);

    Object.values(monthlyData).forEach(monthResults => {
      const riskCounts = { low: 0, medium: 0, high: 0 };
      (monthResults as any[]).forEach(result => {
        if (result.riskLevel) {
          riskCounts[result.riskLevel]++;
        }
      });

      const total = (monthResults as any[]).length;
      if (total > 0) {
        trends.low.push((riskCounts.low / total) * 100);
        trends.medium.push((riskCounts.medium / total) * 100);
        trends.high.push((riskCounts.high / total) * 100);
      }
    });

    return trends;
  };

  const getCategoryPerformance = (results: any[]) => {
    const performance = {};
    results.forEach((result: any) => {
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
    Object.keys(performance).forEach(category => {
      const scores = performance[category];
      performance[category] = scores.reduce((sum: number, score: any) => sum + score, 0) / scores.length;
    });

    return performance;
  };

  const analyzeInsights = (results: any[]) => {
    const insights = [];

    if (results.length >= 3) {
      const recent = results.slice(-3);
      const older = results.slice(0, -3);

      const recentAvg = calculateAverageScore(recent);
      const olderAvg = calculateAverageScore(older);

      if (recentAvg > olderAvg * 1.1) {
        insights.push({
          type: 'positive',
          title: t('trends.insights.positive'),
          message: t('trends.insights.positive')
        });
      } else if (recentAvg < olderAvg * 0.9) {
        insights.push({
          type: 'warning',
          title: t('trends.insights.warning'),
          message: t('trends.insights.warning')
        });
      } else {
        insights.push({
          type: 'info',
          title: t('trends.insights.info'),
          message: t('trends.insights.info')
        });
      }
    }

    // Assessment frequency insight
    const daysSinceFirst = (Date.now() - new Date(results[0].completedAt).getTime()) / (1000 * 60 * 60 * 24);
    const frequency = results.length / (daysSinceFirst / 30); // assessments per month

    if (frequency > 2) {
      insights.push({
        type: 'positive',
        title: t('trends.insights.positive'),
        message: t('trends.insights.positive')
      });
    } else if (frequency < 0.5) {
      insights.push({
        type: 'info',
        title: t('trends.insights.info'),
        message: t('trends.insights.info')
      });
    }

    return insights;
  };

  const calculateTrendStatistics = (results: any[]) => {
    if (results.length < 2) {
      return {
        improvement: t('trends.statistics.improvementTrend'),
        stable: t('trends.statistics.stableDimensions'),
        attention: t('trends.statistics.attentionNeeded')
      };
    }

    const recent = results.slice(-Math.ceil(results.length / 2));
    const older = results.slice(0, Math.floor(results.length / 2));

    let improving = 0, stable = 0, declining = 0;

    // Compare categories
    const categories = ['mental_health', 'personality', 'stress', 'mood'];
    categories.forEach(category => {
      const recentCat = recent.filter((r: any) => {
        const type = questionBankManager.getAssessmentType(r.assessmentTypeId);
        return type && type.category === category;
      });
      const olderCat = older.filter((r: any) => {
        const type = questionBankManager.getAssessmentType(r.assessmentTypeId);
        return type && type.category === category;
      });

      if (recentCat.length > 0 && olderCat.length > 0) {
        const recentAvg = calculateAverageScore(recentCat);
        const olderAvg = calculateAverageScore(olderCat);

        if (recentAvg > olderAvg * 1.05) improving++;
        else if (recentAvg < olderAvg * 0.95) declining++;
        else stable++;
      }
    });

    return {
      improvement: improving > 0 ? `${improving} ${t('history.list.dimensions')}` : t('trends.noData.message'),
      stable: stable > 0 ? `${stable} ${t('history.list.dimensions')}` : t('trends.noData.message'),
      attention: declining > 0 ? `${declining} ${t('history.list.dimensions')}` : t('trends.noData.message')
    };
  };

  const exportTrendsReport = () => {
    try {
      const filteredResults = getFilteredResults();
      const report = {
        generatedAt: new Date().toISOString(),
        timeRange: currentRange ? `${currentRange} ${t('common.timeUnits.days')}` : t('trends.timeRange.allTime'),
        totalAssessments: filteredResults.length,
        trends: {
          overall: calculateAverageScore(filteredResults),
          categoryPerformance: getCategoryPerformance(filteredResults),
          riskTrends: getRiskTrends(filteredResults),
          insights: analyzeInsights(filteredResults)
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

      showMessage(t('common.success'), 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showMessage(t('common.error'), 'error');
    }
  };

  const showMessage = (message: string, type: string = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      'bg-blue-600 text-white'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const showError = () => {
    const loadingElement = document.getElementById('trends-loading');
    if (loadingElement) loadingElement.classList.add('hidden');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-center py-12';
    errorDiv.innerHTML = `
      <svg class="w-16 h-16 text-red-400 dark:text-red-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${t('common.error')}</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6">${t('common.error')}</p>
      <button onclick="window.location.reload()" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        ${t('common.refresh')}
      </button>
    `;

    const mainContainer = document.querySelector('main .max-w-6xl');
    if (mainContainer) {
      mainContainer.appendChild(errorDiv);
    }
  };

  // Setup and manage component lifecycle
  useEffect(() => {
    if (isLoading || translationsLoading) return;

    // Hide loading
    const loadingElement = document.getElementById('trends-loading');
    if (loadingElement) loadingElement.classList.add('hidden');

    if (results.length < 2) {
      const noDataElement = document.getElementById('no-data-state');
      if (noDataElement) noDataElement.classList.remove('hidden');
      return;
    }

    // Show interface and render trends
    const interfaceElement = document.getElementById('trends-interface');
    if (interfaceElement) interfaceElement.classList.remove('hidden');

    setupEventListeners();
    renderTrends();

    if (error) {
      showError();
    }
  }, [isLoading, translationsLoading, results, error]);

  // Re-render when range changes
  useEffect(() => {
    if (!isLoading && !translationsLoading && results.length >= 2) {
      renderTrends();
    }
  }, [currentRange]);

  // This component doesn't render anything visible - it just manages the client-side functionality
  return null;
}
