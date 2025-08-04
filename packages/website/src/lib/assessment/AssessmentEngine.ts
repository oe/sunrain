import type {
  AssessmentSession,
  AssessmentAnswer,
  Question,
} from "@/types/assessment";
import { questionBankManager } from "@/lib/assessment/QuestionBankManager";
import { localStorageManager } from "@/lib/assessment/LocalStorageManager";
import {
  AssessmentError,
  AssessmentErrorType,
  AssessmentErrorFactory,
  errorRecoveryManager,
} from "@/lib/assessment/AssessmentErrors";
import { assessmentLogger } from "@/lib/assessment/AssessmentLogger";
import { questionCache } from "@/lib/assessment/QuestionCache";
import { cacheManager, CacheManager } from "@/lib/assessment/CacheManager";
import { memoryOptimizer } from "@/utils/MemoryOptimizer";

/**
 * Assessment Execution Engine
 * Manages assessment sessions, progress tracking, and answer collection
 */
export class AssessmentEngine {
  private sessions: Map<string, AssessmentSession> = new Map();
  private sessionTimers: Map<string, number> = new Map();
  private reminderTimers: Map<string, number> = new Map();
  private autoSaveInterval: number = 30000; // 30 seconds
  private sessionTimeout: number = 1800000; // 30 minutes

  private periodicSaveStarted = false;
  private isClientSide: boolean = false;

  constructor() {
    this.isClientSide = this.checkClientSideEnvironment();

    assessmentLogger.info("ENGINE", "AssessmentEngine initializing", {
      isClientSide: this.isClientSide,
    });

    if (this.isClientSide) {
      this.loadSessionsFromStorage();
      this.initializeCaching();
    } else {
      assessmentLogger.warn(
        "ENGINE",
        "AssessmentEngine initialized in server-side environment"
      );
    }
  }

  /**
   * Initialize caching system
   */
  private initializeCaching(): void {
    try {
      // 注册内存清理回调
      memoryOptimizer.registerCleanupCallback(() => {
        this.cleanupInactiveSessionData();
      });

      // 预加载常用评测数据
      this.preloadCommonAssessments();

      assessmentLogger.info("ENGINE", "Caching system initialized");
    } catch (error) {
      assessmentLogger.warn("ENGINE", "Failed to initialize caching", error);
    }
  }

  /**
   * 预加载常用评测数据
   */
  private async preloadCommonAssessments(): Promise<void> {
    try {
      const commonAssessments = [
        "anxiety",
        "depression",
        "stress",
        "wellbeing",
      ];
      await questionCache.preloadCommonAssessments(commonAssessments);

      assessmentLogger.info("ENGINE", "Common assessments preloaded", {
        assessments: commonAssessments,
      });
    } catch (error) {
      assessmentLogger.warn(
        "ENGINE",
        "Failed to preload common assessments",
        error
      );
    }
  }

