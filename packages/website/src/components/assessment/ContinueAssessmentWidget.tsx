import { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentSession } from '@/types/assessment';

// Import the assessment engine - we'll use the singleton instance
let assessmentEngine: any = null;

// Dynamically import the assessment engine to avoid SSR issues
const loadAssessmentEngine = async () => {
  if (typeof window !== 'undefined' && !assessmentEngine) {
    const module = await import('@/lib/assessment/AssessmentEngine');
    assessmentEngine = module.assessmentEngine;
  }
  return assessmentEngine;
};

interface ContinueAssessmentWidgetProps {
  className?: string;
}

export default function ContinueAssessmentWidget({ className = '' }: ContinueAssessmentWidgetProps) {
  const [activeSessions, setActiveSessions] = useState<AssessmentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();

  useEffect(() => {
    loadActiveSessions();
  }, []);

  const loadActiveSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const engine = await loadAssessmentEngine();
      if (!engine) {
        throw new Error('Assessment engine not available');
      }

      const sessions = engine.getActiveSessions();
      setActiveSessions(sessions || []);
    } catch (err) {
      console.error('Failed to load active sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything while translations are loading
  if (translationsLoading) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg ${className}`}>
        <div className="flex items-center h-full px-4">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if there are no active sessions or if there's an error
  if (error || !activeSessions || activeSessions.length === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 ${className}`}>
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {t('list.activeSessions.title', { count: activeSessions.length })}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            <a
              href="/assessment/continue/"
              className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              {t('list.activeSessions.continueLink')}
            </a>
          </p>
        </div>
      </div>

      {/* Optional: Show session details */}
      {activeSessions.length === 1 && (
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
            <span>
              {t('list.activeSessions.lastActivity')}: {' '}
              {new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }).format(new Date(activeSessions[0].lastActivityAt))}
            </span>
            <span>
              {t('list.activeSessions.progress')}: {' '}
              {Math.round((activeSessions[0].currentQuestionIndex / (activeSessions[0].answers.length || 1)) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
