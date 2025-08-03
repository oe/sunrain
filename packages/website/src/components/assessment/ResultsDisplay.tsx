import React, { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import { resultsAnalyzer } from '@/lib/assessment/ResultsAnalyzer';
import { resourceRecommendationEngine } from '@/lib/assessment/ResourceRecommendationEngine';
import { questionBankManager } from '@/lib/assessment/QuestionBankManager';
import type { AssessmentResult, AssessmentType } from '@/types/assessment';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

interface ResultsDisplayProps {
  language: string;
}

export default function ResultsDisplay({ language: _language }: ResultsDisplayProps) {
  const { isLoading: translationsLoading } = useAssessmentTranslations();
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
      if (id) {
        setResultId(id);
        loadResult(id);
      } else {
        setError('未找到结果ID');
        setIsLoading(false);
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
      const loadedResult = resultsAnalyzer.getResult(id);
      if (!loadedResult) {
        throw new Error('未找到评测结果');
      }

      setResult(loadedResult);

      // Get assessment type information
      const assessmentTypeData = questionBankManager.getAssessmentType(loadedResult.assessmentTypeId);
      if (!assessmentTypeData) {
        throw new Error('未找到评测类型信息');
      }

      setAssessmentType(assessmentTypeData);

    } catch (err) {
      console.error('Failed to load result:', err);
      setError(err instanceof Error ? err.message : '加载结果失败');
    } finally {
      setIsLoading(false);
    }
  };

  const shareResults = async () => {
    if (!result || !assessmentType) return;

    const shareData = {
      title: `${assessmentType.name} - 评测结果`,
      text: `我刚完成了${assessmentType.name}，查看我的结果！`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or not supported
        console.log('Share cancelled or not supported');
      }
    } else {
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('链接已复制到剪贴板');
      } catch (err) {
        console.error('Failed to copy link:', err);
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
        return (
          <svg className={`${iconClass} text-red-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'short_term':
        return (
          <svg className={`${iconClass} text-yellow-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'long_term':
        return (
          <svg className={`${iconClass} text-green-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
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
    return `${minutes}分${remainingSeconds}秒`;
  };

  if (translationsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <p className="ml-4 text-gray-600 dark:text-gray-300">
          正在加载评测结果...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ErrorDisplay
          message={error}
          onRetry={() => {
            if (resultId) {
              loadResult(resultId);
            }
          }}
        />
        <div className="mt-6 space-x-4">
          <button
            onClick={() => window.location.href = '/assessment/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            返回评测首页
          </button>
          <button
            onClick={() => window.location.href = '/assessment/history/'}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            查看历史记录
          </button>
        </div>
      </div>
    );
  }

  if (!result || !assessmentType) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">
          没有找到评测数据
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Result Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <svg className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {assessmentType.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          完成时间: {formatDate(result.completedAt)} |
          用时: {formatDuration(result.totalTimeSpent)}
        </p>
      </div>

      {/* Risk Alert */}
      {result.riskLevel && result.riskLevel !== 'low' && (
        <div className={`mb-8 p-4 rounded-lg border ${
          result.riskLevel === 'high'
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold">
                {result.riskLevel === 'high' ? '需要关注' : '建议关注'}
              </h3>
              <p className="text-sm mt-1">
                {result.riskLevel === 'high'
                  ? '您的评测结果显示可能需要专业帮助。建议咨询心理健康专家或拨打心理援助热线。'
                  : '您的评测结果显示有一些需要关注的方面。建议采取一些自我护理措施或考虑寻求支持。'
                }
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
              评测结果
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
              快速操作
            </h3>
            <div className="space-y-3">
              <button
                onClick={shareResults}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                分享结果
              </button>
              <button
                onClick={saveToPDF}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                保存为PDF
              </button>
              <a
                href="/assessment/history/"
                className="block w-full px-4 py-2 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                查看历史
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Interpretation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          详细解释
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
          个性化建议
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
          推荐资源
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
                  {rec.priority === 'high' ? '高优先级' :
                   rec.priority === 'medium' ? '中优先级' :
                   '低优先级'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{rec.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {rec.estimatedTimeCommitment || '时间不定'}
                </span>
                <button
                  onClick={() => window.open(rec.resourceLinks[0]?.url || '#', '_blank')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          下一步行动
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/assessment/" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                更多评测
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                探索其他评测工具
              </p>
            </div>
          </a>

          <a href="/practice" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                开始练习
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                尝试相关的心理练习
              </p>
            </div>
          </a>

          <a href="/resources" className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                浏览资源
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                查看疗愈资源库
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              重要提醒
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              此评测结果仅供参考，不能替代专业的心理健康诊断。如果您感到困扰或需要帮助，请咨询专业的心理健康专家。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