  /**
   * 清理非活跃会话的数据
   */
  private cleanupInactiveSessionData(): void {
    const now = Date.now();
    const inactiveThreshold = 60 * 60 * 1000; // 1小时

    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = session.lastActivityAt?.getTime() || 0;

      if (now - lastActivity > inactiveThreshold) {
        // 清理会话相关的缓存数据
        const cacheKey = CacheManager.getCacheKey(
          "session_questions",
          sessionId
        );
        cacheManager.delete(cacheKey);

        assessmentLogger.info("ENGINE", "Cleaned up inactive session data", {
          sessionId,
        });
      }
    }
  }

  /**
   * 获取问题（带缓存）
   */
  private async getQuestionWithCache(
    questionId: string,
    language: string = "zh"
  ): Promise<Question | null> {
    try {
      // 首先尝试从缓存获取
      let question = questionCache.getQuestion(questionId, language);

      if (!question) {
        // 从问卷管理器获取并缓存
        // 注意：这里需要实现从所有评测类型中查找特定问题的逻辑
        const allAssessments = questionBankManager.getAssessmentTypes();
        for (const assessment of allAssessments) {
          const foundQuestion = assessment.questions.find(
            (q) => q.id === questionId
          );
          if (foundQuestion) {
            question = foundQuestion;
            break;
          }
        }

        if (question) {
          questionCache.cacheQuestion(question, language);
        }
      }

      return question;
    } catch (error) {
      assessmentLogger.error(
        "ENGINE",
        `Failed to get question with cache: ${questionId}, language: ${language}`,
        error
      );
      return null;
    }
  }

  /**
   * 缓存会话问题数据
   */
  private cacheSessionQuestions(
    sessionId: string,
    questions: Question[]
  ): void {
    try {
      const cacheKey = CacheManager.getCacheKey("session_questions", sessionId);
      cacheManager.set(cacheKey, questions, 30 * 60 * 1000); // 30分钟缓存

      // 同时缓存单个问题
      questions.forEach((question) => {
        questionCache.cacheQuestion(question);
      });
    } catch (error) {
      assessmentLogger.warn(
        "ENGINE",
        "Failed to cache session questions",
        error,
        sessionId
      );
    }
  }

  /**
   * 获取缓存的会话问题
   */
  private getCachedSessionQuestions(sessionId: string): Question[] | null {
    try {
      const cacheKey = CacheManager.getCacheKey("session_questions", sessionId);
      return cacheManager.get<Question[]>(cacheKey);
    } catch (error) {
      assessmentLogger.warn(
        "ENGINE",
        "Failed to get cached session questions",
        error,
        sessionId
      );
      return null;
    }
  }

  /**
   * Check if we're running in a client-side environment
   */
  private checkClientSideEnvironment(): boolean {
    return (
      typeof window !== "undefined" &&
      typeof localStorage !== "undefined" &&
      typeof document !== "undefined"
    );
  }

  /**
   * Initialize periodic save (call this when first using the engine in browser)
   */
  private ensurePeriodicSaveStarted(): void {
    if (!this.periodicSaveStarted && this.isClientSide) {
      this.startPeriodicSave();
      this.periodicSaveStarted = true;
    }
  }

  /**
   * Start a new assessment session
   */
  startAssessment(
    assessmentTypeId: string,
    language: string = "en",
    culturalContext?: string
  ): AssessmentSession | null {
    try {
      if (!this.isClientSide) {
        const error = AssessmentErrorFactory.createSessionError(
          AssessmentErrorType.ENVIRONMENT_NOT_SUPPORTED,
          "Cannot start assessment in server-side environment"
        );
        assessmentLogger.error("ENGINE", "Failed to start assessment", error);
        throw error;
      }

      // Check for existing active sessions for this assessment type
      const existingActiveSession = this.getActiveSessions().find(
        session => session.assessmentTypeId === assessmentTypeId
      );

      if (existingActiveSession) {
        const error = AssessmentErrorFactory.createSessionError(
          AssessmentErrorType.SESSION_ALREADY_EXISTS,
          `An active session already exists for assessment type ${assessmentTypeId}`,
          existingActiveSession.id
        );
        assessmentLogger.warn("ENGINE", "Active session already exists", error);
        throw error;
      }

      assessmentLogger.info("ENGINE", "Starting new assessment", {
        assessmentTypeId,
        language,
        culturalContext,
      });

      this.ensurePeriodicSaveStarted();

      const assessmentType =
        questionBankManager.getAssessmentType(assessmentTypeId);
      if (!assessmentType) {
        const error = AssessmentErrorFactory.createSessionError(
          AssessmentErrorType.ASSESSMENT_TYPE_NOT_FOUND,
          `Assessment type ${assessmentTypeId} not found`,
          undefined
        );
        assessmentLogger.error("ENGINE", "Assessment type not found", error);
        throw error;
      }

      const sessionId = this.generateSessionId();
      const session: AssessmentSession = {
        id: sessionId,
        assessmentTypeId,
        startedAt: new Date(),
        currentQuestionIndex: 0,
        answers: [],
        status: "active",
        language,
        culturalContext,
        timeSpent: 0,
        lastActivityAt: new Date(),
      };

      this.sessions.set(sessionId, session);
      this.startSessionTimer(sessionId);
      this.saveSessionsToStorage();

      assessmentLogger.logSessionEvent("started", sessionId, {
        assessmentTypeId,
        language,
        culturalContext,
      });

      return session;
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }

      const assessmentError = AssessmentErrorFactory.fromGenericError(
        error as Error,
        {
          assessmentTypeId,
        }
      );
      assessmentLogger.error(
        "ENGINE",
        "Unexpected error starting assessment",
        assessmentError
      );
      throw assessmentError;
    }
  }

  /**
   * Resume an existing assessment session
   */
  resumeAssessment(sessionId: string): AssessmentSession | null {
    try {
      if (!this.isClientSide) {
        const error = AssessmentErrorFactory.createSessionError(
          AssessmentErrorType.ENVIRONMENT_NOT_SUPPORTED,
          "Cannot resume assessment in server-side environment",
          sessionId
        );
        assessmentLogger.error(
          "ENGINE",
          "Failed to resume assessment",
          error,
          sessionId
        );
        throw error;
      }

      assessmentLogger.info(
        "ENGINE",
        "Resuming assessment",
        { sessionId },
        sessionId
      );

      this.ensurePeriodicSaveStarted();

      const session = this.sessions.get(sessionId);
      if (!session) {
        const error = AssessmentErrorFactory.createSessionError(
          AssessmentErrorType.SESSION_NOT_FOUND,
          `Session ${sessionId} not found`,
          sessionId
        );
        assessmentLogger.error("ENGINE", "Session not found", error, sessionId);
        throw error;
      }

      if (session.status === "completed") {
        const error = AssessmentErrorFactory.createSessionError(
          AssessmentErrorType.SESSION_ALREADY_COMPLETED,
          `Session ${sessionId} is already completed`,
          sessionId
        );
        assessmentLogger.error(
          "ENGINE",
          "Session already completed",
          error,
          sessionId
        );
        throw error;
      }

      session.status = "active";
      session.lastActivityAt = new Date();
      this.startSessionTimer(sessionId);
      this.saveSessionsToStorage();

      assessmentLogger.logSessionEvent("resumed", sessionId);

      return session;
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }

      const assessmentError = AssessmentErrorFactory.fromGenericError(
        error as Error,
        {
          sessionId,
        }
      );
      assessmentLogger.error(
        "ENGINE",
        "Unexpected error resuming assessment",
        assessmentError,
        sessionId
      );
      throw assessmentError;
    }
  }

  /**
   * Pause an assessment session
   */
  pauseAssessment(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = "paused";
    session.lastActivityAt = new Date();
    this.stopSessionTimer(sessionId);
    this.saveSessionsToStorage();

    return true;
  }

  /**
   * Get current question for a session
   */
  getCurrentQuestion(sessionId: string): Question | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // First try to get the base assessment type (which should have complete data)
    const baseAssessmentType = questionBankManager.getAssessmentType(session.assessmentTypeId);
    if (!baseAssessmentType) return null;

    // Then get localized version if needed
    const assessmentType = questionBankManager.getLocalizedAssessmentType(
      session.assessmentTypeId,
      session.language
    );

    const culturallyAdapted =
      questionBankManager.getCulturallyAdaptedAssessmentType(
        session.assessmentTypeId,
        session.culturalContext
      );

    const questions = culturallyAdapted?.questions || assessmentType?.questions || baseAssessmentType.questions;

    if (session.currentQuestionIndex >= questions.length) {
      return null;
    }

    const currentQuestion = questions[session.currentQuestionIndex];

    console.log('AssessmentEngine getCurrentQuestion:', {
      sessionId,
      questionIndex: session.currentQuestionIndex,
      questionId: currentQuestion?.id,
      questionType: currentQuestion?.type,
      hasOptions: !!currentQuestion?.options,
      optionsCount: currentQuestion?.options?.length,
      language: session.language
    });

    return currentQuestion;
  }

  /**
   * Submit an answer for the current question
   */
  async submitAnswer(
    sessionId: string,
    answer: any
  ): Promise<{ success: boolean; nextQuestion?: Question; completed?: boolean }> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") {
      return { success: false };
    }

    const currentQuestion = this.getCurrentQuestion(sessionId);
    if (!currentQuestion) {
      return { success: false };
    }

    // Validate answer
    const validation = this.validateAnswer(currentQuestion, answer);
    if (!validation.valid) {
      return { success: false };
    }

    // Store the answer
    const assessmentAnswer: AssessmentAnswer = {
      questionId: currentQuestion.id,
      value: answer,
      answeredAt: new Date(),
    };

    // Remove any existing answer for this question (in case of revision)
    session.answers = session.answers.filter(
      (a) => a.questionId !== currentQuestion.id
    );
    session.answers.push(assessmentAnswer);

    // Move to next question
    session.currentQuestionIndex++;
    session.lastActivityAt = new Date();

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (!assessmentType) {
      return { success: false };
    }

    // Check if assessment is completed
    if (session.currentQuestionIndex >= assessmentType.questions.length) {
      session.status = "completed";
      this.stopSessionTimer(sessionId);

      // Generate and save assessment result
      try {
        console.log('🔄 Starting result generation for session:', sessionId);
        console.log('📊 Session data:', {
          id: session.id,
          assessmentTypeId: session.assessmentTypeId,
          answersCount: session.answers.length,
          status: session.status
        });

        const { resultsAnalyzer } = await import('./ResultsAnalyzer');
        const result = resultsAnalyzer.analyzeSession(session);

        if (result) {
          console.log('✅ Assessment result generated successfully:', {
            resultId: result.id,
            sessionId: result.sessionId,
            assessmentTypeId: result.assessmentTypeId,
            scoresCount: Object.keys(result.scores).length
          });

          // Store the result ID in session storage for easy retrieval
          sessionStorage.setItem('latest_assessment_result', result.id);
          console.log('💾 Stored result ID in sessionStorage:', result.id);

          // Also store in localStorage as backup
          try {
            localStorage.setItem('latest_assessment_result_backup', result.id);
            console.log('💾 Stored result ID backup in localStorage:', result.id);
          } catch (storageError) {
            console.warn('⚠️ Failed to store result ID backup:', storageError);
          }

          // Verify the result was actually saved
          setTimeout(() => {
            try {
              const { resultsAnalyzer: verifyAnalyzer } = require('./ResultsAnalyzer');
              const savedResult = verifyAnalyzer.getResult(result.id);
              console.log('🔍 Verification - Result found in analyzer:', !!savedResult);

              if (savedResult) {
                console.log('✅ Result verification successful');
              } else {
                console.error('❌ Result verification failed - result not found in analyzer');
              }
            } catch (verifyError) {
              console.error('❌ Result verification error:', verifyError);
            }
          }, 100);

        } else {
          console.error('❌ Failed to generate assessment result - analyzeSession returned null');
        }
      } catch (error) {
        console.error('💥 Error generating assessment result:', error);
      }

      this.saveSessionsToStorage();
      return { success: true, completed: true };
    }

    // Get next question
    const nextQuestion = this.getCurrentQuestion(sessionId);
    this.saveSessionsToStorage();

    return {
      success: true,
      nextQuestion: nextQuestion || undefined,
      completed: false,
    };
  }

  /**
   * Go back to previous question
   */
  goToPreviousQuestion(sessionId: string): Question | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return null;

    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex--;
      session.lastActivityAt = new Date();
      this.saveSessionsToStorage();
    }

    return this.getCurrentQuestion(sessionId);
  }

  /**
   * Jump to a specific question (for review/editing)
   */
  goToQuestion(sessionId: string, questionIndex: number): Question | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (
      !assessmentType ||
      questionIndex < 0 ||
      questionIndex >= assessmentType.questions.length
    ) {
      return null;
    }

    session.currentQuestionIndex = questionIndex;
    session.lastActivityAt = new Date();
    this.saveSessionsToStorage();

    return this.getCurrentQuestion(sessionId);
  }

  /**
   * Get assessment progress
   */
  getProgress(sessionId: string): {
    current: number;
    total: number;
    percentage: number;
    timeSpent: number;
    estimatedTimeRemaining?: number;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const assessmentType = questionBankManager.getAssessmentType(
      session.assessmentTypeId
    );
    if (!assessmentType) return null;

    const current = session.currentQuestionIndex;
    const total = assessmentType.questions.length;
    const percentage = Math.round((current / total) * 100);

    // Calculate time spent
    const now = new Date();
    const timeSpent =
      session.timeSpent + (now.getTime() - session.lastActivityAt.getTime());

    // Estimate remaining time based on average time per question
    let estimatedTimeRemaining: number | undefined;
    if (current > 0) {
      const avgTimePerQuestion = timeSpent / current;
      const remainingQuestions = total - current;
      estimatedTimeRemaining = Math.round(
        (avgTimePerQuestion * remainingQuestions) / 1000
      ); // in seconds
    }

    return {
      current,
      total,
      percentage,
      timeSpent: Math.round(timeSpent / 1000), // in seconds
      estimatedTimeRemaining,
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): AssessmentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for a user (in a real app, this would be filtered by user ID)
   */
  getAllSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === "active"
    );
  }

  /**
   * Get completed sessions
   */
  getCompletedSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.status === "completed"
    );
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.stopSessionTimer(sessionId);
      this.stopReminderTimer(sessionId);
      this.saveSessionsToStorage();
    }
    return deleted;
  }

  /**
   * Abandon a session
   */
  abandonSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.status = "abandoned";
    session.lastActivityAt = new Date();
    this.stopSessionTimer(sessionId);
    this.saveSessionsToStorage();

    return true;
  }

  /**
   * Set reminder for paused sessions
   */
  setReminder(sessionId: string, reminderTime: number): boolean {
    if (!this.isClientSide) return false;

    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "paused") return false;

    // Clear existing reminder
    this.stopReminderTimer(sessionId);

    try {
      // Set new reminder
      const timer = window.setTimeout(() => {
        this.sendReminder(sessionId);
      }, reminderTime);

      this.reminderTimers.set(sessionId, timer);
      return true;
    } catch (error) {
      console.error("Failed to set reminder:", error);
      return false;
    }
  }

  /**
   * Validate answer format
   */
  private validateAnswer(
    question: Question,
    answer: any
  ): { valid: boolean; error?: string } {
    console.log('AssessmentEngine validateAnswer:', {
      questionId: question.id,
      questionType: question.type,
      answer: answer,
      answerType: typeof answer,
      required: question.required,
      options: question.options
    });

    if (
      question.required &&
      (answer === null || answer === undefined || answer === "")
    ) {
      console.log('Validation failed: Answer is required');
      return { valid: false, error: "Answer is required" };
    }

    switch (question.type) {
      case "single_choice":
        if (question.options) {
          // Check if answer matches either option.id or option.value
          const validOptionIds = question.options.map(opt => opt.id);
          const validOptionValues = question.options.map(opt => opt.value);
          const isValidOption = question.options.some((opt) =>
            opt.id === answer || opt.value === answer
          );

          console.log('Single choice validation:', {
            validOptionIds,
            validOptionValues,
            answer,
            isValidOption
          });

          if (!isValidOption) {
            console.log('Validation failed: Invalid option selected');
            return { valid: false, error: "Invalid option selected" };
          }
        }
        break;

      case "multiple_choice":
        if (!Array.isArray(answer)) {
          return {
            valid: false,
            error: "Multiple choice answer must be an array",
          };
        }
        if (question.options) {
          // Create arrays of valid option IDs and values
          const validOptionIds = question.options.map((opt) => opt.id);
          const validOptionValues = question.options.map((opt) => opt.value);

          const invalidAnswers = answer.filter(
            (a) => !validOptionIds.includes(a) && !validOptionValues.includes(a)
          );
          if (invalidAnswers.length > 0) {
            return { valid: false, error: "Invalid options selected" };
          }
        }
        break;

      case "scale":
        const numAnswer = Number(answer);
        if (isNaN(numAnswer)) {
          return { valid: false, error: "Scale answer must be a number" };
        }
        if (question.scaleMin !== undefined && numAnswer < question.scaleMin) {
          return {
            valid: false,
            error: `Answer must be at least ${question.scaleMin}`,
          };
        }
        if (question.scaleMax !== undefined && numAnswer > question.scaleMax) {
          return {
            valid: false,
            error: `Answer must be at most ${question.scaleMax}`,
          };
        }
        break;

      case "text":
        if (typeof answer !== "string") {
          return { valid: false, error: "Text answer must be a string" };
        }
        break;

      default:
        return { valid: false, error: "Unknown question type" };
    }

    return { valid: true };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  }

  /**
   * Start session timer for timeout management
   */
  private startSessionTimer(sessionId: string): void {
    if (!this.isClientSide) return;

    this.stopSessionTimer(sessionId);

    try {
      const timer = window.setTimeout(() => {
        const session = this.sessions.get(sessionId);
        if (session && session.status === "active") {
          session.status = "paused";
          session.lastActivityAt = new Date();
          this.saveSessionsToStorage();
          console.log(`Session ${sessionId} timed out and was paused`);
        }
      }, this.sessionTimeout);

      this.sessionTimers.set(sessionId, timer);
    } catch (error) {
      console.error("Failed to start session timer:", error);
    }
  }

  /**
   * Stop session timer
   */
  private stopSessionTimer(sessionId: string): void {
    const timer = this.sessionTimers.get(sessionId);
    if (timer && this.isClientSide) {
      try {
        window.clearTimeout(timer);
        this.sessionTimers.delete(sessionId);
      } catch (error) {
        console.error("Failed to stop session timer:", error);
      }
    }
  }

  /**
   * Stop reminder timer
   */
  private stopReminderTimer(sessionId: string): void {
    const timer = this.reminderTimers.get(sessionId);
    if (timer && this.isClientSide) {
      try {
        window.clearTimeout(timer);
        this.reminderTimers.delete(sessionId);
      } catch (error) {
        console.error("Failed to stop reminder timer:", error);
      }
    }
  }

  /**
   * Send reminder (placeholder - in real app would send notification)
   */
  private sendReminder(sessionId: string): void {
    console.log(
      `Reminder: Please continue your assessment (Session: ${sessionId})`
    );
    // In a real application, this would trigger a notification
  }

  /**
   * Update session time spent
   */
  private updateSessionTime(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "active") return;

    const now = new Date();
    const timeDiff = now.getTime() - session.lastActivityAt.getTime();
    session.timeSpent += timeDiff;
    session.lastActivityAt = now;
  }

  /**
   * Start periodic auto-save
   */
  private startPeriodicSave(): void {
    if (!this.isClientSide) {
      return;
    }

    try {
      setInterval(() => {
        // Double-check client-side environment in the interval callback
        if (!this.isClientSide) {
          return;
        }

        // Update time spent for all active sessions
        for (const sessionId of this.sessions.keys()) {
          this.updateSessionTime(sessionId);
        }
        this.saveSessionsToStorage();
      }, this.autoSaveInterval);
    } catch (error) {
      console.error("Failed to start periodic save:", error);
    }
  }

  /**
   * Save sessions to localStorage
   */
  private async saveSessionsToStorage(): Promise<void> {
    if (!this.isClientSide) {
      return;
    }

    try {
      const sessions = Array.from(this.sessions.values());
      const success = await localStorageManager.saveSessions(sessions);

      if (!success) {
        console.error("Failed to save sessions to storage");
        this.handleStorageError(new Error("Save operation failed"));
      }
    } catch (error) {
      console.error("Failed to save sessions to storage:", error);
      this.handleStorageError(error);
    }
  }

  /**
   * Handle localStorage errors with recovery strategies
   */
  private async handleStorageError(error: any): Promise<void> {
    if (!this.isClientSide) return;

    let assessmentError: AssessmentError;

    if (error instanceof AssessmentError) {
      assessmentError = error;
    } else if (error.name === "QuotaExceededError" || error.code === 22) {
      assessmentError = AssessmentErrorFactory.createStorageError(
        AssessmentErrorType.STORAGE_QUOTA_EXCEEDED,
        "localStorage quota exceeded",
        error
      );
    } else {
      assessmentError = AssessmentErrorFactory.createStorageError(
        AssessmentErrorType.STORAGE_SAVE_FAILED,
        "Failed to save to localStorage",
        error
      );
    }

    assessmentLogger.error(
      "STORAGE",
      "Storage error occurred",
      assessmentError
    );

    // 尝试使用错误恢复管理器
    const recoveryResult = await errorRecoveryManager.attemptRecovery(
      assessmentError
    );

    if (recoveryResult.recovered) {
      assessmentLogger.info("STORAGE", "Storage error recovered", {
        strategy: recoveryResult.strategy?.getDescription(),
        message: recoveryResult.message,
      });
    } else {
      assessmentLogger.warn("STORAGE", "Failed to recover from storage error", {
        message: recoveryResult.message,
      });

      // 最后的备用方案：检查localStorage是否可用
      try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, "test");
        localStorage.removeItem(testKey);
      } catch (storageError) {
        const criticalError = AssessmentErrorFactory.createStorageError(
          AssessmentErrorType.STORAGE_NOT_AVAILABLE,
          "localStorage is not available",
          storageError
        );
        assessmentLogger.critical(
          "STORAGE",
          "localStorage completely unavailable",
          criticalError
        );
      }
    }
  }

  /**
   * Clear old completed or abandoned sessions to free up storage space
   */
  private async _clearOldSessions(): Promise<void> {
    if (!this.isClientSide) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep sessions from last 7 days

      const sessionsToKeep = Array.from(this.sessions.entries()).filter(
        ([_, session]) => {
          return (
            session.status === "active" ||
            session.status === "paused" ||
            session.lastActivityAt > cutoffDate
          );
        }
      );

      this.sessions.clear();
      sessionsToKeep.forEach(([sessionId, session]) => {
        this.sessions.set(sessionId, session);
      });

      // Try to save again
      await this.saveSessionsToStorage();
    } catch (error) {
      console.error("Failed to clear old sessions:", error);
    }
  }

  /**
   * Load sessions from localStorage
   */
  private loadSessionsFromStorage(): void {
    if (!this.isClientSide) {
      return;
    }

    try {
      const sessions = localStorageManager.loadSessions();

      for (const session of sessions) {
        this.sessions.set(session.id, session);

        // Resume timers for active sessions, but check if they haven't timed out
        if (session.status === "active") {
          const timeSinceLastActivity =
            Date.now() - session.lastActivityAt.getTime();
          if (timeSinceLastActivity > this.sessionTimeout) {
            // Session has timed out, mark as paused
            session.status = "paused";
            this.saveSessionsToStorage();
          } else {
            this.startSessionTimer(session.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load sessions from storage:", error);
    }
  }

  /**
   * Clear all session data (for testing or reset)
   */
  clearAllSessions(): void {
    // Stop all timers
    for (const sessionId of this.sessions.keys()) {
      this.stopSessionTimer(sessionId);
      this.stopReminderTimer(sessionId);
    }

    this.sessions.clear();
    this.sessionTimers.clear();
    this.reminderTimers.clear();

    if (this.isClientSide) {
      try {
        localStorageManager.clearSessions();
      } catch (error) {
        console.error("Failed to clear sessions from storage:", error);
      }
    }
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(): {
    total: number;
    active: number;
    paused: number;
    completed: number;
    abandoned: number;
    averageCompletionTime: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const completed = sessions.filter((s) => s.status === "completed");

    const averageCompletionTime =
      completed.length > 0
        ? completed.reduce((sum, s) => sum + s.timeSpent, 0) /
          completed.length /
          1000 // in seconds
        : 0;

    return {
      total: sessions.length,
      active: sessions.filter((s) => s.status === "active").length,
      paused: sessions.filter((s) => s.status === "paused").length,
      completed: completed.length,
      abandoned: sessions.filter((s) => s.status === "abandoned").length,
      averageCompletionTime: Math.round(averageCompletionTime),
    };
  }

  /**
   * Get environment information for debugging
   */
  async getEnvironmentInfo(): Promise<{
    isClientSide: boolean;
    hasLocalStorage: boolean;
    hasSessionStorage: boolean;
    storageQuota?: number;
    storageUsed?: number;
    storageStatistics?: any;
  }> {
    const info = {
      isClientSide: this.isClientSide,
      hasLocalStorage: false,
      hasSessionStorage: false,
      storageQuota: undefined as number | undefined,
      storageUsed: undefined as number | undefined,
      storageStatistics: undefined as any,
    };

    if (this.isClientSide) {
      try {
        // Test localStorage
        const testKey = "__test_storage__";
        localStorage.setItem(testKey, "test");
        localStorage.removeItem(testKey);
        info.hasLocalStorage = true;
      } catch (error) {
        info.hasLocalStorage = false;
      }

      try {
        // Test sessionStorage
        const testKey = "__test_session_storage__";
        sessionStorage.setItem(testKey, "test");
        sessionStorage.removeItem(testKey);
        info.hasSessionStorage = true;
      } catch (error) {
        info.hasSessionStorage = false;
      }

      // Get storage quota information if available
      try {
        const quota = await localStorageManager.getStorageQuota();
        info.storageQuota = quota.quota;
        info.storageUsed = quota.usage;
      } catch (error) {
        console.error("Failed to get storage quota:", error);
      }

      // Get storage statistics
      try {
        info.storageStatistics =
          await localStorageManager.getStorageStatistics();
      } catch (error) {
        console.error("Failed to get storage statistics:", error);
      }
    }

    return info;
  }

  /**
   * Perform health check on the assessment engine
   */
  async performHealthCheck(): Promise<{
    status: "healthy" | "warning" | "error";
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check environment
    if (!this.isClientSide) {
      issues.push("Running in server-side environment");
      recommendations.push(
        "AssessmentEngine should only be used in client-side environment"
      );
    }

    // Check storage availability
    const envInfo = await this.getEnvironmentInfo();
    if (!envInfo.hasLocalStorage) {
      issues.push("localStorage is not available");
      recommendations.push(
        "Enable localStorage or use alternative storage solution"
      );
    }

    // Check for too many sessions
    const stats = this.getSessionStatistics();
    if (stats.total > 50) {
      issues.push(`Too many sessions stored (${stats.total})`);
      recommendations.push(
        "Consider clearing old sessions to improve performance"
      );
    }

    // Check for stale active sessions
    const staleActiveSessions = Array.from(this.sessions.values()).filter(
      (session) => {
        if (session.status !== "active") return false;
        const timeSinceLastActivity =
          Date.now() - session.lastActivityAt.getTime();
        return timeSinceLastActivity > this.sessionTimeout;
      }
    );

    if (staleActiveSessions.length > 0) {
      issues.push(
        `${staleActiveSessions.length} stale active sessions detected`
      );
      recommendations.push("Clean up stale sessions or adjust session timeout");
    }

    const status =
      issues.length === 0
        ? "healthy"
        : issues.some(
            (issue) =>
              issue.includes("server-side") || issue.includes("localStorage")
          )
        ? "error"
        : "warning";

    return {
      status,
      issues,
      recommendations,
    };
  }
}

// Lazy singleton instance - only create when actually needed in browser
let _assessmentEngineInstance: AssessmentEngine | null = null;

export const assessmentEngine = {
  getInstance(): AssessmentEngine {
    if (!_assessmentEngineInstance) {
      _assessmentEngineInstance = new AssessmentEngine();
    }
    return _assessmentEngineInstance;
  },

  // Proxy all public methods to the singleton instance
  startAssessment(
    assessmentTypeId: string,
    language: string = "en",
    culturalContext?: string
  ) {
    return this.getInstance().startAssessment(
      assessmentTypeId,
      language,
      culturalContext
    );
  },

  resumeAssessment(sessionId: string) {
    return this.getInstance().resumeAssessment(sessionId);
  },

  pauseAssessment(sessionId: string) {
    return this.getInstance().pauseAssessment(sessionId);
  },

  getCurrentQuestion(sessionId: string) {
    return this.getInstance().getCurrentQuestion(sessionId);
  },

  async submitAnswer(sessionId: string, answer: any) {
    return await this.getInstance().submitAnswer(sessionId, answer);
  },

  goToPreviousQuestion(sessionId: string) {
    return this.getInstance().goToPreviousQuestion(sessionId);
  },

  goToQuestion(sessionId: string, questionIndex: number) {
    return this.getInstance().goToQuestion(sessionId, questionIndex);
  },

  getProgress(sessionId: string) {
    return this.getInstance().getProgress(sessionId);
  },

  getSession(sessionId: string) {
    return this.getInstance().getSession(sessionId);
  },

  getAllSessions() {
    return this.getInstance().getAllSessions();
  },

  getActiveSessions() {
    return this.getInstance().getActiveSessions();
  },

  getCompletedSessions() {
    return this.getInstance().getCompletedSessions();
  },

  deleteSession(sessionId: string) {
    return this.getInstance().deleteSession(sessionId);
  },

  abandonSession(sessionId: string) {
    return this.getInstance().abandonSession(sessionId);
  },

  setReminder(sessionId: string, reminderTime: number) {
    return this.getInstance().setReminder(sessionId, reminderTime);
  },

  clearAllSessions() {
    return this.getInstance().clearAllSessions();
  },

  getSessionStatistics() {
    return this.getInstance().getSessionStatistics();
  },

  getEnvironmentInfo() {
    return this.getInstance().getEnvironmentInfo();
  },

  performHealthCheck() {
    return this.getInstance().performHealthCheck();
  },
};
