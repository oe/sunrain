import React, { useState, useEffect, useCallback, memo } from 'react';
import { CheckCircle } from 'lucide-react';
import { useAssessmentTranslations } from '@/hooks/useCSRTranslations';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import NavigationControls from './NavigationControls';
import ErrorHandler from './ErrorHandler';
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

// 简化状态管理 - 单一扁平状态结构
interface AssessmentState {
  // Session data
  session: AssessmentSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: AssessmentAnswer[];
  currentAnswer: any;

  // UI state
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  isSubmitting: boolean;
  validationError: string | null;

  // Modal state
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
  const { t, isLoading: translationsLoading } = useAssessmentTranslations(language);


  // 使用单一状态对象，简化状态管理
  const [state, setState] = useState<AssessmentState>({
    // Session data
    session: null,
    currentQuestion: null,
    currentQuestionIndex: 0,
    totalQuestions: 0,
    answers: [],
    currentAnswer: null,

    // UI state
    isLoading: true,
    error: null,
    isCompleted: false,
    isSubmitting: false,
    validationError: null,

    // Modal state
    isPaused: false,
    showPauseModal: false
  });

  const initializeAssessment = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

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

      // Debug info for development
      if (process.env.NODE_ENV === 'development') {
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
      }

      const questions = assessmentType?.questions || assessmentData.questions;
      const currentQuestion = questions[session.currentQuestionIndex];

      // Load existing answer if resuming
      const existingAnswer = session.answers.length > session.currentQuestionIndex
        ? session.answers[session.currentQuestionIndex].value
        : null;

