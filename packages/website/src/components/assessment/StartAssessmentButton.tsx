import { useState } from 'react';
import { Play } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import type { AssessmentType } from '@/types/assessment';
import ExistingSessionDialog from './ExistingSessionDialog';

interface StartAssessmentButtonProps {
  assessment: AssessmentType;
  buttonText: string;
  language: string;
}

export default function StartAssessmentButton({
  assessment,
  buttonText,
  language
}: StartAssessmentButtonProps) {
  const { t } = useAssessmentTranslations(language as any);
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
        className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            {t('common.loading')}
          </>
        ) : (
          <>
            <Play className="w-6 h-6 mr-3" />
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
