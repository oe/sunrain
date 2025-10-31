import { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentSession } from '@/types/assessment';
import { AlertCircle } from 'lucide-react';

// Remove the loadModules function - we'll import directly like StartAssessmentButton

export default function ContinueAssessmentWidget() {
  const [activeSessions, setActiveSessions] = useState<AssessmentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, isLoading: translationsLoading } = useAssessmentTranslations();

  useEffect(() => {
    // Only initialize once when component mounts
    if (typeof window !== 'undefined') {
      initializeInterface();
    }
  }, []);

  const initializeInterface = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Import assessment engine exactly like StartAssessmentButton does
      const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');
      
      if (!assessmentEngine) {
        throw new Error('Assessment engine not available');
      }

      // Wait for engine to finish loading sessions with retry logic
      console.log('ContinueAssessmentWidget: Waiting for engine to load sessions...');
      
      let retries = 0;
      const maxRetries = 10;
      let allSessions: any[] = [];
      
      while (retries < maxRetries) {
        allSessions = assessmentEngine.getAllSessions();
        console.log(`ContinueAssessmentWidget: Retry ${retries + 1}, sessions count:`, allSessions.length);
        
        // If we have sessions or we've tried enough times, break
        if (allSessions.length > 0 || retries >= maxRetries - 1) {
          break;
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      console.log('ContinueAssessmentWidget: Final sessions count:', allSessions.length);

      // Get active sessions (exactly same method as StartAssessmentButton)
      const activeSessions = assessmentEngine.getActiveSessions();
      console.log('ContinueAssessmentWidget: Active sessions from engine:', activeSessions.length, activeSessions);
      
      // Also get paused sessions
      const pausedSessions = allSessions.filter(session => session.status === 'paused');
      console.log('ContinueAssessmentWidget: Paused sessions from engine:', pausedSessions.length, pausedSessions);
      
      const sessions = [...activeSessions, ...pausedSessions];
      console.log('ContinueAssessmentWidget: Combined active + paused sessions:', sessions.length, sessions);

      setActiveSessions(sessions);
    } catch (err) {
      console.error('Failed to initialize continue assessment widget:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if translations are still loading or data is loading
  if (translationsLoading || isLoading) {
    return null;
  }

  // Don't render widget if there are no active sessions or if there's an error
  if (error || !activeSessions || activeSessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('continue.title')}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('continue.subtitle')}
        </div>
      </div>

      <div className="alert alert-info">
        <AlertCircle className="w-5 h-5" />
        <div className="flex-1">
          <h3 className="font-medium">
            {t('list.activeSessions.title', { count: activeSessions.length })}
          </h3>
          <p className="text-sm mt-1">
            <a
              href="/assessment/continue/"
              className="link link-hover"
            >
              {t('list.activeSessions.continueLink')}
            </a>
          </p>
        </div>
        {activeSessions.length === 1 && (
          <div className="text-xs opacity-70">
            <div>{t('list.activeSessions.progress')}: {Math.round((activeSessions[0].currentQuestionIndex / (activeSessions[0].answers.length || 1)) * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  );
}
