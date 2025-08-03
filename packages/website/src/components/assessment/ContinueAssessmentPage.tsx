import { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentSession } from '@/types/assessment';

// Import the assessment engine - we'll use the singleton instance
let assessmentEngine: any = null;
let questionBankManager: any = null;

// Dynamically import the modules to avoid SSR issues
const loadModules = async () => {
  if (typeof window !== 'undefined' && (!assessmentEngine || !questionBankManager)) {
    const engineModule = await import('@/lib/assessment/AssessmentEngine');
    const questionModule = await import('@/lib/assessment/QuestionBankManager');
    assessmentEngine = engineModule.assessmentEngine;
    questionBankManager = questionModule.questionBankManager;
  }
  return { assessmentEngine, questionBankManager };
};

interface ContinueAssessmentPageProps {
  className?: string;
}

export default function ContinueAssessmentPage({ className = '' }: ContinueAssessmentPageProps) {
  const [activeSessions, setActiveSessions] = useState<AssessmentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();

  useEffect(() => {
    initializeInterface();
  }, []);

  const initializeInterface = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load modules first
      const { assessmentEngine: engine } = await loadModules();

      if (!engine) {
        throw new Error('Assessment engine not available');
      }

      // Get active and paused sessions
      const sessions = [
        ...engine.getActiveSessions(),
        ...engine.getAllSessions().filter((s: AssessmentSession) => s.status === 'paused')
      ];

      setActiveSessions(sessions || []);
    } catch (err) {
      console.error('Failed to load active sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const continueSession = async (sessionId: string) => {
    try {
      const { assessmentEngine: engine } = await loadModules();
      if (!engine) throw new Error('Assessment engine not available');

      const session = engine.resumeAssessment(sessionId);
      if (session) {
        // Redirect to assessment page
        window.location.href = `/assessment/take/${session.assessmentTypeId}/`;
      } else {
        showMessage('无法继续评测，请重试', 'error');
      }
    } catch (error) {
      console.error('Failed to continue session:', error);
      showMessage('继续评测失败，请重试', 'error');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (confirm('确定要删除这个未完成的评测吗？所有进度将丢失。')) {
      try {
        const { assessmentEngine: engine } = await loadModules();
        if (!engine) throw new Error('Assessment engine not available');

        const success = engine.deleteSession(sessionId);
        if (success) {
          // Remove from local array
          setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
          showMessage('评测已删除', 'success');
        } else {
          showMessage('删除失败，请重试', 'error');
        }
      } catch (error) {
        console.error('Failed to delete session:', error);
        showMessage('删除失败，请重试', 'error');
      }
    }
  };

  const clearAllSessions = async () => {
    if (confirm('确定要清除所有未完成的评测吗？所有进度将丢失。')) {
      try {
        const { assessmentEngine: engine } = await loadModules();
        if (!engine) throw new Error('Assessment engine not available');

        let deletedCount = 0;
        for (const session of activeSessions) {
          if (engine.deleteSession(session.id)) {
            deletedCount++;
          }
        }

        if (deletedCount > 0) {
          setActiveSessions([]);
          showMessage(`已清除 ${deletedCount} 个未完成的评测`, 'success');
        } else {
          showMessage('清除失败，请重试', 'error');
        }
      } catch (error) {
        console.error('Failed to clear all sessions:', error);
        showMessage('清除失败，请重试', 'error');
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
      type === 'success'
        ? 'bg-green-600 text-white'
        : type === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-blue-600 text-white'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  // Don't render anything while translations are loading
  if (translationsLoading) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{t('continue.loading')}</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-red-400 dark:text-red-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">加载失败</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">无法加载未完成的评测，请刷新页面重试</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          刷新页面
        </button>
      </div>
    );
  }

  // Show no sessions state
  if (activeSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          没有未完成的评测
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          您目前没有需要继续的评测
        </p>
        <a
          href="/assessment/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          开始新评测
          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Active Sessions List */}
      <div className="space-y-6">
        {activeSessions.map((session) => {
          const assessmentType = questionBankManager?.getAssessmentType(session.assessmentTypeId);
          const progress = assessmentEngine?.getProgress(session.id);

          const statusClass = session.status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          const statusText = session.status === 'active' ? '进行中' : '已暂停';

          return (
            <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assessmentType?.name || '未知评测'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {assessmentType?.description || ''}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                      </svg>
                      开始时间: {formatDate(session.startedAt)}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                      </svg>
                      已用时: {formatDuration(session.timeSpent)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => continueSession(session.id)}
                  >
                    继续评测
                  </button>
                  <button
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    onClick={() => deleteSession(session.id)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"></path>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('list.progress', { current: progress?.current || 0, total: progress?.total || 0 })}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {progress?.percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Answers Summary */}
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">已回答:</span> {session.answers.length} 题
                {progress?.estimatedTimeRemaining && (
                  <span className="ml-4">
                    <span className="font-medium">预计剩余:</span> {Math.round(progress.estimatedTimeRemaining / 60)} 分钟
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 text-center">
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a
            href="/assessment/"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            开始新评测
          </a>
          <button
            onClick={clearAllSessions}
            className="px-6 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            清除所有未完成评测
          </button>
        </div>
      </div>
    </div>
  );
}
