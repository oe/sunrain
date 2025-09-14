import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Clock, List, Play, Info } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { getDateLocale } from '@/utils/language';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { resourceRecommendationEngine } from '@/lib/assessment/ResourceRecommendationEngine';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import type { AssessmentResult, AssessmentType } from '@/types/assessment';
import ErrorHandler from './ErrorHandler';



export default function ResultsDisplay() {
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();
  const [resultId, setResultId] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [assessmentType, setAssessmentType] = useState<AssessmentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get result ID from URL hash
    const hash = window.location.hash.substring(1);

    if (hash) {
      setResultId(hash);
      loadResult(hash);
    } else {
      // Try to get from URL search params as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      const sessionId = urlParams.get('session');

      if (id) {
        setResultId(id);
        loadResult(id);
      } else if (sessionId) {
        // Try to find result by session ID
        loadResultBySessionId(sessionId);
      } else {
        // Try to get the latest result from session storage
        let latestResultId = sessionStorage.getItem('latest_assessment_result');

        // Fallback to localStorage backup
        if (!latestResultId) {
          try {
            latestResultId = localStorage.getItem('latest_assessment_result_backup');
          } catch (error) {
            // Ignore localStorage errors
          }
        }

        // Final fallback: get the most recent result
        if (!latestResultId) {
          try {
            const allResults = resultsAnalyzer.getAllResults();

            if (allResults.length > 0) {
              // Sort by completion date and get the most recent
              const sortedResults = allResults.sort((a, b) =>
                b.completedAt.getTime() - a.completedAt.getTime()
              );
              latestResultId = sortedResults[0].id;
            }
          } catch (error) {
            // Ignore errors when getting results
          }
        }

        if (latestResultId) {
          setResultId(latestResultId);
          loadResult(latestResultId);
        } else {
          setError('NO_RESULT_ID');
          setIsLoading(false);
        }
      }
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.substring(1);
      if (newHash && newHash !== resultId) {
        setResultId(newHash);
        loadResult(newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [resultId]);

  const loadResult = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load result from local storage
      let loadedResult = resultsAnalyzer.getResult(id);

      if (loadedResult) {
        setResult(loadedResult);

        // Get assessment type information
        const assessmentTypeData = questionBankManager.getAssessmentType(loadedResult.assessmentTypeId);
        setAssessmentType(assessmentTypeData);
        setResultId(loadedResult.id);
        setIsLoading(false);
        return;
      }

      // If not found in memory, try to reload from storage
      try {
        await resultsAnalyzer.reloadResultsFromStorage();
        loadedResult = resultsAnalyzer.getResult(id);

        if (loadedResult) {
          setResult(loadedResult);

          // Get assessment type information
          const assessmentTypeData = questionBankManager.getAssessmentType(loadedResult.assessmentTypeId);
          if (!assessmentTypeData) {
            throw new Error('ASSESSMENT_TYPE_NOT_FOUND');
          }

          setAssessmentType(assessmentTypeData);
          setResultId(loadedResult.id);
          setIsLoading(false);
          return;
        }
      } catch (storageError) {
        console.warn('Failed to reload from storage:', storageError);
      }

      // If still not found, wait a bit and try one more time
      // This handles cases where the result is still being saved
      await new Promise(resolve => setTimeout(resolve, 500));
      await resultsAnalyzer.reloadResultsFromStorage();
      loadedResult = resultsAnalyzer.getResult(id);

      if (loadedResult) {
        setResult(loadedResult);

        // Get assessment type information
        const assessmentTypeData = questionBankManager.getAssessmentType(loadedResult.assessmentTypeId);
        if (!assessmentTypeData) {
          throw new Error('ASSESSMENT_TYPE_NOT_FOUND');
        }

        setAssessmentType(assessmentTypeData);
        setResultId(loadedResult.id);
        setIsLoading(false);
        return;
      }

      throw new Error('RESULT_NOT_FOUND');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'LOAD_FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResultBySessionId = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get from memory
      let allResults = resultsAnalyzer.getAllResults();

      // If no results in memory, try to reload from localStorage
      if (allResults.length === 0) {
        try {
          resultsAnalyzer.reloadResultsFromStorage();
          allResults = resultsAnalyzer.getAllResults();
        } catch (storageError) {
          // Ignore storage reload errors
        }
      }

      const loadedResult = allResults.find(r => r.sessionId === sessionId);

      if (!loadedResult) {
        throw new Error('RESULT_NOT_FOUND');
      }

      setResult(loadedResult);
      setResultId(loadedResult.id);

      // Update URL to use result ID
      window.history.replaceState(null, '', `/assessment/results/#${loadedResult.id}`);

      // Get assessment type information
      const assessmentTypeData = questionBankManager.getAssessmentType(loadedResult.assessmentTypeId);
      if (!assessmentTypeData) {
        throw new Error('ASSESSMENT_TYPE_NOT_FOUND');
      }

      setAssessmentType(assessmentTypeData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'LOAD_FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const shareResults = async () => {
    if (!result || !assessmentType) return;

    const shareData = {
      title: `${assessmentType.name} - ${t('results.overallAssessment')}`,
      text: `I just completed ${assessmentType.name}, check out my results!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard');
      } catch (err) {
        // Failed to copy link
      }
    }
  };

  const saveToPDF = () => {
    // Simple implementation using browser print
    window.print();
  };

  const showNotification = (message: string) => {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Removed unused getRiskLevelBgColor function

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'immediate':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 'short_term':
        return <Clock className={`${iconClass} text-yellow-600`} />;
      case 'long_term':
        return <List className={`${iconClass} text-green-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const formatDate = (date: Date) => {
    const locale = getDateLocale();
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return t('time.minutesSeconds', { minutes, seconds: remainingSeconds });
  };

  if (translationsLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg mb-4"></span>
        <p className="text-gray-600 dark:text-gray-300">
          {t('results.loading')}
        </p>
      </div>
    );
  }

  // 错误代码到翻译键的映射
  const getErrorMessage = (errorCode: string) => {
    const errorMap: Record<string, string> = {
      'NO_RESULT_ID': 'results.noResultFound',
      'RESULT_NOT_FOUND': 'results.noResultFound',
      'ASSESSMENT_TYPE_NOT_FOUND': 'errors.noData',
      'LOAD_FAILED': 'results.loading'
    };
    return t(errorMap[errorCode] || 'errors.title');
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ErrorHandler
          error={new Error(getErrorMessage(error))}
          onRetry={() => {
            if (resultId) {
              loadResult(resultId);
            }
          }}
          t={t}
        />
        <div className="mt-6 space-x-4">
          <button
            onClick={() => window.location.href = '/assessment/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('results.actions.backToAssessments')}
          </button>
          <button
            onClick={() => window.location.href = '/assessment/history/'}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('results.actions.viewHistory')}
          </button>
        </div>
      </div>
    );
  }

  if (!result || !assessmentType) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">
          {t('results.noResultData')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Result Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {assessmentType.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('results.completedAt')}: {formatDate(result.completedAt)} |
          {t('results.timeSpent')}: {formatDuration(result.totalTimeSpent)}
        </p>
      </div>

      {/* Risk Alert */}
      {result.riskLevel && result.riskLevel !== 'low' && (
        <div className={`mb-8 p-4 rounded-lg border ${result.riskLevel === 'high'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold">
                {t(`results.riskLevels.${result.riskLevel}.title`)}
              </h3>
              <p className="text-sm mt-1">
                {t(`results.riskLevels.${result.riskLevel}.message`)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Scores Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('results.overallAssessment')}
            </h2>
            <div className="space-y-4">
              {Object.entries(result.scores).map(([scoreId, scoreData]) => (
                <div key={scoreId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{scoreId}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{(scoreData as any).description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getRiskLevelColor((scoreData as any).riskLevel)}`}>
                      {(scoreData as any).value}
                    </span>
                    <span className="block text-sm text-gray-600 dark:text-gray-300">
                      {(scoreData as any).label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('results.quickActions')}
            </h3>
            <div className="space-y-3">
              <button
                onClick={shareResults}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('results.actions.share')}
              </button>
              <button
                onClick={saveToPDF}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('results.actions.savePdf')}
              </button>
              <a
                href="/assessment/history/"
                className="block w-full px-4 py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('results.actions.viewHistory')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Interpretation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('results.detailedInterpretation')}
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {result.interpretation}
          </p>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('results.personalizedRecommendations')}
        </h2>
        <div className="space-y-4">
          {result.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t('results.recommendedResources')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resourceRecommendationEngine.getRecommendations(result, 6).map((rec, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {getResourceTypeIcon(rec.type)}
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{rec.title}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                  {t(`priority.${rec.priority}`)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{rec.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {rec.estimatedTimeCommitment || t('time.varies')}
                </span>
                <button
                  onClick={() => window.open(rec.resourceLinks[0]?.url || '#', '_blank')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('actions.viewDetails')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('results.nextSteps.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/assessment/" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <List className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('results.nextSteps.moreAssessments.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('results.nextSteps.moreAssessments.description')}
              </p>
            </div>
          </a>

          <a href="/practice" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <Play className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('results.nextSteps.startPractice.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('results.nextSteps.startPractice.description')}
              </p>
            </div>
          </a>

          <a href="/resources" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <List className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('results.nextSteps.browseResources.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('results.nextSteps.browseResources.description')}
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t('results.disclaimer.title')}
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t('results.disclaimer.message')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
