import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
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
  const { t, isLoading: translationsLoading } = useTranslations('assessment');

  // 缓存常用翻译，避免重复调用
  const translations = useRef({
    loading: '',
    initializationFailed: '',
    sessionStartFailed: '',
    submitFailed: '',
    title: '',
    noData: '',
    required: '',
    questionNumber: '',
    questionRequired: '',
    completionTitle: '',
    completionMessage: '',
    pauseTitle: '',
    pauseMessage: '',
    pauseContinue: '',
    pauseExit: ''
  });

  // 更新翻译缓存
  useEffect(() => {
    if (!translationsLoading) {
      translations.current = {
        loading: t('client.loading.assessment') || '正在加载评测...',
        initializationFailed: t('client.errors.initializationFailed') || '初始化失败',
        sessionStartFailed: t('client.errors.sessionStartFailed') || '无法启动评测会话',
        submitFailed: t('execution.errors.submitFailed') || '提交失败',
        title: t('client.errors.title') || '错误',
        noData: t('client.errors.noData') || '评测数据加载失败',
        required: t('execution.errors.required') || '此项为必填项',
        questionNumber: t('client.question.number') || '问题 {number}',
        questionRequired: t('client.question.required') || '必填',
        completionTitle: t('execution.completion.title') || '评测完成',
        completionMessage: t('execution.completion.message') || '正在生成结果...',
        pauseTitle: t('execution.pauseModal.title') || '暂停评测',
        pauseMessage: t('execution.pauseModal.message') || '您确定要暂停评测吗？',
        pauseContinue: t('execution.pauseModal.continue') || '继续',
        pauseExit: t('execution.pauseModal.exit') || '退出'
      };
    }
  }, [translationsLoading, t]);

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
        throw new Error(translations.current.initializationFailed);
      }

      // Try to resume existing session first
      const activeSessions = engine.getActiveSessions();

      const existingSession = activeSessions.find((s: AssessmentSession) =>
        s.assessmentTypeId === assessmentId
      );

      let session: AssessmentSession;
      if (existingSession) {
        session = engine.resumeAssessment(existingSession.id);
      } else {
        session = engine.startAssessment(assessmentId, language || 'zh');
      }

      if (!session) {
        throw new Error(translations.current.sessionStartFailed);
      }

      const questions = assessmentData.questions;
      const currentQuestion = questions[session.currentQuestionIndex];

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
      const errorMessage = error instanceof Error ? error.message : translations.current.initializationFailed;
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
        setValidationError(translations.current.required);
        return false;
      }

      // Additional validation for different question types
      if (sessionState.currentQuestion.type === 'scale') {
        const numValue = Number(currentAnswer);
        if (isNaN(numValue) || numValue < (sessionState.currentQuestion.scaleMin || 0) || numValue > (sessionState.currentQuestion.scaleMax || 10)) {
          setValidationError(translations.current.required);
          return false;
        }
      }
    }

    return true;
  }, [sessionState.currentQuestion, currentAnswer]);

  const saveAnswer = useCallback(async () => {
    if (!sessionState.session || !sessionState.currentQuestion) return false;

    try {
      const engine = await loadAssessmentEngine();
      if (!engine) throw new Error('Assessment engine not available');

      const answer: AssessmentAnswer = {
        questionId: sessionState.currentQuestion.id,
        value: currentAnswer,
        answeredAt: new Date()
      };

      const result = engine.submitAnswer(sessionState.session.id, answer);
      if (result.success) {
        setSessionState(prev => ({
          ...prev,
          answers: [...prev.answers.filter(a => a.questionId !== answer.questionId), answer]
        }));
      }

      return result.success;
    } catch (error) {
      console.error('Failed to save answer:', error);
      return false;
    }
  }, [sessionState.session, sessionState.currentQuestion, currentAnswer]);

  const handleNext = useCallback(async () => {
    if (!validateAnswer()) return;

    const saved = await saveAnswer();
    if (!saved) {
      setValidationError(translations.current.submitFailed);
      return;
    }

    const nextIndex = sessionState.currentQuestionIndex + 1;

    if (nextIndex >= sessionState.totalQuestions) {
      // Assessment is completed - the engine should have marked it as completed
      await handleComplete();
    } else {
      // Move to next question
      const nextQuestion = assessmentData.questions[nextIndex];
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
    const prevQuestion = assessmentData.questions[prevIndex];

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
      setValidationError(translations.current.submitFailed);
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
      // Just mark it as completed in our state
      setUIState(prev => ({ ...prev, isCompleted: true }));
      onComplete?.(sessionState.session.id);

      // Navigate to results page after a short delay
      setTimeout(() => {
        window.location.href = `/assessment/results/#${sessionState.session.id}`;
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translations.current.submitFailed;
      setUIState(prev => ({ ...prev, error: errorMessage, isSubmitting: false }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [sessionState.session, onComplete, onError]);



  const getProgressPercentage = useCallback((): number => {
    if (sessionState.totalQuestions === 0) return 0;
    return Math.round(((sessionState.currentQuestionIndex + 1) / sessionState.totalQuestions) * 100);
  }, [sessionState.currentQuestionIndex, sessionState.totalQuestions]);

  // Show loading state
  if (translationsLoading || uiState.isLoading) {
    return (
      <LoadingSpinner
        message={translationsLoading ? '加载语言包...' : translations.current.loading}
        size="large"
        t={t}
      />
    );
  }

  // Show error state
  if (uiState.error) {
    return (
      <ErrorDisplay
        title={translations.current.title}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{translations.current.completionTitle}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{translations.current.completionMessage}</p>
        </div>
        <LoadingSpinner size="medium" t={t} />
      </div>
    );
  }

  if (!sessionState.currentQuestion) {
    return (
      <ErrorDisplay
        title={translations.current.title}
        message={translations.current.noData}
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
              {translations.current.questionNumber.replace('{number}', String(sessionState.currentQuestionIndex + 1))}
            </span>
            {sessionState.currentQuestion.required && (
              <span className="text-sm text-red-500">
                * {translations.current.questionRequired}
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
            onValidationChange={(isValid, error) => {
              if (!isValid && error) {
                setValidationError(Array.isArray(error) ? error.join(', ') : error);
              } else {
                setValidationError(null);
              }
            }}
            disabled={uiState.isSubmitting}
            showValidation={true}
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
              {translations.current.pauseTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {translations.current.pauseMessage}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleContinue}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {translations.current.pauseContinue}
              </button>
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {translations.current.pauseExit}
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
