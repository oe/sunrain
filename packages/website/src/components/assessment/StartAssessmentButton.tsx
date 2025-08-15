import { useState } from 'react';
import { Play } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { StartAssessmentButtonProps } from '@/types/assessment';
import ExistingSessionDialog from './ExistingSessionDialog';

export default function StartAssessmentButton({
  assessment,
  buttonText,
  language
}: StartAssessmentButtonProps) {
  const { t } = useAssessmentTranslations(language);
  const [showExistingSessionDialog, setShowExistingSessionDialog] = useState(false);
  const [existingSession, setExistingSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = async () => {
    setIsLoading(true);

    try {
      // Dynamically import the assessment engine to avoid SSR issues
      const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');

      // Check for existing active sessions
      const activeSessions = assessmentEngine.getActiveSessions();
      const existingSessionData = activeSessions.find((session: any) =>
        session.assessmentTypeId === assessment.id
      );

      if (existingSessionData) {
        // Show existing session dialog
        setExistingSession(existingSessionData);
        setShowExistingSessionDialog(true);
      } else {
        // Navigate directly to assessment
        window.location.href = `/assessment/take/${assessment.id}/`;
      }
    } catch (error) {
      console.error('Error checking for existing sessions:', error);
      // Fallback to direct navigation
      window.location.href = `/assessment/take/${assessment.id}/`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueExisting = () => {
    setShowExistingSessionDialog(false);
    window.location.href = `/assessment/take/${assessment.id}/`;
  };

  const handleRestartAssessment = async () => {
    try {
      // Dynamically import the assessment engine
      const { assessmentEngine } = await import('@/lib/assessment/AssessmentEngine');

      // Delete existing session
      assessmentEngine.deleteSession(existingSession.id);
      setShowExistingSessionDialog(false);
      window.location.href = `/assessment/take/${assessment.id}/`;
    } catch (error) {
      console.error('Error restarting assessment:', error);
      setShowExistingSessionDialog(false);
      window.location.href = `/assessment/take/${assessment.id}/`;
    }
  };

  const handleCancelDialog = () => {
    setShowExistingSessionDialog(false);
    setExistingSession(null);
  };

  return (
    <>
      <button
        onClick={handleStartClick}
        disabled={isLoading}
        className="btn btn-primary btn-lg w-full text-lg"
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-md"></span>
            {t('common.loading')}
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            {buttonText}
          </>
        )}
      </button>

      {/* Existing Session Dialog */}
      {showExistingSessionDialog && existingSession && (
        <ExistingSessionDialog
          existingSession={existingSession}
          assessmentName={assessment.name}
          language={language}
          onContinue={handleContinueExisting}
          onRestart={handleRestartAssessment}
          onCancel={handleCancelDialog}
        />
      )}
    </>
  );
}