      setState(prev => ({
        ...prev,
        session,
        currentQuestion,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: questions.length,
        answers: session.answers,
        currentAnswer: existingAnswer,
        isLoading: false
      }));

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('AssessmentTaker: Initialization error:', error);
      }
      const errorMessage = error instanceof Error ? error.message : t('errors.initializationFailed');
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [assessmentId, assessmentData, language, t, onError]);

  // Initialize assessment session
  useEffect(() => {
    initializeAssessment();
  }, [assessmentId, initializeAssessment]);

  const handleAnswerChange = useCallback((value: any) => {
    setState(prev => ({ ...prev, currentAnswer: value, validationError: null }));
  }, []);

  const validateAnswer = useCallback((): boolean => {
    if (!state.currentQuestion) return false;

    if (state.currentQuestion.required) {
      if (state.currentAnswer === null || state.currentAnswer === undefined || state.currentAnswer === '') {
        setState(prev => ({ ...prev, validationError: t('execution.errors.required') }));
        return false;
      }

      // Additional validation for single_choice questions
      if (state.currentQuestion.type === 'single_choice' && state.currentQuestion.options) {
        const validOptionIds = state.currentQuestion.options.map((opt: any) => opt.id);
        const validOptionValues = state.currentQuestion.options.map((opt: any) => opt.value);

        if (!validOptionIds.includes(state.currentAnswer) && !validOptionValues.includes(state.currentAnswer)) {
          setState(prev => ({ ...prev, validationError: t('execution.errors.required') }));
          return false;
        }
      }

      // Additional validation for different question types
      if (state.currentQuestion.type === 'scale') {
        const numValue = Number(state.currentAnswer);
        if (isNaN(numValue) || numValue < (state.currentQuestion.scaleMin || 0) || numValue > (state.currentQuestion.scaleMax || 10)) {
          setState(prev => ({ ...prev, validationError: t('execution.errors.required') }));
          return false;
        }
      }
    }

    return true;
  }, [state.currentQuestion, state.currentAnswer, t]);

  const saveAnswer = useCallback(async () => {
    if (!state.session || !state.currentQuestion) return false;

    try {
      const engine = await loadAssessmentEngine();
      if (!engine) throw new Error('Assessment engine not available');

      // Get the complete question data from questionBankManager
      const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
      const assessmentType = questionBankManager.getAssessmentType(assessmentId);
      const completeQuestion = assessmentType?.questions?.find(q => q.id === state.currentQuestion.id) || state.currentQuestion;

      const answer: AssessmentAnswer = {
        questionId: completeQuestion.id,
        value: state.currentAnswer,
        answeredAt: new Date()
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Saving answer with complete question data:', {
          sessionId: state.session.id,
          questionId: completeQuestion.id,
          questionType: completeQuestion.type,
          answer: state.currentAnswer,
          required: completeQuestion.required,
          options: completeQuestion.options,
          originalQuestionHadOptions: !!state.currentQuestion.options,
          completeQuestionHasOptions: !!completeQuestion.options
        });
      }

      const result = await engine.submitAnswer(state.session.id, state.currentAnswer);

      if (process.env.NODE_ENV === 'development') {
        console.log('Submit result:', result);
      }

      if (result.success) {
        setState(prev => ({
          ...prev,
          answers: [...prev.answers.filter(a => a.questionId !== answer.questionId), answer]
        }));
      } else if (process.env.NODE_ENV === 'development') {
        console.error('Submit failed - validation or other error. Answer:', state.currentAnswer, 'Complete question options:', completeQuestion.options);
      }

      return result.success;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save answer:', error);
      }
      return false;
    }
  }, [state.session, state.currentQuestion, state.currentAnswer, assessmentId]);

  const handleNext = useCallback(async () => {
    if (!validateAnswer()) return;

    const saved = await saveAnswer();
    if (!saved) {
      setState(prev => ({ ...prev, validationError: t('execution.errors.submitFailed') }));
      return;
    }

    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex >= state.totalQuestions) {
      // Assessment is completed - the engine should have marked it as completed
      await handleComplete();
    } else {
      // Move to next question - use consistent data source
      const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
      const assessmentType = questionBankManager.getAssessmentType(assessmentId);
      const questions = assessmentType?.questions || assessmentData.questions;
      const nextQuestion = questions[nextIndex];

      // Load existing answer for next question
      const existingAnswer = state.answers.find(a => a.questionId === nextQuestion.id);

      setState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        currentQuestionIndex: nextIndex,
        currentAnswer: existingAnswer?.value || null,
        validationError: null
      }));
    }
  }, [validateAnswer, saveAnswer, state.currentQuestionIndex, state.totalQuestions, state.answers, assessmentData.questions]);

  const handlePrevious = useCallback(async () => {
    if (state.currentQuestionIndex <= 0) return;

    // Save current answer before moving
    await saveAnswer();

    const prevIndex = state.currentQuestionIndex - 1;
    // Use consistent data source
    const { questionBankManager } = await import('@/lib/assessment/QuestionBankManager');
    const assessmentType = questionBankManager.getAssessmentType(assessmentId);
    const questions = assessmentType?.questions || assessmentData.questions;
    const prevQuestion = questions[prevIndex];

    // Load existing answer for previous question
    const existingAnswer = state.answers.find(a => a.questionId === prevQuestion.id);

    setState(prev => ({
      ...prev,
      currentQuestion: prevQuestion,
      currentQuestionIndex: prevIndex,
      currentAnswer: existingAnswer?.value || null,
      validationError: null
    }));
  }, [state.currentQuestionIndex, state.answers, assessmentData.questions, saveAnswer]);

  const handleSave = useCallback(async () => {
    const saved = await saveAnswer();
    if (!saved) {
      setState(prev => ({ ...prev, validationError: t('execution.errors.submitFailed') }));
    }
  }, [saveAnswer, t]);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, showPauseModal: true, isPaused: true }));
  }, []);

  const handleContinue = useCallback(() => {
    setState(prev => ({ ...prev, showPauseModal: false, isPaused: false }));
  }, []);

  const handleExit = useCallback(async () => {
    if (state.session) {
      try {
        const engine = await loadAssessmentEngine();
        if (engine) {
          engine.pauseAssessment(state.session.id);
        }
      } catch (error) {
        console.error('Failed to pause assessment:', error);
      }
    }

    // Navigate back to assessment list
    window.location.href = '/assessment/';
  }, [state.session]);

  const handleComplete = useCallback(async () => {
    if (!state.session) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

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
          const sessionResult = allResults.find(r => r.sessionId === state.session.id);
          if (sessionResult) {
            resultId = sessionResult.id;
            console.log('Found result by session ID:', resultId);
          }
        } catch (error) {
          console.warn('Failed to find result by session:', error);
        }
      }

      setState(prev => ({ ...prev, isCompleted: true }));
      onComplete?.(state.session.id);

      // Navigate to results page
      setTimeout(() => {
        if (resultId) {
          console.log('Navigating to results with ID:', resultId);
          window.location.href = `/assessment/results/#${resultId}`;
        } else {
          console.log('Navigating to results with session fallback');
          window.location.href = `/assessment/results/?session=${state.session.id}`;
        }
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('execution.errors.submitFailed');
      setState(prev => ({ ...prev, error: errorMessage, isSubmitting: false }));
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [state.session, onComplete, onError, t]);



  const getProgressPercentage = useCallback((): number => {
    if (state.totalQuestions === 0) return 0;
    return Math.round(((state.currentQuestionIndex + 1) / state.totalQuestions) * 100);
  }, [state.currentQuestionIndex, state.totalQuestions]);

  // 键盘导航支持
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !state.isSubmitting) {
      event.preventDefault();
      handleNext();
    } else if (event.key === 'Escape' && state.currentQuestionIndex > 0) {
      event.preventDefault();
      handlePrevious();
    }
  }, [handleNext, handlePrevious, state.isSubmitting, state.currentQuestionIndex]);

  // Show loading state
  if (translationsLoading || state.isLoading) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-12"
        role="status"
        aria-live="polite"
        aria-label="正在加载评测"
      >
        <span 
          className="loading loading-spinner loading-lg mb-4"
          aria-hidden="true"
        ></span>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          {t('loading.assessment')}
        </p>
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <ErrorHandler
        error={new Error(state.error)}
        onRetry={initializeAssessment}
        showRetry={true}
        t={t}
      />
    );
  }

  // Show completion state
  if (state.isCompleted) {
    return (
      <div 
        className="text-center py-12"
        role="status"
        aria-live="polite"
        aria-label="评测完成"
      >
        <div className="mb-6">
          <div 
            className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            role="img"
            aria-label="完成图标"
          >
            <CheckCircle 
              className="w-8 h-8 text-green-600 dark:text-green-400" 
              aria-hidden="true"
            />
          </div>
          <h2 
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
            id="completion-title"
          >
            {t('execution.completion.title')}
          </h2>
          <p 
            className="text-gray-600 dark:text-gray-300 mb-6"
            id="completion-message"
          >
            {t('execution.completion.message')}
          </p>
        </div>
        <div className="flex justify-center">
          <span 
            className="loading loading-spinner loading-md"
            aria-label="正在处理结果"
            aria-hidden="true"
          ></span>
        </div>
      </div>
    );
  }

  if (!state.currentQuestion) {
    return (
      <ErrorHandler
        error={new Error(t('errors.noData'))}
        onRetry={initializeAssessment}
        showRetry={true}
        t={t}
      />
    );
  }

  return (
    <div 
      className="max-w-4xl mx-auto" 
      role="main" 
      aria-label="心理健康评测"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Progress Bar Component */}
      <ProgressBar
        current={state.currentQuestionIndex}
        total={state.totalQuestions}
        percentage={getProgressPercentage()}
        assessmentName={assessmentData.name}
        isPaused={state.isPaused}
        isCompleted={state.isCompleted}
        onPause={handlePause}
        showPauseButton={true}
        t={t}
      />

      {/* Question Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6"
        role="region"
        aria-labelledby="question-title"
        aria-describedby="question-description"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
              id="question-number"
              aria-label={`问题 ${state.currentQuestionIndex + 1}，共 ${state.totalQuestions} 题`}
            >
              {t('question.number', { number: state.currentQuestionIndex + 1 })}
            </span>
            {state.currentQuestion.required && (
              <span 
                className="text-sm text-red-500"
                role="img"
                aria-label="必答题"
              >
                * {t('question.required')}
              </span>
            )}
          </div>
          <h2 
            id="question-title"
            className="text-xl font-medium text-gray-900 dark:text-white mb-6"
            tabIndex={-1}
          >
            {state.currentQuestion.text}
          </h2>
          <div 
            id="question-description"
            className="sr-only"
          >
            {state.currentQuestion.required 
              ? `必答题：${state.currentQuestion.text}` 
              : `选答题：${state.currentQuestion.text}`
            }
          </div>
        </div>

        {/* Question Card Component */}
        <div className="mb-4">
          <QuestionCard
            question={state.currentQuestion}
            answer={state.currentAnswer}
            onAnswerChange={handleAnswerChange}
            onValidationChange={() => {
              // Disable QuestionCard validation, use AssessmentTaker validation instead
            }}
            disabled={state.isSubmitting}
            showValidation={false}
            enableRealtimeValidation={false}
            t={t}
          />
        </div>

        {/* Validation Error */}
        {state.validationError && (
          <div 
            className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
            role="alert"
            aria-live="polite"
            aria-label="验证错误"
          >
            <p className="text-sm text-red-600 dark:text-red-400">
              <span className="sr-only">错误：</span>
              {state.validationError}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Controls Component */}
      <NavigationControls
        canGoBack={state.currentQuestionIndex > 0}
        canGoNext={state.currentAnswer !== null && state.currentAnswer !== undefined && state.currentAnswer !== ''}
        isLastQuestion={state.currentQuestionIndex === state.totalQuestions - 1}
        isSubmitting={state.isSubmitting}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSave={handleSave}
        showSaveButton={true}
        t={t}
      />

      {/* Pause Modal */}
      <div className={`modal ${state.showPauseModal ? 'modal-open' : ''}`} onClick={(e) => e.target === e.currentTarget && handleContinue()}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {t('execution.pauseModal.title')}
          </h3>
          <p className="py-4">
            {t('execution.pauseModal.message')}
          </p>
          <div className="modal-action">
            <button
              onClick={handleContinue}
              className="btn btn-primary"
            >
              {t('execution.pauseModal.continue')}
            </button>
            <button
              onClick={handleExit}
              className="btn btn-outline"
            >
              {t('execution.pauseModal.exit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AssessmentTaker;
