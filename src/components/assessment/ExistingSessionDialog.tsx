import { useState } from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { ExistingSessionDialogProps } from '@/types/assessment';

export default function ExistingSessionDialog({
  existingSession,
  assessmentName,
  language,
  onContinue,
  onRestart,
  onCancel
}: ExistingSessionDialogProps) {
  const { t } = useAssessmentTranslations(language);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    try {
      onContinue();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setIsLoading(true);
    try {
      onRestart();
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getProgress = () => {
    // Estimate progress based on current question index
    // This is a simplified calculation - in a real implementation you'd get this from the assessment engine
    const totalQuestions = existingSession.answers.length + 10; // Rough estimate
    const currentQuestion = existingSession.currentQuestionIndex;
    return Math.round((currentQuestion / totalQuestions) * 100);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="avatar placeholder mr-4">
            <div className="bg-primary text-primary-content rounded-full w-12">
              <Info className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {t('existingSession.title')}
            </h3>
            <p className="text-sm opacity-70">
              {assessmentName}
            </p>
          </div>
        </div>

        {/* Session Info */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t('existingSession.progress')}
              </span>
              <span className="text-sm opacity-70">
                {getProgress()}%
              </span>
            </div>
            <progress className="progress progress-primary w-full mb-3" value={getProgress()} max="100"></progress>
            <div className="flex items-center justify-between text-xs opacity-60">
              <span>
                {t('existingSession.lastActivity')}: {formatDate(existingSession.lastActivityAt)}
              </span>
              <span>
                {t('existingSession.questionsAnswered')}: {existingSession.answers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="mb-6">
          {t('existingSession.message')}
        </p>

        {/* Actions */}
        <div className="modal-action">
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {t('common.loading')}
              </>
            ) : (
              t('existingSession.continue')
            )}
          </button>

          <button
            onClick={handleRestart}
            disabled={isLoading}
            className="btn btn-warning flex-1"
          >
            {t('existingSession.restart')}
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-outline"
          >
            {t('common.cancel')}
          </button>
        </div>

        {/* Warning for restart */}
        <div className="alert alert-warning mt-4">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm">
            {t('existingSession.restartWarning')}
          </span>
        </div>
      </div>
    </div>
  );
}
