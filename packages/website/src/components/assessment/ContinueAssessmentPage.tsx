import { useState, useEffect } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentSession } from '@/types/assessment';
import { Play, Trash2, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

// Import the assessment engine - we'll use the singleton instance
let assessmentEngine: any = null;
let questionBankAdapter: any = null;

// Dynamically import the modules to avoid SSR issues
const loadModules = async () => {
  if (typeof window !== 'undefined' && (!assessmentEngine || !questionBankAdapter)) {
    const engineModule = await import('@/lib/assessment/AssessmentEngine');
    const adapterModule = await import('@/lib/assessment/QuestionBankAdapter');
    assessmentEngine = engineModule.assessmentEngine;
    questionBankAdapter = adapterModule.questionBankAdapter;
  }
  return { assessmentEngine, questionBankAdapter };
};

import type { ContinueAssessmentPageProps } from '@/types/assessment';

export default function ContinueAssessmentPage({ className = '', asWidget = false }: ContinueAssessmentPageProps) {
  const [activeSessions, setActiveSessions] = useState<AssessmentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, tString, isLoading: translationsLoading } = useAssessmentTranslations();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load active sessions:', err);
      }
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
        showMessage(tString('errors.cannotContinue'), 'error');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to continue session:', error);
      }
      showMessage(tString('errors.continueFailed'), 'error');
    }
  };

  const deleteSession = (sessionId: string) => {
    setDeleteSessionId(sessionId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (deleteSessionId) {
      try {
        const { assessmentEngine: engine } = await loadModules();
        if (!engine) throw new Error('Assessment engine not available');

        const success = engine.deleteSession(deleteSessionId);
        if (success) {
          // Remove from local array
          setActiveSessions(prev => prev.filter(s => s.id !== deleteSessionId));
          const deletedMessage = t('messages.deleted');
          showMessage(Array.isArray(deletedMessage) ? deletedMessage.join(', ') : deletedMessage, 'success');
        } else {
          const deleteFailedMessage = t('errors.deleteFailed');
          showMessage(Array.isArray(deleteFailedMessage) ? deleteFailedMessage.join(', ') : deleteFailedMessage, 'error');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to delete session:', error);
        }
        const deleteFailedMessage = t('errors.deleteFailed');
        showMessage(Array.isArray(deleteFailedMessage) ? deleteFailedMessage.join(', ') : deleteFailedMessage, 'error');
      }
    }
    setShowDeleteModal(false);
    setDeleteSessionId(null);
  };

  const cancelDeleteSession = () => {
    setShowDeleteModal(false);
    setDeleteSessionId(null);
  };

  const clearAllSessions = () => {
    setShowClearAllModal(true);
  };

  const confirmClearAllSessions = async () => {
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
        const clearedMessage = t('messages.clearedCount', { count: deletedCount });
        showMessage(Array.isArray(clearedMessage) ? clearedMessage.join(', ') : clearedMessage, 'success');
      } else {
        const clearFailedMessage = t('errors.clearFailed');
        showMessage(Array.isArray(clearFailedMessage) ? clearFailedMessage.join(', ') : clearFailedMessage, 'error');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to clear all sessions:', error);
      }
      const clearFailedMessage = t('errors.clearFailed');
      showMessage(Array.isArray(clearFailedMessage) ? clearFailedMessage.join(', ') : clearFailedMessage, 'error');
    }
    setShowClearAllModal(false);
  };

  const cancelClearAllSessions = () => {
    setShowClearAllModal(false);
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
      return t('time.minutesSeconds', { minutes, seconds: remainingSeconds });
    }
    return t('time.seconds', { seconds: remainingSeconds });
  };

  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Don't render anything while translations are loading
  if (translationsLoading) {
    return null;
  }

  // Widget mode - simple notification
  if (asWidget) {
    if (isLoading) {
      return (
        <div className={`animate-pulse bg-base-200 h-16 rounded-lg ${className}`}>
          <div className="flex items-center h-full px-4">
            <div className="w-5 h-5 bg-base-300 rounded mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-base-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );
    }

    // Don't render widget if there are no active sessions or if there's an error
    if (error || !activeSessions || activeSessions.length === 0) {
      return null;
    }

    return (
      <div className={`alert alert-info mb-8 ${className}`}>
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
    );
  }

  // Full page mode
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">{t('continue.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="w-6 h-6" />
        <div>
          <h2 className="font-bold">{t('errors.loadFailed')}</h2>
          <p>{t('errors.loadFailedMessage')}</p>
        </div>
        <button className="btn btn-sm" onClick={() => window.location.reload()}>
          {t('actions.refresh')}
        </button>
      </div>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {t('messages.noActiveSessions')}
        </h2>
        <p className="text-base-content/70 mb-6">
          {t('messages.noActiveSessionsMessage')}
        </p>
        <a href="/assessment/" className="btn btn-primary">
          {t('actions.startNew')}
          <Play className="w-4 h-4 ml-2" />
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toast notification */}
      {toastMessage && (
        <div className={`toast toast-top toast-end`}>
          <div className={`alert ${
            toastMessage.type === 'success' ? 'alert-success' :
            toastMessage.type === 'error' ? 'alert-error' :
            'alert-info'
          }`}>
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Active Sessions List */}
      <div className="space-y-6">
        {activeSessions.map((session) => {
          const assessmentType = questionBankAdapter?.getAssessmentType(session.assessmentTypeId);
          const progress = assessmentEngine?.getProgress(session.id);

          const statusBadge = session.status === 'active' ? 'badge-success' : 'badge-warning';
          const statusText = session.status === 'active' ? t('status.active') : t('status.paused');

          return (
            <div key={session.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="card-title">
                        {assessmentType?.name || t('labels.unknownAssessment')}
                      </h3>
                      <span className={`badge ${statusBadge} badge-sm`}>
                        {statusText}
                      </span>
                    </div>
                    <p className="text-base-content/70 mb-3">
                      {assessmentType?.description || ''}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-base-content/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t('labels.startTime')}: {formatDate(session.startedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t('labels.timeSpent')}: {formatDuration(session.timeSpent)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => continueSession(session.id)}
                    >
                      <Play className="w-4 h-4" />
                      {t('actions.continue')}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {t('list.progress', { current: progress?.current || 0, total: progress?.total || 0 })}
                    </span>
                    <span className="text-sm text-base-content/60">
                      {progress?.percentage || 0}%
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={progress?.percentage || 0}
                    max="100"
                  ></progress>
                </div>

                {/* Answers Summary */}
                <div className="text-sm text-base-content/70">
                  <span className="font-medium">{t('labels.answered')}:</span> {session.answers.length} {t('labels.questions')}
                  {progress?.estimatedTimeRemaining && (
                    <span className="ml-4">
                      <span className="font-medium">{t('labels.estimatedRemaining')}:</span> {Math.round(progress.estimatedTimeRemaining / 60)} {t('time.minutes')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <a href="/assessment/" className="btn btn-outline">
          {t('actions.startNew')}
        </a>
        <button onClick={clearAllSessions} className="btn btn-outline btn-error">
          {t('actions.clearAll')}
        </button>
      </div>

      {/* Delete Session Confirmation Modal */}
      <div className={`modal ${showDeleteModal ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {t('actions.confirmDelete')}
          </h3>
          <p className="py-4">
            {t('messages.deleteSessionMessage')}
          </p>
          <div className="modal-action">
            <button
              onClick={confirmDeleteSession}
              className="btn btn-error"
            >
              {t('common.delete')}
            </button>
            <button
              onClick={cancelDeleteSession}
              className="btn btn-outline"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Sessions Confirmation Modal */}
      <div className={`modal ${showClearAllModal ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {t('actions.confirmClearAll')}
          </h3>
          <p className="py-4">
            {t('messages.clearAllSessionsMessage')}
          </p>
          <div className="modal-action">
            <button
              onClick={confirmClearAllSessions}
              className="btn btn-error"
            >
              {t('common.clearAll')}
            </button>
            <button
              onClick={cancelClearAllSessions}
              className="btn btn-outline"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
