import { useState, useEffect, useCallback, memo } from 'react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import NavigationControls from './NavigationControls';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ErrorBoundary from './ErrorBoundary';
// 移除了复杂的性能监控工具，保持代码简洁
import type { AssessmentType, AssessmentSession, Question, AssessmentAnswer } from '@/types/assessment';
import type { Language } from '@sunrain/shared';

// Import assessment engine
let assessmentEngine: any = null;

const loadAssessmentEngine = async () => {
  if (typeof window !== 'undefined' && !assessmentEngine) {
    const module = await import('@/lib/assessment/AssessmentEngine');
    assessmentEngine = module.assessmentEngine;
  }
  return assessmentEngine;
};

export interface AssessmentTakerProps {
  assessmentId: string;
  assessmentData: AssessmentType;
  language?: Language;
  onComplete?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

// 简化状态管理 - 将相关状态分组
interface AssessmentSessionState {
  session: AssessmentSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: AssessmentAnswer[];
}

interface AssessmentUIState {
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  isSubmitting: boolean;
}

interface AssessmentModalState {
  isPaused: boolean;
  showPauseModal: boolean;
}

const AssessmentTaker = memo(function AssessmentTaker({
  assessmentId,
  assessmentData,
  language,
  onComplete,
  onError
}: AssessmentTakerProps) {
  const { t, isLoading: translationsLoading, changeLanguage } = useAssessmentTranslations();

  // 设置正确的语言
  useEffect(() => {
    if (language && changeLanguage) {
      changeLanguage(language);
    }
  }, [language, changeLanguage]);

  // 使用分离的状态管理，避免不必要的重渲染
  const [sessionState, setSessionState] = useState<AssessmentSessionState>({
    session: null,
    currentQuestion: null,
    currentQuestionIndex: 0,
    totalQuestions: 0,
    answers: []
  });

  const [uiState, setUIState] = useState<AssessmentUIState>({
    isLoading: true,
    error: null,
    isCompleted: false,
    isSubmitting: false
  });

  const [modalState, setModalState] = useState<AssessmentModalState>({
    isPaused: false,
    showPauseModal: false
  });



  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  // Initialize assessment session
  useEffect(() => {
    initializeAssessment();
  }, [assessmentId]);

  const initializeAssessment = useCallback(async () => {
    try {
      setUIState(prev => ({ ...prev, isLoading: true, error: null }));

      const engine = await loadAssessmentEngine();

      if (!engine) {
        throw new Error(t('errors.initializationFailed'));
      }

      // Check for existing active session
      const activeSessions = engine.getActiveSessions();
      const existingSession = activeSessions.find((s: AssessmentSession) =>
        s.assessmentTypeId === assessmentId
      );

      let session: AssessmentSession;
      if (existingSession) {
        // Resume existing session
        session = engine.resumeAssessment(existingSession.id);
      } else {
        // Start new session
        try {
          session = engine.startAssessment(assessmentId, language || 'zh');
        } catch (error: any) {
          if (error.type === 'SESSION_ALREADY_EXISTS') {
            // This shouldn't happen since we checked above, but handle it gracefully
            const activeSession = engine.getActiveSessions().find((s: AssessmentSession) =>
              s.assessmentTypeId === assessmentId
            );
            if (activeSession) {
              session = engine.resumeAssessment(activeSession.id);
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      if (!session) {
        throw new Error(t('errors.sessionStartFailed'));
      }

      // Import questionBankManager to get consistent question data
      const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
      const assessmentType = questionBankManager.getAssessmentType(assessmentId);
      const allAssessmentTypes = questionBankManager.getAssessmentTypes();

      console.log('QuestionBankManager debug:', {
        assessmentId,
        assessmentType: assessmentType,
        allAssessmentTypes: allAssessmentTypes.map(a => ({ id: a.id, name: a.name, questionCount: a.questions?.length })),
        firstQuestionFromManager: assessmentType?.questions?.[0],
        firstQuestionFromProps: assessmentData.questions?.[0]
      });

      const questions = assessmentType?.questions || assessmentData.questions;
      const currentQuestion = questions[session.currentQuestionIndex];

      console.log('Initializing assessment:', {
        assessmentId,
        sessionIndex: session.currentQuestionIndex,
        totalQuestions: questions.length,
        currentQuestion: currentQuestion,
        questionOptions: currentQuestion?.options,
        usingEngineData: !!assessmentType,
        assessmentDataQuestions: assessmentData.questions?.length
      });

      setSessionState({
        session,
        currentQuestion,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: questions.length,
        answers: session.answers
      });

      setUIState(prev => ({ ...prev, isLoading: false }));

      // Load existing answer if resuming
      if (session.answers.length > session.currentQuestionIndex) {
        const existingAnswer = session.answers[session.currentQuestionIndex];
        setCurrentAnswer(existingAnswer.value);
      }

    } catch (error) {
      console.error('AssessmentTaker: Initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : t('errors.initializationFailed');
      setUIState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [assessmentId, assessmentData, language, t, onError]);

  const handleAnswerChange = useCallback((value: any) => {
    setCurrentAnswer(value);
    setValidationError(null);
  }, []);

  const validateAnswer = useCallback((): boolean => {
    if (!sessionState.currentQuestion) return false;

    if (sessionState.currentQuestion.required) {
      if (currentAnswer === null || currentAnswer === undefined || currentAnswer === '') {
        setValidationError(t('execution.errors.required'));
        return false;
      }

      // Additional validation for single_choice questions
      if (sessionState.currentQuestion.type === 'single_choice' && sessionState.currentQuestion.options) {
        const validOptionIds = sessionState.currentQuestion.options.map(opt => opt.id);
        const validOptionValues = sessionState.currentQuestion.options.map(opt => opt.value);

        if (!validOptionIds.includes(currentAnswer) && !validOptionValues.includes(currentAnswer)) {
          setValidationError(t('execution.errors.required'));
          return false;
        }
      }

      // Additional validation for different question types
      if (sessionState.currentQuestion.type === 'scale') {
        const numValue = Number(currentAnswer);
        if (isNaN(numValue) || numValue < (sessionState.currentQuestion.scaleMin || 0) || numValue > (sessionState.currentQuestion.scaleMax || 10)) {
          setValidationError(t('execution.errors.required'));
          return false;
        }
      }
    }

    return true;
  }, [sessionState.currentQuestion, currentAnswer, t]);

  const saveAnswer = useCallback(async () => {
    if (!sessionState.session || !sessionState.currentQuestion) return false;

    try {
      const engine = await loadAssessmentEngine();
      if (!engine) throw new Error('Assessment engine not available');

      // Get the complete question data from questionBankManager
      const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
      const assessmentType = questionBankManager.getAssessmentType(assessmentId);
      const completeQuestion = assessmentType?.questions?.find(q => q.id === sessionState.currentQuestion.id) || sessionState.currentQuestion;

      const answer: AssessmentAnswer = {
        questionId: completeQuestion.id,
        value: currentAnswer,
        answeredAt: new Date()
      };

      console.log('Saving answer with complete question data:', {
        sessionId: sessionState.session.id,
        questionId: completeQuestion.id,
        questionType: completeQuestion.type,
        answer: currentAnswer,
        required: completeQuestion.required,
        options: completeQuestion.options,
        originalQuestionHadOptions: !!sessionState.currentQuestion.options,
        completeQuestionHasOptions: !!completeQuestion.options
      });

      const result = await engine.submitAnswer(sessionState.session.id, currentAnswer);

      console.log('Submit result:', result);

      if (result.success) {
        setSessionState(prev => ({
          ...prev,
          answers: [...prev.answers.filter(a => a.questionId !== answer.questionId), answer]
        }));
      } else {
        console.error('Submit failed - validation or other error. Answer:', currentAnswer, 'Complete question options:', completeQuestion.options);
      }

      return result.success;
    } catch (error) {
      console.error('Failed to save answer:', error);
      return false;
    }
  }, [sessionState.session, sessionState.currentQuestion, currentAnswer, assessmentId]);

  const handleNext = useCallback(async () => {
    if (!validateAnswer()) return;

    const saved = await saveAnswer();
    if (!saved) {
      setValidationError(t('execution.errors.submitFailed'));
      return;
    }

    const nextIndex = sessionState.currentQuestionIndex + 1;

    if (nextIndex >= sessionState.totalQuestions) {
      // Assessment is completed - the engine should have marked it as completed
      await handleComplete();
    } else {
      // Move to next question - use consistent data source
      const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
      const assessmentType = questionBankManager.getAssessmentType(assessmentId);
      const questions = assessmentType?.questions || assessmentData.questions;
      const nextQuestion = questions[nextIndex];

      setSessionState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        currentQuestionIndex: nextIndex
      }));

      // Load existing answer for next question
      const existingAnswer = sessionState.answers.find(a => a.questionId === nextQuestion.id);
      setCurrentAnswer(existingAnswer?.value || null);
      setValidationError(null);
    }
  }, [validateAnswer, saveAnswer, sessionState.currentQuestionIndex, sessionState.totalQuestions, sessionState.answers, assessmentData.questions]);

  const handlePrevious = useCallback(async () => {
    if (sessionState.currentQuestionIndex <= 0) return;

    // Save current answer before moving
    await saveAnswer();

    const prevIndex = sessionState.currentQuestionIndex - 1;
    // Use consistent data source
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    const assessmentType = questionBankManager.getAssessmentType(assessmentId);
    const questions = assessmentType?.questions || assessmentData.questions;
    const prevQuestion = questions[prevIndex];

    setSessionState(prev => ({
      ...prev,
      currentQuestion: prevQuestion,
      currentQuestionIndex: prevIndex
    }));

    // Load existing answer for previous question
    const existingAnswer = sessionState.answers.find(a => a.questionId === prevQuestion.id);
    setCurrentAnswer(existingAnswer?.value || null);
    setValidationError(null);
  }, [sessionState.currentQuestionIndex, sessionState.answers, assessmentData.questions, saveAnswer]);

  const handleSave = useCallback(async () => {
    const saved = await saveAnswer();
    if (saved) {
      // Show temporary success message
      // You could add a toast notification here
    } else {
      setValidationError(t('execution.errors.submitFailed'));
    }
  }, [saveAnswer, t]);

  const handlePause = useCallback(() => {
    setModalState({ showPauseModal: true, isPaused: true });
  }, []);

  const handleContinue = useCallback(() => {
    setModalState({ showPauseModal: false, isPaused: false });
  }, []);

  const handleExit = useCallback(async () => {
    if (sessionState.session) {
      try {
        const engine = await loadAssessmentEngine();
        if (engine) {
          engine.pauseAssessment(sessionState.session.id);
        }
      } catch (error) {
        console.error('Failed to pause assessment:', error);
      }
    }

    // Navigate back to assessment list
    window.location.href = '/assessment/';
  }, [sessionState.session]);

  const handleComplete = useCallback(async () => {
    if (!sessionState.session) return;

    setUIState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const engine = await loadAssessmentEngine();
      if (!engine) throw new Error('Assessment engine not available');

      // The assessment should already be completed by the last submitAnswer call
      // Wait a moment for the result to be processed and saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try multiple methods to get the result ID
      let resultId = sessionStorage.getItem('latest_assessment_result');

      if (!resultId) {
        try {
          resultId = localStorage.getItem('latest_assessment_result_backup');
        } catch (error) {
          console.warn('Failed to get backup result ID:', error);
        }
      }

      // If still no result ID, try to find by session
      if (!resultId) {
        try {
          const { resultsAnalyzer } = await import('@/lib/assessment/ResultsAnalyzer');
          const allResults = resultsAnalyzer.getAllResults();
          const sessionResult = allResults.find(r => r.sessionId === sessionState.session.id);
          if (sessionResult) {
            resultId = sessionResult.id;
            console.log('Found result by session ID:', resultId);
          }
        } catch (error) {
          console.warn('Failed to find result by session:', error);
        }
      }

      setUIState(prev => ({ ...prev, isCompleted: true }));
      onComplete?.(sessionState.session.id);

      // Navigate to results page
      setTimeout(() => {
        if (resultId) {
          console.log('Navigating to results with ID:', resultId);
          window.location.href = `/assessment/results/#${resultId}`;
        } else {
          console.log('Navigating to results with session fallback');
          window.location.href = `/assessment/results/?session=${sessionState.session.id}`;
        }
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('execution.errors.submitFailed');
      setUIState(prev => ({ ...prev, error: errorMessage, isSubmitting: false }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [sessionState.session, onComplete, onError, t]);



  const getProgressPercentage = useCallback((): number => {
    if (sessionState.totalQuestions === 0) return 0;
    return Math.round(((sessionState.currentQuestionIndex + 1) / sessionState.totalQuestions) * 100);
  }, [sessionState.currentQuestionIndex, sessionState.totalQuestions]);

  // Show loading state
  if (translationsLoading || uiState.isLoading) {
    return (
      <LoadingSpinner
        message={translationsLoading ? '加载语言包...' : t('loading.assessment')}
        size="large"
        t={t}
      />
    );
  }

  // Show error state
  if (uiState.error) {
    return (
      <ErrorDisplay
        title={t('errors.title')}
        message={uiState.error}
        onRetry={initializeAssessment}
        onGoBack={() => window.location.href = '/assessment/'}
        showRetry={true}
        showGoBack={true}
        t={t}
      />
    );
  }

  // Show completion state
  if (uiState.isCompleted) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('execution.completion.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('execution.completion.message')}</p>
        </div>
        <LoadingSpinner size="medium" t={t} />
      </div>
    );
  }

  if (!sessionState.currentQuestion) {
    return (
      <ErrorDisplay
        title={t('errors.title')}
        message={t('errors.noData')}
        onRetry={initializeAssessment}
        showRetry={true}
        t={t}
      />
    );
  }

  return (
    <ErrorBoundary t={t}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar Component */}
        <ProgressBar
          current={sessionState.currentQuestionIndex}
          total={sessionState.totalQuestions}
          percentage={getProgressPercentage()}
          assessmentName={assessmentData.name}
          isPaused={modalState.isPaused}
          isCompleted={uiState.isCompleted}
          onPause={handlePause}
          showPauseButton={true}
          t={t}
        />

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t('question.number', { number: sessionState.currentQuestionIndex + 1 })}
              </span>
              {sessionState.currentQuestion.required && (
                <span className="text-sm text-red-500">
                  * {t('question.required')}
                </span>
              )}
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
              {sessionState.currentQuestion.text}
            </h2>
          </div>

          {/* Question Card Component */}
          <div className="mb-4">
            <QuestionCard
              question={sessionState.currentQuestion}
              answer={currentAnswer}
              onAnswerChange={handleAnswerChange}
              onValidationChange={() => {
                // Disable QuestionCard validation, use AssessmentTaker validation instead
              }}
              disabled={uiState.isSubmitting}
              showValidation={false}
              enableRealtimeValidation={false}
              t={t}
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
            </div>
          )}
        </div>

        {/* Navigation Controls Component */}
        <NavigationControls
          canGoBack={sessionState.currentQuestionIndex > 0}
          canGoNext={currentAnswer !== null && currentAnswer !== undefined && currentAnswer !== ''}
          isLastQuestion={sessionState.currentQuestionIndex === sessionState.totalQuestions - 1}
          isSubmitting={uiState.isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSave={handleSave}
          showSaveButton={true}
          t={t}
        />

        {/* Pause Modal */}
        {modalState.showPauseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('execution.pauseModal.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('execution.pauseModal.message')}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleContinue}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('execution.pauseModal.continue')}
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('execution.pauseModal.exit')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

export default AssessmentTaker;
